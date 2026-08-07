import type { AiModel, FileNode, GitStatusEntry, SearchResult } from "@/types";

export const mockTree: FileNode = {
  id: "root",
  name: "astra-workspace",
  path: "/",
  type: "folder",
  children: [
    {
      id: "src",
      name: "src",
      path: "/src",
      type: "folder",
      children: [
        {
          id: "src-components",
          name: "components",
          path: "/src/components",
          type: "folder",
          children: [
            {
              id: "f-button",
              name: "Button.tsx",
              path: "/src/components/Button.tsx",
              type: "file",
              language: "typescript",
            },
            {
              id: "f-panel",
              name: "Panel.tsx",
              path: "/src/components/Panel.tsx",
              type: "file",
              language: "typescript",
            },
          ],
        },
        {
          id: "f-main",
          name: "main.tsx",
          path: "/src/main.tsx",
          type: "file",
          language: "typescript",
        },
        {
          id: "f-styles",
          name: "styles.css",
          path: "/src/styles.css",
          type: "file",
          language: "css",
        },
      ],
    },
    {
      id: "server",
      name: "server",
      path: "/server",
      type: "folder",
      children: [
        {
          id: "f-app-java",
          name: "AstraApplication.java",
          path: "/server/AstraApplication.java",
          type: "file",
          language: "java",
        },
      ],
    },
    {
      id: "f-readme",
      name: "README.md",
      path: "/README.md",
      type: "file",
      language: "markdown",
    },
    {
      id: "f-pkg",
      name: "package.json",
      path: "/package.json",
      type: "file",
      language: "json",
    },
  ],
};

export const mockFileContents: Record<string, string> = {
  "f-button": `import { forwardRef } from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", ...props }, ref) => {
    return <button ref={ref} data-variant={variant} {...props} />;
  },
);

Button.displayName = "Button";
`,
  "f-panel": `export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <header>{title}</header>
      <div>{children}</div>
    </section>
  );
}
`,
  "f-main": `import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);
`,
  "f-styles": `:root {
  --astra-bg: #0b0d12;
  --astra-fg: #e6e8ef;
}
`,
  "f-app-java": `package dev.astra;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AstraApplication {
    public static void main(String[] args) {
        SpringApplication.run(AstraApplication.class, args);
    }
}
`,
  "f-readme": `# ASTRA

Local-first AI IDE. The frontend talks to a Spring Boot backend over REST + WebSocket.

## Endpoints

- \`GET /api/workspaces/current/tree\`
- \`GET /api/files/{id}\`
- \`PUT /api/files/{id}\`
- \`POST /api/chat\`
- \`GET /api/chat/history\`
- \`ws://localhost:8080/ws/terminal\`
`,
  "f-pkg": `{
  "name": "astra-workspace",
  "private": true,
  "version": "0.1.0"
}
`,
};

export const mockModels: AiModel[] = [
  { id: "astra-fast", label: "Astra Fast", vendor: "Local" },
  { id: "astra-pro", label: "Astra Pro", vendor: "Local" },
  { id: "astra-reason", label: "Astra Reason", vendor: "Local" },
];

export const mockGitStatus: GitStatusEntry[] = [
  { path: "src/components/Button.tsx", status: "modified" },
  { path: "src/main.tsx", status: "modified" },
  { path: "server/AstraApplication.java", status: "added" },
  { path: "notes.todo", status: "untracked" },
];

export const mockCommands: SearchResult[] = [
  { id: "cmd-save", kind: "command", label: "File: Save", detail: "Ctrl+S" },
  { id: "cmd-quickopen", kind: "command", label: "Go to File", detail: "Ctrl+P" },
  { id: "cmd-chat", kind: "command", label: "Focus AI Assistant", detail: "Ctrl+K" },
  { id: "cmd-terminal", kind: "command", label: "Toggle Terminal", detail: "Ctrl+`" },
  { id: "cmd-clear-term", kind: "command", label: "Terminal: Clear" },
];

export const mockSymbols: SearchResult[] = [
  { id: "sym-button", kind: "symbol", label: "Button", detail: "src/components/Button.tsx" },
  { id: "sym-panel", kind: "symbol", label: "Panel", detail: "src/components/Panel.tsx" },
  { id: "sym-main", kind: "symbol", label: "createRoot", detail: "src/main.tsx" },
];