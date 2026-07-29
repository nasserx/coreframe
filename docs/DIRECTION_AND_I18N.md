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
text): `PaginationPrevious`/`PaginationNext` (`text`, `aria-label`),
`PaginationEllipsis` (`label`), the AppShell/SiteShell label props
(`skipLinkLabel`, `label`, `closeLabel`,
`unavailableLabel`, the trigger `aria-label`), `ThemeControl.optionLabels` +
`aria-label`, and `DialogContent`/`DialogFooter`'s optional `closeLabel`
(default `"Close"`). Pass a `useTranslations`/
`getTranslations` value into each. The `(site)` showcase layout is the worked
example.

The production marketing route uses the same boundary discipline. Its Server
Component layout and page retain route and visual-slot ownership; the root
layout owns one canonical, server-rendered metadata title and description from
`APP_CONFIG`. That metadata does not switch with the client locale. One
feature-local client composition translates the SiteShell labels/chrome, and
one page-content client composition subscribes the visible landing copy to the
active catalogue. Server-rendered children and the decorative preview are
passed through those boundaries as slots, so they do not enter the importing
client module graphs. Combining both client compositions would move page
ownership into the layout; freezing either to `getTranslations` would stop its
visible copy following the live locale switch.

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

- **Stack:** `--font-sans` is `Tajawal, Inter, system fallbacks` (bridged in
  `src/styles/theme.css`). Tajawal comes first, but the four vendored faces
  contain only the official Arabic subsets and repeat their `unicode-range`;
  Latin letters and Western numerals therefore fall through to Inter. Mixed
  content gets both families without component-level font classes.
- **Loading and weights:** Inter is loaded through `next/font/google` at the
  reference's exact authored weights 400, 500, 600, 700, and 800. Its semantic
  contract uses 500 body/supporting copy, 600 UI labels, navigation, compact
  titles, and prominent CTAs, and headings/current titles at 700/800. Tajawal is loaded through `next/font/local` from
  `src/assets/fonts/tajawal-arabic-{400,500,700,800}.woff2`. Tajawal publishes
  no 600 face: existing authored 600 requests remain semantically 600 and the
  browser resolves them to its nearest available 700 face. Component APIs and
  geometry do not change to compensate for that discrete family limitation.
- **Why the Arabic face stays local and Arabic-only:** the Google Tajawal family
  also ships Latin faces. Putting the complete family first would render Latin
  in Tajawal and defeat the bilingual contract; putting it after Inter would
  let a Latin metric fallback intercept Arabic. The Arabic-only
  local files avoid both failure modes. Tajawal's own metric fallback remains
  disabled (`adjustFontFallback: false`) for the same interception reason.
- **Font preloading (locale-aware):** a font preload is fetched eagerly and
  ignores `unicode-range`. The English/LTR default therefore loads Tajawal on
  demand only when Arabic renders; an Arabic-primary deployment should set its
  literal `preload` option to `true`. `next/font` requires that option to be a
  written literal, so `_TajawalPreloadMatchesLocale` couples it to
  `APP_CONFIG.direction` at typecheck time. Geist Mono is also on-demand because
  code is not an LCP face.
- **Fallback trade-off:** disabling Tajawal's metric fallback prevents silent
  interception but means Arabic on an English-primary page can first paint in a
  system face and shift once Tajawal loads. Arabic-primary deployments avoid
  that swap by preloading. Do not re-enable the Arial fallback to hide CLS; it
  would make the intended Arabic face unreachable.
- **License:** Tajawal is SIL Open Font License 1.1. Its notice at
  `src/assets/fonts/OFL.txt` must stay beside the vendored subset files.
- **Vertical metrics:** a Latin-tuned ramp renders Arabic cramped. The type
  ramp compensates **through the token layer**: `[dir="rtl"]` overrides in
  `src/styles/theme.css` give Tajawal independently reviewed leading (e.g.
  display 1.05 → 1.2, body 1.5 → 1.65, small 1.45 → 1.6) and zero all
  letter-spacing — tracking,
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
4. If the locale needs a script Inter does not cover, load a script-scoped
   companion face through `next/font` in `src/app/fonts.ts` and append its
   variable before Inter in `src/styles/theme.css` (the Tajawal wiring is the
   template). Ensure the companion cannot intercept Latin.
5. If it is the new deployment **default**, change `APP_LOCALES.DEFAULT` —
   `lang`, `dir`, and numeral configuration follow automatically. Also
   re-point `src/i18n/catalogue.ts`'s static `DEFAULT_CATALOGUE` import (and
   `DefaultCatalogueLocale`) to the new default; the guard there fails the
   build if you forget. If the new default is RTL/Arabic-primary, also set the
   Tajawal `preload` to `true` in `src/app/fonts.ts` (font preload cannot
   auto-derive; the compile-time guard there fails the build until you do — see
   _Font preloading_ above).
6. For an RTL locale, review `/showcase/direction`, `/showcase/site` (the
   translated proof surface), and the `[dir="rtl"]` ramp metrics — retune the
   token values if the script's rhythm differs from Arabic.
7. With more than one supported locale, `LocaleControl` appears automatically
   (it renders nothing for a single-locale deployment). Place it in your
   product chrome where a language switch belongs.
