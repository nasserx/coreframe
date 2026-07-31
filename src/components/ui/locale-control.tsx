"use client";

import { GlobeIcon } from "lucide-react";

import { useLocale, useTranslations } from "@/core/providers/locale-provider";

import { Button, type ButtonProps } from "./button";

export type LocaleControlProps = Omit<
  ButtonProps,
  "aria-label" | "children" | "onClick" | "size" | "type" | "variant"
>;

/**
 * Language toggle bound to the locale runtime via `useLocale()`. Activating it
 * switches straight to the other built-in language: its catalogue, and —
 * because direction, numerals, and Arabic type metrics all derive from the SAME
 * locale through `LOCALE_INFO` — `<html lang/dir>` in one move. There is
 * deliberately no separate direction control: nobody wants English rendered
 * right-to-left, so direction is a property of language, never an independent
 * toggle.
 *
 * Icon-only, with a globe: the accessible name carries the whole meaning
 * (`Switch to Arabic` / `التبديل إلى الإنجليزية`), so it names the target
 * language rather than the current one. Being icon-only is also what keeps the
 * button EXACTLY square in both locales — no visible code, no text metrics, no
 * width that shifts when the language does. It carries no `aria-pressed` and no
 * selected/tab semantics: a two-language switch is a command, not a selection
 * among visible options.
 *
 * The glyph is decorative (`aria-hidden`) and never mirrors: no `rtl:` variant
 * is applied. Border, surface, hover, active, and focus feedback are entirely
 * the Button primitive's `outline` variant — this control adds no visual
 * treatment and no motion of its own.
 *
 * Renders nothing on a single-locale deployment (`canSwitchLocale` is false):
 * with one built-in language there is nothing to switch, and the control costs
 * that deployment no UI surface.
 *
 * Two locales are the contract this control is built for; a deployment that
 * builds in three or more needs a chooser rather than a toggle, and should
 * replace this component (see docs/DIRECTION_AND_I18N.md).
 *
 * Constraints: UI-only; persistence and application of the locale belong to the
 * LocaleProvider, never to this control.
 */
export function LocaleControl({ className, ...props }: LocaleControlProps) {
  const { locale, availableLocales, canSwitchLocale, setLocale } = useLocale();
  const t = useTranslations("localeControl");

  const target = availableLocales.find((candidate) => candidate !== locale);

  if (!canSwitchLocale || target === undefined) {
    return null;
  }

  return (
    <Button
      data-slot="locale-control"
      variant="outline"
      // `icon-lg` is the authoritative 36px square (docs/DESIGN_TOKENS.md
      // § Control height): the same h-9 step as the header CTAs, so the utility
      // pair sits on the CTA baseline instead of a step below it.
      size="icon-lg"
      aria-label={t("switchLabel")}
      className={className}
      {...props}
      onClick={() => {
        setLocale(target);
      }}
    >
      {/* `data-icon` names the glyph so tests can assert which one rendered
          without reaching into lucide's markup or SVG path data. The glyph
          keeps the primitive's standard 16px size — the larger box buys
          breathing room, not a larger icon. */}
      <GlobeIcon aria-hidden="true" data-icon="globe" />
    </Button>
  );
}
