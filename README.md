# Frontend Foundation

A reusable, domain-neutral Next.js (App Router) application base for future
web products: agreed tooling, folder boundaries, a token-driven theme system,
testing, and standards — no product features or business logic. The Showcase
routes are Foundation inspection code, not product pages. This README is the
entry point; every deeper topic links to its owning document.

## Start here

1. **Building a product from this repo?** Follow **[`docs/CLONING.md`](docs/CLONING.md)** —
   the clone-and-rename procedure and a first-run checklist that takes you
   from clone to your first product page in under 30 minutes.
2. **Contributing to the foundation itself?** Read `ARCHITECTURE.md`, then
   `CONTRIBUTING.md` and `CODE_STYLE.md`.
3. **Wondering why something is missing?** It is probably deliberate — see
   **[`docs/ROADMAP.md`](docs/ROADMAP.md)** for what is intentionally absent
   and what signal triggers building it.

Requirements: **Node 24.18.0** (`.nvmrc` pins the CI and local runtime;
`package.json#engines` supports Node `>=24.18.0 <25`) and npm.

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
| `docs/DIRECTION_AND_I18N.md` | RTL/Arabic support, logical properties, the message translation layer    |
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
  locale, query, error boundary, toaster) and shared error UI; logger/
  monitoring/analytics/guards/accessibility are chartered placeholders.
- `src/components`: intentionally cross-feature presentation components;
  primitives in `src/components/ui`.
- `src/features`: feature-first product modules (currently only `showcase`).
- `src/api`: the API boundary — `apiFetch` and the typed `ApiError` contract.
- `src/i18n`: the message layer — typed catalogues and the pure translation
  resolver; its client runtime is `LocaleProvider` in `src/core/providers`.
- `src/services`: application service boundaries (chartered placeholder).
- `src/store`: shared client state (empty by design; see `docs/DATA_LAYER.md`).
- `src/styles`: the CSS token system — the single source of truth for theming.
- `src/theme`: the TypeScript breakpoint mirror only (matchMedia cannot read
  CSS variables).
- `src/config`: app identity, environment validation, flags, route constants.
- `src/assets`: source-controlled fonts/icons/images; third-party assets ship
  with their licenses (Tajawal Arabic subsets: SIL OFL 1.1,
  `src/assets/fonts/OFL.txt`).
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
imports `src/config/env-validation.ts` (the Zod validator, kept separate so
Zod never ships to the client — `src/config/env.ts` holds the client-safe
typed values). It throws with the offending variable names. See the comment
in `env.ts` for how to add a variable.

## License

This repository is **private** and carries **no open-source license** —
default copyright applies (all rights reserved). It is not
distributed publicly; do not add a project license unless it is deliberately
made public (see `DECISIONS.md` → _Private repository, no project license_ for
the checklist that reversal would require).

This says nothing about the fonts, whose licences are third-party obligations
independent of the repo's own status. The built application self-hosts and
redistributes **all three** families — **Tajawal** (Arabic), **Inter**
(Latin identity face), and **Geist Mono** (code face) — each under the **SIL
Open Font License 1.1**. Tajawal is the only one committed to this repo as
source files, so its full OFL text is vendored at `src/assets/fonts/OFL.txt` and
must keep shipping alongside those files. Inter and Geist Mono are fetched
by `next/font` at build time, and the woff2 files it generates carry their
copyright notice and OFL licence reference in the font's name-table metadata.

## Direction & internationalization

The foundation is direction-agnostic and Arabic-ready: all styling uses CSS
logical properties (lint-enforced), and the sans stack lists Tajawal first —
vendored as Arabic-only subsets and scoped by `unicode-range`, so Latin renders
in Inter while Arabic cannot be intercepted by the Latin metric fallback.
Locale/direction/numeral configuration lives in `src/config/app.ts`.

**Message translation ships.** It is a typed in-repo layer — `src/i18n`
(catalogues typed against canonical English, so a missing key fails
`typecheck`, plus a pure `{placeholder}` resolver) with `LocaleProvider` in
`src/core/providers` as its client runtime and `LocaleControl` as the
switcher. Two decisions shaped it, both recorded in `DECISIONS.md`:

- **Static locale per deployment, no locale routing.** Every route stays
  statically prerendered, which rules out cookie, domain, and sub-path
  strategies; a multi-locale deployment layers a client-side switch modelled
  on the theme runtime (localStorage + cross-tab sync + a pre-paint
  `lang`/`dir` script). Direction always follows the selected language — it is
  never an independent toggle.
- **No i18n library.** Since the foundation does not use locale routing or
  negotiation, what remained is ~150 lines; shipping a library's runtime on
  the single-locale common path to use a fraction of it is the opposite of the
  discipline that removed axios and zustand.

The default catalogue is bundled and every other locale is code-split, so a
single-locale deployment pays effectively nothing and never downloads a second
locale's bytes. Full architecture: `docs/DIRECTION_AND_I18N.md`.
