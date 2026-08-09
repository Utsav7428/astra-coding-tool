import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { editorService, type QuickEditResult } from "@/services/editor.service";

export interface QuickEditSelection {
  filePath: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

interface QuickEditProps {
  selection: QuickEditSelection | null;
  onOpenChange: (open: boolean) => void;
  onApplied: (result: QuickEditResult) => void;
}

/** Inline AI edit backed by POST /api/quick-edit and /api/quick-edit/apply. */
export function QuickEdit({ selection, onOpenChange, onApplied }: QuickEditProps) {
  const [instruction, setInstruction] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<QuickEditResult | null>(null);

  const close = () => {
    setInstruction("");
    setResult(null);
    onOpenChange(false);
  };

  const generate = async () => {
    if (!selection || !instruction.trim()) return;
    setPending(true);
    try {
      setResult(await editorService.quickEdit({ ...selection, instruction: instruction.trim() }));
    } catch (error) {
      toast.error("Quick Edit failed", { description: (error as Error).message });
    } finally {
      setPending(false);
    }
  };

  const apply = async () => {
    if (!result) return;
    setPending(true);
    try {
      await editorService.applyQuickEdit(result.filePath, result.originalCode, result.modifiedCode);
      onApplied(result);
      toast.success("Edit applied");
      close();
    } catch (error) {
      toast.error("Could not apply the edit", { description: (error as Error).message });
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={Boolean(selection)} onOpenChange={(open) => (open ? null : close())}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" /> Quick Edit
          </DialogTitle>
          <DialogDescription className="font-mono text-[11px]">
            {selection
              ? `${selection.filePath} · L${selection.startLine}–L${selection.endLine}`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <Input
          autoFocus
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !pending) void generate();
          }}
          placeholder="Describe the change, e.g. extract this into a helper method"
          className="bg-surface text-[13px]"
        />

        {result && (
          <pre className="max-h-72 overflow-auto rounded-md border border-border bg-surface p-3 font-mono text-[11px] leading-relaxed">
            {result.diff
              ? result.diff.split("\n").map((line, i) => (
                  <div
                    key={i}
                    className={
                      line.startsWith("+")
                        ? "text-success"
                        : line.startsWith("-")
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }
                  >
                    {line || " "}
                  </div>
                ))
              : result.modifiedCode}
          </pre>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={close} disabled={pending}>
            Cancel
          </Button>
          {result ? (
            <Button onClick={() => void apply()} disabled={pending}>
              {pending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} Apply edit
            </Button>
          ) : (
            <Button onClick={() => void generate()} disabled={pending || !instruction.trim()}>
              {pending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} Generate
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}