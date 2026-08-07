import Editor, { type OnMount } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import { useCallback } from "react";
import { useEditorStore } from "@/store/editor.store";
import { useSettingsStore } from "@/store/settings.store";
import type { EditorTab } from "@/types";

interface MonacoPaneProps {
  tab: EditorTab;
  onSave: () => void;
  onQuickOpen: () => void;
  onFocusChat: () => void;
}

export function MonacoPane({ tab, onSave, onQuickOpen, onFocusChat }: MonacoPaneProps) {
  const updateContent = useEditorStore((s) => s.updateContent);
  const setCursor = useEditorStore((s) => s.setCursor);
  const settings = useSettingsStore();

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, onSave);
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, onQuickOpen);
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, onFocusChat);
      editor.onDidChangeCursorPosition((e) =>
        setCursor(e.position.lineNumber, e.position.column),
      );
    },
    [onSave, onQuickOpen, onFocusChat, setCursor],
  );

  return (
    <Editor
      path={tab.path}
      language={tab.language}
      value={tab.content}
      theme={settings.theme === "dark" ? "vs-dark" : "vs"}
      onMount={handleMount}
      onChange={(value) => updateContent(tab.id, value ?? "")}
      loading={
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading editor…
        </div>
      }
      options={{
        readOnly: tab.readonly,
        fontSize: settings.fontSize,
        tabSize: settings.tabSize,
        wordWrap: settings.wordWrap ? "on" : "off",
        minimap: { enabled: settings.minimap },
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontLigatures: true,
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        padding: { top: 14, bottom: 14 },
        scrollBeyondLastLine: false,
        renderLineHighlight: "all",
        automaticLayout: true,
        lineNumbersMinChars: 3,
        scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
      }}
    />
  );
}