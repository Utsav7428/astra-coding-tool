import { create } from "zustand";
import type { EditorTab, FileContent } from "@/types";

interface EditorState {
  tabs: EditorTab[];
  activeTabId: string | null;
  loadingFileId: string | null;
  savingTabId: string | null;
  cursor: { line: number; column: number };
  /** Set when a search result should scroll the editor to a position. */
  reveal: { path: string; line: number; column: number } | null;
  openTab: (file: FileContent) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  markSaved: (id: string) => void;
  setLoadingFileId: (id: string | null) => void;
  setSavingTabId: (id: string | null) => void;
  setCursor: (line: number, column: number) => void;
  setReveal: (reveal: { path: string; line: number; column: number } | null) => void;
  toggleReadonly: (id: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  loadingFileId: null,
  savingTabId: null,
  cursor: { line: 1, column: 1 },
  reveal: null,

  openTab: (file) =>
    set((s) => {
      if (s.tabs.some((t) => t.id === file.id)) return { activeTabId: file.id };
      const tab: EditorTab = {
        id: file.id,
        name: file.name,
        path: file.path,
        language: file.language,
        content: file.content,
        savedContent: file.content,
        readonly: Boolean(file.readonly),
      };
      return { tabs: [...s.tabs, tab], activeTabId: file.id };
    }),

  closeTab: (id) =>
    set((s) => {
      const tabs = s.tabs.filter((t) => t.id !== id);
      const activeTabId =
        s.activeTabId === id ? (tabs[tabs.length - 1]?.id ?? null) : s.activeTabId;
      return { tabs, activeTabId };
    }),

  setActiveTab: (activeTabId) => set({ activeTabId }),

  updateContent: (id, content) =>
    set((s) => ({ tabs: s.tabs.map((t) => (t.id === id ? { ...t, content } : t)) })),

  markSaved: (id) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, savedContent: t.content } : t)),
    })),

  setLoadingFileId: (loadingFileId) => set({ loadingFileId }),
  setSavingTabId: (savingTabId) => set({ savingTabId }),
  setCursor: (line, column) => set({ cursor: { line, column } }),
  setReveal: (reveal) => set({ reveal }),
  toggleReadonly: (id) =>
    set({ tabs: get().tabs.map((t) => (t.id === id ? { ...t, readonly: !t.readonly } : t)) }),
}));

export const isDirty = (tab: EditorTab) => tab.content !== tab.savedContent;