import { expect, test } from "@playwright/test";

/*
 * Operability proof for the AppShell's responsive navigation and skip link —
 * axe can only attest that the markup is well-formed; these tests drive the
 * actual interactions in a real browser against the production build.
 */

test.describe("app shell — mobile navigation", () => {
  // Below the md breakpoint (48rem = 768px) the sidebar collapses into the
  // drawer; this viewport is a common small-phone size.
  test.use({ viewport: { width: 375, height: 812 } });

  test("drawer opens, traps focus, closes on Escape with focus returned", async ({ page }) => {
    await page.goto("/showcase");

    const trigger = page.getByRole("button", { name: "Open navigation" });
    await expect(trigger).toBeVisible();
    // The persistent sidebar must be fully collapsed at this width.
    await expect(page.getByRole("navigation", { name: "Showcase sections" })).toBeHidden();

    await trigger.click();
    const drawer = page.getByRole("dialog", { name: "Showcase sections" });
    await expect(drawer).toBeVisible();
    // While the modal is open the background (including the trigger) is
    // removed from the accessibility tree, so locate it by slot, not role.
    await expect(page.locator('[data-slot="app-shell-sidebar-trigger"]')).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    // Focus moves into the drawer when it opens.
    await expect(drawer.locator(":focus").first()).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("navigating from a drawer link closes the drawer", async ({ page }) => {
    await page.goto("/showcase");

    await page.getByRole("button", { name: "Open navigation" }).click();
    const drawer = page.getByRole("dialog", { name: "Showcase sections" });
    await expect(drawer).toBeVisible();

    await drawer.getByRole("link", { name: "Tokens" }).click();
    await expect(page).toHaveURL(/\/showcase\/tokens$/);
    await expect(drawer).toBeHidden();
  });
});

test.describe("app shell — desktop", () => {
  test("persistent sidebar navigates and marks the current page", async ({ page }) => {
    await page.goto("/showcase");

    const sidebar = page.getByRole("navigation", { name: "Showcase sections" });
    await expect(sidebar).toBeVisible();
    // The mobile trigger must not be present at desktop width.
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeHidden();

    await sidebar.getByRole("link", { name: "Actions" }).click();
    await expect(page).toHaveURL(/\/showcase\/actions$/);
    await expect(sidebar.getByRole("link", { name: "Actions" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("skip link is the first focusable element and moves focus to main", async ({ page }) => {
    await page.goto("/showcase");

    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(page.locator("main#main-content")).toBeFocused();
  });
});
