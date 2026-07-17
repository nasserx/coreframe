/**
 * Typography tokens for type families.
 *
 * Font sizes, weights, and line heights are owned by the Tailwind default
 * theme and consumed through utilities; they are intentionally not duplicated
 * here. Family values reference the font variables registered by the root
 * layout via `next/font`.
 */
export const TYPOGRAPHY = {
  fontFamilies: {
    sans: "var(--font-geist-sans)",
    mono: "var(--font-geist-mono)",
  },
} as const;

export type Typography = typeof TYPOGRAPHY;
export type FontFamilyToken = keyof Typography["fontFamilies"];
