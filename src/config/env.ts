/**
 * Centralized environment configuration.
 *
 * This module is the only place allowed to read `process.env`. It exposes two
 * things:
 * - `RAW_ENV` — the untouched string reads, consumed by the fail-fast Zod
 *   validator in `./env-validation` (which `next.config.ts` imports so
 *   validation runs once at startup in every mode: `next dev`, `build`,
 *   `start`).
 * - `ENV_CONFIG` — the typed, defaulted values every other module reads.
 *
 * Zod validation stays in the server-only `./env-validation` module because
 * client-reachable modules such as `apiFetch` import `ENV_CONFIG`. This file
 * must not import Zod, so unvalidated client modules do not import it either.
 * `next.config.ts` loads the validator before app code runs.
 *
 * Adding a new environment variable:
 * 1. Add it to `RAW_ENV` below (Next.js inlines only the exact
 *    `process.env.NEXT_PUBLIC_X` form into browser bundles — bracket access is
 *    not replaced, so read it with dotted access).
 * 2. Derive its typed value in `ENV_CONFIG` (apply defaults/coercion here).
 * 3. Add it to the Zod schema in `./env-validation.ts` (use `NEXT_PUBLIC_`
 *    only for browser-safe values; everything else stays server-only).
 * 4. Document it in `.env.example`, and read it everywhere else via
 *    `ENV_CONFIG`, never `process.env`.
 */

declare global {
  // Augmenting NodeJS.ProcessEnv (a namespace-declared interface in
  // @types/node) is only possible with namespace syntax.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      /*
       * Declared so the reads below can use dotted property access: Next.js
       * inlines only the exact `process.env.NEXT_PUBLIC_X` form into browser
       * bundles — bracket access (what noPropertyAccessFromIndexSignature would
       * otherwise force) is not replaced and would silently read undefined in
       * the client.
       */
      NEXT_PUBLIC_API_BASE_URL?: string | undefined;
      NEXT_PUBLIC_ENABLE_SHOWCASE?: string | undefined;
    }
  }
}

/**
 * The untouched environment reads — the single point of contact with
 * `process.env`. `./env-validation` validates exactly these three fields with
 * Zod at startup; keep the two in sync.
 */
export const RAW_ENV = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_ENABLE_SHOWCASE: process.env.NEXT_PUBLIC_ENABLE_SHOWCASE,
} as const;

export type NodeEnv = "development" | "test" | "production";

export type EnvConfig = Readonly<{
  NODE_ENV: NodeEnv;
  /**
   * Base URL prefixed to every `apiFetch` path (src/api/client.ts). Empty
   * (the default) means same-origin — correct for this repo's own route
   * handlers and for products deployed behind one origin. A product pointing
   * at a separate backend sets an absolute URL here; server-side callers always
   * need the absolute form (relative fetch has no origin in Node). Browser-safe
   * by definition, hence NEXT_PUBLIC_.
   */
  NEXT_PUBLIC_API_BASE_URL: string;
  /**
   * Gates the /showcase routes and their backing endpoint. Default `true`: the
   * showcase is the foundation's living integration test and stays available
   * during development. A product sets "false" in its production environment to
   * prerender every showcase route as a static 404 at build time. The check is
   * inlined at build time, so flipping the value requires a rebuild.
   */
  NEXT_PUBLIC_ENABLE_SHOWCASE: boolean;
}>;

/**
 * The typed, defaulted configuration every module reads. Values assume valid
 * inputs — `./env-validation` (run at startup via `next.config.ts`) is what
 * guarantees that, throwing a fail-fast error before any of this is relied on.
 * The defaults/coercion here MUST mirror the schema there:
 * - `NEXT_PUBLIC_API_BASE_URL` defaults to `""` (same-origin).
 * - `NEXT_PUBLIC_ENABLE_SHOWCASE` is a boolean: only the literal "false"
 *   disables it (validation restricts the raw value to "true" | "false").
 */
export const ENV_CONFIG: EnvConfig = {
  NODE_ENV: RAW_ENV.NODE_ENV as NodeEnv,
  NEXT_PUBLIC_API_BASE_URL: RAW_ENV.NEXT_PUBLIC_API_BASE_URL ?? "",
  NEXT_PUBLIC_ENABLE_SHOWCASE: RAW_ENV.NEXT_PUBLIC_ENABLE_SHOWCASE !== "false",
};
