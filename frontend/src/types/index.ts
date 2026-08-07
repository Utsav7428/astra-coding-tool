export type FileNodeType = "file" | "folder";

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: FileNodeType;
  language?: string;
  children?: FileNode[];
}

export interface FileContent {
  id: string;
  path: string;
  name: string;
  language: string;
  content: string;
  readonly?: boolean;
}

export interface EditorTab {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  savedContent: string;
  readonly: boolean;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  streaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface AiModel {
  id: string;
  label: string;
  vendor: string;
}

export type SearchResultKind = "file" | "symbol" | "command";

export interface SearchResult {
  id: string;
  kind: SearchResultKind;
  label: string;
  detail?: string;
  path?: string;
}

export interface GitStatusEntry {
  path: string;
  status: "modified" | "added" | "deleted" | "untracked";
}

export type ConnectionStatus = "connected" | "connecting" | "offline";