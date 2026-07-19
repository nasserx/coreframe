# Styles

Purpose: The CSS token system — the single source of truth for themable design decisions (`docs/DESIGN_TOKENS.md`).

Current contents: `base.css` (theme-neutral tokens), `light.css`/`dark.css` (per-theme semantic variables, full parity required — pinned by `token-parity.test.ts`), `theme.css` (Tailwind/shadcn bridge + type ramp), `index.css` (ordered entry point).

Belongs here: token definitions, the bridge, and shared styling resources.

Must not be placed here: components, feature logic, route files, JavaScript utilities, or assets that belong under `assets`.
