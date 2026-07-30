# Design Tokens

The complete token contract for this foundation: architecture, reference, verified
contrast, and the rebranding procedure. The living demo is `/showcase/tokens`.

## 1. Architecture

CSS custom properties are the **single source of truth** for every themable design
decision. There is deliberately no TypeScript mirror of any CSS token.

| Layer           | File                                           | Role                                                                                                                                                                            |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme-neutral   | `src/styles/base.css`                          | Values identical in both themes (`--radius-base`).                                                                                                                              |
| Per-theme       | `src/styles/light.css` / `src/styles/dark.css` | Semantic `--color-*` and `--elevation-*` values. Full token parity is mandatory.                                                                                                |
| Bridge          | `src/styles/theme.css`                         | Maps semantic variables into Tailwind v4 `@theme inline` and shadcn/ui names; holds the theme-neutral type ramp (`@theme`).                                                     |
| TS escape hatch | `src/theme/breakpoints.ts`                     | Breakpoints only — media queries and `matchMedia` cannot read custom properties, so this is the one sanctioned TS token file. Its values must equal Tailwind's default screens. |

Import order (`src/styles/index.css`): base → light → dark → theme.

**Spacing is Tailwind's default scale.** The foundation adds no spacing tokens:
Tailwind v4's `--spacing`-multiplier scale (0.25rem steps) is the spacing contract.
Vertical rhythm is a named five-step scale over that spacing contract, owned by
the Stack primitive (`docs/LAYOUT.md`) — names, not new tokens. Motion, by
contrast, IS tokenized (two durations, one easing — see § Motion below); raw
`duration-*` numbers in components are drift.

**Content measure** is tokenized (theme-neutral, in `theme.css` `@theme`):
`--container-prose: 65ch` (running text) and `--container-form: 28rem`
(single-column interactive surfaces) generate `max-w-prose` / `max-w-form`.
Tailwind v4 ships no prose container, so these are foundation decisions — the
full contract, including when to use no cap at all, is `docs/LAYOUT.md` §2.

**Stacking:** overlay primitives use the shadcn `z-50` convention; the foundation
defines no z-index tokens.

## 2. Token reference

### Colors (semantic, per theme)

The visual identity follows the approved reference palette: a white canvas and
cool near-white surface ladder in light, a neutral `0.205 → 0.258 → 0.295`
charcoal ladder in dark, blue-black/light-neutral text, cobalt action, and cyan
information signal. Values are copied exactly when the reference role satisfies
the foundation's wider contracts. A value is adjusted only where the exact
reference fails sRGB gamut, WCAG contrast, or an established semantic boundary.

The reference calls cyan `accent`, but on its rendered landing page cyan acts
as a decorative signal. In this foundation `accent` globally owns generic
hover, selected, and disclosure states. Recoloring all of those cyan would
collapse an established distinction, so `accent` is independently authored as
a zero-chroma interaction neutral and cyan maps to `info`. Persistent selected
states that lack another visual cue use the stronger, still-zero-chroma
`accent-selected`; transient hover and expanded states with an open panel keep
the quieter `accent`. `secondary` and `muted` keep their content-surface
responsibilities instead of also owning interaction feedback. Likewise, action
fill and text link have separate semantic tokens: in dark mode no single blue
can contrast 4.5:1 both with a light button foreground and with the lightest
charcoal card.

