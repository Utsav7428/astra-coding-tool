import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { onAstraEvent } from "@/services/ws/client";
import { useEditorStore } from "@/store/editor.store";

function pathOf(payload: unknown): string | null {
  if (typeof payload === "string") return payload;
  const p = payload as { path?: string; filePath?: string } | undefined;
  return p?.path ?? p?.filePath ?? null;
}

/** Phase 9: reflect backend WatchService / index events in the UI. */
export function useLiveSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const invalidateTree = () =>
      void queryClient.invalidateQueries({ queryKey: ["workspace", "tree"] });

    const offIndex = onAstraEvent("INDEX_UPDATED", () => {
      void queryClient.invalidateQueries({ queryKey: ["symbols"] });
      void queryClient.invalidateQueries({ queryKey: ["search"] });
    });
    const offCreated = onAstraEvent("FILE_CREATED", invalidateTree);
    const offDeleted = onAstraEvent("FILE_DELETED", (event) => {
      invalidateTree();
      const path = pathOf(event.payload);
      if (path) useEditorStore.getState().closeTab(path);
    });
    const offModified = onAstraEvent("FILE_MODIFIED", (event) => {
      const path = pathOf(event.payload);
      if (!path) return;
      const tab = useEditorStore.getState().tabs.find((t) => t.path === path);
      if (!tab) return;
      if (tab.content !== tab.savedContent) {
        toast.warning("File changed on disk", { description: `${tab.name} has unsaved changes` });
        return;
      }
      void queryClient.invalidateQueries({ queryKey: ["file", path] });
      void import("@/services/editor.service").then(({ editorService }) =>
        editorService
          .getFile(path)
          .then((file) => useEditorStore.getState().openTab(file))
          .catch(() => undefined),
      );
    });

    return () => {
      offIndex();
      offCreated();
      offDeleted();
      offModified();
    };
  }, [queryClient]);
}