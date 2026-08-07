import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { chatService } from "@/services/chat.service";
import { useChatStore } from "@/store/chat.store";

export function useChatController() {
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (text: string) => {
    const store = useChatStore.getState();
    if (!text.trim() || store.isStreaming) return;

    store.addMessage("user", text.trim());
    const assistantId = store.addMessage("assistant", "");
    store.setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const stream = chatService.streamChat(
        {
          conversationId: store.conversationId,
          model: store.model,
          messages: useChatStore.getState().messages,
        },
        controller.signal,
      );
      for await (const chunk of stream) {
        useChatStore.getState().appendToMessage(assistantId, chunk);
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        toast.error("The assistant request failed", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    } finally {
      const s = useChatStore.getState();
      s.finishMessage(assistantId);
      s.setStreaming(false);
      abortRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    useChatStore.getState().setStreaming(false);
  }, []);

  return { send, stop };
}