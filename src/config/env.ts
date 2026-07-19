/**
 * Centralized environment configuration with fail-fast validation.
 *
 * This module is the only place allowed to read `process.env`. It is imported
 * for its side effect by `next.config.ts`, which guarantees validation runs
 * once at startup in every mode (`next dev`, `next build`, `next start`).
 * It is deliberately excluded from the config barrel — consumers that need
 * environment values import `@/config/env` directly and accept the fail-fast
 * behavior.
 *
 * Adding a new environment variable:
 * 1. Add it to `envSchema` below (use `NEXT_PUBLIC_` only for browser-safe
 *    values; everything else stays server-only).
 * 2. Add it to the object passed to `safeParse` — Next.js inlines
 *    `process.env.X` at build time, so each variable must be referenced
 *    explicitly; spreading `process.env` does not work in the browser bundle.
 * 3. Document it in `.env.example` if one exists, and read it everywhere else
 *    via `ENV_CONFIG`, never `process.env`.
 */
import { z } from "zod";

declare global {
  // Augmenting NodeJS.ProcessEnv (a namespace-declared interface in
  // @types/node) is only possible with namespace syntax.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      /*
       * Declared so the schema input below can use dotted property access:
       * Next.js inlines only the exact `process.env.NEXT_PUBLIC_X` form
       * into browser bundles — bracket access (what
       * noPropertyAccessFromIndexSignature would otherwise force) is not
       * replaced and would silently read undefined in the client.
       */
      NEXT_PUBLIC_API_BASE_URL?: string | undefined;
      NEXT_PUBLIC_ENABLE_SHOWCASE?: string | undefined;
    }
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  /**
   * Base URL prefixed to every `apiFetch` path (src/api/client.ts). Empty
   * (the default) means same-origin — correct for this repo's own route
   * handlers and for products deployed behind one origin. A product
   * pointing at a separate backend sets an absolute URL here; server-side
   * callers always need the absolute form (relative fetch has no origin in
   * Node). Browser-safe by definition, hence NEXT_PUBLIC_.
   */
  NEXT_PUBLIC_API_BASE_URL: z.string().default(""),
  /**
   * Gates the /showcase routes and their backing endpoint. Default "true":
   * the showcase is the foundation's living integration test and stays
   * available during development. A product sets "false" in its production
   * environment to prerender every showcase route as a static 404 at build
   * time — no dynamic rendering, no code deletion (docs/CLONING.md). The
   * check is inlined at build time, so flipping the value requires a
   * rebuild.
   */
  NEXT_PUBLIC_ENABLE_SHOWCASE: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
});

const parsedEnv = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_ENABLE_SHOWCASE: process.env.NEXT_PUBLIC_ENABLE_SHOWCASE,
});

if (!parsedEnv.success) {
  // `z.prettifyError` renders one line per issue with the offending variable
  // name, so the thrown message names exactly what is missing or invalid.
  throw new Error(`Invalid environment configuration:\n${z.prettifyError(parsedEnv.error)}`);
}

export const ENV_CONFIG = parsedEnv.data;

export type EnvConfig = typeof ENV_CONFIG;
