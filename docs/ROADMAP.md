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

## Deferred from the 2026-07 health audit

The `chore/template-hardening` pass implemented the high-value findings of
`docs/audit/2026-07-health-audit.md` (LICENSE; locale-aware font preload; zod
kept out of the client for unvalidated fetches; `shadcn` → devDependencies;
`.editorconfig` / `SECURITY.md` / Dependabot). These findings were **considered
and deliberately not actioned** — each is recorded here so the choice is
visible, not silent.

1. **Three production `npm audit` findings remain (all unreachable).** After
   moving `shadcn` to devDependencies, the production tree carries `next`→`postcss`
   (moderate, build-time only), and `next`→`sharp` / `sharp` (high, libvips
   CVEs). **Not fixed because the only `npm audit fix` is `--force`, which
   downgrades `next` to 9.x — unacceptable.** None is reachable here: `sharp`
   is Next's image optimizer and `next/image` is used **0 times**; `postcss`
   runs at build, never in the client or request path. `next@16.2.11` (bumped
   this pass) still pins the same transitive versions. **Re-evaluate the moment
   a product adds `next/image`** (sharp becomes reachable) or a new build
   plugin. The four dev-only findings (`shadcn`/`@modelcontextprotocol/sdk`/
   `@hono/node-server`/`fast-uri`) are CLI tooling, absent from `npm ci
--omit=dev` production installs.

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

5. **`CLAUDE.md` restates parts of `docs/` at length** (audit §3.4). Not
   trimmed this pass — it is accurate today, and thinning it is editorial work
   with its own drift risk. Left as an ongoing maintenance note; the "docs win
   on conflict" rule already governs it.

6. **`src/config/routes.ts` (`ROUTES`) and `features.ts` (`FEATURE_FLAGS`)
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

3. **Frozen primitive strings and variant sets require forking to extend.**
   `DialogContent`'s close label is hardcoded English (known issue #2),
   Button's variant/size set is explicitly "do not extend per-product", and
   several primitives hardcode English affordance copy. A product that needs
   a localized close button, or one more button variant, edits the primitive
   rather than composing around it. **Trigger:** the next localized product
   (adds `closeLabel` and audits the other hardcoded strings together) and
   the first product with a genuine variant need the official set cannot
   express.
