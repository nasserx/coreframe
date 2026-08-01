# Testing

Two layers, two runners, chosen for the two failure classes this foundation
has actually shipped. Both defects that motivated this baseline — a React
hydration mismatch in Pagination and an Arabic webfont silently intercepted
by a metric fallback — passed a fully green `format:check → lint → typecheck
→ build`. Static analysis cannot see either class; only executing the app in
a browser can.

## The stack and why

| Layer          | Runner                           | Config                 |
| -------------- | -------------------------------- | ---------------------- |
| Unit/component | Vitest + Testing Library + jsdom | `vitest.config.ts`     |
| Browser        | Playwright (Chromium) + axe-core | `playwright.config.ts` |

**Vitest** because it runs this repo's exact TypeScript configuration
(strict flags, `verbatimModuleSyntax`, the `@/` alias) with zero transform
setup — the alias mirror in `vitest.config.ts` is the entire integration.
_Rejected: Jest_ — needs a transformer chain (SWC/Babel), separate ESM
handling, and its own module-mapper duplication of the alias; a cloning team
would inherit configuration surface that Vitest simply doesn't have.

**Playwright** because the browser layer's job is exactly what it provides
natively: console message capture, `page.evaluate` against real
`document.fonts`, a maintained axe integration (`@axe-core/playwright`),
and managed web servers. _Rejected: raw CDP scripts_ — that was the
throwaway harness that found the hydration bug; it worked once but had no
assertion framework, reporting, parallelism, or CI story. _Rejected:
Cypress_ — heavier runtime, no first-class multi-server setup, and nothing
it adds over Playwright for these suites. No visual-regression tool was
added: no shipped defect justifies one yet, and screenshot baselines rot
fast in a template repo.

## What each layer is responsible for

**Unit/component (`src/**/*.test.{ts,tsx}`, colocated with the code):**
behavioral contracts of primitives and infrastructure. The reference tests
are meant to be copied:

- `src/lib/utils.test.ts` — pure utility testing (`cn`), no DOM.
- `src/components/ui/button.test.tsx` — a primitive's API: roles, accessible
  name, disabled semantics, variant classes, and the render-prop slot
  contract that caused the hydration defect.
- `src/core/errors/error-boundary.test.tsx` — catch/fallback/reset cycle,
  including the React 19 caveat that a throwing child must throw
  consistently (concurrent rendering retries once before the boundary
  engages).
- `src/core/providers/theme-provider.test.tsx` — module-singleton state
  (`vi.resetModules()` + dynamic import per test), a controllable
  `matchMedia` stub, storage failure, cross-tab sync, and parity between the
  provider and the real pre-paint init script (the script string is executed,
  not paraphrased).
- `src/styles/token-parity.test.ts` — exact authored values, source-level
  parity and bridge checks, plus whole-palette OKLCH gamut, WCAG contrast, and
  selected/disabled/invalid state checks (including alpha composites), where
  jsdom's missing CSS cascade does not matter.

Accessibility at this layer: query by role and accessible name
(`getByRole("button", { name: … })`), assert state through ARIA-visible
semantics (`toBeDisabled`, `role="alert"`). If a test can only find its
element by test id or class, the component probably has an accessibility
problem.

**Browser (`tests/e2e/*.spec.ts`):** the regression net for what only a real
browser can falsify.

Spec discovery follows server ownership. `chromium-dev` matches only
`console-clean.spec.ts`; `chromium-prod` matches every other `*.spec.ts` under
`tests/e2e`. A new E2E spec therefore enters production coverage automatically
unless it is deliberately assigned to the development server.

- `console-clean.spec.ts` — every route × {light, dark} × {ltr, rtl} must
  produce zero console errors, warnings, uncaught exceptions, or failed
  requests. Runs against `next dev` deliberately: React reports hydration
  mismatches only in development builds — production silently ignores
  attribute-level mismatches (verified by reintroducing the Pagination
  defect: prod stayed green, dev failed with the exact diff). There is no
  message allowlist; a benign message must be filtered by a reviewed code
  change with a comment.
- `fonts.spec.ts` — asserts Inter and all authored Tajawal weights are
  **loaded** (`document.fonts`) and **used**: Latin and Arabic samples measured
  through the shared page stack must match the intended family and differ from
  Arial. "The page shows the right script" is not evidence; a plausible
  fallback can hide a broken family order.
- `a11y.spec.ts` — axe-core (WCAG 2.x A/AA) over every route in all four
  theme/direction cells. axe automates roughly the third of WCAG that is
  machine-checkable; treat a clean scan as a floor. False positives must be
  excluded explicitly with an argument in a comment, never silently.
- `errors.spec.ts` — the error surfaces that discovery cannot cover: an
  unmatched URL must return 404 with the branded not-found page (axe-scanned
  separately, since it is not a `page.*` route) and a working way home, and
  the ErrorBoundary throw → fallback → reset cycle must work against the
  production build. `error.tsx`/`global-error.tsx` are deliberately not
  driven here — that would require shipping a throwing route; their document
  shell was verified manually (docs/DATA_LAYER.md § Route-level error
  handling).