| Token                                | Light                             | Dark                              |
| ------------------------------------ | --------------------------------- | --------------------------------- |
| `--color-background`                 | `oklch(1 0 0)`                    | `oklch(0.205 0 0)`                |
| `--color-foreground`                 | `oklch(0.21 0.04 265)`            | `oklch(0.96 0 0)`                 |
| `--color-surface`                    | `oklch(0.985 0.005 250)`          | `oklch(0.258 0 0)`                |
| `--color-surface-foreground`         | `var(--color-foreground)`         | `var(--color-foreground)`         |
| `--color-card`                       | `oklch(1 0 0)`                    | `oklch(0.295 0 0)`                |
| `--color-card-foreground`            | `var(--color-foreground)`         | `var(--color-foreground)`         |
| `--color-popover`                    | `oklch(1 0 0)`                    | `oklch(0.295 0 0)`                |
| `--color-popover-foreground`         | `var(--color-foreground)`         | `var(--color-foreground)`         |
| `--color-primary`                    | `oklch(0.572 0.19 256)`           | `oklch(0.572 0.19 256)`           |
| `--color-primary-hover`              | `oklch(0.544 0.18 256)`           | `oklch(0.544 0.18 256)`           |
| `--color-primary-foreground`         | `oklch(1 0 0)`                    | `oklch(1 0 0)`                    |
| `--color-link`                       | `oklch(0.56 0.18 256)`            | `oklch(0.68 0.145 256)`           |
| `--color-secondary`                  | `oklch(0.97 0.008 250)`           | `oklch(0.258 0 0)`                |
| `--color-secondary-foreground`       | `var(--color-foreground)`         | `var(--color-foreground)`         |
| `--color-muted`                      | `oklch(0.97 0.008 250)`           | `oklch(0.258 0 0)`                |
| `--color-muted-foreground`           | `oklch(0.5 0.02 260)`             | `oklch(0.78 0 0)`                 |
| `--color-accent`                     | `oklch(0.96 0 0)`                 | `oklch(0.34 0 0)`                 |
| `--color-accent-selected`            | `oklch(0.92 0 0)`                 | `oklch(0.39 0 0)`                 |
| `--color-accent-foreground`          | `var(--color-foreground)`         | `var(--color-foreground)`         |
| `--color-info`                       | `oklch(0.52 0.101 231)`           | `oklch(0.72 0.14 231)`            |
| `--color-info-foreground`            | `oklch(1 0 0)`                    | `oklch(0.15 0 0)`                 |
| `--color-success`                    | `oklch(0.52 0.12 155)`            | `oklch(0.7 0.13 155)`             |
| `--color-success-foreground`         | `oklch(0.985 0.005 155)`          | `oklch(0.145 0.01 155)`           |
| `--color-warning`                    | `oklch(0.82 0.14 80)`             | `oklch(0.8 0.13 80)`              |
| `--color-warning-foreground`         | `oklch(0.28 0.05 80)`             | `oklch(0.15 0.012 80)`            |
| `--color-destructive`                | `oklch(0.516 0.21 27)`            | `oklch(0.766 0.138 27)`           |
| `--color-destructive-foreground`     | `oklch(1 0 0)`                    | `oklch(0.15 0.01 25)`             |
| `--color-border`                     | `oklch(0.93 0.01 255)`            | `oklch(0.355 0 0)`                |
| `--color-input`                      | `oklch(0.658 0.01 255)`           | `oklch(0.57 0 0)`                 |
| `--color-ring`                       | `oklch(0.589 0.17 256)`           | `oklch(0.665 0.15 256)`           |
| `--color-chart-1`                    | `oklch(0.55 0.15 262)`            | `oklch(0.68 0.13 262)`            |
| `--color-chart-2`                    | `oklch(0.62 0.1 195)`             | `oklch(0.7 0.11 195)`             |
| `--color-chart-3`                    | `oklch(0.6 0.12 155)`             | `oklch(0.72 0.12 155)`            |
| `--color-chart-4`                    | `oklch(0.75 0.13 85)`             | `oklch(0.8 0.12 85)`              |
| `--color-chart-5`                    | `oklch(0.58 0.15 25)`             | `oklch(0.68 0.14 25)`             |
| `--color-sidebar`                    | `var(--color-background)`         | `var(--color-background)`         |
| `--color-sidebar-foreground`         | `var(--color-foreground)`         | `var(--color-foreground)`         |
| `--color-sidebar-primary`            | `var(--color-primary)`            | `var(--color-primary)`            |
| `--color-sidebar-primary-foreground` | `var(--color-primary-foreground)` | `var(--color-primary-foreground)` |
| `--color-sidebar-accent`             | `var(--color-accent)`             | `var(--color-accent)`             |
| `--color-sidebar-accent-foreground`  | `var(--color-accent-foreground)`  | `var(--color-accent-foreground)`  |
| `--color-sidebar-border`             | `var(--color-border)`             | `var(--color-border)`             |
| `--color-sidebar-ring`               | `var(--color-ring)`               | `var(--color-ring)`               |
| `--color-overlay`                    | `oklch(0 0 0 / 0.8)`              | `oklch(0 0 0 / 0.8)`              |

Design notes:

- **Primary is a bright filled-action blue.** Its hue moves from the former
  violet-leaning cobalt (`262–263`) to `256`, with a cleaner sky-blue character
  while remaining 25° from cyan `info` at `231`. Resting primary is deliberately
  near the maximum that lets white text clear AA. Hover uses its own opaque,
  slightly darker `primary-hover` token; it never alpha-composites toward the
  underlying canvas. The brighter exact reference values (`0.585` light,
  `0.62` dark) cannot retain 4.5:1 with white.
- **Link is a semantic role, not a raw blue scale.** It preserves more of the
  brand blue than the action fill while meeting 4.5:1 on every canvas,
  surface, card, and popover. Button/Badge link variants and field-help links
  consume `text-link`.
- **Info is cyan, not another action color.** It is available as a semantic
  fill/foreground pair and as readable text on a restrained `/10` tint. It
  does not create an `info` component variant; components earn variants from
  repeated semantic behavior, not from the existence of a color role.
- **Accent is an independent neutral interaction plane.** Transient hover,
  focus, and expanded disclosure states use exact zero-chroma values (`0.96`
  light, `0.34` dark). Persistent selection without another visible cue uses
  `accent-selected` (`0.92` light, `0.39` dark), whose source-level contract
  remains at least 1.2:1 against background, surface, and card. Showcase current
  navigation and selected table rows consume that stronger plane. SiteShell
  current menu items instead use bold weight, while expanded buttons keep the
  quiet plane because the open panel/dialog/drawer is the independent cue. No
  neutral interaction borrows cyan, brand blue, or the slightly cool content
  surfaces. `sidebar-accent` aliases the transient token so sidebar hover
  follows the same rule without a duplicate value.
