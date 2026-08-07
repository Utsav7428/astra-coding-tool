import { lazy, Suspense } from "react";
import { ChevronDown, Loader2, RotateCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTerminalStore } from "@/store/terminal.store";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

const XtermView = lazy(() =>
  import("./XtermView").then((m) => ({ default: m.XtermView })),
);

const statusTone: Record<string, string> = {
  connected: "bg-success",
  connecting: "bg-warning",
  offline: "bg-muted-foreground",
};

export function TerminalPanel() {
  const { status, reconnect, clear, toggleVisible } = useTerminalStore();
  const mounted = useMounted();

  return (
    <section className="flex h-full flex-col border-t border-border bg-panel">
      <div className="flex h-8 shrink-0 items-center gap-2 border-b border-border px-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
          Terminal
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className={cn("h-1.5 w-1.5 rounded-full", statusTone[status])} />
          {status}
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={reconnect} title="Reconnect">
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clear} title="Clear">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={toggleVisible}
            title="Hide terminal"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 bg-[#0c0e12] pt-1">
        {mounted ? (
          <Suspense
            fallback={
              <div className="flex h-full items-center gap-2 px-3 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Starting session…
              </div>
            }
          >
            <XtermView />
          </Suspense>
        ) : null}
      </div>
    </section>
  );
}