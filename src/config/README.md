# Config

Purpose: Application configuration modules.

Current contents: `app.ts` (identity, locales, direction), `env.ts` (the client-safe `process.env` reader and typed/defaulted values), `env-validation.ts` (the server-only Zod schema loaded by `next.config.ts`), `features.ts` (build-time feature flags), `routes.ts` (route constants), and `index.ts` (the public barrel; deliberately excludes environment modules).

Belongs here: environment-derived settings, typed configuration boundaries, and app-level configuration defaults.

Must not be placed here: secrets committed to source control, React components, hooks, feature behavior, API implementation details, or static constants unrelated to configuration.
