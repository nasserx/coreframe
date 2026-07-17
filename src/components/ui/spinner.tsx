import type { ComponentProps } from "react";
import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

export type SpinnerProps = ComponentProps<"svg">;

/**
 * Indeterminate loading indicator primitive.
 *
 * Accessibility: announces as `role="status"` with a default "Loading"
 * label; override `aria-label` at the call site for context-specific text.
 *
 * Constraints: UI-only — draws with `currentColor` so it inherits the
 * surrounding text color; size via `className` (defaults to `size-4`). No
 * messages, overlays, or async ownership.
 */
export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}
