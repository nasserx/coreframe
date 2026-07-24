# src/i18n — message translation

The typed, in-repo message layer. Full rationale (routing decision, why no
library) is in `docs/DIRECTION_AND_I18N.md` and `DECISIONS.md`.

## What belongs here

- `messages/en.ts` — the **canonical** catalogue. English defines the shape the
  whole system is typed against; add every new string here first.
- `messages/<locale>.ts` — one catalogue per additional locale, declared
  `: Messages` so it parity-checks against English (missing/extra keys fail the
  typecheck).
- `messages.ts` — the `Messages` / `Namespace` / `MessageKey` contract.
- `translate.ts` — the pure, framework-agnostic resolver (`translate`,
  `createTranslator`) with `{placeholder}` interpolation.
- `catalogue.ts` — the loading strategy: the default locale is statically
  bundled, other locales are code-split behind dynamic `import()`, so a
  single-locale deployment ships exactly one catalogue.
- `server.ts` — `getTranslations(ns)`, the synchronous default-locale
  translator for Server Components and the provider-less `global-error`.
- `index.ts` — the public API barrel.

## What does NOT belong here

- **React context / hooks.** The client runtime (`LocaleProvider`, `useLocale`,
  `useTranslations`) owns a context, so it lives in `@/core/providers`
  (`locale-provider.tsx`) and is composed by `AppProvider`.
- **Locale facts** (direction, numerals, autonym). Those are in
  `src/config/app.ts` (`LOCALE_INFO`) — the single source of truth every
  locale-derived decision reads. This folder consumes it; it never restates it.
- **Formatting utilities.** Number/date formatting reads `LOCALE_INFO.numerals`
  and belongs in `src/utils` when a product needs it.

## Adding a string

1. Add the key to `messages/en.ts` (the contract).
2. The typecheck now fails for every other locale catalogue until you add the
   same key — translate it in each.
3. Read it at the call site: `useTranslations("<namespace>")` in a client
   component, `getTranslations("<namespace>")` in a Server Component.
