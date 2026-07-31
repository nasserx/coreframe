import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

/*
 * The shared language and theme toggles, in the states no other spec reaches.
 *
 * Route discovery already scans every page for axe violations, console noise,
 * and overflow, and the unit tests own the controls' markup contract. What only
 * a real browser can falsify is the part that spans a navigation: whether a
 * choice survives a reload, whether the operating-system preference is consulted
 * once and then left alone, whether a legacy stored `"system"` still resolves,
 * and — the defect class that motivated this whole layer — whether the theme is
 * on the document before first paint rather than after hydration.
 */

const SWITCH_TO_ARABIC = "Switch to Arabic";
const SWITCH_TO_ENGLISH = "التبديل إلى الإنجليزية";
const TO_DARK = "Switch to dark mode";
const TO_LIGHT = "Switch to light mode";
const TO_DARK_AR = "التبديل إلى الوضع الداكن";
const TO_LIGHT_AR = "التبديل إلى الوضع الفاتح";

/** Seeds storage before any application code runs — a returning visitor. */
async function seedStorage(page: Page, entries: Record<string, string>): Promise<void> {
  await page.addInitScript((values: Record<string, string>) => {
    try {
      for (const [key, value] of Object.entries(values)) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Storage unavailable: the app is expected to fall back gracefully.
    }
  }, entries);
}

/**
 * Records the root class list at DOMContentLoaded — i.e. after the inline
 * pre-paint script has run but before React hydrates. A theme applied only from
 * an effect would show up here as a miss, which is exactly the flash.
 */
async function capturePrePaintTheme(page: Page): Promise<void> {
  await page.addInitScript(() => {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        (window as unknown as { __prePaintDark?: boolean }).__prePaintDark =
          document.documentElement.classList.contains("dark");
      },
      { once: true },
    );
  });
}

function readPrePaintTheme(page: Page): Promise<boolean | undefined> {
  return page.evaluate(() => (window as unknown as { __prePaintDark?: boolean }).__prePaintDark);
}

const storedTheme = (page: Page) => page.evaluate(() => window.localStorage.getItem("theme"));
const isDark = (page: Page) =>
  page.evaluate(() => document.documentElement.classList.contains("dark"));

/**
 * The glyph's own computed transform. All three properties are read because a
 * transform can arrive through any of them; the contract is that the controls
 * add no icon animation at all, so every one of them stays `none` in every
 * interaction state.
 *
 * Note the lookup: both shells render each control TWICE — the bar cluster and
 * the drawer copy — and the drawer copy comes FIRST in DOM order, so a plain
 * `querySelector` returns whichever one is `display: none` at the current
 * width. Every page-side lookup in this file therefore picks the copy that is
 * actually laid out; reading the hidden one silently measures a zero-sized box
 * and turns the assertion into a no-op.
 */
function glyphMotion(page: Page, slot: string) {
  return page.evaluate((selector) => {
    const button =
      [...document.querySelectorAll(`[data-slot="${selector}"]`)].find(
        (element) => element.getBoundingClientRect().width > 0,
      ) ?? null;
    const glyph = button?.querySelector("svg") ?? null;
    if (button === null || glyph === null) {
      return null;
    }
    const glyphStyle = getComputedStyle(glyph);
    return {
      transform: glyphStyle.transform,
      rotate: glyphStyle.rotate,
      scale: glyphStyle.scale,
    };
  }, slot);
}

