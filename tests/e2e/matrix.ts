import type { Page } from "@playwright/test";

import type { Direction, Theme } from "./routes";

/**
 * Navigates to one cell of the theme × direction matrix.
 *
 * - Theme is written to localStorage BEFORE any app code runs, so the
 *   pre-paint init script and ThemeProvider adopt it exactly as a returning
 *   user's stored preference — the real deployment state.
 * - Direction is flipped AFTER hydration by stamping `dir` on `<html>` — the
 *   same attribute the LocaleProvider sets when a locale is selected, so this
 *   exercises the exact runtime state an RTL locale produces. This is the sole
 *   direction driver in the suite (there is no product direction toggle to
 *   click): it flips `dir` programmatically for EVERY discovered route, so
 *   RTL coverage does not depend on any page rendering a switcher. Deliberately
 *   not pre-hydration: a real RTL deployment server-renders `dir="rtl"`
 *   (APP_CONFIG), so "server LTR markup + client RTL attribute" is a state no
 *   product ships, and forcing it would manufacture hydration mismatches the
 *   app doesn't have. Post-hydration flipping still exercises all RTL rendering
 *   and any direction-dependent runtime code.
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
  /*
   * Wait on the CONDITION, not a duration. 96 of the suite's tests route
   * through this line, so a fixed sleep was the highest-leverage flake vector
   * in the matrix: too short under CI load and a console message lands after
   * the assertion window (false pass), too short for a heavier future page and
   * settling is incomplete (false fail).
   *
   * Two steps, because the attribute landing is not the same as the app having
   * reacted to it: first observe `dir` actually applied, then yield one frame
   * so the direction-dependent effects and the paint they trigger have run and
   * anything they log is on the console before the caller judges it.
   */
  await page.waitForFunction(
    (directionValue) => document.documentElement.dir === directionValue,
    direction,
  );
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      }),
  );
}
