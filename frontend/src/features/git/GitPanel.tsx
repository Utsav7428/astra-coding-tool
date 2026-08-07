import { useQuery } from "@tanstack/react-query";
import { GitBranch, GitCommitVertical, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelHeader } from "@/components/layout/PanelHeader";
import { workspaceService } from "@/services/workspace.service";
import { cn } from "@/lib/utils";

const statusMeta = {
  modified: { badge: "M", tone: "text-warning" },
  added: { badge: "A", tone: "text-success" },
  deleted: { badge: "D", tone: "text-destructive" },
  untracked: { badge: "U", tone: "text-muted-foreground" },
} as const;

export function GitPanel() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["git", "status"],
    queryFn: () => workspaceService.getGitStatus(),
  });

  return (
    <div className="flex h-full flex-col">
      <PanelHeader title="Source Control" subtitle={data?.branch}>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="sr-only">Refresh status</span>
        </Button>
      </PanelHeader>

      <div className="space-y-2 border-b border-border p-2.5">
        <Textarea
          placeholder="Commit message"
          rows={2}
          className="resize-none bg-surface text-[13px]"
        />
        <Button
          size="sm"
          className="w-full gap-1.5"
          onClick={() => toast.info("Commit — backend placeholder")}
        >
          <GitCommitVertical className="h-3.5 w-3.5" />
          Commit to {data?.branch ?? "main"}
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-1.5">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-4/5" />
            ))}
          </div>
        ) : (
          <>
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Changes · {data?.entries.length ?? 0}
            </p>
            {data?.entries.map((entry) => (
              <div
                key={entry.path}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] hover:bg-accent/70"
              >
                <GitBranch className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{entry.path.split("/").pop()}</span>
                <span className="ml-auto truncate font-mono text-[10px] text-muted-foreground">
                  {entry.path}
                </span>
                <span className={cn("font-mono text-[11px] font-semibold", statusMeta[entry.status].tone)}>
                  {statusMeta[entry.status].badge}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}