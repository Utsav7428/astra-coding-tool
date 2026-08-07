import { create } from "zustand";
import type { FileNode } from "@/types";

export type ActivityView = "explorer" | "search" | "chat" | "git" | "settings";

interface WorkspaceState {
  tree: FileNode | null;
  expanded: Record<string, boolean>;
  activeFileId: string | null;
  activeView: ActivityView;
  sidebarOpen: boolean;
  setTree: (tree: FileNode) => void;
  toggleFolder: (id: string) => void;
  setActiveFile: (id: string | null) => void;
  setActiveView: (view: ActivityView) => void;
  toggleSidebar: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  tree: null,
  expanded: { root: true, src: true, "src-components": true },
  activeFileId: null,
  activeView: "explorer",
  sidebarOpen: true,
  setTree: (tree) => set({ tree }),
  toggleFolder: (id) => set((s) => ({ expanded: { ...s.expanded, [id]: !s.expanded[id] } })),
  setActiveFile: (activeFileId) => set({ activeFileId }),
  setActiveView: (activeView) => set({ activeView, sidebarOpen: true }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));