/**
 * Thin REST client. Point API_BASE_URL at the Spring Boot backend when it
 * exists; every service falls back to mocked data while `MOCK` is true.
 */
export const API_BASE_URL =
  (import.meta.env['VITE_API_BASE_URL'] as string | undefined) ?? "http://localhost:8080";

export const TERMINAL_WS_URL =
  (import.meta.env['VITE_TERMINAL_WS_URL'] as string | undefined) ??
  "ws://localhost:8080/ws/terminal";

/** Flip to false once the Spring Boot endpoints are live. */
export const MOCK = true;

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${init?.method ?? "GET"} ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));