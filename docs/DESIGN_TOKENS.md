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

The identity is **flat, editorial, high-contrast**: a warm off-white paper
canvas (oklch hue 84 — perceptibly warm but close to neutral paper, not a
saturated cream, not grey, not pure white) with near-black ink as the
primary action color. There is no saturated brand hue on the chrome —
near-black IS the interactive signal; hue survives only where hue is
information (status colors, charts). The **light** neutrals carry trace
chroma (0.003–0.018) of the warm hue so the theme reads as one material; the
light paper family (background + near-white surfaces) was de-warmed in the
2026-07 polish pass — chroma roughly halved — because the earlier values read
too saturated, then **lifted toward white** in the 2026-09 body-contrast pass
(`background 0.968 → 0.978`, `surface 0.988 → 0.996`, moved together so the
surface-lift held) because at 0.968 the canvas read as cream rather than bright
paper. The warm cast is carried by the chroma (background stays 0.005), not by
holding the luminance down, so the paper stays perceptibly warm even nearer
white; the border was re-derived from the hairline rule for the lighter base
(0.9 → 0.91, below).

**The dark theme is a NEUTRAL dark CHARCOAL, not near-black, and not a
warm-paper inversion.** The 2026-08 pass abandoned the earlier "same paper
with the lights off" decision (warmth reads as paper in light but as
brown/dirt in dark, and the trace warm chroma tinted the light-on-dark _text_
yellowish); the **2026-09 refinement pass** then lifted the base off
near-black — `background 0.185 → 0.235`. A charcoal is easier on the eye over
long sessions than a near-black field, and the extra base luminance lets the
in-plane ladder above it breathe. Lifting the base compresses the room above,
so the whole ladder was re-derived from the documented rules rather than
nudged (surface, popover, and the hairline all moved — see the ladder bullet
and the hairline rule below). Dark neutrals still carry only a whisper of the
warm hue (chroma 0.004–0.008), and the light-on-dark tokens (foreground and
every `*-foreground` pair) sit at **chroma 0.001** — essentially neutral, so
text reads white rather than warm. Both themes still share hue 84, so they
read as one token family without the dark theme reading warm.

