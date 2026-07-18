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
 * Per-locale rendering facts.
 *
 * - `direction` drives the `dir` attribute on `<html>` (and the Tailwind
 *   `rtl:` variant).
 * - `numerals` is the Unicode numbering system passed to `Intl` formatters
 *   (`nu` key): "latn" is Western digits (0–9), "arab" is Eastern
 *   Arabic-Indic (٠–٩). The foundation defaults Arabic to Western numerals —
 *   the prevailing convention in modern Arabic product UIs — and a product
 *   flips this one value to switch.
 */
export const LOCALE_INFO = {
  en: { direction: "ltr", numerals: "latn" },
  ar: { direction: "rtl", numerals: "latn" },
} as const satisfies Record<AppLocale, { direction: TextDirection; numerals: NumberingSystem }>;

export const APP_CONFIG = {
  name: "Frontend Foundation",
  description: "A reusable frontend foundation for production web applications.",
  version: "0.1.0",
  defaultLocale: APP_LOCALES.DEFAULT,
  supportedLocales: APP_LOCALES.SUPPORTED,
  direction: LOCALE_INFO[APP_LOCALES.DEFAULT].direction,
  numerals: LOCALE_INFO[APP_LOCALES.DEFAULT].numerals,
} as const;

export type AppConfig = typeof APP_CONFIG;
