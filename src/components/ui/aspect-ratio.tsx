import type { ComponentProps, CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type AspectRatioProps = ComponentProps<"div"> & { ratio: number };

/**
 * Layout primitive that constrains its content to a fixed width/height
 * ratio (e.g. `ratio={16 / 9}`) via the CSS `aspect-ratio` property.
 *
 * Accessibility: a generic container with no implicit role; it does not
 * affect the semantics of its content.
 *
 * Constraints: UI-only — `ratio` is required and purely visual; media
 * fitting (e.g. `object-cover`) belongs to the consumer's content.
 */
export function AspectRatio({ ratio, className, style, ...props }: AspectRatioProps) {
  return (
    <div
      data-slot="aspect-ratio"
      style={{ "--ratio": ratio, ...style } as CSSProperties}
      className={cn("relative aspect-(--ratio)", className)}
      {...props}
    />
  );
}
