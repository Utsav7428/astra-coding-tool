import { ChevronRight, FolderClosed, FolderOpen } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { FileIcon } from "./FileIcon";
import type { FileNode } from "@/types";

export interface FileTreeCallbacks {
  onOpenFile: (node: FileNode) => void;
  onToggleFolder: (node: FileNode) => void;
  onCreateFile: (node: FileNode) => void;
  onCreateFolder: (node: FileNode) => void;
  onRename: (node: FileNode) => void;
  onDelete: (node: FileNode) => void;
}

interface FileTreeProps extends FileTreeCallbacks {
  nodes: FileNode[];
  expanded: Record<string, boolean>;
  activeFileId: string | null;
  depth?: number;
}

export function FileTree({ nodes, expanded, activeFileId, depth = 0, ...cb }: FileTreeProps) {
  return (
    <ul className="select-none">
      {[...nodes]
        .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "folder" ? -1 : 1))
        .map((node) => {
          const isFolder = node.type === "folder";
          const isOpen = Boolean(expanded[node.id]);
          const isActive = activeFileId === node.id;

          return (
            <li key={node.id}>
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <button
                    onClick={() => (isFolder ? cb.onToggleFolder(node) : cb.onOpenFile(node))}
                    style={{ paddingLeft: depth * 12 + 8 }}
                    className={cn(
                      "group flex h-[26px] w-full items-center gap-1.5 rounded-md pr-2 text-left text-[13px] text-panel-foreground transition-colors hover:bg-accent/70",
                      isActive && "bg-accent text-foreground",
                    )}
                  >
                    {isFolder ? (
                      <>
                        <ChevronRight
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-150",
                            isOpen && "rotate-90",
                          )}
                        />
                        {isOpen ? (
                          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-primary" />
                        ) : (
                          <FolderClosed className="h-3.5 w-3.5 shrink-0 text-primary/80" />
                        )}
                      </>
                    ) : (
                      <>
                        <span className="w-3.5 shrink-0" />
                        <FileIcon name={node.name} className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      </>
                    )}
                    <span className="truncate">{node.name}</span>
                  </button>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-52">
                  <ContextMenuItem onSelect={() => cb.onCreateFile(node)}>New file…</ContextMenuItem>
                  <ContextMenuItem onSelect={() => cb.onCreateFolder(node)}>
                    New folder…
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem onSelect={() => cb.onRename(node)}>Rename…</ContextMenuItem>
                  <ContextMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => cb.onDelete(node)}
                  >
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>

              {isFolder && isOpen && node.children?.length ? (
                <FileTree
                  nodes={node.children}
                  expanded={expanded}
                  activeFileId={activeFileId}
                  depth={depth + 1}
                  {...cb}
                />
              ) : null}
            </li>
          );
        })}
    </ul>
  );
}