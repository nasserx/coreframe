import type { Page } from "@playwright/test";

import type { Direction, Theme } from "./routes";

/**
 * Navigates to one cell of the theme × direction matrix.
 *
 * - Theme is written to localStorage BEFORE any app code runs, so the
 *   pre-paint init script and ThemeProvider adopt it exactly as a returning
 *   user's stored preference — the real deployment state.
 * - Direction is flipped AFTER hydration by stamping `dir` on `<html>`,
 *   mirroring the showcase DirectionControl. Deliberately not pre-hydration:
 *   a real RTL deployment server-renders `dir="rtl"` (APP_CONFIG), so
 *   "server LTR markup + client RTL attribute" is a state no product ships,
 *   and forcing it would manufacture hydration mismatches the app doesn't
 *   have. Post-hydration flipping still exercises all RTL rendering and any
 *   direction-dependent runtime code.
 */
export async function gotoMatrixCell(
  page: Page,
  route: string,
  theme: Theme,
  direction: Direction,
): Promise<void> {
  await page.addInitScript((themeValue) => {
    try {
      window.localStorage.setItem("theme", themeValue);
    } catch {
      // Storage unavailable: the app is expected to fall back gracefully.
    }
  }, theme);
  await page.goto(route);
  // Hydration and post-hydration effects must settle before the direction
  // flip and before any console judgement; networkidle also catches late
  // chunk failures.
  await page.waitForLoadState("networkidle");
  await page.evaluate((directionValue) => {
    document.documentElement.setAttribute("dir", directionValue);
  }, direction);
  // One paint's worth of settling so errors triggered by the flip surface.
  await page.waitForTimeout(250);
}
