import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUp, Bot, FileCode2, Plus, Square, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PanelHeader } from "@/components/layout/PanelHeader";
import { AstraLogo } from "@/components/layout/AstraLogo";
import { Markdown } from "./Markdown";
import { useChatController } from "./useChatController";
import { chatService } from "@/services/chat.service";
import { useChatStore } from "@/store/chat.store";
import { useEditorStore } from "@/store/editor.store";
import { cn } from "@/lib/utils";

export interface AiChatPanelHandle {
  focus: () => void;
}

const suggestions = [
  "Explain the active file",
  "Find bugs in this component",
  "Write unit tests for the editor store",
];

export const AiChatPanel = forwardRef<AiChatPanelHandle>(function AiChatPanel(_props, ref) {
  const { messages, model, setModel, isStreaming, clear } = useChatStore();
  const contextFile = useEditorStore((s) => {
    const active = s.tabs.find((t) => t.id === s.activeTabId) ?? s.tabs[s.tabs.length - 1];
    return active?.content ? active : null;
  });
  const { send, stop } = useChatController();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: models = [] } = useQuery({
    queryKey: ["chat", "models"],
    queryFn: () => chatService.getModels(),
  });

  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }), []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const submit = () => {
    const text = input;
    setInput("");
    void send(text);
    inputRef.current?.focus();
  };

  return (
    <aside className="flex h-full min-w-0 flex-col border-l border-border bg-panel">
      <PanelHeader title="AI Assistant" subtitle={isStreaming ? "thinking…" : "ready"}>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clear} title="New chat">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </PanelHeader>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center astra-fade-in">
            <AstraLogo className="h-9 w-9 opacity-90" />
            <p className="text-xs text-muted-foreground">
              Ask about your workspace, refactor code, or generate tests.
            </p>
            <div className="w-full space-y-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-left text-[12px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="astra-fade-in">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                {m.role === "user" ? (
                  <User className="h-3 w-3" />
                ) : (
                  <Bot className="h-3 w-3 text-primary" />
                )}
                {m.role === "user" ? "You" : "ASTRA"}
              </div>
              <div
                className={cn(
                  m.role === "user" &&
                    "rounded-lg bg-primary px-3 py-2 text-[13px] text-primary-foreground",
                )}
              >
                {m.role === "user" ? (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                ) : m.content ? (
                  <Markdown content={m.content} />
                ) : (
                  <span className="text-[13px] text-muted-foreground">Thinking…</span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-2.5">
        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <FileCode2 className="h-3 w-3" />
          {contextFile ? (
            <span className="truncate" title={contextFile.path}>
              Context: <span className="text-foreground">{contextFile.name}</span>
            </span>
          ) : (
            <span>No file in context — open a file to include it</span>
          )}
        </div>
        <div className="rounded-lg border border-border bg-surface focus-within:border-primary/60">
          <Textarea
            ref={inputRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ask ASTRA… (Ctrl+K)"
            className="resize-none border-0 bg-transparent text-[13px] focus-visible:ring-0"
          />
          <div className="flex items-center gap-2 px-2 pb-2">
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="h-7 w-[150px] border-0 bg-transparent text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-[12px]">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto">
              {isStreaming ? (
                <Button size="icon" variant="secondary" className="h-7 w-7" onClick={stop}>
                  <Square className="h-3 w-3" />
                  <span className="sr-only">Stop</span>
                </Button>
              ) : (
                <Button
                  size="icon"
                  className="h-7 w-7"
                  disabled={!input.trim()}
                  onClick={submit}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                  <span className="sr-only">Send</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
});