import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";

import { cn } from "@/lib/utils";

export type SeparatorProps = SeparatorPrimitive.Props;

/**
 * Visual divider primitive between content regions (Base UI).
 *
 * Accessibility: renders `role="separator"` with the correct
 * `aria-orientation`; `orientation` defaults to `"horizontal"`.
 *
 * Constraints: UI-only and purely presentational — thickness and color are
 * fixed to the semantic border token; spacing belongs to the consumer.
 */
export function Separator({ className, ...props }: SeparatorProps) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className,
      )}
      {...props}
    />
  );
}
