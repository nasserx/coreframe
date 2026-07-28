import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type ContainerProps = ComponentProps<"div">;

/**
 * Page-width layout primitive: centers content with a consistent maximum
 * width and horizontal gutter. Override the width per use with a `max-w-*`
 * class when a surface genuinely needs a different cap.
 *
 * The cap (`max-w-7xl`, 1280px) sizes the dense surfaces — card grids,
 * tables, data — that reach the container edges, while keeping content
 * comfortably centred on wide displays. It is NOT a reading measure:
 * running prose inside a Container must carry its own `max-w-prose` cap
 * (docs/LAYOUT.md §2); text left to fill the container violates the measure
 * contract.
 *
 * Gutters follow one responsive contract: `px-4` (16px) below `sm`,
 * `px-6` (24px) from `sm`, and `px-8` (32px) from `lg`. Padding is
 * symmetric, so the same contract holds in LTR and RTL.
 *
 * Accessibility: a generic container with no implicit role; it does not
 * affect the semantics of its content.
 *
 * Constraints: UI-only and domain-neutral — no header/sidebar/shell
 * assumptions; it constrains width, nothing else. Not part of the shadcn
 * registry (no official implementation exists).
 */
export function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      data-slot="container"
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}