test.describe("shared header controls", () => {
  test("each control is a single button, reachable by keyboard with a visible ring", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const locale = page.getByRole("button", { name: SWITCH_TO_ARABIC });
    const theme = page.getByRole("button", { name: TO_DARK });
    await expect(locale).toHaveCount(1);
    await expect(theme).toHaveCount(1);

    // Tab order follows DOM order: language, then theme.
    await locale.focus();
    await expect(locale).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(theme).toBeFocused();

    const ring = await theme.evaluate((element) => ({
      boxShadow: getComputedStyle(element).boxShadow,
      focusVisible: element.matches(":focus-visible"),
    }));
    expect(ring.focusVisible).toBe(true);
    expect(ring.boxShadow).not.toBe("none");
  });

  for (const theme of ["light", "dark"] as const) {
    for (const locale of ["en", "ar"] as const) {
      test(`both controls are identical 36px bordered squares — ${theme} ${locale}`, async ({
        page,
      }) => {
        await seedStorage(page, locale === "ar" ? { theme, locale } : { theme });
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        const measured = await page.evaluate(() => {
          const read = (slot: string) => {
            const button =
              [...document.querySelectorAll(`[data-slot="${slot}"]`)].find(
                (element) => element.getBoundingClientRect().width > 0,
              ) ?? null;
            if (button === null) {
              return null;
            }
            const { width, height } = button.getBoundingClientRect();
            const style = getComputedStyle(button);
            return {
              width: Math.round(width),
              height: Math.round(height),
              text: (button.textContent ?? "").trim(),
              glyphs: button.querySelectorAll("svg").length,
              icon: button.querySelector("[data-icon]")?.getAttribute("data-icon") ?? null,
              borderWidth: style.borderTopWidth,
              borderStyle: style.borderTopStyle,
              borderColor: style.borderTopColor,
              backgroundColor: style.backgroundColor,
              borderRadius: style.borderTopLeftRadius,
              boxShadow: style.boxShadow,
            };
          };
          return { locale: read("locale-control"), theme: read("theme-control") };
        });

        // Icon-only: no target code, no letters, exactly one glyph each.
        expect(measured.locale?.text).toBe("");
        expect(measured.theme?.text).toBe("");
        expect(measured.locale?.glyphs).toBe(1);
        expect(measured.theme?.glyphs).toBe(1);
        expect(measured.locale?.icon).toBe("globe");

        // Exactly 36px squares on the h-9 control step, in every cell.
        expect(measured.locale).toMatchObject({ width: 36, height: 36 });
        expect(measured.theme).toMatchObject({ width: 36, height: 36 });

        // The outline variant's own one-pixel semantic border, semantic
        // background, and no shadow — identical between the two controls.
        for (const control of [measured.locale, measured.theme]) {
          expect(control?.borderWidth).toBe("1px");
          expect(control?.borderStyle).toBe("solid");
          expect(control?.boxShadow).toBe("none");
        }
        expect(measured.theme?.borderColor).toBe(measured.locale?.borderColor);
        expect(measured.theme?.backgroundColor).toBe(measured.locale?.backgroundColor);
        expect(measured.theme?.borderRadius).toBe(measured.locale?.borderRadius);
      });
    }
  }

  test("the controls sit on the same baseline and height as the header CTA", async ({ page }) => {
    // The `(site)` shell is the one that renders utility controls beside real
    // CTAs, which is the alignment this size exists to fix.
    await page.goto("/showcase/site");
    await page.waitForLoadState("networkidle");

    const measured = await page.evaluate(() => {
      const visible = (selector: string) =>
        [...document.querySelectorAll(selector)].find(
          (element) => element.getBoundingClientRect().width > 0,
        ) ?? null;
      const bar = visible('[data-slot="site-shell-header-row"]');
      // Same duplicate-copy trap as the controls: the drawer's own CTA comes
      // first in DOM order and is hidden at this width, so require a real box.
      const cta = [...(bar?.querySelectorAll("button, a") ?? [])].find(
        (element) =>
          /Get started|ابدأ/.test(element.textContent ?? "") &&
          element.getBoundingClientRect().width > 0,
      );
      const box = (element: Element | null | undefined) =>
        element === null || element === undefined
          ? null
          : (({ height, top, bottom }) => ({
              height: Math.round(height),
              centre: Math.round((top + bottom) / 2),
            }))(element.getBoundingClientRect());
      return {
        locale: box(visible('[data-slot="locale-control"]')),
        theme: box(visible('[data-slot="theme-control"]')),
        cta: box(cta),
      };
    });

    expect(measured.cta).not.toBeNull();
    // Same 36px height as the CTA, and vertically centred with it.
    expect(measured.locale?.height).toBe(36);
    expect(measured.theme?.height).toBe(36);
    expect(measured.cta?.height).toBe(36);
    expect(
      Math.abs((measured.locale?.centre ?? 0) - (measured.cta?.centre ?? 0)),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs((measured.theme?.centre ?? 0) - (measured.cta?.centre ?? 0)),
    ).toBeLessThanOrEqual(1);
  });

  test("switching locale and theme moves no geometry", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const boxes = () =>
      page.evaluate(() =>
        ["locale-control", "theme-control", "site-shell-header-row"].map((slot) => {
          const element =
            [...document.querySelectorAll(`[data-slot="${slot}"]`)].find(
              (candidate) => candidate.getBoundingClientRect().width > 0,
            ) ?? null;
          if (element === null) {
            return null;
          }
          const { x, y, width, height } = element.getBoundingClientRect();
          return [Math.round(x), Math.round(y), Math.round(width), Math.round(height)];
        }),
      );

    /*
     * Measured with the pointer parked off the cluster. `click()` leaves the
     * cursor on the button, and the outline variant's approved -2px hover lift
     * transitions over 150ms — so measuring straight after a click samples that
     * lift at whatever point it has reached, which is a real but UNRELATED
     * movement. Parking the pointer removes the variable so this measures the
     * only thing it claims to: movement caused by the state change itself.
     * (The lift is asserted separately below, at rest and settled.)
     */
    const before = await boxes();

    await page.getByRole("button", { name: TO_DARK }).click();
    await expect(page.getByRole("button", { name: TO_LIGHT })).toBeVisible();
    await page.mouse.move(0, 0);
    await expect.poll(async () => await boxes()).toEqual(before);

    await page.getByRole("button", { name: SWITCH_TO_ARABIC }).click();
    await expect(page.getByRole("button", { name: TO_LIGHT_AR })).toBeVisible();
    await page.mouse.move(0, 0);
    // Direction flips the whole bar, so only the control sizes are comparable.
    await expect
      .poll(async () => {
        const after = await boxes();
        return [after[0]?.slice(2), after[1]?.slice(2), after[2]];
      })
      .toEqual([before[0]?.slice(2), before[1]?.slice(2), before[2]]);
  });

  test("the outline variant's hover lift is hover-only and fully reverts", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const top = async () =>
      page.evaluate(() => {
        const element = [...document.querySelectorAll('[data-slot="theme-control"]')].find(
          (candidate) => candidate.getBoundingClientRect().width > 0,
        );
        return element === undefined ? null : Math.round(element.getBoundingClientRect().y);
      });

    const control = page.getByRole("button", { name: TO_DARK });
    const atRest = await top();

    await control.hover();
    // The shared primitive's 2px lift — inherited, not control-specific, and
    // the only geometry either control ever moves by.
    await expect.poll(top).toBe((atRest ?? 0) - 2);

    await page.mouse.move(0, 0);
    // It reverts completely, so it can never accumulate into a layout shift.
    await expect.poll(top).toBe(atRest);
  });

  test("Enter and Space both activate the theme toggle", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: TO_DARK }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: TO_LIGHT })).toBeVisible();
    expect(await isDark(page)).toBe(true);

    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: TO_DARK })).toBeVisible();
    expect(await isDark(page)).toBe(false);
  });

  test("a chosen theme survives a reload", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: TO_DARK }).click();
    expect(await storedTheme(page)).toBe("dark");

    await capturePrePaintTheme(page);
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Restored by the inline script during the reload, before React runs.
    expect(await readPrePaintTheme(page)).toBe(true);
    expect(await isDark(page)).toBe(true);
    await expect(page.getByRole("button", { name: TO_LIGHT })).toBeVisible();
  });

  test("a chosen language survives a reload, with lang and dir together", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: SWITCH_TO_ARABIC }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("button", { name: SWITCH_TO_ENGLISH })).toBeVisible();
  });

  test("switching language leaves the theme runtime untouched", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: TO_DARK }).click();
    await page.getByRole("button", { name: SWITCH_TO_ARABIC }).click();

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    // The locale switch re-renders; it must not reset the other runtime.
    expect(await isDark(page)).toBe(true);
    await expect(page.getByRole("button", { name: TO_LIGHT_AR })).toBeVisible();
  });
});

