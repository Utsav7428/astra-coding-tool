import { MOCK, delay, request } from "./http";
import { mockGitStatus, mockTree } from "./mock-data";
import type { FileNode, GitStatusEntry } from "@/types";

export const workspaceService = {
  /** GET /api/workspaces/current/tree */
  async getTree(): Promise<FileNode> {
    if (MOCK) {
      await delay(220);
      return mockTree;
    }
    return request<FileNode>("/api/workspaces/current/tree");
  },

  /** GET /api/git/status */
  async getGitStatus(): Promise<{ branch: string; entries: GitStatusEntry[] }> {
    if (MOCK) {
      await delay(180);
      return { branch: "main", entries: mockGitStatus };
    }
    return request("/api/git/status");
  },

  /** POST /api/files — placeholder */
  async createFile(parentPath: string, name: string): Promise<void> {
    if (MOCK) return void (await delay(120));
    await request("/api/files", { method: "POST", body: JSON.stringify({ parentPath, name }) });
  },

  /** POST /api/folders — placeholder */
  async createFolder(parentPath: string, name: string): Promise<void> {
    if (MOCK) return void (await delay(120));
    await request("/api/folders", { method: "POST", body: JSON.stringify({ parentPath, name }) });
  },

  /** PATCH /api/files/{id} — placeholder */
  async rename(id: string, name: string): Promise<void> {
    if (MOCK) return void (await delay(120));
    await request(`/api/files/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });
  },

  /** DELETE /api/files/{id} — placeholder */
  async remove(id: string): Promise<void> {
    if (MOCK) return void (await delay(120));
    await request(`/api/files/${id}`, { method: "DELETE" });
  },
};