/**
 * Application metadata used across the project.
 *
 * Locale is the single source of truth for text direction: `<html>` gets its
 * `lang` and `dir` from APP_CONFIG, which derives both from the default
 * locale below. A cloning product changes `DEFAULT` (one value) to switch the
 * deployment's language and direction together. See docs/DIRECTION_AND_I18N.md.
 */
export const APP_LOCALES = {
  DEFAULT: "en",
  SUPPORTED: ["en", "ar"],
} as const;

export type AppLocale = (typeof APP_LOCALES.SUPPORTED)[number];
export type TextDirection = "ltr" | "rtl";
export type NumberingSystem = "latn" | "arab";

/**
 * Per-locale rendering facts — the single source of truth every locale-derived
 * decision reads (direction, numerals, message catalogue, and the switcher's
 * option name). Because direction, numerals, and the active message catalogue
 * are all COMPUTED from the selected locale through this map, it is impossible
 * for two configs to disagree — e.g. Arabic messages can never ship with LTR
 * direction (docs/DIRECTION_AND_I18N.md).
 *
 * - `direction` drives the `dir` attribute on `<html>` (and the Tailwind
 *   `rtl:` variant).
 * - `numerals` is the Unicode numbering system passed to `Intl` formatters
 *   (`nu` key): "latn" is Western digits (0–9), "arab" is Eastern
 *   Arabic-Indic (٠–٩). The foundation defaults Arabic to Western numerals —
 *   the prevailing convention in modern Arabic product UIs — and a product
 *   flips this one value to switch.
 * - `label` is the locale's autonym (its name written in its own language) —
 *   the correct label for a language switcher regardless of the current UI
 *   locale, so it is deliberately NOT a translated message.
 */
export const LOCALE_INFO = {
  en: { direction: "ltr", numerals: "latn", label: "English" },
  ar: { direction: "rtl", numerals: "latn", label: "العربية" },
} as const satisfies Record<
  AppLocale,
  { direction: TextDirection; numerals: NumberingSystem; label: string }
>;

export const APP_CONFIG = {
  name: "Frontend Foundation",
  description: "A reusable frontend foundation for production web applications.",
  defaultLocale: APP_LOCALES.DEFAULT,
  supportedLocales: APP_LOCALES.SUPPORTED,
  direction: LOCALE_INFO[APP_LOCALES.DEFAULT].direction,
  numerals: LOCALE_INFO[APP_LOCALES.DEFAULT].numerals,
} as const;

export type AppConfig = typeof APP_CONFIG;
