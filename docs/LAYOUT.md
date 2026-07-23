# Layout

The layout vocabulary: which primitives exist, the contracts they encode
(measure, rhythm), the application shell's guarantees, and what deliberately
stays plain Tailwind. The living demo is `/showcase/layout`; the showcase as
a whole is the reference composition.

## 1. The vocabulary — and what is deliberately not in it

Six primitives, all in `src/components/ui`:

| Primitive                                                          | Owns                                                            |
| ------------------------------------------------------------------ | --------------------------------------------------------------- |
| `Container`                                                        | Page width and horizontal gutter                                |
| `Stack`                                                            | Vertical rhythm (five named gap steps)                          |
| `PageHeader` (+Title, +Description)                                | The page scaffold: breadcrumb + title + description             |
| `AppShell` (+Sidebar, +SidebarTrigger, +Header, +Main)             | Application chrome: sidebar nav / header / main regions         |
| `SiteShell` (+Header, +Nav, +NavItem, +NavTrigger, +Main, +Footer) | Public-site chrome: top bar / main / footer regions             |
| `SkipLink`                                                         | WCAG 2.4.1 bypass block (rendered by both shells automatically) |

Each exists because real use repeated the pattern ad hoc before it did:
`Container` replaced per-page width/gutter, `Stack` replaced scattered
`flex flex-col gap-*`, `PageHeader` replaced two hand-rolled header blocks,
`AppShell` replaced "there is no shell, every product invents one", and
`SiteShell` came out of the first product built on this foundation — a
public site whose top bar, footer, and not-yet-built destinations all had
to be invented from scratch.

**Choosing a shell:** `AppShell` is application chrome — a persistent
sidebar for tool-like, navigation-heavy product surfaces (dashboards,
admin, the showcase itself). `SiteShell` is public-site chrome — a sticky
top bar and footer for marketing/content pages where a sidebar would be
wrong. A product with both kinds of surface mounts each shell in its own
route group's layout (the showcase does exactly this: `(app)` vs
`(site)`). Pages depend on neither — only on `Container`, `Stack`, and
`PageHeader` — so surfaces can move between shells.

**Rejected** (do not add without a demonstrated repeated need):

- **Grid / Row / Inline / Center / Spacer / Box** — one-line Tailwind
  utilities with no decision to encode. Wrapping flex and grid in components
  adds indirection, not consistency. Horizontal layout, grids, and one-off
  alignment are Tailwind's job.
- **A Prose/Text component** — measure is a token (`max-w-prose`), not a
  wrapper; typography is the ramp (`text-*` utilities).
- **Section** — only the showcase has proven a titled-section pattern;
  `ShowcaseSection` stays feature-local until a second real consumer exists.
- **PageHeader actions slot, tabs row, metadata row** — no repeated pattern
  yet; compose them at the call site until there is one.

## 2. Content measure

A block of content makes **exactly one of three width decisions** — through
the token layer, never an ad-hoc `max-w-*`:

| Decision   | Utility       | Token (`src/styles/theme.css`) | Use for                                                   |
| ---------- | ------------- | ------------------------------ | --------------------------------------------------------- |
| Prose      | `max-w-prose` | `--container-prose: 65ch`      | Running text: descriptions, paragraphs, documentation     |
| Form       | `max-w-form`  | `--container-form: 28rem`      | Single-column forms and narrow interactive surfaces       |
| Full width | _(none)_      | —                              | Dense data: tables, card grids, dashboards — never capped |

Rationale: prose reads best at 45–75 characters per line; `ch` keeps the
measure character-based so it follows the element's own font size (larger
text → proportionally wider column) and measures Arabic against its own
glyphs. Wide inputs are harder to scan, so forms cap at `28rem`. Dense data
surfaces gain nothing from a cap — they take the full `Container` width,
which is the fourth and outermost width decision and is made once per
layout, not per page.

**The Container cap is `max-w-6xl` (1152px)**: wide enough that the dense
surfaces — card grids and tables — reach its edges, while keeping content
comfortably centred with generous side gutters on wide displays (a wider
1280px cap was tried and reverted — it made the layout read loose). It is
NOT a reading measure: prose inside a Container must carry `max-w-prose` —
the wider the container, the easier the measure contract is to violate, so
treat uncapped paragraphs as defects. Gutters are responsive and unaffected
by the cap: `px-4` (16px per side) below `sm`, `px-6` (24px) from `sm` up;
the cap only engages once the viewport exceeds 1152px + gutters, so phone
and tablet edges are untouched.

