import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { searchService, type SymbolResult } from "@/services/search.service";

export function useDebounced<T>(value: T, ms = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

/** Symbol index lookup (GET /api/workspaces/symbols/search). */
export function useSymbolSearch(query: string) {
  const q = useDebounced(query);
  return useQuery<SymbolResult[]>({
    queryKey: ["symbols", "search", q],
    queryFn: ({ signal }) => searchService.searchSymbols(q, signal),
    enabled: q.trim().length > 1,
    placeholderData: (prev) => prev,
  });
}

/** Embedding-backed semantic search (GET /api/search). */
export function useSemanticSearch(query: string, enabled = true) {
  const q = useDebounced(query, 400);
  return useQuery<SymbolResult[]>({
    queryKey: ["search", "semantic", q],
    queryFn: ({ signal }) => searchService.semanticSearch(q, 10, signal),
    enabled: enabled && q.trim().length > 2,
    placeholderData: (prev) => prev,
  });
}