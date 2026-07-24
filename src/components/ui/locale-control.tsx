"use client";

import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";

import { type AppLocale, LOCALE_INFO } from "@/config";
import { useLocale, useTranslations } from "@/core/providers/locale-provider";
import { cn } from "@/lib/utils";

export type LocaleControlProps = Omit<
  ToggleGroup.Props<AppLocale>,
  "value" | "defaultValue" | "onValueChange" | "multiple"
>;

/**
 * Language switcher bound to the locale runtime via `useLocale()`. Selecting a
 * locale swaps its message catalogue AND — because direction, numerals, and
 * Arabic type metrics all derive from the SAME locale through `LOCALE_INFO` —
 * flips `<html dir/lang>` in one move. There is deliberately no separate
 * direction control: nobody wants English rendered right-to-left, so direction
 * is a property of language, never an independent toggle.
 *
 * Options are the built-in locales' autonyms (each language's name in its own
 * script, from `LOCALE_INFO.label`) — the correct label regardless of the
 * current UI language, so they are not themselves translated.
 *
 * Renders nothing on a single-locale deployment (`canSwitchLocale` is false):
 * with one built-in language there is nothing to switch, and the control costs
 * that deployment no UI surface. The group's accessible name comes from the
 * `localeControl` messages and is overridable via `aria-label`.
 *
 * Accessibility: Base UI's ToggleGroup provides the group role with roving
 * arrow-key focus; each option is a native toggle exposing `aria-pressed`.
 * Re-pressing the active option is a no-op — the group can never reach an
 * empty selection.
 *
 * Constraints: UI-only; persistence and application of the locale belong to the
 * LocaleProvider, never to this control.
 */
export function LocaleControl({
  className,
  "aria-label": ariaLabel,
  ...props
}: LocaleControlProps) {
  const { locale, availableLocales, canSwitchLocale, setLocale } = useLocale();
  const t = useTranslations("localeControl");

  if (!canSwitchLocale) {
    return null;
  }

  return (
    <ToggleGroup
      data-slot="locale-control"
      aria-label={ariaLabel ?? t("label")}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border bg-muted/50 p-0.5",
        className,
      )}
      {...props}
      value={[locale]}
      onValueChange={(next) => {
        const selected = next[0];
        if (
          selected !== undefined &&
          (availableLocales as readonly AppLocale[]).includes(selected)
        ) {
          setLocale(selected);
        }
      }}
    >
      {availableLocales.map((value) => (
        <Toggle
          key={value}
          value={value}
          // h-6.5 makes the group 32px tall (h-8) — the baseline control-height
          // step (docs/DESIGN_TOKENS.md § Control height), aligned with
          // ThemeControl and the default-size header CTAs in an action cluster.
          className="inline-flex h-6.5 items-center justify-center rounded-md px-2 text-small font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-pressed:bg-background data-pressed:text-foreground data-pressed:shadow-xs"
        >
          {LOCALE_INFO[value].label}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}
