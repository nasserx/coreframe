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

### i18n message translation — SHIPPED (2026-07)

- **Shipped:** a typed in-repo message layer (`src/i18n`) plus a client
  `LocaleProvider` (`src/core/providers`). Catalogues are typed against a
  canonical English shape (a missing/renamed key fails `tsc`); a
  namespace-scoped `useTranslations` (client, active locale) and
  `getTranslations` (server/static, default locale) resolve keys with
  compile-time safety. Locale, direction, numerals, and the active catalogue
  all derive from the ONE selected locale through `LOCALE_INFO`, so they can
  never disagree. `LocaleControl` replaced the showcase's direction toggle
  (direction is a property of language, not an independent control) and
  renders nothing on a single-locale deployment. Every route stays statically
  prerendered; the default catalogue is bundled and other locales are
  code-split, so a single-locale build carries no second-locale catalogue.
  The `(site)` showcase is translated to Arabic end to end (top bar included)
  as the proof. Full
  rationale — the routing decision, the library decision, and the
  single-locale path — in `docs/DIRECTION_AND_I18N.md`, `DECISIONS.md`, and
  `docs/CLONING.md` §3a.
- **Still a product's own responsibility (no signal yet):** ICU
  pluralization/gender and locale-aware number/date **formatting** (the
  hooks are there — `translate()` interpolation and `LOCALE_INFO.numerals` —
  but no formatting utilities ship; add them in `src/utils` when a product
  needs them), and **per-locale-URL routing** for a deployment that must
  serve multiple indexed locales at once (adopt sub-path `/[locale]/…` then;
  the message/type/switcher layer sits underneath it unchanged — see the
  routing decision in `DECISIONS.md`).

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

### Multi-level site navigation (dropdowns) — SHIPPED (2026-07)

- **Shipped:** `SiteShellNavMenu` + `SiteShellNavMenuItem` add a two-column
  dropdown panel of sub-destinations to any `SiteShellNav` item, built on
  Base UI's `NavigationMenu` (a navigation/disclosure pattern, not a
  `role="menu"` menubar). Panel opens on hover and click/tap, keyboard
  operable end to end, Escape/outside-press dismissal with focus return, and
  the unavailable-destination rule applies inside the panel. Below
  `collapseBelow` it renders in the drawer as a labelled group, not a flat
  dump. Full API, interaction model, and rationale in `docs/LAYOUT.md` §6;
  demo on `/showcase/site`.
- **Still absent (no signal yet):** a full **mega menu** (mixed media /
  featured blocks) and **nested submenus** inside a panel — Base UI's
  `NavigationMenu` supports nesting, but no product has needed either, so the
  primitive stays a single-level two-column panel. Build on the shipped
  component when a product's navigation genuinely demands more depth.

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
- **Trigger:** none expected. It is not a product. The
  `NEXT_PUBLIC_ENABLE_SHOWCASE` build-time flag makes its routes return static
  404s, but the source remains in the build graph until a product follows the
  permanent deletion procedure in `docs/CLONING.md`; polish would be effort
  spent on code products ultimately delete.

## Known open issues

Honest defects and frictions, none currently blocking:

1. **Dark theme's flat elevation — RESOLVED (2026-07), root cause found;
   values re-tuned 2026-08.** The ladder was widened twice (Δ0.045 → Δ0.06)
   and still read flat, which was the tell that the ladder was never the
   mechanism. A scripted check confirmed it: near black, equal OKLCH-L steps
   produce almost no _luminance_ contrast — `surface / background` sat at
   ~1.1:1 no matter how wide the ladder was drawn. The actual causes were
   (a) a near-black background with no headroom and (b) borders too weak to
   carry structure — the border token was 1.62:1 against background, and
   cards/popovers/dialogs did not even use it (they drew `ring-foreground/10`,
   fainter still). The fix was _not_ another ladder widening: borders carry
   dark separation, and cards/popovers/dialogs switched to `ring-border` so
   their edges track that hairline. The **2026-08 pass** then moved dark from
   warm-paper to a **neutral** near-black (warmth reads as dirt in dark, and
   the trace chroma was tinting the light-on-dark text yellow) and rebalanced
   the border from the 2026-07 overshoot (0.44 / 2.42:1, which read heavy) to
   0.40 (2.02:1) — quiet but still visible, verified not to disappear.
   Every §3 pair recomputed and passes; all six gates and the axe matrix are
   green; dark screenshots confirm cards, popovers, and dialogs are clearly
   distinct from their backgrounds and text reads near-pure white. No
   remaining caveat — this issue is closed.
