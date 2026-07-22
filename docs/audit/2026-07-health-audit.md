# Health audit — 2026-07

Read-only audit of the foundation as a GitHub template: performance, correctness/security
risk, template readiness, code quality. Every number below is measured against a production
build of the `chore/health-audit` branch (Next 16.2.10 / Turbopack, Node 24.18 locally,
`.nvmrc` targets 20). No source files were modified. Findings are ordered by severity; each
carries evidence and a one-line fix. **Fixes are recommended, not implemented.**

How the numbers were produced: `npm run build`, then measurement from `.next/` — Turbopack
prints no per-route sizes, so per-route JS was summed from the `<script src>` chunks in each
prerendered `server/app/**/*.html` (gzip via Node's `zlib`), and font preloads read from the
same HTML.

---

## Summary of headline numbers

| Metric                                         | Measured                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| First Load JS, home `/`                        | **721.9 KB raw / 216.1 KB gz** (12 chunks)                               |
| First Load JS, heaviest route `/showcase/data` | **1113.5 KB raw / 317.2 KB gz** (16 chunks)                              |
| Shipped CSS (single file)                      | 83.8 KB raw / **15.5 KB gz**                                             |
| Fonts preloaded on every page                  | 3 files, **213.3 KB** (Geist 28.6 + Geist Mono 22.6 + Noto Arabic 162.1) |
| Font files shipped total                       | 13 woff2 (12 Latin subsets of Geist/Geist Mono + 1 Noto)                 |
| npm audit                                      | **7 vulnerabilities** (3 high, 4 moderate)                               |
| `"use client"` files in `src/`                 | 21 (all justified — see §2.4)                                            |
| LICENSE file                                   | **none**                                                                 |

---

# 1 — Performance

## 1.1 [HIGH] The 162 KB Arabic font is preloaded and downloaded on every page, including English-only pages that never render Arabic

**Evidence.** `server/app/index.html` (the home page) emits:

```
<link rel="preload" href=".../noto_sans_arabic_variable.p.…woff2" as="font" crossorigin type="font/woff2">   162.1 KB
<link rel="preload" href=".../caa3a2e1…woff2" as="font" …>  (Geist)        28.6 KB
<link rel="preload" href=".../797e433a…woff2" as="font" …>  (Geist Mono)   22.6 KB
```

The home page (`src/app/(home)/page.tsx`) renders only `BrandMark`, an `<h1>`, and a `<p>` —
no Arabic, no code/`<pre>` (so no mono). Yet 184.7 KB of the 213.3 KB preloaded (Noto +
Geist Mono) is downloaded and never painted. `<link rel="preload">` **ignores
`unicode-range`** — the scoping in `src/app/fonts.ts` that would otherwise keep the browser
from fetching Noto on a Latin page does not apply to a forced preload. All three fonts are
mounted as variables on `<html>` in the root layout, and `next/font` defaults `preload:true`,
so every font preloads on every route.

Impact: on an English-default deployment (the documented default, `APP_LOCALES.DEFAULT`),
every first paint eats a 162 KB font fetch that is pure waste, competing with LCP resources on
a warm connection.

**Fix.** Set `preload: false` on `notoSansArabic` (and likely `geistMono`) in
`src/app/fonts.ts`; keep preload only on the body face (Geist). Deployment-aware: an
Arabic-default clone flips Noto's preload back on. Document the toggle in
`docs/DIRECTION_AND_I18N.md`.

## 1.2 [MEDIUM] Zod ships to the client bundle (~69 KB gz) wherever `apiFetch` is used client-side

**Evidence.** The largest single JS chunk, `1bfmde3fb6-wa.js` (291.7 KB raw / **69.3 KB
gz**), is Zod (485 `zod` string markers). It loads on `/showcase/data` but not on `/` —
confirmed by diffing the two pages' chunk sets. `src/api/client.ts` imports `z` at module top
and calls `z.prettifyError(...)` at runtime (lines 129), so Zod cannot be tree-shaken out of
any bundle that reaches `apiFetch`, even for fetches with no `schema`. `query-demo.tsx`
(client) validates with a schema, pulling the full library in.

Impact: any product doing client-side data fetching through the foundation's own client ships
~69 KB gz of Zod. That is inherent to opt-in client-side validation, but the `prettifyError`
call couples even _unvalidated_ client fetches to Zod.

**Fix.** Accept Zod on the client only where a schema is actually used; move the
`z.prettifyError` error-formatting so unvalidated fetches don't import Zod (e.g. format lazily
or behind the schema branch). Document the client-bundle cost of client-side schemas in
`docs/DATA_LAYER.md`.

## 1.3 [LOW] Home-page baseline First Load JS is 216 KB gz for a three-element page

