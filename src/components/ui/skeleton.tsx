import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type SkeletonProps = ComponentProps<"div">;

/**
 * Loading placeholder primitive that reserves space for pending content.
 *
 * Accessibility: purely decorative — it exposes no role or label and is
 * skipped by assistive technologies. Communicate the pending state on the
 * surrounding region (e.g. `aria-busy`) at the call site.
 *
 * Constraints: UI-only — shape and size come from the consumer via
 * `className`; it owns no data fetching and renders no content.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}