test.describe("theme initialization", () => {
  for (const { osScheme, expectDark } of [
    { osScheme: "dark", expectDark: true },
    { osScheme: "light", expectDark: false },
  ] as const) {
    test(`a first visit follows an OS preference of ${osScheme} without storing it`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: osScheme });
      await capturePrePaintTheme(page);
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      expect(await readPrePaintTheme(page)).toBe(expectDark);
      expect(await isDark(page)).toBe(expectDark);
      // A system-derived value is not a choice, so nothing is written.
      expect(await storedTheme(page)).toBeNull();
      await expect(
        page.getByRole("button", { name: expectDark ? TO_LIGHT : TO_DARK }),
      ).toBeVisible();
    });
  }

  test("a stored choice beats the OS preference, before first paint", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await seedStorage(page, { theme: "light" });
    await capturePrePaintTheme(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Applied by the inline script, not by a post-hydration effect: no flash.
    expect(await readPrePaintTheme(page)).toBe(false);
    expect(await isDark(page)).toBe(false);
    await expect(page.getByRole("button", { name: TO_DARK })).toBeVisible();
  });

  test('a legacy stored "system" resolves to the OS preference and yields on the first toggle', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    // Written by the superseded three-state runtime.
    await seedStorage(page, { theme: "system" });
    await capturePrePaintTheme(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(await readPrePaintTheme(page)).toBe(true);
    expect(await isDark(page)).toBe(true);
    // Still not an explicit choice — the legacy value is left untouched.
    expect(await storedTheme(page)).toBe("system");

    await page.getByRole("button", { name: TO_LIGHT }).click();

    expect(await isDark(page)).toBe(false);
    expect(await storedTheme(page)).toBe("light");
  });

  test("an OS change after initialization does not restyle the page", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(await isDark(page)).toBe(false);

    await page.emulateMedia({ colorScheme: "dark" });
    // No live matchMedia subscription: a reader mid-page is not repainted.
    await expect(page.getByRole("button", { name: TO_DARK })).toBeVisible();
    expect(await isDark(page)).toBe(false);
  });
});

