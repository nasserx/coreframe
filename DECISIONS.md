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

Decision: Use Zustand for shared client-side state.

Reason: It is lightweight, explicit, and suitable for client state that must be shared outside local component boundaries.

Alternatives considered: React Context only, Redux Toolkit.

## React Hook Form

Decision: Use React Hook Form for form state.

Reason: It provides efficient form state management with strong ecosystem support and works well with schema validation.

Alternatives considered: Controlled form state with React, Formik.

## Zod

Decision: Use Zod for schema validation.

Reason: Zod provides TypeScript-friendly runtime validation and can support forms, API boundaries, and configuration validation.

Alternatives considered: Yup, Valibot, custom validation.

## Core Layer

Decision: Introduce `src/core` for application-wide infrastructure.

Reason: Cross-cutting concerns such as providers, guards, errors, logging, monitoring, analytics, and accessibility need clear ownership outside features and outside generic utilities. Keeping them in a dedicated layer prevents feature modules, shared components, and low-level helpers from becoming infrastructure catch-alls.

Alternatives considered: Placing infrastructure in `src/lib`, distributing infrastructure across features, or keeping separate top-level folders for each concern.

## Vitest (unit/component test runner)

Decision: Use Vitest with Testing Library and jsdom for the unit/component layer; tests are colocated as `src/**/*.test.{ts,tsx}`.

Reason: Vitest consumes the repo's strict tsconfig (including `verbatimModuleSyntax`) and the `@/` alias with a one-line config mirror and no transformer chain, so a cloning team inherits near-zero test-runner configuration. Testing Library enforces querying by role/accessible name, which doubles as an accessibility check.

Alternatives considered: Jest (requires SWC/Babel transforms, separate ESM handling, and duplicated module mapping under this tsconfig), node:test (no component/DOM story).

## Playwright (browser test layer)

Decision: Use Playwright with Chromium and `@axe-core/playwright` for browser-level regression tests (console cleanliness across the route × theme × direction matrix, `document.fonts` assertions, accessibility scans).

Reason: The two defects that shipped past a green lint/typecheck/build (a hydration mismatch and a silently intercepted webfont) are only observable in a running browser. Playwright provides console capture, `page.evaluate`, managed web servers, and a maintained axe integration natively. The console harness runs against `next dev` because React reports attribute-level hydration mismatches only in development builds; fonts and accessibility run against `next start`.

Alternatives considered: Raw CDP scripting (the original throwaway harness — no assertions, reporting, or CI story), Cypress (heavier, no first-class multi-server support), adding a visual-regression tool (no shipped defect justifies screenshot baselines yet).
