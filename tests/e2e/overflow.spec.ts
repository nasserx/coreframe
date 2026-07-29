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
            const overflowingElements = Array.from(document.querySelectorAll("body *"))
              .filter((element) => {
                const bounds = element.getBoundingClientRect();
                return bounds.left < -1 || bounds.right > root.clientWidth + 1;
              })
              .map((element) => {
                const bounds = element.getBoundingClientRect();
                const style = getComputedStyle(element);
                const dataSlot = element.getAttribute("data-slot");
                return {
                  selector:
                    element.id !== ""
                      ? `#${element.id}`
                      : `${element.tagName.toLowerCase()}${dataSlot === null ? "" : `[data-slot="${dataSlot}"]`}.${Array.from(element.classList).slice(0, 3).join(".")}`,
                  dimensions: `${bounds.width}x${bounds.height} at ${bounds.left},${bounds.top}–${bounds.right},${bounds.bottom}`,
                  width: style.width,
                  minWidth: style.minWidth,
                  margins: `${style.marginInlineStart} ${style.marginInlineEnd}`,
                  transform: style.transform,
                  whiteSpace: style.whiteSpace,
                  overflowWrap: style.overflowWrap,
                };
              });
            return {
              pageOverflow: root.scrollWidth - root.clientWidth,
              bars,
              overflowingElements,
            };
          },
          BAR_SLOTS as unknown as string[],
        );

        if (measured.pageOverflow > 1) {
          findings.push(
            `${width}px: page scrolls horizontally by ${measured.pageOverflow}px\n${JSON.stringify(measured.overflowingElements, null, 2)}`,
          );
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
