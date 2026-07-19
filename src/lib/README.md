# Lib

Purpose: Low-level library integrations and framework-adjacent helpers.

Current contents: `utils.ts` — the shadcn `cn()` class-merge helper (clsx + tailwind-merge), aliased as `@/lib/utils` per `components.json`.

Belongs here: thin wrappers around third-party libraries, initialization helpers, and platform utilities that do not fit a narrower folder.

Must not be placed here: broad catch-all utilities, React components, hooks, feature logic, API endpoint modules, or application configuration values.