- **`chart-1` remains an independent data color.** Its historical indigo is
  preserved because the reference authors no chart palette. Neither token is
  a color scale or a source for the other.
- **Surfaces preserve the reference ladder.** Light background/card/popover
  are white and `surface` is the cool near-white section plane. Dark uses
  background `0.205`, surface/secondary/muted `0.258`, and card/popover
  `0.295`. `card` is now a distinct semantic token rather than an alias of
  surface because the reference distinction is visible and reusable.
- **Status colors retain their semantic duties.** The reference authors only
  destructive. Its exact red fails the foundation's fill, text, tint, input,
  and gamut checks, so the adopted red is the closest valid alternative per
  theme. Existing success/warning and chart colors remain unchanged because
  no reference value exists to migrate.
- **`--color-border` is the structural hairline of the flat system** —
  decorative in WCAG terms (it conveys structure, not meaning), so 1.4.11
  does not apply to it. The exact reference values (`0.93 0.01 255` light,
  `0.355 0 0` dark) are retained. **`--color-input` is a control boundary**
  and is moved to the closest 3:1 value against every surface. `--color-ring`
  stays a lighter expression of brand blue than the darker action fill and is
  adjusted only enough to remain 3:1 on the composited input fill. Which token a
  control's edge takes turns on 1.4.11's "**required to identify**" test, not
  on whether it is a control: an **empty** field (input, textarea) has nothing
  but its edge to announce it, so that edge is required and uses `input`; a
  **labelled** control (an outline button) is identified by its text, so its
  border is decorative and uses the `border` hairline in both themes — a dark
  outline button on the 3:1 `input` band reads as a lit edge, not a quiet one.

**Overlay is semantic.** The reference `black/80` scrim is adopted exactly as
`--color-overlay` and exposed as `bg-overlay`; Dialog and AlertDialog no longer
carry the former component-level `bg-black/10` exception. Backdrop blur and all
overlay behavior remain unchanged.

### Text colour: body vs secondary

`foreground` is the default ink; `muted-foreground` is a **demotion**, not the
house body colour. The reference likewise reserves grey for genuinely
subordinate text. Body copy stays on `foreground`; the automated contract keeps
muted text at 4.5:1 or better on every supported surface:

**Earns `foreground` (body copy — text a reader reads _as content_):**

- Page and section lead descriptions (`PageHeaderDescription`,
  `ShowcaseSection` description) — the heading above is a short _name_, the
  description is the substantive prose.
- Hero leads and standfirst paragraphs.
- Running prose paragraphs and content lists in the document flow.
- The primary content of a widget (e.g. `TabsContent` body) — the panel _is_
  the content, not chrome.

**Stays `muted-foreground` (genuinely secondary — text that _labels,
annotates, or demotes_):**

- Captions and metadata: token/value annotations, code labels, timestamps,
  counts, `dt` terms, avatar fallbacks, table captions.
- Control-attached microcopy: field descriptions / help text
  (`FieldDescription`), placeholders.
- Compact widget descriptions where a title carries the message and the
  paragraph elaborates inside a contained surface: `CardDescription`,
  `DialogDescription`, `AlertDialogDescription`, empty-state secondary lines,
  the error/`not-found` elaboration under the bold title, query-error detail.
- Secondary navigation and de-emphasised affordances: breadcrumb trails, footer
  link columns, the idle→hover recede on nav.

**The tie-breaker** when a paragraph sits inside a bordered/contained widget:
if it is that widget's _supporting_ text next to a title that carries the
message, it stays muted; if it is the widget's _primary_ content, it is
foreground. A `*Description` **slot in a primitive** (Card/Dialog/AlertDialog/
Field) is muted _by contract_ — a consumer who needs body-contrast text puts it
in the content slot, not the description. `PageHeaderDescription` is the
deliberate exception: it is definitionally the page's lead prose, so it is
foreground.

### Cross-theme perception (same design, different numbers)

The two themes preserve the reference's different material models rather than
forcing numeric symmetry. Light uses a nearly flat white ladder; dark uses
three visible charcoal planes. Generic interaction steps down to a light-gray
`0.96` plane in light and up to an elevated-neutral `0.34` plane in dark;
persistent selection without another cue advances one step further to `0.92`
light / `0.39` dark. All four values have zero chroma. Primary fill stays
medium/deep cobalt in both, while link and ring move lighter where their
context requires contrast. Input
boundaries move away from the exact quiet border in opposite directions to
clear 3:1. Muted text is darker than the canvas in light and lighter than the
canvas in dark. The rule for future changes is semantic parity and comparable
prominence, not identical OKLCH coordinates.

### Elevation (`--elevation-*`, per theme)

Bridged to Tailwind as `shadow-xs | sm | md | lg | xl` — these five are the
elevation contract; avoid other shadow utilities.

