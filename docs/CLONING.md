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

The name and description appear in exactly two source locations — this is
deliberate; everything else derives from them:

| Location            | What to change                                    |
| ------------------- | ------------------------------------------------- |
| `package.json`      | `name` (and `version` if you version differently) |
| `src/config/app.ts` | `APP_CONFIG.name`, `APP_CONFIG.description`       |

`APP_CONFIG` feeds the root layout's `<title>`/description metadata, the
error pages, and everything else that displays the app's identity — no
component references the name directly.

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
   static, no code changes. (The flag is inlined at build time — changing it
   requires a rebuild. Run the e2e suite with the flag unset/true: route
   discovery expects the pages to exist.)
3. **Delete it permanently** — remove the three showcase locations:
   `src/app/showcase`, `src/app/api/showcase`, `src/features/showcase`.
   Route discovery (`tests/e2e/routes.ts`) adjusts automatically, but three
   specs reference showcase URLs directly and need retargeting at your
   product's routes: `shell.spec.ts` (drives `/showcase` — point at your
   shell-wrapped routes, or remove until you mount an AppShell),
   `fonts.spec.ts` (measures Arabic on `/showcase/direction` — any page with
   Arabic text works), and `errors.spec.ts` (exercises the ErrorBoundary
   demo on `/showcase/feedback` — keep the 404 test, retarget or drop the
   boundary test).

**Delete** when they stop being useful: `docs/audit/` (this repo's
historical reviews) and `docs/ROADMAP.md` (or repurpose it as your own).

**Configure first:**

- Environment — copy `.env.example` to `.env.local`; set
  `NEXT_PUBLIC_API_BASE_URL` if your backend is not same-origin
  (`src/config/env.ts` is the validated contract; empty = same-origin).
- `src/config/app.ts` — `APP_LOCALES.DEFAULT` if your deployment is not
  English/LTR (one value flips language and direction together).
- CI works with zero configuration: `.github/workflows/ci.yml` needs no
  secrets, no environment, no registry access — it runs on the first PR of
  a fresh clone as-is.

## 4. First-run checklist (~30 minutes)

Do these in order; each step states what proves it worked.

1. **Toolchain** — install Node 20+ (`nvm use` reads `.nvmrc`). `node -v`
   prints ≥ 20.
2. **Install** — `npm ci`. Exits 0; `prepare` installs the git hooks.
3. **First run** — `npm run dev`, open `http://localhost:3000`. The home
   page shows the app name from `APP_CONFIG`; `/showcase` renders the
   component library.
4. **Rename** — edit `package.json#name` and `APP_CONFIG` (§2). The browser
   tab title and home page now show your product's name.
5. **Gates** — `npm run lint && npm run typecheck && npm test`. All exit 0
   untouched; you now know the gates are green before your first change.
6. **First page** — create `src/app/hello/page.tsx`:

   ```tsx
   import { PageHeader, PageHeaderTitle } from "@/components/ui/page-header";

   export default function HelloPage() {
     return (
       <main className="p-6">
         <PageHeader>
           <PageHeaderTitle>Hello</PageHeaderTitle>
         </PageHeader>
       </main>
     );
   }
   ```

   `/hello` renders with the foundation's type ramp and tokens. (A page
   using the full chrome composes `AppShell` in a layout — see
   `src/app/showcase/layout.tsx` for the reference.)

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
