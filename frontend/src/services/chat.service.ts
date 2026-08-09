import { MOCK_CHAT as MOCK, delay, request } from "./http";
import { mockModels } from "./mock-data";
import { onAstraEvent } from "./ws/client";
import { useEditorStore } from "@/store/editor.store";
import type { AiModel, ChatMessage, Conversation } from "@/types";

/** Max characters of the active file we inline into the prompt. */
const MAX_FILE_CHARS = 12000;
/** How many prior turns of the conversation to replay. */
const HISTORY_TURNS = 6;

/**
 * `/api/ai/stream` forwards the prompt verbatim to Ollama with no workspace
 * context, so the assistant otherwise answers "you didn't give me any code".
 * We assemble the context here: active file (+ selection) and recent turns.
 */
/** The file the assistant should reason about: the active tab, else the only open tab. */
export function getContextFile() {
  const { tabs, activeTabId } = useEditorStore.getState();
  const active = tabs.find((t) => t.id === activeTabId) ?? tabs[tabs.length - 1];
  if (!active || !active.content) return null;
  return active;
}

function buildPrompt(messages: ChatMessage[]): {
  prompt: string;
  filePath: string | null;
  fileContent: string | null;
} {
  const lastUserIndex = messages.map((m) => m.role).lastIndexOf("user");
  const question = lastUserIndex >= 0 ? messages[lastUserIndex]!.content : "";
  if (!question.trim()) return { prompt: "", filePath: null, fileContent: null };

  const active = getContextFile();

  const parts: string[] = [
    "You are ASTRA, a coding assistant embedded in an IDE. The user's currently open file is included below — treat it as the code they are asking about. Never say that no code was provided when a file is present. Be concise and show code when useful.",
  ];

  let fileContent: string | null = null;
  if (active) {
    fileContent = active.content.slice(0, MAX_FILE_CHARS);
    parts.push(
      `--- ACTIVE FILE: ${active.path} (${active.language}) ---\n${fileContent}${
        active.content.length > MAX_FILE_CHARS ? "\n… (truncated)" : ""
      }\n--- END FILE ---`,
    );
  } else {
    parts.push("(No file is open in the editor.)");
  }

  const history = messages
    .slice(0, lastUserIndex)
    .filter((m) => m.content.trim())
    .slice(-HISTORY_TURNS)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`);
  if (history.length) parts.push(`--- CONVERSATION ---\n${history.join("\n\n")}`);

  parts.push(`User question: ${question}`);
  return {
    prompt: parts.join("\n\n"),
    filePath: active?.path ?? null,
    fileContent,
  };
}

const MOCK_REPLY = `Here's what I found in your workspace.

The \`Button\` component forwards its ref correctly, but the \`variant\` prop is only
reflected through a \`data-variant\` attribute. A small refactor keeps styling in one place:

\`\`\`tsx
const styles = {
  primary: "bg-primary text-primary-foreground",
  ghost: "bg-transparent hover:bg-accent",
} as const;

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", className, ...props }, ref) => (
    <button ref={ref} className={cn(styles[variant], className)} {...props} />
  ),
);
\`\`\`

**Next steps**

1. Extract the variant map into a shared module.
2. Add a \`size\` prop for compact toolbars.
3. Cover both variants with a snapshot test.

Want me to apply this edit to \`src/components/Button.tsx\`?`;

export const chatService = {
  async getModels(): Promise<AiModel[]> {
    return mockModels;
  },

  /** No conversation-persistence endpoint exists yet; history stays client-side. */
  async getHistory(): Promise<Conversation[]> {
    await delay(0);
    return [];
  },

  /**
   * POST /api/ai/stream returns a `requestId`; the tokens then arrive on the
   * shared WebSocket as AI_STREAM_START / _TOKEN / _COMPLETE / _ERROR events.
   */
  async *streamChat(
    payload: { conversationId: string; model: string; messages: ChatMessage[] },
    signal: AbortSignal,
  ): AsyncGenerator<string> {
    if (MOCK) {
      const chunks = MOCK_REPLY.match(/\s*\S+/g) ?? [];
      for (const chunk of chunks) {
        if (signal.aborted) return;
        await delay(18);
        yield chunk;
      }
      return;
    }

    const { prompt, filePath, fileContent } = buildPrompt(payload.messages);
    if (!prompt.trim()) return;

    const queue: string[] = [];
    let done = false;
    let failure: Error | null = null;
    let notify: (() => void) | null = null;
    const wake = () => {
      notify?.();
      notify = null;
    };

    let requestId: string | null = null;
    const matches = (event: { payload?: unknown; streamId?: string }) => {
      const p = event.payload as { requestId?: string; token?: string } | string | undefined;
      const id =
        typeof p === "object" && p ? p.requestId : typeof p === "string" ? p : event.streamId;
      return !requestId || !id || id === requestId;
    };

    const offToken = onAstraEvent("AI_STREAM_TOKEN", (event) => {
      if (!matches(event)) return;
      const p = event.payload as { token?: string } | string | undefined;
      const token = typeof p === "string" ? p : (p?.token ?? "");
      if (token) queue.push(token);
      wake();
    });
    const offComplete = onAstraEvent("AI_STREAM_COMPLETE", (event) => {
      if (!matches(event)) return;
      done = true;
      wake();
    });
    const offError = onAstraEvent("AI_STREAM_ERROR", (event) => {
      if (!matches(event)) return;
      failure = new Error(String((event.payload as { message?: string })?.message ?? "AI stream failed"));
      done = true;
      wake();
    });
    const onAbort = () => {
      done = true;
      wake();
    };
    signal.addEventListener("abort", onAbort);

    try {
      const res = await request<{ requestId: string }>("/api/ai/stream", {
        method: "POST",
        // `prompt` already embeds the context; the extra fields are there for
        // backend variants that read the file separately.
        body: JSON.stringify({
          prompt,
          message: prompt,
          model: payload.model,
          filePath,
          fileContent,
        }),
        signal,
      });
      requestId = res?.requestId ?? null;

      while (!done || queue.length) {
        if (signal.aborted) return;
        if (queue.length) {
          yield queue.shift() as string;
          continue;
        }
        if (done) break;
        await new Promise<void>((resolve) => {
          notify = resolve;
        });
      }
      if (failure) throw failure;
    } finally {
      signal.removeEventListener("abort", onAbort);
      offToken();
      offComplete();
      offError();
    }
  },
};