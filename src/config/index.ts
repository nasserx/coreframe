/**
 * Public configuration module exports.
 *
 * Environment configuration is intentionally not re-exported here: importing
 * it executes fail-fast validation, and unrelated config consumers should not
 * trigger that. Import it directly from `@/config/env`.
 */
export * from "./app";
export * from "./features";
export * from "./routes";
