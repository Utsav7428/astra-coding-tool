import { Files, MessageSquareCode, Search, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useWorkspaceStore, type ActivityView } from "@/store/workspace.store";

const items: { view: ActivityView; icon: typeof Files; label: string }[] = [
  { view: "explorer", icon: Files, label: "Explorer" },
  { view: "search", icon: Search, label: "Search" },
  { view: "chat", icon: MessageSquareCode, label: "AI Chat" },
  { view: "settings", icon: Settings, label: "Settings" },
];

export function ActivityBar() {
  const activeView = useWorkspaceStore((s) => s.activeView);
  const sidebarOpen = useWorkspaceStore((s) => s.sidebarOpen);
  const setActiveView = useWorkspaceStore((s) => s.setActiveView);
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar);

  return (
    <nav className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-border bg-sidebar py-2">
      {items.map(({ view, icon: Icon, label }) => {
        const active = sidebarOpen && activeView === view;
        return (
          <Tooltip key={view}>
            <TooltipTrigger asChild>
              <button
                onClick={() => (activeView === view && sidebarOpen ? toggleSidebar() : setActiveView(view))}
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground",
                  active && "bg-accent text-primary",
                )}
                aria-label={label}
                aria-pressed={active}
              >
                <Icon className="h-[18px] w-[18px]" />
                {active && (
                  <span className="absolute -left-2 h-5 w-0.5 rounded-full bg-primary" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}