2. **`DialogContent`'s close button label — RESOLVED (2026-07).** The i18n
   pass added an optional `closeLabel` prop to `DialogContent` and
   `DialogFooter` (default `"Close"`), the sanctioned "optional label prop"
   extension — localized products pass a translated value instead of hiding
   the button and composing their own `DialogClose`. Consistent with the
   shells' label props and `ThemeControl.optionLabels`.
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

## Deferred tooling upgrades

Upgrades held back on purpose, waiting on an upstream signal — not neglect.

**Shared root cause.** Both blocks below have the same origin: `eslint-config-next`
bundles its own copies of the lint/type plugins (`eslint-plugin-react`,
`eslint-plugin-import`, `@typescript-eslint/*`). Our lint/type stack therefore
advances at eslint-config-next's pace, not ours — a major bump of a _host_ tool
(`eslint`, `typescript`) that lands ahead of those bundled plugins breaks
`npm run lint`/`typecheck` in CI even though our own code is unchanged. The
general rule this encodes: **majors of the lint/type toolchain ride in on a
Next.js major** (which upgrades eslint-config-next and its plugins together),
never on their own. `.github/dependabot.yml` ignores `semver-major` for the whole
family (`eslint`, `typescript`, and defensively `eslint-plugin-*`,
`@typescript-eslint/*`, `typescript-eslint`); `eslint-config-next` itself is left
free, since it is the governor that unblocks the rest.

### ESLint 10 (blocked on eslint-config-next's bundled plugins)

- **Blocked:** the ESLint major line. `eslint` is pinned to `^9` and Dependabot
  ignores its `semver-major` updates (`.github/dependabot.yml`). Minor/patch of
  ESLint 9 still flow normally.
