import { Geist_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";

import type { AppConfig } from "@/config";

/*
 * Font setup is shared by the root layout and global-error.tsx. The latter
 * replaces the root layout when it fires, so both document shells mount the
 * same variables.
 *
 * Inter is the Latin identity face. The reference loads exactly the five
 * authored semantic weights below; keeping that set explicit avoids shipping
 * unused extremes while preserving every shared component weight class.
 * next/font downloads and self-hosts it at build time; browsers make no
 * external font requests.
 */
export const inter = Inter({
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  subsets: ["latin"],
});

/* Code remains an independent typographic decision and loads on demand. */
export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

/*
 * Tajawal is intentionally self-hosted as Arabic-only WOFF2 subsets. The
 * Google family also contains Latin glyphs; mounting that complete family
 * first in the shared stack would intercept Latin inside mixed-language text
 * before Inter. The local Arabic subsets plus unicode-range preserve the
 * foundation's script-based selection: Arabic resolves to Tajawal and Latin,
 * Western numerals, and embedded product names fall through to Inter with no
 * component- or locale-specific font classes.
 *
 * Tajawal has no 600 face. Its available contract weights are loaded exactly:
 * body/supporting copy 500 and headings 700/800. Authored 600 UI/title
 * requests remain 600 in CSS and resolve to Tajawal's nearest available 700
 * face; the semantic weight contract itself is not rewritten.
 *
 * The Arial metric fallback remains disabled because it contains Arabic
 * glyphs and would intercept Tajawal. An English-primary deployment therefore
 * accepts a brief system-font swap when Arabic first appears. Arabic-primary
 * clones set the literal preload below to true; the type guard keeps that
 * setting coupled to APP_CONFIG.direction.
 */
export const tajawal = localFont({
  src: [
    { path: "../assets/fonts/tajawal-arabic-400.woff2", weight: "400" },
    { path: "../assets/fonts/tajawal-arabic-500.woff2", weight: "500" },
    { path: "../assets/fonts/tajawal-arabic-700.woff2", weight: "700" },
    { path: "../assets/fonts/tajawal-arabic-800.woff2", weight: "800" },
  ],
  variable: "--font-tajawal",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC, U+102E0-102FB, U+10E60-10E7E, U+10EC2-10EC4, U+10EFC-10EFF, U+1EE00-1EE03, U+1EE05-1EE1F, U+1EE21-1EE22, U+1EE24, U+1EE27, U+1EE29-1EE32, U+1EE34-1EE37, U+1EE39, U+1EE3B, U+1EE42, U+1EE47, U+1EE49, U+1EE4B, U+1EE4D-1EE4F, U+1EE51-1EE52, U+1EE54, U+1EE57, U+1EE59, U+1EE5B, U+1EE5D, U+1EE5F, U+1EE61-1EE62, U+1EE64, U+1EE67-1EE6A, U+1EE6C-1EE72, U+1EE74-1EE77, U+1EE79-1EE7C, U+1EE7E, U+1EE80-1EE89, U+1EE8B-1EE9B, U+1EEA1-1EEA3, U+1EEA5-1EEA9, U+1EEAB-1EEBB, U+1EEF0-1EEF1",
    },
  ],
});

type TajawalPreloadLiteral = false;
type ArabicIsPrimary = AppConfig["direction"] extends "rtl" ? true : false;
type AssertTrue<T extends true> = T;

export type _TajawalPreloadMatchesLocale = AssertTrue<
  ArabicIsPrimary extends TajawalPreloadLiteral
    ? TajawalPreloadLiteral extends ArabicIsPrimary
      ? true
      : false
    : false
>;

/** The className mounted on <html> by both document shells. */
export const FONT_VARIABLE_CLASSES = `${inter.variable} ${geistMono.variable} ${tajawal.variable}`;
