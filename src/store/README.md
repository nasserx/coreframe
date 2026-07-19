# Store

Purpose: Holds future client-side state management modules.

No store library ships with the foundation — zustand was removed until a product has state that needs it (see `DECISIONS.md`). Before adding a store here, read `docs/DATA_LAYER.md` § "Client state vs server cache vs URL state": most state belongs in React Query's cache, the URL, or local component state; this folder is only for the client-owned, cross-feature remainder.

Belongs here: global or cross-feature state stores and state-specific types when shared state is required.

Must not be placed here: component-local state, API clients, React components, route files, validation schemas unrelated to state, or business workflows. Never mirror server data into a store — that is the query cache's job.
