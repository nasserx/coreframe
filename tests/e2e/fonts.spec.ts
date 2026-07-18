import { expect, test } from "@playwright/test";

/*
 * Guards the Arabic font-loading contract (docs/DIRECTION_AND_I18N.md).
 *
 * The original defect was silent: Geist's Arial-based metric fallback
 * contains Arabic glyphs, so with the wrong stack order Arabic rendered in
 * plausible-looking fallback text while Noto Sans Arabic never loaded.
 * "The page shows Arabic" is therefore not evidence. This spec asserts the
 * real thing, twice over:
 *
 * 1. Loaded — a FontFace for the Noto family reports status "loaded".
 * 2. Used — an Arabic string measured with the page's actual font stack is
 *    pixel-identical to the same string forced into the Noto face, and
 *    differs from the Arial fallback rendering (Noto's size-adjust: 115%
 *    makes interception measurable).
 */
const ARABIC_SAMPLE = "المعرفة أساس التقدم، والتصميم الجيد يخدم الجميع";

test("Noto Sans Arabic is loaded and actually renders Arabic glyphs", async ({ page }) => {
  // The face is scoped to Arabic code points; it only loads on a page that
  // renders Arabic, so use the direction showcase.
  await page.goto("/showcase/direction");
  await page.waitForLoadState("networkidle");

  const probe = await page.evaluate(async (sample) => {
    // next/font generates a hashed family name; the CSS variable is the
    // stable handle to it.
    const notoFamily = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-noto-sans-arabic")
      .trim();
    const bodyStack = getComputedStyle(document.body).fontFamily;

    await document.fonts.load(`16px ${notoFamily}`, sample);
    await document.fonts.ready;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (context === null) {
      throw new Error("canvas 2d context unavailable");
    }
    const measure = (fontFamily: string): number => {
      context.font = `32px ${fontFamily}`;
      return context.measureText(sample).width;
    };

    return {
      notoFamily,
      bodyStack,
      checkPasses: document.fonts.check(`16px ${notoFamily}`, sample),
      loadedFaces: Array.from(document.fonts)
        .filter((face) => face.status === "loaded")
        .map((face) => face.family),
      stackWidth: measure(bodyStack),
      notoWidth: measure(notoFamily),
      arialWidth: measure("Arial"),
    };
  }, ARABIC_SAMPLE);

  // The variable must resolve to a family at all.
  expect(probe.notoFamily).not.toBe("");
  // The Noto family must sit FIRST in the sans stack (the defect was it
  // sitting after Geist, behind an intercepting fallback).
  const unquote = (family: string): string =>
    family.split(",")[0]?.trim().replaceAll('"', "") ?? "";
  expect(unquote(probe.bodyStack)).toBe(unquote(probe.notoFamily));

  // 1. Loaded.
  expect(probe.checkPasses).toBe(true);
  expect(probe.loadedFaces.length).toBeGreaterThan(0);

  // 2. Used: the page's stack renders Arabic with Noto's metrics, not a
  // fallback's. size-adjust: 115% guarantees a measurable difference.
  expect(Math.abs(probe.stackWidth - probe.notoWidth)).toBeLessThan(0.5);
  expect(Math.abs(probe.stackWidth - probe.arialWidth)).toBeGreaterThan(1);
});
