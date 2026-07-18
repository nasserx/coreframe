import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { gotoMatrixCell } from "./matrix";
import { DIRECTIONS, discoverRoutes, THEMES } from "./routes";

/*
 * Automated accessibility scan (axe-core, WCAG 2.x A/AA rule set) over every
 * discovered route in both themes and both directions — dark mode has its
 * own contrast pairs and RTL its own layout, so each cell is scanned.
 *
 * axe automates roughly the third of WCAG that is machine-checkable; a clean
 * scan is a floor, not a certification. Findings judged false positives must
 * be argued in a comment next to an explicit exclusion here — never
 * suppressed silently.
 */
const routes = discoverRoutes();

for (const route of routes) {
  for (const theme of THEMES) {
    for (const direction of DIRECTIONS) {
      test(`a11y: ${route} [${theme} ${direction}]`, async ({ page }) => {
        await gotoMatrixCell(page, route, theme, direction);

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();

        const readable = results.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          nodes: violation.nodes.map((node) => node.target.join(" ")),
        }));

        expect(readable).toEqual([]);
      });
    }
  }
}
