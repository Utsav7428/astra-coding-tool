/** Maps a file path to a Monaco language id. */
const BY_EXT: Record<string, string> = {
  java: "java",
  kt: "kotlin",
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  json: "json",
  md: "markdown",
  html: "html",
  css: "css",
  scss: "scss",
  py: "python",
  go: "go",
  rs: "rust",
  sql: "sql",
  sh: "shell",
  yml: "yaml",
  yaml: "yaml",
  xml: "xml",
  properties: "ini",
  gradle: "groovy",
  c: "c",
  h: "c",
  cpp: "cpp",
  cs: "csharp",
  rb: "ruby",
  php: "php",
};

export function languageForPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return BY_EXT[ext] ?? "plaintext";
}

export function basename(path: string): string {
  return path.split(/[\\/]/).filter(Boolean).pop() ?? path;
}

export function dirname(path: string): string {
  const parts = path.split(/[\\/]/);
  parts.pop();
  return parts.join("/") || "/";
}