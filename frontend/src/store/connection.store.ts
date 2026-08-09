import { create } from "zustand";
import type { ConnectionStatus } from "@/types";

interface ConnectionState {
  /** REST reachability (health probe). */
  api: ConnectionStatus;
  /** Main event WebSocket. */
  socket: ConnectionStatus;
  attempts: number;
  workspaceId: string | null;
  lastEventAt: number | null;
  setApi: (api: ConnectionStatus) => void;
  setSocket: (socket: ConnectionStatus) => void;
  setAttempts: (attempts: number) => void;
  setWorkspaceId: (workspaceId: string | null) => void;
  markEvent: () => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  api: "offline",
  socket: "offline",
  attempts: 0,
  workspaceId: null,
  lastEventAt: null,
  setApi: (api) => set({ api }),
  setSocket: (socket) => set({ socket }),
  setAttempts: (attempts) => set({ attempts }),
  setWorkspaceId: (workspaceId) => set({ workspaceId }),
  markEvent: () => set({ lastEventAt: Date.now() }),
}));