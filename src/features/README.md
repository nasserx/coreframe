# Features

Purpose: Groups user-facing product capabilities by domain or workflow.

Current contents:

- `marketing/` — the production public composition for `/`: translated chrome,
  landing content, and Foundation-owned visual specimens. It composes shared
  primitives but remains feature-owned. It also owns an optional one-time
  viewport reveal for that route only — no other surface animates content into
  view (`docs/DESIGN_TOKENS.md` § Motion). Smooth anchor scrolling is not part
  of it: that is a global foundation contract in `src/app/globals.css`.
- `showcase/` — the foundation's inspection surface (components, API module,
  and section registry behind `/showcase`). It doubles as the reference for
  feature-module shape; products delete it when it has served its purpose
  (`docs/CLONING.md`).

Belongs here: feature-owned modules that combine UI, state, validation, and behavior for a specific product area.

Must not be placed here: generic shared components, global configuration, cross-feature utilities, route definitions, or low-level service clients.
