import ReactMarkdown from "react-markdown";
import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

function CodeBlock({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const text = String(children ?? "");

  return (
    <div className="group relative my-2 overflow-hidden rounded-lg border border-border bg-surface">
      <button
        onClick={() => {
          void navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="absolute right-1.5 top-1.5 rounded-md border border-border bg-panel p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </button>
      <pre className="overflow-x-auto p-3 font-mono text-[12px] leading-relaxed">{children}</pre>
    </div>
  );
}

export function Markdown({ content }: { content: string }) {
  return (
    <div className="text-[13px] leading-relaxed text-foreground/90">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
          a: ({ children, href }) => (
            <a href={href} className="text-primary underline underline-offset-2">
              {children}
            </a>
          ),
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          code: ({ className, children }) => (
            <code
              className={cn(
                className,
                !className &&
                  "rounded bg-surface px-1 py-0.5 font-mono text-[12px] text-primary",
              )}
            >
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}