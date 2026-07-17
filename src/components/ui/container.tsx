import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type ContainerProps = ComponentProps<"div">;

/**
 * Page-width layout primitive: centers content with a consistent maximum
 * width and horizontal gutter so pages share one reading measure. Override
 * the width per use with a `max-w-*` class when a surface genuinely needs
 * a different measure.
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
      className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}
      {...props}
    />
  );
}
