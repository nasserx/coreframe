"use client";

import { useState } from "react";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";

import { APP_CONFIG, type TextDirection } from "@/config";

/**
 * Engineering inspection control: flips the document's `dir` attribute at
 * runtime so any showcase page can be reviewed in both directions. Because
 * all foundation styling is logical-property based, flipping the attribute
 * is the entire switch.
 *
 * Deliberately a showcase feature component, not a UI primitive: products
 * set direction statically from locale config (docs/DIRECTION_AND_I18N.md);
 * a runtime direction toggle is not a product pattern. The override is
 * ephemeral — a hard reload returns to the configured default.
 */
export function DirectionControl() {
  // Lazily read <html> on the client: the attribute survives client-side
  // navigation while this component's state does not. At hydration the
  // attribute still equals the server-rendered default, so markup matches.
  const [direction, setDirection] = useState<TextDirection>(() => {
    if (typeof document === "undefined") {
      return APP_CONFIG.direction;
    }
    const current = document.documentElement.dir;
    return current === "rtl" || current === "ltr" ? current : APP_CONFIG.direction;
  });

  return (
    <ToggleGroup
      aria-label="Text direction (showcase inspection)"
      className="inline-flex items-center gap-0.5 rounded-lg border bg-muted/50 p-0.5"
      value={[direction]}
      onValueChange={(next) => {
        const value = next[0];
        if (value === "ltr" || value === "rtl") {
          document.documentElement.dir = value;
          setDirection(value);
        }
      }}
    >
      {(["ltr", "rtl"] as const).map((value) => (
        <Toggle
          key={value}
          value={value}
          aria-label={value === "ltr" ? "Left to right" : "Right to left"}
          className="inline-flex h-6.5 items-center justify-center rounded-md px-1.5 font-mono text-caption text-muted-foreground uppercase transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-pressed:bg-background data-pressed:text-foreground data-pressed:shadow-xs"
        >
          {value}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}
