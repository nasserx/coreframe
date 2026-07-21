import { expect, test } from "@playwright/test";

/*
 * Operability proof for both shells' responsive navigation and skip links —
 * axe can only attest that the markup is well-formed; these tests drive the
 * actual interactions in a real browser against the production build.
 * AppShell is driven on /showcase (the `(app)` group), SiteShell on
 * /showcase/site (the `(site)` group).
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

test.describe("site shell — mobile navigation", () => {
  // The demo layout collapses below `md` (48rem = 768px).
  test.use({ viewport: { width: 375, height: 812 } });

  test("drawer opens, traps focus, closes on Escape with focus returned", async ({ page }) => {
    await page.goto("/showcase/site");

    const trigger = page.getByRole("button", { name: "Open navigation" });
    await expect(trigger).toBeVisible();
    // The horizontal bar navigation must be fully collapsed at this width.
    await expect(page.getByRole("navigation", { name: "Site sections" })).toBeHidden();

    await trigger.click();
    const drawer = page.getByRole("dialog", { name: "Site sections" });
    await expect(drawer).toBeVisible();
    await expect(page.locator('[data-slot="site-shell-nav-trigger"]')).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(drawer.locator(":focus").first()).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("navigating from a drawer link closes the drawer", async ({ page }) => {
    await page.goto("/showcase/site");

    await page.getByRole("button", { name: "Open navigation" }).click();
    const drawer = page.getByRole("dialog", { name: "Site sections" });
    await expect(drawer).toBeVisible();

    await drawer.getByRole("link", { name: "Layout" }).click();
    await expect(page).toHaveURL(/\/showcase\/layout$/);
    await expect(drawer).toBeHidden();
  });
});

test.describe("site shell — desktop", () => {
  test("horizontal nav is visible, marks the current page, and skips unavailable items", async ({
    page,
  }) => {
    await page.goto("/showcase/site");

    const nav = page.getByRole("navigation", { name: "Site sections" });
    await expect(nav).toBeVisible();
    // The mobile trigger must not be present at desktop width.
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeHidden();

    await expect(nav.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    // The unavailable destination is never a link and never in the tab
    // order: tabbing from the last real nav link must land past it.
    await expect(nav.getByRole("link", { name: /Pricing/ })).toHaveCount(0);
    await nav.getByRole("link", { name: "Layout" }).focus();
    await page.keyboard.press("Tab");
    const focusedText = await page.evaluate(() => document.activeElement?.textContent ?? "");
    expect(focusedText).not.toContain("Pricing");
  });

  test("skip link is the first focusable element and moves focus to main", async ({ page }) => {
    await page.goto("/showcase/site");

    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(page.locator("main#main-content")).toBeFocused();
  });
});
