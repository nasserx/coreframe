/**
 * The message-translation public API (docs/DIRECTION_AND_I18N.md).
 *
 * - Types: `Messages`, `Namespace`, `MessageKey` — the typed message contract.
 * - `translate` / `createTranslator` / `Translator` / `MessageVars` — the pure,
 *   framework-agnostic resolver shared by server and client.
 * - `getTranslations` — the server/static translator (default-locale catalogue).
 * - `DEFAULT_CATALOGUE` / `loadCatalogue` / `CATALOGUE_LOADERS` — the catalogue
 *   registry the client LocaleProvider drives.
 *
 * The client runtime (`LocaleProvider`, `useLocale`, `useTranslations`) lives in
 * `@/core/providers` because it owns a React context — import it from there.
 */
export type { Messages, Namespace, MessageKey } from "./messages";
export type { Translator, MessageVars } from "./translate";
export { translate, createTranslator } from "./translate";
export { getTranslations } from "./server";
export {
  DEFAULT_CATALOGUE,
  CATALOGUE_LOADERS,
  loadCatalogue,
  type CatalogueLoader,
} from "./catalogue";