**The system is flat: elevation means "floats above the plane", nothing
else.** In-plane surfaces (cards, wells, pressed states) are structured by
hairline borders in light and by the lightness ladder plus hairlines in
dark — never by shadows.

- **`xs` and `sm` are empty in both themes** (`0 0 0 0` transparent) by
  design: components that historically carried a resting shadow render
  flat, with borders doing the structural work. They remain in the contract
  so component code and the shadcn conventions keep working unchanged.
- **`md`** — dropdowns, popovers, tooltips: the first level that actually
  floats. **`lg`** — dialogs and drawers. **`xl`** — the largest overlays.
- **Light** shadows are soft blue-black ink washes
  (`oklch(0.21 0.04 265 / 0.05–0.13)`) with no hard key lines; **dark**
  shadows are heavier blacks (`oklch(0 0 0 / 0.4–0.55)`) that only ground
  floating layers against the mid-dark behind them.

### Type ramp (`--text-*`, theme-neutral, in `theme.css`)

Generates `text-<step>` utilities carrying size, line-height, letter-spacing, and
weight together. Display/title retain the large marketing voice; the shared
Latin product/UI roles map the approved reference's authored Inter hierarchy.
`body` is also the document default. Tajawal keeps its independently reviewed
compact metrics through `[dir="rtl"]` overrides; the two scripts deliberately do
not share numeric sizes merely for symmetry.

| Step         | Size      | Line-height | Letter-spacing | Weight |
| ------------ | --------- | ----------- | -------------- | ------ |
| `display`    | 3.5rem    | 1.05        | −0.025em       | 800    |
| `title`      | 2.25rem   | 1.12        | −0.025em       | 800    |
| `heading`    | 1.5rem    | 1.2         | −0.025em       | 700    |
| `subheading` | 1.125rem  | 1.35        | 0              | 600    |
| `body-lg`    | 1.125rem  | 1.625       | 0              | 500    |
| `body`       | 1rem      | 1.5         | 0              | 500    |
| `small`      | 0.875rem  | 1.45        | 0              | 500    |
| `supporting` | 0.8125rem | 1.45        | 0              | 500    |
| `caption`    | 0.75rem   | 1.35        | +0.01em        | 500    |

For Latin, the reference-aligned sizes and leading remain unchanged while the
foundation's final visual-weight review sets body and supporting copy to 500.
UI labels, navigation, compact titles, and controls use 600 through their
component contracts. Page headings are 24px/700 and section headings 18px/600. The
foundation's marketing `display`/`title` sizes remain unchanged, while
`body-lg` remains the 18px lead role with relaxed 1.625 leading and weight 500.

For Arabic, the approved Tajawal sizes are unchanged: body 15px, supporting
13px, and lead 17px, with the existing RTL-specific leading and zero tracking.
The same semantic hierarchy applies—body/supporting 500, UI 600, current 700—
without mirroring Latin line-height numbers blindly.

At `text-display`'s size, long single words can exceed a 320px viewport —
pair it with a smaller step below `sm` (`text-title sm:text-display`, as
the home page does) when the copy is not under your control.

**The bilingual families are Inter and Tajawal.** Inter is the Latin identity
face (`next/font/google`, exact authored weights 400/500/600/700/800, Latin subset). Tajawal
is the Arabic companion (`next/font/local`, Arabic-only 400/500/700/800 WOFF2
subsets). Both are self-hosted by the built application; no browser request is
made to an external font service.

The shared `--font-sans` stack is script-aware: Tajawal comes first but contains
and declares only Arabic code points, so Latin letters and Western numerals
fall through to Inter. This is deliberate. Loading Tajawal's complete Google
family would also expose its Latin glyphs and make mixed-language text render
Latin in the wrong identity face.

**There is deliberately no `--font-heading`.** Each script uses one family for
headings and body; the heading voice comes from weight and negative tracking in
the ramp. Inter provides every authored semantic weight.
Tajawal does not publish a 600 face, so the project loads its available contract
weights (400, 500, 700, 800); an authored 600 request remains 600 in CSS and
resolves to the nearest available 700 face. Do not change component weights or
the type scale to hide that family constraint. **Geist Mono remains the code
face** (`--font-mono`) as an independent decision.

The system fallback tail is `ui-sans-serif, system-ui, sans-serif`. Tajawal's
own metric fallback is intentionally disabled because its Arial source contains
Arabic glyphs and can intercept the intended face. Full loading, preload, and
mixed-script behavior: `docs/DIRECTION_AND_I18N.md`.

### Type hierarchy (how a page leads the eye)

Hierarchy is carried by **size, weight, and space — never by tone.** This is a
system decision, recorded here so pages do not each re-invent it, and it is the
direct consequence of "Body vs secondary text" above: once running prose is all
`foreground`, colour can no longer separate a standfirst from body from a list,
so the ramp and rhythm must. The reference does the same — its headings are far
larger relative to body than a greyed-body system needs them to be.

The prose/heading **roles** and the ramp step each maps to:

