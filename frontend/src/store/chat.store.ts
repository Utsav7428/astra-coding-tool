import { create } from "zustand";
import type { ChatMessage, Conversation } from "@/types";

const uid = () => Math.random().toString(36).slice(2, 10);

interface ChatState {
  conversationId: string;
  messages: ChatMessage[];
  history: Conversation[];
  model: string;
  isStreaming: boolean;
  setHistory: (history: Conversation[]) => void;
  setModel: (model: string) => void;
  setStreaming: (isStreaming: boolean) => void;
  addMessage: (role: ChatMessage["role"], content: string) => string;
  appendToMessage: (id: string, chunk: string) => void;
  finishMessage: (id: string) => void;
  removeLastAssistant: () => ChatMessage | undefined;
  clear: () => void;
  selectConversation: (id: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversationId: uid(),
  messages: [],
  history: [],
  model: "astra-pro",
  isStreaming: false,

  setHistory: (history) => set({ history }),
  setModel: (model) => set({ model }),
  setStreaming: (isStreaming) => set({ isStreaming }),

  addMessage: (role, content) => {
    const id = uid();
    set((s) => ({
      messages: [
        ...s.messages,
        { id, role, content, createdAt: Date.now(), streaming: role === "assistant" },
      ],
    }));
    return id;
  },

  appendToMessage: (id, chunk) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, content: m.content + chunk } : m)),
    })),

  finishMessage: (id) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, streaming: false } : m)),
    })),

  removeLastAssistant: () => {
    const messages = [...get().messages];
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.role === "assistant") {
        const [removed] = messages.splice(i, 1);
        set({ messages });
        return removed;
      }
    }
    return undefined;
  },

  clear: () => set({ messages: [], conversationId: uid() }),
  selectConversation: (conversationId) => set({ conversationId, messages: [] }),
}));