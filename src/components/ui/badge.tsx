import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export type BadgeProps = useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export const badgeVariants = cva(
  // rounded-md, not the registry's pill: a full-round badge is a shape
  // decision that fights the flat identity's crisp radius scale, so badges
  // read as square-ish editorial tags. Focus (badges rendered as links):
  // the standard offset ink ring (docs/DESIGN_TOKENS.md §2).
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border border-transparent px-2 py-0.5 text-xs font-semibold whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary-hover",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-accent [a]:hover:text-accent-foreground",
        destructive:
          "bg-destructive/10 text-destructive dark:bg-destructive/15 [a]:hover:bg-destructive/18",
        outline:
          "border-border text-foreground [a]:hover:bg-accent [a]:hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-link underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/**
 * Status descriptor primitive rendered as an inline `<span>`. `variant`
 * carries semantic emphasis (default, secondary, destructive, outline,
 * ghost, link); use the `render` prop to output another element (e.g. an
 * anchor) while keeping badge styling.
 *
 * Accessibility: plain inline content with no implicit role — the text is
 * the accessible name; icon-only badges need accessible text at the call
 * site.
 *
 * Constraints: UI-only and domain-neutral — no counts, statuses, or
 * business meaning baked in; consumers supply content and semantics.
 */
export function Badge({ className, variant = "default", render, ...props }: BadgeProps) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}
