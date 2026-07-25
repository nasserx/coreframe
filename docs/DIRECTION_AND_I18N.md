# Direction & Internationalization

How this foundation supports right-to-left rendering and Arabic typography,
and where a product plugs in message translation. The living demo is
`/showcase/direction`.

## Scope: what the foundation provides

**Provided:** direction as a first-class, lint-guarded concern (logical
properties everywhere), an Arabic-capable font stack with correct vertical
metrics, per-locale direction/numeral configuration, RTL-verified primitives,
**and message translation** — a typed in-repo message layer with a client
locale runtime (see below).

**Message translation.** Ships as `src/i18n` (the typed message layer) plus
`LocaleProvider` in `src/core/providers` (the client runtime — the concrete
Localization slot in `AppProvider`). The two decisions that shaped it:

**Routing: static locale per deployment, plus an optional client runtime — no
locale routing.** The foundation's hard constraint is that every route is
statically prerendered. Each strategy was judged against it: a **cookie**-read
locale opts every route into dynamic rendering (a regression); **domain**
routing needs host detection via middleware; **sub-path `/[locale]/…`** can
stay static with `generateStaticParams` but forces the `/`→`/locale` redirect
through middleware (dynamic), nests the whole route tree under a `[locale]`
segment, and taxes the common case — a single-locale product pays for routing
it never uses. So the base is **build-time static locale** (every route
prerenders in the configured locale), and multi-locale deployments layer a
**client-side switch** modelled exactly on the theme runtime: localStorage +
cross-tab `storage` sync + a pre-paint script that sets `<html lang/dir>` with
no flash. This is the same call the repo already made for theme (a cookie was
rejected there for the identical static-rendering reason). Trade-off: no
per-locale URLs, so a returning non-default-locale visitor gets correct
direction pre-paint but a brief text re-render on hydration, and crawlers see
the default-locale HTML — correct and SEO-clean for a single-locale
deployment. A product needing multiple **indexed** locales from one deployment
adopts sub-path routing then; the message/type/switcher layer sits underneath
it unchanged. Full reasoning: `DECISIONS.md`.

**Library: a typed in-repo solution, not a dependency.** Because the routing
decision means the foundation does not use an i18n library's routing/
negotiation, what remained — message loading, `{placeholder}` interpolation, a
typed accessor — is ~150 lines. Adding next-intl/Paraglide/react-i18next to
use a fraction of it (and ship its runtime on the single-locale common path)
is the opposite of the discipline that removed axios and zustand. `DECISIONS.md`
records the comparison.

The message layer, concretely:

- `src/i18n/messages/en.ts` is the **canonical** catalogue; `<locale>.ts`
  catalogues are typed `: Messages`, so a missing or renamed key fails `tsc`.
- `useTranslations("<ns>")` (client, **active** locale, re-renders on switch)
  and `getTranslations("<ns>")` (server/static, **default** locale — for
  Server Components like `not-found.tsx` and the provider-less
  `global-error.tsx`) resolve keys with `keyof`-checked safety.