- `shell.spec.ts` — operability proof for both shells' responsive
  navigation (AppShell on `/showcase`, SiteShell on `/showcase/site`): at a
  mobile viewport the drawer opens, traps focus, closes on Escape with
  focus returned to the trigger, and dismisses itself on navigation; at
  desktop the persistent navigation navigates and marks the current page,
  SiteShell's unavailable items stay out of the tab order, and the skip
  link is the first focusable element. It also verifies SiteShell's 8px
  top-to-glass threshold across theme, direction, and mobile/desktop cells:
  separator-free top/scrolled states, semantic translucent background + backdrop blur,
  invariant header height, visible focus, responsive brand-mark size, and
  reduced-motion transition removal. axe can only attest the markup; these
  drive the interactions.
- `overflow.spec.ts` — horizontal-overflow regression net: every
  discovered route, swept across the viewport range (320–1536 px) in both
  directions, must neither scroll the page horizontally nor let a shell
  bar row overflow its own box. Exists because the first product built on
  this foundation shipped a top bar that overflowed at every width behind
  a fully green pipeline — overflow is a runtime layout fact no static
  gate can see, and a bar can overflow inside `overflow-x: hidden` chrome
  without moving the page-level scrollWidth.
- `geometry.spec.ts` — rendered control/layout contract: the shared
  Container cap and gutters across the required viewport/direction matrix;
  Button and public-site CTA heights; pointer, active, keyboard-focus, and
  reduced-motion transforms; long English/Arabic label containment; and the
  distinction between interactive linked-card lift and motionless static
  Cards. These are computed-layout assertions against the production build,
  not duplicated class strings.
- `forms.spec.ts` — the `/showcase/forms` reference form in its states that
  route discovery never reaches: first-invalid focus against real DOM focus, a
  real HTTP round trip to the route handler, server field-error mapping,
  the form-level alert, pending/duplicate-submit prevention, a live language
  switch that re-renders an error already on screen, LTR email entry inside the
  RTL form, and axe scans of the error and success states. Route-level axe,
  console, and overflow coverage for the page still comes from discovery.
- `controls.spec.ts` — the shared language and theme toggles in the states that
  span a navigation and therefore cannot be unit-tested: a choice surviving a
  reload, the one-time `prefers-color-scheme` fallback (not written back), a
  legacy stored `"system"` still resolving, an OS change after initialization
  being ignored, and — the defect class the browser layer exists for — the theme
  landing on the document at `DOMContentLoaded`, before React hydrates, rather
  than from an effect. Also drives the drawer copies, keyboard activation,
  checkpoint-width fit in both locales, header axe scans, and the rendered
  geometry the controls exist to hold: exactly 36px squares with the outline
  variant's one-pixel border in all four theme/locale cells, alignment with the
  header CTA, and no transform on either glyph in any interaction state. Two
  traps make that geometry harder to measure than it looks, and both are
  encoded here. First, `click()` leaves the cursor on the button, so a
  state-change measurement taken straight afterwards samples the outline
  variant's hover lift mid-transition; every such measurement therefore parks
  the pointer away from the cluster first, and reads only movement caused by
  the state change. Second, that lift is a real inherited behaviour rather than
  something to dodge, so it has its own test asserting it is exactly `-2px` on
  hover and reverts completely — a lift that never accumulates cannot become a
  layout shift. Note also that both shells render each control twice (bar
  cluster + drawer copy), so every page-side lookup here selects the copy that
  is actually laid out; reading the hidden one measures a zero-sized box and
  passes vacuously.
- `marketing.spec.ts` — the production `/` contract: one landmark set and
  heading hierarchy, canonical server metadata, live English/Arabic copy,
  named informative specimens, the composed sections' own behavior
  (disclosure, informational cards, closing CTA, footer destinations),
  theme/direction axe scans, checkpoint-width overflow, and same-page mobile
  navigation. It stays route-specific because these are production composition
  claims, not SiteShell mechanics, and it is the one spec that grows with a
  page's composition rather than with route discovery.
- `marketing-motion.spec.ts` — motion behaviour over time, covering two
  deliberately separate contracts. The **global** one is verified beyond
  marketing: computed `scroll-behavior` is `smooth` and
  `scroll-padding-block-start` is `64px` on `/` and on Showcase routes alike,
  and reduced motion turns every one of them to `auto`. The **route-owned** one
  is verified to stay put: Showcase routes carry no reveal unit, no reveal
  state, and run no keyframe animation when scrolled. Around those, anchors
  stay real links that land clear of the sticky bar (on click, on keypress, and
  on direct hash load) and the reveal runs once per unit without replaying.
  Two rules keep it from becoming a timing test. First,
  nothing asserts an elapsed duration: entry is awaited through the reveal's
  own state attribute and then through `getAnimations()`, so a scan can never
  read a half-faded element, and "smooth versus immediate" is decided by
  counting the trip's own scroll events rather than by how long it took.
  Second, the enhancement's absence is tested as directly as its presence —
  with JavaScript disabled, with `IntersectionObserver` deleted, and under
  reduced motion, every section must still be visible and unhidden.

