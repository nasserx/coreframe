# Direction & Internationalization

How this foundation supports right-to-left rendering and Arabic typography,
and where a product plugs in message translation. The living demo is
`/showcase/direction`.

## Scope: what the foundation provides — and deliberately does not

**Provided:** direction as a first-class, lint-guarded concern (logical
properties everywhere), an Arabic-capable font stack with correct vertical
metrics, per-locale direction/numeral configuration, and RTL-verified
primitives.

**Not provided: message translation.** An i18n library (message catalogs,
locale routing, pluralization) is a product decision — it dictates routing
shape (`/[locale]/…` segments, domains, or cookies), bundling, and content
workflow, none of which a domain-neutral foundation should preempt. The
integration points a product uses to add it:

- `src/config/app.ts` — `APP_LOCALES` / `LOCALE_INFO` already model the locale
  set; an i18n library's locale list should be derived from (or replace) this.
- `src/app/layout.tsx` — `lang` and `dir` currently come from `APP_CONFIG`;
  a locale-routed app moves this to the `[locale]` segment layout and sets
  both per request (this is the point where prerendering strategy becomes the
  product's decision).
- Primitive strings — the primitives carry almost no text; what exists is
  prop-overridable and must be localized at the call site:
  `PaginationPrevious`/`PaginationNext` (`text`, `aria-label`),
  `DialogFooter`'s close button label, and any `aria-label` you pass.
- `src/core/providers/app-provider.tsx` — the documented slot for a
  localization provider (see its TODO).

## Direction architecture

**Single source of truth:** locale configuration in `src/config/app.ts`.

- `APP_LOCALES.SUPPORTED` is `["en", "ar"]`; `LOCALE_INFO` declares
  `direction` and `numerals` per locale.
- `APP_CONFIG.direction` derives from `APP_LOCALES.DEFAULT`, and the root
  layout stamps it as `<html dir=…>` alongside `lang`. A cloning product
  changes **one value** (`DEFAULT`) to flip the deployment's language and
  direction together.

**Direction is static per deployment.** Rationale: direction follows locale;
runtime _locale_ switching requires routing and translation decisions that
belong to the product, and a runtime _direction_ toggle without a locale
switch is not a real product behavior. Static direction also keeps every
route statically prerenderable — a cookie- or storage-driven `dir` would
either force dynamic rendering or need pre-paint script gymnastics for no
product value. Because all styling is logical-property based, a product that
later adds locale routing only has to set `dir` per request/segment — no
component changes.

The showcase header's LTR/RTL control is an **inspection tool** (a showcase
feature component, not a primitive): it flips `document.documentElement.dir`
ephemerally so every page can be reviewed in both directions.

## The logical-property rule

All direction-sensitive styling uses CSS logical properties via Tailwind's
logical utilities:

| Physical (banned)                         | Logical                     |
| ----------------------------------------- | --------------------------- |
| `ml-` / `mr-`                             | `ms-` / `me-`               |
| `pl-` / `pr-`                             | `ps-` / `pe-`               |
| `left-` / `right-`                        | `start-` / `end-`           |
| `text-left` / `text-right`                | `text-start` / `text-end`   |
| `rounded-l-` / `rounded-r-` (and corners) | `rounded-s-` / `rounded-e-` |
| `border-l` / `border-r`                   | `border-s` / `border-e`     |

Enforced by the custom ESLint rule
`foundation/no-physical-tailwind-classes` (defined inline in
`eslint.config.mjs`, scoped to `src/**`): it fails the lint when a physical
utility appears in any string literal or template chunk. `translate-x-*` is
deliberately not banned — translation is direction-neutral (centering,
motion), not start/end alignment.

**Escape hatch** for the rare genuinely-physical case (e.g. aligning to a
physical screen edge for an OS-anchored affordance):

```tsx
// eslint-disable-next-line foundation/no-physical-tailwind-classes -- physical edge intentional: <reason>
<div className="right-0 …" />
```

