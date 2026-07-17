/**
 * Semantic color tokens for application surfaces and states.
 *
 * Values are CSS variable references, not literal colors. The CSS files in
 * `src/styles` (light.css / dark.css) are the single runtime source of truth,
 * so these tokens stay correct in every theme without duplicating values.
 * Use them only where Tailwind utilities cannot reach (for example when
 * passing a color to a JavaScript API that renders into the DOM or SVG).
 */
export const COLORS = {
  background: "var(--color-background)",
  foreground: "var(--color-foreground)",
  surface: "var(--color-surface)",
  surfaceForeground: "var(--color-surface-foreground)",
  primary: "var(--color-primary)",
  primaryForeground: "var(--color-primary-foreground)",
  secondary: "var(--color-secondary)",
  secondaryForeground: "var(--color-secondary-foreground)",
  muted: "var(--color-muted)",
  mutedForeground: "var(--color-muted-foreground)",
  accent: "var(--color-accent)",
  accentForeground: "var(--color-accent-foreground)",
  success: "var(--color-success)",
  successForeground: "var(--color-success-foreground)",
  warning: "var(--color-warning)",
  warningForeground: "var(--color-warning-foreground)",
  destructive: "var(--color-destructive)",
  destructiveForeground: "var(--color-destructive-foreground)",
  border: "var(--color-border)",
  input: "var(--color-input)",
  ring: "var(--color-ring)",
} as const;

export type Colors = typeof COLORS;
export type ColorToken = keyof Colors;
