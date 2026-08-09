import { MOCK_EDITOR as MOCK, delay, request } from "./http";
import { mockFileContents, mockTree } from "./mock-data";
import { basename, languageForPath } from "@/lib/language";
import type { FileContent, FileNode } from "@/types";

function findNode(node: FileNode, id: string): FileNode | undefined {
  if (node.id === id) return node;
  for (const child of node.children ?? []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return undefined;
}

interface ReadFileResponse {
  path: string;
  content: string;
}

export const editorService = {
  /** GET /api/files?path= — the backend keys files by absolute path. */
  async getFile(path: string): Promise<FileContent> {
    if (MOCK) {
      await delay(260);
      const node = findNode(mockTree, path);
      if (!node) throw new Error(`File ${path} not found`);
      return {
        id: path,
        name: node.name,
        path: node.path,
        language: node.language ?? "plaintext",
        content: mockFileContents[path] ?? `// ${node.path}\n`,
        readonly: false,
      };
    }
    const res = await request<ReadFileResponse>(`/api/files?path=${encodeURIComponent(path)}`);
    return {
      id: res.path ?? path,
      name: basename(res.path ?? path),
      path: res.path ?? path,
      language: languageForPath(res.path ?? path),
      content: res.content ?? "",
      readonly: false,
    };
  },

  /** PUT /api/files */
  async saveFile(path: string, content: string): Promise<void> {
    if (MOCK) {
      await delay(320);
      mockFileContents[path] = content;
      return;
    }
    await request("/api/files", { method: "PUT", body: JSON.stringify({ path, content }) });
  },

  /** POST /api/autocomplete */
  async complete(payload: {
    filePath: string;
    line: number;
    column: number;
    prefix: string;
    suffix: string;
  }, signal?: AbortSignal): Promise<string> {
    if (MOCK) return "";
    const res = await request<{ completion: string }>("/api/autocomplete", {
      method: "POST",
      body: JSON.stringify(payload),
      signal: signal ?? null,
    });
    return res?.completion ?? "";
  },

  /** POST /api/quick-edit */
  async quickEdit(payload: {
    filePath: string;
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    instruction: string;
  }): Promise<QuickEditResult> {
    return request<QuickEditResult>("/api/quick-edit", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** POST /api/quick-edit/apply — writes the accepted edit to disk. */
  async applyQuickEdit(filePath: string, originalCode: string, modifiedCode: string): Promise<void> {
    await request("/api/quick-edit/apply", {
      method: "POST",
      body: JSON.stringify({ filePath, originalCode, modifiedCode }),
    });
  },
};

export interface QuickEditResult {
  filePath: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  originalCode: string;
  modifiedCode: string;
  diff: string;
}