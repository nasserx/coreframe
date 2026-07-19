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
