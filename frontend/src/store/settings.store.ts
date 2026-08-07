import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light";

interface SettingsState {
  theme: ThemeMode;
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  autoScrollTerminal: boolean;
  setTheme: (theme: ThemeMode) => void;
  set: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "dark",
      fontSize: 13,
      tabSize: 2,
      wordWrap: false,
      minimap: true,
      autoScrollTerminal: true,
      setTheme: (theme) => set({ theme }),
      set: (key, value) => set({ [key]: value } as never),
    }),
    {
      name: "astra.settings",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? {
              getItem: () => null,
              setItem: () => undefined,
              removeItem: () => undefined,
            }
          : window.localStorage,
      ),
    },
  ),
);