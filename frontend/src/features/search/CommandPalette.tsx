import { useMemo, useState } from "react";
import { FileCode2, Hash, TerminalSquare } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useFileOpener } from "@/hooks/use-file-opener";
import { useSymbolSearch } from "@/hooks/use-symbol-search";
import { searchAll } from "./search.utils";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommand: (id: string) => void;
}

export function CommandPalette({ open, onOpenChange, onCommand }: CommandPaletteProps) {
  const tree = useWorkspaceStore((s) => s.tree);
  const openFile = useFileOpener();
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchAll(tree, query), [tree, query]);
  const symbols = useSymbolSearch(query);

  const close = () => {
    onOpenChange(false);
    setQuery("");
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search files, symbols and commands…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[380px]">
        <CommandEmpty>No matches found.</CommandEmpty>

        <CommandGroup heading="Files">
          {results.files.slice(0, 8).map((r) => (
            <CommandItem
              key={r.id}
              value={`file ${r.label} ${r.detail}`}
              onSelect={() => {
                void openFile(r.id);
                close();
              }}
            >
              <FileCode2 className="h-4 w-4 text-muted-foreground" />
              <span>{r.label}</span>
              <CommandShortcut className="font-mono text-[10px]">{r.detail}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Symbols">
          {(symbols.data ?? []).slice(0, 8).map((r) => (
            <CommandItem
              key={r.id}
              value={`symbol ${r.label} ${r.detail}`}
              onSelect={() => {
                void openFile(r.filePath, { line: r.line, column: r.column });
                close();
              }}
            >
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span>{r.label}</span>
              <CommandShortcut className="font-mono text-[10px]">{r.detail}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Commands">
          {results.commands.map((r) => (
            <CommandItem
              key={r.id}
              value={`command ${r.label}`}
              onSelect={() => {
                onCommand(r.id);
                close();
              }}
            >
              <TerminalSquare className="h-4 w-4 text-muted-foreground" />
              <span>{r.label}</span>
              {r.detail && (
                <CommandShortcut className="font-mono text-[10px]">{r.detail}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}