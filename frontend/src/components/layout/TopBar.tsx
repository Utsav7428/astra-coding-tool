import { Command, PanelLeft, PanelBottom, Save, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AstraLogo } from "@/components/layout/AstraLogo";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useTerminalStore } from "@/store/terminal.store";

interface TopBarProps {
  onSave: () => void;
  onCommandPalette: () => void;
}

export function TopBar({ onSave, onCommandPalette }: TopBarProps) {
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar);
  const setActiveView = useWorkspaceStore((s) => s.setActiveView);
  const toggleTerminal = useTerminalStore((s) => s.toggleVisible);

  const actions = [
    { icon: PanelLeft, label: "Toggle sidebar (Ctrl+B)", onClick: toggleSidebar },
    { icon: PanelBottom, label: "Toggle terminal (Ctrl+`)", onClick: toggleTerminal },
    { icon: Save, label: "Save file (Ctrl+S)", onClick: onSave },
  ];

  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-panel px-3">
      <div className="flex items-center gap-2.5">
        <AstraLogo className="h-6 w-6" />
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold tracking-[0.18em] text-foreground">ASTRA</span>
          <span className="hidden text-[11px] text-muted-foreground sm:inline">
            astra-workspace
          </span>
        </div>
      </div>

      <button
        onClick={onCommandPalette}
        className="group hidden h-7 w-[380px] items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-xs text-muted-foreground transition-colors hover:border-ring/50 hover:text-foreground md:flex"
      >
        <Command className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search files, symbols and commands</span>
        <kbd className="rounded border border-border bg-elevated px-1.5 py-0.5 font-mono text-[10px]">
          Ctrl+Shift+P
        </kbd>
      </button>

      <div className="flex items-center gap-0.5">
        {actions.map(({ icon: Icon, label, onClick }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClick}>
                <Icon className="h-4 w-4" />
                <span className="sr-only">{label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              onClick={() => setActiveView("settings")}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open settings</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}