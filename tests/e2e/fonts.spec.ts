import { expect, test } from "@playwright/test";

/*
 * Guards the bilingual font-selection contract (docs/DIRECTION_AND_I18N.md).
 * A visible string is not enough: a fallback can look plausible while the
 * intended face never loads. These probes verify both loaded faces and the
 * metrics actually selected by the shared body stack.
 */
const ARABIC_SAMPLE = "المعرفةأساسالتقدموالتصميمالجيديخدمالجميع";
const LATIN_SAMPLE = "Inter keeps bilingual interfaces clear and balanced";
const TAJAWAL_WEIGHTS = [400, 500, 700, 800] as const;

test("Inter and Tajawal load and render their respective scripts", async ({ page }) => {
  await page.goto("/showcase/direction");
  await page.waitForLoadState("networkidle");

  const probe = await page.evaluate(
    async ([arabicSample, latinSample, tajawalWeights]) => {
      const rootStyle = getComputedStyle(document.documentElement);
      const interFamily = rootStyle.getPropertyValue("--font-inter").trim();
      const tajawalFamily = rootStyle.getPropertyValue("--font-tajawal").trim();
      const bodyStack = getComputedStyle(document.body).fontFamily;

      await Promise.all([
        document.fonts.load(`400 16px ${interFamily}`, latinSample),
        ...tajawalWeights.map((weight) =>
          document.fonts.load(`${weight} 16px ${tajawalFamily}`, arabicSample),
        ),
      ]);
      await document.fonts.ready;

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (context === null) {
        throw new Error("canvas 2d context unavailable");
      }
      const measure = (sample: string, fontFamily: string): number => {
        context.font = `32px ${fontFamily}`;
        return context.measureText(sample).width;
      };

      return {
        interFamily,
        tajawalFamily,
        bodyStack,
        interLoaded: document.fonts.check(`400 16px ${interFamily}`, latinSample),
        tajawalWeightsLoaded: tajawalWeights.map((weight) =>
          document.fonts.check(`${weight} 16px ${tajawalFamily}`, arabicSample),
        ),
        latinStackWidth: measure(latinSample, bodyStack),
        interWidth: measure(latinSample, interFamily),
        arialLatinWidth: measure(latinSample, "Arial"),
        arabicStackWidth: measure(arabicSample, bodyStack),
        tajawalWidth: measure(arabicSample, tajawalFamily),
        arialArabicWidth: measure(arabicSample, "Arial"),
      };
    },
    [ARABIC_SAMPLE, LATIN_SAMPLE, TAJAWAL_WEIGHTS] as const,
  );

  expect(probe.interFamily).not.toBe("");
  expect(probe.tajawalFamily).not.toBe("");
  expect(probe.interLoaded).toBe(true);
  expect(probe.tajawalWeightsLoaded).toEqual(TAJAWAL_WEIGHTS.map(() => true));

  const firstFamily = (stack: string): string =>
    stack.split(",")[0]?.trim().replaceAll('"', "") ?? "";
  expect(firstFamily(probe.bodyStack)).toBe(firstFamily(probe.tajawalFamily));

  // Script selection, not locale-specific component classes, chooses the face.
  expect(Math.abs(probe.latinStackWidth - probe.interWidth)).toBeLessThan(0.5);
  expect(Math.abs(probe.latinStackWidth - probe.arialLatinWidth)).toBeGreaterThan(1);
  expect(Math.abs(probe.arabicStackWidth - probe.tajawalWidth)).toBeLessThan(0.5);
  expect(Math.abs(probe.arabicStackWidth - probe.arialArabicWidth)).toBeGreaterThan(1);
});