| Role                            | Ramp step                              | Notes                                                                                         |
| ------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------- |
| Hero / page display             | `display` / `title`                    | the largest voice; heroes lead the viewport                                                   |
| Page title                      | `heading` (1.5rem/700)                 | `PageHeaderTitle`; compact but clearly above section headings                                 |
| Section heading                 | `subheading` (1.125rem/600)            | section landmarks and small titles                                                            |
| **Lead paragraph / standfirst** | `body-lg` (Latin 1.125rem/500)         | the first paragraph under a page title or hero; `PageHeaderDescription` and hero leads use it |
| Body / default UI               | `body` (Latin 1rem = 16px / 500)       | important running prose and the inherited document default; stays on `foreground`             |
| Secondary / annotative          | `small` / `caption`, usually **muted** | 14px/500 descriptions and metadata; RTL retains its 13px size; 12px/500 captions              |
| Compact title support           | `supporting`                           | 13px/500 explanatory copy beneath 14px/600 menu titles; 1.45 Latin leading, 1.6 RTL leading   |

The density rule is role-based: page/hero standfirst remains one step above
body; ordinary section, card, dialog, form-help, and table-caption descriptions
use `small`; compact menu explanations use `supporting`. Do not shrink those
consumers individually. Likewise, a title that needs more authority uses
600/700 rather than restoring a larger font size.

### Weight scale

The active semantic hierarchy uses four weights. The families still load 400
because it belongs to their authored contract, but no default body role relies
on it:

| Weight | Role                      | Where it is used                                                                    |
| ------ | ------------------------- | ----------------------------------------------------------------------------------- |
| 800    | Ramp display voice        | `text-display`, `text-title` — the heavy headline tier                              |
| 700    | Ramp heading / bold       | `text-heading`; also the component "bold" (brand lockups, `aria-current` nav item)  |
| 600    | UI / small-title emphasis | controls, navigation, labels, `text-subheading`, card/dialog titles, table headers  |
| 500    | Body / supporting         | prose, descriptions, table data, help text, metadata, captions, unavailable items   |
| 400    | Loaded family baseline    | available for deliberate local exceptions; not the default body or explanation role |

**Body weight is 500 in both scripts.** Important prose stays on `foreground`.
Descriptions, help text, metadata, captions, and unavailable destinations use
the same practical weight on `muted-foreground`; color and size preserve their
secondary status without making their strokes faint. Normal body copy never
uses 700.

**The ramp uses weight as an optical function of role**: body/supporting 500 →
UI, navigation, and compact titles 600 → persistent/current titles and headings
700 → display/title 800. Each ramp weight is owned by its semantic role, not
treated as a free choice.

Components use 500 for body and supporting copy, 600 for controls, labels,
ordinary navigation, compact titles, and table headers, and 700 for persistent
current titles or stronger headings. Weight 800 remains display-only.

### Radius

`--radius-base: 0.5rem` (8px) in `base.css` (theme-neutral) — the flat
identity's crisp, deliberate radius: rounded enough to read as designed,
tight enough to read as flat. Settled by iteration across the 2026-07
passes: 10px read soft on h-8 controls (most visibly inputs and
textareas), 6px read severe; 8px does neither. Every `rounded-*` step in
the bridge derives from it by multiplication:

| Step  | Multiplier | Px  | Used by                                |
| ----- | ---------- | --- | -------------------------------------- |
| `sm`  | ×0.5       | 4   | smallest nested elements               |
| `md`  | ×0.75      | 6   | nested elements (toggle items, badges) |
| `lg`  | ×1         | 8   | controls (inputs, textareas)           |
| `xl`  | ×1.5       | 12  | surfaces (cards, dialogs)              |
| `2xl` | ×2         | 16  | —                                      |
| `3xl` | ×2.5       | 20  | —                                      |
| `4xl` | ×3         | 24  | —                                      |

Controls generally sit at `lg`, nested elements step down to stay
concentric, and surfaces step up so cards and dialogs stay recognisably
rounded above the tighter controls. Button is the targeted exception:
`rounded-md` resolves to the reference-authored 6px radius without changing
the global 8px base. The Badge is also deliberately `rounded-md`, not the
registry's `rounded-4xl` pill — a full-round badge is a shape decision that
fights this scale.

### Control height

Interactive controls sit on a four-step height scale (the shadcn Button
`size` set; `h-N` = `N × 0.25rem`). Each step has a job, so a control's
height is a role decision, not a per-instance nudge:

| Step      | Height   | For                                                    |
| --------- | -------- | ------------------------------------------------------ |
| `xs`      | h-6 (24) | dense/inline actions — table-row controls, tag removes |
| `sm`      | h-7 (28) | compact toolbars and dense forms                       |
| `default` | h-8 (32) | **the baseline** — standard buttons, inputs, most UI   |
| `lg`      | h-9 (36) | large primitive actions and navigation CTAs            |

The primitive geometry copies the reference exactly: default is `h-8 px-3
gap-2`, small is `h-7 px-2.5 gap-2 text-xs`, large is `h-9 px-6 gap-2`, and
icon is `size-8`; text uses 14/20 at weight 500 except small at 12/16.
Foundation-only `xs` and paired icon sizes remain available for dense
application controls.

