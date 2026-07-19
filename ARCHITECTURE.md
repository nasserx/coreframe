# Architecture

## Philosophy

This project is a reusable frontend foundation. Architecture should stay simple at the start and become more specific only when product needs justify it. Code should be easy to locate, easy to test, and hard to accidentally couple across unrelated areas.

The application uses `src` as the single source root. Next.js routing lives in `src/app`, while product behavior should grow primarily through feature-owned modules under `src/features`.

## Layer Responsibilities

- App layer: route entry points, route-level metadata, and framework wiring.
- Core layer: application-wide infrastructure that is independent from features and business logic.
- Feature layer: product capabilities grouped by domain or workflow.
- Shared UI layer: reusable presentation components that are intentionally cross-feature.
- Service layer: application-wide service boundaries and integration coordination.
- API layer: request and response boundary code when backend communication is added.
- State layer: shared client-side state that is not owned by a single component.
- Foundation layer: configuration, constants, types, styles, assets, library setup, and generic utilities.

## Folder Responsibilities

- `src/app`: Next.js App Router files only.
- `src/core`: application-wide infrastructure such as providers, guards, errors, logging, monitoring, analytics, and accessibility.
- `src/assets`: imported source assets such as fonts, icons, and images.
- `src/components`: reusable UI, shared, layout, navigation, and feedback components.
- `src/features`: feature-first modules for product capabilities.
- `src/services`: application service abstractions.
- `src/api`: API boundary modules.
- `src/store`: shared state stores.
- `src/hooks`: reusable React hooks.
- `src/lib`: third-party library integration and framework helpers.
- `src/utils`: small pure utility functions.
- `src/types`: shared TypeScript types.
- `src/constants`: stable shared constants.
- `src/config`: environment-derived and application configuration.
- `src/styles`: the CSS token system and global styles.
- `src/theme`: the TypeScript breakpoint mirror only (see Theme Runtime below).

## Feature-First Architecture

Feature code should live with the feature that owns it. A feature may contain its own components, hooks, schemas, types, state, and internal utilities when those pieces are not reused elsewhere.

Shared folders should be used only when code is intentionally reused across multiple features or is foundational to the application.

## Separation of Concerns

Routing should not contain business logic. Components should focus on presentation and interaction. API modules should describe communication boundaries. Stores should manage shared state only when local or feature state is insufficient. Generic utilities should remain pure and framework-agnostic.

Core infrastructure should provide cross-cutting application boundaries without owning product behavior. It may support features, routes, and shared systems, but it must not become a place for feature-specific rules or business workflows.

## Theme Runtime

CSS custom properties in `src/styles` are the single source of truth for every themable design decision (full contract: `docs/DESIGN_TOKENS.md`):

1. Semantic variables: `src/styles/base.css` (theme-neutral), `light.css`/`dark.css` (per-theme `--color-*` and `--elevation-*` values with full parity).
2. Bridge: `src/styles/theme.css` maps the semantic variables into Tailwind v4 `@theme inline` and shadcn/ui variable names, and holds the theme-neutral type ramp and measure tokens.
3. Tailwind utilities resolve through the bridge, so components use semantic classes instead of hardcoded colors.

There is deliberately no TypeScript mirror of any CSS token. The one sanctioned TS token file is `src/theme/breakpoints.ts`, because `matchMedia` cannot read custom properties; its values must equal Tailwind's default screens.

## Dependency Direction

Dependencies should flow inward from specific to shared:

- `src/app` may depend on core infrastructure, features, and shared foundation code.
- `src/core` may depend on foundation code such as config, types, constants, lib, utils, styles, and theme tokens.
- `src/features` may depend on shared components, core infrastructure, api, services, store, hooks, lib, utils, types, constants, config, styles, theme tokens, and assets.
- Shared foundation folders must not depend on specific features.
- Shared components must not depend on feature modules.
- Core infrastructure must not depend on feature modules or business workflows.
- Lower-level utilities must not depend on React, Next.js routing, or product features unless they are moved to a more appropriate layer.

## Module Boundary Rules

These boundaries are lint-enforced: folder-scoped `no-restricted-imports` rules in `eslint.config.mjs` encode the full dependency-direction matrix, and `npm run lint` fails on a violation.

- `src/app` may import from `src/features`, `src/core`, and foundation folders.
- `src/features/*` may import from shared foundation folders and core, but not from sibling features unless an explicit shared contract exists.
- `src/core` must not import from `src/features` or `src/app`.
- `src/components` must not import from `src/features`.
- `src/theme`, `src/config`, `src/constants`, `src/types`, and `src/utils` must remain independent from app routes and features.
- Cross-folder imports should use the `@/` alias instead of long relative paths.
- Barrel exports should define public APIs only, not hide internal module structure.
