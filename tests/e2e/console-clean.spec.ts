import { expect, test } from "@playwright/test";

import { gotoMatrixCell } from "./matrix";
import { DIRECTIONS, discoverRoutes, THEMES } from "./routes";

/*
 * The regression net for the failure class static analysis cannot see:
 * every route, in every theme × direction cell, must produce a completely
 * clean browser console — no errors, no warnings, no uncaught exceptions,
 * no failed requests.
 *
 * This suite runs against the DEV server (see playwright.config.ts): React
 * reports hydration mismatches to the console only in development builds —
 * production ignores attribute-level mismatches silently, which is exactly
 * how the Pagination data-slot defect shipped past a green build. Dev-only
 * React warnings are the detection signal, not noise.
 *
 * There is deliberately no allowlist. If a message is ever judged benign,
 * filtering it must be a reviewed code change with a comment, not a quiet
 * suppression.
 */
const routes = discoverRoutes();

for (const route of routes) {
  for (const theme of THEMES) {
    for (const direction of DIRECTIONS) {
      test(`console clean: ${route} [${theme} ${direction}]`, async ({ page }) => {
        const findings: string[] = [];

        page.on("console", (message) => {
          const type = message.type();
          if (type === "error" || type === "warning") {
            findings.push(`console.${type}: ${message.text()}`);
          }
        });
        page.on("pageerror", (error) => {
          findings.push(`uncaught exception: ${error.message}`);
        });
        page.on("requestfailed", (request) => {
          findings.push(
            `request failed: ${request.url()} (${request.failure()?.errorText ?? "unknown"})`,
          );
        });

        await gotoMatrixCell(page, route, theme, direction);

        expect(findings).toEqual([]);
      });
    }
  }
}