**Evidence.** `/` = 216.1 KB gz across 12 chunks with no interactive content of its own. The
baseline is React 19 + React DOM (chunk `3x6vgayyhsdl8`, 72.5 KB gz) + the Next runtime +
every app-wide provider (Theme, React Query, sonner Toaster, ErrorBoundary) mounted in
`AppProvider` on every route. sonner (`015u_h8_…`, 20.1 KB gz) and the Query client ship on
routes that use neither toasts nor queries.

Impact: modest and largely unavoidable (it is the framework floor), but worth stating so a
product does not mistake it for its own weight. Nothing here blocks a fix; it is the cost of
the chosen provider stack.

**Fix.** No action required for correctness. If a product's landing page must be lighter,
mount the Toaster/Query providers in a nested layout that only wraps routes needing them,
rather than the root — record the trade-off if done.

## 1.4 CSS is lean — no material dead CSS

**Evidence.** One 83.8 KB / 15.5 KB gz stylesheet. Tailwind v4 emits only used utilities; the
four keyframes shipped (`enter`, `exit`, `pulse`, `spin`) are all referenced in `src/`
(`animate-in/out`, `animate-pulse`, `animate-spin`). Motion is fully tokenized — all six
`duration-*` occurrences resolve through `duration-(--motion-moderate)`, none are raw
`duration-200` drift. `--elevation-xs/sm` are referenced but intentionally empty (flat model).
No finding; recorded as a clean result.

## 1.5 Client/server boundary — all 21 `"use client"` files justified

Every `"use client"` in `src/` needs the client: providers and error boundaries (state,
effects), the two shells and skip-link (drawer state, focus management), `use-scrolled`
(scroll listener), `theme-control`, and the showcase demos (each uses `useTheme`,
`usePathname`, `getComputedStyle`, or React Query). `showcase-sections.ts` is correctly
data-only (no directive). No component is client-side that could be a Server Component.

## 1.6 LCP / CLS / INP notes

- **CLS:** well-defended — `next/font` ships metric-matched fallbacks (`Geist Fallback`,
  `Geist Mono Fallback` with `ascent/descent/size-adjust` overrides) and Noto uses
  `size-adjust: 115%`, so font swap causes no reflow. The 162 KB Noto preload (§1.1) actually
  _helps_ CLS on Arabic pages at the cost of bandwidth on Latin ones.
- **LCP:** the largest text (`text-display` `<h1>`) depends on Geist, which is correctly
  preloaded — good. The wasted Noto/Mono preloads (§1.1) are the main LCP risk by contending
  for connection bandwidth.
- **INP:** no finding; interactivity is minimal and event handlers are light.

---

# 2 — Correctness and security risk

## 2.1 [MEDIUM] `shadcn` is a runtime `dependency`; it drags a large, vulnerable dev-only tree into production installs

**Evidence.** `package.json` lists `shadcn` under `dependencies`, not `devDependencies`. Its
only real use is a build-time CSS import — `@import "shadcn/tailwind.css"` in
`src/app/globals.css`. But `shadcn` is a CLI that pulls `@modelcontextprotocol/sdk`
(`node_modules/@modelcontextprotocol` = 7.3 MB), `@hono/node-server`, and `fast-uri` — and
those transitive packages are the source of **3 of the 7 `npm audit` findings** (moderate
`@hono/node-server` path traversal, moderate `@modelcontextprotocol/sdk`, high `fast-uri`
host confusion). None of that belongs in a product's production dependency tree.

**Fix.** Move `shadcn` to `devDependencies`. The `globals.css` import still resolves at build
time (dev deps are installed for builds), and `npm ci --omit=dev` production installs stop
pulling the MCP/Hono/fast-uri tree.

## 2.2 [MEDIUM→LOW] `npm audit`: 7 vulnerabilities, but none reach the client bundle or runtime request path

**Evidence.** `npm audit` → 3 high, 4 moderate:

| Severity | Package                                                    | Reachability in this repo                                                                    |
| -------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| HIGH     | `sharp` (libvips CVE-2026-33327/8, -35590/1)               | Next's optional image optimizer. **`next/image` is used 0 times** in `src/` — never invoked. |
| HIGH     | `next` (via postcss, sharp)                                | Build-time (postcss) + unused sharp.                                                         |
| HIGH     | `fast-uri`                                                 | Transitive via `shadcn` → MCP SDK — dev CLI only (see §2.1).                                 |
| MODERATE | `postcss`                                                  | Build-time CSS stringify; not shipped to client.                                             |
| MODERATE | `@hono/node-server`, `@modelcontextprotocol/sdk`, `shadcn` | Dev CLI tree (see §2.1).                                                                     |

So the practical exposure is small: sharp is never called, postcss is build-only, and the
Hono/MCP chain is dev tooling. Still worth clearing.

