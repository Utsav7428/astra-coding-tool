import { useMemo, useState } from "react";
import { FileCode2, Hash, Loader2, Search, Sparkles, TerminalSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PanelHeader } from "@/components/layout/PanelHeader";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useFileOpener } from "@/hooks/use-file-opener";
import { useSemanticSearch, useSymbolSearch } from "@/hooks/use-symbol-search";
import { searchAll } from "./search.utils";
import type { SymbolResult } from "@/services/search.service";
import type { SearchResult } from "@/types";

export function SearchPanel() {
  const tree = useWorkspaceStore((s) => s.tree);
  const openFile = useFileOpener();
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchAll(tree, query), [tree, query]);
  const symbols = useSymbolSearch(query);
  const semantic = useSemanticSearch(query);

  const goToSymbol = (r: SymbolResult) => void openFile(r.filePath, { line: r.line, column: r.column });

  const section = (
    title: string,
    icon: typeof FileCode2,
    items: SearchResult[],
    onSelect?: (r: SearchResult) => void,
  ) => {
    const Icon = icon;
    if (!items.length) return null;
    return (
      <div className="mb-3">
        <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title} · {items.length}
        </p>
        {items.slice(0, 12).map((r) => (
          <button
            key={r.id}
            onClick={() => onSelect?.(r)}
            disabled={!onSelect}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-accent/70 disabled:cursor-default disabled:opacity-80"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{r.label}</span>
            <span className="ml-auto truncate font-mono text-[10px] text-muted-foreground">
              {r.detail}
            </span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <PanelHeader title="Search" subtitle="files · symbols · semantic">
        {(symbols.isFetching || semantic.isFetching) && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        )}
      </PanelHeader>
      <div className="border-b border-border p-2.5">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workspace"
            className="h-8 bg-surface pl-8 text-[13px]"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-1.5">
        {section("Files", FileCode2, results.files, (r) => void openFile(r.id))}
        {section("Symbols", Hash, symbols.data ?? [], (r) => goToSymbol(r as SymbolResult))}
        {section("Semantic matches", Sparkles, semantic.data ?? [], (r) =>
          goToSymbol(r as SymbolResult),
        )}
        {section("Commands", TerminalSquare, results.commands)}
      </div>
    </div>
  );
}