Routes are **discovered** (`tests/e2e/routes.ts` walks `src/app` for
`page.*`), so a new page is covered automatically. Dynamic or parallel
segments throw until discovery is extended — coverage is never silently
lost.

## Deliberately not tested

- **Showcase page content** — the showcase is an inspection surface, not a
  product; the browser matrix already executes every page.
- **shadcn/Base UI internals** (focus traps, dismissal, positioning) —
  upstream-tested; re-testing them couples this repo to vendored internals.
- **Visual appearance** — no screenshot baselines (see stack rationale).
- **Anything requiring an external backend** — the only endpoints are this
  repo's own route handlers (`/api/showcase/records`, and the reference form's
  `/api/showcase/forms/reference`), so `query-demo`, the reference form, and
  the whole browser matrix run offline; the transport contract itself is
  unit-tested against a stubbed fetch (`src/api/client.test.ts`).
- **Coverage targets** — none are configured on purpose. The reference
  tests establish patterns; a percentage gate on a template repo rewards
  test bulk, not defect detection.

## Running locally

```bash
npm test              # unit/component (Vitest)
npm run test:watch    # Vitest watch mode
npm run build         # required once before the browser layer (prod server)
npm run test:e2e      # browser layer (Playwright)
```

One-time setup: `npx playwright install chromium`. The browser layer starts
two servers itself: `next start` on port 3100 for every production-owned spec,
and `next dev` on port 3000 for the console/hydration harness. Locally, both
reuse an already running server on their port — which is what lets the dev
harness attach to your own `npm run dev`, since Next allows one dev server per
directory. Setting `CI` disables that reuse, so both ports must be free before
a `CI=1` run.

## Extending (for a product team)

- New utility/hook/primitive → colocate `*.test.{ts,tsx}` next to it, copy
  the closest reference test's shape.
- New page → nothing to do; discovery covers it in all three browser suites.
- New dynamic route (`[param]`) → extend `discoverRoutes()` with concrete
  sample URLs; it throws until you do.
- New locale/direction/theme states → extend the matrix constants in
  `tests/e2e/routes.ts`.
- A flow worth testing end-to-end (auth, checkout) → new spec under
  `tests/e2e`; it is production-owned automatically. Keep the console listener
  pattern from `console-clean.spec.ts` so flows also fail on console noise.
- Judging an axe finding a false positive → exclude it in `a11y.spec.ts`
  with a comment arguing why; never lower the tag set.

## CI

`.github/workflows/ci.yml` runs `format:check → lint → typecheck → unit
tests → build → browser tests` in one job, on every PR and push to `main`,
with no secrets or configuration — a fresh clone's CI is green on day one.
Node comes from `.nvmrc` (currently `24.18.0`, matching the `engines` range in
`package.json`). The browser step downloads Chromium only on a Playwright
version change (cached otherwise).

**The full browser matrix runs on every PR — deliberately.** Current measured
discovery (`npx playwright test --list`, 2026-08-01) is **235 Playwright tests
in 12 spec files across 2 projects**, over the **13 app-page routes** that
`tests/e2e/routes.ts` discovers:

- 52 `chromium-dev` console cells (13 routes × 2 themes × 2 directions);
- 52 `chromium-prod` axe cells over the same matrix;
- 26 `chromium-prod` overflow cells (13 routes × 2 directions);
- 105 targeted `chromium-prod` tests for fonts, errors, shells, i18n,
  geometry, the marketing route and its motion, the reference form, and the
  shared controls.

That route number counts `page.*` files under `src/app`. It is deliberately
not the build's printed route table — which also lists the not-found page, the
route handlers, and the generated icon — and not the count of statically
generated pages; all three differ, and `npm run build` owns the latter two.
Route handlers are not pages and never enter route discovery.

These counts are separate from the Vitest unit/component layer, currently 261
tests in 35 files. A representative-subset-on-PR scheme remains rejected
because tokens, direction, fonts, and providers can affect every route at
once. Growth is linear: each discovered page adds four development console
cells, four production axe cells, and two production overflow cells. Revisit
the policy when browser time passes roughly 10 minutes; `docs/ROADMAP.md` owns
that trigger.

Pre-commit stays lint-staged only — no tests. Rationale: pre-commit exists
to keep diffs clean, not to prove correctness; even the fast unit run grows
linearly with the suite, and the browser layer (a build plus two servers) is
minutes. Correctness gating belongs to CI, which runs the full matrix on
every push and PR.
