import { useEffect } from "react";
import { pingBackend } from "@/services/http";
import {
  connectAstraSocket,
  disconnectAstraSocket,
  onAstraEvent,
} from "@/services/ws/client";
import { useConnectionStore } from "@/store/connection.store";

const HEALTH_INTERVAL = 15000;

/**
 * Phase 1 connectivity: polls the backend health endpoint and keeps the
 * shared ASTRA WebSocket alive, mirroring both into `connection.store`.
 */
export function useAstraConnection() {
  useEffect(() => {
    const { setApi, setSocket, setAttempts, markEvent } = useConnectionStore.getState();
    let cancelled = false;
    const controller = new AbortController();

    const probe = async () => {
      setApi("connecting");
      const ok = await pingBackend(controller.signal);
      if (!cancelled) setApi(ok ? "connected" : "offline");
    };

    void probe();
    const timer = setInterval(() => void probe(), HEALTH_INTERVAL);

    const offAny = onAstraEvent("*", () => markEvent());
    connectAstraSocket({ onStatus: setSocket, onAttempt: setAttempts });

    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(timer);
      offAny();
      disconnectAstraSocket();
    };
  }, []);
}