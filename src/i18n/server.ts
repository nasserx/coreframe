import type { Namespace } from "./messages";
import { DEFAULT_CATALOGUE } from "./catalogue";
import { createTranslator, type Translator } from "./translate";

/**
 * Server/static translator, scoped to a namespace and bound to the BUILD-TIME
 * default locale catalogue — the locale every route is statically prerendered
 * in. Synchronous by design: locale is a build-time constant here (no per-
 * request work), which is exactly what keeps every route statically
 * prerenderable.
 *
 * Use this from Server Components (e.g. `not-found.tsx`) and from the
 * provider-less `global-error.tsx` boundary. Client components that must
 * re-render when the visitor switches locale use `useTranslations` from the
 * LocaleProvider instead — that one reads the ACTIVE catalogue, this one is
 * fixed to the default.
 */
export function getTranslations<NS extends Namespace>(namespace: NS): Translator<NS> {
  return createTranslator(DEFAULT_CATALOGUE, namespace);
}
