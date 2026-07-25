# Comprehensive foundation review — 2026-07 (read-only)

Point-in-time audit of the repository at commit `495b464` on branch
`chore/foundation-audit-hardening`. **Read-only**: no source, config, test,
style, or doc file was modified; this report is the only file added. Every
finding cites `path:line` and was verified by reading the code and, where a
claim was checkable, by executing it (see Appendix A for the exact commands
and their real output).

Judged against the repository's own rules: `ARCHITECTURE.md`,
`CODE_STYLE.md`, `docs/*`, `eslint.config.mjs`, `tsconfig.json`,
`commitlint.config.mjs`, and `.claude/skills/foundation-rules/SKILL.md`.

> **Status: fixes applied (2026-07, branch `chore/foundation-audit-fixes`).**
> This report is a point-in-time snapshot and, per `docs/audit/README.md`, is
> not edited after the fact — this note is the one exception, recording what
> was actioned so a later reader does not re-litigate closed findings. **19 of
> the 22 findings are fixed**, one commit each, every commit citing its ID:
>
> - **Bugs, with tests:** `DATA-01` (aborts during the body read are now
>   classified, not reported as malformed JSON), `CORR-01` (a failed catalogue
>   chunk reverts the locale instead of leaving English prose in an RTL
>   document), `SEC-01` (origin-hijacking paths rejected at the boundary),
>   `A11Y-01` (the ellipsis fallbacks are reachable in Pagination, removed in
>   Breadcrumb).
> - **Layout / consistency:** `LAY-01`, `NIT-01`.
> - **Tests:** `TEST-01` (placeholder parity, `useDocumentDirection`, token→bridge
>   reachability), `TEST-02` (the matrix waits on a condition, not a sleep).
> - **Docs / config:** `DOC-01`…`DOC-10`, `CFG-01`, `CFG-02`, `PERF-01`,
>   `DEP-01`, `NIT-02`.
>
> **Deliberately not actioned** (unchanged recommendations, see "Deferred"):
> the dependency majors held by `eslint-config-next` (deferred item 6), the CI
> action pins that need a real CI run to confirm (item 7), and the two
> typographic systems across the 28 primitives (item 2 — only the two
> page-level surfaces in `LAY-01` were in scope). `DEP-01` was investigated for
> a safe patch and there is none: `next@16.2.11` is the latest 16.x and
> hard-pins `postcss@8.4.31`, so only the audit record was refreshed.

---

## Executive summary

**Verdict: Ready-with-caveats.**

This is an unusually disciplined codebase, and the audit's most important
finding is a negative one: **the claims this repo makes about itself are, with
a small number of exceptions, true and independently verifiable.** All six
quality gates pass on a clean run (150 browser tests included). All 30
documented WCAG contrast pairs reproduce **exactly** when recomputed from the
CSS with an independent OKLCH→sRGB→WCAG implementation, including the derived
hairline ratios and the body↔secondary separation figures. The measured
bundle numbers match the documented ones: zod is genuinely absent from routes
that validate nothing, the Arabic catalogue is genuinely code-split out of
every route's First Load JS, and exactly one 26 KB font is preloaded per page.
Zero `any`, zero `@ts-expect-error`, zero non-null assertions, one
`eslint-disable` (justified), one `TODO` (the documented Auth slot).

The caveats are concentrated in two places, neither of which a green build can
see:

1. **Documentation drift in the highest-traffic documents.** `README.md` — the
   file the repo designates as its entry point — still tells a reader that
   message translation is "deliberately not included", four milestones after it
   shipped (`DOC-01`). `DECISIONS.md`, the authority a developer consults
   before touching a dependency, records `shadcn` as "a regular dependency"
   when it is a devDependency (`DOC-02`). Eight further drifts are smaller but
   follow the same pattern: the 2026-08/09/10 token, layout, and i18n passes
   updated the owning doc and the code, and left sibling documents behind. For
   a repo whose entire value proposition is "clone this and trust the
   documentation", stale docs are the primary defect class, not a cosmetic one.

2. **One real correctness bug and one real unhandled rejection** in the data
   and locale runtimes — both in error paths, both untested, both invisible to
   every existing gate (`DATA-01`, `CORR-01`).

Nothing found is a security hole, a data-integrity risk, or an architectural
mistake. The dependency-direction lint, the token system, the layout
contracts, the render-prop hydration rule, and the browser matrix all hold
under inspection. **Recommendation: fix `DOC-01`, `DOC-02`, `DATA-01`, and
`CORR-01` before the next clone; the rest is a maintenance backlog.**

### Findings by severity

| Severity  | Count  |
| --------- | ------ |
| Critical  | 0      |
| High      | 3      |
| Medium    | 6      |
| Low       | 11     |
| Nit       | 2      |
| **Total** | **22** |

---

## Findings

### High

| ID        | Category          | Location                                             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Impact                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Proposed fix                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Risk of fix                                                                              |
| --------- | ----------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `DOC-01`  | doc↔code          | `README.md:143-145` (also `:36`, `:59-61`, `:56-75`) | README's "Direction & internationalization" section states **"Message translation is deliberately not included — `docs/DIRECTION_AND_I18N.md` has the architecture and the integration points for adding an i18n library."** Message translation shipped in milestone 16: `src/i18n` (typed catalogues + resolver), `LocaleProvider`, `LocaleControl`, an Arabic catalogue, and a dedicated e2e spec. `CLAUDE.md`, `docs/ROADMAP.md:24`, `docs/DIRECTION_AND_I18N.md:12-14`, and `DECISIONS.md:151-167` all correctly describe it as shipped. The README additionally omits `LocaleProvider` from its `src/core` provider list (`:59-61`) and omits `src/i18n` from the folder overview entirely. | The README is the repo's self-designated entry point ("This README is the entry point") and the first file a cloning developer reads. It actively directs them to build or install something that already exists — the exact duplicated-work failure `docs/ROADMAP.md` exists to prevent. The doc is wrong; the code is right.                                                                                                                                                                                                                                                                                                                                                                            | Rewrite `README.md`'s i18n section from `docs/DIRECTION_AND_I18N.md:7-46`; add `src/i18n` to the folder overview; add `LocaleProvider` to the core provider list; update the doc-map row for `DIRECTION_AND_I18N.md` to mention message translation.                                                                                                                                                                                                             | **None** — doc-only.                                                                     |
| `DOC-02`  | doc↔code / config | `DECISIONS.md:119-125` vs `package.json:56`          | The decision record titled "shadcn/ui runtime pieces" states the `shadcn` package "is a **regular dependency** because `globals.css` imports `shadcn/tailwind.css` — the current shadcn v4 pattern makes the registry package part of the styling pipeline." `shadcn@^4.14.0` is in **`devDependencies`**, moved there by the 2026-07 template-hardening pass (`docs/ROADMAP.md:245-251` records the move as a fix). The decision log was never updated.                                                                                                                                                                                                                                          | `DECISIONS.md` is the documented authority a developer consults before adding, moving, or removing a dependency (`SKILL.md:118`). Its stated reason for a placement contradicts the actual placement, so the next person to reconcile them may "fix" the wrong side and move `shadcn` back to `dependencies` — undoing a deliberate hardening change. Verified: `npm ls shadcn --omit=dev` → empty; `require.resolve("shadcn/tailwind.css")` → `node_modules/shadcn/dist/tailwind.css`; that file supplies the `data-open`/`data-closed`/`data-active`/`data-checked`/`data-horizontal`/`data-vertical` custom variants used **54 times** across `src`.                                                   | Amend the `DECISIONS.md` entry: `shadcn` is a **devDependency**, consistent with `tailwindcss` and `@tailwindcss/postcss` — the whole CSS toolchain is build-time, so none of it belongs in the runtime tree. Note that `globals.css` importing it does not imply a production dependency, because CSS is compiled at build. (See "False alarms" — I initially suspected this broke `--omit=dev` installs and proved it does not, for a reason worth recording.) | **None** — doc-only. Do **not** move the package.                                        |
| `DATA-01` | correctness       | `src/api/client.ts:110-120`                          | The response-body read is wrapped in a `try/catch` that maps **every** rejection to `kind: "parse"` with the message "Response from ${url} is not valid JSON." But the combined `AbortSignal` (caller signal + `AbortSignal.timeout`) stays armed through the body read. So (a) a **caller abort** during body streaming is caught and wrapped in an `ApiError`, and (b) a **timeout** during body streaming is reported as `"parse"`. The caller-abort rethrow guard exists only around the `fetch` call itself (`:74-94`), not around the body read.                                                                                                                                            | Directly contradicts two documented contracts: `src/api/errors.ts:19-21` ("When the caller's own `AbortSignal` aborts, the abort reason is rethrown untouched") and `docs/DATA_LAYER.md:60-62` ("Deliberately **not** an error: caller cancellation"). Consequence: React Query sees a _failure_ instead of a _cancellation_ for any query cancelled mid-body — so it renders an error state for ordinary teardown (component unmount, rapid refetch, route change) whenever the payload is large enough to stream. A genuine timeout is also misdiagnosed as malformed JSON, sending debugging in the wrong direction. Not covered by `src/api/client.test.ts` (10 cases; none aborts during body read). | Extract the abort classification from the `fetch` catch into a helper and apply it to the body-read catch too: on rejection, if `options.signal?.aborted` rethrow untouched; else if `timeoutSignal.aborted` throw `kind: "timeout"`; else throw `kind: "parse"`. Add two contract tests (caller abort mid-body, timeout mid-body).                                                                                                                              | **Low** — additive branching in one function, fully unit-testable; no public API change. |

