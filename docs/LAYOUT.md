# Layout

The layout vocabulary: which primitives exist, the contracts they encode
(measure, rhythm), the application shell's guarantees, and what deliberately
stays plain Tailwind. The living demo is `/showcase/layout`; the showcase as
a whole is the reference composition.

## 1. The vocabulary — and what is deliberately not in it

Five primitives, all in `src/components/ui`:

| Primitive                                              | Owns                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| `Container`                                            | Page width and horizontal gutter                             |
| `Stack`                                                | Vertical rhythm (five named gap steps)                       |
| `PageHeader` (+Title, +Description)                    | The page scaffold: breadcrumb + title + description          |
| `AppShell` (+Sidebar, +SidebarTrigger, +Header, +Main) | Application chrome: nav / header / main regions              |
| `SkipLink`                                             | WCAG 2.4.1 bypass block (rendered by AppShell automatically) |

Each exists because the showcase repeated the pattern ad hoc before it did:
`Container` replaced per-page width/gutter, `Stack` replaced scattered
`flex flex-col gap-*`, `PageHeader` replaced two hand-rolled header blocks,
and the shell replaced "there is no shell, every product invents one".

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
surfaces gain nothing from a cap — they take the full `Container` width
(`max-w-6xl` + gutter), which is the fourth and outermost width decision and
is made once per layout, not per page.

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
`z-50`).

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

## 6. Testing

`src/components/ui/app-shell.test.tsx` pins the keyboard/focus contract
(landmarks, skip link, drawer open/close/focus-return) at the component
level; `tests/e2e/shell.spec.ts` proves the responsive navigation and skip
link are operable in a real browser against the production build, at both
mobile and desktop widths. The console, a11y, and font matrices cover every
shell-wrapped route automatically via route discovery.
