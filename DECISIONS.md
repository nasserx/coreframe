# Decisions

## Next.js App Router

Decision: Use Next.js App Router for routing and application entry points.

Reason: It is the current routing model for modern Next.js applications and supports nested layouts, server components, and route-level organization.

Alternatives considered: Pages Router.

## TypeScript

Decision: Use TypeScript across the project.

Reason: The foundation is intended for long-term reuse, and static typing improves maintainability, refactoring safety, and API clarity.

Alternatives considered: JavaScript.

## Tailwind CSS

Decision: Use Tailwind CSS for styling.

Reason: Tailwind provides a consistent utility-first styling system that works well with component-driven frontend development.

Alternatives considered: CSS Modules, Sass, CSS-in-JS.

## shadcn/ui

Decision: Configure shadcn/ui for future UI primitives.

Reason: shadcn/ui provides accessible, composable component patterns while keeping component code owned by the project when components are added.

Alternatives considered: Fully custom component system, packaged component libraries.

## Feature-First Architecture

Decision: Organize product implementation primarily by feature.

Reason: Feature ownership keeps related UI, state, validation, and behavior close together and reduces cross-folder coordination as the product grows.

Alternatives considered: Type-based organization only, such as global folders for all components, hooks, schemas, and services.

## src as Application Root

Decision: Use `src` as the single application root.

Reason: Keeping application code under `src` separates source code from root configuration and project metadata.

Alternatives considered: Root-level `app` and source folders.

## React Query

Decision: Use React Query for server-state management.

Reason: It provides proven caching, loading, mutation, and synchronization primitives for remote data.

Alternatives considered: Hand-managed request state, Zustand for server state.

## Zustand

Decision (revised 2026-07): Removed from dependencies until a product has state that needs it; it remains the recommended library for that moment.

Reason: It was declared with zero imports — an unused dependency every clone would inherit, inviting speculative stores. The client-state / server-cache / URL-state guidance that tells a product when a store is justified lives in `docs/DATA_LAYER.md`. When that point is reached, Zustand is still the pick: lightweight, explicit, suitable for cross-feature client state.

Alternatives considered: React Context only, Redux Toolkit, keeping the dependency preinstalled (rejected: a foundation must not ship unused dependencies).

## React Hook Form

Decision (revised 2026-07): Reinstated with `@hookform/resolvers` now that the reference form wiring exists and imports them. React Hook Form owns form state; `zodResolver` connects it to the existing validation standard.

Reason: It was removed earlier for being declared with zero imports for the entire foundation phase — the same unused-dependency state that led to removing axios and zustand. That condition no longer holds: `/showcase/forms` ships a real reference form, so the dependency now earns its place by being used rather than by being anticipated. RHF remains the pick for the reason it always was — uncontrolled inputs, no re-render per keystroke, and a resolver interface that lets Zod stay the single validation standard instead of introducing a second one. Neither package runs an install-time lifecycle script, so `strict-allow-scripts` needed no new approval.

Alternatives considered: Controlled form state with React (rejected: re-renders every keystroke and re-implements touched/dirty/submitting state by hand), Formik (rejected: heavier, less actively maintained, no advantage here), a project-owned `Form` abstraction over the primitives (rejected: an abstraction over one call site — see `docs/ROADMAP.md`).

## Zod

Decision: Use Zod for schema validation.

Reason: Zod provides TypeScript-friendly runtime validation and can support forms, API boundaries, and configuration validation.

Alternatives considered: Yup, Valibot, custom validation.

## Environment split: zod-free public value contract vs server-only validator

Decision (2026-07): `src/config/env.ts` is the client-safe public contract — the sole `process.env` reader (`RAW_ENV`) and the typed, defaulted `ENV_CONFIG` every module imports — and contains **no zod**. The fail-fast zod schema moved to `src/config/env-validation.ts`, which only `next.config.ts` imports for its side effect, so validation still runs once at startup in every mode while zod never enters a client-reachable module.