**Fix.** Bump patch releases available now (`next 16.2.10 → 16.2.11`, `react/react-dom
19.2.4 → 19.2.8`, `@tanstack/react-query`, `tailwindcss`, `lucide-react`, `eslint`); re-run
`npm audit`; combine with §2.1 to drop the dev-CLI chain from production installs. Avoid
`npm audit fix --force` (it wants to downgrade `next` to 9.x).

## 2.3 [LOW] `AbortSignal.any` / `AbortSignal.timeout` used with no `browserslist` declared

**Evidence.** `src/api/client.ts` (lines 57–59) uses `AbortSignal.timeout` and
`AbortSignal.any`. `AbortSignal.any` is only available in Chrome 116+, Safari 17.4+, Firefox
124+ (early-2024 baseline). No `browserslist` config exists (`package.json` has none, no
`.browserslistrc`), so a cloning team has no declared floor and Next won't warn. Fine for a
modern-evergreen target; a footgun for a product that must support older Safari.

**Fix.** Add a `browserslist` field documenting the intended support floor; note the
`AbortSignal.any` requirement in `docs/DATA_LAYER.md`.

## 2.4 Secrets / env handling — clean

`.env*` is gitignored except `.env.example` (`.gitignore` lines 34–35); `.env.example`
accurately mirrors the two `NEXT_PUBLIC_` variables validated in `src/config/env.ts`. Both
public vars are browser-safe by definition; no server-only secret is exposed to the client.
`process.env` is read only in `src/config/env.ts`. No finding.

## 2.5 Accessibility beyond axe — covered, with one drift hazard

Keyboard/focus is well tested outside axe's reach: `shell.spec.ts` exercises drawer open,
focus return, and skip-link at mobile and desktop widths for both shells; reduced motion is
handled once globally (`globals.css` lines 55–64) and motion is never the sole carrier of
meaning; live regions come via sonner. No structural a11y defect found.

One drift hazard (low): `globals.css` line 33 hardcodes `scroll-padding-block-start: 4rem` to
match the `h-16` sticky headers, kept in sync by hand (comment acknowledges it). If a clone
changes header height and forgets this, anchor/skip-link targets land behind the bar. **Fix:**
derive both from one token, or add an e2e assertion.

## 2.6 No "seventh gate-passing runtime bug" found

I looked specifically for a pattern that passes all six gates but breaks at runtime (the class
of the four already shipped). The theme pre-paint script, `useSyncExternalStore` hydration
strategy, `apiFetch` abort/timeout handling, and the `force-static` self-fetching showcase
route were each inspected and are sound. Nothing new of that class surfaced. (Not a guarantee
of absence — a negative result recorded honestly.)

---

# 3 — Template readiness

## 3.1 [HIGH] No LICENSE file — clones have no legal right to use the code

**Evidence.** No `LICENSE`/`LICENSE.md` at the repo root; `package.json` has no `license`
field and is `"private": true`. Under default copyright, "no license" means **all rights
reserved**: anyone who clicks _Use this template_ receives code they have no legal permission
to use, modify, or redistribute. That directly defeats the repository's stated purpose (a
foundation to be cloned). The bundled Noto font is separately and correctly licensed
(`src/assets/fonts/OFL.txt`, OFL 1.1); the gap is the **project's own code**.

**Recommendation (do not add here).** Add a permissive license at the root — **MIT** is the
conventional, friction-free choice for a boilerplate/template of this kind (simple, permits
private/commercial derivative products, no copyleft obligations on clones). Add a matching
`"license": "MIT"` to `package.json`. Keep `OFL.txt` as-is for the font. If the intent is that
each _product_ relicenses, say so explicitly in `README.md` and still ship a template license.

## 3.2 [LOW] Missing repository files a serious template is expected to have

Judged on merit, not boilerplate-for-its-own-sake:

