# Providers

Purpose: Application-wide provider composition.

Current contents: `app-provider.tsx` (the Server Component composition point mounted by the root layout; Authentication is the remaining extension seam), `theme-provider.tsx` (theme runtime — `docs/DESIGN_TOKENS.md` §5), `locale-provider.tsx` (active catalogue plus `<html lang/dir>` runtime — `docs/DIRECTION_AND_I18N.md`), `query-provider.tsx` (React Query client), `toaster.tsx` (sonner, follows the resolved theme), and `index.ts` (public barrel).

Belongs here: root-level providers for cross-cutting infrastructure such as data, theme, state, or notifications.

Must never be placed here: feature-specific providers, UI components, business logic, API request implementations, page code, or provider code added before a concrete need exists.