Reason: `apiFetch` reads `ENV_CONFIG.NEXT_PUBLIC_API_BASE_URL` on the client, so anything `env.ts` statically imported shipped to the browser for _every_ apiFetch consumer. With the old single-file module that meant zod (~69 KB gz) landed in any bundle that touched the data layer, even routes that validate nothing — measured on a no-schema route as 280.3 KB → 217.2 KB gz once decoupled (`docs/audit/2026-07-health-audit.md` §1.2). The paired change made `client.ts` import zod as a type only and format schema-rejection errors from the `ZodError` instance's own `issues` instead of the runtime `z.prettifyError`. Net: zod reaches the browser only where a call site actually passes a schema (which already bundles zod to define it), so the opt-in-with-a-nudge validation contract is unchanged while unvalidated fetches pay nothing.

Tradeoff accepted: the env logic is now two files and the value defaults/coercion in `env.ts` (e.g. `NEXT_PUBLIC_ENABLE_SHOWCASE !== "false"`) must mirror the schema in `env-validation.ts` — a small duplication guarded by both files' headers and by the fact that startup validation rejects any raw input the plain builder would misread. `env.ts` no longer throws on its own, but fail-fast is preserved because `next.config.ts` loads the validator before any app code (verified: an invalid value fails the build).

Alternatives considered: keeping the single zod-validating `env.ts` (rejected: ships zod to every data-layer client bundle), a runtime `typeof window` guard around the zod import (rejected: a static import can't be tree-shaken by a runtime branch), reading the base URL from `process.env` directly in `client.ts` (rejected: violates the single-reader rule and loses validation).

## Locale-aware Arabic font preload via a compile-time guard (not a computed value)

Decision (revised 2026-07): The Arabic (`Tajawal`) and mono faces in `src/app/fonts.ts` set `preload: false` as a written literal; a type-level assertion couples the Tajawal literal to `APP_CONFIG.direction`, so flipping the default locale to RTL without also setting `preload: true` fails the build. The shipped LTR/English default therefore preloads only the Latin body face; an Arabic-default clone flips the literal and the guard confirms it.

Reason: A `<link rel="preload">` is fetched eagerly and ignores `unicode-range`, so preloading the ~162 KB Arabic face on a Latin deployment downloaded bytes English pages can never paint — 213.2 KB → 28.6 KB of preloaded font per page once scoped (`docs/audit/2026-07-health-audit.md` §1.1). The value cannot be derived from config at build time: `next/font` rejects any non-literal loader option ("Font loader values must be explicitly written literals"), and it registers a preload for _every_ declared font instance, so a two-instance "mount the one you want" approach still preloads both (verified). The compile-time guard is the strongest available substitute for derivation — it turns a silent per-page regression (or a missing Arabic preload on an Arabic site) into a caught build error.

Tradeoff accepted: switching a deployment to Arabic-primary is a two-line change (default locale + the Tajawal preload literal) rather than one, but the guard makes the second line unforgettable. Tajawal still ships and loads on demand when Arabic renders, scoped by `unicode-range`; a Latin page with incidental Arabic takes a brief on-demand swap, which is the correct trade for not taxing every first paint.

Alternatives considered: `preload: APP_CONFIG.direction === "rtl"` (rejected: next/font forbids non-literal options), two literal instances selected at runtime (rejected: both instances preload regardless of which variable mounts), leaving the Arabic faces preloaded everywhere (rejected: downloads script-specific files on Latin-only pages), a bare documented literal with no guard (rejected: silent drift is exactly the failure class this repo guards against).

## Bilingual identity families: Inter and Tajawal

Decision (revised 2026-07): Inter is the English/Latin identity family and Tajawal is the Arabic family. The choice follows the approved visual reference's authored source, not a screenshot estimate: its root loads Google Fonts Inter at exactly 400, 500, 600, 700, and 800, and its Tailwind theme declares Inter as `font-sans`. The foundation loads that same weight set through `next/font/google`. Tajawal's official Arabic WOFF2 subsets at 400, 500, 700, and 800 remain vendored through `next/font/local`; its complete Google family is not mounted because its Latin faces would intercept Inter in mixed-language content. The shared stack remains script-based rather than component- or locale-class based.

Reason: Source-level parity with the approved reference gives Latin text the requested compact, substantial product voice without importing its component architecture. Arabic-only Tajawal files let the browser choose by glyph coverage: Arabic resolves to Tajawal, while Latin and Western numerals fall through to Inter even inside an RTL document. Both mechanisms self-host at build/runtime boundaries and create no browser request to an external font service.

Semantic mapping: the theme-neutral ramp preserves the reference-aligned sizes and leading—16px body, 18px lead, 14px supporting copy, 18px section headings, and 24px application page headings—but a final rendered hierarchy review raised body and explanatory roles to 500 and ordinary navigation/UI labels to 600. Important running copy remains `foreground`; genuinely secondary descriptions, help text, metadata, and unavailable destinations use `muted-foreground`, so the heavier stroke does not flatten hierarchy. Normal menu titles stay 600 and persistent/current titles stay 700; body copy never uses 700. Large foundation-only display/title roles retain their established sizes and Inter's authored heading tracking of −0.025em. Tajawal keeps its independently approved RTL sizes, leading, and zero tracking while consuming the same semantic 500/600/700 weight hierarchy.

Tradeoffs accepted: Tajawal does not publish weight 600, so authored 600 requests resolve to its nearest available 700 face; the CSS semantic weight is not rewritten. Tajawal's Arial-based metric fallback stays disabled to prevent Arabic interception, accepting an on-demand swap on English-primary pages. Its OFL notice is vendored with the four source files. The reference's browser-only antialiasing hint is not copied because it is not a semantic typography role and can thin strokes on platforms that implement it.

Superseded comparison: Plus Jakarta Sans, DM Sans, Inter Tight, and Manrope were previously rendered at identical compact metrics. That experiment is no longer the authority for the Latin family: once the visual reference was made authoritative and its source identified Inter, continuing to optimize unrelated families would undermine parity. The retained evidence remains useful only as history; it does not override this decision.

Alternatives considered: the complete `next/font/google` Tajawal family (rejected: includes Latin faces and breaks script ownership), locale-scoped family switching (rejected: mixed-script strings would need per-run language/font classes), a package dependency (unnecessary), the reference's runtime Google Fonts request (rejected: `next/font` provides the same face without privacy, availability, or layout-stability regression), and copying its landing-only responsive hero scale into the application ramp (rejected: page-purpose typography, not a universal product semantic).

## Native fetch as the HTTP client (axios removed)

Decision: The API boundary (`src/api`) is built on native `fetch`; the declared-but-unused axios dependency was removed.

Reason: Next.js extends `fetch` with its caching/revalidation semantics, so fetch is the only client that keeps server-side data access on one code path; it costs zero bundle bytes (axios is ~35 kB client-side); and the platform now covers axios's ergonomics natively (`AbortSignal.timeout`, `AbortSignal.any`, `Response.json`). Axios's remaining value — interceptors and error normalization — is provided by `apiFetch` being the single choke point every request passes through, with failures normalized into one typed `ApiError`. Full contract: `docs/DATA_LAYER.md`.

Alternatives considered: axios (rejected: parallel caching story to Next, bundle cost, interceptor indirection for what one function does in plain code), ky/ofetch (rejected: same conclusion with fewer reasons — no new dependency earns its place here).

## Core Layer

Decision: Introduce `src/core` for application-wide infrastructure.

Reason: Cross-cutting concerns such as providers, guards, errors, logging, monitoring, analytics, and accessibility need clear ownership outside features and outside generic utilities. Keeping them in a dedicated layer prevents feature modules, shared components, and low-level helpers from becoming infrastructure catch-alls.

Alternatives considered: Placing infrastructure in `src/lib`, distributing infrastructure across features, or keeping separate top-level folders for each concern.

## shadcn/ui runtime pieces (Base UI, sonner, Tailwind v4 CSS-first, shadcn as a devDependency)

Decision (backfilled 2026-07; placement corrected 2026-07): The primitive runtime is `@base-ui/react` (the shadcn `base-nova` style's runtime), toasts are `sonner`, Tailwind v4 runs CSS-first (no `tailwind.config`), and the `shadcn` package is a **devDependency**, consistent with `tailwindcss` and `@tailwindcss/postcss`.

`globals.css` importing `shadcn/tailwind.css` does **not** make it a runtime dependency: CSS is compiled at build time, so the registry package is part of the build toolchain and nothing of it reaches the runtime tree. The whole CSS toolchain is build-time, and none of it belongs in `dependencies`. Verified empirically (`docs/audit/2026-07-comprehensive-review.md`): a prod-only install cannot build in this stack at all — it fails on `@tailwindcss/postcss` long before `shadcn` is reached — so building from `--omit=dev` is not a supported path anywhere here, by ordinary Next.js convention. Do not "fix" this by moving the package back; the 2026-07 template-hardening pass moved it here deliberately.

Reason: These all follow from the shadcn/ui decision above — they are the stack that style ships with, and diverging from it would break the documented generation workflow (`docs/UI_LIBRARY.md`). Recorded explicitly because each is a real dependency someone will question later.

Alternatives considered: Radix-based shadcn styles (older runtime), a custom toast implementation, Tailwind config-file mode (v4 deprecates it as the primary path).

## npm dependency lifecycle-script policy

Decision (2026-07): The project `.npmrc` enables `strict-allow-scripts=true`, and `package.json#allowScripts` is the source of truth for dependency install-time lifecycle scripts. `sharp@0.34.5` and `unrs-resolver@1.12.2` are explicitly approved after review. `fsevents` is denied by package name because the locked `2.3.2` and `2.3.3` releases are optional, Darwin-only dependencies whose published packages already ship their native artifacts. Root lifecycle scripts remain enabled (`ignore-scripts=false`).

Reason: Installs fail closed when a dependency introduces an unreviewed lifecycle script while preserving the root `prepare` script and the two reviewed native-package paths. Exact approvals must be reviewed whenever dependency versions change. The name-level `fsevents` denial also requires reassessment if its packaging changes; current behavior was not executed directly on macOS.

Scope: This policy governs dependency lifecycle execution only. It neither remediates nor accepts npm vulnerability advisories.

Alternatives considered: `ignore-scripts=true` (rejected: disables root lifecycle scripts and reviewed native fallbacks), broad or unpinned approvals (rejected: future package versions would inherit execution permission without review).

## Showcase gating (build-time environment flag)

Decision (2026-07): `/showcase` and its `/api/showcase/records` endpoint are gated by `NEXT_PUBLIC_ENABLE_SHOWCASE` (default `"true"`). With the flag `"false"` at build time, the showcase layout calls `notFound()` during prerender, so every showcase route ships as a static 404.

Reason: The showcase is the foundation's living integration test — a product must keep it runnable during development but must not ship it. A build-time flag keeps one code path for both: no deletion, no route-table difference in dev, and every Showcase page plus its GET reference handler stays statically prerendered (a runtime or cookie-driven page gate would force dynamic rendering). The reference form's POST handler is necessarily request-time dynamic and applies the same flag by returning 404 at request time. The e2e suite runs with the default flag value, so CI is unaffected.

Alternatives considered: documented-delete-only (loses the living test the day the product ships), a route group excluded from production builds (Next.js has no per-build route exclusion), a runtime flag (forces dynamic rendering). Permanent deletion remains the documented end state (`docs/CLONING.md`).

## Vitest (unit/component test runner)

Decision: Use Vitest with Testing Library and jsdom for the unit/component layer; tests are colocated as `src/**/*.test.{ts,tsx}`.

Reason: Vitest consumes the repo's strict tsconfig (including `verbatimModuleSyntax`) and the `@/` alias with a one-line config mirror and no transformer chain, so a cloning team inherits near-zero test-runner configuration. Testing Library enforces querying by role/accessible name, which doubles as an accessibility check.

Alternatives considered: Jest (requires SWC/Babel transforms, separate ESM handling, and duplicated module mapping under this tsconfig), node:test (no component/DOM story).

## Playwright (browser test layer)

Decision: Use Playwright with Chromium and `@axe-core/playwright` for browser-level regression tests (console cleanliness across the route × theme × direction matrix, `document.fonts` assertions, accessibility scans).

Reason: The two defects that shipped past a green lint/typecheck/build (a hydration mismatch and a silently intercepted webfont) are only observable in a running browser. Playwright provides console capture, `page.evaluate`, managed web servers, and a maintained axe integration natively. The console harness runs against `next dev` because React reports attribute-level hydration mismatches only in development builds; fonts and accessibility run against `next start`.

Alternatives considered: Raw CDP scripting (the original throwaway harness — no assertions, reporting, or CI story), Cypress (heavier, no first-class multi-server support), adding a visual-regression tool (no shipped defect justifies screenshot baselines yet).

## i18n message translation: locale routing strategy (static per deployment + client runtime)

Decision (2026-07): Message translation ships with **build-time static locale per deployment** as the base, plus an **optional client-side locale runtime** (`LocaleProvider`, modelled on `ThemeProvider`) for deployments that build in more than one locale. No `/[locale]/…` routing, no middleware, no domain- or cookie-based negotiation.

Reason: The foundation's hard constraint is that **every renderable application page is statically prerendered**. Cookie-based locale reads opt every page into dynamic rendering (a direct regression); domain routing needs host detection via middleware; sub-path `/[locale]/…` routing can stay static with `generateStaticParams` but forces the `/`→`/locale` redirect through middleware (dynamic), nests the entire page tree under a `[locale]` segment, and taxes the common case — a single-locale product pays for routing machinery it never uses. Static-locale-per-deployment keeps every application page static and costs a single-locale product nothing. This rendering constraint does not describe non-GET handlers such as the request-time reference form POST route. The runtime switch for multi-locale deployments mirrors the theme runtime exactly (localStorage + cross-tab `storage` event + a pre-paint script that sets `<html lang/dir>` with no flash), which the repo already chose over a cookie **for the same static-rendering reason**. Measured: single-locale First Load JS lands within 0.2 kB of the multi-locale build and ships zero second-locale bytes; the second locale's catalogue is a code-split ~1.9 kB gz chunk fetched only on switch, absent from every page's initial load.

Trade-off accepted: client-side switching gives no per-locale URLs, so a returning non-default-locale visitor gets correct `dir`/`lang` pre-paint but a brief text re-render on hydration, and crawlers see the default-locale static HTML. For single-locale products (the common case) and the showcase proof this is correct and SEO-clean per deployment. A product that must serve **multiple indexed locales from one deployment** adopts sub-path routing as a documented product decision — the message/type/switcher layer built here sits underneath it unchanged.

Alternatives considered: next-intl/Paraglide with sub-path routing (per-locale URLs and SEO, but middleware + dynamic `/` negotiation + whole-tree `[locale]` nesting, taxing the single-locale common case); cookie-based locale (forces dynamic rendering); domain-based locale (infrastructure-coupled, needs middleware).

## i18n library: a typed in-repo solution, not a dependency

Decision (2026-07): The message layer is a small typed in-repo module (`src/i18n`), not next-intl, Paraglide, or react-i18next.

Reason: The routing decision above means the foundation does **not** use the part of an i18n library that earns its weight — locale routing, negotiation, middleware. What remains is message loading, `{placeholder}` interpolation, and a typed accessor, which is ~150 lines total: catalogues typed against a canonical English shape (a missing/renamed key fails `tsc`), a namespace-scoped `useTranslations`/`getTranslations` with `keyof`-checked keys, and a pure `translate()` shared by server and client. This foundation has removed unused dependencies twice on principle (axios, zustand); adding a library to use a fraction of it — and shipping its provider/runtime bytes on the single-locale common path — is the opposite of that discipline. Server Components read the default catalogue synchronously (static-render-safe); client components read the active catalogue and re-render on switch; both go through the same pure resolver. The default catalogue is statically bundled and other locales are code-split, so single-locale is free. ICU pluralization/formatting is deliberately out of scope — a product that needs it adds it in `src/utils` reading `LOCALE_INFO.numerals` (documented in docs/DIRECTION_AND_I18N.md).

Alternatives considered: next-intl (excellent, but its value is routing/negotiation we don't use, and it adds client runtime + a provider on every deployment including single-locale); Paraglide (compile-time, smallest runtime, but its message-per-function model and tooling is a larger thing for a cloning team to learn than a plain typed object); react-i18next (client-heavy, weak key typing, no Server Component story that fits static rendering).

## Theme states: concrete light/dark only, with the OS preference as a one-time fallback

Decision (2026-08): The theme runtime exposes **two** states, `"light" | "dark"`, and the shared control is a single toggle button. The previous three-state model (`"light" | "dark" | "system"`, a segmented selector, and a live `matchMedia` subscription) is superseded. `prefers-color-scheme` remains an **initialization input**: it is resolved once when storage holds no explicit choice, is never written back, and is not followed after the session starts. A legacy stored `"system"` is read as "no choice yet".

Reason: "System" was a third thing to render, name, translate, persist, migrate, and reason about, in exchange for a behavior almost no visitor asks for — an OS switch restyling a page mid-read. It also forced a two-value public API (`theme` + `resolvedTheme`) onto every consumer, of which three existed and all three wanted the resolved value; selection UI was the only caller that wanted the preference, and it no longer exists. Removing the state removes the split, the segmented control, four catalogue keys, and the label plumbing at three call sites, and it makes the control a command with one accessible name per state — which is why it needs no `aria-pressed`. What the OS preference is actually good at, choosing a sensible first paint for a visitor who has never chosen, is fully preserved: the pre-paint script's resolution rule is unchanged, so no-flash behavior and hydration safety are untouched, and not persisting the derived value means an unchosen visitor keeps following their OS across visits rather than being frozen at the first one.

Trade-off accepted: a visitor who wants the page to track their OS _continuously_ can no longer ask for that; they get the OS value at load and can toggle from there. This is the deliberate exchange — a product that genuinely needs live OS tracking re-adds a subscription in `theme-provider.tsx`, but it should not be the foundation's default cost. Migration is implicit rather than a written step: the same rule that rejects garbage in storage rejects `"system"`, so returning visitors resolve from the OS and their next toggle writes a concrete value.

Alternatives considered: keeping `"system"` in the runtime while hiding it from the UI (rejected — a state no control can reach is dead weight that still has to be handled everywhere, and it leaves the two-value hook contract in place); a three-position toggle cycling light → dark → system (rejected — an unlabelled third position is the least discoverable form of the option that was already the least used); persisting the system-derived value on first load (rejected — it silently converts a non-choice into a choice and permanently detaches the visitor from their OS setting).

## MIT project license and npm-private package

Decision (2026-08): Coreframe is licensed under the MIT License, copyright ©
2026 Nasser Ahmed. `package.json` retains `"private": true` as an accidental
npm-publication guard; the project license does not establish or authorize an
official npm publication.

The visual reference previously called `template-forntend` was created by
Nasser Ahmed. Coreframe is a restructured evolution of that owner-created work,
so the reference is not an external licensing dependency. Third-party material
redistributed or adapted by Coreframe retains its own licenses, copyright
notices, and attribution; `THIRD_PARTY_NOTICES.md` records the useful project-
level notices, while colocated license files remain authoritative for their
material.

Reason: Public source needs an explicit grant that lets people use, copy,
modify, and redistribute Coreframe while preserving a simple permissive model.
The MIT License supplies that grant for the project's own work without
relicensing third-party material. npm publication is a separate distribution
decision and remains disabled.

This decision supersedes _Private repository, no project license_ (2026-07).
That entry remains below as historical context rather than being rewritten.

Alternatives considered: retaining the no-license posture (rejected because it
would not grant public users permission to reuse or redistribute Coreframe);
removing `"private": true` (rejected because publishing an npm package is not
part of this decision); treating the owner-created visual reference as an
external dependency (rejected because it was created by the same owner).

## Repository-owned releases and semantic versioning

Decision (2026-08): `docs/RELEASING.md` is the single owner of Coreframe's
release process and semantic-versioning rules. `package.json#version` is the
authoritative project version, `package-lock.json` is synchronized through
npm, and releases are immutable annotated `vX.Y.Z` Git tags plus GitHub
Releases from accepted commits on `main`. The private package has no npm
publication path.

Version selection is based on the aggregate downstream impact since the latest
reachable release tag, not inferred mechanically from Conventional Commit
types. Release preparation uses a focused `release/vX.Y.Z` branch, review, the
complete repository validation gate, and an accepted
`chore(release): vX.Y.Z` commit before tagging.

Reason: version ownership, compatibility impact, validation, and immutable
release identity are durable repository contracts. Keeping them in one living
guide prevents package metadata, roadmap prose, tags, and release notes from
becoming competing sources of truth while retaining human review for a
template whose shared defaults affect downstream adopters.

Alternatives considered: deriving versions directly from commit types
(rejected because commit labels cannot express aggregate compatibility),
duplicating the procedure across contributor and roadmap documents (rejected
because it would drift), automated release tooling without a demonstrated need
(rejected as new operational surface), and npm publication (rejected because
Coreframe remains `"private": true` and distributes releases through GitHub).

## Private repository, no project license (superseded)

Superseded decision (2026-07; superseded 2026-08): This repository stays **private** and carries **no license of its own**. `package.json` sets `"private": true` and has no `license` field; there is no `LICENSE` file. Under default copyright this means all rights reserved. The `LICENSE` (MIT) and `SECURITY.md` files added during the 2026-07 template-hardening pass were removed as artifacts that only serve a public, openly distributed repo.

Reason: The earlier MIT license and vulnerability-disclosure policy were justified by an assumed public template audience (`docs/audit/2026-07-health-audit.md` §3.1). That assumption no longer holds — the repo is private and cloned by its own author, so a permissive grant to unknown third parties and a public disclosure channel have no audience. `"private": true` also guards against an accidental `npm publish`, which matters more here than the removed `license` field did.

The fonts are a separate matter, **unaffected** by the repo's own (absent) licence — their OFL obligations are owed to third parties. The built application self-hosts and **redistributes all three families** — Tajawal, Inter, and Geist Mono — each under the SIL Open Font License 1.1. Tajawal is the only one committed as source files (`src/assets/fonts/tajawal-arabic-{400,500,700,800}.woff2`), so its full OFL text is vendored in-repo (`src/assets/fonts/OFL.txt`) and must ship alongside them, regardless of this repo's public/private status. Inter and Geist Mono are fetched by `next/font` at build time and self-hosted into the build output (`.next/static/media/`); the generated woff2 files carry the copyright notice (name ID 0) and an OFL licence reference (name ID 14) in the font name-table metadata — the verbose licence text (name ID 13) is dropped by subsetting — which is how their notice obligation is met without an in-repo file.

If this repository is ever made public, reversal is a checklist, not a rediscovery:

1. Re-add a root `LICENSE` (MIT was the prior choice; confirm the copyright holder) and restore the `"license"` field in `package.json`.
2. Decide whether `"private": true` should stay (it prevents `npm publish` even for a public GitHub repo — keep it unless the package is meant to be published to a registry).
3. Restore `SECURITY.md` (vulnerability disclosure policy) — the prior version is in git history.
4. Restore the README doc-map rows for `SECURITY.md` and `LICENSE`, and the README `## License` section describing the MIT grant.
5. Re-audit the dependency `npm audit` posture for a public audience (`docs/audit/2026-07-health-audit.md` §2.2).
6. Leave the font OFL notice exactly as-is — it was never conditional on any of the above.

Alternatives considered: keeping MIT while private (a public license on a private repo grants rights to an audience that does not exist and invites confusion); removing the font OFL.txt as "just another license file" (wrong — it is a third-party obligation, not the project's licensing story).

## Project identity: Coreframe

Decision (2026-08): The project's official identity is **Coreframe**. Its official descriptor is **Frontend Architecture Foundation**, and the two composed with an em dash — **Coreframe — Frontend Architecture Foundation** — are the full presentation. The technical identifier, used for the package name, the repository, and directory examples, is **`coreframe`**; the canonical repository URL is `https://github.com/nasserx/coreframe`. **`Frontend Foundation` and `Foundation Frame` are retired as current identity terms** and must not be used to name the project, the mark, or the package in new work.

Scope of each term: `Coreframe` is the brand on its own — the header and footer lockups, the showcase brand, the error-page title, and any place a single word must stand for the project. `Frontend Architecture Foundation` is the descriptor that says what the brand _is_; it never appears alone as a name. `coreframe` is the lowercase technical identifier and never appears in visible copy. `src/config/app.ts` owns the first two as `APP_CONFIG.name` and `APP_CONFIG.descriptor`, and the root layout composes the document title from them, so the full presentation is derived in exactly one place.

The brand is **not translated**. `marketing.brand` carries the same `Coreframe` string in both the English and Arabic catalogues, because a proper name is locale-invariant; the surrounding copy is what changes language. Where the brand appears inside Arabic FAQ prose it is bidi-isolated by the same `<bdi dir="ltr">` mechanism that already covers `Next.js`, `Base UI`, and the other Latin technical terms (`src/features/marketing/marketing-faq.tsx`). Descriptive Arabic and English copy that uses "foundation"/"أساس" as an ordinary noun rather than as a name is unchanged — "build from a clear foundation" is a sentence, not an identity reference.

Reason: `Frontend Foundation` described a category, not a product — it was indistinguishable from the generic phrase the documentation uses in ordinary prose, which made every occurrence ambiguous between a name and a description and made a clean rename impossible to verify. `Foundation Frame` compounded that by giving the mark a second, near-identical name, so "Foundation" alone could mean the project, the mark, or the architectural layer of the same name in `ARCHITECTURE.md`. `Coreframe` is one word, unambiguous against the surrounding prose, carries the same structural sense the mark already draws (a core module inside an open frame), and leaves "foundation" free to go back to being an ordinary noun. Splitting brand from descriptor lets the short form stay short where space is tight — a header lockup, a browser tab — while the long form still says what the project is where that matters.

The mark itself is unchanged: `src/components/ui/brand-mark.tsx` and `src/app/icon.svg` keep their exact geometry, fill rules, and cobalt field, and the component keeps its generic `BrandMark` name. Renaming an identity does not require redrawing it, and `BrandMark` names a role, not a brand — a product replacing the identity replaces the path, not the symbol.

Trade-off accepted: the GitHub repository, the remote URL, and the local working directory still carry `frontend-foundation` at the time of this record. They are renamed separately, deliberately, because renaming a remote rewrites clone URLs and CI references for anyone holding a checkout; the documentation states the canonical `coreframe` values ahead of that move so there is one target to rename toward rather than a decision to re-make. Existing Git tags (`v1.0.0`, `v1.0.1`, `v1.1.0`) and their published GitHub Releases keep the old name in their text — they are historical artifacts of what shipped and are never rewritten.

Alternatives considered: keeping `Frontend Foundation` and only renaming the mark (rejected — the ambiguity between name and description was the primary problem, and the mark's name was the smaller half of it); adopting the descriptor alone as the name (rejected — "Frontend Architecture Foundation" is three generic words and worse than what it replaced at exactly the sizes where a name has to fit); a scoped npm-style identifier such as `@nasserx/coreframe` (rejected — the package is `"private": true` with no publish path, so a scope would be decoration on a name npm will never resolve).