Public-site compositions can override only geometry while reusing the
primitive: navigation CTA `h-9 px-5`, hero CTA `h-10 px-6`, pricing CTA
`h-11 px-5`, and prominent CTA `h-12 px-7`, all 14/20 at weight 600. These
are composition treatments, not new Button size names. The Showcase header
uses the navigation treatment; the hero uses the hero treatment. Utility
toggles keep their own h-8 geometry, so the control cluster remains aligned
by its centre rather than pretending every control has one role.

### Focus and invalid states

The focus indicator is designed, never the UA default: **a solid 2px line
of `--color-ring`**. Ring is a dedicated brand-blue role because the
action fill must darken for white text while the focus line must remain 3:1 on
the composited input fill. Its geometry follows the control:

- **Bordered text controls (Input, Textarea):** the border turns to the
  ring token plus an attached 1px ring — a crisp 2px line at the control
  edge, in the flat hairline language.
- **Standalone controls (buttons, links, badges-as-links):** a 2px ring
  offset by 2px of `background`. The background-colored gap makes the
  indicator perceptible on any fill, including the closely related blue
  primary.
- **Nested controls (toggle-group items, tabs triggers):** attached 2px
  ring — an offset ring would collide with siblings 2px away. Scroll
  viewports use an inset ring to survive overflow clipping.
- **Everything else:** a global `:focus-visible` rule in `globals.css`
  (2px `--ring` outline, 2px offset) catches any focusable element no
  primitive styles, so the UA default never appears.

All indicators are gated on `:focus-visible`: keyboard (and other
non-pointer) focus always shows the ring; mouse clicks on buttons do not
(pointer users have the pressed state), while text inputs match
`:focus-visible` on any focus per spec — you always see where you type.

**Invalid** (`aria-invalid`) is a 1px `--color-destructive` hairline
border — distinct from focus at a glance by both color and thickness.
Color never carries invalidity alone: the Field wiring
(`src/components/ui/field.tsx`) renders the `FieldError` message
(`role="alert"`) and cascades `text-destructive`, and `aria-invalid`
itself is the programmatic signal. **Focused + invalid** shows the focus
geometry in the destructive color (2px line, red): thickness says
"focused", color says "invalid" — the combination is never ambiguous.

### Motion

Motion here is **feedback and orientation, never decoration**: a state
confirms it changed; a layer shows where it came from. Anything beyond
that is noise in a flat, editorial identity. The whole vocabulary is
three tokens:

| Token               | Value                          | For                                                                                                            |
| ------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `--motion-quick`    | `150ms`                        | Reference-authored state feedback (hover, focus, pressed color/transform shifts).                              |
| `--motion-moderate` | `200ms`                        | Orientation (dialogs, drawers, backdrops entering/leaving): long enough to track, short enough to never delay. |
| `--ease-standard`   | `cubic-bezier(0.4, 0, 0.2, 1)` | The reference/Tailwind standard interaction curve.                                                             |

The durations live in `base.css` (theme-neutral); the bridge (`theme.css`)
sets `--default-transition-duration`/`-timing-function` to them, so **every
`transition-*` utility resolves through the tokens with no per-component
duration classes** — plain `transition-colors` is already on-system.
Explicit durations (overlay `animate-in/out`) use
`duration-(--motion-moderate)`; a raw `duration-150` in a component is
drift. `--ease-standard` generates the `ease-standard` utility via the
Tailwind `--ease-*` namespace.

**Reduced-motion timing is handled once globally** (`globals.css`): under
`prefers-reduced-motion: reduce`, transitions and animations collapse to a
single imperceptible frame. Components that opt into nonessential transform
movement also opt out explicitly with `motion-reduce:translate-none`; a
global `transform: none` rule would break structural transforms used to
position dialogs and overlays. Motion is never the sole carrier of meaning:
every animated state also changes color, border, or content.

**When not to animate:** nothing on page load; nothing that delays
interaction (motion runs alongside, never in front of, the response);
nothing layout-affecting where a compositor-friendly property (transform,
opacity, color) does the job. The header boundary transitions only
`border-color`; overlays animate opacity and scale. Primary and outline
buttons lift 2px on hover and keyboard focus, except disclosure triggers
(`aria-haspopup`), whose stable anchor matters more than lift. The reference
authors no separate active transform, so a pressed pointer state retains the
hover position. Linked overview cards lift 4px on hover and focus; static
Cards remain motionless. Nav hover remains color-only so a dropdown trigger
does not fight the panel (see `docs/LAYOUT.md` §6).

## 3. Verified contrast (WCAG AA)

Computed via OKLCH → linear sRGB → relative luminance (WCAG formula).
Requirement: 4.5:1 for text pairs and 3:1 for UI boundaries/focus. Alpha states
are composited in encoded sRGB before luminance is calculated. The source-level
test pins every migrated authored value, resolves aliases, checks every semantic
OKLCH token for sRGB gamut, and evaluates the full surface matrix rather than a
single convenient backdrop.

