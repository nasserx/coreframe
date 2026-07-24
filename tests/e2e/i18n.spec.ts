import { expect, type Page, test } from "@playwright/test";

/*
 * Message-translation proof in a real browser (docs/DIRECTION_AND_I18N.md).
 *
 * The console/a11y matrix flips `dir` programmatically but keeps the DEFAULT
 * (English) catalogue, so it never renders the translated content or the Arabic
 * set widths. This spec closes that gap on the `(site)` showcase — the surface
 * translated end to end — by driving the ACTUAL locale runtime two ways:
 *
 *  1. Returning visitor: a stored `locale` (the real persistence path) →
 *     Arabic copy, RTL, `lang=ar`, Noto loaded, and NO horizontal overflow of
 *     the Arabic top bar across the viewport range (the Arabic-width analogue
 *     of overflow.spec.ts, which only sweeps English).
 *  2. Live switch: clicking the language control flips direction and persists.
 *
 * Runs in chromium-prod (against `next start`) — exactly what ships.
 */
const AR_BRAND = "معرض الأساس";
const EN_BRAND = "Foundation Showcase";

// Same practical viewport range the English overflow sweep uses.
const WIDTHS = [320, 360, 393, 480, 640, 768, 834, 1024, 1280, 1536] as const;
const BAR_SLOTS = ["site-shell-header", "site-shell-header-row"] as const;

async function gotoAsStoredArabic(page: Page): Promise<void> {
  // Seed the stored preference BEFORE any app code runs — the returning-user
  // path the LocaleProvider reads on mount.
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("locale", "ar");
    } catch {
      // Storage blocked: the app falls back to the default locale.
    }
  });
  await page.goto("/showcase/site");
  // networkidle also waits for the code-split Arabic catalogue chunk to load.
  await page.waitForLoadState("networkidle");
}

test.describe("Arabic locale on /showcase/site", () => {
  test("a returning Arabic visitor gets translated top-bar copy, RTL, and lang=ar", async ({
    page,
  }) => {
    await gotoAsStoredArabic(page);

    // The brand in the banner is Arabic — the top bar is genuinely translated.
    await expect(page.getByRole("banner").getByText(AR_BRAND)).toBeVisible();

    const doc = await page.evaluate(() => ({
      dir: document.documentElement.dir,
      lang: document.documentElement.lang,
    }));
    expect(doc.dir).toBe("rtl");
    expect(doc.lang).toBe("ar");
  });

  test("Noto Sans Arabic is loaded once the Arabic top bar renders", async ({ page }) => {
    await gotoAsStoredArabic(page);
    await expect(page.getByRole("banner").getByText(AR_BRAND)).toBeVisible();

    const probe = await page.evaluate(async () => {
      const notoFamily = getComputedStyle(document.documentElement)
        .getPropertyValue("--font-noto-sans-arabic")
        .trim();
      await document.fonts.ready;
      return { notoFamily, check: document.fonts.check(`16px ${notoFamily}`, "معرض") };
    });
    expect(probe.notoFamily).not.toBe("");
    // The Arabic face is actually loaded and covers the rendered glyphs (the
    // rigorous "loaded AND used by metric" assertion lives in fonts.spec.ts).
    expect(probe.check).toBe(true);
  });

  test("the Arabic top bar has no horizontal overflow across the viewport range", async ({
    page,
  }) => {
    await gotoAsStoredArabic(page);
    await expect(page.getByRole("banner").getByText(AR_BRAND)).toBeVisible();

    const findings: string[] = [];
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      const measured = await page.evaluate(
        (slots) => {
          const root = document.documentElement;
          const bars = slots.flatMap((slot) =>
            Array.from(document.querySelectorAll(`[data-slot="${slot}"]`)).map((element) => ({
              slot,
              overflow: element.scrollWidth - element.clientWidth,
            })),
          );
          return { pageOverflow: root.scrollWidth - root.clientWidth, bars };
        },
        BAR_SLOTS as unknown as string[],
      );

      if (measured.pageOverflow > 1) {
        findings.push(`${width}px: page scrolls horizontally by ${measured.pageOverflow}px`);
      }
      for (const bar of measured.bars) {
        if (bar.overflow > 1) {
          findings.push(`${width}px: ${bar.slot} overflows its box by ${bar.overflow}px`);
        }
      }
    }
    expect(findings).toEqual([]);
  });

  test("switching language in the top bar flips direction and persists", async ({ page }) => {
    await page.goto("/showcase/site");
    await page.waitForLoadState("networkidle");

    // Default deployment locale is English.
    await expect(page.getByRole("banner").getByText(EN_BRAND)).toBeVisible();

    // Switch via the real LocaleControl (its options are the locale autonyms).
    await page.getByRole("button", { name: "العربية" }).click();

    await expect(page.getByRole("banner").getByText(AR_BRAND)).toBeVisible();
    const state = await page.evaluate(() => ({
      dir: document.documentElement.dir,
      stored: window.localStorage.getItem("locale"),
    }));
    expect(state.dir).toBe("rtl");
    expect(state.stored).toBe("ar");
  });
});
