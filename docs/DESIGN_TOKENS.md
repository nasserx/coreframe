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
fill and text link have separate semantic tokens: in dark mode no single cobalt
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
| `--color-primary`                    | `oklch(0.531 0.219 262.6)`        | `oklch(0.57 0.19 262)`            |
| `--color-primary-foreground`         | `oklch(1 0 0)`                    | `oklch(1 0 0)`                    |
| `--color-link`                       | `oklch(0.568 0.219 262.6)`        | `oklch(0.673 0.172 262)`          |
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
| `--color-ring`                       | `oklch(0.585 0.219 262.6)`        | `oklch(0.659 0.181 262)`          |
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

- **Primary is a filled-action cobalt.** The exact reference values fail the
  foundation pair: light `0.585 0.219 262.6` is 4.38:1 with white and 3.75:1
  at `/90`; dark `0.62 0.19 262` is 3.74:1 with white. The adopted values keep
  reference hue/chroma and lower lightness only as far as the binding checks
  require. `/90` remains the filled hover opacity.
- **Link is a semantic role, not a raw blue scale.** It preserves more of the
  reference cobalt than the action fill while meeting 4.5:1 on every canvas,
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
  neutral interaction borrows cyan, cobalt, or the slightly cool content
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
  stays closer to reference cobalt than the darker action fill and is adjusted
  only enough to remain 3:1 on the composited input fill. Which token a
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
weight together. The voice is a tight grotesk speaking with headline
confidence: display/title are large, heavy, tightly tracked, and compactly
leaded (consecutive display lines nearly touch); body steps stay at
comfortable reading metrics.

| Step         | Size      | Line-height | Letter-spacing | Weight |
| ------------ | --------- | ----------- | -------------- | ------ |
| `display`    | 3.5rem    | 1.05        | −0.035em       | 800    |
| `title`      | 2.25rem   | 1.12        | −0.028em       | 800    |
| `heading`    | 1.875rem  | 1.2         | −0.024em       | 700    |
| `subheading` | 1.5rem    | 1.3         | −0.016em       | 600    |
| `body-lg`    | 1.1875rem | 1.6         | 0              | 400    |
| `body`       | 1.0625rem | 1.6         | 0              | 400    |
| `small`      | 0.875rem  | 1.5         | 0              | 400    |
| `caption`    | 0.75rem   | 1.35        | +0.01em        | 500    |

Body is **17px** (`1.0625rem`) — raised from 16px in the 2026-10
body-legibility pass. The mid-ramp opened with it (`heading 1.75→1.875rem`,
`subheading 1.375→1.5rem`, their tracking tightened a notch) so headings keep
the same size lead over the larger body; `display`/`title` were left alone
(they already dominate 17px body at 3.3×/2.1×, and resizing risks hero
overflow). The lead-paragraph step tracks body up (`body-lg 1.125→1.1875rem`),
staying one clear step above it.

At `text-display`'s size, long single words can exceed a 320px viewport —
pair it with a smaller step below `sm` (`text-title sm:text-display`, as
the home page does) when the copy is not under your control.

