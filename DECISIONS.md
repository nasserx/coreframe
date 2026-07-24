# Decisions

## Next.js App Router

Decision: Use Next.js App Router for routing and application entry points.

Reason: It is the current routing model for modern Next.js applications and supports nested layouts, server components, and route-level organization.

Alternatives considered: Pages Router.

## TypeScript

Decision: Use TypeScript across the project.

Reason: The foundation is intended for long-term reuse, and static typing improves maintainability, refactoring safety, and API clarity.

Alternatives considered: JavaScript.

## Tailwind CSS

Decision: Use Tailwind CSS for styling.

Reason: Tailwind provides a consistent utility-first styling system that works well with component-driven frontend development.

Alternatives considered: CSS Modules, Sass, CSS-in-JS.

## shadcn/ui

Decision: Configure shadcn/ui for future UI primitives.

Reason: shadcn/ui provides accessible, composable component patterns while keeping component code owned by the project when components are added.

Alternatives considered: Fully custom component system, packaged component libraries.

## Feature-First Architecture

Decision: Organize product implementation primarily by feature.

Reason: Feature ownership keeps related UI, state, validation, and behavior close together and reduces cross-folder coordination as the product grows.

Alternatives considered: Type-based organization only, such as global folders for all components, hooks, schemas, and services.

## src as Application Root

Decision: Use `src` as the single application root.

Reason: Keeping application code under `src` separates source code from root configuration and project metadata.

Alternatives considered: Root-level `app` and source folders.

## React Query

Decision: Use React Query for server-state management.

Reason: It provides proven caching, loading, mutation, and synchronization primitives for remote data.

Alternatives considered: Hand-managed request state, Zustand for server state.

## Zustand

Decision (revised 2026-07): Removed from dependencies until a product has state that needs it; it remains the recommended library for that moment.

Reason: It was declared with zero imports — an unused dependency every clone would inherit, inviting speculative stores. The client-state / server-cache / URL-state guidance that tells a product when a store is justified lives in `docs/DATA_LAYER.md`. When that point is reached, Zustand is still the pick: lightweight, explicit, suitable for cross-feature client state.

Alternatives considered: React Context only, Redux Toolkit, keeping the dependency preinstalled (rejected: a foundation must not ship unused dependencies).

## React Hook Form

Decision (revised 2026-07): Removed from dependencies until the reference form wiring is built; it remains the chosen form library for that moment.

Reason: It was declared with zero imports for the entire foundation phase — the same unused-dependency state that led to removing axios and zustand, and a foundation must apply its own rule to itself. The `Field` primitive documents form-library integration as the consumer's job, and `docs/ROADMAP.md` records the RHF + Zod reference wiring as the top-priority addition; reinstall `react-hook-form` + `@hookform/resolvers` when building it.

Alternatives considered: Controlled form state with React, Formik, keeping the dependency preinstalled (rejected: a foundation must not ship unused dependencies).

## Zod

Decision: Use Zod for schema validation.

Reason: Zod provides TypeScript-friendly runtime validation and can support forms, API boundaries, and configuration validation.

Alternatives considered: Yup, Valibot, custom validation.

## Environment split: zod-free public value contract vs server-only validator

Decision (2026-07): `src/config/env.ts` is the client-safe public contract — the sole `process.env` reader (`RAW_ENV`) and the typed, defaulted `ENV_CONFIG` every module imports — and contains **no zod**. The fail-fast zod schema moved to `src/config/env-validation.ts`, which only `next.config.ts` imports for its side effect, so validation still runs once at startup in every mode while zod never enters a client-reachable module.

Reason: `apiFetch` reads `ENV_CONFIG.NEXT_PUBLIC_API_BASE_URL` on the client, so anything `env.ts` statically imported shipped to the browser for _every_ apiFetch consumer. With the old single-file module that meant zod (~69 KB gz) landed in any bundle that touched the data layer, even routes that validate nothing — measured on a no-schema route as 280.3 KB → 217.2 KB gz once decoupled (`docs/audit/2026-07-health-audit.md` §1.2). The paired change made `client.ts` import zod as a type only and format schema-rejection errors from the `ZodError` instance's own `issues` instead of the runtime `z.prettifyError`. Net: zod reaches the browser only where a call site actually passes a schema (which already bundles zod to define it), so the opt-in-with-a-nudge validation contract is unchanged while unvalidated fetches pay nothing.

Tradeoff accepted: the env logic is now two files and the value defaults/coercion in `env.ts` (e.g. `NEXT_PUBLIC_ENABLE_SHOWCASE !== "false"`) must mirror the schema in `env-validation.ts` — a small duplication guarded by both files' headers and by the fact that startup validation rejects any raw input the plain builder would misread. `env.ts` no longer throws on its own, but fail-fast is preserved because `next.config.ts` loads the validator before any app code (verified: an invalid value fails the build).