Both utilities are `max-width` — a logical, direction-agnostic constraint;
nothing direction-specific is needed for RTL.

## 3. Vertical rhythm

Rhythm is a five-step named scale, not a per-component `gap-*` guess. The
steps live in `stackVariants` (`src/components/ui/stack.tsx`) and are named
for the **relationship between siblings**:

| Step | Gap      | Relationship                                          |
| ---- | -------- | ----------------------------------------------------- |
| `xs` | `gap-1`  | Lines of one text lockup (title + description)        |
| `sm` | `gap-2`  | Tightly related items: label clusters, control groups |
| `md` | `gap-4`  | Sibling blocks within one section (the default)       |
| `lg` | `gap-8`  | Distinct groups of blocks inside a section            |
| `xl` | `gap-12` | Page-level sections                                   |

Use `<Stack gap="…">` for generic blocks; for semantic elements apply
`stackVariants({ gap })` to the element directly (see `ShowcaseSection`).
Values sit on Tailwind's default spacing scale — spacing itself remains
Tailwind's contract (`docs/DESIGN_TOKENS.md`); the scale adds names, not new
tokens. Row gaps (`flex gap-*` on horizontal clusters) stay plain Tailwind.

Rhythm is `column-gap`-free and therefore identical in LTR and RTL; the
`[dir="rtl"]` line-height compensation in the type ramp is independent of it
and continues to apply.

## 4. Page scaffold — PageHeader

```tsx
<PageHeader>
  <Breadcrumb>…</Breadcrumb> {/* optional, caller-composed */}
  <PageHeaderTitle>Title</PageHeaderTitle> {/* the page's single h1, text-heading */}
  <PageHeaderDescription>…</PageHeaderDescription> {/* prose measure, muted */}
</PageHeader>
```

The primitive owns the scaffold's rhythm (breadcrumb → lockup) and the
description's measure. Slots compose in reading order; anything a page does
not need is simply omitted. The showcase binds its breadcrumb root once in
`ShowcasePageHeader` (feature layer) — a product does the same with its own
breadcrumb source.

## 5. Application shell

```tsx
<AppShell>
  <AppShellSidebar label="…">{/* navigation content */}</AppShellSidebar>
  <AppShellHeader>
    <AppShellSidebarTrigger />
    {/* header content */}
  </AppShellHeader>
  <AppShellMain>{/* page content */}</AppShellMain>
</AppShell>
```

### Structure and scrolling

A CSS grid: sidebar column (`auto`) + content column (`1fr`), header row
(`auto`) + main row (`1fr`). The **document itself scrolls** — native scroll
restoration and anchor behavior are preserved; there is no nested scroll
container for content. The sidebar is sticky, full-height, and independently
scrollable; the header is sticky at `z-40` (below the overlay layer's
`z-50`). Both shells' headers stand at `h-16` (64px); `globals.css` reserves
that height as `scroll-padding-block-start` on `html`, so anchor jumps and
programmatic focus land below the sticky bar rather than behind it — the two
values are a hand-kept matched pair.

**The header boundary is scroll-dependent** (both shells): at scroll
position zero the bar has no bottom hairline — bar and page read as one
surface; once the page scrolls, the hairline appears so content passing
under the bar reads as designed, not as a rendering bug. Mechanism: an
IntersectionObserver on a 1px sentinel at the document top
(`src/hooks/use-scrolled.ts`) toggles `data-scrolled` on the header — no
scroll listener (fires only when the boundary is crossed, no per-frame
work), no layout shift (the border is always present, only its color
changes), and the header's box never changes, so nothing that depends on
its height moves. The color transition runs on the motion tokens and
collapses under `prefers-reduced-motion` via the global rule. Without
IntersectionObserver (jsdom, ancient browsers) the boundary degrades to
always-visible — the pre-existing behavior.

### Responsive behavior

Above `md` the sidebar is persistent. Below `md` it collapses into a
**modal drawer** anchored at the inline start, opened by
`AppShellSidebarTrigger` (visible only below `md`; place it in the header).
The drawer was chosen over alternatives because navigation length is
unknown to the foundation (rules out bottom bars), and it is built on the
existing Base UI Dialog — focus trap, Escape, backdrop dismissal, scroll
lock, and focus restoration come from an already-shipped dependency. The
drawer closes itself on route navigation and when the viewport grows past
`md` (via `BREAKPOINTS.md` from `src/theme` — the sanctioned TS breakpoint
mirror).

