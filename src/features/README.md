# Features

Purpose: Groups user-facing product capabilities by domain or workflow.

Current contents: `showcase/` — the foundation's own inspection surface (components, API module, and section registry behind the `/showcase` routes). It doubles as the reference for feature-module shape; products delete it when it has served its purpose (`docs/CLONING.md`).

Belongs here: feature-owned modules that combine UI, state, validation, and behavior for a specific product area.

Must not be placed here: generic shared components, global configuration, cross-feature utilities, route definitions, or low-level service clients.
