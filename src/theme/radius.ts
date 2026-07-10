/**
 * Border radius tokens for consistent shape language.
 */
export const RADIUS = {
  none: "0",
  xs: "0.125rem",
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  full: "9999px",
} as const;

export type Radius = typeof RADIUS;
export type RadiusToken = keyof Radius;
