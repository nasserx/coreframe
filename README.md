# Frontend Foundation

Frontend Foundation is a reusable Next.js application base for future web products. Its purpose is to provide a clean, scalable starting point with agreed tooling, folder boundaries, and documentation before product-specific implementation begins.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query
- React Hook Form
- Zod
- ESLint

HTTP goes through the foundation's own `apiFetch` (native fetch + one typed
error shape, `src/api`) — no axios. Shared client-state libraries are added
by products when needed, not preinstalled (`docs/DATA_LAYER.md`).

## Folder Overview

- `src/app`: Next.js App Router entry point.
- `src/assets`: Source-controlled fonts, icons, and images. Bundled third-party assets ship with their licenses (Noto Sans Arabic: SIL OFL 1.1, `src/assets/fonts/OFL.txt`).
- `src/components`: Future shared presentation components.
- `src/features`: Feature-first product modules.
- `src/services`: Application service boundaries.
- `src/api`: The API boundary — `apiFetch` (native fetch client) and the typed `ApiError` contract (`docs/DATA_LAYER.md`).
- `src/store`: Shared client-side state (empty by design; see `docs/DATA_LAYER.md` for what belongs in a store vs the query cache vs the URL).
- `src/hooks`: Shared React hooks.
- `src/lib`: Library integration and framework-adjacent helpers.
- `src/utils`: Small framework-agnostic utilities.
- `src/types`: Shared TypeScript types.
- `src/constants`: Shared constants.
- `src/config`: Application configuration.
- `src/styles`: Shared styling organization.

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Format

```bash
npm run format        # rewrite files with Prettier
npm run format:check  # verify only (used in CI)
```

## Typecheck

```bash
npm run typecheck
```

## Test

```bash
npm test              # unit/component layer (Vitest + Testing Library)
npm run test:watch    # watch mode
npm run build && npm run test:e2e   # browser layer (Playwright): console
                                    # cleanliness, font loading, axe scans,
                                    # app-shell operability
```

One-time setup for the browser layer: `npx playwright install chromium`.
Stack rationale, layer responsibilities, and extension guidance:
`docs/TESTING.md`.

## Quality Gates

Two layers keep the baseline enforced instead of advisory:

- **On commit** (Husky): `pre-commit` runs lint-staged — `eslint --fix` and
  `prettier --write` on staged files only, so commits stay fast. `commit-msg`
  runs commitlint with the Conventional Commits rules (allowed types are
  documented in `commitlint.config.mjs`).
- **In CI** (`.github/workflows/ci.yml`, on pull requests and pushes to
  `main`): `npm ci`, then `format:check`, `lint`, `typecheck`, unit tests,
  `build`, and the Playwright browser suites (console cleanliness across the
  route × theme × direction matrix, Arabic font loading, axe accessibility
  scans), in order, failing fast. The Node version comes from `.nvmrc`.
  Pre-commit deliberately runs no tests — correctness gating lives in CI
  (`docs/TESTING.md`).

Environment variables are validated fail-fast at startup: `next.config.ts`
imports `src/config/env.ts`, which throws with the offending variable names
if the schema does not parse. See the comment in `env.ts` for how to add a
new variable.

## Layout

A small layout vocabulary makes the common product layouts consistent:
`Container` (page width), `Stack` (named vertical-rhythm steps), `PageHeader`
(page scaffold), and `AppShell` (responsive, accessible application chrome
with sidebar/header/main regions and a built-in skip link). Content measure
is tokenized (`max-w-prose` / `max-w-form`); dense data surfaces stay
uncapped. Contracts and rationale: `docs/LAYOUT.md`; live demo:
`/showcase/layout`.

## Data Layer

Server data flows through one boundary: `apiFetch` (`src/api`) — native
fetch with a validated base URL, timeout, cancellation, opt-in Zod response
validation, and every failure normalized into a single typed `ApiError`.
React Query consumes it with per-feature typed key factories. Route-level
error handling (`error.tsx`, `global-error.tsx`, `not-found.tsx`) shares
one fallback UI with the client ErrorBoundary. Contracts, patterns, and the
guidance for pointing a product at its own backend: `docs/DATA_LAYER.md`;
live demo: `/showcase/data`.

## Direction & Internationalization

The foundation is direction-agnostic and Arabic-ready: all styling uses CSS
logical properties (lint-enforced), the sans stack falls through from Geist to
Noto Sans Arabic, and locale/direction/numeral configuration lives in
`src/config/app.ts`. Message translation is deliberately not included — see
`docs/DIRECTION_AND_I18N.md` for the architecture and the integration points
for adding an i18n library.

## Project Goals

- Keep the foundation minimal and production-ready.
- Use `src` as the single application root.
- Preserve clear ownership boundaries between app, features, shared code, and infrastructure.
- Prefer feature-first organization as the product grows.
- Establish consistent standards before implementation begins.
