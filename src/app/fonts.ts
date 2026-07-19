import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

/*
 * Font setup shared by the root layout AND global-error.tsx — global-error
 * replaces the root layout when it fires, so it must mount the same font
 * variables itself or error pages would render in the fallback stack.
 */

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/*
 * Arabic companion face (self-hosted variable font, Arabic subset). Geist
 * has no Arabic glyphs, so the sans stack in src/styles/theme.css lists this
 * FIRST, scoped to Arabic code points by the unicode-range below: Latin
 * skips it and renders in Geist, Arabic renders here. next/font self-hosts
 * and preloads — no render blocking, no layout shift.
 *
 * Loaded via next/font/local (not google) because the face needs a
 * `size-adjust` descriptor: Arabic renders optically smaller than Latin at
 * equal em, and size-adjust scales only this face's glyphs — Latin rendering
 * and mixed-direction layout metrics stay untouched (docs/DIRECTION_AND_I18N.md).
 * Leading compensation lives in the ramp's [dir="rtl"] overrides
 * (src/styles/theme.css).
 *
 * License: SIL Open Font License 1.1 — src/assets/fonts/OFL.txt must ship
 * alongside the font file.
 */
export const notoSansArabic = localFont({
  src: "../assets/fonts/noto-sans-arabic-variable.woff2",
  variable: "--font-noto-sans-arabic",
  weight: "100 900",
  // No Arial-based metric fallback: local Arial contains Arabic glyphs and
  // an unranged fallback face would intercept scripts it shouldn't. The
  // unicode-range below already scopes this face to Arabic, and the file is
  // preloaded, so the unstyled-fallback window is negligible.
  adjustFontFallback: false,
  declarations: [
    { prop: "size-adjust", value: "115%" },
    // Arabic blocks only (the subset's own coverage): this face sits FIRST
    // in --font-sans (src/styles/theme.css) so Geist's Arial-based metric
    // fallback can never intercept Arabic, while Latin skips this face
    // entirely via the range. Latin digits are deliberately excluded —
    // numerals render in Geist, matching the Western-numerals default.
    {
      prop: "unicode-range",
      value:
        "U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC, U+102E0-102FB, U+10E60-10E7E, U+10EC2-10EC4, U+10EFC-10EFF, U+1EE00-1EE03, U+1EE05-1EE1F, U+1EE21-1EE22, U+1EE24, U+1EE27, U+1EE29-1EE32, U+1EE34-1EE37, U+1EE39, U+1EE3B, U+1EE42, U+1EE47, U+1EE49, U+1EE4B, U+1EE4D-1EE4F, U+1EE51-1EE52, U+1EE54, U+1EE57, U+1EE59, U+1EE5B, U+1EE5D, U+1EE5F, U+1EE61-1EE62, U+1EE64, U+1EE67-1EE6A, U+1EE6C-1EE72, U+1EE74-1EE77, U+1EE79-1EE7C, U+1EE7E, U+1EE80-1EE89, U+1EE8B-1EE9B, U+1EEA1-1EEA3, U+1EEA5-1EEA9, U+1EEAB-1EEBB, U+1EEF0-1EEF1",
    },
  ],
});

/** The className mounted on `<html>` by both the root layout and global-error. */
export const FONT_VARIABLE_CLASSES = `${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable}`;
