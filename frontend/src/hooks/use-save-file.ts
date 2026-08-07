import { useCallback } from "react";
import { toast } from "sonner";
import { editorService } from "@/services/editor.service";
import { useEditorStore } from "@/store/editor.store";

/** Persists the active tab via PUT /api/files/{id}. */
export function useSaveFile() {
  const setSavingTabId = useEditorStore((s) => s.setSavingTabId);
  const markSaved = useEditorStore((s) => s.markSaved);

  return useCallback(
    async (tabId?: string) => {
      const state = useEditorStore.getState();
      const id = tabId ?? state.activeTabId;
      const tab = state.tabs.find((t) => t.id === id);
      if (!tab) return;
      if (tab.readonly) {
        toast.warning("File is read-only");
        return;
      }
      setSavingTabId(tab.id);
      try {
        await editorService.saveFile(tab.id, tab.content);
        markSaved(tab.id);
        toast.success(`Saved ${tab.name}`);
      } catch (error) {
        toast.error("Save failed", { description: (error as Error).message });
      } finally {
        setSavingTabId(null);
      }
    },
    [markSaved, setSavingTabId],
  );
}