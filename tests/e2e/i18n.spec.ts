import AxeBuilder from "@axe-core/playwright";
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
 *     Arabic copy, RTL, `lang=ar`, Tajawal loaded, and NO horizontal overflow of
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

  test("Tajawal is loaded once the Arabic top bar renders", async ({ page }) => {
    await gotoAsStoredArabic(page);
    await expect(page.getByRole("banner").getByText(AR_BRAND)).toBeVisible();

    const probe = await page
      .getByRole("banner")
      .getByText(AR_BRAND)
      .evaluate(async (element) => {
        const tajawalFamily = getComputedStyle(document.documentElement)
          .getPropertyValue("--font-tajawal")
          .trim();
        const renderedStyle = getComputedStyle(element);
        await document.fonts.ready;
        return {
          tajawalFamily,
          renderedWeight: renderedStyle.fontWeight,
          check: document.fonts.check(
            `${renderedStyle.fontWeight} ${renderedStyle.fontSize} ${tajawalFamily}`,
            element.textContent ?? "معرض",
          ),
        };
      });
    expect(probe.tajawalFamily).not.toBe("");
    expect(probe.renderedWeight).toBe("700");
    // The Arabic face actually used by the top-bar brand is loaded and covers
    // its rendered glyphs (the rigorous "loaded AND used by metric" assertion
    // lives in fonts.spec.ts).
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

    // Switch via the real LocaleControl (one button, named for the action).
    await page.getByRole("button", { name: "Switch to Arabic" }).click();

    await expect(page.getByRole("banner").getByText(AR_BRAND)).toBeVisible();
    const state = await page.evaluate(() => ({
      dir: document.documentElement.dir,
      stored: window.localStorage.getItem("locale"),
    }));
    expect(state.dir).toBe("rtl");
    expect(state.stored).toBe("ar");
  });
});

test("the pagination ellipsis follows the active locale without accessibility violations", async ({
  page,
}) => {
  await page.goto("/showcase/navigation");
  await page.waitForLoadState("networkidle");

  const ellipsis = page.locator('[data-slot="pagination-ellipsis"]');
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(ellipsis.getByText("More pages", { exact: true })).toHaveCount(1);
  await expect(ellipsis.locator("svg")).toHaveAttribute("aria-hidden", "true");

  const englishResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(englishResults.violations).toEqual([]);

  await page.getByRole("button", { name: "Switch to Arabic" }).click();

  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(ellipsis.getByText("المزيد من الصفحات", { exact: true })).toHaveCount(1);
  await expect(ellipsis.getByText("More pages", { exact: true })).toHaveCount(0);

  const arabicResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(arabicResults.violations).toEqual([]);
});
