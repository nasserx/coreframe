import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = ComponentProps<"textarea">;

/**
 * Multi-line text entry primitive rendered as a native `<textarea>`.
 *
 * Accessibility: native textarea semantics and keyboard behavior come from
 * the underlying element; visible focus ring, `disabled`, and `aria-invalid`
 * states are styled and remain exposed to assistive technologies. Consumers
 * own labelling — associate a `<label>` or `aria-label` at the call site.
 *
 * Constraints: UI-only — no validation rules, no form state, no business
 * logic. Invalid presentation is driven solely by `aria-invalid`. Grows with
 * content (`field-sizing-content`) from a minimum height.
 */
export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Same focus/invalid language as Input: 2px attached ink line on
        // focus, 1px destructive hairline when invalid, destructive-colored
        // focus geometry when both (docs/DESIGN_TOKENS.md §2).
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive md:text-sm dark:bg-input/30 dark:disabled:bg-input/80",
        className,
      )}
      {...props}
    />
  );
}
