# API

Purpose: The application's API boundary — the one place HTTP transport is configured and the one place transport failures are normalized.

Contents:

- `client.ts` — `apiFetch`: native fetch with base URL (from `src/config/env.ts`), default timeout, cancellation pass-through, opt-in Zod response validation, and the auth extension point.
- `errors.ts` — `ApiError`, the single typed error shape (`network | timeout | http | parse`) every consumer branches on.

Full contract, patterns, and rationale: `docs/DATA_LAYER.md`.

Belongs here: request definitions, endpoint modules, transport adapters, and API-specific typing.

Must not be placed here: UI components, React hooks, global stores, feature workflows, server route handlers (those live in `src/app/api`), or unrelated utility functions. Feature-specific endpoint modules (schema + key factory + fetcher) live with their feature, not here.