| File                                 | Verdict                                                                                                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LICENSE`                            | **Earns its place** — see §3.1.                                                                                                                                                             |
| `SECURITY.md`                        | **Earns its place** — a template invites security reports; a one-line disclosure policy is cheap and expected.                                                                              |
| `.editorconfig`                      | **Earns its place** — the template mandates logical-CSS/kebab-case/line-ending rules; an `.editorconfig` enforces basics in editors before Prettier runs, and complements `.gitattributes`. |
| `.github/dependabot.yml`             | **Worth it** — clones inherit the dependency set; automated patch PRs keep them current (directly addresses §2.2).                                                                          |
| PR / issue templates                 | Optional — skip unless the team wants them.                                                                                                                                                 |
| `CHANGELOG.md`, `CODE_OF_CONDUCT.md` | Skip — no value for a template; a product adds them if it wants.                                                                                                                            |

## 3.3 `docs/CLONING.md` walkthrough — followed literally as a first-time reader

The doc is accurate; every path it names exists (`src/app/(home)/layout.tsx`,
`src/app/showcase/(site)/site/layout.tsx`, the four showcase-deletion locations). Friction
points for a genuine first-timer:

- **[LOW] Step 5 vs step 8 — e2e is invisible in the local checklist.** Step 5 runs `lint &&
typecheck && test` only; step 8 says a push "runs the full CI pipeline including the browser
  matrix." A reader who tries `npm run test:e2e` locally to pre-empt CI hits two undocumented
  prerequisites (`npx playwright install chromium`, and e2e requires a prior `build`) that
  live in `CLAUDE.md`, not here. **Fix:** one line in §4 pointing at the e2e prerequisites, or
  an explicit "e2e runs in CI only; to run locally see …".
- **[LOW] Step 6's alternate-path parenthetical assumes shell knowledge.** The `(home)` group
  already contains `layout.tsx` + `page.tsx`; a first-timer creating `(home)/hello/page.tsx`
  is fine, but the "compose a shell in its own layout" aside references two showcase layout
  files without saying a reader should copy their shape. Minor.
- No steps are out of order; the 30-minute claim is plausible.

## 3.4 Documentation quality and entry point

Strong overall. One obvious entry point exists (`README.md` → documentation map → the eight
`docs/` guides), and it leads somewhere useful. Observations:

- **[LOW] `CLAUDE.md` is 22.8 KB and partly duplicates the `docs/`** it points to (theme
  runtime, layout, data layer are summarized at length). It self-declares "docs win if they
  disagree," which is the right rule, but the volume of restated detail is a standing
  drift-maintenance cost — it has to be re-reconciled every pass. Not stale today; flagged as
  ongoing friction. **Fix:** thin the restated sections to pointers over time.
- `docs/audit/` correctly carries a README warning not to read archived reviews as current
  state. Good.
- No contradictions found between `CLAUDE.md`, the root docs, and code on the points I
  spot-checked (dependency direction, font order, landmark ownership, token contract).

## 3.5 Three biggest sources of friction building on this foundation

1. **The LICENSE gap (§3.1)** — the single largest blocker: legally, a clone cannot ship.
2. **Font preload cost on non-Arabic products (§1.1)** — every clone pays 162 KB of Arabic
   font on first paint until someone discovers and flips `preload`; the default should favor
   the documented English-default deployment.
3. **e2e ergonomics (§3.3)** — the browser layer needs `build` + a one-time Playwright
   install that the clone checklist doesn't state, so a first `test:e2e` fails confusingly.

---

# 4 — Code quality

## 4.1 [LOW] `src/config/routes.ts` and `src/config/features.ts` are exported but consumed nowhere

**Evidence.** `ROUTES` (routes.ts) and `FEATURE_FLAGS` (features.ts) are re-exported via
`src/config/index.ts` but imported by zero non-definition files (grep across `src/`). They are
documented foundation scaffolds (placeholder public API), so this is intentional, not rot —
recorded for completeness, not as a defect. No fix needed unless the template wants to trim
its surface; if kept, they are correctly minimal.

## 4.2 No dead code, unreachable branches, or orphan files found

The `src/` tree is 118 files, 20 of them intentional folder READMEs. Empty foundation folders
(`constants`, `utils`, `types`, `store`, `services`) hold only READMEs by design (foundation
phase). Every non-scaffold export traces to a consumer. `react-dom` grep-matches zero direct
imports but is a required React peer (used by the framework) — not unused.

## 4.3 No duplication-vs-shared problems found

The one deliberately shared-across-two-consumers piece (font setup in `src/app/fonts.ts`,
imported by the root layout and `global-error.tsx`) is correctly factored and documented as to
why. `ErrorFallback` is shared by `error.tsx`, `global-error.tsx`, `not-found.tsx`, and the
client `ErrorBoundary` — correct sharing, not premature. No case of duplication that should be
shared, nor sharing that should be duplicated.

---

# Recommended action order

1. **Add a LICENSE** (§3.1) — MIT + `package.json` `license` field. _Blocker for the template's purpose._
2. **Stop preloading Noto/Geist Mono on Latin deployments** (§1.1) — `preload:false`, deployment-aware. _Biggest measured perf win: 184.7 KB/page._
3. **Move `shadcn` to `devDependencies`** (§2.1) + bump patch releases (§2.2) — clears 3 of 7 audit findings from production installs.
4. **Add `SECURITY.md`, `.editorconfig`, `dependabot.yml`** (§3.2).
5. **Decouple Zod's `prettifyError` from unvalidated client fetches** (§1.2); document client-schema bundle cost.
6. **Clarify e2e prerequisites in `docs/CLONING.md` §4** (§3.3); add a `browserslist` (§2.3).

_Prior point-in-time reviews live alongside this file in `docs/audit/`; read them as history,
not current state._
