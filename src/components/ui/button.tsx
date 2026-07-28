import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  // Focus language (docs/DESIGN_TOKENS.md §2): a solid 2px ring-token line,
  // offset by 2px of background so it reads against any fill (including the
  // primary, which intentionally shares the ring color). Invalid = a
  // destructive hairline border; focused AND invalid = the focus geometry in
  // the destructive color, so thickness says "focused" and color says
  // "invalid".
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-[color,background-color,border-color,box-shadow,translate] outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover hover:not-aria-[haspopup]:-translate-y-0.5 focus-visible:not-aria-[haspopup]:-translate-y-0.5 motion-reduce:hover:not-aria-[haspopup]:translate-none motion-reduce:focus-visible:not-aria-[haspopup]:translate-none",
        // Outline, ghost and secondary all sit ON the page in both themes —
        // the flat identity defines them by border (outline) or a quiet
        // in-plane fill (secondary), never a fill lighter than the page that
        // reads as a raised chip. Outline's border is DECORATIVE, not a
        // control boundary: the visible text label identifies the control, so
        // WCAG 1.4.11 does not require the edge to meet 3:1 (that clause
        // applies only to information "required to identify" a component — an
        // empty input has nothing but its edge, a labelled button has its
        // label). So it uses the `border` hairline in BOTH themes; the earlier
        // dark override to the 3:1 `input` band read as a lit edge, not a quiet
        // one. Hover lifts to `accent` (perceptible against paper and charcoal).
        outline:
          "border-border bg-background hover:bg-accent hover:text-accent-foreground hover:not-aria-[haspopup]:-translate-y-0.5 focus-visible:not-aria-[haspopup]:-translate-y-0.5 aria-expanded:bg-accent aria-expanded:text-accent-foreground motion-reduce:hover:not-aria-[haspopup]:translate-none motion-reduce:focus-visible:not-aria-[haspopup]:translate-none",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground",
        ghost:
          "hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground",
        // Tint alphas are contrast-bound on the lifted charcoal surface: dark
        // rests at /15 (not /20) and both themes hover to /18 — the ceiling
        // that keeps destructive text over its own tint at 4.5:1
        // (docs/DESIGN_TOKENS.md §3).
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/18 dark:bg-destructive/15",
        link: "text-link underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 gap-2 px-3 py-1.5",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-2 px-2.5 text-xs in-data-[slot=button-group]:rounded-lg",
        lg: "h-9 gap-2 px-6",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>;

/**
 * Action-triggering primitive rendered as a native `<button>` (Base UI).
 *
 * Accessibility: native button semantics, keyboard activation, and visible
 * focus ring come from the underlying element; `disabled` and `aria-invalid`
 * states are styled and remain exposed to assistive technologies. Use
 * `render` (Base UI) to change the rendered element while keeping behavior.
 *
 * Constraints: UI-only — no loading/async ownership, no business logic.
 * Variants and sizes are the official shadcn set; do not extend per-product.
 *
 * Slot contract: `data-slot="button"` labels the default `<button>` element
 * only. When `render` replaces the element, slot identity belongs to the
 * caller's render element, so Button deliberately stamps nothing — setting
 * it on both sides is a hydration hazard: props of a render element that
 * crossed a server→client boundary arrive as a React lazy element on the
 * client and are dropped from Base UI's prop merge, so any key set on both
 * sides resolves differently on server and client (docs/UI_LIBRARY.md §7).
 */
export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot={props.render === undefined ? "button" : undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
