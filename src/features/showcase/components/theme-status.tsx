"use client";

import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/core/providers/theme-provider";

/**
 * Read-only view of the theme runtime: the stored preference alongside the
 * theme actually applied — deliberately shown as two values, since a product
 * must be able to render "system" as selected while dark is applied. It
 * never toggles the `dark` class itself (that is the ThemeProvider's job).
 */
export function ThemeStatus() {
  const { theme, resolvedTheme } = useTheme();

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border p-4">
      <dl className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <dt className="text-caption text-muted-foreground">preference</dt>
          <dd>
            <Badge variant="secondary">{theme}</Badge>
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="text-caption text-muted-foreground">resolved</dt>
          <dd>
            <Badge variant="outline">{resolvedTheme}</Badge>
          </dd>
        </div>
      </dl>
      <p className="text-sm text-muted-foreground">
        Set the theme with the control in the header. An explicit choice persists across reloads and
        tabs; “system” tracks the OS preference live.
      </p>
    </div>
  );
}