Alternatives considered: keeping the single zod-validating `env.ts` (rejected: ships zod to every data-layer client bundle), a runtime `typeof window` guard around the zod import (rejected: a static import can't be tree-shaken by a runtime branch), reading the base URL from `process.env` directly in `client.ts` (rejected: violates the single-reader rule and loses validation).

## Locale-aware font preload via a compile-time guard (not a computed value)

Decision (2026-07): The Arabic (`Noto`) and mono faces in `src/app/fonts.ts` set `preload: false` as a written literal; a type-level assertion couples the Noto literal to `APP_CONFIG.direction`, so flipping the default locale to RTL without also setting `preload: true` fails the build. The shipped LTR/English default therefore preloads only the Latin body face; an Arabic-default clone flips the literal and the guard confirms it.

Reason: A `<link rel="preload">` is fetched eagerly and ignores `unicode-range`, so preloading the ~162 KB Arabic face on a Latin deployment downloaded bytes English pages can never paint — 213.2 KB → 28.6 KB of preloaded font per page once scoped (`docs/audit/2026-07-health-audit.md` §1.1). The value cannot be derived from config at build time: `next/font` rejects any non-literal loader option ("Font loader values must be explicitly written literals"), and it registers a preload for _every_ declared font instance, so a two-instance "mount the one you want" approach still preloads both (verified). The compile-time guard is the strongest available substitute for derivation — it turns a silent per-page regression (or a missing Arabic preload on an Arabic site) into a caught build error.

Tradeoff accepted: switching a deployment to Arabic-primary is a two-line change (default locale + the Noto preload literal) rather than one, but the guard makes the second line unforgettable. Noto still ships and loads on demand when Arabic renders, scoped by `unicode-range`; a Latin page with incidental Arabic takes a brief on-demand swap, which is the correct trade for not taxing every first paint.

Alternatives considered: `preload: APP_CONFIG.direction === "rtl"` (rejected: next/font forbids non-literal options), two literal instances selected at runtime (rejected: both instances preload regardless of which variable mounts), leaving Noto preloaded everywhere (rejected: the 162 KB/page regression this fixes), a bare documented literal with no guard (rejected: silent drift is exactly the failure class this repo guards against).

## Native fetch as the HTTP client (axios removed)

Decision: The API boundary (`src/api`) is built on native `fetch`; the declared-but-unused axios dependency was removed.

Reason: Next.js extends `fetch` with its caching/revalidation semantics, so fetch is the only client that keeps server-side data access on one code path; it costs zero bundle bytes (axios is ~35 kB client-side); and the platform now covers axios's ergonomics natively (`AbortSignal.timeout`, `AbortSignal.any`, `Response.json`). Axios's remaining value — interceptors and error normalization — is provided by `apiFetch` being the single choke point every request passes through, with failures normalized into one typed `ApiError`. Full contract: `docs/DATA_LAYER.md`.

Alternatives considered: axios (rejected: parallel caching story to Next, bundle cost, interceptor indirection for what one function does in plain code), ky/ofetch (rejected: same conclusion with fewer reasons — no new dependency earns its place here).

## Core Layer

Decision: Introduce `src/core` for application-wide infrastructure.

Reason: Cross-cutting concerns such as providers, guards, errors, logging, monitoring, analytics, and accessibility need clear ownership outside features and outside generic utilities. Keeping them in a dedicated layer prevents feature modules, shared components, and low-level helpers from becoming infrastructure catch-alls.

Alternatives considered: Placing infrastructure in `src/lib`, distributing infrastructure across features, or keeping separate top-level folders for each concern.

## shadcn/ui runtime pieces (Base UI, sonner, Tailwind v4 CSS-first, shadcn as a dependency)

Decision (backfilled 2026-07): The primitive runtime is `@base-ui/react` (the shadcn `base-nova` style's runtime), toasts are `sonner`, Tailwind v4 runs CSS-first (no `tailwind.config`), and the `shadcn` package is a regular dependency because `globals.css` imports `shadcn/tailwind.css` — the current shadcn v4 pattern makes the registry package part of the styling pipeline.

Reason: These all follow from the shadcn/ui decision above — they are the stack that style ships with, and diverging from it would break the documented generation workflow (`docs/UI_LIBRARY.md`). Recorded explicitly because each is a real dependency someone will question later.

Alternatives considered: Radix-based shadcn styles (older runtime), a custom toast implementation, Tailwind config-file mode (v4 deprecates it as the primary path).

## Showcase gating (build-time environment flag)

Decision (2026-07): `/showcase` and its `/api/showcase/records` endpoint are gated by `NEXT_PUBLIC_ENABLE_SHOWCASE` (default `"true"`). With the flag `"false"` at build time, the showcase layout calls `notFound()` during prerender, so every showcase route ships as a static 404.

Reason: The showcase is the foundation's living integration test — a product must keep it runnable during development but must not ship it. A build-time flag keeps one code path for both: no deletion, no route-table difference in dev, and every route stays statically prerendered (a runtime or cookie-driven gate would force dynamic rendering). The e2e suite runs with the default flag value, so CI is unaffected.

Alternatives considered: documented-delete-only (loses the living test the day the product ships), a route group excluded from production builds (Next.js has no per-build route exclusion), a runtime flag (forces dynamic rendering). Permanent deletion remains the documented end state (`docs/CLONING.md`).

## Vitest (unit/component test runner)

Decision: Use Vitest with Testing Library and jsdom for the unit/component layer; tests are colocated as `src/**/*.test.{ts,tsx}`.

Reason: Vitest consumes the repo's strict tsconfig (including `verbatimModuleSyntax`) and the `@/` alias with a one-line config mirror and no transformer chain, so a cloning team inherits near-zero test-runner configuration. Testing Library enforces querying by role/accessible name, which doubles as an accessibility check.

Alternatives considered: Jest (requires SWC/Babel transforms, separate ESM handling, and duplicated module mapping under this tsconfig), node:test (no component/DOM story).

## Playwright (browser test layer)

Decision: Use Playwright with Chromium and `@axe-core/playwright` for browser-level regression tests (console cleanliness across the route × theme × direction matrix, `document.fonts` assertions, accessibility scans).

Reason: The two defects that shipped past a green lint/typecheck/build (a hydration mismatch and a silently intercepted webfont) are only observable in a running browser. Playwright provides console capture, `page.evaluate`, managed web servers, and a maintained axe integration natively. The console harness runs against `next dev` because React reports attribute-level hydration mismatches only in development builds; fonts and accessibility run against `next start`.

Alternatives considered: Raw CDP scripting (the original throwaway harness — no assertions, reporting, or CI story), Cypress (heavier, no first-class multi-server support), adding a visual-regression tool (no shipped defect justifies screenshot baselines yet).

## i18n message translation: locale routing strategy (static per deployment + client runtime)

Decision (2026-07): Message translation ships with **build-time static locale per deployment** as the base, plus an **optional client-side locale runtime** (`LocaleProvider`, modelled on `ThemeProvider`) for deployments that build in more than one locale. No `/[locale]/…` routing, no middleware, no domain- or cookie-based negotiation.

Reason: The foundation's hard constraint is that **every route is statically prerendered**. Cookie-based locale reads opt every route into dynamic rendering (a direct regression); domain routing needs host detection via middleware; sub-path `/[locale]/…` routing can stay static with `generateStaticParams` but forces the `/`→`/locale` redirect through middleware (dynamic), nests the entire route tree under a `[locale]` segment, and taxes the common case — a single-locale product pays for routing machinery it never uses. Static-locale-per-deployment keeps every route static and costs a single-locale product nothing. The runtime switch for multi-locale deployments mirrors the theme runtime exactly (localStorage + cross-tab `storage` event + a pre-paint script that sets `<html lang/dir>` with no flash), which the repo already chose over a cookie **for the same static-rendering reason**. Measured: single-locale First Load JS lands within 0.2 kB of the multi-locale build and ships zero second-locale bytes; the second locale's catalogue is a code-split ~1.9 kB gz chunk fetched only on switch, absent from every route's initial load.

Trade-off accepted: client-side switching gives no per-locale URLs, so a returning non-default-locale visitor gets correct `dir`/`lang` pre-paint but a brief text re-render on hydration, and crawlers see the default-locale static HTML. For single-locale products (the common case) and the showcase proof this is correct and SEO-clean per deployment. A product that must serve **multiple indexed locales from one deployment** adopts sub-path routing as a documented product decision — the message/type/switcher layer built here sits underneath it unchanged.

Alternatives considered: next-intl/Paraglide with sub-path routing (per-locale URLs and SEO, but middleware + dynamic `/` negotiation + whole-tree `[locale]` nesting, taxing the single-locale common case); cookie-based locale (forces dynamic rendering); domain-based locale (infrastructure-coupled, needs middleware).

## i18n library: a typed in-repo solution, not a dependency

Decision (2026-07): The message layer is a small typed in-repo module (`src/i18n`), not next-intl, Paraglide, or react-i18next.

Reason: The routing decision above means the foundation does **not** use the part of an i18n library that earns its weight — locale routing, negotiation, middleware. What remains is message loading, `{placeholder}` interpolation, and a typed accessor, which is ~150 lines total: catalogues typed against a canonical English shape (a missing/renamed key fails `tsc`), a namespace-scoped `useTranslations`/`getTranslations` with `keyof`-checked keys, and a pure `translate()` shared by server and client. This foundation has removed unused dependencies twice on principle (axios, zustand); adding a library to use a fraction of it — and shipping its provider/runtime bytes on the single-locale common path — is the opposite of that discipline. Server Components read the default catalogue synchronously (static-render-safe); client components read the active catalogue and re-render on switch; both go through the same pure resolver. The default catalogue is statically bundled and other locales are code-split, so single-locale is free. ICU pluralization/formatting is deliberately out of scope — a product that needs it adds it in `src/utils` reading `LOCALE_INFO.numerals` (documented in docs/DIRECTION_AND_I18N.md).

Alternatives considered: next-intl (excellent, but its value is routing/negotiation we don't use, and it adds client runtime + a provider on every deployment including single-locale); Paraglide (compile-time, smallest runtime, but its message-per-function model and tooling is a larger thing for a cloning team to learn than a plain typed object); react-i18next (client-heavy, weak key typing, no Server Component story that fits static rendering).
