/**
 * Responsive breakpoint tokens for layout decisions in JavaScript
 * (for example `matchMedia`), where CSS variables cannot be used.
 *
 * These values must stay identical to the Tailwind default screens
 * (`sm`–`2xl`) so that JS and utility breakpoints never disagree.
 */
export const BREAKPOINTS = {
  sm: "40rem",
  md: "48rem",
  lg: "64rem",
  xl: "80rem",
  "2xl": "96rem",
} as const;

export type Breakpoints = typeof BREAKPOINTS;
export type BreakpointToken = keyof Breakpoints;
