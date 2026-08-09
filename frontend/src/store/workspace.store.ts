import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { FileNode } from "@/types";

export type ActivityView = "explorer" | "search" | "chat" | "git" | "settings";

interface WorkspaceState {
  tree: FileNode | null;
  /** Absolute path of the workspace opened through POST /api/workspaces/open. */
  rootPath: string | null;
  expanded: Record<string, boolean>;
  activeFileId: string | null;
  activeView: ActivityView;
  sidebarOpen: boolean;
  setTree: (tree: FileNode) => void;
  setRootPath: (path: string | null) => void;
  toggleFolder: (id: string) => void;
  setActiveFile: (id: string | null) => void;
  setActiveView: (view: ActivityView) => void;
  toggleSidebar: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      tree: null,
      rootPath: null,
      expanded: {},
      activeFileId: null,
      activeView: "explorer",
      sidebarOpen: true,
      setTree: (tree) => set({ tree }),
      setRootPath: (rootPath) => set({ rootPath }),
      toggleFolder: (id) => set((s) => ({ expanded: { ...s.expanded, [id]: !s.expanded[id] } })),
      setActiveFile: (activeFileId) => set({ activeFileId }),
      setActiveView: (activeView) => set({ activeView, sidebarOpen: true }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: "astra.workspace",
      partialize: (s) => ({ rootPath: s.rootPath }) as Partial<WorkspaceState>,
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? { getItem: () => null, setItem: () => undefined, removeItem: () => undefined }
          : window.localStorage,
      ),
    },
  ),
);