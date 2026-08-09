/** Event envelope emitted by the ASTRA backend WebSocket. */
export type AstraEventType =
  | "CONNECTED"
  | "INDEX_UPDATED"
  | "AI_STREAM_START"
  | "AI_STREAM_TOKEN"
  | "AI_STREAM_COMPLETE"
  | "AI_STREAM_ERROR"
  | "FILE_CREATED"
  | "FILE_MODIFIED"
  | "FILE_DELETED"
  | "TERMINAL_OUTPUT"
  | "TERMINAL_EXIT";

export interface AstraEvent<T = unknown> {
  type: AstraEventType;
  payload?: T;
  /** Correlation ids used by streaming events. */
  streamId?: string;
  sessionId?: string;
  timestamp?: number;
}

export function parseEvent(raw: string): AstraEvent | null {
  try {
    const data = JSON.parse(raw) as Partial<AstraEvent> & { event?: AstraEventType };
    const rawType = (data.type ?? data.event) as string | undefined;
    if (!rawType) return null;
    // The handshake frame uses lowercase "connected"; every other event uses
    // the uppercase WebSocketEventType enum name.
    const type = rawType.toUpperCase() as AstraEventType;
    return { ...data, type } as AstraEvent;
  } catch {
    return null;
  }
}