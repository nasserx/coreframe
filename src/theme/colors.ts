/**
 * Semantic color tokens for application surfaces and states.
 */
export const COLORS = {
  primary: {
    foreground: "oklch(0.985 0 0)",
    background: "oklch(0.205 0 0)",
  },
  secondary: {
    foreground: "oklch(0.205 0 0)",
    background: "oklch(0.97 0 0)",
  },
  success: {
    foreground: "oklch(0.985 0 0)",
    background: "oklch(0.45 0.13 145)",
  },
  warning: {
    foreground: "oklch(0.145 0 0)",
    background: "oklch(0.82 0.16 85)",
  },
  destructive: {
    foreground: "oklch(0.985 0 0)",
    background: "oklch(0.577 0.245 27.325)",
  },
  background: {
    default: "oklch(1 0 0)",
    subtle: "oklch(0.985 0 0)",
  },
  foreground: {
    default: "oklch(0.145 0 0)",
    muted: "oklch(0.556 0 0)",
  },
  border: {
    default: "oklch(0.922 0 0)",
    strong: "oklch(0.708 0 0)",
  },
  muted: {
    foreground: "oklch(0.556 0 0)",
    background: "oklch(0.97 0 0)",
  },
  accent: {
    foreground: "oklch(0.205 0 0)",
    background: "oklch(0.97 0 0)",
  },
} as const;

export type Colors = typeof COLORS;
export type ColorToken = keyof Colors;
