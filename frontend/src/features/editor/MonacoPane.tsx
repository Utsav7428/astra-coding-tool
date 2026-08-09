import Editor, { type OnMount } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { editor as MonacoEditorNs } from "monaco-editor";
import { useEditorStore } from "@/store/editor.store";
import { useSettingsStore } from "@/store/settings.store";
import { registerAstraCompletions } from "./completion-provider";
import { QuickEdit, type QuickEditSelection } from "./QuickEdit";
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
  const reveal = useEditorStore((s) => s.reveal);
  const setReveal = useEditorStore((s) => s.setReveal);
  const settings = useSettingsStore();
  const editorRef = useRef<MonacoEditorNs.IStandaloneCodeEditor | null>(null);
  const [quickEdit, setQuickEdit] = useState<QuickEditSelection | null>(null);

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      registerAstraCompletions(monaco);
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, onSave);
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, onQuickOpen);
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, onFocusChat);
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
        const selection = editor.getSelection();
        const model = editor.getModel();
        if (!selection || !model) return;
        setQuickEdit({
          filePath: model.uri.path.replace(/^\//, ""),
          startLine: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLine: selection.endLineNumber,
          endColumn: selection.endColumn,
        });
      });
      editor.onDidChangeCursorPosition((e) =>
        setCursor(e.position.lineNumber, e.position.column),
      );
    },
    [onSave, onQuickOpen, onFocusChat, setCursor],
  );

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !reveal || reveal.path !== tab.path) return;
    editor.revealLineInCenter(reveal.line);
    editor.setPosition({ lineNumber: reveal.line, column: reveal.column });
    editor.focus();
    setReveal(null);
  }, [reveal, tab.path, setReveal]);

  return (
    <>
    <QuickEdit
      selection={quickEdit}
      onOpenChange={(open) => (open ? null : setQuickEdit(null))}
      onApplied={(result) => {
        const model = editorRef.current?.getModel();
        if (!model) return;
        model.applyEdits([
          {
            range: {
              startLineNumber: result.startLine,
              startColumn: result.startColumn,
              endLineNumber: result.endLine,
              endColumn: result.endColumn,
            },
            text: result.modifiedCode,
          },
        ]);
        useEditorStore.getState().markSaved(tab.id);
      }}
    />
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
    </>
  );
}