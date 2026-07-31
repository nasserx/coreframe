# Cloning this foundation

How to start a product from this repository: template setup, the
clone-and-rename procedure, and a first-run checklist designed to take a
developer from clone to a first product page in under 30 minutes.

## 1. Template setup (repository owner, once)

When this repository is pushed to GitHub, the owner enables
**Settings → General → Template repository** (or runs
`gh repo edit <owner>/frontend-foundation --template`). From then on new
products start with **Use this template → Create a new repository** — a
clean single-commit history with no coupling to this repo's history.

Forking also works but keeps the shared history and the fork relationship;
prefer the template path for products.

## 2. Where the foundation's identity lives

The name and description appear in exactly two source locations —
everything else derives from them:

| Location            | What to change                                    |
| ------------------- | ------------------------------------------------- |
| `package.json`      | `name` (and `version` if you version differently) |
| `src/config/app.ts` | `APP_CONFIG.name`, `APP_CONFIG.description`       |

`APP_CONFIG` feeds the root layout's `<title>`/description metadata, the
error pages, and everything else that displays the app's identity — no
component references the name directly.

**Two exceptions, both showcase-scoped:** `src/app/showcase/layout.tsx`
hardcodes `"Foundation Showcase"` in its metadata title template, and the
`site` message namespace (`src/i18n/messages/en.ts`, `ar.ts`) carries
`site.brand`. Both disappear with the showcase (option 3 below); if you keep
it, rename them too or a renamed product still shows "Foundation Showcase" in
showcase tab titles.

**Non-English products translate the message catalogue, not the boundary
files.** All user-facing copy — the error routes (`not-found.tsx`,
`error.tsx`, `global-error.tsx`), the `ErrorBoundary` fallback, and every
primitive label — reads from `src/i18n/messages/<locale>.ts` via
`useTranslations`/`getTranslations`. For a single-locale product, translate
**one** catalogue (§3a below); the boundary files never need editing. The
English defaults still embedded in primitives (`ErrorFallback`,
`DialogContent.closeLabel`, the shell label props) are prop-overridable
fallbacks — the call sites pass translated values.

Also rewrite for your product:

- `README.md` — the foundation's README describes the foundation; replace
  the intro with your product, keep the documentation map and commands.
- `CLAUDE.md` — if you use Claude Code, update the mission/status sections
  to your product; the standards sections still apply as written.

## 3. What to keep, delete, and configure

