"use client";

import { useTheme } from "@/core/providers/theme-provider";
import { cn } from "@/lib/utils";

type TokenSwatchProps = Readonly<{
  name: string;
  swatchClassName: string;
  /** Authored value from src/styles/light.css, exactly as written. */
  lightValue: string;
  /** Authored value from src/styles/dark.css, exactly as written. */
  darkValue: string;
}>;

/**
 * A color token swatch with its name and the authored value for the
 * currently resolved theme, exactly as written in src/styles — copyable
 * straight back into the token files. getComputedStyle is deliberately not
 * used: browsers serialize computed colors into lab()/hex, which is
 * unreadable and not round-trippable. The inset foreground-tinted ring
 * keeps the swatch visible even when its color matches the card behind it
 * (background, surface, border, …).
 */
export function TokenSwatch({ name, swatchClassName, lightValue, darkValue }: TokenSwatchProps) {
  const { resolvedTheme } = useTheme();
  const value = resolvedTheme === "dark" ? darkValue : lightValue;

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span
        aria-hidden="true"
        className={cn(
          "size-9 shrink-0 rounded-md ring-1 ring-foreground/25 ring-inset",
          swatchClassName,
        )}
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        <code className="font-mono text-xs font-medium">{name}</code>
        <code className="truncate font-mono text-caption text-muted-foreground">{value}</code>
      </div>
    </div>
  );
}
