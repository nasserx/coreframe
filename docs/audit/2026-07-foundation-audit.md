# Foundation Audit — July 2026

> **Historical snapshot** — see `docs/audit/README.md`. This audit describes the repository as it was at the audited commit; its findings drove the later phases and no longer reflect the current code.

Read-only audit of `frontend-foundation` at commit `fffe661` (branch `main`, clean tree).
All paths are repo-relative; line numbers refer to the audited state.

---

## 1. Structure

### 1.1 Directory contents under `src/`

| Directory        | Status            | Contents                                                                                                                                                                                                                                |
| ---------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app`        | Real code         | `layout.tsx`, `page.tsx`, `globals.css`, `showcase/` (layout + 9 pages: index, actions, data, display, feedback, forms, navigation, overlays, tokens)                                                                                   |
| `src/api`        | Empty placeholder | `README.md` only                                                                                                                                                                                                                        |
| `src/assets`     | Empty placeholder | `README.md` only                                                                                                                                                                                                                        |
| `src/components` | Real code         | `README.md`; `ui/` with 20 primitives: alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, card, container, dialog, field, input, label, pagination, scroll-area, separator, skeleton, spinner, table, tabs, textarea        |
| `src/config`     | Real code         | `app.ts`, `env.ts`, `features.ts`, `index.ts`, `routes.ts`, `README.md`                                                                                                                                                                 |
| `src/constants`  | Empty placeholder | `README.md` only                                                                                                                                                                                                                        |
| `src/core`       | Partially real    | `providers/` (`app-provider.tsx`, `query-provider.tsx`, `theme-provider.tsx`, `toaster.tsx`, `index.ts`), `errors/error-boundary.tsx`; `accessibility/`, `analytics/`, `guards/`, `logger/`, `monitoring/` are README-only placeholders |
| `src/features`   | Real code         | `README.md`; `showcase/components/` with 7 files: error-boundary-demo, query-demo, showcase-page-header, showcase-section, theme-status, toast-demo, token-swatch                                                                       |
| `src/hooks`      | Empty placeholder | `README.md` only                                                                                                                                                                                                                        |
| `src/lib`        | Real code         | `utils.ts` (`cn()`), `README.md`                                                                                                                                                                                                        |
| `src/services`   | Empty placeholder | `README.md` only                                                                                                                                                                                                                        |
| `src/store`      | Empty placeholder | `README.md` only                                                                                                                                                                                                                        |
| `src/styles`     | Real code         | `index.css`, `light.css`, `dark.css`, `theme.css`, `README.md`                                                                                                                                                                          |
| `src/theme`      | Real code         | `breakpoints.ts`, `colors.ts`, `transitions.ts`, `typography.ts`, `zIndex.ts`, `index.ts`                                                                                                                                               |
| `src/types`      | Empty placeholder | `README.md` only                                                                                                                                                                                                                        |
| `src/utils`      | Empty placeholder | `README.md` only                                                                                                                                                                                                                        |

`public/` is empty. `docs/` contains only `UI_LIBRARY.md`. `FOUNDATION_REVIEW.md` sits at repo root.

Documentation drift (facts, not boundary violations): `CLAUDE.md` claims `src/config` contains `navigation`, `permissions`, and `roles` modules — those files do not exist. It also claims `src/theme` covers "colors, spacing, radius, shadows, typography, transitions, z-index, breakpoints" — no spacing, radius, or shadow token file exists. `CLAUDE.md` also states `src/app/page.tsx` is "unmodified create-next-app starter content"; it is not (`src/app/page.tsx:1-10` renders `APP_CONFIG`).

### 1.2 Folder-ownership violations

None found. Each populated folder's contents match its README/`ARCHITECTURE.md` charter. `zIndex.ts` (`src/theme/zIndex.ts`) is camelCase, deviating from the kebab-case file rule in `CODE_STYLE.md`/`CLAUDE.md` — the only naming deviation found.

### 1.3 Import-direction violations

None found. Verified by reading every `src` import plus the folder-scoped `no-restricted-imports` rules in `eslint.config.mjs:117-199` (lint passes with exit 0). Specifically:

- `src/features/showcase/*` imports only `@/components/ui/*`, `@/core/errors/*`, `@/lib/utils`, and third-party — allowed.
- `src/core/*` imports nothing from `components` or `features` (the error-boundary default fallback at `src/core/errors/error-boundary.tsx:58-78` deliberately uses a raw `<button>` to respect this).
- `src/components/ui/*` imports only React, third-party, `@/lib/utils`, and sibling primitives.
- No file outside `src/config` reads `process.env` (only occurrence: `src/config/env.ts:16`).

---

## 2. Design System

### 2.1 Token definitions

Three layers:

1. **Runtime source of truth** — `src/styles/light.css` (`:root`) and `src/styles/dark.css` (`.dark`), semantic `--color-*` variables in `oklch`.
2. **Bridge** — `src/styles/theme.css`: `@theme inline` block (lines 10–57) maps shadcn-convention variables into Tailwind utilities; `:root` block (lines 59–97) maps the semantic `--color-*` variables onto shadcn names (`--card` ← `--color-surface`, etc.) and derives a radius scale from `--radius-base` (`--radius-sm` … `--radius-4xl`, lines 50–56).
3. **TS reference** — `src/theme/*.ts`: `COLORS` (CSS-var references, `colors.ts:10-32`), `BREAKPOINTS` (`breakpoints.ts:8-14`), `TRANSITIONS` (`transitions.ts:4-17`), `TYPOGRAPHY` (font families only, `typography.ts:9-14`), `Z_INDEX` (`zIndex.ts:4-13`). **No file in `src` imports `@/theme`** — the TS token layer is currently dead code (grep for `@/theme` returns no consumers).

Semantic tokens defined in `light.css`/`dark.css` (`--color-` prefix omitted): `background`, `foreground`, `surface`, `surface-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `success`, `success-foreground`, `warning`, `warning-foreground`, `destructive`, `destructive-foreground`, `border`, `input`, `ring`, `chart-1`…`chart-5`, `sidebar`, `sidebar-foreground`, `sidebar-primary`, `sidebar-primary-foreground`, `sidebar-accent`, `sidebar-accent-foreground`, `sidebar-border`, `sidebar-ring` — 37 color tokens — plus `--radius-base` (light only).

### 2.2 Light/dark parity

Full parity for all 37 color tokens. One asymmetry: `--radius-base: 0.625rem` is declared only in `src/styles/light.css:40` (in `:root`, so it still applies in dark mode; it is a shape token, not a theme fork — but it lives in the light theme file rather than a theme-neutral location).

### 2.3 Hard-coded literals bypassing the token layer

No color literals exist anywhere in `src` outside `src/styles` (grep for hex/`rgb(`/`hsl(`/`oklch(` returns nothing outside the token files). Sizing/radius/font-size arbitrary values do exist, all inside shadcn-generated primitives:

- `src/components/ui/button.tsx:25` — `rounded-[min(var(--radius-md),10px)]`
- `src/components/ui/button.tsx:26` — `rounded-[min(var(--radius-md),12px)]`, `text-[0.8rem]`
- `src/components/ui/button.tsx:30` — `rounded-[min(var(--radius-md),10px)]`
- `src/components/ui/button.tsx:32` — `rounded-[min(var(--radius-md),12px)]`
- `src/components/ui/badge.tsx:11` — `focus-visible:ring-[3px]`
- `src/components/ui/tabs.tsx:16` — `p-[3px]`
- `src/components/ui/tabs.tsx:70` — `h-[calc(100%-1px)]`, `focus-visible:ring-[3px]`
- `src/components/ui/tabs.tsx:73` — `after:bottom-[-5px]`
- `src/components/ui/scroll-area.tsx:32` — `focus-visible:ring-[3px]`
- `src/components/ui/dialog.tsx:89` — `max-w-[calc(100%-2rem)]`

No hard-coded literals were found in `src/app`, `src/features`, or `src/core` (the error-boundary fallback and showcase pages use only standard Tailwind scale utilities and semantic color classes).

### 2.4 Typography scale

There is no project-defined typography scale. `src/theme/typography.ts:1-14` defines font _families_ only and explicitly states sizes/weights/line-heights are "owned by the Tailwind default theme". The showcase renders the Tailwind defaults `text-xs`…`text-3xl` (`src/app/showcase/tokens/page.tsx:29-37`). Fonts are Geist Sans/Mono via `next/font` in `src/app/layout.tsx:7-15`, bridged through `--font-sans`/`--font-mono`/`--font-heading` in `src/styles/theme.css:13-15` (`--font-heading` aliases the sans variable; no distinct heading face).

### 2.5 ThemeProvider

`src/core/providers/theme-provider.tsx`:

- Injects an inline pre-paint script (`THEME_INIT_SCRIPT`, lines 10–11) that toggles the `dark` class on `<html>` from `prefers-color-scheme` before hydration (root layout sets `suppressHydrationWarning`, `src/app/layout.tsx:32`).
- A `useEffect` (lines 32–42) re-applies the class and subscribes to `matchMedia("(prefers-color-scheme: dark)")` changes.
- **There is no manual theme switching, no persistence (no localStorage/cookie), and no theme context/API.** System preference is the only input; the file documents this as intentional foundation scope (lines 27–29). `Toaster` (`src/core/providers/toaster.tsx:19`) independently uses sonner's `theme="system"`.

---

## 3. Internationalization and Direction

### 3.1 Existing support

- Locale config: `APP_LOCALES` in `src/config/app.ts:4-7` — default `"en"`, supported `["en"]` only. `<html lang>` set from it (`src/app/layout.tsx:29`). No i18n library, no message catalogs, no locale routing. `AppProvider` has a `// TODO: Add Localization provider.` (`src/core/providers/app-provider.tsx:28`).
- RTL: no support. `components.json` sets `"rtl": false` (line 15). No `dir` attribute anywhere. No logical-property utilities (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`) are used anywhere in `src`.
- Fonts: Geist loaded with `subsets: ["latin"]` only (`src/app/layout.tsx:9,14`). No non-Latin subset or fallback strategy.

### 3.2 Physical CSS properties that would break under RTL

- `src/app/showcase/display/page.tsx:109` — `text-right`
- `src/app/showcase/display/page.tsx:117` — `text-right`
- `src/app/showcase/display/page.tsx:124` — `text-right`
- `src/components/ui/alert-dialog.tsx:95` — `left-1/2`, `-translate-x-1/2`
- `src/components/ui/alert-dialog.tsx:112` — `sm:group-data-[size=default]/alert-dialog-content:text-left`
- `src/components/ui/avatar.tsx:79` — `right-0`
- `src/components/ui/badge.tsx:11` — `has-data-[icon=inline-end]:pr-1.5`, `has-data-[icon=inline-start]:pl-1.5`
- `src/components/ui/button.tsx:24` — `has-data-[icon=inline-end]:pr-2`, `has-data-[icon=inline-start]:pl-2`
- `src/components/ui/button.tsx:25` — `has-data-[icon=inline-end]:pr-1.5`, `has-data-[icon=inline-start]:pl-1.5`
- `src/components/ui/button.tsx:26` — `has-data-[icon=inline-end]:pr-1.5`, `has-data-[icon=inline-start]:pl-1.5`
- `src/components/ui/button.tsx:27` — `has-data-[icon=inline-end]:pr-2`, `has-data-[icon=inline-start]:pl-2`
- `src/components/ui/dialog.tsx:89` — `left-1/2`, `-translate-x-1/2`
- `src/components/ui/dialog.tsx:101` — `right-2`
- `src/components/ui/field.tsx:171` — `text-left`
- `src/components/ui/field.tsx:230` — `ml-4`
- `src/components/ui/pagination.tsx:100` — `pl-1.5!`
- `src/components/ui/pagination.tsx:118` — `pr-1.5!`
- `src/components/ui/table.tsx:97` — `text-left`, `[&:has([role=checkbox])]:pr-0`
- `src/components/ui/table.tsx:110` — `[&:has([role=checkbox])]:pr-0`
- `src/components/ui/tabs.tsx:70` — `has-data-[icon=inline-end]:pr-1`, `has-data-[icon=inline-start]:pl-1`
- `src/components/ui/tabs.tsx:73` — `group-data-vertical/tabs:after:-right-1`

Directional icons (`PaginationPrevious`/`PaginationNext` chevrons in `src/components/ui/pagination.tsx`, breadcrumb separator in `src/components/ui/breadcrumb.tsx`) would also point the wrong way under RTL; not re-listed per line since they are icon choices, not CSS properties.

---

## 4. Layout

### 4.1 Width, padding, vertical rhythm

- **Width/gutter:** the single `Container` primitive, `src/components/ui/container.tsx:20-27` — `mx-auto w-full max-w-6xl px-4 sm:px-6`, overridable via `className`.
- **Vertical rhythm:** the showcase layout owns it — `src/app/showcase/layout.tsx:29-31`: `<main className="flex-1 py-10">` wrapping `<Container className="flex flex-col gap-12">`. Inside pages, rhythm is per-component `flex flex-col gap-*` (e.g. `ShowcaseSection` uses `gap-4`, `src/features/showcase/components/showcase-section.tsx:11`). There is no spacing-scale token beyond Tailwind defaults and no documented rhythm system.
- Root layout contributes only `min-h-full flex flex-col` on `<body>` (`src/app/layout.tsx:34`).

### 4.2 Layout primitives

- `Container` exists (above). **No Stack, no PageHeader, no app-shell/sidebar primitive exists** in `src/components`. `ShowcasePageHeader` (`src/features/showcase/components/showcase-page-header.tsx`) is a feature-local component, not a shared primitive.

### 4.3 Showcase width/spacing duplication

Width and page padding are **not** duplicated per page — every showcase page inherits them from the single `Container` in `src/app/showcase/layout.tsx:30`. Residual duplication within pages:

- The index page hand-rolls its own header block (`src/app/showcase/page.tsx:56-66`) instead of `ShowcasePageHeader`, duplicating the `text-2xl font-semibold tracking-tight` + `max-w-2xl text-sm text-muted-foreground` pattern of `showcase-page-header.tsx:32-33`.
- Content-measure caps are repeated ad hoc: `max-w-md` at `src/app/showcase/forms/page.tsx:34,64,83,97`, `src/app/showcase/feedback/page.tsx:88`; `max-w-2xl` at `feedback/page.tsx:33`; `max-w-md` at `display/page.tsx:163`.

---

## 5. Data and Forms

### 5.1 React Query

`src/core/providers/query-provider.tsx`:

- Client options: `staleTime: 60_000`, `retry: false` (lines 16–25).
- SSR-safe client management: fresh client per server request, browser module-level singleton (lines 27–40).
- Provider placement: composed in `AppProvider` (`src/core/providers/app-provider.tsx:31`), which the root layout mounts (`src/app/layout.tsx:35`) — so it wraps the entire app.
- **Devtools: absent** — `@tanstack/react-query-devtools` is not in `package.json` and no devtools component exists; `query-provider.tsx:48` documents this as deliberate.
- Sole consumer: `useQuery` in `src/features/showcase/components/query-demo.tsx:40-43` against a simulated 1.2 s fetch. No hydration/prefetch (`HydrationBoundary`) usage anywhere.

### 5.2 Axios

`axios@^1.18.1` is declared in `package.json:15` but **never imported anywhere in `src`**. There is no Axios instance, no base URL, no interceptor, and no error normalization. `src/api` and `src/services` are README-only.

### 5.3 Environment validation

`src/config/env.ts` Zod-validates `NODE_ENV` (lines 11–21) with fail-fast throw, and is deliberately excluded from the config barrel (`src/config/index.ts:4-7`). However, **no file imports `@/config/env`**, so the validation never executes at runtime — it is currently dead code. Additionally, the failure message at `env.ts:20` interpolates `z.treeifyError(parsedEnv.error)` (an object) directly into a template string, which would render as `[object Object]` rather than the error tree.

### 5.4 Error boundaries

- `src/core/errors/error-boundary.tsx` — a reusable class-based `ErrorBoundary` with `fallback` render-prop and reset (lines 32–56), mounted app-wide inside `AppProvider` (`app-provider.tsx:32`), i.e. inside ThemeProvider/QueryProvider, above all routes. A region-level use with custom fallback exists in `src/features/showcase/components/error-boundary-demo.tsx:36-49`.
- **No Next.js route-level error files exist**: no `error.tsx`, `global-error.tsx`, or `not-found.tsx` anywhere under `src/app`. Errors thrown in Server Components or during routing bypass the client `ErrorBoundary` and fall through to Next's default error handling.

### 5.5 React Hook Form + Zod

`react-hook-form@^7.81.0` and `@hookform/resolvers@^5.4.0` are declared (`package.json:13,22`) but **never imported in `src`**. There is no form wired with RHF anywhere; the showcase forms page (`src/app/showcase/forms/page.tsx`) is static markup demonstrating `Field` composition with manual `aria-*` wiring. Zod is used only in `src/config/env.ts:9`. `zustand@^5.0.14` (`package.json:28`) is likewise never imported. The `Field` primitive (`src/components/ui/field.tsx:67`) explicitly documents form-library integration as the consumer's job — but no reference integration exists.

---

## 6. Tooling and Quality

### 6.1 tsconfig.json

`strict: true` plus every additional correctness flag: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`, `noUnusedLocals`, `noUnusedParameters`, `forceConsistentCasingInFileNames`, `verbatimModuleSyntax`, `isolatedModules`, `allowJs: false` (`tsconfig.json:5-23`). Path alias `@/* → ./src/*` (lines 31–33). This is a maximally strict configuration.

### 6.2 ESLint

Flat config, `eslint.config.mjs` (226 lines): `eslint-config-next/core-web-vitals` + `/typescript`, then project rules — inline `consistent-type-imports`, `no-explicit-any: error`, strict `no-unused-vars`, `curly: all`, `eqeqeq: always`, `import/no-cycle`, `import/order` with React/Next-first groups, ban on `../../../` paths (lines 11–14, 91–96), default-export ban via `no-restricted-syntax` (lines 97–103) with framework-file exemptions (lines 200–217), and per-folder `no-restricted-imports` blocks encoding the full dependency-direction matrix (lines 117–199), including framework-agnosticism for `src/utils` (lines 36–39, 182–199). Boundary enforcement claimed as "by hand; no tooling yet" in `CLAUDE.md` is in fact lint-enforced — the doc is stale.

### 6.3 Presence/absence

| Tool              | Status                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| Prettier          | **Absent** (no config, not in devDependencies; formatting consistency is manual per `docs/UI_LIBRARY.md` §3) |
| Husky / git hooks | **Absent** (no `.husky/`, no `prepare` script)                                                               |
| lint-staged       | **Absent**                                                                                                   |
| commitlint        | **Absent**                                                                                                   |
| CI workflows      | **Absent** (no `.github/` directory at all)                                                                  |
| Test runner       | **Absent** (no jest/vitest/playwright config or dependency; no `test` script in `package.json:5-10`)         |
| Test files        | **Absent** (zero `*.test.*` / `*.spec.*` under `src`)                                                        |

### 6.4 `any` / suppressions

Zero occurrences of `any` as a type, `@ts-ignore`, `@ts-expect-error`, or `eslint-disable` in `src`. (Grep matches for the word "any" are prose in comments only: `error-boundary.tsx:22`, `field.tsx:67`, `forms/page.tsx:81`.)

---

## 7. Build Health

Both commands run on 2026-07-18; both exited 0.

`npm run lint` (`eslint`): **no output — zero errors, zero warnings.**

`npm run build` (`next build`, Next.js 16.2.10, Turbopack):

```
✓ Compiled successfully in 2.5s
  Finished TypeScript in 2.9s
✓ Generating static pages using 13 workers (12/12) in 645ms

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /showcase
├ ○ /showcase/actions
├ ○ /showcase/data
├ ○ /showcase/display
├ ○ /showcase/feedback
├ ○ /showcase/forms
├ ○ /showcase/navigation
├ ○ /showcase/overlays
└ ○ /showcase/tokens

○  (Static)  prerendered as static content
```

No warnings. All 11 routes prerender statically. **Per-route bundle sizes were not emitted** — the Next 16.2.10 Turbopack build output contains no size/First-Load-JS columns, so none can be reported.

---

## 8. Top Risks

Ordered by severity for a team cloning this repo to start a real product.

1. **Zero test infrastructure.** No runner, no test files, no `test` script (§6.3); the showcase is the only regression net and it is manual. Fix: add a unit runner (e.g. Vitest + Testing Library) with a few reference tests for `cn`, `ErrorBoundary`, and one primitive.
2. **No CI and no git hooks.** Lint, typecheck, and build run only when a developer remembers to run them locally (§6.3); the strict tooling baseline is unenforced at the repo boundary. Fix: a CI workflow running `lint` + `build` (+ tests), optionally Husky/lint-staged locally.
3. **Environment validation is dead code, with a broken error message.** `src/config/env.ts` is imported by nothing, so its fail-fast promise never executes; its throw stringifies `z.treeifyError()` into `[object Object]` (`env.ts:20`) (§5.3). Fix: import it from a guaranteed-executed module (e.g. `next.config.ts` or root layout) and serialize the error tree properly.
4. **No RTL or i18n readiness.** `rtl: false` in `components.json:15`, ~21 physical-property call sites across the UI primitives (§3.2), Latin-only font subsets, single hard-coded locale, no localization provider (§3.1). Retrofitting logical properties across 20 frozen-API primitives later is expensive. Fix: convert primitives to logical utilities (`ms-`/`pe-`/`start-`…) and decide the locale strategy before primitives multiply.
5. **Declared-but-unused data/form stack.** Axios, React Hook Form, `@hookform/resolvers`, and Zustand ship in `package.json` with zero usage and zero reference pattern (§5.2, §5.5); every cloning team will invent its own API client, error normalization, and form wiring. Fix: either add one reference implementation each (Axios instance in `src/api`, one RHF+Zod form) or remove the deps until needed.
6. **No route-level error/not-found handling.** No `error.tsx`, `global-error.tsx`, or `not-found.tsx` under `src/app` (§5.4); Server Component failures bypass the client `ErrorBoundary` entirely. Fix: add root `error.tsx`/`not-found.tsx` templates wired to the token system.
7. **No formatter.** Prettier is absent; `docs/UI_LIBRARY.md` asks contributors to match "semicolons, double quotes, trailing commas" by hand (§6.3). Fix: add Prettier (or Biome) plus a format check in CI.
8. **Theme system is system-preference-only.** No user-facing theme toggle, no persistence, no theme context (§2.5) — most real products need a manual override on day one, and the extension point is documented but unbuilt. Fix: extend `ThemeProvider` with an explicit preference (`light | dark | system`) persisted to storage/cookie.
9. **TS token layer and docs have drifted from reality.** `src/theme` is imported by nothing (§2.1); `CLAUDE.md` describes config modules and token files that don't exist, calls `page.tsx` unmodified starter, and says boundary lint tooling doesn't exist when it does (§1.1, §6.2). A cloning team will make decisions off wrong documentation. Fix: reconcile `CLAUDE.md`/token layer with the code (delete or wire the unused TS tokens).
10. **Thin layout vocabulary and no typography scale.** Only `Container` exists — no Stack/PageHeader/shell (§4.2) — and type sizes are undefined beyond Tailwind defaults with `--font-heading` aliased to the body face (§2.4); spacing/measure decisions are already being repeated ad hoc in the showcase (§4.3). Fix: define a minimal typography scale and add the one or two layout primitives the showcase has already proven a need for (Stack, PageHeader).
