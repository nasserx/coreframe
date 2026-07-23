import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { gotoMatrixCell } from "./matrix";

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
  test("horizontal nav is visible and skips the unavailable bar item", async ({ page }) => {
    await page.goto("/showcase/site");

    const nav = page.getByRole("navigation", { name: "Site sections" });
    await expect(nav).toBeVisible();
    // The mobile trigger must not be present at desktop width.
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeHidden();

    // The unavailable destination is never a link and never in the tab
    // order: tabbing from the dropdown trigger must land past it.
    await expect(nav.getByRole("link", { name: /Pricing/ })).toHaveCount(0);
    await nav.getByRole("button", { name: "Explore" }).focus();
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

test.describe("site shell — dropdown nav", () => {
  // Widths at or above the `lg` collapse line, where the horizontal bar (and
  // its dropdown) is shown rather than the drawer.
  test.use({ viewport: { width: 1280, height: 800 } });

  test("opens the panel, marks the current page, and dismisses on Escape with focus return", async ({
    page,
  }) => {
    await page.goto("/showcase/site");

    const trigger = page.getByRole("button", { name: "Explore" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    // The panel's links are not present until it opens.
    await expect(page.getByRole("link", { name: "Design tokens" })).toHaveCount(0);

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    // Current page (/showcase/site) is the panel's "Overview" item.
    await expect(page.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.getByRole("link", { name: "Design tokens" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
  });

  test("a panel link navigates to its real destination", async ({ page }) => {
    await page.goto("/showcase/site");

    await page.getByRole("button", { name: "Explore" }).click();
    await page.getByRole("link", { name: "Design tokens" }).click();
    await expect(page).toHaveURL(/\/showcase\/tokens$/);
  });

  test("clicking outside the open panel dismisses it", async ({ page }) => {
    await page.goto("/showcase/site");

    const trigger = page.getByRole("button", { name: "Explore" });
    await trigger.click();
    await expect(page.getByRole("link", { name: "Design tokens" })).toBeVisible();

    // Click well away from the panel and trigger.
    await page.mouse.click(10, 400);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("link", { name: "Design tokens" })).toHaveCount(0);
  });

  test("the OPEN panel is axe-clean in both themes and directions", async ({ page }) => {
    // A closed dropdown proves nothing about the open state, so scan it open
    // across the theme × direction matrix the a11y sweep cannot reach (it only
    // scans routes at rest). Collapse the entrance animation first: WCAG
    // contrast governs the resting state, but axe blends a mid-fade ancestor
    // opacity into its ratio, so scanning during the 200ms fade produces a
    // transient false failure. Reduced motion (the global rule) makes the
    // panel appear at full opacity immediately — the state a user reads.
    await page.emulateMedia({ reducedMotion: "reduce" });

    for (const theme of ["light", "dark"] as const) {
      for (const direction of ["ltr", "rtl"] as const) {
        await gotoMatrixCell(page, "/showcase/site", theme, direction);
        await page.getByRole("button", { name: "Explore" }).click();
        await expect(page.getByRole("link", { name: "Design tokens" })).toBeVisible();

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          // Base UI wraps the open popup in focus-trap sentinels
          // (`data-base-ui-focus-guard`) that are deliberately aria-hidden AND
          // focusable — the canonical false positive for axe's
          // `aria-hidden-focus` rule (they take focus only to redirect it, so
          // no user ever perceives them). This is vendored primitive markup we
          // cannot alter; every non-guard node in the open panel — links,
          // titles, descriptions, contrast — is scanned and must stay clean.
          .exclude("[data-base-ui-focus-guard]")
          .analyze();
        const readable = results.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          nodes: violation.nodes.map((node) => node.target.join(" ")),
        }));
        expect(readable, `axe [${theme} ${direction}]`).toEqual([]);
      }
    }
  });
});
