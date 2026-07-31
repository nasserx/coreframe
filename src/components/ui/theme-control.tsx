"use client";

import { MoonIcon, SunIcon } from "lucide-react";

import { useTranslations } from "@/core/providers/locale-provider";
import { useTheme } from "@/core/providers/theme-provider";

import { Button, type ButtonProps } from "./button";

export type ThemeControlProps = Omit<
  ButtonProps,
  "aria-label" | "children" | "onClick" | "size" | "type" | "variant"
>;

/**
 * Light/dark toggle bound to the theme runtime via `useTheme()`. One native
 * button with two states and no third option: the operating-system preference
 * initializes the session but is not a selectable value, so there is nothing
 * for a dropdown or segmented control to hold (docs/DESIGN_TOKENS.md §5).
 *
 * The icon and the accessible name both describe the ACTION, not the current
 * value — a Moon means "switch to dark", a Sun means "switch to light". That is
 * why there is no `aria-pressed`: the button is not a boolean whose label stays
 * fixed while its state flips, it is a command whose label changes with the
 * state. Announcing it as pressed/unpressed on top of an already-changing name
 * would say the same thing twice, and contradictorily.
 *
 * The glyph is decorative (`aria-hidden`) and never mirrors: no `rtl:` variant
 * is applied. Border, surface, hover, active, and focus feedback are entirely
 * the Button primitive's `outline` variant, at the same `icon-lg` square as
 * LocaleControl, so the two read as one pair without either adding visual
 * treatment or motion of its own.
 *
 * Accessible names come from the `theme` catalogue, so the control follows the
 * active locale without any per-call-site plumbing.
 *
 * Constraints: UI-only; persistence, OS resolution, and application of the
 * theme belong to the ThemeProvider, never to this control.
 */
export function ThemeControl({ className, ...props }: ThemeControlProps) {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("theme");

  const target = theme === "dark" ? "light" : "dark";
  const Icon = target === "dark" ? MoonIcon : SunIcon;

  return (
    <Button
      data-slot="theme-control"
      variant="outline"
      // Matches LocaleControl exactly: the authoritative 36px square on the
      // same h-9 step as the header CTAs (docs/DESIGN_TOKENS.md
      // § Control height).
      size="icon-lg"
      aria-label={target === "dark" ? t("toDark") : t("toLight")}
      className={className}
      {...props}
      onClick={() => {
        setTheme(target);
      }}
    >
      {/* `data-icon` names the glyph so tests can assert which one rendered
          without reaching into lucide's markup or SVG path data. The glyph
          keeps the primitive's standard 16px size. */}
      <Icon aria-hidden="true" data-icon={target === "dark" ? "moon" : "sun"} />
    </Button>
  );
}
