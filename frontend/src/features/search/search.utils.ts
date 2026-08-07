import type { FileNode, SearchResult } from "@/types";
import { mockCommands, mockSymbols } from "@/services/mock-data";

export function flattenFiles(node: FileNode | null): SearchResult[] {
  if (!node) return [];
  const out: SearchResult[] = [];
  const walk = (n: FileNode) => {
    if (n.type === "file") {
      out.push({ id: n.id, kind: "file", label: n.name, detail: n.path, path: n.path });
    }
    n.children?.forEach(walk);
  };
  walk(node);
  return out;
}

export function searchAll(tree: FileNode | null, query: string) {
  const q = query.trim().toLowerCase();
  const files = flattenFiles(tree);
  const match = (r: SearchResult) =>
    !q || r.label.toLowerCase().includes(q) || (r.detail ?? "").toLowerCase().includes(q);
  return {
    files: files.filter(match),
    symbols: mockSymbols.filter(match),
    commands: mockCommands.filter(match),
  };
}