- **Why:** `eslint-config-next` bundles `eslint-plugin-react@7.37.x`, which calls
  `context.getFilename()` — an API removed in ESLint 10. Loading any React rule
  (e.g. `react/display-name`) throws
  `contextOrFilename.getFilename is not a function`, aborting the whole lint run.
  A Dependabot PR bumping `eslint` 9.39.4 → 10.7.0 (#7) was merged and broke CI on
  `main`; it was reverted on `fix/eslint-major-regression`. This is a tooling gap,
  not a defect in this repo's code.
- **Upstream tracking:** eslint-plugin-react ESLint 10 support —
  <https://github.com/jsx-eslint/eslint-plugin-react/issues/3699>
- **Revisit signal:** `eslint-config-next` ships a release whose bundled
  `eslint-plugin-react`/`eslint-plugin-import` support ESLint 10 (normally arrives
  with a Next.js major). At that point: bump `eslint-config-next`, raise the
  `eslint` constraint, drop the `eslint` `ignore` entry in
  `.github/dependabot.yml`, and confirm `npm run lint` passes.

### TypeScript 6/7 (blocked on typescript-eslint)

- **Blocked:** the TypeScript major line. `typescript` is pinned to `^5` and
  Dependabot is configured to ignore its `semver-major` updates
  (`.github/dependabot.yml`). Minor/patch of TS 5 still flow normally.
- **Why:** TypeScript 7 is a full rewrite of the compiler (the "native"/Go
  port), and the type-aware lint ecosystem has not caught up —
  typescript-eslint's peer range is `>=4.8.4 <6.1.0`, so a major bump makes
  `npm run lint` fail in CI (the linter refuses to run against an unsupported
  compiler). This is a tooling gap, not a defect in this repo's code. A
  Dependabot PR proposing `7.0.2` was closed unmerged for exactly this reason.
- **Upstream tracking:**
  <https://github.com/typescript-eslint/typescript-eslint/issues/10940>
- **Revisit signal:** typescript-eslint publishes a release whose `typescript`
  peer range admits the target major (e.g. `<7.1.0` or wider). At that point:
  bump `@typescript-eslint/*` (via `eslint-config-next`/its own release), then
  raise the `typescript` constraint, drop the `ignore` entry in
  `.github/dependabot.yml`, and confirm `npm run lint` + `npm run typecheck`
  pass. TS 6 is covered by the same block for the same reason and lifts the
  same way.

## Deferred findings from the archived 2026-07 health audit

The `chore/template-hardening` pass implemented the high-value findings of
`docs/audit/2026-07-health-audit.md` (LICENSE; locale-aware font preload; zod
kept out of the client for unvalidated fetches; `shadcn` → devDependencies;
`.editorconfig` / `SECURITY.md` / Dependabot). These findings were **considered
and deliberately not actioned** — each is recorded here so the choice is
visible, not silent.

The audit file is a point-in-time record. Version and vulnerability counts in
this section are refreshed from the installed tree and current `npm audit`
output; archived counts inside `docs/audit/` remain unchanged.

> **Current state (since removed):** `LICENSE` and `SECURITY.md` no longer exist — the repo is now private with no project licence. The record above of what the hardening pass did stays true; for the reversal see `DECISIONS.md` → _Private repository, no project license_.

1. **Three production `npm audit` findings remain (all unreachable).**
   _Posture refreshed 2026-07-29 against measured output._ The production tree
   (`npm audit --omit=dev`) reports **3 high, 0 moderate**:

   - `next`→`postcss` (`<=8.5.17`), now **high**, not the moderate this entry
     first recorded, and carrying three advisories of a different class than
     the original one: XSS via an unescaped `</style>` in stringify output,
     **arbitrary file read** via an attacker-controlled `sourceMappingURL` in a
     CSS comment, and **path traversal** in previous-source-map auto-loading.
   - `next`→`sharp` and `sharp` (`<0.35.0`), high, inherited libvips CVEs.

   **No safe audit remediation is offered for the installed tree.** The
   repository has `next@16.2.12`; current `npm audit` still traces these
   findings through Next's bundled PostCSS and Sharp dependencies. Its only
   proposed remediation is `npm audit fix --force`, which would install
   `next@9.3.3` — a breaking downgrade, still unacceptable. This statement is
   about the installed version, not a claim that it is the latest release.

   **The reachability argument holds, with one precondition now made explicit.**
   `sharp` is Next's image optimizer and `next/image` is used **0 times**
   (verified), so it cannot be reached. `postcss` runs only at build. But the
   two new advisories are reached through **the CSS postcss is given**, not
   through when it runs — so "build-time only" is no longer the whole argument.
   The complete one: every stylesheet in this build is first-party or a vetted
   package (`src/styles/*`, `shadcn/tailwind.css`, `tw-animate-css`), none is
   user-supplied, and nothing generates CSS from input. **Re-evaluate the moment
   a product adds `next/image`** (sharp becomes reachable), **a new build
   plugin**, or — new trigger — **any build step that processes CSS the product
   does not author**: a CMS-supplied theme, a plugin stylesheet, or
   user-authored styles.

   The full tree reports **14 findings (12 high, 2 moderate)**, mostly
   `minimatch`/`brace-expansion` reached through
   `eslint-config-next`'s bundled plugins, plus
   `shadcn`→`@modelcontextprotocol/sdk`→`@hono/node-server`. All are CLI and
   lint tooling, absent from `npm ci --omit=dev` production installs.

2. **No `browserslist` was added** (audit §2.3 suggested one). Argued against:
   `browserslist` governs JS **syntax** downleveling, not Web-API availability,
   so it would not make `AbortSignal.any` (the client's early-2024 platform
   floor) work on older browsers — it would only imply a guarantee the build
   cannot keep. The honest fix was **documentation**: the floor and the
   polyfill escape hatch are now stated in `docs/DATA_LAYER.md`. A product with
   a hard old-browser requirement should polyfill `AbortSignal`, not add a
   config that misleads.

3. **`scroll-padding-block-start: 4rem` stays hand-synced to the shells' `h-16`
   headers** (audit §2.5). Deferring: deriving CSS `scroll-padding` from a
   Tailwind height token cleanly is not straightforward, the value is
   commented as a matched pair on both sides, and the failure mode (an anchor
   target landing behind the bar) is cosmetic and only triggers if a clone
   changes the header height. **Trigger:** the first product that restyles the
   shell header height — add an e2e assertion or a shared token then.

4. **Home-route baseline First Load JS (~216 KB gz) is accepted as the
   framework floor** (audit §1.3): React + Next runtime + the app-wide provider
   stack (Theme, Query, Toaster, ErrorBoundary). The audit itself recommended
   no action. **Trigger:** a product whose landing page must be leaner mounts
   the Query/Toaster providers in a nested layout rather than the root — record
   that trade-off if taken.

5. **`src/config/routes.ts` (`ROUTES`) and `features.ts` (`FEATURE_FLAGS`)
   remain unused scaffold** (audit §4.1). Kept intentionally: they are
   documented foundation public-API placeholders, correctly minimal, and cost
   nothing. A clone deletes or fills them per its needs.

## Friction points a product team is most likely to hit

Surfaced by the 2026-07 system-review pass — the places where a real product
is most likely to fight the foundation rather than extend it. Not defects;
recorded so the fix is a deliberate decision when the signal arrives, not a
surprise.

1. **Two typographic systems coexist.** Pages and `PageHeader` speak the
   ramp (`text-display`…`text-caption`, with weight/tracking/leading baked
   in); every `src/components/ui` primitive speaks raw Tailwind
   (`text-sm`/`text-base`/`text-xs`, `font-medium`). They are not
   interchangeable — `text-small` and `text-sm` are the same size but
   different line-heights — so a team writing UI has to know which system a
   given surface belongs to, and mixing them subtly breaks vertical rhythm.
   The split is inherited from shadcn (its primitives predate the ramp).
   **Extension point / trigger:** if this bites, decide one way — either map
   the primitives onto the ramp (larger, coordinated change; re-verify the
   overflow sweep) or document the primitives' scale as a deliberate second
   system. Left as-is for now because converting 20 primitives is a churny
   change with real regression surface and no product yet asking for it.

2. **The shells are structural-only.** `AppShell`/`SiteShell` deliberately
   ship no brand slot, user menu, or collapse-to-icons (`docs/LAYOUT.md` §5)
   — so the first thing nearly every product does is hand-build that chrome
   at the call site. That is the intended boundary (chrome identity is
   product territory), but it means "start a real app" is not "drop in the
   shell and go." **Trigger:** if two products build materially the same
   header cluster (brand + user menu + actions), promote that composition to
   a feature-level example, not into the shell.

3. **One primitive string and frozen variant sets still need deliberate
   extension.** `DialogContent`/`DialogFooter` take `closeLabel`, the shells
   take label props, and `ThemeControl` takes `optionLabels`. Native prop spread
   also lets consumers override `aria-label` on `Pagination`,
   `PaginationPrevious`, `PaginationNext`, `Breadcrumb`, and `Spinner`; the
   previous/next components additionally expose visible `text`. The remaining
   frozen string is `PaginationEllipsis`'s nested sr-only `"More pages"`, which
   its span props cannot replace. Separately, Button's variant/size set remains
   intentionally frozen. **Trigger:** a localized product that surfaces the
   pagination ellipsis (add the smallest label prop there), or the first
   product with a genuine variant need the official set cannot express.
