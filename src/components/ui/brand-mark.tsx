import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type BrandMarkProps = ComponentProps<"svg">;

/*
 * Coreframe mark geometry, shared with the static favicon glyph in
 * src/app/icon.svg. One nonzero path avoids <mask>/<defs> ids because shell
 * navigation content can render in both persistent and drawer surfaces.
 * Integer coordinates on a 24-unit grid keep the three filled modules crisp
 * at 16, 24, and 32px; the broad forms remain stable at intermediate sizes.
 */
const BRAND_MARK_PATH = "M3 3h9v3H6v6H3V3Z" + "M18 12h3v9h-9v-3h6v-6Z" + "M9 9h6v6H9V9Z";

/**
 * The Coreframe mark: two opposing open structural corners around a replaceable
 * central module. The rotationally balanced mark carries no reading direction
 * and stays fixed under RTL. It fills with `currentColor` and owns
 * `text-primary` by default, so every foundation identity lockup follows the
 * approved cobalt pair without theme logic or per-shell color duplication.
 *
 * Accessibility: decorative by default (`aria-hidden`); a brand lockup's
 * accessible name belongs to the adjacent text or the wrapping link. Pass
 * `aria-hidden={false}` plus `role="img"` and `aria-label` only if the
 * mark ever stands alone.
 *
 * Constraints: UI-only. A product replaces the path (and src/app/icon.svg,
 * which shares this geometry) with its own mark — docs/DESIGN_TOKENS.md §4.
 */
export function BrandMark({ className, ...props }: BrandMarkProps) {
  return (
    <svg
      data-slot="brand-mark"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("size-5 shrink-0 text-primary", className)}
      {...props}
    >
      <path fill="currentColor" fillRule="nonzero" d={BRAND_MARK_PATH} />
    </svg>
  );
}
