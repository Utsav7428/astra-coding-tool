import { TERMINAL_WS_URL, MOCK_TERMINAL as MOCK } from "./http";

export interface TerminalConnection {
  send: (data: string) => void;
  dispose: () => void;
}

export interface TerminalHandlers {
  onData: (chunk: string) => void;
  onStatus: (status: "connecting" | "connected" | "offline") => void;
}

const BANNER = [
  "\x1b[38;5;39mASTRA terminal\x1b[0m  \x1b[2m(mock session — backend not connected)\x1b[0m",
  "\x1b[2mConnect a Spring Boot WebSocket at " + TERMINAL_WS_URL + "\x1b[0m",
  "",
];

const MOCK_RESPONSES: Record<string, string[]> = {
  help: ["Available: help, ls, git status, npm run dev, clear"],
  ls: ["\x1b[38;5;39msrc\x1b[0m  \x1b[38;5;39mserver\x1b[0m  README.md  package.json"],
  "git status": [
    "On branch \x1b[38;5;114mmain\x1b[0m",
    "Changes not staged for commit:",
    "  \x1b[38;5;209mmodified:   src/components/Button.tsx\x1b[0m",
    "  \x1b[38;5;209mmodified:   src/main.tsx\x1b[0m",
  ],
  "npm run dev": [
    "> astra-workspace@0.1.0 dev",
    "\x1b[38;5;114mVITE ready\x1b[0m in 214 ms",
    "  ➜  Local:   http://localhost:5173/",
  ],
};

export const terminalService = {
  /** ws://localhost:8080/ws/terminal */
  connect(handlers: TerminalHandlers): TerminalConnection {
    if (MOCK) {
      handlers.onStatus("connecting");
      let buffer = "";
      const prompt = () => handlers.onData("\r\n\x1b[38;5;39mastra\x1b[0m:\x1b[2m~\x1b[0m$ ");
      const timer = setTimeout(() => {
        handlers.onStatus("connected");
        BANNER.forEach((line) => handlers.onData(line + "\r\n"));
        prompt();
      }, 400);

      return {
        send(data: string) {
          if (data === "\r") {
            const cmd = buffer.trim();
            buffer = "";
            handlers.onData("\r\n");
            if (cmd) {
              const out = MOCK_RESPONSES[cmd] ?? [
                `astra: command not found: ${cmd} (try "help")`,
              ];
              out.forEach((line) => handlers.onData(line + "\r\n"));
            }
            prompt();
            return;
          }
          if (data === "\u007f") {
            if (buffer.length) {
              buffer = buffer.slice(0, -1);
              handlers.onData("\b \b");
            }
            return;
          }
          if (data < " ") return;
          buffer += data;
          handlers.onData(data);
        },
        dispose() {
          clearTimeout(timer);
          handlers.onStatus("offline");
        },
      };
    }

    handlers.onStatus("connecting");
    const socket = new WebSocket(TERMINAL_WS_URL);
    socket.onopen = () => handlers.onStatus("connected");
    socket.onclose = () => handlers.onStatus("offline");
    socket.onerror = () => handlers.onStatus("offline");
    socket.onmessage = (event) => handlers.onData(String(event.data));

    return {
      send: (data) => socket.readyState === WebSocket.OPEN && socket.send(data),
      dispose: () => socket.close(),
    };
  },
};