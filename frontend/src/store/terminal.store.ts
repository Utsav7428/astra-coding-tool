import { create } from "zustand";
import type { ConnectionStatus } from "@/types";

interface TerminalState {
  status: ConnectionStatus;
  visible: boolean;
  reconnectToken: number;
  clearToken: number;
  setStatus: (status: ConnectionStatus) => void;
  toggleVisible: () => void;
  reconnect: () => void;
  clear: () => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  status: "offline",
  visible: true,
  reconnectToken: 0,
  clearToken: 0,
  setStatus: (status) => set({ status }),
  toggleVisible: () => set((s) => ({ visible: !s.visible })),
  reconnect: () => set((s) => ({ reconnectToken: s.reconnectToken + 1 })),
  clear: () => set((s) => ({ clearToken: s.clearToken + 1 })),
}));