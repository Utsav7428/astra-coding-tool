import type { ReactNode } from "react";

export function PanelHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string | undefined;
  children?: ReactNode;
}) {
  return (
    <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-2.5">
      <div className="flex min-w-0 items-baseline gap-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </h2>
        {subtitle && <span className="truncate text-[11px] text-muted-foreground/70">{subtitle}</span>}
      </div>
      <div className="flex items-center gap-0.5">{children}</div>
    </div>
  );
}