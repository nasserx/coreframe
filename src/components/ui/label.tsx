import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type LabelProps = ComponentProps<"label">;

/**
 * Caption primitive rendered as a native `<label>`.
 *
 * Accessibility: native label semantics — associate it with a control via
 * `htmlFor` (or by nesting the control) so the control receives an
 * accessible name and click-to-focus behavior. Styling reflects a disabled
 * sibling control (`peer-disabled:`) or group (`group-data-[disabled=true]:`).
 *
 * Constraints: UI-only — no form state, no validation, no required/optional
 * indicators; those belong to future field-level composition.
 */
export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
