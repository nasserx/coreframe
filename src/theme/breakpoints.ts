/**
 * Responsive breakpoint tokens for layout decisions.
 */
export const BREAKPOINTS = {
  xs: "30rem",
  sm: "40rem",
  md: "48rem",
  lg: "64rem",
  xl: "80rem",
  "2xl": "96rem",
} as const;

export type Breakpoints = typeof BREAKPOINTS;
export type BreakpointToken = keyof Breakpoints;
