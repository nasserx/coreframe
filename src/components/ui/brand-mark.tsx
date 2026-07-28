import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type BrandMarkProps = ComponentProps<"svg">;

/*
 * Geometry shared with the favicon (src/app/icon.svg) — keep the two in
 * sync. One nonzero path (no <mask>/<defs> ids: shell navigation content
 * renders twice — persistent sidebar + drawer — and duplicate SVG ids
 * would collide): a rounded square with two same-color text-line bars,
 * an abstract shorthand for a typographic, editorial identity.
 */
const BRAND_MARK_PATH =
  "M14 0h36a14 14 0 0 1 14 14v36a14 14 0 0 1-14 14H14A14 14 0 0 1 0 50V14A14 14 0 0 1 14 0Z" +
  "M20.5 21h23a4.5 4.5 0 0 1 0 9h-23a4.5 4.5 0 0 1 0-9Z" +
  "M20.5 36h12a4.5 4.5 0 0 1 0 9h-12a4.5 4.5 0 0 1 0-9Z";

/**
 * The foundation's brand mark: a flat, single-color rounded square with an
 * abstract two-bar glyph, legible from 16px up. Fills with `currentColor` and
 * owns `text-primary` by default, so every foundation identity lockup follows
 * the approved clear-blue pair without theme logic or per-shell color
 * duplication.
 *
 * Accessibility: decorative by default (`aria-hidden`); a brand lockup's
 * accessible name belongs to the adjacent text or the wrapping link. Pass
 * `aria-hidden={false}` plus `role="img"` and `aria-label` only if the
 * mark ever stands alone.
 *
 * Direction: brand marks do not mirror — the glyph stays fixed under RTL,
 * as wordmarks and logos conventionally do.
 *
 * Constraints: UI-only. A product replaces the path (and src/app/icon.svg,
 * which shares this geometry) with its own mark — docs/DESIGN_TOKENS.md §4.
 */
export function BrandMark({ className, ...props }: BrandMarkProps) {
  return (
    <svg
      data-slot="brand-mark"
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cn("size-5 shrink-0 text-primary", className)}
      {...props}
    >
      <path fill="currentColor" fillRule="nonzero" d={BRAND_MARK_PATH} />
    </svg>
  );
}
