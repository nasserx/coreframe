"use client";

import { cn } from "@/lib/utils";

export type ErrorFallbackProps = Readonly<{
  title?: string;
  description?: string;
  actionLabel?: string;
  /** The recovery action: a boundary reset, Next's retry, or a reload. */
  onAction: () => void;
  /** Supplemental reference line, e.g. a server error digest for support. */
  detail?: string | undefined;
  /**
   * Overrides the container styling. The default fills the viewport
   * (`min-h-dvh`), which is correct for the route-level error files; a
   * fallback rendered inside a shell's main region overrides it (for
   * example `min-h-full` or a fixed block size) so it fills the region,
   * not the screen.
   */
  className?: string;
}>;

/**
 * The shared error-state presentation used by the core ErrorBoundary's
 * default fallback and the route-level error files (`src/app/error.tsx`,
 * `src/app/global-error.tsx`) — one look for "something broke", everywhere.
 *
 * Deliberately built from raw elements + semantic tokens: core must not
 * import `src/components` (enforced boundary), and global-error renders
 * without the provider tree, so this component may assume nothing beyond
 * the stylesheet. The type-ramp steps qualify — they are plain utilities from
 * `theme.css`, which `global-error.tsx` imports directly — so this page-level
 * surface speaks the ramp rather than the raw scale (docs/LAYOUT.md). Richer
 * fallbacks belong at the call site via the ErrorBoundary `fallback` prop.
 */
export function ErrorFallback({
  title = "Something went wrong.",
  description = "An unexpected error occurred. Try again, or reload the page if the problem persists.",
  actionLabel = "Try again",
  onAction,
  detail,
  className,
}: ErrorFallbackProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center",
        className,
      )}
    >
      <h2 className="text-body font-medium text-foreground">{title}</h2>
      <p className="max-w-prose text-small text-muted-foreground">{description}</p>
      {detail === undefined ? null : (
        <p className="text-caption text-muted-foreground/80">{detail}</p>
      )}
      <button
        type="button"
        onClick={onAction}
        className="mt-1 inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-small font-medium text-primary-foreground outline-none hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {actionLabel}
      </button>
    </div>
  );
}
