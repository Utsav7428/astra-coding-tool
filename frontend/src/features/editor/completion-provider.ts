import type { Monaco } from "@monaco-editor/react";
import type { CancellationToken, editor, Position } from "monaco-editor";
import { editorService } from "@/services/editor.service";

let disposable: { dispose: () => void } | null = null;

/**
 * Registers a single inline-completion provider backed by POST /api/autocomplete.
 * Requests are debounced and cancelled with the editor's cancellation token.
 */
export function registerAstraCompletions(monaco: Monaco) {
  disposable?.dispose();

  let timer: ReturnType<typeof setTimeout> | null = null;

  disposable = monaco.languages.registerInlineCompletionsProvider(
    { pattern: "**" },
    {
      async provideInlineCompletions(
        model: editor.ITextModel,
        position: Position,
        _context: unknown,
        token: CancellationToken,
      ) {
        if (timer) clearTimeout(timer);
        await new Promise<void>((resolve) => {
          timer = setTimeout(resolve, 300);
        });
        if (token.isCancellationRequested) return { items: [] };

        const offset = model.getOffsetAt(position);
        const full = model.getValue();
        const filePath = model.uri.path.replace(/^\//, "");

        try {
          const completion = await editorService.complete({
            filePath,
            line: position.lineNumber,
            column: position.column,
            prefix: full.slice(Math.max(0, offset - 4000), offset),
            suffix: full.slice(offset, offset + 2000),
          });
          if (!completion || token.isCancellationRequested) return { items: [] };
          return {
            items: [
              {
                insertText: completion,
                range: new monaco.Range(
                  position.lineNumber,
                  position.column,
                  position.lineNumber,
                  position.column,
                ),
              },
            ],
          };
        } catch {
          return { items: [] };
        }
      },
      freeInlineCompletions() {
        /* nothing to release */
      },
    },
  );

  return disposable;
}