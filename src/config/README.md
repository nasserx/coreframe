# Config

Purpose: Application configuration modules.

Current contents: `app.ts` (identity, locales, direction), `env.ts` (Zod-validated environment access — the only file allowed to read `process.env`), `features.ts` (build-time feature flags), `routes.ts` (route constants), `index.ts` (public barrel; deliberately excludes `env.ts`).

Belongs here: environment-derived settings, typed configuration boundaries, and app-level configuration defaults.

Must not be placed here: secrets committed to source control, React components, hooks, feature behavior, API implementation details, or static constants unrelated to configuration.
