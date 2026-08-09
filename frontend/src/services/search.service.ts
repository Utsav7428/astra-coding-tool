import { request } from "./http";
import { basename } from "@/lib/language";
import type { SearchResult } from "@/types";

/** `Symbol` record from the Tree-sitter index. */
export interface BackendSymbol {
  name: string;
  type: string;
  filePath: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export interface SemanticHit {
  symbol: BackendSymbol;
  score: number;
  context: { filePath: string; startLine: number; endLine: number; content: string };
}

export interface SymbolResult extends SearchResult {
  filePath: string;
  line: number;
  column: number;
}

const toSymbolResult = (s: BackendSymbol, prefix: string): SymbolResult => ({
  id: `${prefix}:${s.filePath}:${s.startLine}:${s.name}`,
  kind: "symbol",
  label: s.name,
  detail: `${s.type} · ${basename(s.filePath)}:${s.startLine}`,
  path: s.filePath,
  filePath: s.filePath,
  line: s.startLine,
  column: s.startColumn,
});

export const searchService = {
  /** GET /api/workspaces/symbols/search?q= */
  async searchSymbols(q: string, signal?: AbortSignal): Promise<SymbolResult[]> {
    if (!q.trim()) return [];
    const symbols = await request<BackendSymbol[]>(
      `/api/workspaces/symbols/search?q=${encodeURIComponent(q)}`,
      { signal: signal ?? null },
    );
    return (symbols ?? []).map((s) => toSymbolResult(s, "sym"));
  },

  /** GET /api/search?query=&limit= — embedding-backed semantic search. */
  async semanticSearch(query: string, limit = 10, signal?: AbortSignal): Promise<SymbolResult[]> {
    if (!query.trim()) return [];
    const hits = await request<SemanticHit[]>(
      `/api/search?query=${encodeURIComponent(query)}&limit=${limit}`,
      { signal: signal ?? null },
    );
    return (hits ?? [])
      .filter((h) => h?.symbol)
      .map((h) => ({
        ...toSymbolResult(h.symbol, "sem"),
        detail: `${(h.score * 100).toFixed(0)}% · ${basename(h.symbol.filePath)}:${h.symbol.startLine}`,
      }));
  },
};