import {
  Braces,
  FileCode2,
  FileJson,
  FileText,
  FileType,
  Coffee,
  Palette,
} from "lucide-react";

export function FileIcon({ name, className }: { name: string; className?: string }) {
  const ext = name.split(".").pop()?.toLowerCase();
  const Icon =
    ext === "ts" || ext === "tsx"
      ? FileCode2
      : ext === "js" || ext === "jsx"
        ? Braces
        : ext === "json"
          ? FileJson
          : ext === "css"
            ? Palette
            : ext === "java"
              ? Coffee
              : ext === "md"
                ? FileText
                : FileType;
  return <Icon className={className} />;
}