import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Group, Panel, Separator, useDefaultLayout } from "react-resizable-panels";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { TopBar } from "@/components/layout/TopBar";
import { ActivityBar } from "@/components/layout/ActivityBar";
import { StatusBar } from "@/components/layout/StatusBar";
import { ExplorerPanel } from "@/features/workspace/ExplorerPanel";
import { SearchPanel } from "@/features/search/SearchPanel";
import { GitPanel } from "@/features/git/GitPanel";
import { SettingsPanel } from "@/features/settings/SettingsPanel";
import { CommandPalette } from "@/features/search/CommandPalette";
import { EditorArea } from "@/features/editor/EditorArea";
import { TerminalPanel } from "@/features/terminal/TerminalPanel";
import { AiChatPanel, type AiChatPanelHandle } from "@/features/chat/AiChatPanel";

import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useSaveFile } from "@/hooks/use-save-file";
import { useMounted } from "@/hooks/use-mounted";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useTerminalStore } from "@/store/terminal.store";
import { workspaceService } from "@/services/workspace.service";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ASTRA — Local-First AI IDE" },
      {
        name: "description",
        content:
          "ASTRA is a local-first AI IDE with a Monaco editor, integrated terminal, source control and an AI assistant panel.",
      },
      { property: "og:title", content: "ASTRA — Local-First AI IDE" },
      {
        property: "og:description",
        content:
          "Code, chat and run commands in one workspace: Monaco editor, xterm terminal and an AI assistant.",
      },
    ],
  }),
  component: AstraWorkspaceRoute,
});

function AstraWorkspaceRoute() {
  const mounted = useMounted();
  if (!mounted) {
    return <div className="h-screen w-full bg-background" />;
  }
  return <AstraWorkspace />;
}

function AstraWorkspace() {
  const { activeView, sidebarOpen, toggleSidebar } = useWorkspaceStore();
  const terminalVisible = useTerminalStore((s) => s.visible);
  const toggleTerminal = useTerminalStore((s) => s.toggleVisible);
  const clearTerminal = useTerminalStore((s) => s.clear);
  const setActiveView = useWorkspaceStore((s) => s.setActiveView);

  const saveFile = useSaveFile();
  const chatRef = useRef<AiChatPanelHandle>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const hLayout = useDefaultLayout({ id: "astra-h", panelIds: ["sidebar", "main", "chat"] });
  const vLayout = useDefaultLayout({ id: "astra-v", panelIds: ["editor", "terminal"] });

  const { data: git } = useQuery({
    queryKey: ["git", "status"],
    queryFn: () => workspaceService.getGitStatus(),
  });

  const onSave = useCallback(() => void saveFile(), [saveFile]);
  const onQuickOpen = useCallback(() => setPaletteOpen(true), []);
  const onFocusChat = useCallback(() => chatRef.current?.focus(), []);

  const handleCommand = useCallback(
    (id: string) => {
      switch (id) {
        case "cmd-save":
          onSave();
          break;
        case "cmd-toggle-terminal":
          toggleTerminal();
          break;
        case "cmd-toggle-sidebar":
          toggleSidebar();
          break;
        case "cmd-clear-terminal":
          clearTerminal();
          break;
        case "cmd-settings":
          setActiveView("settings");
          break;
        default:
          toast.info("Command queued", { description: `${id} — backend placeholder` });
      }
    },
    [onSave, toggleTerminal, toggleSidebar, clearTerminal, setActiveView],
  );

  const shortcuts = useMemo(
    () => ({
      onSave,
      onQuickOpen,
      onFocusChat,
      onCommandPalette: () => setPaletteOpen(true),
      onToggleTerminal: toggleTerminal,
      onToggleSidebar: toggleSidebar,
    }),
    [onSave, onQuickOpen, onFocusChat, toggleTerminal, toggleSidebar],
  );
  useKeyboardShortcuts(shortcuts);

  const sidebar =
    activeView === "search" ? (
      <SearchPanel />
    ) : activeView === "git" ? (
      <GitPanel />
    ) : activeView === "settings" ? (
      <SettingsPanel />
    ) : (
      <ExplorerPanel />
    );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <TopBar onSave={onSave} onCommandPalette={() => setPaletteOpen(true)} />

      <div className="flex min-h-0 flex-1">
        <ActivityBar />

        <Group
          orientation="horizontal"
          id="astra-h"
          className="min-w-0 flex-1"
          defaultLayout={hLayout.defaultLayout}
          onLayoutChanged={hLayout.onLayoutChanged}
        >
          {sidebarOpen && (
            <>
              <Panel id="sidebar" defaultSize="20" minSize="14" maxSize="34">
                <div className="h-full border-r border-border bg-sidebar">{sidebar}</div>
              </Panel>
              <Separator className="astra-resize-h" />
            </>
          )}

          <Panel id="main" minSize="30">
            <Group
              orientation="vertical"
              id="astra-v"
              className="h-full"
              defaultLayout={vLayout.defaultLayout}
              onLayoutChanged={vLayout.onLayoutChanged}
            >
              <Panel id="editor" minSize="20">
                <EditorArea
                  onSave={onSave}
                  onQuickOpen={onQuickOpen}
                  onFocusChat={onFocusChat}
                />
              </Panel>
              {terminalVisible && (
                <>
                  <Separator className="astra-resize-v" />
                  <Panel id="terminal" defaultSize="30" minSize="10">
                    <TerminalPanel />
                  </Panel>
                </>
              )}
            </Group>
          </Panel>

          <Separator className="astra-resize-h" />
          <Panel id="chat" defaultSize="24" minSize="16" maxSize="40">
            <AiChatPanel ref={chatRef} />
          </Panel>
        </Group>
      </div>

      <StatusBar branch={git?.branch ?? "main"} />

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onCommand={handleCommand}
      />
    </div>
  );
}
