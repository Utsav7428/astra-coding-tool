import { Bot, Check, FolderOpen, Loader2, Server, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor.store";
import { useTerminalStore } from "@/store/terminal.store";
import { useChatStore } from "@/store/chat.store";
import { useConnectionStore } from "@/store/connection.store";

export function StatusBar({ workspace }: { workspace: string }) {
  const cursor = useEditorStore((s) => s.cursor);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const tabs = useEditorStore((s) => s.tabs);
  const savingTabId = useEditorStore((s) => s.savingTabId);
  const terminalStatus = useTerminalStore((s) => s.status);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const model = useChatStore((s) => s.model);
  const api = useConnectionStore((s) => s.api);
  const socketStatus = useConnectionStore((s) => s.socket);
  const attempts = useConnectionStore((s) => s.attempts);

  const active = tabs.find((t) => t.id === activeTabId);

  return (
    <footer className="flex h-6 shrink-0 items-center justify-between border-t border-border bg-panel px-3 font-mono text-[11px] text-muted-foreground">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-foreground/80">
          <FolderOpen className="h-3 w-3" />
          {workspace}
        </span>
        <span className="hidden sm:inline">
          Ln {cursor.line}, Col {cursor.column}
        </span>
        <span className="hidden capitalize sm:inline">{active?.language ?? "plaintext"}</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          {savingTabId ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> Saving
            </>
          ) : (
            <>
              <Check className="h-3 w-3 text-success" /> Synced
            </>
          )}
        </span>
        <span className="flex items-center gap-1.5">
          <Server className="h-3 w-3" />
          <span
            className={cn(
              api === "connected"
                ? "text-success"
                : api === "connecting"
                  ? "text-warning"
                  : "text-destructive",
            )}
          >
            {api === "connected"
              ? "Backend online"
              : api === "connecting"
                ? "Backend checking…"
                : "Backend offline"}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          {socketStatus === "connected" ? (
            <Wifi className="h-3 w-3" />
          ) : (
            <WifiOff className="h-3 w-3" />
          )}
          {socketStatus === "connected"
            ? "ws live"
            : attempts > 0
              ? `ws retry ${attempts}`
              : "ws offline"}
        </span>
        <span className="hidden items-center gap-1.5 md:flex">
          <span className={cn(terminalStatus === "connected" ? "text-success" : "text-warning")}>
            term {terminalStatus}
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-primary">
          <Bot className="h-3 w-3" />
          {isStreaming ? "AI generating…" : model}
        </span>
      </div>
    </footer>
  );
}