**The typeface is Public Sans** (`next/font/google`, variable wght 100–900,
Latin subset, OFL 1.1 — the license ships with Google Fonts' hosting; no font
file lives in this repo for it). It is a neutral, Helvetica-adjacent grotesk
(the US Web Design System's workhorse face, Libre Franklin lineage) with
substantial stems. It was adopted in the 2026-10 body-legibility pass over
Geist, and the decision was made by **measurement, not eye** — because every
prior judgement here had been visual and every one was wrong (three weight
bumps on Geist, culminating in a 450 body, all failed to fix body copy reading
"thin"). The cause was never weight; it was the **face**: Geist has among the
lightest 400 stems of any OFL grotesk.

**The measurement method** (rerun it before ever second-guessing the body face
— do not eyeball). Render one identical paragraph at 400 weight, same size, in
each candidate; screenshot at high DPI; then, per face, measure by
antialiasing-aware pixel analysis (density-weighted, sub-pixel — a hard
threshold quantises every face to the same few pixels and cannot discriminate):

- **stem width** — density-weighted thickness of a clean vertical (`l`/`I`) at
  a large render size, as a fraction of the em;
- **ink per character** — total ink density of the paragraph ÷ (glyph count ×
  size²), i.e. mean ink area per glyph in em² (wrap-independent; captures stem
  weight _and_ set width — the true "presence" of body text);
- **x-height** and **cap-height** as fractions of the em.

The eight faces measured (all OFL, all variable, all `next/font/google`, so the
loader pattern is unchanged), 400 weight, Geist as baseline:

| Face              | stem (`I`, em) | Δ stem vs Geist | x-height | ink/char (em²·10³) | set width (em) | verdict                                                                                                      |
| ----------------- | -------------- | --------------- | -------- | ------------------ | -------------- | ------------------------------------------------------------------------------------------------------------ |
| Geist (baseline)  | 0.086          | —               | 0.530    | 105.3              | 0.456          | lightest stems — the problem                                                                                 |
| **Public Sans**   | **0.092**      | **+7%**         | 0.517    | 103.6              | 0.461          | **chosen**                                                                                                   |
| Inter             | 0.093          | +8%             | 0.546    | 108.8              | 0.475          | heaviest presence, but the repo reads it humanist + it is the widest (+4% set width → most layout risk)      |
| Archivo           | 0.095          | +10%            | 0.526    | 106.6              | 0.436          | heaviest stems, but already tried and rejected as too open/editorial; narrow, so ink/char barely beats Geist |
| Schibsted Grotesk | 0.088          | +2%             | 0.528    | 101.8              | 0.463          | not substantially heavier                                                                                    |
| Hanken Grotesk    | 0.088          | +2%             | 0.493    | 95.7               | 0.446          | geometric, low x-height                                                                                      |
| Onest             | 0.087          | +1%             | 0.527    | 105.9              | 0.470          | geometric; stems ≈ Geist                                                                                     |
| Figtree           | 0.085          | −1%             | 0.500    | 95.2               | 0.447          | geometric; _lighter_ than Geist                                                                              |

Reading the table: the geometric/rounded faces (Figtree, Onest, Hanken) do
**not** have heavier stems than Geist — proof that letterform roundness is not
the lever, stem weight is. The heavy neutral grotesques are Archivo (+10%),
Inter (+8%), and Public Sans (+7%). **Public Sans wins** because it is the only
one that is heavy-stemmed (heaviest lowercase `l` of the eight) _and_
unambiguously neutral (not humanist like Inter, not editorial like the
already-rejected Archivo) _and_ layout-safe (set width only ~1% over Geist vs
Inter's +4%). Its ink/char reads a hair below Geist only because its x-height
is slightly shorter; the +7% thicker stems are what the eye reads as presence,
confirmed visually at 17px in both themes. This is the exact target the brief
described — "a neutral Helvetica-adjacent grotesque with substantial stems".

The history for context (do not re-litigate on feel — measure): the 2026-07
flat rebrand ran Archivo, the 2026-08 pass swapped to Geist for a tighter,
more closed voice, and Geist then turned out to have the lightest stems tested.
Space Grotesk / Instrument Sans stop at 700 (no true heavy); Fontshare faces
(General Sans, Cabinet Grotesk) are non-OFL self-host — so they were not
measured.

**There is deliberately no `--font-heading`.** Headings and body share one
family (Public Sans, `--font-sans`); the heading voice comes from weight and
negative tracking in the ramp. Every face swap has kept this: the reference
voice ("substantial grotesk headlines, same family at reading weight for body")
is reachable by changing the one family and re-tuning ramp values — the payload
argument (one Latin woff2, one FOUT source) holds regardless of which grotesk
is loaded. **Geist Mono remains the code face** (`--font-mono`) — the code face
is an independent decision from the identity sans, and a monospaced grotesk
pairs cleanly with Public Sans. Noto Sans Arabic remains the Arabic companion
(`docs/DIRECTION_AND_I18N.md`); its `size-adjust` was recalibrated `115% → 112%`
for Public Sans's slightly smaller x-height (measured 0.517 vs Geist's 0.530,
so 115% × 0.517/0.53 ≈ 112%), confirmed empirically and re-checked by the font
e2e.

### Type hierarchy (how a page leads the eye)

Hierarchy is carried by **size, weight, and space — never by tone.** This is a
system decision, recorded here so pages do not each re-invent it, and it is the
direct consequence of "Body vs secondary text" above: once running prose is all
`foreground`, colour can no longer separate a standfirst from body from a list,
so the ramp and rhythm must. The reference does the same — its headings are far
larger relative to body than a greyed-body system needs them to be.

The prose/heading **roles** and the ramp step each maps to:

| Role                            | Ramp step                              | Notes                                                                                                                    |
| ------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Hero / page display             | `display` / `title`                    | the largest voice; heroes lead the viewport                                                                              |
| Page title                      | `heading` (1.875rem/700)               | `PageHeaderTitle`; clearly outranks section headings                                                                     |
| Section heading                 | `subheading` (1.5/600)                 | section landmarks; 1.41× body + a 200-unit weight step                                                                   |
| **Lead paragraph / standfirst** | `body-lg` (1.1875/400)                 | the first paragraph under a page title or hero — one size step above body; `PageHeaderDescription` and hero leads use it |
| Body                            | `body` (1.0625rem = 17px / 400)        | running prose, section descriptions                                                                                      |
| Secondary / annotative          | `small` / `caption`, usually **muted** | captions, labels, metadata (per "Body vs secondary text")                                                                |

Two decisions the 2026-09 pass settled (after body copy moved to `foreground`),
both re-scaled with body in the 2026-10 body-legibility pass when it moved to
17px:

- **The mid-ramp was opened, and re-opened.** The 2026-09 pass raised `heading`
  `1.5 → 1.75rem` and `subheading` `1.25 → 1.375rem` so a section heading leads
  by size, not weight alone; the 2026-10 pass moved them again (`heading
1.75 → 1.875rem`, `subheading 1.375 → 1.5rem`, tracking tightened a notch) to
  hold that same lead over the now-larger 17px body (heading stays ~1.77× body,
  subheading ~1.41×). `display`/`title` were left alone both times — they
  already lead, and resizing them risks hero overflow (the sweep guards the
  rest).
- **The lead-paragraph role was formalised at `body-lg`.** Previously
  `PageHeaderDescription` and section descriptions were `text-small` —
  _smaller_ than the body they introduce, an inversion that only read as
  "hierarchy" because they were also greyed. The page/hero standfirst is now
  `body-lg` (a rung above body); ordinary section descriptions are `body`.

**Weight is a hierarchy axis too, and the relationship holds:** body 400 vs
headings 600–800 is a large, deliberate gap, and dropping body 450 → 400 last
pass _widened_ it — so weight now does more of the heading-vs-body work than it
did against the greyed baseline, not less. The lead paragraph stays 400 and
leads by **size**, not weight, so it never competes with the 500 UI weight.

### Weight scale

Five weights render across the whole system, and they form a coherent set
because they split into two jobs (audited 2026-09):

| Weight | Role                     | Where it is used                                                                                            |
| ------ | ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| 800    | Ramp display voice       | `text-display`, `text-title` — the heavy headline tier                                                      |
| 700    | Ramp heading / bold      | `text-heading`; also the component "bold" (brand lockups, `aria-current` nav item)                          |
| 600    | Ramp subheading          | `text-subheading` **only**                                                                                  |
| 500    | Ramp caption / UI medium | `text-caption`; and the component UI weight — labels, card/dialog titles, idle nav, table headers           |
| 400    | Ramp body / base         | `text-body`/`-lg`/`-small` — body copy proper; also the inherited base weight and component help/error text |

**Body copy is 400 — and staying 400 is the entire thesis of the body work.**
Body copy read "thin and faint", and the wrong fix (weight) was reached for
three times: the 2026-09 body-contrast pass first raised the steps to 450, then
walked it back to 400 once it found two _contrast_ causes (body set in
`muted-foreground` not `foreground`; macOS-only `antialiased` grayscale
smoothing thinning stems). Those fixes were real but incomplete — the copy
still lacked presence, and the 2026-10 body-legibility pass proved by
**measurement** that the last cause was the **typeface**: Geist has among the
lightest 400 stems of any OFL grotesk (see the "Type ramp" specimen table). The
fix was structural, not a weight bump: swap Geist → **Public Sans** (+7% heavier
stems, measured) and raise body to **17px**. Presence now comes from the face's
stems and the size; weight stays 400, keeping the full 100-unit gap below the
500 UI/label weight (body vs labels/nav stay distinct tiers) and matching the
component base weight. On charcoal the light-on-dark irradiation bloom gives 400
enough presence, so it is one value for both themes. `caption` stays 500: it is
the smallest step and already sat at the substantial end for legibility. **The
standing rule: if body ever reads thin again, MEASURE the face's stems — do not
touch the weight.**

**The ramp uses weight as an optical function of size**: as the step gets
larger it gets heavier (body 400 → subheading 600 → heading 700 →
display/title 800), so big type carries more weight and body sits a notch below
the small-UI weight. Each ramp weight is size-locked to its step, not a free
choice.

**Components still draw from three explicit weights only — 400 / 500 / 700**
(base/body / UI medium / bold). The ramp-locked set a component must not reach
for is **600 / 800** — a component wanting body text uses `text-body`/`-small`,
not a bare weight, and 600/800 belong only to their ramp steps. Reaching for a
ramp-locked weight in a component class (as the showcase sidebar nav once did at
`font-semibold`) is a review smell. The rule that resolves the two nav patterns
is unchanged: idle nav sits at **500** (a primary interactive element should
not read thin), and "current" is marked by **700** where weight carries it
(SiteShell's borderless text nav) or by a **fill** where the surface carries it
(the AppShell sidebar's `bg-sidebar-accent` row, which then stays 500). No
component should introduce a new weight without a documented reason.

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
of `--color-ring`**. Ring is a dedicated reference-cobalt role because the
action fill must darken for white text while the focus line must remain 3:1 on
the composited input fill. Its geometry follows the control:

- **Bordered text controls (Input, Textarea):** the border turns to the
  ring token plus an attached 1px ring — a crisp 2px line at the control
  edge, in the flat hairline language.
- **Standalone controls (buttons, links, badges-as-links):** a 2px ring
  offset by 2px of `background`. The background-colored gap makes the
  indicator perceptible on any fill, including the closely related cobalt
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
values deliberately clear the source-level threshold rather than landing on
its rounding boundary: light primary `/90` over white is 4.62:1; dark primary
with white is 4.61:1; dark link on card is 4.60:1; dark input on card is
3.11:1; dark ring on the composited input fill is 3.11:1. Thresholds are not
weakened to admit the palette, and the margin keeps Chromium/axe from rounding
an authored pass into a rendered failure.

| Pair                                               | Requirement | Light | Dark  |
| -------------------------------------------------- | ----------- | ----- | ----- |
| foreground / background                            | 4.5         | 17.76 | 15.95 |
| foreground / surface                               | 4.5         | 17.02 | 13.92 |
| foreground / card                                  | 4.5         | 17.76 | 12.35 |
| muted-foreground / background                      | 4.5         | 6.00  | 8.95  |
| muted-foreground / card                            | 4.5         | 6.00  | 6.93  |
| primary-foreground / primary                       | 4.5         | 5.53  | 4.61  |
| primary-foreground / primary `/90` over background | 4.5         | 4.62  | 5.30  |
| primary-foreground / primary `/90` over card       | 4.5         | 4.62  | 5.15  |
| link / background                                  | 4.5         | 4.71  | 5.94  |
| link / card                                        | 4.5         | 4.71  | 4.60  |
| info-foreground / info                             | 4.5         | 5.38  | 8.15  |
| info / background                                  | 4.5         | 5.38  | 7.42  |
| info / info `/10` over card                        | 4.5         | 4.69  | 4.89  |
| destructive-foreground / destructive               | 4.5         | 6.25  | 8.86  |
| destructive / background                           | 4.5         | 6.25  | 8.06  |
| destructive / destructive tint over card           | 4.5         | 5.20  | 4.73  |
| input / background                                 | 3.0         | 3.13  | 4.01  |
| input / card                                       | 3.0         | 3.13  | 3.11  |
| ring / background                                  | 3.0         | 4.38  | 5.61  |
| ring / card                                        | 3.0         | 4.38  | 4.35  |
| ring / input fill over card                        | 3.0         | 3.26  | 3.11  |

Button, linked-Badge, and ErrorFallback hovers composite primary at 90% over
the underlying surface. The Showcase information specimen composites info at
10%. Destructive Button/Badge variants composite at 10% light and 15% dark;
invalid text is also checked over the 30% dark input fill. These composite
checks are first-class requirements because opaque pair checks cannot prove
the rendered state.

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
   `theme.css`. Keep Noto Sans Arabic FIRST in that stack (interception
   hazard — `docs/DIRECTION_AND_I18N.md`) and sanity-check its
   `size-adjust` against the new face's x-height. If your display step
   grows past ~3rem, guard uncontrolled copy with a responsive pair
   (`text-title sm:text-display`) and trust the overflow sweep to catch
   the rest.
7. **Verify:** rerun the §3 pairs until everything passes, update the
   table, then run the gates — the axe matrix re-checks real composited
   contrast on every route × theme × direction, and the overflow sweep
   re-checks the new type metrics at every width.
8. **Brand assets (beyond tokens, by nature):** the mark is
   `src/components/ui/brand-mark.tsx` (one `currentColor` path with
   `text-primary` as its component-owned default) and `src/app/icon.svg`
   (same geometry, static hex fills computed from the light/dark primary
   tokens, `prefers-color-scheme` for dark browser UI). Keep the two in sync;
   both carry a comment saying so.
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
