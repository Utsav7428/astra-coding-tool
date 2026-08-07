import { useQuery } from "@tanstack/react-query";
import { FilePlus2, FolderPlus, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelHeader } from "@/components/layout/PanelHeader";
import { workspaceService } from "@/services/workspace.service";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useFileOpener } from "@/hooks/use-file-opener";
import { FileTree } from "./FileTree";
import type { FileNode } from "@/types";

export function ExplorerPanel() {
  const { tree, expanded, activeFileId, setTree, toggleFolder } = useWorkspaceStore();
  const openFile = useFileOpener();

  const query = useQuery({
    queryKey: ["workspace", "tree"],
    queryFn: () => workspaceService.getTree(),
  });

  useEffect(() => {
    if (query.data) setTree(query.data);
  }, [query.data, setTree]);

  const placeholder = (action: string, node: FileNode) =>
    toast.info(`${action} — coming soon`, { description: node.path });

  return (
    <div className="flex h-full flex-col">
      <PanelHeader title="Explorer" subtitle="astra-workspace">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => query.refetch()}>
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="sr-only">Refresh tree</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => tree && placeholder("New file", tree)}
        >
          <FilePlus2 className="h-3.5 w-3.5" />
          <span className="sr-only">New file</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => tree && placeholder("New folder", tree)}
        >
          <FolderPlus className="h-3.5 w-3.5" />
          <span className="sr-only">New folder</span>
        </Button>
      </PanelHeader>

      <div className="flex-1 overflow-auto p-1.5">
        {query.isLoading || !tree ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-4" style={{ width: `${55 + ((i * 13) % 40)}%` }} />
            ))}
          </div>
        ) : (
          <FileTree
            nodes={tree.children ?? []}
            expanded={expanded}
            activeFileId={activeFileId}
            onOpenFile={(node) => void openFile(node.id)}
            onToggleFolder={(node) => toggleFolder(node.id)}
            onCreateFile={(node) => placeholder("New file", node)}
            onCreateFolder={(node) => placeholder("New folder", node)}
            onRename={(node) => placeholder("Rename", node)}
            onDelete={(node) => placeholder("Delete", node)}
          />
        )}
      </div>
    </div>
  );
}