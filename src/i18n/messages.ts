import type { en } from "./messages/en";

/**
 * The message contract, derived from the canonical English catalogue
 * (src/i18n/messages/en.ts). Values are widened to `string`, so `en`'s literal
 * types do not leak into the contract: every locale catalogue must carry the
 * same namespaces and keys, each mapped to some string.
 *
 * A locale catalogue declares `: Messages` (see ar.ts) — a missing key fails
 * the typecheck, and object-literal excess-property checking rejects a stray
 * one, so no locale can silently drift from English.
 */
export type Messages = {
  [Namespace in keyof typeof en]: {
    [Key in keyof (typeof en)[Namespace]]: string;
  };
};

/** A top-level message group, e.g. "error", "shell", "site". */
export type Namespace = keyof Messages;

/** The valid keys within a namespace — the unit of type safety at call sites. */
export type MessageKey<NS extends Namespace> = keyof Messages[NS];
