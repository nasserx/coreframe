import { expect, test } from "@playwright/test";

import { DIRECTIONS, discoverRoutes } from "./routes";

/*
 * Horizontal-overflow regression net. The first product built on this
 * foundation shipped a top bar whose content exceeded its Container cap at
 * EVERY viewport width — and the entire pipeline (format, lint, typecheck,
 * build, unit tests, axe) stayed green, because overflow is a runtime
 * layout fact no static gate can see.
 *
 * Every discovered route is swept across the practical viewport range in
 * both directions (RTL mirrors the layout, so its overflow is a distinct
 * failure surface). Two assertions per width:
 *
 *  1. Page level: the document must not scroll horizontally.
 *  2. Bar level: each shell header row must fit its own box — a bar can
 *     overflow inside `overflow-x: hidden` chrome without tripping the
 *     page-level check, which is exactly how the original defect hid.
 *
 * Theme is irrelevant to box geometry, so the sweep runs in one theme.
 * A 1px tolerance absorbs subpixel rounding.
 */
const WIDTHS = [320, 360, 393, 480, 640, 768, 834, 1024, 1280, 1536] as const;

const BAR_SLOTS = ["app-shell-header", "site-shell-header", "site-shell-header-row"] as const;

const routes = discoverRoutes();

for (const route of routes) {
  for (const direction of DIRECTIONS) {
    test(`no horizontal overflow: ${route} [${direction}]`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await page.evaluate((directionValue) => {
        document.documentElement.setAttribute("dir", directionValue);
      }, direction);

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
  }
}
