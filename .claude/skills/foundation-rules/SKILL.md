---
name: foundation-rules
description: Non-negotiable rules of this Next.js foundation (and its clones) — tokens, logical properties, layout contracts, landmarks, contrast, render-prop hydration, quality gates. Use when writing or reviewing any UI, styling, layout, theming, or component code in this repo.
---

# Foundation rules

Hard rules specific to this repository. Each one exists because breaking it
has already broken something, or because a lint/e2e gate enforces it. The
linked docs are authoritative; this skill is the index, not the source.

## Tokens: CSS variables are the single source of truth

- Layering: `src/styles/base.css` (theme-neutral, `--radius-base`) →
  `light.css`/`dark.css` (semantic `--color-*`/`--elevation-*`, full parity
  mandatory) → `theme.css` (bridge into Tailwind v4 `@theme inline` + the
  type ramp). Components consume semantic utilities (`bg-primary`,
  `border-input`) — never raw values.
- **Zero colour literals outside `src/styles`** (no hex/oklch/rgb in
  components; the one sanctioned exception is the overlay scrim
  `bg-black/10`). Spacing is Tailwind's default scale — no spacing tokens.
  Motion IS tokenized (`--motion-quick`/`--motion-moderate` +
  `--ease-out-soft`; `transition-*` defaults resolve through them): a raw
  `duration-N` in a component is drift, and reduced motion is handled once
  globally in `globals.css`, never per component.
- **Exactly one TS token file:** `src/theme/breakpoints.ts`, because
  `matchMedia` and media queries cannot read CSS custom properties. It must
  mirror Tailwind's default screens. Never add another TS mirror of a CSS
  token — two sources of truth was audit finding #1.

## Logical properties only (lint-enforced)

`ms-`/`me-`, `ps-`/`pe-`, `start-`/`end-`, `text-start`/`text-end`,
`rounded-s-`/`rounded-e-`, `border-s`/`border-e`. Physical direction
utilities fail `foundation/no-physical-tailwind-classes` (inline rule in
`eslint.config.mjs`). Escape hatch: an `eslint-disable` **with a written
justification** — nothing else. Directional icons flip individually with
`rtl:rotate-180`; centered overlays use `inset-x-0 mx-auto`, never
`left-1/2 -translate-x-1/2`.

## Measure and rhythm; what stays Tailwind's job

- A content block is **prose-capped** (`max-w-prose`, 65ch), **form-capped**
  (`max-w-form`, 28rem), or **full-width** — never an ad-hoc `max-w-*`.
- Vertical rhythm is the five named Stack steps (`xs`…`xl`,
  `src/components/ui/stack.tsx`), chosen by sibling relationship.
- Grids, rows, and one-off alignment stay plain Tailwind utilities — do not
  add wrapper primitives for them, and do not invent spacing tokens.

## The main landmark

**Layouts own `<main>`; pages never render it.** Shell segments get it from
`AppShellMain`/`SiteShellMain`; bare segments from a route-group layout
(`src/app/(home)/layout.tsx` is the reference). Sanctioned exception: root
boundary files (`error`/`global-error`/`not-found`) render without segment
layouts, so they own their own.

## Unavailable destinations

A destination that does not exist yet is **never a dead link, a no-op
button, or a 404**. Nav: `SiteShellNavItem` without `href` → non-focusable
muted text + sr-only availability hint. Action-shaped affordances: the same
pattern as a non-focusable span carrying `buttonVariants` styling. And a
link styled as a button is `buttonVariants` on a real `Link` — `Button
render={<Link>}` re-brands it `role="button"` (this broke the 404 page).

## Horizontal overflow: measure, never assume

Whether a bar fits is a runtime layout fact — **a green build proves
nothing about it**. `SiteShell`'s `collapseBelow` is a prop with
deliberately no correct default: measure your bar's real content (every
locale you ship) and pick the smallest screen it fits. The e2e overflow
sweep (`tests/e2e/overflow.spec.ts`, every route × width range × direction,
page-level and bar-level) is the gate; the first product clone shipped a
bar that overflowed at every width while its build stayed green.

## Contrast

Every foreground/background pair is verified in `docs/DESIGN_TOKENS.md` §3
(4.5:1 text, 3:1 UI boundaries/focus). Any **lightness** change to a colour
token owes the full §3 recompute — script it (OKLCH → linear sRGB → WCAG
2.1; ~60 lines), because **the composite pairs fail first**: both executed
rebrands' only failures were destructive text over its own tint and over
the input fill. Fix tokens, never document a failure.

## The render-prop hydration hazard

A JSX element passed to a Base UI `render` prop from a Server Component
crosses the Flight boundary as a _lazy_ element: any prop set on **both**
the component and its render element resolves render-element-wins on the
server and component-wins on the client — a guaranteed hydration mismatch
(this shipped as a real pagination defect). Contract: never set the same
prop (including `data-slot`) on both sides; wrappers stamp their default
`data-slot` only when rendering their default element (Button is the
reference). Full mechanics: `docs/UI_LIBRARY.md` §7.

## Quality gates

`format:check` → `lint` → `typecheck` → `test` (Vitest) → `build` →
`test:e2e` (Playwright: console-cleanliness matrix over every route × theme
× direction, axe WCAG A/AA, font-loading assertions, shell operability, the
overflow sweep). All must exit 0. Routes are discovered from `src/app`
(`tests/e2e/routes.ts`) — never hard-code route lists. Remember what each
layer can and cannot prove: only the browser suite sees runtime layout.

## Where the docs live

| Read…                        | When…                                                                |
| ---------------------------- | -------------------------------------------------------------------- |
| `docs/DESIGN_TOKENS.md`      | touching any token, colour, radius, type, focus, or rebranding       |
| `docs/LAYOUT.md`             | pages, shells, measure/rhythm, the main landmark                     |
| `docs/DIRECTION_AND_I18N.md` | fonts, RTL/bidi, direction, locale config                            |
| `docs/UI_LIBRARY.md`         | adding/changing `src/components/ui` primitives                       |
| `docs/DATA_LAYER.md`         | HTTP, query keys, error handling                                     |
| `docs/TESTING.md`            | adding tests or changing the gates                                   |
| `docs/CLONING.md`            | starting a product from this template                                |
| `docs/ROADMAP.md`            | before building anything "missing" — it may be a deliberate omission |
| `DECISIONS.md`               | before adding a dependency                                           |
| `docs/audit/*`               | never as current state — point-in-time snapshots                     |

Next.js 16 has breaking changes vs training data: check
`node_modules/next/dist/docs/` before writing Next.js code (AGENTS.md).

## What this skill does NOT govern

Product/feature architecture, business logic, the data-layer contract's
details, commit/PR conventions, and generic TypeScript/React style (the
lint config owns those). It adds no new rules: it only mirrors what the
docs above already establish — if a convention isn't in those docs, it does
not belong here; change the doc first, then reflect it.
