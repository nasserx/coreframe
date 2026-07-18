import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/*
 * The vertical rhythm scale (docs/LAYOUT.md). Steps are named after the
 * relationship between siblings, not a size, so the choice is a decision
 * rather than a per-page guess. Values sit on Tailwind's default spacing
 * scale — spacing itself stays Tailwind's contract.
 */
export const stackVariants = cva("flex flex-col", {
  variants: {
    gap: {
      /** Lines of one text lockup (a title and its description). */
      xs: "gap-1",
      /** Tightly related items: a label cluster, grouped controls. */
      sm: "gap-2",
      /** Sibling blocks within one section. The default. */
      md: "gap-4",
      /** Distinct groups of blocks inside a section. */
      lg: "gap-8",
      /** Page-level sections. */
      xl: "gap-12",
    },
  },
  defaultVariants: {
    gap: "md",
  },
});

export type StackProps = ComponentProps<"div"> & VariantProps<typeof stackVariants>;

/**
 * Vertical rhythm primitive: stacks children with one of the five named
 * rhythm steps (docs/LAYOUT.md) instead of an ad-hoc `gap-*` value. Rows,
 * grids, and one-off alignment stay plain Tailwind — Stack exists to make
 * vertical spacing a named decision, not to wrap flexbox.
 *
 * For semantic elements (`section`, `header`, …), apply `stackVariants`
 * to the element directly instead of nesting a div.
 *
 * Accessibility: a generic container with no implicit role.
 *
 * Constraints: UI-only and domain-neutral; it owns vertical rhythm, nothing
 * else. Not part of the shadcn registry (no official implementation exists).
 */
export function Stack({ className, gap = "md", ...props }: StackProps) {
  return <div data-slot="stack" className={cn(stackVariants({ gap, className }))} {...props} />;
}
