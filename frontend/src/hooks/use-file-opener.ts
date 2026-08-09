import { useCallback } from "react";
import { toast } from "sonner";
import { editorService } from "@/services/editor.service";
import { useEditorStore } from "@/store/editor.store";
import { useWorkspaceStore } from "@/store/workspace.store";

/** Opens a workspace file via GET /api/files?path= and pushes it into the editor. */
export function useFileOpener() {
  const openTab = useEditorStore((s) => s.openTab);
  const setLoadingFileId = useEditorStore((s) => s.setLoadingFileId);
  const setActiveFile = useWorkspaceStore((s) => s.setActiveFile);

  return useCallback(
    async (fileId: string, position?: { line: number; column?: number }) => {
      const reveal = () => {
        if (position)
          useEditorStore
            .getState()
            .setReveal({ path: fileId, line: position.line, column: position.column ?? 1 });
      };
      const existing = useEditorStore.getState().tabs.find((t) => t.id === fileId);
      setActiveFile(fileId);
      if (existing) {
        useEditorStore.getState().setActiveTab(fileId);
        reveal();
        return;
      }
      setLoadingFileId(fileId);
      try {
        const file = await editorService.getFile(fileId);
        openTab(file);
        reveal();
      } catch (error) {
        toast.error("Could not open file", { description: (error as Error).message });
      } finally {
        setLoadingFileId(null);
      }
    },
    [openTab, setActiveFile, setLoadingFileId],
  );
}