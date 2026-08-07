import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { terminalService } from "@/services/terminal.service";
import { useTerminalStore } from "@/store/terminal.store";
import { useSettingsStore } from "@/store/settings.store";

export function XtermView() {
  const hostRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const { setStatus, reconnectToken, clearToken } = useTerminalStore();
  const fontSize = useSettingsStore((s) => s.fontSize);

  useEffect(() => {
    if (!hostRef.current) return;

    const term = new Terminal({
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      fontSize: Math.max(11, fontSize - 1),
      cursorBlink: true,
      convertEol: true,
      theme: {
        background: "#0c0e12",
        foreground: "#d5dae3",
        cursor: "#5b9dff",
        selectionBackground: "#2a3446",
      },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(hostRef.current);
    termRef.current = term;

    const safeFit = () => {
      try {
        fit.fit();
      } catch {
        /* container not measurable yet */
      }
    };
    safeFit();

    const connection = terminalService.connect({
      onData: (chunk) => term.write(chunk),
      onStatus: setStatus,
    });
    const dataSub = term.onData((data) => connection.send(data));

    const observer = new ResizeObserver(safeFit);
    observer.observe(hostRef.current);

    return () => {
      observer.disconnect();
      dataSub.dispose();
      connection.dispose();
      term.dispose();
      termRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reconnectToken]);

  useEffect(() => {
    if (clearToken) termRef.current?.clear();
  }, [clearToken]);

  useEffect(() => {
    if (termRef.current) termRef.current.options.fontSize = Math.max(11, fontSize - 1);
  }, [fontSize]);

  return <div ref={hostRef} className="h-full w-full px-2 pb-1" />;
}