The justification comment is mandatory by convention; a disable without a
reason should not survive review.

Two related conventions:

- **Centered overlays** (Dialog, AlertDialog) use the direction-neutral
  over-constrained pattern — `fixed inset-x-0 mx-auto` + `max-w-*` — instead
  of `left-1/2 -translate-x-1/2`. With both horizontal insets set and both
  margins `auto`, CSS resolves the margins equally in LTR and RTL.
- **Directional icons flip individually**, not via wholesale mirroring:
  pagination chevrons and the breadcrumb separator carry `rtl:rotate-180`.
  Symmetric icons (close, alert, …) are untouched. When adding an icon that
  encodes reading direction, add `rtl:rotate-180` to that icon only.

## Fonts and Arabic metrics

- **Stack:** `--font-sans` is `Geist, Noto Sans Arabic` (bridged in
  `src/styles/theme.css`). Geist has no Arabic glyphs, so Latin renders in
  Geist and Arabic falls through to Noto Sans Arabic — mixed content gets
  both, correctly, with no component involvement.
- **Why Noto Sans Arabic:** comprehensive glyph and diacritic coverage, a
  variable weight axis matching the ramp's 400–700 usage, neutral design
  that harmonizes with a grotesque Latin sans, and availability through
  `next/font/google` — no new dependency.
- **Performance:** `next/font` self-hosts and preloads the subsetted files
  and generates metric-adjusted fallbacks, so the addition is neither
  render-blocking nor a layout-shift source. Subsets: `latin` for Geist,
  `arabic` for Noto Sans Arabic.
- **Vertical metrics:** a Latin-tuned ramp renders Arabic cramped. The type
  ramp compensates **through the token layer**: `[dir="rtl"]` overrides in
  `src/styles/theme.css` loosen every step's line-height (e.g. display
  1.1 → 1.25, body 1.6 → 1.75) and zero all letter-spacing — tracking,
  positive or negative, visually breaks the connected Arabic script. The
  generated `text-*` utilities read these custom properties at runtime, so
  the overrides apply to any `dir="rtl"` subtree with no extra classes.
  Font sizes are unchanged: Noto Sans Arabic's loop height holds its own at
  the Latin sizes, and per-direction sizes would make mixed-direction
  layouts unpredictable.
- `--font-mono` stays Latin-only: code is Latin-script by convention; Arabic
  inside code blocks falls back to system fonts.

## Numerals

Default: **Western digits (0–9, Unicode `latn`) for every locale, including
Arabic** — the prevailing convention in modern Arabic product UIs (commerce,
dashboards, government portals). Configurable per locale in `LOCALE_INFO`:
set `ar.numerals` to `"arab"` for Eastern Arabic-Indic (٠–٩). The value is a
Unicode numbering-system key, designed to be passed to `Intl` formatters:

```ts
new Intl.NumberFormat(`ar-u-nu-${LOCALE_INFO.ar.numerals}`).format(n);
```

The foundation ships no formatting utilities yet (`src/utils` is
intentionally empty); when a product adds them, they must read
`LOCALE_INFO`, never hardcode a numbering system.

## How to add a locale

1. Add the code to `APP_LOCALES.SUPPORTED` in `src/config/app.ts`.
2. Add its entry to `LOCALE_INFO` (`direction`, `numerals`) — the
   `satisfies` clause fails the typecheck until you do.
3. If the locale needs a script Geist doesn't cover, load a companion face
   via `next/font` in `src/app/layout.tsx` and append its variable to the
   `--font-sans` stack in `src/styles/theme.css` (the Noto Sans Arabic wiring
   is the template).
4. If it is the new deployment default, change `APP_LOCALES.DEFAULT` — `lang`,
   `dir`, and numeral configuration follow automatically.
5. For an RTL locale, review `/showcase/direction` and the `[dir="rtl"]`
   ramp metrics — retune the token values if the script's rhythm differs
   from Arabic.
6. Message translation: see the scope section above — that part is yours.
