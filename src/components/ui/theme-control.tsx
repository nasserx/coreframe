"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";

import { type ThemePreference, useTheme } from "@/core/providers/theme-provider";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
  { value: "system", label: "System", Icon: MonitorIcon },
] as const satisfies ReadonlyArray<{
  value: ThemePreference;
  label: string;
  Icon: typeof SunIcon;
}>;

export type ThemeControlProps = Omit<
  ToggleGroup.Props<ThemePreference>,
  "value" | "defaultValue" | "onValueChange" | "multiple"
> & {
  /**
   * Accessible names of the three icon-only options; localize at the call
   * site (the group's own name is overridden via `aria-label`).
   */
  optionLabels?: Partial<Record<ThemePreference, string>>;
};

/**
 * Three-state theme selector (light / dark / system) bound to the theme
 * runtime via `useTheme()` — selection reflects the stored *preference*, not
 * the resolved theme, so "System" stays selected while the OS decides.
 *
 * Accessibility: Base UI's ToggleGroup provides the group role with roving
 * arrow-key focus; each option is a native toggle button exposing
 * `aria-pressed` and an icon-only accessible name. The group's name
 * ("Theme") can be overridden via `aria-label`. Re-pressing the active
 * option is a no-op — the group can never reach an empty selection. The
 * English option names are defaults, overridable via `optionLabels`.
 *
 * Constraints: UI-only; persistence and application of the theme belong to
 * the ThemeProvider, never to this control.
 */
export function ThemeControl({ className, optionLabels, ...props }: ThemeControlProps) {
  const { theme, setTheme } = useTheme();

  return (
    <ToggleGroup
      data-slot="theme-control"
      aria-label="Theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border bg-muted/50 p-0.5",
        className,
      )}
      {...props}
      value={[theme]}
      onValueChange={(next) => {
        const selected = THEME_OPTIONS.find((option) => option.value === next[0]);
        if (selected) {
          setTheme(selected.value);
        }
      }}
    >
      {THEME_OPTIONS.map(({ value, label, Icon }) => (
        <Toggle
          key={value}
          value={value}
          aria-label={optionLabels?.[value] ?? label}
          // size-6.5 makes the group 32px tall (h-8) — the baseline
          // control-height step (docs/DESIGN_TOKENS.md § Control height), so
          // it aligns with the default-size header CTAs in an action cluster
          // (the 2026-09 pass brought the cluster down from lg/h-9 to the
          // baseline). Attached (not offset) focus ring: the toggle is nested
          // inside the group's own border, so an offset ring would collide
          // with its siblings (docs/DESIGN_TOKENS.md §2).
          className="inline-flex size-6.5 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-pressed:bg-background data-pressed:text-foreground data-pressed:shadow-xs [&_svg]:pointer-events-none [&_svg]:size-4"
        >
          <Icon />
        </Toggle>
      ))}
    </ToggleGroup>
  );
}
