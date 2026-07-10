# Architecture

## Philosophy

This project is a reusable frontend foundation. Architecture should stay simple at the start and become more specific only when product needs justify it. Code should be easy to locate, easy to test, and hard to accidentally couple across unrelated areas.

The application uses `src` as the single source root. Next.js routing lives in `src/app`, while product behavior should grow primarily through feature-owned modules under `src/features`.

## Layer Responsibilities

- App layer: route entry points, route-level metadata, and framework wiring.
- Feature layer: product capabilities grouped by domain or workflow.
- Shared UI layer: reusable presentation components that are intentionally cross-feature.
- Service layer: application-wide service boundaries and integration coordination.
- API layer: request and response boundary code when backend communication is added.
- State layer: shared client-side state that is not owned by a single component.
- Foundation layer: configuration, constants, types, styles, assets, library setup, and generic utilities.

## Folder Responsibilities

- `src/app`: Next.js App Router files only.
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
- `src/styles`: shared style organization.

## Feature-First Architecture

Feature code should live with the feature that owns it. A feature may contain its own components, hooks, schemas, types, state, and internal utilities when those pieces are not reused elsewhere.

Shared folders should be used only when code is intentionally reused across multiple features or is foundational to the application.

## Separation of Concerns

Routing should not contain business logic. Components should focus on presentation and interaction. API modules should describe communication boundaries. Stores should manage shared state only when local or feature state is insufficient. Generic utilities should remain pure and framework-agnostic.

## Dependency Direction

Dependencies should flow inward from specific to shared:

- `src/app` may depend on features and shared foundation code.
- `src/features` may depend on shared components, api, services, store, hooks, lib, utils, types, constants, config, styles, and assets.
- Shared foundation folders must not depend on specific features.
- Shared components must not depend on feature modules.
- Lower-level utilities must not depend on React, Next.js routing, or product features unless they are moved to a more appropriate layer.
