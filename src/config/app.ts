/**
 * Application metadata used across the project.
 */
export const APP_LOCALES = {
  DEFAULT: "en",
  SUPPORTED: ["en"],
} as const;

export const APP_CONFIG = {
  name: "Frontend Foundation",
  description: "A reusable frontend foundation for production web applications.",
  version: "0.1.0",
  defaultLocale: APP_LOCALES.DEFAULT,
  supportedLocales: APP_LOCALES.SUPPORTED,
} as const;

export type AppLocale = (typeof APP_LOCALES.SUPPORTED)[number];
export type AppConfig = typeof APP_CONFIG;
