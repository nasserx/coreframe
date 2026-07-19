# Errors

Purpose: Shared error-handling infrastructure.

Current contents: `error-boundary.tsx` (reusable client ErrorBoundary for region-level containment) and `error-fallback.tsx` (the one fallback UI shared with the route-level `error.tsx`/`global-error.tsx`/`not-found.tsx` files — see `docs/DATA_LAYER.md`). Transport errors (`ApiError`) live in `src/api`, not here.

Belongs here: application-wide error types, normalization boundaries, and error handling primitives.

Must never be placed here: feature-specific error messages, UI feedback components, business logic, API request code, logging transports, or page code.
