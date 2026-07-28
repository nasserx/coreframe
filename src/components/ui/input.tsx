import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

export type InputProps = InputPrimitive.Props;

/**
 * Text entry primitive rendered as a native `<input>` (Base UI).
 *
 * Accessibility: native input semantics and keyboard behavior come from the
 * underlying element; visible focus ring, `disabled`, and `aria-invalid`
 * states are styled and remain exposed to assistive technologies. Consumers
 * own labelling — associate a `<label>` or `aria-label` at the call site.
 *
 * Constraints: UI-only — no validation rules, no form state, no business
 * logic. Invalid presentation is driven solely by `aria-invalid`.
 */
export function Input({ className, ...props }: InputProps) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(
        // Focus: the border turns to the ring token plus an attached 1px
        // ring — a crisp 2px ink line at the control edge, the flat
        // hairline language (no translucent halo). Invalid: a 1px
        // destructive hairline (FieldError text + aria-invalid carry the
        // state beyond color). Focused AND invalid: the 2px focus
        // geometry in the destructive color — thickness says "focused",
        // color says "invalid" (docs/DESIGN_TOKENS.md §2).
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive md:text-sm dark:bg-input/30 dark:disabled:bg-input/80",
        className,
      )}
      {...props}
    />
  );
}
