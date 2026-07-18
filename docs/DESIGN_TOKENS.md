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
The same applies to motion: Tailwind's default `duration-*`/`ease-*` utilities are
the motion contract until a real product need says otherwise.

**Stacking:** overlay primitives use the shadcn `z-50` convention; the foundation
defines no z-index tokens.

## 2. Token reference

### Colors (semantic, per theme)

One brand hue — **oklch hue 262, a restrained indigo-blue** — drives the entire
palette. Neutrals carry trace chroma (0.002–0.025) of the same hue; status colors
share the brand's chroma/lightness band so they read as one system.

| Token                                | Light                             | Dark                              |
| ------------------------------------ | --------------------------------- | --------------------------------- |
| `--color-background`                 | `oklch(0.977 0.004 262)`          | `oklch(0.16 0.015 262)`           |
| `--color-foreground`                 | `oklch(0.185 0.025 262)`          | `oklch(0.96 0.005 262)`           |
| `--color-surface`                    | `oklch(0.995 0.002 262)`          | `oklch(0.205 0.018 262)`          |
| `--color-surface-foreground`         | `oklch(0.185 0.025 262)`          | `oklch(0.96 0.005 262)`           |
| `--color-popover`                    | `oklch(0.995 0.002 262)`          | `oklch(0.25 0.02 262)`            |
| `--color-popover-foreground`         | `oklch(0.185 0.025 262)`          | `oklch(0.96 0.005 262)`           |
| `--color-primary`                    | `oklch(0.47 0.17 262)`            | `oklch(0.72 0.13 262)`            |
| `--color-primary-foreground`         | `oklch(0.985 0.005 262)`          | `oklch(0.16 0.015 262)`           |
| `--color-secondary`                  | `oklch(0.945 0.01 262)`           | `oklch(0.28 0.03 262)`            |
| `--color-secondary-foreground`       | `oklch(0.3 0.05 262)`             | `oklch(0.96 0.005 262)`           |
| `--color-muted`                      | `oklch(0.955 0.006 262)`          | `oklch(0.27 0.02 262)`            |
| `--color-muted-foreground`           | `oklch(0.5 0.03 262)`             | `oklch(0.72 0.02 262)`            |
| `--color-accent`                     | `oklch(0.945 0.015 262)`          | `oklch(0.3 0.04 262)`             |
| `--color-accent-foreground`          | `oklch(0.3 0.06 262)`             | `oklch(0.96 0.005 262)`           |
| `--color-success`                    | `oklch(0.52 0.12 155)`            | `oklch(0.7 0.13 155)`             |
| `--color-success-foreground`         | `oklch(0.985 0.005 155)`          | `oklch(0.16 0.015 155)`           |
| `--color-warning`                    | `oklch(0.82 0.14 80)`             | `oklch(0.8 0.13 80)`              |
| `--color-warning-foreground`         | `oklch(0.28 0.05 80)`             | `oklch(0.16 0.015 80)`            |
| `--color-destructive`                | `oklch(0.52 0.17 25)`             | `oklch(0.64 0.17 25)`             |
| `--color-destructive-foreground`     | `oklch(0.985 0.005 25)`           | `oklch(0.16 0.015 25)`            |
| `--color-border`                     | `oklch(0.9 0.008 262)`            | `oklch(0.31 0.02 262)`            |
| `--color-input`                      | `oklch(0.62 0.02 262)`            | `oklch(0.52 0.025 262)`           |
| `--color-ring`                       | `oklch(0.55 0.15 262)`            | `oklch(0.68 0.12 262)`            |
| `--color-chart-1`                    | `oklch(0.55 0.15 262)`            | `oklch(0.68 0.13 262)`            |
| `--color-chart-2`                    | `oklch(0.62 0.1 195)`             | `oklch(0.7 0.11 195)`             |
| `--color-chart-3`                    | `oklch(0.6 0.12 155)`             | `oklch(0.72 0.12 155)`            |
| `--color-chart-4`                    | `oklch(0.75 0.13 85)`             | `oklch(0.8 0.12 85)`              |
| `--color-chart-5`                    | `oklch(0.58 0.15 25)`             | `oklch(0.68 0.14 25)`             |
| `--color-sidebar`                    | `oklch(0.962 0.006 262)`          | `oklch(0.185 0.016 262)`          |
| `--color-sidebar-foreground`         | `var(--color-foreground)`         | `var(--color-foreground)`         |
| `--color-sidebar-primary`            | `var(--color-primary)`            | `var(--color-primary)`            |
| `--color-sidebar-primary-foreground` | `var(--color-primary-foreground)` | `var(--color-primary-foreground)` |
| `--color-sidebar-accent`             | `oklch(0.93 0.012 262)`           | `oklch(0.27 0.03 262)`            |
| `--color-sidebar-accent-foreground`  | `oklch(0.3 0.05 262)`             | `oklch(0.96 0.005 262)`           |
| `--color-sidebar-border`             | `var(--color-border)`             | `var(--color-border)`             |
| `--color-sidebar-ring`               | `var(--color-ring)`               | `var(--color-ring)`               |

