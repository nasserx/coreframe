import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/*
 * Operability proof for the error surfaces added with the data layer:
 * the root not-found boundary must actually serve unmatched URLs with a
 * recovery path, and the ErrorBoundary reset cycle must work in a real
 * browser against the production build (jsdom already covers it at unit
 * level; this catches integration/runtime regressions).
 *
 * The route-level error.tsx / global-error.tsx cannot be driven here
 * without shipping a deliberately throwing route; their composition is
 * covered by the unit-tested ErrorFallback they share and was verified
 * manually against a production build (docs/DATA_LAYER.md § Error routes).
 */

test.describe("not-found route", () => {
  test("unmatched URL returns 404 with the branded page and a way home", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();

    await page.getByRole("link", { name: "Go to the home page" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("not-found page passes the axe scan", async ({ page }) => {
    // Not part of the discovered-route a11y matrix (it is not a page.tsx),
    // so it gets its own scan at the same WCAG A/AA floor.
    await page.goto("/this-route-does-not-exist");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

test.describe("error boundary recovery", () => {
  test("region boundary catches a render error and reset restores the region", async ({ page }) => {
    await page.goto("/showcase/feedback");

    const throwButton = page.getByRole("button", { name: "Throw a render error" });
    await throwButton.click();

    // The custom fallback replaces the crashed region.
    await expect(page.getByText("This region crashed.")).toBeVisible();
    await expect(throwButton).toBeHidden();

    // Recovery path: reset re-renders the children in their initial state.
    await page.getByRole("button", { name: "Reset boundary" }).click();
    await expect(page.getByRole("button", { name: "Throw a render error" })).toBeVisible();
    await expect(page.getByText("This region crashed.")).toBeHidden();
  });
});