**Dark foreground — neutral near-white, deliberately not pure white.** The
light-on-dark foreground family sits at **L 0.985 / chroma 0.001** (the
2026-09 pass took the last trace of warmth out — 0.002 → 0.001 — so the white
reads neutral, not cream). It is _not_ pushed to L 1.0: pure white on a dark
field is a well-documented eye-strain source — at peak monitor luminance it
halates and leaves afterimages over long reading lengths, which is why most
well-regarded dark themes stop a few percent short. L 0.985 (≈ 96% luminance)
reads as white and keeps that headroom below peak. The whole family moves
together (`foreground`, `surface-foreground`, `popover-foreground`,
`secondary-foreground`, `accent-foreground`, `sidebar-accent-foreground`) —
one value, applied consistently, never tuned per token.
`--color-muted-foreground` is the deliberate exception: it stays dimmed (0.69)
because it is the _secondary_-text role (see the cross-theme "Secondary text"
row for why 0.69, not a value matching light's 0.46). The near-white _primary_ fill stays
at 0.955, a hair below the text white, so a filled button reads as a surface
(and `primary/80` hover still shifts visibly).

| Token                                | Light                             | Dark                              |
| ------------------------------------ | --------------------------------- | --------------------------------- |
| `--color-background`                 | `oklch(0.978 0.005 84)`           | `oklch(0.235 0.004 84)`           |
| `--color-foreground`                 | `oklch(0.185 0.012 84)`           | `oklch(0.985 0.001 84)`           |
| `--color-surface`                    | `oklch(0.996 0.003 84)`           | `oklch(0.278 0.004 84)`           |
| `--color-surface-foreground`         | `oklch(0.185 0.012 84)`           | `oklch(0.985 0.001 84)`           |
| `--color-popover`                    | `oklch(0.996 0.003 84)`           | `oklch(0.315 0.005 84)`           |
| `--color-popover-foreground`         | `oklch(0.185 0.012 84)`           | `oklch(0.985 0.001 84)`           |
| `--color-primary`                    | `oklch(0.225 0.014 84)`           | `oklch(0.955 0.001 84)`           |
| `--color-primary-foreground`         | `oklch(0.985 0.005 84)`           | `oklch(0.18 0.004 84)`            |
| `--color-secondary`                  | `oklch(0.945 0.006 84)`           | `oklch(0.31 0.005 84)`            |
| `--color-secondary-foreground`       | `oklch(0.26 0.014 84)`            | `oklch(0.985 0.001 84)`           |
| `--color-muted`                      | `oklch(0.95 0.005 84)`            | `oklch(0.305 0.004 84)`           |
| `--color-muted-foreground`           | `oklch(0.46 0.015 84)`            | `oklch(0.72 0.004 84)`            |
| `--color-accent`                     | `oklch(0.935 0.007 84)`           | `oklch(0.34 0.006 84)`            |
| `--color-accent-foreground`          | `oklch(0.26 0.014 84)`            | `oklch(0.985 0.001 84)`           |
| `--color-success`                    | `oklch(0.52 0.12 155)`            | `oklch(0.7 0.13 155)`             |
| `--color-success-foreground`         | `oklch(0.985 0.005 155)`          | `oklch(0.145 0.01 155)`           |
| `--color-warning`                    | `oklch(0.82 0.14 80)`             | `oklch(0.8 0.13 80)`              |
| `--color-warning-foreground`         | `oklch(0.28 0.05 80)`             | `oklch(0.15 0.012 80)`            |
| `--color-destructive`                | `oklch(0.505 0.17 25)`            | `oklch(0.78 0.17 25)`             |
| `--color-destructive-foreground`     | `oklch(0.985 0.005 25)`           | `oklch(0.15 0.01 25)`             |
| `--color-border`                     | `oklch(0.91 0.004 84)`            | `oklch(0.385 0.005 84)`           |
| `--color-input`                      | `oklch(0.63 0.018 84)`            | `oklch(0.555 0.008 84)`           |
| `--color-ring`                       | `oklch(0.32 0.015 84)`            | `oklch(0.76 0.006 84)`            |
| `--color-chart-1`                    | `oklch(0.55 0.15 262)`            | `oklch(0.68 0.13 262)`            |
| `--color-chart-2`                    | `oklch(0.62 0.1 195)`             | `oklch(0.7 0.11 195)`             |
| `--color-chart-3`                    | `oklch(0.6 0.12 155)`             | `oklch(0.72 0.12 155)`            |
| `--color-chart-4`                    | `oklch(0.75 0.13 85)`             | `oklch(0.8 0.12 85)`              |
| `--color-chart-5`                    | `oklch(0.58 0.15 25)`             | `oklch(0.68 0.14 25)`             |
| `--color-sidebar`                    | `oklch(0.962 0.006 84)`           | `oklch(0.255 0.005 84)`           |
| `--color-sidebar-foreground`         | `var(--color-foreground)`         | `var(--color-foreground)`         |
| `--color-sidebar-primary`            | `var(--color-primary)`            | `var(--color-primary)`            |
| `--color-sidebar-primary-foreground` | `var(--color-primary-foreground)` | `var(--color-primary-foreground)` |
| `--color-sidebar-accent`             | `oklch(0.92 0.007 84)`            | `oklch(0.31 0.005 84)`            |
| `--color-sidebar-accent-foreground`  | `oklch(0.26 0.014 84)`            | `oklch(0.985 0.001 84)`           |
| `--color-sidebar-border`             | `var(--color-border)`             | `var(--color-border)`             |
| `--color-sidebar-ring`               | `var(--color-ring)`               | `var(--color-ring)`               |

Design notes:

- **Primary is the ink.** Light: near-black on paper; dark: near-white on
  ink — no saturated hue on interactive chrome. Primary sits slightly off
  the foreground extreme (0.225 / 0.945) so `primary/80` hover states still
  shift visibly.
- **The former brand hue (indigo 262) survives only as `chart-1`** — a data
  color among five, no longer an identity. Hue in this system is reserved
  for information: status semantics and chart series.
- **Surfaces sit close to the background** (light: 0.978 → 0.996) and are
  separated by hairline borders, not lightness jumps. **Dark surfaces
  separate by two cues together — a lightness step AND a visible hairline
  border — because the step alone cannot carry it.** The 2026-07
  system-review pass established (and screenshots confirmed) that near
  black, equal OKLCH-L steps produce almost no _luminance_ contrast:
  `surface / background` sat at ~1.1:1 however wide the ladder was drawn,
  which is why widening it twice (Δ0.045 → Δ0.06) never fixed the "dark
  reads flat" complaint. Borders carry it — at the weight fixed by the
  **hairline rule** (below): dark `0.385` (1.70:1 vs background, 1.50:1 vs
  surface). Cards, popovers and dialogs draw the **border token**
  (`ring-border`), so their edges track the same hairline as every other
  surface. Current dark ladder (2026-09 charcoal): `background 0.235 → surface
0.278 → popover 0.315`; the step is ΔL ~0.04 as before, just shifted up off
  near-black.
- **Status colors in dark invert to light fills with ink text**, matching
  primary, so every filled status surface keeps AA text contrast.
- **`--color-border` is the structural hairline of the flat system** —
  decorative in WCAG terms (it conveys structure, not meaning), so 1.4.11
  does not apply to it. Its weight is fixed by the **hairline rule** (below),
  not tuned by feel: light `0.9`, dark `0.385`, and it carries
  card/popover/dialog edges via `ring-border`. **`--color-input` is a control
  boundary** and holds ≥3:1 against background and surface in both themes
  (WCAG 1.4.11), as does `--color-ring` (focus indicator — near-black in
  light, near-white in dark, matching the primary logic). Which token a
  control's edge takes turns on 1.4.11's "**required to identify**" test, not
  on whether it is a control: an **empty** field (input, textarea) has nothing
  but its edge to announce it, so that edge is required and uses `input`; a
  **labelled** control (an outline button) is identified by its text, so its
  border is decorative and uses the `border` hairline in both themes — a dark
  outline button on the 3:1 `input` band reads as a lit edge, not a quiet one.

**The hairline rule (both themes, a decision not a feel).** A hairline should
be _quiet but present_: perceptible as an edge, never a drawn line. The
contrast ratio that achieves this is **not the same in the two themes**,
because a thin light line on a dark field is harder to see than a thin dark
line on a light field (near black, equal luminance _ratios_ correspond to
smaller absolute luminance _steps_, and thin-line perception tracks the
absolute step). So the rule targets a **perceptual** band, using different
ratios to land in it:

| Theme | Target vs background | Value     | Ratio vs background | Ratio vs surface |
| ----- | -------------------- | --------- | ------------------- | ---------------- |
| Light | 1.2–1.35:1           | L `0.91`  | 1.23:1              | 1.29:1           |
| Dark  | 1.6–1.75:1           | L `0.385` | 1.70:1              | 1.50:1           |

Light hairlines are easy, so they sit at the whisper end (~1.23:1) — the light
border was re-derived `0.9 → 0.91` in the 2026-09 pass when the background
lifted to `0.978`: a higher base raises the ratio under a fixed line, so
holding the same ~1.23:1-vs-bg percept required lightening the border a step. Dark
hairlines need a higher ratio than light for the _same perceived_ quietness
(a light line on a dark field is harder to see) — but the target **band moved
down** in the 2026-09 charcoal pass, for two reasons the rule anticipates.
First, lifting the base off near-black raises the absolute luminance beneath a
hairline, so a given _ratio_ now spans a larger absolute luminance step;
matching the old perceived quietness therefore lands at a lower ratio. Second,
the old dark band (1.7–1.9:1) had begun to read heavy — the brief that drove
this pass reported borders as too strong. So the dark hairline was re-derived
to `0.385`: **1.70:1 vs background / 1.50:1 vs surface** (the surface side is
the binding constraint, since a card's fill is the lightest thing a border
must separate from), quieter than the old `0.38`/1.86 yet still comfortably
above the vanish point on this lighter base (the old ~1.6:1 "invisible border"
floor was measured against near-black; the higher base moves it down too). Any
change to a background or surface lightness re-derives the border value — and,
if the base moved enough, the target band — from this rule; do not adjust the
number in isolation.

### Text colour: body vs secondary

`foreground` is the default ink; `muted-foreground` is a **demotion**, not the
house body colour. The reference sets running body copy at near-full foreground
contrast (~16–17:1 light, ~14–16:1 dark) and reserves grey for text that is
genuinely subordinate. Before the 2026-09 body-contrast pass this had drifted:
page and section descriptions, hero leads, and prose were all set in
`muted-foreground` (~6.5:1), which — compounded by grayscale font smoothing —
read thin and faint. The pass moved body copy back to `foreground` and fixed
the rule so it is not re-decided per component:

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

The two themes must _feel_ like one design — same perceived weight, contrast,
surface separation, and prominence for the same element. Best practice is
that **matching numeric values across themes produces mismatched
perception**, because the eye responds to absolute luminance steps, not to
token symmetry, and a near-black field compresses those steps. So several
tokens are deliberately _asymmetric_ to land the same percept:

| What must feel equal         | Light                       | Dark                             | Why different numbers                                                                                                                                                                                                                   |
| ---------------------------- | --------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hairline "quiet but present" | border 1.23:1 vs bg         | border 1.70:1 vs bg              | a light line on dark needs a higher ratio to be seen (hairline rule above)                                                                                                                                                              |
| Surface lift off background  | ΔL 0.018 (0.978→0.996)      | ΔL 0.043 (0.235→0.278) + border  | charcoal still compresses luminance, so dark needs a bigger step _and_ the border cue for the same perceived lift                                                                                                                       |
| Secondary (muted) text       | muted-fg 0.46 (sep 2.62:1)  | muted-fg 0.69 (sep 2.66:1)       | what must feel equal is the _separation from body_, not each theme's contrast vs bg: light ink↔grey is 2.62:1, so dark is derived to match (2.66:1), a hair higher to offset irradiation; 0.69 is also the AA floor (4.66:1 on popover) |
| Floating-layer shadow        | ink wash, alpha 0.05–0.13   | black, alpha 0.4–0.55            | a shadow reads against paper vs mid-dark; equal alpha would vanish in dark                                                                                                                                                              |
| Control boundary (input)     | input 0.63 (3.2:1)          | input 0.555 (3.5:1)              | both clear 3:1 (WCAG 1.4.11) from opposite sides; matching the number would over- or under-shoot one theme                                                                                                                              |
| Primary prominence           | ink 0.225 on paper (15.6:1) | near-white 0.955 on ink (14.6:1) | "the primary IS the ink" inverts lightness; both land the same very-high prominence vs background                                                                                                                                       |

The rule for future changes: decide the _perceptual_ target first, then pick
each theme's value to hit it — never copy a value across themes for symmetry.

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
- **Light** shadows are soft warm-ink washes
  (`oklch(0.185 0.012 84 / 0.05–0.13)`) with no hard key lines; **dark**
  shadows are heavier blacks (`oklch(0 0 0 / 0.4–0.55)`) that only ground
  floating layers against the mid-dark behind them.

### Type ramp (`--text-*`, theme-neutral, in `theme.css`)

Generates `text-<step>` utilities carrying size, line-height, letter-spacing, and
weight together. The voice is a tight grotesk speaking with headline
confidence: display/title are large, heavy, tightly tracked, and compactly
leaded (consecutive display lines nearly touch); body steps stay at
comfortable reading metrics.

| Step         | Size     | Line-height | Letter-spacing | Weight |
| ------------ | -------- | ----------- | -------------- | ------ |
| `display`    | 3.5rem   | 1.05        | −0.035em       | 800    |
| `title`      | 2.25rem  | 1.12        | −0.028em       | 800    |
| `heading`    | 1.75rem  | 1.2         | −0.022em       | 700    |
| `subheading` | 1.375rem | 1.3         | −0.014em       | 600    |
| `body-lg`    | 1.125rem | 1.65        | 0              | 400    |
| `body`       | 1rem     | 1.6         | 0              | 400    |
| `small`      | 0.875rem | 1.5         | 0              | 400    |
| `caption`    | 0.75rem  | 1.35        | +0.01em        | 500    |

At `text-display`'s size, long single words can exceed a 320px viewport —
pair it with a smaller step below `sm` (`text-title sm:text-display`, as
the home page does) when the copy is not under your control.

**The typeface is Geist** (`next/font/google`, variable wght 100–900, Latin
subset, OFL 1.1 — the license ships with Google Fonts' hosting; no font file
lives in this repo for it). It is a neutral, tightly-spaced grotesk with
closed apertures. The identity has now gone back and forth once: the 2026-07
flat rebrand swapped Geist → Archivo for a more open, editorial voice; the
2026-08 pass swapped back, because the reference direction wanted a
_tighter, more closed, more neutral_ grotesk at display sizes than Archivo's
letterforms, and Geist also re-unifies the type system with its own mono
companion (one family across sans and code). Among open options the shortlist
is unchanged: Space Grotesk and Instrument Sans stop at 700 (no true heavy);
Inter/Inter Tight read wide and humanist; Fontshare faces (General Sans,
Cabinet Grotesk) require self-hosting under a non-OFL license — leaving Geist
and Archivo as the two credible OFL grotesques with a full variable weight
axis, and the current brief points at Geist.

**There is deliberately no `--font-heading`.** Headings and body share one
family (Geist, `--font-sans`); the heading voice comes from weight and
negative tracking in the ramp. Both face swaps kept this: the reference voice
("tight grotesk headlines, same family at reading weight for body") is
reachable by changing the one family and re-tuning ramp values — the payload
argument (one Latin woff2, one FOUT source) holds regardless of which grotesk
is loaded. Geist Mono remains the code face (`--font-mono`); Noto Sans Arabic
remains the Arabic companion (`docs/DIRECTION_AND_I18N.md` — its
unicode-range scoping and `size-adjust: 115%` calibration are independent of
the Latin face; the 115% has held across both swaps because Geist and Archivo
have near-identical x-heights, and the font e2e re-confirms it).

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
| Page title                      | `heading` (1.75rem/700)                | `PageHeaderTitle`; clearly outranks section headings                                                                     |
| Section heading                 | `subheading` (1.375/600)               | section landmarks; 1.375× body + a 200-unit weight step                                                                  |
| **Lead paragraph / standfirst** | `body-lg` (1.125/400)                  | the first paragraph under a page title or hero — one size step above body; `PageHeaderDescription` and hero leads use it |
| Body                            | `body` (1rem/400)                      | running prose, section descriptions                                                                                      |
| Secondary / annotative          | `small` / `caption`, usually **muted** | captions, labels, metadata (per "Body vs secondary text")                                                                |

Two decisions this pass settled (2026-09, after body copy moved to
`foreground`):

- **The mid-ramp was opened.** `heading` `1.5 → 1.75rem` and `subheading`
  `1.25 → 1.375rem` (with their tracking tightened and leading pulled in a
  notch, as the ramp does at larger sizes). At the old sizes a section heading
  sat only 1.25× above body and leaned entirely on weight to lead; now it leads
  by size too. `display`/`title` were left alone — they already lead, and
  resizing them risks hero overflow (the sweep guards the rest).
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

**Body copy is 400 (2026-09 body-contrast pass).** A brief mid-month raised the
body steps to 450 to fight body reading "thin and faint", but that diagnosis
was wrong. The thinness had two real causes, both fixed at the source: running
body copy was set in `muted-foreground` (~6.5:1) instead of `foreground` (see
"Body vs secondary text" below), and the document forced macOS-only grayscale
smoothing (`antialiased` on `<body>`) that visibly thins stems. With body copy
at full foreground contrast and the platform's native smoothing restored, **400
reads substantial** — verified in both themes at normal viewing distance — and
is the cleaner editorial texture; 450 read a touch heavy once the contrast was
corrected. 400 also keeps the full 100-unit gap below the 500 UI/label weight
(body vs labels/nav stay distinct tiers) and re-aligns the ramp's body weight
with the component base weight. On charcoal the light-on-dark irradiation bloom
gives 400 enough presence, so it is one value for both themes. `caption` stays
500: it is the smallest step and already sat at the substantial end for
legibility.

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
| `lg`  | ×1         | 8   | controls (buttons, inputs, textareas)  |
| `xl`  | ×1.5       | 12  | surfaces (cards, dialogs)              |
| `2xl` | ×2         | 16  | —                                      |
| `3xl` | ×2.5       | 20  | —                                      |
| `4xl` | ×3         | 24  | —                                      |

Controls sit at `lg`, nested elements step down to stay concentric, and
surfaces step up so cards and dialogs stay recognisably rounded above the
tighter controls. The Badge is deliberately `rounded-md`, not the
registry's `rounded-4xl` pill — a full-round badge is a shape decision
that fights this scale.

### Control height

Interactive controls sit on a four-step height scale (the shadcn Button
`size` set; `h-N` = `N × 0.25rem`). Each step has a job, so a control's
height is a role decision, not a per-instance nudge:

| Step      | Height   | For                                                           |
| --------- | -------- | ------------------------------------------------------------- |
| `xs`      | h-6 (24) | dense/inline actions — table-row controls, tag removes        |
| `sm`      | h-7 (28) | compact toolbars and dense forms                              |
| `default` | h-8 (32) | **the baseline** — standard buttons, inputs, most UI          |
| `lg`      | h-9 (36) | **prominent** actions and touch targets — larger primary CTAs |

**The header action cluster uses `default` (h-8) — the baseline.** This
reverses the 2026-08 settling pass, which put the cluster at `lg` (h-9)
reasoning that a tall (h-16) bar wants prominent controls. The 2026-09 pass
brought it back down a step: h-9 read a touch oversized for the flat
identity's restraint, and `default`/h-8 is the documented baseline for
"standard buttons" — it sits comfortably in the tall bar with generous
vertical breathing room. The scale itself is unchanged; only the header's
_assignment_ moved (lg remains available for a surface that genuinely wants
the prominent step). **The utility toggles in the same cluster (ThemeControl,
DirectionControl) align to h-8** so the whole cluster shares one optical
height; they render at 32px by construction (a 26px inner toggle + the group's
`p-0.5` padding and 1px border). CTA padding stays at the size's own `px-2.5`
(the earlier `px-3.5` override is gone — with h-8 it is not needed and only
widened the bar). Within a cluster, keep one gap between peers and a larger
gap between sub-groups (utilities vs actions); centre-align so unequal
intrinsic widths still read as one row.

### Focus and invalid states

The focus indicator is designed, never the UA default: **a solid 2px line
of `--color-ring`** (near-black in light, near-white in dark — the same
ink logic as primary). Its geometry follows the control:

- **Bordered text controls (Input, Textarea):** the border turns to the
  ring token plus an attached 1px ring — a crisp 2px line at the control
  edge, in the flat hairline language.
- **Standalone controls (buttons, links, badges-as-links):** a 2px ring
  offset by 2px of `background`. Offset, not attached, because the ring
  barely contrasts with the near-black primary fill (1.35:1 light /
  1.83:1 dark) — the background-colored gap is what makes it perceptible
  on any fill.
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

| Token               | Value                         | For                                                                                                                                             |
| ------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `--motion-quick`    | `120ms`                       | State feedback (hover, focus, pressed color shifts): fast enough to feel instant, slow enough not to flicker.                                   |
| `--motion-moderate` | `200ms`                       | Orientation (dialogs, drawers, backdrops entering/leaving): long enough to track, short enough to never delay.                                  |
| `--ease-out-soft`   | `cubic-bezier(0.25, 0, 0, 1)` | The one curve: decelerate — motion arrives and settles gently. Exits reuse it (at the same durations); a second curve has not earned its place. |

The durations live in `base.css` (theme-neutral); the bridge (`theme.css`)
sets `--default-transition-duration`/`-timing-function` to them, so **every
`transition-*` utility resolves through the tokens with no per-component
duration classes** — plain `transition-colors` is already on-system.
Explicit durations (overlay `animate-in/out`) use
`duration-(--motion-moderate)`; a raw `duration-150` in a component is
drift. `--ease-out-soft` generates the `ease-out-soft` utility via the
Tailwind `--ease-*` namespace.

**Reduced motion is handled once, globally** (`globals.css`): under
`prefers-reduced-motion: reduce`, all transitions and animations collapse
to a single imperceptible frame — end states still apply, movement
disappears. Never add per-component reduced-motion handling, and never
make motion the sole carrier of meaning (every animated state change here
also changes color, border, or content).

**When not to animate:** nothing on page load; nothing that delays
interaction (motion runs alongside, never in front of, the response);
nothing layout-affecting where a compositor-friendly property (transform,
opacity, color) does the job — the header boundary transitions only
`border-color`, overlays animate opacity and scale, and the button press is
a 1px `translate-y`. (Nav hover is deliberately color-only — no underline,
no moving element — so a nav item can later host a dropdown trigger without
the affordance fighting the menu; see `docs/LAYOUT.md` §6.)

## 3. Verified contrast (WCAG AA)

Computed via OKLCH → linear sRGB → relative luminance (WCAG 2.1 formula).
Requirement: 4.5:1 for text pairs, 3:1 for UI boundaries/focus. All pairs pass in
both themes. (Dark column fully recomputed for the 2026-09 charcoal pass, which
lifted the base `0.185 → 0.235` and re-derived the whole ladder, so every dark
pair moved: text-on-dark pairs fell as the surfaces rose beneath them, yet all
stay far above 4.5. As the §4 rebrand guide predicts, the only pairs that
needed intervention were the **destructive composites** — lifting the surface
lightened the composited backdrops and dropped both below 4.5 at the old
values, fixed by raising dark `destructive` 0.73 → 0.78 _and_ dropping the dark
tint alpha `/20 → /15` (both composites now 4.81 / 4.54). The **light column
was recomputed for the 2026-09 body-contrast pass**, which lifted the light
paper (`background 0.968 → 0.978`, `surface/popover → 0.996`, the quiet fills +
sidebar up one step, `border 0.9 → 0.91`): every light pair moved slightly, all
comfortably in the pass band, and — as predicted — the destructive composites
only _rose_ (the lighter surface lightens the composited backdrop under the
dark red), so no destructive intervention was needed in light.)

| Pair                                                          | Requirement | Light | Dark  |
| ------------------------------------------------------------- | ----------- | ----- | ----- |
| foreground / background                                       | 4.5         | 17.50 | 15.97 |
| foreground / surface                                          | 4.5         | 18.43 | 14.07 |
| foreground / popover                                          | 4.5         | 18.43 | 12.38 |
| foreground / muted                                            | 4.5         | 16.11 | 12.83 |
| foreground / secondary                                        | 4.5         | 15.87 | 12.60 |
| foreground / accent                                           | 4.5         | 15.40 | 11.26 |
| muted-foreground / background                                 | 4.5         | 6.69  | 6.01  |
| muted-foreground / surface                                    | 4.5         | 7.05  | 5.30  |
| muted-foreground / popover                                    | 4.5         | 7.05  | 4.66  |
| muted-foreground / muted                                      | 4.5         | 6.16  | 4.83  |
| primary-foreground / primary                                  | 4.5         | 16.39 | 16.50 |
| secondary-foreground / secondary                              | 4.5         | 13.23 | 12.60 |
| accent-foreground / accent                                    | 4.5         | 12.84 | 11.26 |
| success-foreground / success                                  | 4.5         | 4.99  | 7.82  |
| warning-foreground / warning                                  | 4.5         | 8.29  | 10.41 |
| destructive-foreground / destructive                          | 4.5         | 6.13  | 8.44  |
| destructive / background (error text)                         | 4.5         | 6.02  | 7.14  |
| destructive / surface (error text)                            | 4.5         | 6.34  | 6.29  |
| destructive / destructive-tint over surface[^tint]            | 4.5         | 5.41  | 4.81  |
| destructive / input fill over surface[^tint]                  | 4.5         | 4.62  | 4.54  |
| foreground / sidebar                                          | 4.5         | 16.69 | 15.10 |
| sidebar-accent-foreground / sidebar-accent                    | 4.5         | 12.27 | 12.60 |
| ring / background                                             | 3.0         | 11.91 | 7.76  |
| ring / surface                                                | 3.0         | 12.55 | 6.84  |
| ring / input fill over surface[^tint] (focus)                 | 3.0         | 9.13  | 4.93  |
| ring / muted (focus in grouped controls)                      | 3.0         | 10.97 | 6.24  |
| ring / sidebar (focus on sidebar links)                       | 3.0         | 11.36 | 7.34  |
| destructive / input fill over surface (invalid border)[^tint] | 3.0         | 4.62  | 4.54  |
| input / background                                            | 3.0         | 3.29  | 3.51  |
| input / surface                                               | 3.0         | 3.46  | 3.09  |
| primary / background                                          | 3.0         | 16.06 | 14.62 |

[^tint]:
    Composite pairs, added after an axe scan caught dark-mode failures the
    plain pairs missed: destructive text also renders over its own translucent
    tint (`bg-destructive/10`, dark `/15` — Button/Badge destructive variants)
    and over the dark input fill (`--color-input` at 30% over surface; an
    invalid Field cascades `text-destructive` onto the input value). Alpha
    composited in sRGB space before the luminance computation. These pairs are
    why dark `--color-destructive` sits at 0.78 lightness and the dark tint
    alpha at `/15`: the 2026-09 charcoal pass lifted the surface `0.225 →
0.278`, lightening both composited backdrops, so the old 0.73 + `/20` dropped
    them below 4.5 (the tint plateaus as `destructive` rises, because a lighter
    red also lightens its own tinted backdrop — hence the alpha drop as the
    second lever). The light value stays 0.505 (at 0.52 the light input-fill
    composite landed at 4.14).

`--color-border` is excluded by design: it is a decorative separator, not a
component boundary, so WCAG 1.4.11 does not apply to it. Anything that must be
perceived — input borders, focus rings — uses `input`/`ring`, which meet 3:1.

## 4. Rebranding this foundation

Two rebrands have now been executed against this token system, and they
establish two distinct classes of work — budget for the right one:

- **Hue swap (~15 minutes, verified 2026-07):** brand hue 262 → 330 at the
  existing L/C values, radius, and ramp weights — exactly three token files
  touched, all gates green afterwards. Hue-only changes at fixed lightness
  barely move contrast ratios.
- **Identity swap (half a day, verified 2026-07, this palette):** new hue
  family, new lightness architecture (warm paper, near-black primary, flat
  elevation), new typeface, new ramp voice, brand mark and favicon. Still
  overwhelmingly token-value editing — but every lightness change pulls in
  the §3 recomputation, and a handful of things live beyond tokens (listed
  in each step below, so the next rebrand knows the full surface).

Steps, sharpened by the second rebrand:

1. **Pick the palette architecture first, hue second.** Decide what the
   primary action color IS (a saturated hue? the ink itself?) and what
   elevation means (shadows? hairlines? a lightness ladder?) before editing
   values — those two decisions shape every neutral. Current architecture:
   warm paper (hue 84), ink primary, flat elevation.
2. **In `src/styles/light.css` and `dark.css`**, set the values. If you keep
   the L/C architecture and change hue only, you inherit the verified
   contrast. If you change any **lightness**, you owe the full §3
   recompute (step 7) — write the throwaway script (OKLCH → linear sRGB →
   WCAG 2.1; ~60 lines, both prior rebrands used one) rather than checking
   pairs by hand, because the failures land in the composite pairs a
   spot-check misses: **both rebrands' only failures were the destructive
   composites** (text over its own tint / over the input fill).
3. **Elevation is identity too.** The five `--elevation-*` levels per theme
   are the whole shadow contract; emptying `xs`/`sm` (`0 0 0 0` transparent)
   is how this palette went flat — no component changes required, because
   components consume levels, not values.
4. **Status hues** (success `155`, warning `80`, destructive `25`) usually
   stay; keep the L/C bands or re-verify — including the composite pairs.
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
   `src/components/ui/brand-mark.tsx` (one `currentColor` path — it
   inherits theme inversion) and `src/app/icon.svg` (same geometry, hex
   fills computed from the foreground tokens, `prefers-color-scheme` for
   dark browser UI). Keep the two in sync; both carry a comment saying so.
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
