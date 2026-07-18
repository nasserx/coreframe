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

- **Stack:** `--font-sans` is `Noto Sans Arabic, Geist` (bridged in
  `src/styles/theme.css`) — Arabic-first, but the Noto face is scoped to
  Arabic code points by a `unicode-range` descriptor, so Latin skips it and
  renders in Geist. Mixed content gets both faces, correctly, with no
  component involvement.
- **Why the order matters (fallback interception):** `next/font` generates a
  metric-adjusted fallback face for Geist from local Arial — and Arial
  _contains Arabic glyphs_. If Noto were listed after Geist, `"Geist
Fallback"` would silently intercept every Arabic character and Noto would
  never render (this exact defect shipped once; the loaded-face check in the
  browser's `document.fonts` is the way to catch it). Arabic-first plus
  `unicode-range` makes interception impossible in either direction; the
  Noto face's own Arial fallback is disabled (`adjustFontFallback: false`)
  for the same reason.
- **Optical size:** Arabic renders visibly smaller than Latin at equal em,
  and loosening line-height does not fix perceived size. The Arabic face
  carries **`size-adjust: 115%`** (calibrated visually against Geist at
  body, small, and heading steps). `size-adjust` scales only glyphs rendered
  _by that face_, so Latin rendering and mixed-direction layout metrics are
  untouched, and Arabic embedded in LTR pages benefits equally. The
  alternative — direction-scoped `--text-*` font-size overrides — was
  rejected: it inflates the em box for _everything_ inside an RTL subtree,
  including embedded Latin, and leaves Arabic-in-LTR unfixed.
- **Loading:** Noto Sans Arabic is self-hosted from
  `src/assets/fonts/noto-sans-arabic-variable.woff2` via `next/font/local`
  (the google loader cannot emit `size-adjust`/`unicode-range` descriptors).
  Still no runtime dependency; the file is the Google-served Arabic-subset
  variable font (~162 KB), preloaded so Arabic never paints in a fallback.
  A Latin-only product can set `preload: false` to defer the download until
  Arabic text appears.
- **Vertical metrics:** a Latin-tuned ramp renders Arabic cramped. The type
  ramp compensates **through the token layer**: `[dir="rtl"]` overrides in
  `src/styles/theme.css` loosen every step's line-height (e.g. display
  1.1 → 1.25, body 1.6 → 1.75) and zero all letter-spacing — tracking,
  positive or negative, visually breaks the connected Arabic script. The
  generated `text-*` utilities read these custom properties at runtime, so
  the overrides apply to any `dir="rtl"` subtree with no extra classes.
- `--font-mono` stays Latin-only: code is Latin-script by convention; Arabic
  inside code blocks falls back to system fonts.

## Bidi isolation

Direction handles _layout_; the Unicode bidi algorithm handles _inline
text_ — and opposite-direction runs inside prose need explicit isolation or
their adjacent punctuation migrates (the classic
`.docs/DIRECTION_AND_I18N.md` symptom). The foundation's rules:

1. **Code is LTR, always.** A base rule in `src/app/globals.css` gives
   `code`, `kbd`, `samp`, and `pre` `direction: ltr; unicode-bidi: isolate`,
   so identifiers, paths, and snippets render correctly inside RTL prose
   with no markup effort. Mark up identifiers as `<code>` and this is
   automatic.
2. **Inline opposite-direction runs use `<bdi>`.** Latin brand names,
   product names, or phrases inside Arabic prose (and vice versa) are
   wrapped in native `<bdi>` — first-strong isolation, no CSS, no
   component. See the mixed-content section of `/showcase/direction`.
3. **Blocks of unknown or opposite direction use `dir="auto"`.** Prose whose
   language isn't statically known (user content, CMS strings, the showcase's
   English descriptions under the RTL toggle) gets `dir="auto"` on the block:
   first-strong detection sets both direction and alignment per element.

No primitive was added for this: HTML already ships the right tools
(`<bdi>`, `dir="auto"`), a wrapper component would add nothing but
indirection, and the only rule that benefits from central enforcement —
code-is-LTR — lives in the base stylesheet.

## Breadcrumb (and mirrored chrome) in RTL

A mirrored breadcrumb is **correct**: established RTL interfaces (Windows
Explorer in Arabic, Arabic storefronts, Material/Fluent RTL guidance) run
the trail from the inline-start — root at the _right_, separators pointing
_left_ toward the descendant, current page leftmost. Reading right-to-left
yields ancestor → child order. The primitive does this by default (flex
follows `dir`; the separator chevron flips via `rtl:rotate-180`) — callers
never reorder items. Note the perception trap: a trail with _English_ labels
inspected under RTL reads "backwards" to an LTR reader; that is the reader's
direction, not a component defect (verified by geometry: root at
inline-start in both directions).

One deliberate exception to mirroring: the showcase header pins `dir="ltr"`.
It is the inspection instrument panel — its controls must not jump to the
other side of the screen when the direction toggle they host is pressed, and
its copy is English-only sandbox chrome. Product headers should mirror.

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