- The default catalogue is statically bundled; other locales are code-split
  behind dynamic `import()`, so a single-locale build ships exactly one
  catalogue (measured within 0.2 kB of the pre-i18n build; the second locale
  is a ~1.9 kB gz chunk fetched only on switch, in no route's First Load JS).
- `LOCALE_INFO` (`src/config/app.ts`) stays the single source of truth for a
  locale's direction, numerals, and autonym (`label`); the message layer reads
  it and never restates it — so Arabic messages can never render LTR.

**Primitive strings** localize at the call site (the primitives carry almost no
text): `PaginationPrevious`/`PaginationNext` (`text`, `aria-label`), the
AppShell/SiteShell label props (`skipLinkLabel`, `label`, `closeLabel`,
`unavailableLabel`, the trigger `aria-label`), `ThemeControl.optionLabels` +
`aria-label`, and — added in this pass — `DialogContent`/`DialogFooter`'s
optional `closeLabel` (default `"Close"`). Pass a `useTranslations`/
`getTranslations` value into each. The `(site)` showcase layout is the worked
example.

**Still a product's own responsibility:** ICU pluralization/gender and
locale-aware number/date **formatting** — `translate()` does simple
`{placeholder}` substitution only; formatting utilities belong in `src/utils`
reading `LOCALE_INFO.numerals` (see Numerals below) when a product needs them —
and **per-locale-URL routing** (see the routing decision above).

## Direction architecture

**Single source of truth:** locale configuration in `src/config/app.ts`.

- `APP_LOCALES.SUPPORTED` is `["en", "ar"]`; `LOCALE_INFO` declares
  `direction` and `numerals` per locale.
- `APP_CONFIG.direction` derives from `APP_LOCALES.DEFAULT`, and the root
  layout stamps it as `<html dir=…>` alongside `lang`. A cloning product
  changes **one value** (`DEFAULT`) to flip the deployment's language and
  direction together.

**The default direction is static per deployment; runtime changes come only
from switching _locale_.** Direction follows locale, never the reverse — nobody
wants English rendered right-to-left, so there is no standalone direction
control. The server-rendered `<html dir>` is the configured default (keeping
every route statically prerenderable); when a multi-locale deployment's visitor
selects a locale, `LocaleProvider` sets `lang`/`dir` from `LOCALE_INFO` in one
move (pre-paint on return visits, so direction never flashes). A cookie- or
storage-driven `dir` divorced from a locale choice was rejected: it would force
dynamic rendering or need script gymnastics for no product value. Because all
styling is logical-property based, direction is the entire switch — no
component changes.

A **standalone direction toggle used to live in the showcase header** as an
engineering inspection tool. It was removed in the 2026-07 i18n pass: it read
to a visitor as a broken translation feature, and its real engineering value —
reviewing a page in both directions — belongs to the test suite, which flips
`dir` programmatically for **every** route (`tests/e2e/matrix.ts`), not to the
product surface. The showcase header now carries a real `LocaleControl` (the
language switcher); direction follows the chosen language.

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

- **Stack:** `--font-sans` is `Noto Sans Arabic, Public Sans` (bridged in
  `src/styles/theme.css`) — Arabic-first, but the Noto face is scoped to
  Arabic code points by a `unicode-range` descriptor, so Latin skips it and
  renders in Public Sans. Mixed content gets both faces, correctly, with no
  component involvement.
- **Why the order matters (fallback interception):** `next/font` generates a
  metric-adjusted fallback face for the Latin face from local Arial — and
  Arial _contains Arabic glyphs_. If Noto were listed after the Latin face,
  its fallback would silently intercept every Arabic character and Noto
  would never render (this exact defect shipped once, when the Latin face
  was Geist; the loaded-face check in the browser's `document.fonts` is the
  way to catch it). This hazard is independent of which Latin face is
  loaded — Arabic-first plus `unicode-range` makes interception impossible
  in either direction, and the Noto face's own Arial fallback is disabled
  (`adjustFontFallback: false`) for the same reason.
- **Optical size:** Arabic renders visibly smaller than Latin at equal em,
  and loosening line-height does not fix perceived size. The Arabic face
  carries **`size-adjust: 112%`** (calibrated against the Latin face's
  x-height at body, small, and heading steps). It held at `115%` across the
  first two face swaps (Geist → Archivo → Geist) because those faces share a
  near-identical x-height, but the **2026-10 body-legibility pass** swapped
  Geist → **Public Sans**, whose x-height is measurably smaller (0.517 vs
  Geist's 0.530 em), so the value was recalibrated to `115% × 0.517/0.53 ≈
112%` and re-confirmed empirically by side-by-side screenshot of a mixed
  Latin/Arabic run at those three steps. The lesson: `size-adjust` is a
  function of the Latin face's x-height and must be re-measured on any face
  swap — the font e2e proves Noto still loads AND renders, but not that the
  optical match is right. `size-adjust` scales only glyphs rendered
  _by that face_, so Latin rendering and mixed-direction layout metrics are
  untouched, and Arabic embedded in LTR pages benefits equally. The
  alternative — direction-scoped `--text-*` font-size overrides — was
  rejected: it inflates the em box for _everything_ inside an RTL subtree,
  including embedded Latin, and leaves Arabic-in-LTR unfixed.
- **Loading:** Noto Sans Arabic is self-hosted from
  `src/assets/fonts/noto-sans-arabic-variable.woff2` via `next/font/local`
  (the google loader cannot emit `size-adjust`/`unicode-range` descriptors).
  Still no runtime dependency; the file is the Google-served Arabic-subset
  variable font (~162 KB). It loads on demand when Arabic appears (scoped by
  `unicode-range`), and it is **preloaded only on RTL/Arabic-primary
  deployments** — see _Font preloading_ below.
- **Font preloading (locale-aware).** A `<link rel="preload">` for a font is
  fetched eagerly and **ignores `unicode-range`**, so preloading the ~162 KB
  Arabic face on a Latin-default deployment downloads bytes English pages can
  never paint (the fix in `docs/audit/2026-07-health-audit.md` §1.1). The shipped
  English/LTR default therefore does **not** preload Noto (it loads on demand,
  discovered the moment Arabic renders); an Arabic/RTL default **should**
  preload it. This cannot be derived from `APP_CONFIG` automatically —
  `next/font` requires `preload` to be a written literal — so `src/app/fonts.ts`
  sets `preload: false` and a **compile-time guard couples that literal to
  `APP_CONFIG.direction`**: flip `APP_LOCALES.DEFAULT` to an RTL locale without
  also setting the Noto `preload` to `true` and the build fails at
  `fonts.ts`'s `_NotoPreloadMatchesLocale` assertion, naming the fix. The mono
  face is never preloaded (it only renders in `font-mono` code, never on the
  LCP path). To switch to an Arabic-primary deployment: set the RTL default
  locale **and** set Noto `preload: true` in `src/app/fonts.ts` (the guard
  will remind you).
- **The cost of `adjustFontFallback: false` is Arabic-run CLS — accepted, not
  overlooked.** Because Noto's metric-adjusted fallback is disabled (see
  _fallback interception_ above), Noto is the only one of the three faces with
  no companion fallback: verified in the built CSS, `Public Sans Fallback`
  (`size-adjust: 104.87%`) and `Geist Mono Fallback` (`134.59%`) exist, Noto's
  does not. All ten faces are `font-display: swap`. So on a Latin-default
  deployment — where Noto is correctly not preloaded — an Arabic run first
  paints in an unmatched system font and then **shifts** when Noto swaps in.
  The trade is deliberate and the right way round: re-enabling the fallback
  would reintroduce a defect that actually shipped (Arial's Arabic glyphs
  intercepting the face entirely, so Noto never renders at all), which is
  strictly worse than a layout shift. **Do not re-enable it.** Scope and
  mitigations: the shift affects LTR deployments only, in proportion to how
  much Arabic a Latin page carries; an Arabic-primary deployment preloads Noto
  (see _Font preloading_) and has no unmatched first paint; and `size-adjust`
  keeps the metrics of the face once swapped to stable, so nothing shifts a
  second time. A Latin page carrying substantial Arabic user content can
  preload Noto deliberately, paying 162 KB to remove the shift.
- **License:** Noto Sans Arabic is licensed under the SIL Open Font License,
  Version 1.1; the license accompanies the font at
  `src/assets/fonts/OFL.txt`, as the OFL requires, and must stay next to the
  file in any clone or redistribution of this template.
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
their adjacent punctuation migrates (the classic symptom: a trailing period
or parenthesis of an embedded Latin run jumping to its other end inside
Arabic prose). The foundation's rules:

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

One deliberate exception to mirroring: the `(app)` showcase header pins
`dir="ltr"`. It is the inspection instrument panel — its controls must not jump
to the other side of the screen when the `LocaleControl` it hosts flips the
document to RTL, and its copy is English-only sandbox chrome. Product headers
should mirror — the `(site)` showcase header does (it is translated and mirrors
under Arabic like any product site).

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
2. Add its entry to `LOCALE_INFO` (`direction`, `numerals`, `label` autonym) —
   the `satisfies` clause fails the typecheck until you do.
3. Add its message catalogue: copy `src/i18n/messages/en.ts` to
   `<code>.ts`, declare it `: Messages`, and translate every value — the
   typecheck names any key you miss. Register it in `src/i18n/catalogue.ts`'s
   `CATALOGUE_LOADERS` (`() => import("./messages/<code>").then((m) => m.<code>)`);
   the `Record<AppLocale, …>` type fails the build until you do.
4. If the locale needs a script Public Sans doesn't cover, load a companion face
   via `next/font` in `src/app/layout.tsx` and append its variable to the
   `--font-sans` stack in `src/styles/theme.css` (the Noto Sans Arabic wiring
   is the template).
5. If it is the new deployment **default**, change `APP_LOCALES.DEFAULT` —
   `lang`, `dir`, and numeral configuration follow automatically. Also
   re-point `src/i18n/catalogue.ts`'s static `DEFAULT_CATALOGUE` import (and
   `DefaultCatalogueLocale`) to the new default; the guard there fails the
   build if you forget. If the new default is RTL/Arabic-primary, also set the
   Noto `preload` to `true` in `src/app/fonts.ts` (font preload cannot
   auto-derive; the compile-time guard there fails the build until you do — see
   _Font preloading_ above).
6. For an RTL locale, review `/showcase/direction`, `/showcase/site` (the
   translated proof surface), and the `[dir="rtl"]` ramp metrics — retune the
   token values if the script's rhythm differs from Arabic.
7. With more than one supported locale, `LocaleControl` appears automatically
   (it renders nothing for a single-locale deployment). Place it in your
   product chrome where a language switch belongs.
