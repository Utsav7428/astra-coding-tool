import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FilePlus2, FolderPlus, FolderOpen, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelHeader } from "@/components/layout/PanelHeader";
import { workspaceService } from "@/services/workspace.service";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useEditorStore } from "@/store/editor.store";
import { useFileOpener } from "@/hooks/use-file-opener";
import { basename, dirname } from "@/lib/language";
import { FileTree } from "./FileTree";
import type { FileNode } from "@/types";

export function ExplorerPanel() {
  const { tree, expanded, activeFileId, rootPath, setTree, setRootPath, toggleFolder } =
    useWorkspaceStore();
  const openFile = useFileOpener();
  const queryClient = useQueryClient();
  const [pathInput, setPathInput] = useState("");

  const query = useQuery({
    queryKey: ["workspace", "tree", rootPath],
    queryFn: () => workspaceService.getTree(rootPath as string),
    enabled: Boolean(rootPath),
  });

  useEffect(() => {
    if (query.data) setTree(query.data);
  }, [query.data, setTree]);

  useEffect(() => {
    if (query.error) {
      toast.error("Could not load the workspace", {
        description: (query.error as Error).message,
      });
    }
  }, [query.error]);

  const openWorkspace = useMutation({
    mutationFn: (path: string) => workspaceService.openWorkspace(path),
    onSuccess: (root, path) => {
      setRootPath(path);
      setTree(root);
      queryClient.setQueryData(["workspace", "tree", path], root);
      toast.success(`Opened ${basename(path)}`);
    },
    onError: (error: Error) =>
      toast.error("Could not open that folder", { description: error.message }),
  });

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["workspace", "tree"] });

  const run = async (label: string, fn: () => Promise<void>) => {
    try {
      await fn();
      refresh();
    } catch (error) {
      toast.error(`${label} failed`, { description: (error as Error).message });
    }
  };

  const targetDir = (node: FileNode) => (node.type === "folder" ? node.path : dirname(node.path));

  const createFile = (node: FileNode) => {
    const name = window.prompt("New file name", "Untitled.java");
    if (name) void run("Create file", () => workspaceService.createFile(targetDir(node), name));
  };
  const createFolder = (node: FileNode) => {
    const name = window.prompt("New folder name", "new-folder");
    if (name) void run("Create folder", () => workspaceService.createFolder(targetDir(node), name));
  };
  const rename = (node: FileNode) => {
    const name = window.prompt("Rename to", node.name);
    if (name && name !== node.name)
      void run("Rename", () => workspaceService.rename(node.path, name));
  };
  const remove = (node: FileNode) => {
    if (!window.confirm(`Delete ${node.name}? This cannot be undone.`)) return;
    void run("Delete", async () => {
      await workspaceService.remove(node.path);
      useEditorStore.getState().closeTab(node.path);
    });
  };

  if (!rootPath) {
    return (
      <div className="flex h-full flex-col">
        <PanelHeader title="Explorer" subtitle="no workspace" />
        <form
          className="space-y-2 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (pathInput.trim()) openWorkspace.mutate(pathInput.trim());
          }}
        >
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Enter an absolute folder path on the machine running the ASTRA backend.
          </p>
          <Input
            autoFocus
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            placeholder="/Users/you/projects/my-app"
            className="h-8 bg-surface text-[13px]"
          />
          <Button type="submit" size="sm" className="w-full" disabled={openWorkspace.isPending}>
            <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
            {openWorkspace.isPending ? "Opening…" : "Open workspace"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <PanelHeader title="Explorer" subtitle={basename(rootPath)}>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={refresh}>
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="sr-only">Refresh tree</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => tree && createFile(tree)}
        >
          <FilePlus2 className="h-3.5 w-3.5" />
          <span className="sr-only">New file</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => tree && createFolder(tree)}
        >
          <FolderPlus className="h-3.5 w-3.5" />
          <span className="sr-only">New folder</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setRootPath(null)}
          title="Close workspace"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          <span className="sr-only">Close workspace</span>
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
            onCreateFile={createFile}
            onCreateFolder={createFolder}
            onRename={rename}
            onDelete={remove}
          />
        )}
      </div>
    </div>
  );
}