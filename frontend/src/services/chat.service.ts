import { MOCK, delay, request } from "./http";
import { mockModels } from "./mock-data";
import type { AiModel, ChatMessage, Conversation } from "@/types";

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

  /** GET /api/chat/history */
  async getHistory(): Promise<Conversation[]> {
    if (MOCK) {
      await delay(200);
      const now = Date.now();
      return [
        {
          id: "conv-1",
          title: "Refactor Button variants",
          updatedAt: now - 1000 * 60 * 42,
          messages: [],
        },
        {
          id: "conv-2",
          title: "Explain the terminal bridge",
          updatedAt: now - 1000 * 60 * 60 * 5,
          messages: [],
        },
        {
          id: "conv-3",
          title: "Spring Boot file API design",
          updatedAt: now - 1000 * 60 * 60 * 26,
          messages: [],
        },
      ];
    }
    return request<Conversation[]>("/api/chat/history");
  },

  /**
   * POST /api/chat — streams assistant tokens.
   * Swap the mock generator for a fetch + ReadableStream reader once the
   * Spring Boot endpoint streams SSE/NDJSON.
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

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
    if (!res.body) throw new Error("POST /api/chat returned no stream");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  },
};