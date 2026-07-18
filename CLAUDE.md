@AGENTS.md

# Frontend Foundation — Engineering Context

Persistent context for Claude Code sessions. Detailed rationale lives in `README.md`, `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `CODE_STYLE.md`, `CONTRIBUTING.md`, and `DECISIONS.md` — this file distills what matters while implementing. If those docs and this file disagree, the docs win; update this file.

## Project Mission

A reusable, domain-neutral Next.js (App Router) foundation for future web products. It provides tooling, folder boundaries, theming, and standards — not features, pages, or business logic. The current phase is _foundation only_: most folders intentionally contain just a README describing what will belong there.

## Long-Term Vision

Many future applications should be able to start from this repo without rebuilding architecture. Therefore the foundation must stay independent of any specific UI layout, navigation style, feature set, or business domain. Prefer leaving something out over baking in an assumption.

## Architecture Overview

Single source root `src/`. Layers:

- `src/app` — App Router files only (routes, layouts, metadata, framework wiring). No business logic.
- `src/core` — cross-cutting infrastructure: `providers`, `guards`, `errors`, `logger`, `monitoring`, `analytics`, `accessibility`. Root provider composition is `src/core/providers/app-provider.tsx` (currently a pass-through with TODOs for Theme, React Query, Toast, Error Boundary, Auth, Localization providers).
- `src/features` — feature-first product modules; each feature owns its components, hooks, schemas, types, state.
- `src/components` — intentionally cross-feature presentation components; shadcn/ui primitives go in `src/components/ui`.
- `src/services`, `src/api`, `src/store` — service abstractions, API boundary modules, shared Zustand stores.
- Foundation folders: `src/hooks`, `src/lib`, `src/utils`, `src/types`, `src/constants`, `src/config`, `src/styles`, `src/theme`, `src/assets`.

Each folder has a README stating what belongs / must never be placed there — read it before adding files.

## Dependency Direction (enforce by hand; no tooling yet)

Specific → shared, never the reverse:

- `app` → may import `features`, `core`, foundation.
- `features` → may import `components`, `core`, `api`, `services`, `store`, and foundation. **Not** sibling features (unless an explicit shared contract exists), not `app`.
- `core` → foundation only. **Never** `features` or `app`.
- `components` → **never** import from `features`.
- `theme`, `config`, `constants`, `types`, `utils` → independent from routes and features; `utils` stays framework-agnostic (no React/Next).
- Cross-folder imports use `@/`; barrels (`index.ts`) only for stable public APIs.

## Theme Runtime

CSS custom properties are the **single source of truth** (full contract: `docs/DESIGN_TOKENS.md`):

1. `src/styles/base.css` — theme-neutral tokens (`--radius-base`).
2. `src/styles/light.css` / `dark.css` — semantic `--color-*` and `--elevation-*` variables per theme, full parity required (`.dark` class toggles; `@custom-variant dark` in `theme.css`). Brand hue: oklch 262 (indigo-blue).
3. `src/styles/theme.css` — bridge mapping semantic variables into Tailwind v4 `@theme inline` and shadcn/ui variable names (`--primary`, `--card`, `--sidebar-*`, `--shadow-*`, …), plus the theme-neutral type ramp (`--text-display` … `--text-caption` → `text-*` utilities). No `--font-heading` — headings differ by weight/tracking only.
4. `src/theme/breakpoints.ts` — the only TS token file (matchMedia can't read CSS variables); must mirror Tailwind's default screens. Never add a TS mirror of a CSS token.

Entry: `src/app/globals.css` imports `tailwindcss`, `tw-animate-css`, `shadcn/tailwind.css`, then `src/styles/index.css`. Never hardcode colors in components — use semantic Tailwind utilities that resolve through the bridge. Spacing and motion contracts are Tailwind's defaults (no project tokens). Any lightness change to a color token requires re-verifying the WCAG AA pairs in `docs/DESIGN_TOKENS.md` §3.

## Engineering Principles

- Stay simple; add specificity only when a product need justifies it.
- Feature code lives with its feature; promote to shared folders only after reuse is _real_, never speculatively.
- Routing composes; components present; utilities stay pure; core never owns product behavior.
- No new dependencies without documented trade-offs (add to `DECISIONS.md`).

## Design Philosophy (for future primitives — none exist yet)

Small, accessible, composable primitives in `src/components/ui`; domain-neutral names; token-driven styling; controlled/uncontrolled APIs documented; refs forwarded only when consumers need the DOM node; `asChild` only for element replacement; primitives own UI interaction state only — never server state, auth, or workflows. `DESIGN_SYSTEM.md` has the full checklist — run it before calling a primitive done.

## Coding Standards (lint-enforced where possible)

- kebab-case files/folders; PascalCase only for single-component files; `.tsx` iff JSX.
- **Named exports only** — default exports reserved for framework files (App Router route files, configs); ESLint enforces this.
- `import type` for type-only imports (inline style enforced); import order: React/Next → third-party → `@/` → relative → styles.
- No `any`; strict tsconfig incl. `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax` — treat these as correctness, not noise.
- `SCREAMING_SNAKE_CASE` true constants; env vars only through `src/config/env.ts` (Zod-validated, fail-fast) — never `process.env` elsewhere; `NEXT_PUBLIC_` only for browser-safe values.
- Curly braces always; `eqeqeq`; no long relative paths (`../../../` banned).

## Tech Stack

Next.js 16 App Router (**breaking changes vs training data — read `node_modules/next/dist/docs/` first, per AGENTS.md**), React 19, TypeScript strict, Tailwind CSS v4 (CSS-first config; no `tailwind.config`), shadcn/ui (style `base-nova`, Base UI runtime `@base-ui/react`, lucide icons, `components.json` at root), React Query (server state), Zustand (shared client state), React Hook Form + Zod v4 (note: `z.treeifyError`-era API), Axios, sonner (toasts).

Commands: `npm run dev` / `build` / `lint` (flat ESLint config) / `format` + `format:check` (Prettier, tailwind class sorting) / `typecheck` (`tsc --noEmit`). Quality gates: Husky pre-commit runs lint-staged (eslint --fix + prettier on staged files), commit-msg runs commitlint (Conventional Commits); CI (`.github/workflows/ci.yml`) runs format:check → lint → typecheck → build on PRs and pushes to `main`. Env validation (`src/config/env.ts`) executes at startup via a side-effect import in `next.config.ts`.

## Current Project Status

Scaffold + standards phase. Implemented: folder skeleton with READMEs, theme token system, CSS theme runtime (light/dark), config modules (`app`, `env`, `features`, `navigation`, `permissions`, `roles`, `routes`), pass-through `AppProvider`, strict TS/ESLint setup. `src/app/page.tsx` and root metadata are still unmodified create-next-app starter content.

## Completed Milestones

1. Repo initialized from create-next-app; `src`-rooted structure established.
2. Full documentation set (architecture, design system, code style, contributing, decisions).
3. Theme runtime (tokens → CSS variables → Tailwind bridge) and strict tooling baseline.

## Upcoming Priorities (in rough order)

1. Implement `AppProvider` composition (Theme, React Query, Error Boundary, Toast) as concrete needs arrive.
2. Replace starter `page.tsx` / metadata (wire `APP_CONFIG` into root metadata).
3. Add first shadcn/ui primitives via the shadcn workflow into `src/components/ui`.
4. Introduce boundary-enforcement lint tooling for the dependency rules above.

## Architectural Constraints

- Foundation stays domain-neutral: no feature, layout, navigation pattern, or business assumption in shared code.
- `src/core` must never become a feature catch-all; foundation folders must never import features.
- CSS variables, not TS tokens, drive runtime theming.
- Barrel files only at stable public API boundaries.

## Things That Must Never Be Done

- Import `features` from `core`, `components`, or foundation folders.
- Read `process.env` outside `src/config`.
- Hardcode colors/spacing that bypass the semantic token bridge.
- Add default exports outside framework-required files.
- Create shared abstractions or move code to shared folders before reuse is proven.
- Add dependencies, cross-feature imports, or `any` without documented justification.
- Write Next.js code from memory of older versions — check the bundled docs in `node_modules/next/dist/docs/` first.
