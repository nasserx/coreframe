import { Geist_Mono, Public_Sans } from "next/font/google";
import localFont from "next/font/local";

import type { AppConfig } from "@/config";

/*
 * Font preloading is deliberately scoped (docs/audit/2026-07-health-audit.md
 * §1.1). A `<link rel="preload">` for a font is fetched eagerly and —
 * critically — IGNORES the face's `unicode-range`, so preloading a face a page
 * cannot paint is pure waste. next/font preloads every declared face by
 * default, so the two non-body faces below opt out:
 *
 * - Arabic face: not preloaded on the shipped LTR/English default (it would
 *   cost ~162 KB per page for glyphs Latin content never shows). It is coupled
 *   to the configured locale via the compile-time guard further down — an
 *   RTL/Arabic-default clone flips the literal to `true` and the build enforces
 *   it. (Why a literal and not a computed value: next/font forbids non-literal
 *   loader options.)
 * - Mono face: never preloaded. It only renders where a component applies
 *   `font-mono` (code/`<pre>`), which is never LCP and absent from most pages
 *   (e.g. the home page renders no code). Without a preload the browser fetches
 *   it on demand the first time code appears — a negligible swap on non-critical
 *   text — and pages with no code never download it at all.
 */

/*
 * Font setup shared by the root layout AND global-error.tsx — global-error
 * replaces the root layout when it fires, so it must mount the same font
 * variables itself or error pages would render in the fallback stack.
 */

/*
 * The identity face — one family for headlines AND body, deliberately
 * (docs/DESIGN_TOKENS.md §2: there is no --font-heading). Public Sans is a
 * neutral Helvetica-adjacent grotesk (US Web Design System's workhorse face,
 * Libre Franklin lineage): a single variable wght axis covers 100–900, so the
 * ramp's heavy display steps (800) and comfortable body text (400) come from
 * one latin-subset woff2.
 *
 * It was adopted in the 2026-10 body-legibility pass over Geist because Geist's
 * body copy read thin and lacked presence, and MEASUREMENT — not eyeballing —
 * proved the cause was the FACE, not weight: at 400, Geist has among the
 * lightest vertical stems of any OFL grotesk (three prior weight bumps failed
 * because weight was never the variable). Public Sans carries the heaviest
 * lowercase stem of the eight faces specimen-tested (+7–8% over Geist) while
 * staying an unambiguously neutral grotesk, and its set width is only ~1%
 * wider than Geist's, so the layout barely moved. The full specimen method,
 * the measurement table that drove the choice, and why the geometric/humanist
 * candidates were rejected on the numbers live in docs/DESIGN_TOKENS.md §
 * "Type ramp" — the next person who suspects the body face is too light must
 * MEASURE, not guess. The headline voice — large, heavy, negative tracking,
 * compact leading — lives in the type ramp tokens (src/styles/theme.css).
 *
 * License: SIL Open Font License 1.1 (as is Geist Mono's). The file is
 * fetched and self-hosted by next/font at build time; the OFL notice ships
 * embedded in the font's own name/license metadata. Only Noto below has a
 * license file in-repo, because only its woff2 lives in-repo.
 */
export const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

/* Code face — Geist Mono. It stays the code face across the Public Sans swap:
 * a monospaced grotesk pairs cleanly with Public Sans, and the code face is an
 * independent decision from the identity sans (docs/DESIGN_TOKENS.md §
 * "Type ramp"). Not preloaded (see the locale-aware preload note at the top of
 * this file): mono renders only where `font-mono` is applied (code/`<pre>`),
 * never on the LCP path, so it loads on demand instead of competing with first
 * paint. */
export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

