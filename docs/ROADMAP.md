# Roadmap — what is deliberately not here

The foundation ships boundaries and contracts, not speculative
implementations. Everything below is _intentionally absent_: each entry
records what is missing, what already exists as the extension point, and the
product signal that justifies building it. Building any of these without the
signal is the failure mode this repo was designed to avoid.

## Deliberately not built

### Forms wiring (React Hook Form + Zod reference)

- **Missing:** a reference form — RHF `useForm` + `zodResolver` + submit +
  server-error mapping. `react-hook-form`/`@hookform/resolvers` were removed
  as unimported (`DECISIONS.md`); reinstall them when building this.
- **Extension points:** the `Field` primitive (`src/components/ui/field.tsx`)
  documents form-library integration as the consumer's job; Zod is already
  the validation standard; `apiFetch` handles the submit transport.
- **Trigger:** the first product screen that mutates data. Build it as that
  feature's form, then promote the wiring pattern into a reference (or into
  this repo) once it has stabilized. This is the top-priority reference to
  add — the last declared-but-unwired piece of the stack.

### i18n message translation

- **Missing:** message catalogs, locale routing, pluralization — any i18n
  library.
- **Extension points:** `APP_LOCALES`/`LOCALE_INFO` (`src/config/app.ts`),
  the localization TODO slot in `AppProvider`, prop-overridable primitive
  strings (including `ThemeControl.optionLabels`, `ErrorFallback`'s copy
  props, and both shells' label props), and the full RTL/logical-property
  groundwork (`docs/DIRECTION_AND_I18N.md`). The error-route boundary
  files hardcode English copy by design until then — they are listed as a
  rename location in `docs/CLONING.md` §2.
- **Trigger:** a product that must serve two locales at once. A single-locale
  deployment (including Arabic-only) needs zero i18n library — change
  `APP_LOCALES.DEFAULT` and write copy in that language.

### Authentication

- **Missing:** auth provider, session handling, guards, token storage.
- **Extension points:** the Auth TODO slot in `AppProvider`, the marked
  credentials block in `src/api/client.ts`, and the chartered
  `src/core/guards` folder.
- **Trigger:** the product's auth model decision (OAuth? cookie session?
  external IdP?). Auth shape is product territory; anything prebuilt would
  encode the wrong model for half of the products.

### Shared client state (store library)

- **Missing:** zustand (deliberately removed — `DECISIONS.md`).
- **Extension points:** the chartered `src/store` folder; the
  state-placement decision guide in `docs/DATA_LAYER.md` (query cache vs URL
  vs local vs store).
- **Trigger:** state that is client-owned, cross-feature, and not derivable
  from the query cache, the URL, or local state (cart, wizard drafts). Most
  products reach this much later than they expect.

### Multi-level site navigation (dropdowns / mega menu)

- **Missing:** `SiteShellNav` is single-level — no dropdown sections, no
  mega menu, no nested drawer groups.
- **Extension points:** `SiteShellNavItem` composes freely with the
  existing Menu/Popover primitives at the call site; the drawer renders
  arbitrary children.
- **Trigger:** the first product whose public navigation genuinely exceeds
  one level. The first product built on this foundation did not need it —
  its bar overflowed for width reasons, not depth reasons — so nothing is
  prebuilt.

### React Query devtools

- **Missing:** `@tanstack/react-query-devtools`.
- **Extension point:** documented two-line addition in `docs/DATA_LAYER.md`
  (§ Devtools).
- **Trigger:** a team debugging cache behavior more than occasionally —
  reasonable to add on day one of real data work; not reasonable for every
  clone to inherit the dependency.

### Server prefetch / HydrationBoundary pattern

- **Missing:** a live `prefetchQuery` + `HydrationBoundary` example (every
  current route is static).
- **Extension points:** `query-provider.tsx` already creates a per-request
  server client, and `docs/DATA_LAYER.md` documents the exact pattern
  including the absolute-base-URL constraint.
- **Trigger:** the first dynamic route that should render with data
  server-side.

### Logger / monitoring / analytics

- **Missing:** implementations in `src/core/{logger,monitoring,analytics}`
  (chartered README-only folders).
- **Extension points:** error-reporting hooks are marked in
  `src/app/error.tsx` and the `ErrorBoundary`; both route-level and client
  error paths funnel through one `ErrorFallback`, so instrumenting is one
  component's call sites.
- **Trigger:** first production deployment (monitoring), first observability
  requirement (logger), first tracking requirement (analytics — and the
  consent story that comes with it).

### Visual polish of the showcase

- **Missing:** the showcase is an engineering inspection surface — dense,
  unstyled-by-design, English-only chrome.
- **Trigger:** none expected. It is not a product and is gated out of
  product builds (`NEXT_PUBLIC_ENABLE_SHOWCASE`); polish would be effort
  spent on something products delete.

## Known open issues

Honest defects and frictions, none currently blocking:

1. **Dark theme's elevation ladder reads weakly.** The dark
   `background 0.16 → surface 0.205 → popover 0.25` lightness steps and the
   heavier dark shadows are correct as authored (token parity and contrast
   pairs all pass), but at the visual level the surface separation is
   subtler than intended — cards can read as flush with the background.
   Fixing it means retuning dark surface lightness (and re-verifying every
   §3 contrast pair in `docs/DESIGN_TOKENS.md`), ideally against a real
   product's screens rather than the showcase.
2. **`DialogContent`'s close button label is hardcoded English** (`sr-only`
   "Close"). Localized products must hide it (`showCloseButton={false}`)
   and compose their own `DialogClose`. The first (Arabic-first) product
   build confirmed the friction — its backport fixed the same defect in
   `ThemeControl` (`optionLabels`) but left this one: a `closeLabel` prop
   changes a frozen primitive API, so it still waits for the next
   localized product to demand it.
3. **Three e2e specs hard-reference showcase URLs** (`shell`, `fonts`,
   `errors`) and need retargeting when the showcase is deleted
   (`docs/CLONING.md` §3 lists them precisely, together with the
   `playwright.config.ts` `testMatch` cleanup).
4. **The showcase gate requires a rebuild to flip.**
   `NEXT_PUBLIC_ENABLE_SHOWCASE` is inlined at build time — the price of
   keeping every route statically prerendered. A runtime kill-switch would
   force dynamic rendering; not worth it.
5. **Browser-matrix CI grows linearly with routes** (~4 console cells + ~4
   axe scans per page). Currently cheap (see `docs/TESTING.md` § CI for the
   measured numbers and the decision); revisit the full-matrix-on-PR policy
   when browser time passes ~10 minutes.
