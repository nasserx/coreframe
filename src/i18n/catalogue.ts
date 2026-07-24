import type { APP_LOCALES, AppLocale } from "@/config";

import type { Messages } from "./messages";
import { en } from "./messages/en";

/**
 * Catalogue registry — the single-locale-free loading strategy.
 *
 * The default locale's catalogue is imported STATICALLY (`en` below), so it is
 * in the main bundle: server rendering and first paint resolve it
 * synchronously, and a single-locale deployment ships exactly this one
 * catalogue. Every OTHER locale is a dynamic `import()`, so its bytes are
 * code-split into a separate chunk fetched only when the client locale switcher
 * selects it — a Latin-default deployment never downloads Arabic strings.
 *
 * Clone story: to make a single-locale (e.g. Arabic-only) deployment, set
 * `APP_LOCALES.DEFAULT` and `SUPPORTED` to that one locale, re-point the static
 * import + `DEFAULT_CATALOGUE_LOCALE` below to it, and prune `CATALOGUE_LOADERS`
 * to that one entry. The guard at the bottom fails the build if the static
 * default and the configured default disagree, so the coupling cannot silently
 * rot (the same discipline as the Noto preload guard in src/app/fonts.ts).
 */

/**
 * The locale whose catalogue is statically imported as the default below. MUST
 * mirror the `import { en }` line; coupled to `APP_LOCALES.DEFAULT` by the
 * build-time guard at the bottom of this file. A type (not a runtime const)
 * because it exists only to be compared in that guard.
 */
type DefaultCatalogueLocale = "en";

/** The statically bundled default catalogue — synchronous, always present. */
export const DEFAULT_CATALOGUE: Messages = en;

/** Loader for a locale's catalogue. */
export type CatalogueLoader = () => Promise<Messages>;

/**
 * One loader per supported locale. The default resolves synchronously to the
 * already-bundled catalogue; the rest are dynamic imports (code-split chunks).
 * Typed `Record<AppLocale, …>`, so a supported locale without a loader — or a
 * loader for an unsupported one — fails the typecheck.
 */
export const CATALOGUE_LOADERS: Record<AppLocale, CatalogueLoader> = {
  en: () => Promise.resolve(en),
  ar: () => import("./messages/ar").then((module) => module.ar),
};

/**
 * Load a locale's catalogue. The default is returned synchronously (already
 * bundled); other locales resolve their code-split chunk.
 */
export function loadCatalogue(locale: AppLocale): Promise<Messages> {
  return CATALOGUE_LOADERS[locale]();
}

/* --- Build-time guard: the static default must match the configured default --- */
type AssertTrue<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
// Erased at runtime (type-only); exported so `noUnusedLocals` treats it as used.
export type _DefaultCatalogueMatchesLocale = AssertTrue<
  Equal<DefaultCatalogueLocale, (typeof APP_LOCALES)["DEFAULT"]>
>;