The binding cases explain the deviations from the reference. The adopted
values are intentionally close to the action-lightness ceiling: primary with
white is 4.51:1 in both themes, opaque primary hover with white is 5.07:1, dark
link on card is 4.80:1, dark input on card is 3.11:1, and dark ring on the
composited input fill is 3.56:1. Thresholds are not weakened to admit the
palette; source and browser checks both guard the binding action pairs.

| Pair                                     | Requirement | Light | Dark  |
| ---------------------------------------- | ----------- | ----- | ----- |
| foreground / background                  | 4.5         | 17.76 | 15.95 |
| foreground / surface                     | 4.5         | 17.02 | 13.92 |
| foreground / card                        | 4.5         | 17.76 | 12.35 |
| muted-foreground / background            | 4.5         | 6.00  | 8.95  |
| muted-foreground / card                  | 4.5         | 6.00  | 6.93  |
| primary-foreground / primary             | 4.5         | 4.51  | 4.51  |
| primary-foreground / primary-hover       | 4.5         | 5.07  | 5.07  |
| link / background                        | 4.5         | 4.73  | 6.19  |
| link / card                              | 4.5         | 4.73  | 4.80  |
| info-foreground / info                   | 4.5         | 5.38  | 8.15  |
| info / background                        | 4.5         | 5.38  | 7.42  |
| info / info `/10` over card              | 4.5         | 4.69  | 4.89  |
| destructive-foreground / destructive     | 4.5         | 6.25  | 8.86  |
| destructive / background                 | 4.5         | 6.25  | 8.06  |
| destructive / destructive tint over card | 4.5         | 5.20  | 4.73  |
| input / background                       | 3.0         | 3.13  | 4.01  |
| input / card                             | 3.0         | 3.13  | 3.11  |
| ring / background                        | 3.0         | 4.18  | 5.84  |
| ring / card                              | 3.0         | 4.18  | 4.52  |
| ring / input fill over surface           | 3.0         | 3.01  | 3.56  |

Button, linked-Badge, and ErrorFallback hovers consume the opaque
`primary-hover` semantic token. The Showcase information specimen composites
info at 10%. Destructive Button/Badge variants composite at 10% light and 15%
dark; invalid text is also checked over the 30% dark input fill. These
composite checks are first-class requirements because opaque pair checks cannot
prove the rendered state.

`--color-border` is excluded by design: it is a decorative separator, not a
component boundary, so WCAG 1.4.11 does not apply to it. Anything that must be
perceived — input borders, focus rings — uses `input`/`ring`, which meet 3:1.

## 4. Rebranding this foundation

Three migrations have now been executed against this token system, and they
establish three distinct classes of work — budget for the right one:

- **Hue swap (~15 minutes, verified 2026-07):** brand hue 262 → 330 at the
  existing L/C values, radius, and ramp weights — exactly three token files
  touched, all gates green afterwards. Hue-only changes at fixed lightness
  barely move contrast ratios.
- **Identity swap (half a day, verified 2026-07, the predecessor palette):** new hue
  family, new lightness architecture (warm paper, then-near-black primary, flat
  elevation), new typeface, new ramp voice, brand mark and favicon. Still
  overwhelmingly token-value editing — but every lightness change pulls in
  the §3 recomputation, and a handful of things live beyond tokens (listed
  in each step below, so the next rebrand knows the full surface).
- **Reference-palette migration (verified 2026-07):** the complete authored
  light/dark neutral ladder moved into semantic ownership; card, link, info,
  and overlay became explicit roles; exact reference values were retained
  unless gamut or contrast failed. Alpha-composite and state-distinguishability
  coverage prevent visually plausible but inaccessible parity.

Steps, sharpened by all three migrations:

1. **Pick the palette architecture first, hue second.** Decide what the
   primary action color IS (a saturated hue? the ink itself?) and what
   elevation means (shadows? hairlines? a lightness ladder?) before editing
   values — those two decisions shape every neutral. Current architecture:
   white/cool-neutral light, charcoal dark, deep cobalt primary, separate
   accessible link cobalt, neutral accent, cyan info, and flat elevation.
2. **In `src/styles/light.css` and `dark.css`**, set the values. If you keep
   the L/C architecture and change hue only, you inherit the verified
   contrast. If you change any **lightness**, you owe the full §3
   recompute (step 7) — write the throwaway script (OKLCH → linear sRGB →
   WCAG 2.1; ~60 lines, both prior rebrands used one) rather than checking
   pairs by hand, because failures land in composite states a spot-check
   misses: primary hover, destructive tint, and focus over input fill.
3. **Elevation is identity too.** The five `--elevation-*` levels per theme
   are the whole shadow contract; emptying `xs`/`sm` (`0 0 0 0` transparent)
   is how this palette went flat — no component changes required, because
   components consume levels, not values.
4. **Status hues** (info `220`, success `155`, warning `80`, destructive `25`)
   usually stay; keep the L/C bands or re-verify — including the composite
   pairs.
5. **Radius personality:** edit `--radius-base` in `src/styles/base.css` —
   every `rounded-*` step follows.