Sidebar children render in both the persistent sidebar and the drawer, so
navigation content must not rely on unique DOM ids.

### Accessibility guarantees

- A `SkipLink` targeting `AppShellMain` (`#main-content`, `tabindex="-1"`)
  is **always the first focusable element**; activation moves focus
  programmatically.
- Landmarks: `nav` (labelled via `label`), `banner` (header), `main`.
- The drawer is a labelled modal `dialog`: focus moves inside on open, is
  trapped while open, and returns to the trigger on close; the trigger
  carries `aria-haspopup`/`aria-expanded`; background content is hidden
  from assistive technology while open.
- All English defaults (`skipLinkLabel`, `label`, `closeLabel`, the
  trigger's `aria-label`) are props — localize at the call site.

### Direction

Grid order, `border-e`, and the drawer's `start-0` edge are logical; the
shell mirrors under `dir="rtl"` with zero conditional logic. The showcase
pins its header `dir="ltr"` as an inspection-panel exception
(`docs/DIRECTION_AND_I18N.md`); product headers should mirror.

### Restyling or replacing the shell

The shell is structural, not designed: no brand slot, no user menu, no
collapse-to-icons — products own that. Restyle via the `sidebar-*` color
tokens (`docs/DESIGN_TOKENS.md`; the sidebar and drawer consume `sidebar`,
`sidebar-foreground`, `sidebar-border` implicitly through `border-e`, and
navigation content typically uses `sidebar-accent`/`sidebar-accent-foreground`
for hover/active states, as `ShowcaseNav` does) and `className` on every
part. To replace it entirely, keep three invariants: a skip link first, the
three landmarks, and a focus-managed disclosure for collapsed navigation —
pages depend only on `Container`, `Stack`, and `PageHeader`, never on the
shell.

## 6. Site shell

```tsx
<SiteShell collapseBelow="md">
  <SiteShellHeader>
    {/* brand slot: any element, e.g. <Link href="/">Acme</Link> */}
    <SiteShellNav label="…">
      <SiteShellNavItem href="/products">Products</SiteShellNavItem>
      <SiteShellNavItem>Pricing</SiteShellNavItem> {/* no href yet */}
    </SiteShellNav>
    {/* actions slot: typically `ms-auto` cluster + <SiteShellNavTrigger /> */}
  </SiteShellHeader>
  <SiteShellMain>{/* page content */}</SiteShellMain>
  <SiteShellFooter>{/* link columns: plain Tailwind grid */}</SiteShellFooter>
</SiteShell>
```

Live demo: `/showcase/site` (`src/app/showcase/(site)/site/layout.tsx` is
the reference composition).

### Structure and slots

A `min-h-dvh` flex column; the **document itself scrolls**. The header is
sticky at `z-40` and caps its row with `Container`; its three slots —
brand, navigation, actions — are ordinary children composed in reading
order. The footer is a `contentinfo` landmark whose grouped link columns
stay a plain Tailwind grid at the call site (no Grid wrapper — see the
rejected list above). The shell consumes the base
background/border/accent tokens; the `sidebar-*` set belongs to
application chrome.

**Hierarchy: the brand dominates the bar.** Give the brand real presence
as its own cluster — the demo runs `text-subheading` bold (two steps above
the nav) with a larger mark and clear breathing room (`me-4`) before
navigation begins. Nav items are secondary wayfinding at `text-small`,
medium weight, on a three-step ladder that inverts the usual "light up on
hover":

- **idle** → `text-foreground` + `font-medium`, _lightening_ to
  `text-muted-foreground` on hover (the item recedes under the cursor).
  Medium, not normal: a primary interactive element should not read as
  thin at 14px.
- **current** → `text-foreground` + `font-bold` (`aria-current`).
  Because idle links already sit at full foreground strength, color cannot
  carry current — **weight does**, and weight (unlike an underline) does
  not fight a dropdown menu opening beneath the item. Current is bold, not
  semibold, so the gap over a medium idle stays the same 200-unit step the
  ladder was designed around (medium-vs-semibold alone was too subtle to
  mark current unambiguously).
- **unavailable** → `text-muted-foreground` + `font-normal`, muted at rest
  so it reads distinct from a full-strength idle link.

Hover is color-only — no growing underline or moving element — precisely
so a nav item can later host a dropdown trigger without the affordance
fighting the menu. The same scroll-dependent header boundary as the
AppShell applies (§5).

**Actions below the collapse line** are the caller's decision, made by
measuring (same rule as the breakpoint): if the compact action set fits
beside the brand at your smallest supported width, keep it in the bar;
when it does not (the demo's brand + auth pair overflow 320px), move the
actions into the drawer as plain nav items and hide the bar copy below
that width — the drawer already carries the navigation there.

### The collapse breakpoint is a prop — measure, don't assume

Below `collapseBelow` (a Tailwind screen: `sm`/`md`/`lg`/`xl`, default
`md`) the navigation moves into a modal drawer with the same Base UI
Dialog mechanics and guarantees as the AppShell drawer (focus trap,
Escape, backdrop, focus return, close on navigation and on crossing the
breakpoint). The breakpoint is deliberately configurable because **no
default can be correct**: whether the bar fits depends on how wide _your_
brand + items + actions render, in every locale you ship — the first
product built on this foundation shipped a bar that overflowed at every
width while its build stayed green. Measure your bar's real content and
pick the smallest screen it fits; the browser suite's overflow sweep
(`tests/e2e/overflow.spec.ts`) fails when the choice is wrong.

### Unavailable destinations and actions

The honesty rule — **never present something as available when it is
not** — has two treatments, split by the _shape_ of the affordance.

**A destination without a page renders as non-interactive text.** A
`SiteShellNavItem` without `href` is non-interactive, non-focusable muted
text carrying an sr-only availability hint (`unavailableLabel`, localize at
the call site) — never a dead link, never a 404. A link's whole contract is
"activate me to go somewhere"; with nowhere to go, the correct move is to
_stop looking like a link_. Every new product has unbuilt destinations on
day one; this is the sanctioned way to show them. Adding `href` later turns
the same item into a real link with `aria-current` handling. The pattern
works in the bar, the drawer, and (with padding overridden) footer columns.

**An action-shaped affordance stays interactive and explains itself.** A
button's contract is "activate me to _do_ something", and a control that
looks interactive must behave interactively — a `pointer-events-none`
button is the exact "dead button" a reviewer rightly flags. So a demo or
pre-launch "Log in" / "Get started" is a **real** `<button>` with full
hover / active / focus states that, on activation, explains its
unavailability (the showcase's `UnavailableCta` toasts a message). The
no-dead-ends guarantee is preserved by the _explanation_, not by removing
interactivity — and the button still renders at real widths, so the
collapse-breakpoint measurement stays honest. Never fake it with a styled
non-interactive `<span>`: that reproduces the dead-button problem this rule
exists to prevent.

### Accessibility and direction

Same guarantees as the AppShell: a built-in `SkipLink` targeting
`SiteShellMain` is always the first focusable element; landmarks are
`banner` / `nav` / `main` / `contentinfo`; all English defaults
(`skipLinkLabel`, `label`, `closeLabel`, `unavailableLabel`, the trigger's
`aria-label`) are props; everything is logical-property based, so the
shell mirrors under `dir="rtl"` with zero conditional logic. Nav children
render in both the bar and the drawer, so navigation content must not rely
on unique DOM ids.

## 7. The main landmark

**Layouts own `<main>`; pages never render it.** Exactly one `main` per
page, and its owner is the layout that provides the chrome:

- Shell-wrapped segments get it from `AppShellMain` / `SiteShellMain` in
  the segment layout (`src/app/showcase/(app)/layout.tsx`,
  `src/app/showcase/(site)/site/layout.tsx`).
- Bare segments get it from a route-group layout — `src/app/(home)/layout.tsx`
  is the reference.
- Root boundary files (`not-found.tsx`, `error.tsx`, `global-error.tsx`)
  are the one sanctioned exception: they render with the segment layouts
  gone (or replace the document entirely), so each owns its own `<main>`.

The rule exists because without an owner every page reinvents the
landmark — and a page later moved inside a shell ships a nested duplicate
`main`, which is an axe failure and a screen-reader trap.

## 8. Testing

`src/components/ui/app-shell.test.tsx` and `site-shell.test.tsx` pin the
shells' keyboard/focus contracts (landmarks, skip link, drawer
open/close/focus-return, and for SiteShell the unavailable-item
non-focusability) at the component level; `tests/e2e/shell.spec.ts` proves
both shells' responsive navigation and skip links are operable in a real
browser against the production build, at mobile and desktop widths.
`tests/e2e/overflow.spec.ts` sweeps every discovered route across the
viewport range in both directions, failing on page-level horizontal
scroll or a shell bar overflowing its own box. The console, a11y, and
font matrices cover every shell-wrapped route automatically via route
discovery.
