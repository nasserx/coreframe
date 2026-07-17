/**
 * Centralized environment configuration with fail-fast validation.
 *
 * This module is the only place allowed to read `process.env`. Importing it
 * runs validation immediately, so it is deliberately excluded from the config
 * barrel — consumers that need environment values import `@/config/env`
 * directly and accept the fail-fast behavior.
 */
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
});

const parsedEnv = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsedEnv.success) {
  throw new Error(`Invalid environment configuration: ${z.treeifyError(parsedEnv.error)}`);
}

export const ENV_CONFIG = parsedEnv.data;

export type EnvConfig = typeof ENV_CONFIG;
