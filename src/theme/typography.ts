/**
 * Typography tokens for type families, weights, sizes, and line heights.
 */
export const TYPOGRAPHY = {
  fontFamilies: {
    sans: "var(--font-geist-sans)",
    mono: "var(--font-geist-mono)",
  },
  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
  lineHeights: {
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
  },
} as const;

export type Typography = typeof TYPOGRAPHY;
export type FontFamilyToken = keyof Typography["fontFamilies"];
export type FontWeightToken = keyof Typography["fontWeights"];
export type FontSizeToken = keyof Typography["fontSizes"];
export type LineHeightToken = keyof Typography["lineHeights"];
