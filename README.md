# Frontend Foundation

A reusable, domain-neutral Next.js (App Router) application base for future
web products: agreed tooling, folder boundaries, a token-driven theme system,
testing, and standards — no features, pages, or business logic. This README
is the entry point; every deeper topic links to its owning document.

## Start here

1. **Building a product from this repo?** Follow **[`docs/CLONING.md`](docs/CLONING.md)** —
   the clone-and-rename procedure and a first-run checklist that takes you
   from clone to your first product page in under 30 minutes.
2. **Contributing to the foundation itself?** Read `ARCHITECTURE.md`, then
   `CONTRIBUTING.md` and `CODE_STYLE.md`.
3. **Wondering why something is missing?** It is probably deliberate — see
   **[`docs/ROADMAP.md`](docs/ROADMAP.md)** for what is intentionally absent
   and what signal triggers building it.

Requirements: **Node ≥ 20** (`.nvmrc` pins 20; `package.json#engines`
enforces the floor) and npm.

```bash
npm install
npm run dev        # http://localhost:3000 — /showcase is the living demo
```

## Documentation map

| Document                     | Owns                                                                     |
| ---------------------------- | ------------------------------------------------------------------------ |
| `ARCHITECTURE.md`            | Layers, folder charters, dependency direction, theme runtime overview    |
| `docs/CLONING.md`            | Using this repo as a template: rename, configure, first-run checklist    |
| `docs/ROADMAP.md`            | What is deliberately not built yet, and known open issues                |
| `docs/DESIGN_TOKENS.md`      | The full token contract, verified contrast, rebranding procedure         |
| `docs/LAYOUT.md`             | Layout vocabulary: measure, rhythm, PageHeader, AppShell                 |
| `docs/DATA_LAYER.md`         | `apiFetch`, `ApiError`, React Query contract, route-level error handling |
| `docs/DIRECTION_AND_I18N.md` | RTL/Arabic support, logical properties, i18n integration points          |
| `docs/TESTING.md`            | Both test layers, what is deliberately untested, CI                      |
| `docs/UI_LIBRARY.md`         | The shadcn/Base UI adaptation standard for `src/components/ui`           |
| `DESIGN_SYSTEM.md`           | Primitive design philosophy and completion checklist                     |
| `CODE_STYLE.md`              | Naming, imports, exports, TypeScript usage                               |
| `CONTRIBUTING.md`            | Feature placement, shared-code promotion, PR expectations                |
| `DECISIONS.md`               | The decision log — every stack choice with reasoning                     |
| `docs/audit/`                | Historical point-in-time reviews (do not read as current state)          |

## Tech stack

Next.js App Router · React · TypeScript (strict) · Tailwind CSS v4
(CSS-first) · shadcn/ui on the Base UI runtime · React Query · Zod · sonner.
HTTP goes through the foundation's own `apiFetch` (native fetch + one typed
error shape, `src/api`) — no axios. Form and client-state libraries (React
Hook Form, zustand — both already decided in `DECISIONS.md`) are installed
when a product first needs them, not preinstalled. Every dependency has a
`DECISIONS.md` entry.

## Folder overview

- `src/app`: App Router files only (routes, layouts, route-level error files).
- `src/core`: cross-cutting infrastructure — provider composition (theme,
  query, error boundary, toaster) and shared error UI; logger/monitoring/
  analytics/guards/accessibility are chartered placeholders.
- `src/components`: intentionally cross-feature presentation components;
  primitives in `src/components/ui`.
- `src/features`: feature-first product modules (currently only `showcase`).
- `src/api`: the API boundary — `apiFetch` and the typed `ApiError` contract.
- `src/services`: application service boundaries (chartered placeholder).
- `src/store`: shared client state (empty by design; see `docs/DATA_LAYER.md`).
- `src/styles`: the CSS token system — the single source of truth for theming.
- `src/theme`: the TypeScript breakpoint mirror only (matchMedia cannot read
  CSS variables).
- `src/config`: app identity, environment validation, flags, route constants.
- `src/assets`: source-controlled fonts/icons/images; third-party assets ship
  with their licenses (Noto Sans Arabic: SIL OFL 1.1, `src/assets/fonts/OFL.txt`).
- `src/hooks`, `src/lib`, `src/utils`, `src/types`, `src/constants`:
  foundation folders — each README states what belongs and what must not.

## The showcase

`/showcase` is the foundation's living integration test: every primitive,
token, layout, and data-layer contract rendered and exercised by the browser
test matrix. It is **not** product UI.

- **Development:** enabled by default; keep it while building.
- **Release:** set `NEXT_PUBLIC_ENABLE_SHOWCASE=false` at build time and every
  `/showcase` route (and its `/api/showcase/records` endpoint) prerenders as a
  static 404 — no dynamic rendering, no code changes.
- **Permanently:** delete the three showcase locations (`docs/CLONING.md`).

## Commands

```bash
npm run dev           # dev server
npm run build         # production build (all routes statically prerendered)
npm run lint          # ESLint (includes the dependency-direction and
                      # logical-properties rules)
npm run format        # Prettier write; format:check verifies (CI)
npm run typecheck     # tsc --noEmit
npm test              # unit/component layer (Vitest + Testing Library)
npm run test:e2e      # browser layer (Playwright); needs `npm run build`
                      # first and a one-time `npx playwright install chromium`
```

## Quality gates

- **On commit** (Husky): lint-staged (`eslint --fix` + `prettier --write` on
  staged files); commitlint enforces Conventional Commits.
- **In CI** (`.github/workflows/ci.yml`, PRs and pushes to `main`): `npm ci`,
  then `format:check → lint → typecheck → unit tests → build → browser
tests`, failing fast. Node version comes from `.nvmrc`. The workflow needs
  no secrets or configuration — it works on day one in a fresh clone/fork.

Environment variables are validated fail-fast at startup: `next.config.ts`
imports `src/config/env.ts`, which throws with the offending variable names.
See the comment in `env.ts` for how to add a variable.

## Direction & internationalization

The foundation is direction-agnostic and Arabic-ready: all styling uses CSS
logical properties (lint-enforced), and the sans stack lists Noto Sans Arabic
first — scoped to Arabic code points via `unicode-range`, so Latin renders in
Geist while Arabic can never be intercepted by a metric fallback.
Locale/direction/numeral configuration lives in `src/config/app.ts`. Message
translation is deliberately not included — `docs/DIRECTION_AND_I18N.md` has
the architecture and the integration points for adding an i18n library.