**Keep** (this is the product's foundation): everything under `src` except
the showcase, the `docs/` guides, the test layers, the quality gates, and
the root standards documents (`ARCHITECTURE.md`, `CODE_STYLE.md`, …).

**The showcase** (`/showcase`) is the foundation's living integration test.
Three options, in order of product maturity:

1. **Keep it during development** — default; nothing to do.
2. **Ship without it** — set `NEXT_PUBLIC_ENABLE_SHOWCASE=false` in the
   production build environment. Every `/showcase` route and the
   `/api/showcase/records` endpoint prerender as a static 404; routes stay
   static, no code changes. The reference form's
   `POST /api/showcase/forms/reference` answers 404 at request time instead —
   Next never prerenders a non-GET handler, so a runtime gate is the only form
   the check can take there. (The flag is inlined at build time — changing it
   requires a rebuild. Run the e2e suite with the flag unset/true: route
   discovery expects the pages to exist.)
3. **Delete it permanently** — remove the three showcase locations:
   `src/app/showcase`, `src/app/api/showcase`, `src/features/showcase`.
   Then finish the deletion in three places that reference the showcase:
   - **The env gate**: `NEXT_PUBLIC_ENABLE_SHOWCASE` becomes dead code once
     the gated routes are gone. Remove it from `src/config/env.ts` (its
     `RAW_ENV` read, its `ENV_CONFIG`/`EnvConfig` field, and the `ProcessEnv`
     declaration), from `src/config/env-validation.ts` (its line in the Zod
     schema), and from `.env.example`.
   - **The e2e specs**: route discovery (`tests/e2e/routes.ts`) adjusts
     automatically, but six specs reference showcase URLs directly and
     need retargeting at your product's routes: `shell.spec.ts` (drives
     `/showcase` for the AppShell and `/showcase/site` for the SiteShell —
     point at your shell-wrapped routes, or remove until you mount a
     shell), `geometry.spec.ts` and `i18n.spec.ts` (both drive
     `/showcase/site` — point at a shell-wrapped route, Arabic-capable for
     i18n), `fonts.spec.ts` (measures Arabic on `/showcase/direction` —
     any page with Arabic text works), `errors.spec.ts` (exercises the
     ErrorBoundary demo on `/showcase/feedback` — keep the 404 test,
     retarget or drop the boundary test), and `forms.spec.ts` (drives the
     reference form on `/showcase/forms` — delete it with the showcase, or
     copy it as the shape of your own form's coverage). Production specs are
     discovered automatically, so deleting or renaming one needs no
     Playwright config change.
   - **`src/features/README.md`**: its "Current contents" line describes
     `showcase/`; update it to describe your product's features (or "none
     yet").

**Delete** when they stop being useful: `docs/audit/` (this repo's
historical reviews) and `docs/ROADMAP.md` (or repurpose it as your own).

**Configure first:**

- Environment — copy `.env.example` to `.env.local`; set
  `NEXT_PUBLIC_API_BASE_URL` if your backend is not same-origin.
  `src/config/env.ts` owns the client-safe reads and typed values (empty =
  same-origin); the server-only Zod contract in
  `src/config/env-validation.ts` validates them at startup.
- `src/config/app.ts` — locale (see §3a for the language a product ships in).
- `next.config.ts` — **`allowedDevOrigins` is a per-developer value.** It
  carries this repo's author's LAN IP so the dev server accepts requests from
  a phone or tablet on the same network. Replace it with your own machine's
  address, or delete the entry if you only ever browse `localhost`. It affects
  the dev server only — there is no production exposure — but it is a security
  control, so an inherited allowlist entry should not be left unexamined.
- CI works with zero configuration: `.github/workflows/ci.yml` needs no
  secrets, no environment, no registry access — it runs on the first PR of
  a fresh clone as-is.

## 3a. Ship in one language (the common case)

Most products built on this foundation ship **one** locale, and that path is
designed to cost nothing — no locale routing, no switcher, no second-locale
bytes. To ship entirely in one language (Arabic shown; any locale is the same
shape):

1. **`src/config/app.ts`** — set the locale as the sole entry:

   ```ts
   export const APP_LOCALES = { DEFAULT: "ar", SUPPORTED: ["ar"] } as const;
   ```

   Trim `LOCALE_INFO` to that one locale (the `satisfies` clause enforces it).
   `lang`, `dir`, and numerals now follow automatically; `LocaleControl`
   renders nothing (nothing to switch).

2. **Translate one catalogue.** Rename `src/i18n/messages/en.ts` to your
   locale (e.g. `ar.ts`, `export const ar`) and translate every value, or keep
   `en.ts` as the reference and add `ar.ts` declared `: Messages`. In
   `src/i18n/catalogue.ts`, point the static `DEFAULT_CATALOGUE` import and
   `DefaultCatalogueLocale` at your locale and trim `CATALOGUE_LOADERS` to the
   one entry. The typecheck (and the `DEFAULT_CATALOGUE` guard) fail until this
   is consistent — a forgotten step is a build error, not a silent English
   leak.

3. **If the locale is RTL/Arabic-primary**, set Tajawal's literal `preload`
   option to `true` in `src/app/fonts.ts`. The compile-time
   `_TajawalPreloadMatchesLocale` guard couples that literal to the configured
   default direction. Review the `[dir="rtl"]` ramp metrics in
   `src/styles/theme.css` as well.

That is the whole path: one config change and one catalogue. Every route stays
statically prerendered, the bundle carries no multi-locale machinery, and the
product is fully in your language, RTL and all. To serve **two** locales at
once instead, keep `SUPPORTED` at two entries and translate both catalogues —
`LocaleControl` then appears automatically; see
`docs/DIRECTION_AND_I18N.md` for the full add-a-locale procedure and the
routing decision.

## 4. First-run checklist (~30 minutes)

Do these in order; each step states what proves it worked.

1. **Toolchain** — install Node 24.18.0 (`nvm use` reads `.nvmrc`). `node -v`
   prints `v24.18.0`.
2. **Install** — `npm ci`. Exits 0; `prepare` installs the git hooks.
3. **First run** — `npm run dev`, open `http://localhost:3000`. The home
   page shows the app name from `APP_CONFIG`; `/showcase` renders the
   component library.
4. **Rename** — edit `package.json#name` and `APP_CONFIG` (§2). The browser
   tab title and home page now show your product's name.
5. **Gates** — `npm run lint && npm run typecheck && npm test`. All exit 0
   untouched; you now know the gates are green before your first change.
   (The browser layer, `npm run test:e2e`, is **not** in this line: it has two
   prerequisites — a prior `npm run build` and a one-time
   `npx playwright install chromium` — and CI runs it for you on every push.
   Run it locally only when you touch layout, fonts, or accessibility; see
   `docs/TESTING.md`.)
6. **First page** — create `src/app/(home)/hello/page.tsx`:

   ```tsx
   import { PageHeader, PageHeaderTitle } from "@/components/ui/page-header";

   export default function HelloPage() {
     return (
       <div className="p-6">
         <PageHeader>
           <PageHeaderTitle>Hello</PageHeaderTitle>
         </PageHeader>
       </div>
     );
   }
   ```

   `/hello` renders with the foundation's type ramp and tokens. Note that
   the page renders no `<main>` — the layout owns that landmark
   (`docs/LAYOUT.md` § The main landmark): here the `(home)` group's bare
   layout provides it. A page that needs full application or site chrome
   instead composes a shell **in its own route-group layout** — copy the
   shape of `src/app/showcase/(app)/layout.tsx` (`AppShell`) or
   `src/app/showcase/(site)/site/layout.tsx` (`SiteShell`), which mount the
   shell and its `<main>` for every route in the group.

7. **First feature slice** — when the page needs data or components, create
   `src/features/<name>/` and copy the shape of
   `src/features/showcase/api.ts` (schema + key factory + fetcher). The
   dependency-direction lint tells you immediately if something is placed
   wrong.
8. **Commit** — `git add -A && git commit -m "feat: first product page"`.
   The pre-commit hook formats and lints; commitlint enforces the message
   format. A push/PR runs the full CI pipeline including the browser matrix
   over your new route — route discovery picked it up automatically.

Where to go next: `ARCHITECTURE.md` for placement rules,
`docs/DATA_LAYER.md` to point at your backend, `docs/DESIGN_TOKENS.md` §4
to rebrand, `docs/ROADMAP.md` for what is deliberately not built yet.
