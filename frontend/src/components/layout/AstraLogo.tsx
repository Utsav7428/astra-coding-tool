import { cn } from "@/lib/utils";

/** ASTRA identity mark — an orbiting "A" glyph. */
export function AstraLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("text-primary", className)} aria-hidden="true">
      <defs>
        <linearGradient id="astra-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#astra-grad)" opacity="0.16" />
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="9"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.4"
      />
      <path
        d="M9.5 23 16 8.5 22.5 23"
        fill="none"
        stroke="url(#astra-grad)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.4 18.4h7.2"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.75"
      />
      <circle cx="25" cy="7.5" r="2.2" fill="currentColor" />
    </svg>
  );
}