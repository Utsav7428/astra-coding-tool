import { MOCK, delay, request } from "./http";
import { mockFileContents, mockTree } from "./mock-data";
import type { FileContent, FileNode } from "@/types";

function findNode(node: FileNode, id: string): FileNode | undefined {
  if (node.id === id) return node;
  for (const child of node.children ?? []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return undefined;
}

export const editorService = {
  /** GET /api/files/{id} */
  async getFile(id: string): Promise<FileContent> {
    if (MOCK) {
      await delay(260);
      const node = findNode(mockTree, id);
      if (!node) throw new Error(`File ${id} not found`);
      return {
        id,
        name: node.name,
        path: node.path,
        language: node.language ?? "plaintext",
        content: mockFileContents[id] ?? `// ${node.path}\n`,
        readonly: false,
      };
    }
    return request<FileContent>(`/api/files/${id}`);
  },

  /** PUT /api/files/{id} */
  async saveFile(id: string, content: string): Promise<void> {
    if (MOCK) {
      await delay(320);
      mockFileContents[id] = content;
      return;
    }
    await request(`/api/files/${id}`, { method: "PUT", body: JSON.stringify({ content }) });
  },
};