"use client";

import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/core/providers/theme-provider";

/**
 * Read-only view of the theme runtime. There is one value to show because the
 * runtime holds one: the applied theme is always concrete, so there is no
 * separate "preference" that could disagree with it. It never toggles the
 * `dark` class itself (that is the ThemeProvider's job).
 */
export function ThemeStatus() {
  const { theme } = useTheme();

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border p-4">
      <dl className="flex items-center gap-2">
        <dt className="text-caption text-muted-foreground">applied theme</dt>
        <dd>
          <Badge variant="secondary">{theme}</Badge>
        </dd>
      </dl>
      <p className="text-sm text-muted-foreground">
        Toggle the theme with the control in the header. The choice persists across reloads and
        tabs; the operating-system preference only decides the first visit, before any choice
        exists.
      </p>
    </div>
  );
}
