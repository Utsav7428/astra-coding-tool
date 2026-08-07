import { useEffect } from "react";

export interface ShortcutHandlers {
  onSave: () => void;
  onQuickOpen: () => void;
  onFocusChat: () => void;
  onCommandPalette: () => void;
  onToggleTerminal: () => void;
  onToggleSidebar: () => void;
}

/** Global IDE keybindings (Ctrl/Cmd based). */
export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;
      if (!mod) return;
      const key = event.key.toLowerCase();

      if (event.shiftKey && key === "p") {
        event.preventDefault();
        handlers.onCommandPalette();
        return;
      }
      switch (key) {
        case "s":
          event.preventDefault();
          handlers.onSave();
          break;
        case "p":
          event.preventDefault();
          handlers.onQuickOpen();
          break;
        case "k":
          event.preventDefault();
          handlers.onFocusChat();
          break;
        case "b":
          event.preventDefault();
          handlers.onToggleSidebar();
          break;
        case "`":
          event.preventDefault();
          handlers.onToggleTerminal();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}