/*
 * Arabic companion face (self-hosted variable font, Arabic subset). Public
 * Sans has no Arabic glyphs, so the sans stack in src/styles/theme.css lists
 * this FIRST, scoped to Arabic code points by the unicode-range below: Latin
 * skips it and renders in Public Sans, Arabic renders here. next/font self-hosts
 * the file; whether it is preloaded is locale-aware (see PRELOAD_ARABIC and
 * the note at the top of this file) — an RTL/Arabic-default deployment
 * preloads it, a Latin-default one lets it load on demand so English pages
 * never fetch a font they cannot paint.
 *
 * Loaded via next/font/local (not google) because the face needs a
 * `size-adjust` descriptor: Arabic renders optically smaller than Latin at
 * equal em, and size-adjust scales only this face's glyphs — Latin rendering
 * and mixed-direction layout metrics stay untouched (docs/DIRECTION_AND_I18N.md).
 * Leading compensation lives in the ramp's [dir="rtl"] overrides
 * (src/styles/theme.css).
 *
 * `preload` is a written literal — `false` here, matching the shipped
 * LTR/English default. It CANNOT be derived from APP_CONFIG at build time:
 * next/font rejects any non-literal loader value ("Font loader values must be
 * explicitly written literals"), and it registers a preload for every declared
 * instance (so a two-instance "mount the one you want" trick still preloads
 * both — verified). An RTL/Arabic-default clone flips this to `true`; the
 * NOTO_PRELOAD guard below fails the build if that flip is forgotten, so the
 * coupling to the locale is enforced even though it can't be computed. See
 * docs/DIRECTION_AND_I18N.md § Font preloading.
 *
 * License: SIL Open Font License 1.1 — src/assets/fonts/OFL.txt must ship
 * alongside the font file.
 */
export const notoSansArabic = localFont({
  src: "../assets/fonts/noto-sans-arabic-variable.woff2",
  variable: "--font-noto-sans-arabic",
  weight: "100 900",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    // size-adjust matches Noto's x-height to the Latin identity face's, so
    // mixed Latin/Arabic runs sit optically level. Recalibrated from 115%
    // (Geist) to 112% in the 2026-10 Public Sans pass: Public Sans has a
    // slightly smaller x-height than Geist (measured 0.517 vs 0.53 em), so
    // Noto is scaled down to match (115% × 0.517/0.53 ≈ 112%), then confirmed
    // empirically by side-by-side screenshot at body, small, and heading steps
    // (docs/DIRECTION_AND_I18N.md § Font metrics). The font e2e still asserts
    // Noto loads AND is used (tests/e2e/fonts.spec.ts).
    { prop: "size-adjust", value: "112%" },
    {
      prop: "unicode-range",
      value:
        "U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC, U+102E0-102FB, U+10E60-10E7E, U+10EC2-10EC4, U+10EFC-10EFF, U+1EE00-1EE03, U+1EE05-1EE1F, U+1EE21-1EE22, U+1EE24, U+1EE27, U+1EE29-1EE32, U+1EE34-1EE37, U+1EE39, U+1EE3B, U+1EE42, U+1EE47, U+1EE49, U+1EE4B, U+1EE4D-1EE4F, U+1EE51-1EE52, U+1EE54, U+1EE57, U+1EE59, U+1EE5B, U+1EE5D, U+1EE5F, U+1EE61-1EE62, U+1EE64, U+1EE67-1EE6A, U+1EE6C-1EE72, U+1EE74-1EE77, U+1EE79-1EE7C, U+1EE7E, U+1EE80-1EE89, U+1EE8B-1EE9B, U+1EEA1-1EEA3, U+1EEA5-1EEA9, U+1EEAB-1EEBB, U+1EEF0-1EEF1",
    },
  ],
});

/*
 * Build-time guard coupling the Noto `preload` literal to the configured
 * locale, since next/font forbids deriving one from the other.
 * `NotoPreloadLiteral` MUST mirror the `preload:` value written in the
 * localFont call above. If a clone flips APP_LOCALES.DEFAULT to an RTL locale
 * (making `APP_CONFIG.direction` "rtl") without also setting the preload to
 * `true`, the assertion resolves to `AssertTrue<false>` and typecheck fails at
 * the `_NotoPreloadMatchesLocale` line — turning a silent 162 KB regression
 * (or a missing Arabic preload on an Arabic site) into a caught build error.
 * Entirely type-level: erased at runtime, zero shipped bytes.
 */
type NotoPreloadLiteral = false;
/** True when the configured default locale is RTL (Arabic-primary). */
type ArabicIsPrimary = AppConfig["direction"] extends "rtl" ? true : false;
/** Errors unless its argument is exactly `true`. */
type AssertTrue<T extends true> = T;
// Exported only so `noUnusedLocals` treats it as consumed; the assertion is
// evaluated at its declaration regardless of any importer.
export type _NotoPreloadMatchesLocale = AssertTrue<
  ArabicIsPrimary extends NotoPreloadLiteral
    ? NotoPreloadLiteral extends ArabicIsPrimary
      ? true
      : false
    : false
>;

/** The className mounted on `<html>` by both the root layout and global-error. */
export const FONT_VARIABLE_CLASSES = `${publicSans.variable} ${geistMono.variable} ${notoSansArabic.variable}`;