test.describe("controls in the mobile drawer", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("both controls are usable inside the marketing drawer", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "Open navigation" }).click();
    const drawer = page.getByRole("dialog", { name: "Primary navigation" });
    await expect(drawer).toBeVisible();

    await drawer.getByRole("button", { name: TO_DARK }).click();
    expect(await isDark(page)).toBe(true);

    await drawer.getByRole("button", { name: SWITCH_TO_ARABIC }).click();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    // The drawer stays open through the switch and renames itself with the
    // rest of the shell, so it has to be relocated by its Arabic label.
    const arabicDrawer = page.getByRole("dialog", { name: "التنقل الرئيسي" });
    await expect(arabicDrawer).toBeVisible();
    await expect(arabicDrawer.getByRole("button", { name: SWITCH_TO_ENGLISH })).toBeVisible();
  });
});

test.describe("responsive and reduced-motion behavior", () => {
  const WIDTHS = [320, 390, 1024, 1440] as const;

  for (const locale of ["en", "ar"] as const) {
    test(`the header cluster fits every checkpoint width in ${locale}`, async ({ page }) => {
      if (locale === "ar") {
        await seedStorage(page, { locale: "ar" });
      }
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const findings: string[] = [];
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        const measured = await page.evaluate(() => {
          const root = document.documentElement;
          const bar = document.querySelector('[data-slot="site-shell-header-row"]');
          // Both shells render the controls twice — the bar cluster and the
          // drawer copy — and exactly one of the two is laid out at any width.
          const laidOut = [...document.querySelectorAll('[data-slot="theme-control"]')].filter(
            (control) => control.getBoundingClientRect().width > 0,
          ).length;
          return {
            pageOverflow: root.scrollWidth - root.clientWidth,
            barOverflow: bar === null ? 0 : bar.scrollWidth - bar.clientWidth,
            laidOut,
          };
        });
        if (measured.pageOverflow > 1) {
          findings.push(`${width}px: page scrolls horizontally by ${measured.pageOverflow}px`);
        }
        if (measured.barOverflow > 1) {
          findings.push(`${width}px: header row overflows by ${measured.barOverflow}px`);
        }
        // Below the collapse breakpoint the cluster lives in the closed drawer,
        // so zero is correct there; above it exactly one copy must be present.
        const expected = width < 768 ? 0 : 1;
        if (measured.laidOut !== expected) {
          findings.push(
            `${width}px: expected ${expected} laid-out theme control(s), found ${measured.laidOut}`,
          );
        }
      }
      expect(findings).toEqual([]);
    });
  }

  const CONTROLS = [
    { slot: "locale-control", name: SWITCH_TO_ARABIC },
    { slot: "theme-control", name: TO_DARK },
  ] as const;

  for (const { slot, name } of CONTROLS) {
    test(`${slot}: the glyph carries no transform in any interaction state`, async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const control = page.getByRole("button", { name });
      const box = await control.boundingBox();
      if (box === null) {
        throw new Error(`${slot} has no layout box.`);
      }

      // Measured before any activation: releasing a press fires the toggle,
      // which renames the button and invalidates this locator.
      const glyphBox = await control.locator("svg").boundingBox();
      // The glyph keeps the primitive's standard 16px size — the larger box is
      // breathing room, not a bigger icon.
      expect(glyphBox?.width).toBe(16);
      expect(glyphBox?.height).toBe(16);

      const motionless = { transform: "none", rotate: "none", scale: "none" };
      expect(await glyphMotion(page, slot)).toMatchObject(motionless);

      await control.hover();
      expect(await glyphMotion(page, slot)).toMatchObject(motionless);

      await control.focus();
      expect(await glyphMotion(page, slot)).toMatchObject(motionless);

      // Held down, so `:active` applies. The release is aimed away from the
      // control so the toggle never fires and the state stays comparable.
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      expect(await glyphMotion(page, slot)).toMatchObject(motionless);
      await page.mouse.move(0, 0);
      await page.mouse.up();
    });
  }

  test("hover and focus feedback come from the Button primitive alone", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    for (const { slot, name } of CONTROLS) {
      const control = page.getByRole("button", { name });
      const surface = () =>
        control.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            backgroundColor: style.backgroundColor,
            borderColor: style.borderTopColor,
            boxShadow: style.boxShadow,
          };
        });

      const atRest = await surface();
      await control.hover();
      // The variant's neutral accent surface — a real, visible change that is
      // not carried by motion.
      await expect
        .poll(async () => (await surface()).backgroundColor)
        .not.toBe(atRest.backgroundColor);

      await page.mouse.move(0, 0);
      await control.focus();
      const focused = await surface();
      expect(focused.boxShadow).not.toBe("none");
      expect(focused.boxShadow).not.toBe(atRest.boxShadow);
      expect(slot).toBeTruthy();
    }
  });

  test("reduced motion needs no control-specific handling", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    for (const { slot, name } of CONTROLS) {
      const control = page.getByRole("button", { name });
      await control.hover();
      await control.focus();

      // Nothing control-specific to disable: the glyph never transforms, and
      // the focus ring and colour feedback are untouched.
      expect(await glyphMotion(page, slot)).toMatchObject({
        transform: "none",
        rotate: "none",
        scale: "none",
      });
      const state = await control.evaluate((element) => ({
        focusVisible: element.matches(":focus-visible"),
        boxShadow: getComputedStyle(element).boxShadow,
      }));
      expect(state.focusVisible).toBe(true);
      expect(state.boxShadow).not.toBe("none");
    }

    // Neither action is delayed.
    await page.getByRole("button", { name: TO_DARK }).click();
    expect(await isDark(page)).toBe(true);

    await page.getByRole("button", { name: SWITCH_TO_ARABIC }).click();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });
});

test.describe("accessibility of the control cluster", () => {
  for (const theme of ["light", "dark"] as const) {
    for (const locale of ["en", "ar"] as const) {
      test(`no axe violations in the header — ${theme} ${locale}`, async ({ page }) => {
        await seedStorage(page, locale === "ar" ? { theme, locale } : { theme });
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        // The control names its ACTION, so a dark page offers the way back.
        const expectedName =
          theme === "dark"
            ? locale === "ar"
              ? TO_LIGHT_AR
              : TO_LIGHT
            : locale === "ar"
              ? TO_DARK_AR
              : TO_DARK;
        await expect(page.getByRole("button", { name: expectedName })).toBeVisible();

        const results = await new AxeBuilder({ page })
          .include("header")
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});
