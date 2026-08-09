/**
 * Thin REST client for the ASTRA Spring Boot backend.
 *
 * Configuration lives in a `.env` file at the project root:
 *   VITE_API_BASE_URL=http://localhost:<backend-port>
 *   VITE_ASTRA_WS_URL=ws://localhost:<backend-port>/<ws-path>
 *   VITE_TERMINAL_WS_URL=ws://localhost:<backend-port>/<terminal-ws-path>
 *   VITE_HEALTH_PATH=/actuator/health           (optional override)
 *   VITE_MOCK_WORKSPACE / _EDITOR / _CHAT / _TERMINAL = false  (per-service switch)
 */
export const API_BASE_URL =
  (import.meta.env['VITE_API_BASE_URL'] as string | undefined) ?? "http://localhost:8080";

/** Main event socket (CONNECTED / FILE_* / INDEX_UPDATED / AI_STREAM_*). */
export const ASTRA_WS_URL =
  (import.meta.env['VITE_ASTRA_WS_URL'] as string | undefined) ?? "ws://localhost:8080/ws";

export const TERMINAL_WS_URL =
  (import.meta.env['VITE_TERMINAL_WS_URL'] as string | undefined) ??
  "ws://localhost:8080/ws/terminal";

/** Health probe used by the connection indicator. */
export const HEALTH_PATH =
  (import.meta.env['VITE_HEALTH_PATH'] as string | undefined) ?? "/api/index/count";

const flag = (value: unknown, fallback: boolean) =>
  value === undefined ? fallback : String(value) !== "false";

/**
 * Per-service mock switches so the backend can be adopted phase by phase.
 * Flip each to false (or set the matching VITE_MOCK_* env var) as the
 * corresponding Spring Boot endpoints are wired up.
 */
export const MOCK_WORKSPACE = flag(import.meta.env['VITE_MOCK_WORKSPACE'], false);
export const MOCK_EDITOR = flag(import.meta.env['VITE_MOCK_EDITOR'], false);
export const MOCK_CHAT = flag(import.meta.env['VITE_MOCK_CHAT'], false);
export const MOCK_TERMINAL = flag(import.meta.env['VITE_MOCK_TERMINAL'], true);

/** @deprecated kept for compatibility — prefer the per-service flags above. */
export const MOCK = MOCK_WORKSPACE && MOCK_EDITOR && MOCK_CHAT && MOCK_TERMINAL;

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `${init?.method ?? "GET"} ${path} failed: ${res.status}${detail ? ` — ${detail.slice(0, 200)}` : ""}`,
    );
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Lightweight backend reachability probe. */
export async function pingBackend(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}${HEALTH_PATH}`, { signal: signal ?? null });
    return res.ok;
  } catch {
    return false;
  }
}