Design notes:

- **Surface ladder.** Light: `background 0.977 → surface 0.995`, elevation carried
  by shadows. Dark: `background 0.16 → surface 0.205 → popover 0.25` — each level
  is a visible lightness step; borders are the secondary cue.
- **Status colors in dark invert to light fills with ink text**, matching primary,
  so every filled status surface keeps AA text contrast.
- **`--color-border` is a decorative separator** and intentionally subtle; it is
  not used to convey meaning. **`--color-input` is a control boundary** and holds
  ≥3:1 against background and surface in both themes (WCAG 1.4.11), as does
  `--color-ring` (focus indicator).

### Elevation (`--elevation-*`, per theme)

Bridged to Tailwind as `shadow-xs | sm | md | lg | xl` — these five are the
elevation contract; avoid other shadow utilities.

- **Light:** layered key + ambient shadows tinted with the foreground ink
  (`oklch(0.185 0.025 262 / 0.05–0.12)`), from `0 1px 2px` (xs) to
  `0 8px 16px + 0 18px 44px` (xl).
- **Dark:** drop shadows are nearly invisible on dark surfaces, so **elevation is
  carried by the surface lightness ladder**; the `--elevation-*` values are
  heavier pure-black shadows (`oklch(0 0 0 / 0.35–0.5)`) that only ground
  floating layers against what is behind them.

### Type ramp (`--text-*`, theme-neutral, in `theme.css`)

Generates `text-<step>` utilities carrying size, line-height, letter-spacing, and
weight together:

| Step         | Size     | Line-height | Letter-spacing | Weight |
| ------------ | -------- | ----------- | -------------- | ------ |
| `display`    | 2.75rem  | 1.1         | −0.02em        | 700    |
| `title`      | 2rem     | 1.2         | −0.015em       | 700    |
| `heading`    | 1.5rem   | 1.3         | −0.01em        | 600    |
| `subheading` | 1.25rem  | 1.4         | −0.005em       | 600    |
| `body-lg`    | 1.125rem | 1.65        | 0              | 400    |
| `body`       | 1rem     | 1.6         | 0              | 400    |
| `small`      | 0.875rem | 1.5         | 0              | 400    |
| `caption`    | 0.75rem  | 1.35        | +0.01em        | 500    |

**There is deliberately no `--font-heading`.** Headings and body share one family
(Geist Sans via `next/font`, `--font-sans`); the heading voice comes from weight
and negative tracking in the ramp. One family means no extra font payload, no
second FOUT source, and a calmer identity; a product wanting a display face adds a
`next/font` instance and a `--font-heading` bridge entry back.

### Radius

`--radius-base: 0.625rem` in `base.css` (theme-neutral). Every `rounded-*` step in
the bridge derives from it by multiplication (`sm ×0.6 … 4xl ×2.6`).

## 3. Verified contrast (WCAG AA)

Computed via OKLCH → linear sRGB → relative luminance (WCAG 2.1 formula).
Requirement: 4.5:1 for text pairs, 3:1 for UI boundaries/focus. All pairs pass in
both themes.

