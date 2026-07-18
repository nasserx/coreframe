"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type TokenSwatchProps = Readonly<{
  name: string;
  /** CSS custom property to resolve and display, e.g. "--color-primary". */
  variable: string;
  swatchClassName: string;
}>;

/**
 * Reads the resolved value of a CSS custom property from the document root
 * and keeps it current when the theme class changes. Client-only by nature —
 * the server renders an empty value that fills in after hydration.
 */
function useResolvedCssVariable(variable: string): string {
  const [value, setValue] = useState("");

  useEffect(() => {
    const read = () => {
      setValue(getComputedStyle(document.documentElement).getPropertyValue(variable).trim());
    };
    read();
    // The ThemeProvider flips the `dark` class on <html>; observing that
    // attribute keeps displayed values correct on live theme changes.
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      observer.disconnect();
    };
  }, [variable]);

  return value;
}

/**
 * A color token swatch with its name and resolved runtime value. The inset
 * foreground-tinted ring guarantees the swatch stays visible even when its
 * color matches the card behind it (background, surface, border, …).
 */
export function TokenSwatch({ name, variable, swatchClassName }: TokenSwatchProps) {
  const value = useResolvedCssVariable(variable);

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
        <code className="truncate font-mono text-caption text-muted-foreground">
          {value || "…"}
        </code>
      </div>
    </div>
  );
}
