import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileIcon } from "@/features/workspace/FileIcon";
import { isDirty, useEditorStore } from "@/store/editor.store";
import { useWorkspaceStore } from "@/store/workspace.store";

export function EditorTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useEditorStore();
  const setActiveFile = useWorkspaceStore((s) => s.setActiveFile);

  if (!tabs.length) return null;

  return (
    <div className="flex h-9 shrink-0 items-stretch overflow-x-auto border-b border-border bg-panel">
      {tabs.map((tab) => {
        const active = tab.id === activeTabId;
        const dirty = isDirty(tab);
        return (
          <div
            key={tab.id}
            className={cn(
              "group relative flex min-w-[140px] max-w-[220px] items-center gap-2 border-r border-border px-3 text-[13px] transition-colors",
              active
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            {active && <span className="absolute inset-x-0 top-0 h-0.5 bg-primary" />}
            <button
              className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left"
              onClick={() => {
                setActiveTab(tab.id);
                setActiveFile(tab.id);
              }}
              title={tab.path}
            >
              <FileIcon name={tab.name} className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{tab.name}</span>
            </button>
            <button
              onClick={() => closeTab(tab.id)}
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label={`Close ${tab.name}`}
            >
              {dirty ? (
                <span className="block h-2 w-2 rounded-full bg-primary group-hover:hidden" />
              ) : null}
              <X className={cn("h-3.5 w-3.5", dirty && "hidden group-hover:block")} />
            </button>
          </div>
        );
      })}
    </div>
  );
}