| Pair                                       | Requirement | Light | Dark  |
| ------------------------------------------ | ----------- | ----- | ----- |
| foreground / background                    | 4.5         | 17.45 | 17.28 |
| foreground / surface                       | 4.5         | 18.38 | 15.95 |
| foreground / popover                       | 4.5         | 18.38 | 14.25 |
| foreground / muted                         | 4.5         | 16.36 | 13.42 |
| foreground / secondary                     | 4.5         | 15.88 | 13.00 |
| foreground / accent                        | 4.5         | 15.88 | 12.16 |
| muted-foreground / background              | 4.5         | 5.62  | 7.83  |
| muted-foreground / surface                 | 4.5         | 5.92  | 7.22  |
| muted-foreground / popover                 | 4.5         | 5.92  | 6.45  |
| muted-foreground / muted                   | 4.5         | 5.26  | 6.08  |
| primary-foreground / primary               | 4.5         | 6.75  | 7.76  |
| secondary-foreground / secondary           | 4.5         | 11.64 | 13.00 |
| accent-foreground / accent                 | 4.5         | 11.66 | 12.16 |
| success-foreground / success               | 4.5         | 4.99  | 7.66  |
| warning-foreground / warning               | 4.5         | 8.29  | 10.27 |
| destructive-foreground / destructive       | 4.5         | 5.75  | 5.34  |
| destructive / background (error text)      | 4.5         | 5.63  | 5.33  |
| destructive / surface (error text)         | 4.5         | 5.93  | 4.92  |
| foreground / sidebar                       | 4.5         | 16.70 | 16.60 |
| sidebar-accent-foreground / sidebar-accent | 4.5         | 11.13 | 13.43 |
| ring / background                          | 3.0         | 4.63  | 6.68  |
| ring / surface                             | 3.0         | 4.88  | 6.17  |
| input / background                         | 3.0         | 3.41  | 3.52  |
| input / surface                            | 3.0         | 3.59  | 3.25  |
| primary / background                       | 3.0         | 6.60  | 7.76  |

`--color-border` is excluded by design: it is a decorative separator, not a
component boundary, so WCAG 1.4.11 does not apply to it. Anything that must be
perceived — input borders, focus rings — uses `input`/`ring`, which meet 3:1.

## 4. Rebranding this foundation (~15 minutes)

Everything below is token-value editing only — no component changes.

1. **Pick the brand hue** (an OKLCH hue angle, 0–360). Current: `262`.
2. **In `src/styles/light.css` and `dark.css`**, replace the hue component
   (`262`) in every `oklch(L C H)` value with your hue. Keep the L/C values —
   they encode the verified contrast and the elevation ladder. This alone
   rebrands the neutrals, primary, ring, and chart-1.
3. **Tune primary if needed:** adjust `--color-primary`'s chroma (saturation)
   in both files; stay near the existing lightness (`0.47` light / `0.72` dark)
   or re-verify contrast.
4. **Status hues** (success `155`, warning `80`, destructive `25`) usually stay;
   if you change them, keep the existing L/C bands.
5. **Radius personality:** edit `--radius-base` in `src/styles/base.css`
   (sharper `0.375rem`, rounder `0.875rem`) — every `rounded-*` step follows.
6. **Type voice:** edit the `--text-*` steps in `src/styles/theme.css`
   (sizes, weights, tracking). To swap the typeface, change the `next/font`
   loaders in `src/app/layout.tsx`; the `--font-geist-*` variable names flow
   through the bridge unchanged.
7. **Verify:** any change to a color's **lightness** requires re-running the
   contrast check. Recompute the Section 3 pairs (OKLCH → sRGB → WCAG ratio;
   any OKLCH-aware contrast tool works) and fix values until they pass, then
   update the table. Hue-only changes at fixed L barely move ratios but check
   the filled status pairs anyway.
8. Open `/showcase/tokens` in both themes — every swatch shows its resolved
   value, and the ramp/elevation/radius sections reflect your edits live.
