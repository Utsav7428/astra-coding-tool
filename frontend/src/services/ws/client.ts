import { ASTRA_WS_URL } from "../http";
import { parseEvent, type AstraEvent, type AstraEventType } from "./events";

type Handler = (event: AstraEvent) => void;

const handlers = new Map<AstraEventType | "*", Set<Handler>>();

let socket: WebSocket | null = null;
let attempts = 0;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let closedByUs = false;

export interface AstraSocketLifecycle {
  onStatus?: (status: "connecting" | "connected" | "offline") => void;
  onAttempt?: (attempts: number) => void;
}

let lifecycle: AstraSocketLifecycle = {};

/** Subscribe to a single event type, or "*" for every event. Returns an unsubscribe fn. */
export function onAstraEvent(type: AstraEventType | "*", handler: Handler): () => void {
  const set = handlers.get(type) ?? new Set<Handler>();
  set.add(handler);
  handlers.set(type, set);
  return () => set.delete(handler);
}

function dispatch(event: AstraEvent) {
  handlers.get(event.type)?.forEach((h) => h(event));
  handlers.get("*")?.forEach((h) => h(event));
}

export function sendAstraMessage(message: unknown): boolean {
  if (socket?.readyState !== WebSocket.OPEN) return false;
  socket.send(typeof message === "string" ? message : JSON.stringify(message));
  return true;
}

export function connectAstraSocket(config: AstraSocketLifecycle = {}) {
  if (typeof window === "undefined") return;
  lifecycle = { ...lifecycle, ...config };
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING))
    return;

  closedByUs = false;
  lifecycle.onStatus?.("connecting");

  try {
    socket = new WebSocket(ASTRA_WS_URL);
  } catch {
    scheduleReconnect();
    return;
  }

  socket.onopen = () => {
    attempts = 0;
    lifecycle.onAttempt?.(attempts);
    lifecycle.onStatus?.("connected");
  };
  socket.onmessage = (e) => {
    const event = parseEvent(String(e.data));
    if (event) dispatch(event);
  };
  socket.onerror = () => lifecycle.onStatus?.("offline");
  socket.onclose = () => {
    lifecycle.onStatus?.("offline");
    socket = null;
    if (!closedByUs) scheduleReconnect();
  };
}

function scheduleReconnect() {
  if (retryTimer) return;
  attempts += 1;
  lifecycle.onAttempt?.(attempts);
  const backoff = Math.min(15000, 500 * 2 ** Math.min(attempts, 5));
  retryTimer = setTimeout(() => {
    retryTimer = null;
    connectAstraSocket();
  }, backoff);
}

export function disconnectAstraSocket() {
  closedByUs = true;
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  socket?.close();
  socket = null;
}