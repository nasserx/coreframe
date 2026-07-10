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