### Medium

| ID        | Category                          | Location                                                                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Impact                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Proposed fix                                                                                                                                                                                                                                                                                                                                                                           | Risk of fix                                                                                                                                                             |
| --------- | --------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CORR-01` | correctness / unhandled rejection | `src/core/providers/locale-provider.tsx:168-182`                                       | `void loadCatalogue(locale).then((loaded) => { … })` has **no** `.catch` and no rejection path. `loadCatalogue` for a non-default locale is a dynamic `import()` of a code-split chunk (`src/i18n/catalogue.ts:46`), which rejects on any chunk-load failure: offline, CDN blip, or a deploy that rotated chunk hashes while the tab was open.                                                                                                                                                                                                                                                                                                                                                                                                            | Two consequences. (1) An **unhandled promise rejection** — which the `console-clean.spec.ts` harness would flag as a `pageerror` if it were reproducible, so the repo's own gate treats this class as a defect. (2) Worse for the user: `direction` and the `lang`/`dir` attributes are derived synchronously from the locale (`:184-189`) and switch immediately, while `messages` falls back to `DEFAULT_CATALOGUE` (`:166`). A failed Arabic chunk therefore renders **English text in a right-to-left document** with `lang="ar"` — a silently wrong state with no error surfaced and no retry. Untested: `locale-provider.test.tsx` has 7 tests, none for the rejection path.                                                                     | Add a rejection handler that (at minimum) leaves the locale on its previous value rather than committing a half-switch, and surfaces the failure. Simplest correct shape: `.catch(() => setPreference(previousLocale))`, or gate the `lang`/`dir` effect on the catalogue having resolved. Add a test that stubs a rejecting loader.                                                   | **Low–Medium** — needs a decision on the desired UX (revert vs. stay-with-fallback-and-warn), which is why it is flagged rather than prescribed.                        |
| `DOC-03`  | doc↔code                          | `docs/LAYOUT.md:77-79` vs `src/components/ui/container.tsx:36`                         | LAYOUT.md §2 states Container gutters are "`px-4` (16px per side) below `sm`, `px-6` (24px) from `sm` up". The code is `px-4 sm:px-5` (20px), tightened one step in the 2026-08 settling pass. `Container`'s own JSDoc (`:20-26`) documents the change and its reasoning correctly; LAYOUT.md was not updated.                                                                                                                                                                                                                                                                                                                                                                                                                                            | LAYOUT.md is the authoritative layout contract (`SKILL.md:111`). A developer matching a custom surface to "the container gutter" reads 24px and introduces a 4px inconsistency the linter and the overflow sweep cannot see. Doc is wrong; code is right.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Update `docs/LAYOUT.md:78` to `px-5` (20px) and carry over the one-line rationale from the Container JSDoc.                                                                                                                                                                                                                                                                            | **None** — doc-only.                                                                                                                                                    |
| `DOC-04`  | doc↔code                          | `docs/LAYOUT.md:114` vs `src/components/ui/page-header.tsx:45`                         | LAYOUT.md's PageHeader snippet annotates `<PageHeaderDescription>` as `{/* prose measure, muted */}`. The component renders `-mt-2 max-w-prose text-body-lg` — **no muted class**. This is deliberate: `docs/DESIGN_TOKENS.md:246-250` names `PageHeaderDescription` as "the deliberate exception: it is definitionally the page's lead prose, so it is foreground", and §"Type hierarchy" assigns it the formal lead-paragraph role at `body-lg`.                                                                                                                                                                                                                                                                                                        | Two docs contradict each other on a rule the 2026-09 body-contrast pass existed to settle. A reader following LAYOUT.md re-greys page leads and reintroduces exactly the flat "everything at one tone" problem that pass fixed. LAYOUT.md is wrong; the code and DESIGN_TOKENS are right.                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Change the annotation to `{/* prose measure, text-body-lg lead paragraph — foreground, not muted */}` and cross-reference DESIGN_TOKENS §"Text colour: body vs secondary".                                                                                                                                                                                                             | **None** — doc-only.                                                                                                                                                    |
| `A11Y-01` | accessibility                     | `src/components/ui/pagination.tsx:120-134`, `src/components/ui/breadcrumb.tsx:106-119` | Both ellipsis components put `aria-hidden` on the **wrapper** element and then place an `sr-only` text fallback **inside** it (`"More pages"`, `"More"`). `aria-hidden` prunes the entire subtree from the accessibility tree, so the `sr-only` text is unreachable by assistive technology — it is dead markup. `Pagination`'s own JSDoc (`:34-35`) claims "the ellipsis is hidden with an `sr-only` fallback", describing a fallback that cannot fire.                                                                                                                                                                                                                                                                                                  | Screen-reader users get no indication that pages were elided from the pagination range or that a breadcrumb trail was truncated — they encounter a silent gap. Inherited from upstream shadcn, and invisible to `a11y.spec.ts`: axe does not flag unreachable content inside `aria-hidden`, it simply ignores it, so a clean scan is not evidence here. `UI_LIBRARY.md:65` explicitly lists "`aria-hidden` on decoration, `sr-only` fallbacks" as sanctioned — but the two are mutually exclusive on the same subtree.                                                                                                                                                                                                                                 | Pick one per component. Either drop `aria-hidden` from the wrapper and keep the `sr-only` text (announces "More pages", icon still decorative via the SVG), or keep `aria-hidden` and delete the dead `sr-only` span plus the JSDoc claim. The first is better for pagination (the elision is meaningful), the second acceptable for breadcrumb. Either way, correct the JSDoc.        | **Low** — two small markup changes. Note `UI_LIBRARY.md §8` requires recording deliberate divergence from registry output, and this is one; also re-run the axe matrix. |
| `DEP-01`  | dependency health                 | `docs/ROADMAP.md:240-251` vs measured `npm audit`                                      | ROADMAP records the production audit posture as "the production tree carries `next`→`postcss` (**moderate**, build-time only), and `next`→`sharp` / `sharp` (high, libvips CVEs)". Measured now: **3 high, 0 moderate** in `--omit=dev`. `postcss` has escalated to **high** and carries advisory classes the record does not mention: "PostCSS has XSS via Unescaped `</style>` in its CSS Stringify Output", "Arbitrary file read and information disclosure via attacker-controlled `sourceMappingURL` in CSS comments", and "Path Traversal in Previous Source Map Auto-Loading". Dev-tree total has grown from the recorded 4 findings to 15 (12 high), mostly `minimatch`/`brace-expansion` reached through `eslint-config-next`'s bundled plugins. | The _reachability_ argument still holds and is correct: `postcss` runs only at build, `sharp` is Next's image optimizer and `next/image` is used **0 times** (verified). But the record's severity and advisory description are stale, and the new postcss advisories are a different class (arbitrary file read / path traversal during CSS processing) than the one the "build-time only, therefore ignorable" reasoning was written against — a build that ever processes third-party CSS deserves a fresh look. ROADMAP §1 already names "a new build plugin" as a re-evaluation trigger.                                                                                                                                                          | Refresh `docs/ROADMAP.md` §"Deferred from the 2026-07 health audit" item 1 with current counts, severities, and advisory titles. Check whether a `next` patch pins a fixed `postcss` (do **not** run `npm audit fix --force`, which downgrades `next` — the existing rationale is sound). Re-affirm or revise the reachability argument against the new advisory class.                | **None** for the doc refresh; a `next` patch bump is a normal dependency change.                                                                                        |
| `PERF-01` | performance (CLS)                 | `src/app/fonts.ts:112` (`adjustFontFallback: false`)                                   | The Arabic face deliberately disables `next/font`'s metric-adjusted fallback. Verified in the built CSS: `Public Sans Fallback` (`size-adjust: 104.87%`) and `Geist Mono Fallback` (`size-adjust: 134.59%`) exist, but `notoSansArabic` has **no** companion fallback face. All 10 faces are `font-display: swap`. On the shipped LTR/English default Noto is also not preloaded (correctly — `DECISIONS.md:93-101`), so Arabic text paints in a system font and then swaps to a 162 KB face with no metric matching.                                                                                                                                                                                                                                     | Layout shift (**CLS**) on any page in a Latin-default deployment that renders Arabic — the `/showcase/direction` page today, and any product page with Arabic user content. The reason for `adjustFontFallback: false` is sound and documented (the Arial-based fallback contains Arabic glyphs and would intercept the face — the exact defect that once shipped), so this is an accepted trade, not a mistake. What is missing is the **acknowledgement**: `docs/DIRECTION_AND_I18N.md:168-169` gives the interception rationale but never names CLS as its cost. An Arabic-primary deployment mitigates it by preloading (the documented path). Impact: **low–medium**, LTR deployments only, proportional to how much Arabic a Latin page carries. | Document the trade-off in `docs/DIRECTION_AND_I18N.md` § Fonts: no metric fallback for Noto is intentional, its cost is Arabic-run CLS on unpreloaded pages, and the mitigations are (a) preload on Arabic-primary deployments, (b) `size-adjust` keeps the _swapped-to_ metrics stable. Optionally add a CLS assertion to `fonts.spec.ts`. Do **not** re-enable `adjustFontFallback`. | **None** for documenting. Re-enabling the fallback would **reintroduce a shipped defect** — do not.                                                                     |

### Low

| ID        | Category                        | Location                                                                                                                             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Impact                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Proposed fix                                                                                                                                                                                                                                                                                                                                                                                                     | Risk of fix                                                                             |
| --------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `CFG-01`  | config drift / template hygiene | `next.config.ts:15`                                                                                                                  | `allowedDevOrigins: ["192.168.1.2"]` — a specific private LAN IP, hardcoded and committed (`495b464 chore(next): allow development access from local network origin`). Grepping all of `docs/` and every root markdown file for `allowedDevOrigins` or `192.168` returns **nothing**: it is documented nowhere, including in `docs/CLONING.md`'s "what to configure" list.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | This is a template repo. Every clone inherits one developer's home-network address, which is meaningless (or, on a different network, belongs to someone else's device). It is dev-server-only so there is no production exposure, but `allowedDevOrigins` is a security control, and an unexplained allowlist entry is the kind of thing a reviewer must reverse-engineer from git log. `docs/CLONING.md:20-27`'s "identity lives in exactly two locations" is also incomplete while this exists. | Add an explanatory comment (why, and that it is per-developer), and list it in `docs/CLONING.md` §3 "Configure first" as a value each clone should set or remove. Consider whether it belongs in a git-ignored local override instead of the committed config.                                                                                                                                                   | **Low** — comment/doc plus, if desired, removing a dev-only convenience.                |
| `CFG-02`  | doc↔code                        | `.env.example:1-3`                                                                                                                   | Header comment: "Every variable is validated at startup by `src/config/env.ts` (fail-fast Zod schema) — that file is the contract; add new variables there first." The Zod schema lives in `src/config/env-validation.ts`; `src/config/env.ts` deliberately contains **no Zod** (that split is the whole point of `DECISIONS.md:83-91`, keeping ~69 KB out of client bundles). Adding a variable also requires touching _both_ files, as `env.ts:22-30` correctly documents.                                                                                                                                                                                                                                                                                                                                                                                                                                        | A developer following `.env.example` edits `env.ts`, finds no schema, and either adds Zod there — silently undoing the bundle-size decision this repo measured and recorded — or gets confused. Low frequency, but the failure mode is a regression of a documented optimisation.                                                                                                                                                                                                                  | Update the comment to name `src/config/env-validation.ts` as the schema and `src/config/env.ts` as the typed-value contract, and point at the 4-step checklist in `env.ts:22-30`.                                                                                                                                                                                                                                | **None** — comment-only.                                                                |
| `LAY-01`  | layout contract                 | `src/app/not-found.tsx:31`, `src/core/errors/error-fallback.tsx:51`                                                                  | Both cap prose with an ad-hoc `max-w-sm`. The rule is explicit in three places — `docs/LAYOUT.md:52-60`, `CLAUDE.md`, and `SKILL.md:42-44`: "A content block is **prose-capped** (`max-w-prose`), **form-capped** (`max-w-form`), or **full-width** — never an ad-hoc `max-w-*`." Both files also use raw `text-sm`/`text-base` rather than ramp steps on what are page-level surfaces.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Small and cosmetic, but these are the two most-copied error surfaces in the repo (`docs/CLONING.md:32-40` sends every localizing product here), so the violation propagates. Note the raw-scale half is partially sanctioned: `error-fallback.tsx` is in `src/core` and "may assume nothing beyond the stylesheet" (`:29-32`), and `docs/ROADMAP.md` friction #1 documents the two-scale split — but that note assigns the ramp to _pages_, which `not-found.tsx` is.                              | Switch both `max-w-sm` to `max-w-prose`. Decide whether the error surfaces speak the ramp (`text-body`/`text-small`) and, if the raw scale stays, add a one-line comment in each saying so, so it reads as a decision rather than drift.                                                                                                                                                                         | **Low** — visual-only; re-run the overflow sweep and the axe matrix.                    |
| `SEC-01`  | security (latent)               | `src/api/client.ts:55`                                                                                                               | The request URL is built by raw string concatenation: `` const url = `${ENV_CONFIG.NEXT_PUBLIC_API_BASE_URL}${path}` ``. With the default empty base (same-origin), a `path` beginning `//` becomes a **protocol-relative URL**, and `fetch` resolves it as a cross-origin request to an attacker-chosen host. No path traversal or credential leak is possible today.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | **Latent only.** Every current call site passes a string literal (`fetchDemoRecords` → `"/api/showcase/records"`); nothing passes user input as `path`. But `apiFetch` is the documented extension point where products add auth credentials (`client.ts:16-19`), so the day a product both attaches an `Authorization` header here _and_ builds a path from user/CMS input, this becomes credential exfiltration. Worth hardening while it is free.                                               | Validate at the boundary: reject a `path` that does not start with a single `/`, or build the URL with `new URL(path, base)` against an explicit origin. Add a contract test. Alternatively, document the "paths must be developer-controlled literals" precondition in `docs/DATA_LAYER.md`.                                                                                                                    | **Low** — one guard clause; check no legitimate call site passes an absolute URL first. |
| `TEST-01` | test coverage gap               | `src/hooks/use-document-direction.ts`, `src/hooks/use-scrolled.ts`, `src/i18n/i18n.test.ts`, `src/styles/token-parity.test.ts:13-15` | Five specific gaps, all in code with real branching: (1) **`useDocumentDirection` has no test at all** — its `MutationObserver` subscribe path, the `typeof MutationObserver === "undefined"` fallback, and the `getServerSnapshot` hydration contract are unexercised, and it is the sole feeder of RTL positioning for `SiteShellNavMenu`. (2) **`useScrolled` has no direct test**; its `IntersectionObserver`-absent fallback (`scrolled = true`) is only reached incidentally. (3) No test for the catalogue-load rejection path (`CORR-01`). (4) No test for a body-read abort (`DATA-01`). (5) `i18n.test.ts` asserts **key** parity across catalogues but never **placeholder** parity — an `ar` message that drops `{digest}` or misspells `{count}` passes both `tsc` and every test, and `translate()` leaves unknown placeholders verbatim, so the drift surfaces only as `{digest}` printed in the UI. | These are the untested paths most likely to break silently. `docs/TESTING.md:112-126` deliberately sets no coverage target — that is sound — but it lists what is _deliberately_ untested, and none of these five appear there, so they read as oversights rather than decisions. Also worth noting: `token-parity.test.ts` compares light↔dark token **names** only; a semantic token defined in both themes but never mapped in `theme.css` would pass parity and silently generate no utility.  | Add: a `use-document-direction.test.ts` (subscribe/unsubscribe, fallback, server snapshot); a placeholder-parity assertion in `i18n.test.ts` (extract `\{(\w+)\}` per message, compare sets across catalogues — ~10 lines and it closes a whole silent-drift class); the two error-path tests from `DATA-01`/`CORR-01`; optionally extend token parity to assert every `--color-*` is referenced by `theme.css`. | **Low** — additive tests only.                                                          |
| `TEST-02` | test flakiness                  | `tests/e2e/matrix.ts:45`                                                                                                             | `await page.waitForTimeout(250)` after the direction flip, described as "one paint's worth of settling". A fixed sleep is time-based rather than condition-based.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Under CI load a slow paint can let a console message land after the assertion window (false pass) or, with heavier future pages, before settling completes (false fail). Currently benign — the whole 150-test suite passed in 1.2 min with no retries — but it is a latent flake vector in the matrix that 96 of the 150 tests route through, i.e. the highest-leverage line in the suite.                                                                                                        | Replace with a condition: `await page.waitForFunction(() => document.documentElement.dir === expected)` plus `page.evaluate(() => new Promise(requestAnimationFrame))`, or keep the sleep and note it as an accepted approximation in `docs/TESTING.md`.                                                                                                                                                         | **Low** — test-only; verify against a full matrix run.                                  |
| `DOC-05`  | stale reference                 | `src/core/providers/app-provider.tsx:27`                                                                                             | Comment cites "see FOUNDATION_REVIEW.md, Runtime Review". No such file exists; it was moved to `docs/audit/2026-07-foundation-review.md` (confirmed by `docs/audit/2026-07-foundation-audit.md:33`, which records it "sits at repo root" as of that snapshot).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Dead pointer in a load-bearing comment explaining why `AppProvider` is a Server Component. A reader cannot reach the reasoning. Also note `docs/audit/README.md:5-7` forbids reading audit files as current state, so the citation should be framed accordingly.                                                                                                                                                                                                                                   | Update to `docs/audit/2026-07-foundation-review.md`, or better, restate the one-line reason inline (each provider owns its own client boundary) so it does not depend on an archived doc.                                                                                                                                                                                                                        | **None** — comment-only.                                                                |
| `DOC-06`  | doc completeness                | `docs/audit/README.md:9-12`                                                                                                          | The archive index table lists `2026-07-foundation-review.md` and `2026-07-foundation-audit.md` but **omits `2026-07-health-audit.md`**, which exists in the same folder and is the audit most heavily cited from production code comments (`src/config/env.ts:12`, `src/config/env-validation.ts:2`, `src/api/client.ts:130`, `src/app/fonts.ts:7`, `docs/DATA_LAYER.md:83`, `DECISIONS.md:87`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | A reader following a code comment to "docs/audit/2026-07-health-audit.md §1.2" finds the file but finds the index denying it exists, which undermines trust in the index. This report will need adding too.                                                                                                                                                                                                                                                                                        | Add rows for `2026-07-health-audit.md` and this review.                                                                                                                                                                                                                                                                                                                                                          | **None** — doc-only.                                                                    |
| `DOC-07`  | stale value                     | `tests/e2e/fonts.spec.ts:16`, `:89`; `docs/TESTING.md:71`                                                                            | Three places still cite Noto's `size-adjust` as **115%**. The actual value is **112%** (`src/app/fonts.ts:122`, verified in the built CSS as `size-adjust:112%`), recalibrated in the 2026-10 Public Sans pass. `docs/DIRECTION_AND_I18N.md:176-178` and `docs/DESIGN_TOKENS.md:391` correctly say 112%.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | The comments explain _why the assertion works_ ("`size-adjust: 115%` makes interception measurable"). The assertion is still valid at 112% — the test passes — but a reader checking the reasoning against the code finds a mismatch and cannot tell which is authoritative. `fonts.spec.ts:26-30` is otherwise scrupulous about recording face-swap history, which makes the omission stand out.                                                                                                  | Update the three occurrences to 112%.                                                                                                                                                                                                                                                                                                                                                                            | **None** — comment/doc-only.                                                            |
| `DOC-08`  | internal contradiction          | `docs/ROADMAP.md:152-157` vs `:318-325`                                                                                              | Known issue #2 states "**`DialogContent`'s close button label — RESOLVED (2026-07).** The i18n pass added an optional `closeLabel` prop…". Friction point #3, in the same document, still asserts "`DialogContent`'s close label is hardcoded English (**known issue #2**)" — citing the very entry that marks it resolved. The code has `closeLabel = "Close"` as an overridable prop on both `DialogContent` (`dialog.tsx:85`) and `DialogFooter` (`:122`).                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Self-contradiction in the document designated as the authority on what is and is not built (`SKILL.md:117`: "read before building anything 'missing'"). A reader hitting friction #3 may re-implement a shipped prop.                                                                                                                                                                                                                                                                              | Rewrite friction #3's first clause: the close label is now a prop; the remaining friction is the _other_ hardcoded primitive strings (Pagination's `aria-label="pagination"`, the ellipsis fallbacks, `Spinner`'s default) and the frozen variant set.                                                                                                                                                           | **None** — doc-only.                                                                    |
| `DOC-09`  | internal contradiction          | `docs/DESIGN_TOKENS.md:158-163` vs `:184` and `src/styles/light.css:61`                                                              | The `--color-border` design note states its weight is "light `0.9`, dark `0.385`". The hairline-rule table 20 lines below correctly says light `0.91`, and so does the CSS. The `0.9` is the pre-2026-09 value; the same paragraph elsewhere describes the `0.9 → 0.91` re-derivation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Minor, self-correcting within one screen of text, but this is the document whose §3 numbers I re-derived and found exact to two decimals — the surrounding rigour is what makes a stray stale number worth fixing. Verified: light border is 0.91, giving **1.23:1** vs background and **1.29:1** vs surface, exactly as the table claims.                                                                                                                                                         | Change `0.9` to `0.91` at `:163`.                                                                                                                                                                                                                                                                                                                                                                                | **None** — doc-only.                                                                    |
| `DOC-10`  | doc completeness                | `docs/CLONING.md:20-27`                                                                                                              | "The name and description appear in exactly **two** source locations — everything else derives from them" (`package.json`, `src/config/app.ts`). A third exists: `src/app/showcase/layout.tsx:12-13` hardcodes the string `"Foundation Showcase"` in its metadata title template, and `src/i18n/messages/en.ts:70` / `ar.ts:51` carry `site.brand`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Both extra locations are showcase-scoped and disappear with the showcase (option 3 of the same section), so the claim is _effectively_ true for a product that deletes it — but false for options 1 and 2, where a renamed product still shows "Foundation Showcase" in showcase tab titles.                                                                                                                                                                                                       | Add a parenthetical: the showcase carries its own hardcoded name in `src/app/showcase/layout.tsx` and the `site` message namespace; both go away with the showcase, or need renaming if it is kept.                                                                                                                                                                                                              | **None** — doc-only.                                                                    |

### Nit

| ID       | Category          | Location                                                                        | Description                                                                                                                                                                                                                                      | Impact                                                                                                                                                                                                                           | Proposed fix                                                                                                                                            | Risk of fix            |
| -------- | ----------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `NIT-01` | consistency       | `src/components/ui/app-shell.tsx:176` vs `src/components/ui/site-shell.tsx:298` | The two drawers' close-button rows use different heights: AppShell `h-12`, SiteShell `h-16`. Both shells' _headers_ are `h-16` (aligned deliberately in milestone 10 and matched to `scroll-padding-block-start: 4rem`).                         | Cosmetic. SiteShell's `h-16` matches its header so the drawer's close row lines up with the bar it replaces; AppShell's `h-12` does not, with no comment explaining why. Probably an oversight from the h-14→h-16 header change. | Align AppShell's drawer row to `h-16`, or add a comment stating the asymmetry is intended.                                                              | **Low** — visual-only. |
| `NIT-02` | stale terminology | `DESIGN_SYSTEM.md:41-43`                                                        | A section titled "When To Use asChild" describes an API this stack does not have. The Base UI runtime uses a `render` prop; `docs/UI_LIBRARY.md:38` correctly calls it "this stack's `asChild` equivalent". `CLAUDE.md` also mentions `asChild`. | Cosmetic; the guidance itself (use it only for element replacement) transfers directly. But `asChild` is a Radix API, and a developer searching the codebase for it finds nothing.                                               | Retitle to "When to use the `render` prop" and cross-reference `docs/UI_LIBRARY.md` §7 (the render-prop hydration hazard, which is the important half). | **None** — doc-only.   |

---

## Performance & Core Web Vitals

**No bundle analyzer is wired up.** Neither `@next/bundle-analyzer` nor any
equivalent appears in `package.json` or `next.config.ts`, and there is no
Lighthouse/CWV tooling in `package.json` or `.github/workflows/ci.yml`. All
numbers below were therefore measured directly from the production build
output: per-route First Load JS by resolving each prerendered HTML's
`<script src>` set against `.next/static/chunks` and gzipping each file;
fonts and CSS by `stat` + `gzip` on the emitted assets. This is a DX gap
(recommendation at the end of this section), not a defect.

### Measured per-route First Load JS

Gzipped, deduplicated per route, from the 15 prerendered HTML documents:

| Route                                                | Chunks |     Raw |   **Gzip** |    Δ vs `/` |
| ---------------------------------------------------- | -----: | ------: | ---------: | ----------: |
| `/_global-error`                                     |      9 |  649 KB | **193 KB** |      −25 KB |
| `/`                                                  |     12 |  729 KB | **218 KB** |           — |
| `/_not-found`                                        |     12 |  729 KB | **218 KB** |           0 |
| `/showcase`, `/showcase/actions`, `/showcase/layout` |     14 |  829 KB | **250 KB** |      +32 KB |
| `/showcase/tokens`                                   |     15 |  833 KB | **252 KB** |      +34 KB |
| `/showcase/feedback`                                 |     15 |  834 KB | **252 KB** |      +34 KB |
| `/showcase/forms`, `/showcase/navigation`            |     15 |  844 KB | **256 KB** |      +38 KB |
| `/showcase/display`                                  |     15 |  849 KB | **257 KB** |      +39 KB |
| `/showcase/overlays`                                 |     16 |  853 KB | **259 KB** |      +41 KB |
| `/showcase/direction`                                |     16 |  867 KB | **264 KB** |      +46 KB |
| `/showcase/site`                                     |     17 |  919 KB | **280 KB** |      +62 KB |
| **`/showcase/data`**                                 |     16 | 1122 KB | **319 KB** | **+101 KB** |

**The home route's 218 KB gz matches `docs/ROADMAP.md`'s recorded ~216 KB
baseline** — the documented framework floor is real and has not drifted. All
16 routes are `○ (Static)`; the build output confirms zero dynamic routes,
so the static-prerender constraint that drives the theme, locale, and
showcase-gate decisions genuinely holds.

### Verified bundle claims

Three load-bearing documented claims, each independently confirmed:

- **zod is absent from routes that validate nothing.** Grepping every chunk in
  `/`'s First Load JS for `ZodError`/`prettifyError` returns nothing. The
  single largest chunk unique to `/showcase/data` is **291 KB raw / 67 KB gz** —
  matching the "~69 KB gz" figure in `DECISIONS.md:87` and `docs/DATA_LAYER.md:75`.
  The `env.ts`/`env-validation.ts` split and the type-only zod import in
  `client.ts` are doing exactly what they were measured to do.
- **The Arabic catalogue is genuinely code-split.** `ar`'s chunk is
  `4386 B raw / 1877 B gz` — matching the documented "~1.9 kB gz" — and is
  referenced by **no** prerendered HTML, so it is in no route's First Load JS.
- **Exactly one font is preloaded per page**: a single 26 KB Public Sans latin
  woff2. Noto (162 KB) is correctly _not_ preloaded on the LTR default,
  confirming `DECISIONS.md:97`'s "213.2 KB → 28.6 KB of preloaded font per page".

### Client/server boundary

`src/components/ui` holds **zero** `"use client"` directives among its
non-shell primitives; the five that carry it (`app-shell`, `site-shell`,
`skip-link`, `theme-control`, `locale-control`) all genuinely need it (hooks
or handlers). `UI_LIBRARY.md §7`'s "the entire library has zero client
boundaries; keep it that way" is upheld for pure-markup wrappers.
`AppProvider` is a Server Component with each provider owning its own
boundary, as documented. No server-only code is at risk of shipping to the
client — `env-validation.ts` (the only Zod-at-startup module) is imported
solely by `next.config.ts`, verified by its absence from every client chunk.

One structural cost, already an accepted decision: `QueryProvider` and
`Toaster` mount in the **root** provider tree, so `/` — a static hero page
with no queries and no toasts — carries a **73 KB raw / 21 KB gz** chunk
containing React Query and sonner. `docs/ROADMAP.md:270-275` records this and
its escape hatch (mount them in a nested layout) and recommends no action. I
agree at current scale; the number is now measured, which it was not before.

### CSS

One stylesheet, **86.4 KB raw / 15.6 KB gz**, render-blocking on every route.
Reasonable for Tailwind v4 with the full token system, the type ramp, and 28
primitives. No unused-token bloat worth chasing: `@theme inline` means the
`--color-*` names are inlined into utilities rather than emitted, and the
`--text-*`/measure/radius/motion tokens are all consumed. No action.

### Fonts

Total emitted font payload **282 KB** across 10 woff2 files:

| Asset                             |         Size | Preloaded        | Notes                                                                                                            |
| --------------------------------- | -----------: | ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| `noto_sans_arabic_variable`       |   **162 KB** | No (LTR default) | Arabic subset, variable 100–900, `size-adjust: 112%`, `unicode-range`-scoped, **no metric fallback** (`PERF-01`) |
| Public Sans latin (`fa0520…-s.p`) |        26 KB | **Yes**          | The one preload; the `.p` marks it                                                                               |
| 8 further subset/mono files       | 6–22 KB each | No               | Public Sans latin-ext + Geist Mono subsets                                                                       |

All 10 faces are `font-display: swap`. Public Sans and Geist Mono each have a
metric-adjusted fallback (`size-adjust: 104.87%` / `134.59%`), so Latin text
swaps without shift. Noto does not — see `PERF-01`.

### Images / media

**`next/image` is used 0 times**; the only raw `<img>` is inside
`AvatarImage`, whose JSDoc correctly assigns `alt` to the consumer
(`avatar.tsx:26`). The single image asset is `src/app/icon.svg` (favicon).
No CLS risk from images, and no LCP image to prioritise — the LCP element on
`/` is the `text-title sm:text-display` heading, which is text and correctly
served by the one preloaded font. This also confirms `DEP-01`'s reachability
argument: `sharp` cannot be reached.

### Rendering & data

All 16 routes prerender statically. `src/app/api/showcase/records/route.ts:10`
sets `dynamic = "force-static"` — correct and necessary, since Next 16 GET
handlers are dynamic by default and this one serves a fixed payload. React
Query defaults (`staleTime: 60_000`, `retry: false`) are set once in
`query-provider.tsx` and documented. No waterfalls: the only query is a single
same-origin fetch, and `signal` is threaded through correctly. Nothing
prefetches, consistent with "every route is static".

### CWV mapping

| Finding                                                            | Metric                   | Impact  | Basis                                                                              |
| ------------------------------------------------------------------ | ------------------------ | ------- | ---------------------------------------------------------------------------------- |
| Root-mounted React Query + sonner on `/` (21 KB gz)                | **TBT / INP**            | Low     | Measured chunk size; parse+hydrate cost only, no runtime work on a query-less page |
| 218 KB gz framework floor                                          | **TBT / total transfer** | Low–Med | Measured; matches documented baseline, dominated by React + Next runtime           |
| `/showcase/data` at 319 KB gz (zod +67 KB)                         | **TBT / total transfer** | Low     | Showcase-only, gated out of product builds                                         |
| Noto has no metric fallback (`PERF-01`)                            | **CLS**                  | Low–Med | Verified absent from built CSS; LTR deployments rendering Arabic only              |
| Noto 162 KB not preloaded on LTR                                   | **LCP** (Arabic pages)   | Low     | Deliberate and correct — preloading it would cost 162 KB on every English page     |
| One 26 KB preloaded font, `display: swap`, metric fallback present | **LCP / CLS**            | —       | Verified optimal for the Latin path                                                |
| 15.6 KB gz render-blocking CSS                                     | **LCP**                  | Low     | Measured; single request, well within budget                                       |

**Not measured, and deliberately not estimated:** real-device INP, actual LCP
and CLS values, and any Lighthouse score. Those require a running browser
under a throttled profile, which this audit did not perform. No figures for
them appear above.

**Recommended minimal CWV setup** (currently absent): add
`@next/bundle-analyzer` behind an `ANALYZE=true` env check in
`next.config.ts`, and a manual-dispatch CI job running Lighthouse CI
(`treosh/lighthouse-ci-action`) against `next start` on `/` and one shell
route, with budgets asserting First Load JS and CLS rather than a composite
score. Keep it off the PR path — the browser matrix already costs ~2–3 min,
and per-PR Lighthouse numbers on a shared runner are too noisy to gate on.

---

## False alarms / verified-fine

Things I actively suspected or checked and found genuinely correct. Recorded
so the findings above can be trusted as the exceptions rather than a sample.

- **All 30 documented contrast pairs are exact.** I re-implemented
  OKLCH → linear sRGB → WCAG 2.1 relative luminance independently and parsed
  the token values straight from `light.css`/`dark.css`. Every ratio in
  `docs/DESIGN_TOKENS.md` §3 reproduced **to two decimals** — including the
  four alpha-composited pairs (destructive over its own `/10`·`/15` tint and
  over the 30% input fill), which are the ones the doc itself says fail first.
  Zero failures against the 4.5:1 / 3:1 requirements. The derived figures also
  reproduce: hairline **1.23** / **1.29** (light vs bg/surface) and **1.70** /
  **1.50** (dark), and body↔secondary separation **2.62:1** light / **2.92:1**
  dark. This document is trustworthy.
- **`shadcn` in devDependencies does NOT break production installs.** My
  initial hypothesis was that `globals.css`'s `@import "shadcn/tailwind.css"`
  made a devDependency build-critical, breaking `npm ci --omit=dev && npm run build`.
  I tested it: a clean prod-only install in a scratch copy, then `next build`.
  It fails — but on **`Cannot find module '@tailwindcss/postcss'`**, before
  shadcn is ever reached. `tailwindcss`, `@tailwindcss/postcss`, and
  `typescript` are all devDependencies too, so building from a prod-only
  install is not a supported path _anywhere_ in this stack, by ordinary Next.js
  convention. `shadcn`'s placement is consistent with the rest of the CSS
  toolchain and is correct. (Only `DECISIONS.md`'s stale _reason_ is wrong —
  `DOC-02`.)
- **Type safety is genuinely as strict as claimed.** Zero `any`, zero
  `as any`, zero `@ts-ignore`/`@ts-expect-error`, zero non-null assertions
  across all of `src` and `tests`. One `eslint-disable` in the whole
  repository (`env.ts:36`, for the `NodeJS.ProcessEnv` namespace augmentation,
  with a written justification). `tsconfig.json` enables every flag the docs
  claim — `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `verbatimModuleSyntax`, `noPropertyAccessFromIndexSignature`,
  `noImplicitReturns`, `noUnusedLocals`/`Parameters`. `npm run typecheck` is
  clean.
- **The two compile-time coupling guards actually work.** `fonts.ts:142-155`
  (`_NotoPreloadMatchesLocale`) and `catalogue.ts:57-64`
  (`_DefaultCatalogueMatchesLocale`) are real type-level assertions that fail
  `tsc` if the default locale and the preload literal / static catalogue
  import diverge. Both are erased at runtime.
- **i18n key parity holds, and is enforced twice.** `ar.ts` matches `en.ts`
  exactly — 7 namespaces, no missing or extra keys — enforced at the type level
  (`: Messages`) _and_ by a runtime test that iterates
  `APP_LOCALES.SUPPORTED`. (The one uncovered dimension is _placeholder_
  parity — `TEST-01`.)
- **The logical-properties rule holds.** The custom
  `foundation/no-physical-tailwind-classes` rule is real, correctly scoped to
  `src/**`, and `npm run lint` is clean with **zero** suppressions of it.
  Directional icons flip individually (`rtl:rotate-180` on pagination and
  breadcrumb chevrons); centred overlays use `inset-x-0 mx-auto`, never
  `left-1/2`. The `border-t`/`border-s` split in `ScrollBar` is correct
  (block vs inline axis).
- **The render-prop hydration contract is correctly implemented.**
  `Button:92` stamps `data-slot` only when `props.render === undefined`, and
  `PaginationLink:75-83` puts `data-slot="pagination-link"` on the render
  element rather than the component — exactly the rule `UI_LIBRARY.md §7`
  derives from the historical defect. No component sets the same prop on both
  sides.
- **The dependency-direction lint encodes the full documented matrix.** I
  checked each folder scope in `eslint.config.mjs:182-264` against
  `ARCHITECTURE.md`'s Module Boundary Rules; they agree, including
  `src/utils`'s React/Next ban and the `componentImports` addition to
  `api`/`hooks`/`lib`/`services`/`store`. `import/no-cycle` is on.
- **Documented styling rules that hold with zero violations:** no `ring-3` /
  `ring-ring/50` translucent focus halos anywhere (the registry default is
  fully replaced); no ramp-locked `font-semibold`/`font-extrabold` in any
  component (the §"Weight scale" review smell); no raw `duration-N` in any
  component (all motion resolves through `--motion-*`). The two `bg-black/10`
  overlay scrims are the **explicitly sanctioned** exception
  (`UI_LIBRARY.md:71`, `SKILL.md:21`), not drift.
- **`.nvmrc` (20) ↔ `package.json#engines` (>=20) ↔ CI (`node-version-file: .nvmrc`)**
  are consistent — no version drift.
- **No secret handling problems.** `process.env` is read in exactly one file
  (`src/config/env.ts:58-60`); both variables are legitimately
  `NEXT_PUBLIC_`; `.env*` is gitignored with `!.env.example`; no secrets in
  `.env.example`; CI needs none. The three `dangerouslySetInnerHTML` uses all
  inject build-time-constant strings (`THEME_INIT_SCRIPT`,
  `LOCALE_INIT_SCRIPT`) with no interpolated user data — `LOCALE_INIT_SCRIPT`
  builds its locale→direction map via `JSON.stringify` over `LOCALE_INFO` at
  build time. No unsafe redirects; error surfaces expose only `error.digest`,
  never stack traces or internals.
- **The showcase gate works as documented.** `showcase/layout.tsx:28` calls
  `notFound()` and `route.ts:15` returns a 404, both from the build-time
  inlined flag; the build output confirms all showcase routes stay `○ (Static)`.
- **`ROUTES` and `FEATURE_FLAGS` being unused is a recorded decision**
  (`docs/ROADMAP.md:282-285`), not dead code — correctly excluded from
  `DEAD-*` findings. Likewise `react-dom` having no direct import: it is a
  required framework peer.
- **No assertion-free or trivially-passing tests.** All 11 unit files and all
  7 specs assert meaningfully (73 unit tests, 150 browser tests). Mocking is
  restrained and appropriate: `fetch` stubbed for transport contract tests,
  `next/navigation` stubbed for shell tests, `matchMedia`/`Storage` stubbed for
  the runtime tests — no over-mocking of the code under test.

---

## Deferred / needs owner decision

Judgment calls I deliberately did not resolve.

1. **`CORR-01`'s desired failure behaviour.** When an Arabic catalogue chunk
   fails to load, should the runtime (a) revert the locale so text and
   direction stay consistent, (b) keep the switched `dir` and show a toast, or
   (c) retry? Option (a) is the most defensible — never render English prose in
   an RTL document — and is my **recommendation**, but it silently undoes a
   user action, which is a product call. Whatever is chosen, the missing
   `.catch` must be added.
2. **The two typographic systems** (`docs/ROADMAP.md:294-306`). Ramp steps
   (`text-body`, `text-small`) vs raw Tailwind (`text-sm`, `text-base`) coexist
   across 16 primitives. `LAY-01` brushes against it. **Recommendation: leave
   it.** The ROADMAP's reasoning is sound — converting 28 primitives is churny
   with real regression surface and no product asking. But `not-found.tsx` and
   `error-fallback.tsx` are _page-level_ surfaces, where the documented split
   assigns the ramp; fix those two and leave the primitives alone.
3. **`A11Y-01`'s two options.** Removing `aria-hidden` from the ellipses
   changes what screen readers announce on every paginated and truncated-
   breadcrumb surface, and diverges further from registry output (which
   `UI_LIBRARY.md §8` permits but requires recording). **Recommendation:**
   fix Pagination (elision is meaningful information), and for Breadcrumb just
   delete the dead `sr-only` span. Needs an owner because it is a deliberate
   registry divergence.
4. **`SEC-01` hardening now vs. documenting the precondition.** Adding a path
   guard to `apiFetch` is cheap but touches the single choke point every
   request passes through. **Recommendation: add the guard**, because the
   auth-credentials extension point lives in the same function and that is
   what turns this from latent to exploitable. If the owner prefers zero change
   to `client.ts`, document the "developer-controlled literal paths only"
   precondition in `docs/DATA_LAYER.md` instead.
5. **`CFG-01`'s `allowedDevOrigins` entry.** Keeping a committed personal LAN
   IP is a convenience for this author and noise for every clone.
   **Recommendation:** keep the capability, document it, and note in
   `docs/CLONING.md` that the value is per-developer — rather than deleting a
   working dev affordance.
6. **Dependency majors stay blocked.** ESLint 10 and TypeScript 6/7 are held
   by `eslint-config-next`'s bundled plugins, with upstream issues tracked and
   Dependabot `ignore` entries in place (`docs/ROADMAP.md:171-227`). I
   verified the reasoning is current and **recommend no change**. `DEP-01` asks
   only for a refreshed audit record, not a bump. Do not run
   `npm audit fix --force` (it downgrades `next` to 9.x).
7. **CI action major versions — needs confirmation.**
   `.github/workflows/ci.yml` pins `actions/checkout@v7`,
   `actions/setup-node@v7`, and `actions/cache@v6`. These are ahead of the
   versions I can verify, and I could not execute the workflow, so I am **not**
   asserting they are wrong — Dependabot manages this ecosystem
   (`dependabot.yml`, `github-actions`), which is consistent with them being
   current. Flagged only so an owner with access to a CI run can confirm the
   pipeline is actually green on GitHub, since every gate I ran was local.

---

## Appendix A — commands run, with real results

Every command below was executed during this audit in
`D:\projects\frontend-foundation` (except where a scratch copy is noted).

| #   | Command                                                                                                                                                                      | Result                                                                                                                                                                                                          |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `npm run typecheck`                                                                                                                                                          | **PASS** — exit 0, no output (`tsc --noEmit`)                                                                                                                                                                   |
| 2   | `npm run lint`                                                                                                                                                               | **PASS** — exit 0, zero errors/warnings                                                                                                                                                                         |
| 3   | `npm run format:check`                                                                                                                                                       | **PASS** — "All matched files use Prettier code style!"                                                                                                                                                         |
| 4   | `npm test`                                                                                                                                                                   | **PASS** — 11 files, **73 tests passed**, 10.52 s                                                                                                                                                               |
| 5   | `npm run build`                                                                                                                                                              | **PASS** — compiled in 7.2 s; 16 routes, **all `○ (Static)`**                                                                                                                                                   |
| 6   | `npm run test:e2e`                                                                                                                                                           | **PASS** — **150 tests passed**, 1.2 min, no retries (`chromium-dev` console matrix + `chromium-prod` fonts/a11y/shell/errors/overflow/i18n). Chromium was already installed (`ms-playwright/chromium-1228`)    |
| 7   | `npm audit --omit=dev --json`                                                                                                                                                | **3 high, 0 moderate** — `next`→`postcss`, `next`→`sharp`, `sharp` (see `DEP-01`)                                                                                                                               |
| 8   | `npm audit --json`                                                                                                                                                           | **15 total: 12 high, 3 moderate** (dev tree; `minimatch`/`brace-expansion` via `eslint-config-next` plugins, `shadcn`→`@modelcontextprotocol/sdk`→`@hono/node-server`)                                          |
| 9   | `npm ls shadcn --omit=dev` / `npm ls shadcn`                                                                                                                                 | Prod tree **empty**; dev tree `shadcn@4.14.0` — evidence for `DOC-02`                                                                                                                                           |
| 10  | `node -e "require.resolve('shadcn/tailwind.css')"`                                                                                                                           | `node_modules/shadcn/dist/tailwind.css` (16 041 B), supplying 6 custom variants used 54× in `src`                                                                                                               |
| 11  | `npm ci --omit=dev --ignore-scripts` + `npx next build` (scratch copy)                                                                                                       | **FAIL — `Cannot find module '@tailwindcss/postcss'`**. Proves the prod-only build path is blocked by the Tailwind toolchain, _not_ by `shadcn` — this is what turned my `shadcn` hypothesis into a false alarm |
| 12  | `node contrast.mjs` (scratchpad; independent OKLCH→sRGB→WCAG implementation over `light.css`/`dark.css`)                                                                     | **All 30 pairs pass; every value matches `docs/DESIGN_TOKENS.md` §3 to two decimals. `FAILURES: []`.** Hairline 1.23/1.29 light, 1.70/1.50 dark; body↔secondary 2.62/2.92                                       |
| 13  | Per-route First Load JS: resolve `<script src>` from each `.next/server/app/**/*.html`, `stat` + `gzip` each chunk                                                           | 15 routes measured — table in the Performance section. `/` = **218 KB gz**, `/showcase/data` = **319 KB gz**                                                                                                    |
| 14  | Grep `/`'s First Load chunks for `ZodError`/`prettifyError`; grep for `QueryClient`                                                                                          | zod **absent** from `/`; React Query + sonner present in one 73 KB raw / 21 KB gz chunk                                                                                                                         |
| 15  | Locate the `ar` catalogue chunk; grep all prerendered HTML for it                                                                                                            | `4386 B raw / 1877 B gz`, referenced by **no** route HTML — code-split confirmed                                                                                                                                |
| 16  | `stat` + `gzip` on `.next/static/chunks/*.css` and `.next/static/media/*.woff2`                                                                                              | CSS **86 400 B raw / 15 622 B gz**; fonts **282 KB** across 10 files (Noto 162 KB); exactly **one** `<link rel=preload>` font per page (26 KB)                                                                  |
| 17  | Grep built CSS for `font-display`, `size-adjust`, `unicode-range`                                                                                                            | 10× `font-display: swap`; `size-adjust` 112% (Noto), 104.87% (Public Sans Fallback), 134.59% (Geist Mono Fallback); 3× `unicode-range`. Noto has **no** fallback face — `PERF-01`                               |
| 18  | Repo-wide greps: `any` / `as any` / `@ts-ignore` / `@ts-expect-error` / `!.` / `eslint-disable` / `process.env` / `dangerouslySetInnerHTML` / `<img` / `next/image` / `TODO` | 0 / 0 / 0 / 0 / 0 / 1 (justified) / 1 file / 3 (constant strings) / 1 (documented in AvatarImage) / **0** / 1 (Auth slot)                                                                                       |
| 19  | Greps against documented styling rules: `ring-3`, `ring-ring/50`, `font-semibold`, `font-extrabold`, `duration-[0-9]`, hardcoded colors, physical utilities                  | All **zero** except the 2 sanctioned `bg-black/10` overlay scrims                                                                                                                                               |
| 20  | `grep -rn "allowedDevOrigins\|192.168" docs *.md`                                                                                                                            | **No matches** — `CFG-01`: undocumented anywhere                                                                                                                                                                |

**Not run, and therefore not claimed:** Lighthouse / Core Web Vitals field or
lab measurement (no tooling wired up; no scores are stated anywhere in this
report), and the GitHub Actions workflow itself (every gate above ran locally
— see Deferred item 7).

Scratch artifacts (the prod-only install copy and `contrast.mjs`) were written
to the session scratchpad outside the repository. Nothing in the working tree
was modified; the only file added is this report.
