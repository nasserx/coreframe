import { expect, type Locator, test } from "@playwright/test";

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1280, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 320, height: 800 },
] as const;

async function geometry(locator: Locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    // Tailwind v4 uses the independent CSS `translate` property rather than
    // serializing translation into `transform`.
    const translateParts = style.translate === "none" ? [] : style.translate.split(" ");
    return {
      width: rect.width,
      height: rect.height,
      left: rect.left,
      right: rect.right,
      paddingLeft: Number.parseFloat(style.paddingLeft),
      paddingRight: Number.parseFloat(style.paddingRight),
      translateY: Number.parseFloat(translateParts[1] ?? "0"),
      transitionDuration: style.transitionDuration,
      transitionProperty: style.transitionProperty,
      transitionTimingFunction: style.transitionTimingFunction,
      boxShadow: style.boxShadow,
      focusVisible: element.matches(":focus-visible"),
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    };
  });
}

test.describe("responsive container contract", () => {
  for (const direction of ["ltr", "rtl"] as const) {
    test(`header and main share the 1280px cap and responsive gutters [${direction}]`, async ({
      page,
    }) => {
      await page.goto("/showcase/site");
      await page.waitForLoadState("networkidle");
      await page.evaluate(
        (value) => document.documentElement.setAttribute("dir", value),
        direction,
      );

      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        const header = await geometry(page.locator('[data-slot="site-shell-header-row"]'));
        const main = await geometry(
          page.locator('[data-slot="site-shell-main"] > [data-slot="container"]'),
        );
        const expectedGutter = viewport.width >= 1024 ? 32 : viewport.width >= 640 ? 24 : 16;
        const expectedWidth = Math.min(viewport.width, 1280);
        const expectedInset = (viewport.width - expectedWidth) / 2;

        for (const measured of [header, main]) {
          expect(measured.width).toBeCloseTo(expectedWidth, 0);
          expect(measured.left).toBeCloseTo(expectedInset, 0);
          expect(viewport.width - measured.right).toBeCloseTo(expectedInset, 0);
          expect(measured.paddingLeft).toBe(expectedGutter);
          expect(measured.paddingRight).toBe(expectedGutter);
        }
        expect(header.left + header.paddingLeft).toBeCloseTo(main.left + main.paddingLeft, 0);
        expect(header.right - header.paddingRight).toBeCloseTo(main.right - main.paddingRight, 0);
      }
    });
  }
});

test.describe("button geometry and motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/showcase/actions");
    await page.waitForLoadState("networkidle");
  });

  test("renders primitive and public-site composition heights exactly", async ({ page }) => {
    const contracts = [
      ["Default", 32],
      ["Small", 28],
      ["Large", 36],
      ["Add", 32],
      ["Navigation CTA", 36],
      ["Hero CTA", 40],
      ["Pricing CTA", 44],
      ["Prominent CTA", 48],
      ["Saving…", 32],
    ] as const;

    for (const [name, expectedHeight] of contracts) {
      const measured = await geometry(page.getByRole("button", { name, exact: true }));
      expect(measured.height, name).toBe(expectedHeight);
    }
  });

  test("preserves the exact hover lift through active, focus, and reduced motion", async ({
    page,
  }) => {
    // CI runners can inherit an OS-level reduced-motion preference. Pin the
    // ordinary-motion branch before testing it, then switch explicitly below.
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const button = page.getByRole("button", { name: "Default", exact: true });
    await page.mouse.move(0, 0);
    expect((await geometry(button)).translateY).toBe(0);

    await button.hover();
    await expect.poll(async () => (await geometry(button)).translateY).toBeCloseTo(-2, 1);
    let measured = await geometry(button);
    expect(measured.transitionDuration).toContain("0.15s");
    expect(measured.transitionTimingFunction).toContain("0.4, 0, 0.2, 1");
    expect(measured.transitionProperty).toContain("translate");

    await page.mouse.down();
    await expect.poll(async () => (await geometry(button)).translateY).toBeCloseTo(-2, 1);
    await page.mouse.up();

    await page.mouse.move(0, 0);
    await page.keyboard.press("Tab");
    await button.focus();
    await expect.poll(async () => (await geometry(button)).translateY).toBeCloseTo(-2, 1);
    measured = await geometry(button);
    expect(measured.focusVisible).toBe(true);
    expect(measured.translateY).toBeCloseTo(-2, 1);
    expect(measured.boxShadow).not.toBe("none");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await button.hover();
    await expect.poll(async () => (await geometry(button)).translateY).toBe(0);
  });

  test("keeps long English and Arabic labels inside the viewport", async ({ page }) => {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      for (const name of [
        "Continue with a deliberately long English action label",
        "متابعة باستخدام تسمية إجراء عربية طويلة للاختبار",
      ]) {
        const measured = await geometry(page.getByRole("button", { name, exact: true }));
        expect(measured.scrollWidth, `${name} at ${width}px`).toBeLessThanOrEqual(
          measured.clientWidth + 1,
        );
        expect(measured.left).toBeGreaterThanOrEqual(0);
        expect(measured.right).toBeLessThanOrEqual(width);
      }
    }
  });
});

test.describe("interactive-card motion ownership", () => {
  test("lifts linked cards for pointer and keyboard while static cards remain still", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/showcase");
    await page.waitForLoadState("networkidle");
    const linkedCard = page.getByRole("link", { name: "Actions Buttons and badges" });
    await linkedCard.hover();
    await expect.poll(async () => (await geometry(linkedCard)).translateY).toBeCloseTo(-4, 1);

    await page.mouse.move(0, 0);
    await page.keyboard.press("Tab");
    await linkedCard.focus();
    await expect.poll(async () => (await geometry(linkedCard)).translateY).toBeCloseTo(-4, 1);
    const focused = await geometry(linkedCard);
    expect(focused.focusVisible).toBe(true);
    expect(focused.translateY).toBeCloseTo(-4, 1);
    expect(focused.boxShadow).not.toBe("none");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await linkedCard.hover();
    await expect.poll(async () => (await geometry(linkedCard)).translateY).toBe(0);

    await page.goto("/showcase/display");
    await page.waitForLoadState("networkidle");
    const staticCard = page.locator('[data-slot="card"]').first();
    await staticCard.hover();
    expect((await geometry(staticCard)).translateY).toBe(0);
  });
});
