import { MOCK_WORKSPACE as MOCK, delay, request } from "./http";
import { mockTree } from "./mock-data";
import { basename, languageForPath } from "@/lib/language";
import type { FileNode } from "@/types";

/** Wire shape returned by the Spring Boot backend (`FileNodeResponse`). */
interface FileNodeResponse {
  name: string;
  path: string;
  directory: boolean;
  children?: FileNodeResponse[];
}

/**
 * The backend emits an absolute path for the root node but paths relative to
 * the root (forward-slashed) for every child, while /api/files works only with
 * absolute paths. So we re-absolutise children against the root here.
 */
function joinPath(root: string, relative: string): string {
  const sep = root.includes("\\") && !root.includes("/") ? "\\" : "/";
  const normalized = sep === "\\" ? relative.replace(/\//g, "\\") : relative;
  return `${root.replace(/[\\/]+$/, "")}${sep}${normalized}`;
}

function isAbsolutePath(path: string): boolean {
  return path.startsWith("/") || /^[a-zA-Z]:[\\/]/.test(path) || path.startsWith("\\\\");
}

/** Backend identity is the absolute path, so the tree uses `path` as the node id. */
export function toFileNode(node: FileNodeResponse, root?: string): FileNode {
  const name = node.name || basename(node.path);
  const absolute =
    root && !isAbsolutePath(node.path) ? joinPath(root, node.path) : node.path;
  const nextRoot = root ?? absolute;
  return {
    id: absolute,
    name,
    path: absolute,
    type: node.directory ? "folder" : "file",
    ...(node.directory ? {} : { language: languageForPath(name) }),
    ...(node.directory
      ? { children: (node.children ?? []).map((child) => toFileNode(child, nextRoot)) }
      : {}),
  };
}

export const workspaceService = {
  /** POST /api/workspaces/open — binds the backend to a folder and returns its tree. */
  async openWorkspace(path: string): Promise<FileNode> {
    if (MOCK) {
      await delay(220);
      return mockTree;
    }
    const root = await request<FileNodeResponse>("/api/workspaces/open", {
      method: "POST",
      body: JSON.stringify({ path }),
    });
    return toFileNode(root);
  },

  /** The backend only returns the tree from /open, so refreshing re-opens the root. */
  async getTree(rootPath: string): Promise<FileNode> {
    return this.openWorkspace(rootPath);
  },

  /** POST /api/files */
  async createFile(parentPath: string, name: string): Promise<void> {
    if (MOCK) return void (await delay(120));
    await request("/api/files", {
      method: "POST",
      body: JSON.stringify({ parentPath, name, directory: false }),
    });
  },

  /** POST /api/files with directory=true */
  async createFolder(parentPath: string, name: string): Promise<void> {
    if (MOCK) return void (await delay(120));
    await request("/api/files", {
      method: "POST",
      body: JSON.stringify({ parentPath, name, directory: true }),
    });
  },

  /** PATCH /api/files/rename */
  async rename(path: string, newName: string): Promise<void> {
    if (MOCK) return void (await delay(120));
    await request("/api/files/rename", {
      method: "PATCH",
      body: JSON.stringify({ path, newName }),
    });
  },

  /** DELETE /api/files */
  async remove(path: string): Promise<void> {
    if (MOCK) return void (await delay(120));
    await request("/api/files", { method: "DELETE", body: JSON.stringify({ path }) });
  },
};