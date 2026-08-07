import { useCallback } from "react";
import { toast } from "sonner";
import { editorService } from "@/services/editor.service";
import { useEditorStore } from "@/store/editor.store";
import { useWorkspaceStore } from "@/store/workspace.store";

/** Opens a workspace file via GET /api/files/{id} and pushes it into the editor. */
export function useFileOpener() {
  const openTab = useEditorStore((s) => s.openTab);
  const setLoadingFileId = useEditorStore((s) => s.setLoadingFileId);
  const setActiveFile = useWorkspaceStore((s) => s.setActiveFile);

  return useCallback(
    async (fileId: string) => {
      const existing = useEditorStore.getState().tabs.find((t) => t.id === fileId);
      setActiveFile(fileId);
      if (existing) {
        useEditorStore.getState().setActiveTab(fileId);
        return;
      }
      setLoadingFileId(fileId);
      try {
        const file = await editorService.getFile(fileId);
        openTab(file);
      } catch (error) {
        toast.error("Could not open file", { description: (error as Error).message });
      } finally {
        setLoadingFileId(null);
      }
    },
    [openTab, setActiveFile, setLoadingFileId],
  );
}