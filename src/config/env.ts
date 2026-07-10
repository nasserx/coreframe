/**
 * Centralized environment configuration with fail-fast validation.
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
