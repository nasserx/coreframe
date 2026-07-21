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

## Dependency Direction (lint-enforced via folder-scoped `no-restricted-imports` in `eslint.config.mjs`)

Specific → shared, never the reverse:

- `app` → may import `features`, `core`, foundation.
- `features` → may import `components`, `core`, `api`, `services`, `store`, and foundation. **Not** sibling features (unless an explicit shared contract exists), not `app`.
- `core` → foundation only. **Never** `features` or `app`.
- `components` → **never** import from `features`.
- `theme`, `config`, `constants`, `types`, `utils` → independent from routes and features; `utils` stays framework-agnostic (no React/Next).
- Cross-folder imports use `@/`; barrels (`index.ts`) only for stable public APIs.

## Theme Runtime

CSS custom properties are the **single source of truth** (full contract: `docs/DESIGN_TOKENS.md`):

1. `src/styles/base.css` — theme-neutral tokens: `--radius-base: 0.5rem` (controls sit at `rounded-lg` = 8px, surfaces at `xl`+ via the multiplier scale in `theme.css` — crisp controls, recognisably rounded surfaces; Badge is deliberately `rounded-md`, not the registry pill) and the motion tokens `--motion-quick: 120ms` / `--motion-moderate: 200ms` (+ `--ease-out-soft` in the bridge — motion is feedback/orientation only; `transition-*` defaults resolve through the tokens, raw `duration-N` in components is drift; reduced motion is handled once globally in `globals.css`).
2. `src/styles/light.css` / `dark.css` — semantic `--color-*` and `--elevation-*` variables per theme, full parity required (`.dark` class toggles; `@custom-variant dark` in `theme.css`). Identity: flat/editorial — warm paper (oklch hue 84, cream cast), near-black primary (near-white in dark; no saturated hue on chrome — hue is reserved for status/charts), hairline borders carry structure, `--elevation-xs/sm` are empty (shadows exist only for floating layers md+; dark elevation is the lightness ladder 0.145 → 0.205 → 0.265).
3. `src/styles/theme.css` — bridge mapping semantic variables into Tailwind v4 `@theme inline` and shadcn/ui variable names (`--primary`, `--card`, `--sidebar-*`, `--shadow-*`, …), plus the theme-neutral type ramp (`--text-display` … `--text-caption` → `text-*` utilities; display/title are 800-weight, tight-tracked, compact-leaded). No `--font-heading` — headings differ by weight/tracking only, one family (Archivo) for headings and body.
4. `src/theme/breakpoints.ts` — the only TS token file (matchMedia can't read CSS variables); must mirror Tailwind's default screens. Never add a TS mirror of a CSS token.

Focus/invalid language (`docs/DESIGN_TOKENS.md` §2): a solid 2px `--ring` line everywhere — attached (border + `ring-1`) on inputs/textareas, offset 2px on standalone controls (the ring barely contrasts with the near-black primary fill; the gap makes it perceptible), attached on nested toggle/tab items, inset on scroll viewports, and a global `:focus-visible` outline rule in `globals.css` as the fallback — never a translucent halo, never the UA default. Invalid = 1px destructive border (FieldError text + `aria-invalid` carry it beyond color); focused+invalid = the 2px focus geometry in destructive.

Entry: `src/app/globals.css` imports `tailwindcss`, `tw-animate-css`, `shadcn/tailwind.css`, then `src/styles/index.css`. Never hardcode colors in components — use semantic Tailwind utilities that resolve through the bridge. Spacing stays Tailwind's default scale (no project tokens); motion is tokenized (see item 1). Any lightness change to a color token requires re-verifying the WCAG AA pairs in `docs/DESIGN_TOKENS.md` §3.

Layout (`docs/LAYOUT.md`; live demos `/showcase/layout` and `/showcase/site`): content measure is tokenized — `--container-prose: 65ch` / `--container-form: 28rem` in `theme.css` → `max-w-prose`/`max-w-form`; a block is prose-capped, form-capped, or full-width, never ad-hoc `max-w-*`. Vertical rhythm is the five named Stack steps (`xs`…`xl` → gap-1/2/4/8/12, named by sibling relationship) in `src/components/ui/stack.tsx`. Page scaffold: `PageHeader` (+Title/Description). Application chrome: `AppShell` (+Sidebar/SidebarTrigger/Header/Main) — grid shell, document-level scroll, mobile modal drawer built on the Base UI Dialog, built-in `SkipLink`, landmark/focus guarantees, consumes the `sidebar-*` tokens, fully logical-property based. Public-site chrome: `SiteShell` (+Header/Nav/NavItem/NavTrigger/Main/Footer) — sticky top bar with brand/nav/actions slots, footer, same drawer mechanics and guarantees, base tokens only; the collapse breakpoint is a prop (`collapseBelow`, no universal default is correct — measure the bar's content), and an href-less `SiteShellNavItem` is the unavailable-destination pattern (non-focusable muted text + sr-only hint, never a dead link — the same rule extends to action-shaped demo affordances via `buttonVariants` on a non-focusable span). Nav items sit at `text-small` on a three-step ladder where hover inverts the usual direction (idle = foreground+normal, _lightening_ to muted on hover so the item recedes; current = foreground+semibold via `aria-current` — weight carries current because idle is already full-strength, and weight, unlike an underline, doesn't fight a future dropdown; unavailable = muted+normal). Hover is color-only, no moving element. The brand out-ranks nav (`text-subheading` bold, its own cluster with `me-4` breathing room in the demo); header action CTAs are `size="lg"` while the utility toggles stay compact (two coherent sub-groups, centre-aligned). Both shells' sticky headers draw their bottom hairline only once scrolled (`use-scrolled` sentinel + `data-scrolled`); Container caps at `max-w-6xl` (1152px) for dense surfaces — prose in a Container must still carry `max-w-prose`. The `<main>` landmark is owned by layouts, never pages (`AppShellMain`/`SiteShellMain`, or a bare route-group layout like `src/app/(home)/layout.tsx`; root boundary files own theirs). Grids, rows, and one-off alignment stay plain Tailwind — do not add wrapper primitives for them.

Direction & script: `<html lang/dir>` come from `APP_CONFIG` (`src/config/app.ts`) — `APP_LOCALES` supports `en`/`ar`, `LOCALE_INFO` declares per-locale `direction` and `numerals` (Western `latn` default, `arab` opt-in); direction is static per deployment. Font stack: `--font-sans` = Noto Sans Arabic (first, but scoped to Arabic code points via `unicode-range`; self-hosted via `next/font/local` with `size-adjust: 115%` for optical parity) → Archivo (the identity face, `next/font/google`; Geist Mono remains the code face). Never reorder: any next/font Latin face carries an Arial-based metric fallback that contains Arabic glyphs and intercepts Arabic if Noto sits after it. `[dir="rtl"]` overrides in `theme.css` loosen ramp line-heights and zero tracking for Arabic. Bidi: `code`/`pre` are forced LTR-isolated in `globals.css`; use `<bdi>` for inline opposite-direction runs, `dir="auto"` for unknown-direction blocks. Full architecture: `docs/DIRECTION_AND_I18N.md`.

Runtime: `ThemeProvider` (`src/core/providers/theme-provider.tsx`) supports `"light" | "dark" | "system"` — localStorage persistence (key `theme`), cross-tab sync via the storage event, live matchMedia tracking for system, and a pre-paint inline script for zero-flash first paint (routes stay statically prerendered; a cookie would force dynamic rendering). Consume via `useTheme()` → `{ theme, resolvedTheme, setTheme }`; never toggle the `dark` class manually. Reusable selector: `src/components/ui/theme-control.tsx`; the sonner Toaster follows `resolvedTheme`. Details: `docs/DESIGN_TOKENS.md` §5.

Data layer (`docs/DATA_LAYER.md`; live demo `/showcase/data`): all HTTP goes through `apiFetch` (`src/api/client.ts`) — native fetch, base URL from `NEXT_PUBLIC_API_BASE_URL` (validated in `env.ts`, empty = same-origin), 10s default timeout, React Query's `signal` passed through, opt-in Zod validation via `schema` (no schema ⇒ `unknown` return, casts are deliberate). Every failure is one typed `ApiError` (`kind: network | timeout | http | parse`; caller aborts rethrown untouched); auth is a marked extension point in `client.ts`. Query keys come from per-feature typed factories (reference: `src/features/showcase/api.ts`) — no string keys at call sites; invalidate by factory prefix. Route-level error handling: `error.tsx` (uses Next 16 `unstable_retry`), `global-error.tsx` (rebuilds document shell: fonts from `src/app/fonts.ts`, `THEME_INIT_SCRIPT` + `applyStoredTheme()` for theme, APP_CONFIG lang/dir), `not-found.tsx` — all composing `src/core/errors/error-fallback.tsx`, the same UI the client `ErrorBoundary` uses. The showcase data demo fetches this repo's own route handler (`src/app/api/showcase/records/route.ts`, `force-static` so the route table stays fully prerendered).

## Engineering Principles

- Stay simple; add specificity only when a product need justifies it.
- Feature code lives with its feature; promote to shared folders only after reuse is _real_, never speculatively.
- Routing composes; components present; utilities stay pure; core never owns product behavior.
- No new dependencies without documented trade-offs (add to `DECISIONS.md`).

## Design Philosophy (for primitives)

Small, accessible, composable primitives in `src/components/ui`; domain-neutral names; token-driven styling; controlled/uncontrolled APIs documented; refs forwarded only when consumers need the DOM node; `asChild` only for element replacement; primitives own UI interaction state only — never server state, auth, or workflows. `DESIGN_SYSTEM.md` has the full checklist — run it before calling a primitive done.

## Coding Standards (lint-enforced where possible)

- kebab-case files/folders; PascalCase only for single-component files; `.tsx` iff JSX.
- **Named exports only** — default exports reserved for framework files (App Router route files, configs); ESLint enforces this.
- `import type` for type-only imports (inline style enforced); import order: React/Next → third-party → `@/` → relative → styles.
- No `any`; strict tsconfig incl. `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax` — treat these as correctness, not noise.
- `SCREAMING_SNAKE_CASE` true constants; env vars only through `src/config/env.ts` (Zod-validated, fail-fast) — never `process.env` elsewhere; `NEXT_PUBLIC_` only for browser-safe values.
- Curly braces always; `eqeqeq`; no long relative paths (`../../../` banned).
- **Logical CSS properties only** (`ms-`/`me-`, `ps-`/`pe-`, `start-`/`end-`, `text-start`/`text-end`, `rounded-s-`/`rounded-e-`, `border-s`/`border-e`) — physical direction utilities fail lint via `foundation/no-physical-tailwind-classes` (inline rule in `eslint.config.mjs`; escape hatch: eslint-disable with a justification). Directional icons flip individually with `rtl:rotate-180`; centered overlays use `inset-x-0 mx-auto`, not `left-1/2 -translate-x-1/2`. See `docs/DIRECTION_AND_I18N.md`.

## Tech Stack

Next.js 16 App Router (**breaking changes vs training data — read `node_modules/next/dist/docs/` first, per AGENTS.md**), React 19, TypeScript strict, Tailwind CSS v4 (CSS-first config; no `tailwind.config`), shadcn/ui (style `base-nova`, Base UI runtime `@base-ui/react`, lucide icons, `components.json` at root), React Query (server state; contract in `docs/DATA_LAYER.md`), Zod v4 (note: `z.prettifyError`-era API), sonner (toasts). HTTP is native fetch via `apiFetch` (`src/api`) — axios, zustand, and react-hook-form were deliberately removed as unused (`DECISIONS.md`); RHF is still the chosen form library, reinstalled when the reference form wiring is built; do not reintroduce a store library without a product need.

Commands: `npm run dev` / `build` / `lint` (flat ESLint config) / `format` + `format:check` (Prettier, tailwind class sorting) / `typecheck` (`tsc --noEmit`) / `test` + `test:watch` (Vitest unit/component) / `test:e2e` (Playwright; requires a prior `build`, one-time `npx playwright install chromium`). Quality gates: Husky pre-commit runs lint-staged (eslint --fix + prettier on staged files; deliberately no tests), commit-msg runs commitlint (Conventional Commits); CI (`.github/workflows/ci.yml`) runs format:check → lint → typecheck → test → build → test:e2e on PRs and pushes to `main`. Env validation (`src/config/env.ts`) executes at startup via a side-effect import in `next.config.ts`.

Testing (`docs/TESTING.md` for full rationale): Vitest + Testing Library, jsdom, tests colocated as `src/**/*.test.{ts,tsx}` (reference tests: `cn`, Button incl. the render-prop slot contract, ErrorBoundary, theme runtime, token parity); Playwright in `tests/e2e` — console-cleanliness harness over every discovered route × theme × direction (runs against `next dev` because React only reports attribute-level hydration mismatches in development builds), `document.fonts` assertion that Noto Sans Arabic is loaded AND used, axe WCAG A/AA scans, the shell operability tests (`shell.spec.ts`: drawer, focus return, skip link at mobile + desktop widths, for both AppShell and SiteShell), and the horizontal-overflow sweep (`overflow.spec.ts`: every route × width range × direction, page-level and bar-level) — all four against `next start`. Routes are discovered from `src/app` (`tests/e2e/routes.ts`) — never hard-code route lists; dynamic segments throw until discovery is extended.

## Current Project Status

Template-ready. The repo is meant to be used as a GitHub template: clone-and-rename procedure and first-run checklist in `docs/CLONING.md`; deliberate omissions and known issues in `docs/ROADMAP.md`; point-in-time reviews archived in `docs/audit/` (never read those as current state). `/showcase` is gated by `NEXT_PUBLIC_ENABLE_SHOWCASE` (default on; `false` at build time prerenders every showcase route and its API endpoint as a static 404 — routes stay static either way). Node contract: `.nvmrc` (20) + `package.json#engines` (>=20). Implemented: folder skeleton with READMEs, theme token system, CSS theme runtime (light/dark), config modules (`app`, `env`, `features`, `routes`), `AppProvider` composing Theme/Query/ErrorBoundary/Toaster, 20 shadcn/ui primitives plus the layout set (Container, Stack, PageHeader, AppShell, SiteShell, SkipLink), the `/showcase` inspection routes (the `(app)` group wrapped in the AppShell, the `(site)` group in the SiteShell), the data layer (`apiFetch` + `ApiError` in `src/api`, query key contract, route-level `error`/`global-error`/`not-found` files, showcase route handler), both test layers, strict TS/ESLint setup, `.gitattributes` line-ending normalization.

## Completed Milestones

1. Repo initialized from create-next-app; `src`-rooted structure established.
2. Full documentation set (architecture, design system, code style, contributing, decisions).
3. Theme runtime (tokens → CSS variables → Tailwind bridge) and strict tooling baseline.
4. Testing baseline: Vitest unit/component layer, Playwright browser layer (console harness, font-loading assertion, axe scans), wired into CI; Noto font ships with its OFL 1.1 license (`src/assets/fonts/OFL.txt`).
5. Layout vocabulary: measure tokens, Stack rhythm scale, PageHeader scaffold, accessible responsive AppShell (`docs/LAYOUT.md`); showcase migrated onto it; shell keyboard/focus tests in both layers.
6. Data layer contract: fetch-based `apiFetch` with the typed `ApiError` shape, query key/caching contract (`docs/DATA_LAYER.md`), route-level error/not-found handling verified against a production build, axios and zustand removed as unused.
7. Template readiness: documentation reconciled with the code, showcase build gate, `docs/CLONING.md` + `docs/ROADMAP.md`, engines field, rebranding procedure empirically verified (`docs/DESIGN_TOKENS.md` §4), full-matrix-on-PR CI decision recorded with measured numbers (`docs/TESTING.md` §CI).
8. First-product backport: gaps surfaced by the first real clone (an Arabic-first public site) closed — `SiteShell` public-site chrome with configurable collapse and the unavailable-destination pattern, the e2e horizontal-overflow sweep, layout-owned `<main>` landmark rule, `ThemeControl.optionLabels` + `ErrorFallback.className`, and the `docs/CLONING.md` corrections (error-route copy as a rename location, complete showcase-deletion path).
9. Flat visual identity: warm-paper palette with near-black primary (hue reserved for status/charts), flat elevation model (empty xs/sm, hairline structure, widened dark lightness ladder), Archivo as the single identity face with a heavier/tighter ramp, `BrandMark` component + `src/app/icon.svg` favicon (verified `<link rel="icon">` in build output), full §3 contrast recomputation, rebrand guide rewritten from the second rebrand's lessons (`docs/DESIGN_TOKENS.md` §4).

## Upcoming Priorities (in rough order)

`docs/ROADMAP.md` is the authoritative list of deliberate omissions, their extension points, and the product signal that triggers each. Headline order:

1. Reference React Hook Form + Zod form wiring (reinstall RHF + resolvers then; the last unbuilt piece of the decided stack).
2. Localization/auth providers in `AppProvider` as concrete needs arrive (TODO slots reserved).
3. Extend `src/core` placeholders (logger, monitoring) when the first product needs them — error reporting hooks are marked in `error.tsx` and `ErrorBoundary`.

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
