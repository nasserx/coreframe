/**
 * Fail-fast environment validation — the Zod half of the env contract, kept in
 * its own module so Zod NEVER enters the client bundle (docs/audit/
 * 2026-07-health-audit.md §1.2). Only `next.config.ts` imports this, for its
 * side effect, so it runs once at startup in every mode (`next dev`, `build`,
 * `start`) before app code executes — and never reaches the browser, because
 * no client-reachable module imports it.
 *
 * It validates the raw reads owned by `./env.ts` (the single `process.env`
 * reader). The schema here is the source of truth for what is VALID; the plain
 * defaults/coercion in `env.ts` build the typed values assuming that validity.
 * Keep the two in sync — a field added in one must be added in the other.
 */
import { z } from "zod";

import { RAW_ENV } from "./env";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  // Same-origin default; mirrors ENV_CONFIG.NEXT_PUBLIC_API_BASE_URL.
  NEXT_PUBLIC_API_BASE_URL: z.string().default(""),
  // "true" | "false", default "true"; mirrors the `!== "false"` coercion in
  // ENV_CONFIG.NEXT_PUBLIC_ENABLE_SHOWCASE.
  NEXT_PUBLIC_ENABLE_SHOWCASE: z.enum(["true", "false"]).default("true"),
});

const parsed = envSchema.safeParse(RAW_ENV);

if (!parsed.success) {
  // `z.prettifyError` renders one line per issue with the offending variable
  // name, so the thrown message names exactly what is missing or invalid.
  throw new Error(`Invalid environment configuration:\n${z.prettifyError(parsed.error)}`);
}
