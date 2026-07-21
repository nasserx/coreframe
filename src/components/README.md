# Components

Purpose: Reusable, intentionally cross-feature presentation components.

Current contents: `ui/` holds the primitive library — shadcn/Base UI primitives adapted per `docs/UI_LIBRARY.md`, plus the layout set (Container, Stack, PageHeader, AppShell, SiteShell, SkipLink) documented in `docs/LAYOUT.md`.

Belongs here: UI primitives, shared presentation pieces, layout components, navigation components, and feedback components when they are intentionally reusable.

Must not be placed here: feature-specific business logic, data fetching, global state, API clients, route files, or one-off page implementations.
