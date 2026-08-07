import { Lock, LockOpen, Loader2, Save } from "lucide-react";
import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AstraLogo } from "@/components/layout/AstraLogo";
import { EditorTabs } from "./EditorTabs";
import { isDirty, useEditorStore } from "@/store/editor.store";
import { useMounted } from "@/hooks/use-mounted";

const MonacoPane = lazy(() =>
  import("./MonacoPane").then((m) => ({ default: m.MonacoPane })),
);

interface EditorAreaProps {
  onSave: () => void;
  onQuickOpen: () => void;
  onFocusChat: () => void;
}

const shortcuts = [
  ["Ctrl", "P", "Go to file"],
  ["Ctrl", "Shift+P", "Command palette"],
  ["Ctrl", "K", "Ask the AI assistant"],
  ["Ctrl", "`", "Toggle terminal"],
];

export function EditorArea({ onSave, onQuickOpen, onFocusChat }: EditorAreaProps) {
  const { tabs, activeTabId, loadingFileId, savingTabId, toggleReadonly } = useEditorStore();
  const mounted = useMounted();
  const tab = tabs.find((t) => t.id === activeTabId);

  return (
    <section className="flex h-full min-w-0 flex-col bg-background">
      <EditorTabs />

      {tab && (
        <div className="flex h-8 shrink-0 items-center gap-2 border-b border-border px-3 text-[11px] text-muted-foreground">
          <span className="truncate font-mono">{tab.path}</span>
          {isDirty(tab) && (
            <Badge variant="outline" className="h-4 rounded-sm px-1 text-[10px] text-primary">
              unsaved
            </Badge>
          )}
          {tab.readonly && (
            <Badge variant="outline" className="h-4 rounded-sm px-1 text-[10px]">
              read-only
            </Badge>
          )}
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => toggleReadonly(tab.id)}
              title="Toggle read-only"
            >
              {tab.readonly ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1.5 px-2 text-[11px]"
              onClick={onSave}
              disabled={savingTabId === tab.id}
            >
              {savingTabId === tab.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save
            </Button>
          </div>
        </div>
      )}

      <div className="relative min-h-0 flex-1">
        {loadingFileId && (
          <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-accent">
            <div className="h-full w-1/3 animate-[astra-fade-in_1s_ease-in-out_infinite_alternate] bg-primary" />
          </div>
        )}

        {!tab ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 astra-fade-in">
            <AstraLogo className="h-14 w-14 opacity-90" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">ASTRA</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Open a file from the explorer to start editing
              </p>
            </div>
            <ul className="space-y-1.5">
              {shortcuts.map(([mod, key, label]) => (
                <li key={label} className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex gap-1">
                    <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px]">
                      {mod}
                    </kbd>
                    <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px]">
                      {key}
                    </kbd>
                  </span>
                  <span className="w-40">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : !mounted ? (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading editor…
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading editor…
              </div>
            }
          >
            <MonacoPane
              tab={tab}
              onSave={onSave}
              onQuickOpen={onQuickOpen}
              onFocusChat={onFocusChat}
            />
          </Suspense>
        )}
      </div>
    </section>
  );
}