6. **Type voice:** edit the `--text-*` steps in `src/styles/theme.css`
   (sizes, weights, tracking, leading). To swap the typeface, change the
   loader in `src/app/fonts.ts` and the one `--font-sans` line in
   `theme.css`. Keep Tajawal first and Arabic-only in that stack (interception
   hazard — `docs/DIRECTION_AND_I18N.md`). If your display step
   grows past ~3rem, guard uncontrolled copy with a responsive pair
   (`text-title sm:text-display`) and trust the overflow sweep to catch
   the rest.
7. **Verify:** rerun the §3 pairs until everything passes, update the
   table, then run the gates — the axe matrix re-checks real composited
   contrast on every route × theme × direction, and the overflow sweep
   re-checks the new type metrics at every width.
8. **Brand assets (beyond tokens, by nature):** the default identity is
   **Foundation Frame** — two opposing open structural corners around a
   replaceable central module, expressing clear architectural boundaries.
   `src/components/ui/brand-mark.tsx` owns the compact 24-unit glyph as one
   `currentColor` path with `text-primary` as its component default. It never
   mirrors in RTL. `src/app/icon.svg` repeats that path because a static
   file-convention icon cannot import component geometry; its fixed Foundation
   cobalt field and white glyph remain legible against light and dark browser
   chrome. The colocated mark test enforces geometry parity.
9. Open `/showcase/tokens` in both themes — every swatch shows its authored
   value exactly as written in `src/styles`, and the ramp/elevation/radius
   sections reflect your edits live. Then look at `/` and `/showcase/site`:
   if the identity reads only on the tokens page, it hasn't landed.

**Known beyond-token surface** (the honest list from the flat rebrand):
the font loader (`fonts.ts` + one bridge line), the brand assets (step 8),
and any component whose _shape_ encodes the old identity — the flat
rebrand restyled `SiteShellNavItem` from pill-hover to plain text and the
Badge from pill to `rounded-md`, because "nav links are plain text" and
"badges are square-ish tags" are component decisions no token can
express. The focus/invalid language (§2) is likewise component classes:
its _colors_ come from `--ring`/`--destructive`, but the geometry (2px
line; attached vs offset vs inset) lives in the primitives and the
`globals.css` base rule. Everything else — color, elevation, radius, type
metrics — was token values.

## 5. Theme runtime

The tokens are applied by the theme runtime in
`src/core/providers/theme-provider.tsx` (mounted app-wide by `AppProvider`).

### States

Three states: `"light" | "dark" | "system"`. `"system"` tracks the OS
preference live via `matchMedia`; the other two are explicit user overrides.
The runtime applies the result as the `dark` class on `<html>`, which is what
switches the semantic variable set.

### Persistence: localStorage (not a cookie)

An explicit choice persists in `localStorage` under the key `theme` and syncs
across tabs through the `storage` event. **Tradeoff accepted:** a cookie would
let the server render the correct theme class, but reading it forces every
route into dynamic rendering — this foundation prerenders all routes
statically and keeps it that way. The costs of localStorage are (a) the server
never knows the theme, and (b) a pre-paint script is required — which is
needed for `"system"` anyway, since no server can know the OS preference at
static-generation time. If storage is unavailable (private mode, blocked), the
choice still applies in-memory for the session; only persistence is lost.

### Anti-flash mechanism

The provider renders a tiny inline script _ahead of the app tree_ (no network
round trip). Before first paint it reads the stored preference and sets the
`dark` class: `dark` if stored `"dark"`, `light` if stored `"light"`,
otherwise the `matchMedia` result. This makes first paint correct in all three
states, including a stored preference that disagrees with the OS. The root
`<html>` sets `suppressHydrationWarning` because the server renders no theme
class.

### Hook contract

```ts
const { theme, resolvedTheme, setTheme } = useTheme();
// theme:         "light" | "dark" | "system"  — the stored preference
// resolvedTheme: "light" | "dark"             — what is actually applied
// setTheme:      (theme: ThemePreference) => void
```

The two values are deliberately distinct: render _selection_ UI from `theme`
(so "System" shows as selected) and theme-dependent visuals from
`resolvedTheme`. The hook throws with an actionable message outside the
provider.

### Hydration-safe consumption

The runtime reads both the stored preference and the OS preference through
`useSyncExternalStore` with server snapshots of `"system"` / light. Server
markup and the first client render therefore always agree — there is no
divergence to guard against; values settle to the real preference immediately
after hydration. The document class itself is always correct before first
paint via the inline script, so token-driven styling never flashes. Only if a
consumer renders the _values as text_ (as `/showcase/tokens` does) can the
brief post-hydration settle be observed; gate on a `mounted` flag if even that
is unacceptable.

### UI control

`src/components/ui/theme-control.tsx` is the reusable three-state selector
(Base UI ToggleGroup: group role, roving arrow-key focus, `aria-pressed`
toggle buttons, ring-token focus styling). The Toaster follows
`resolvedTheme`, so toasts always match the applied theme.
