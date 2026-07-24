import type { MessageKey, Messages, Namespace } from "./messages";

/** Values that can be interpolated into a `{placeholder}`. */
export type MessageVars = Readonly<Record<string, string | number>>;

/**
 * A namespace-scoped translation function — the unit both the client
 * `useTranslations(ns)` hook and the server `getTranslations(ns)` helper hand
 * back. Keys are constrained to the namespace, so a typo or a key from another
 * namespace is a compile error.
 */
export type Translator<NS extends Namespace> = (key: MessageKey<NS>, vars?: MessageVars) => string;

const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * Resolve one message and fill its `{placeholder}`s. Pure and
 * framework-agnostic: the catalogue is passed in, so the same function serves
 * the server (default catalogue) and the client (active catalogue).
 *
 * An unknown placeholder is left verbatim (`{foo}`) rather than blanked, so
 * missing interpolation data is visible in the UI instead of silently empty.
 */
export function translate<NS extends Namespace>(
  messages: Messages,
  namespace: NS,
  key: MessageKey<NS>,
  vars?: MessageVars,
): string {
  const template = messages[namespace][key];
  if (vars === undefined) {
    return template;
  }
  return template.replace(PLACEHOLDER, (match, name: string) => {
    const value = vars[name];
    return value === undefined ? match : String(value);
  });
}

/** Bind a catalogue and namespace into a `Translator`. */
export function createTranslator<NS extends Namespace>(
  messages: Messages,
  namespace: NS,
): Translator<NS> {
  return (key, vars) => translate(messages, namespace, key, vars);
}
