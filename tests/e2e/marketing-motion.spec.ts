import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

/*
 * Browser contract for two deliberately separate behaviours:
 *
 * - native smooth same-document anchor scrolling, which is a GLOBAL foundation
 *   contract owned by `src/app/globals.css` and therefore asserted on
 *   non-marketing routes too;
 * - the one-time viewport reveal with its group-only card stagger, which is an
 *   optional enhancement owned by `src/features/marketing` and must not appear
 *   anywhere else.
 *
 * They are exercised in one spec because the marketing route is the only place
 * both are live at once, which is where a leak between them would show.
 *
 * Everything asserted here is a computed or observable browser fact —
 * `scroll-behavior`, `animation-delay`, landing geometry, attribute state,
 * registered listeners. Nothing reads CSS source text, and nothing waits on an
 * arbitrary elapsed duration: the reveal is awaited by its own state
 * attribute, so the tests neither race the animation nor encode its length.
 *
 * The DOM-level reveal contract (who is enhanced, what happens without the
 * enhancement) lives in src/features/marketing/marketing-reveal.test.tsx.
 */

const REVEAL_TARGET = "[data-reveal]";
const REVEAL_STATE = "data-reveal-state";

/** Both shells' sticky bar, and the `scroll-padding-block-start` that clears it. */
const HEADER_HEIGHT = 64;

/** Every same-page destination the marketing route promises, in page order. */
const SECTION_IDS = [
  "overview",
  "capabilities",
  "capability-story",
  "architecture",
  "bilingual-design",
  "quality",
  "faq",
  "next-step",
] as const;

const VIEWPORTS = [
  { width: 320, height: 800 },
  { width: 390, height: 844 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
] as const;

async function gotoMarketing(page: Page, locale: "en" | "ar" = "en"): Promise<void> {
  await page.addInitScript((localeValue) => {
    try {
      window.localStorage.setItem("locale", localeValue);
    } catch {
      // Storage unavailable: the app falls back to its default locale.
    }
  }, locale);
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
}

/**
 * Read the page the way a person does — in viewport-sized steps — and wait
 * until no enhanced unit is still waiting to enter. A single jump to the
 * bottom would not do: IntersectionObserver reports what is in view, so units
 * the jump skipped over would never be reported at all.
 */
async function revealEverything(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const nextFrame = (): Promise<void> =>
      new Promise((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    // Any step below a full viewport makes consecutive samples overlap, so
    // their union covers the document and no unit can be passed over. Kept
    // well below 1 for margin, and well above a scroll-like crawl: this sweep
    // runs in most tests here, so its cost is the spec's cost.
    const step = Math.round(window.innerHeight * 0.75);
    for (let top = 0; top <= document.documentElement.scrollHeight; top += step) {
      window.scrollTo({ top, behavior: "instant" });
      await nextFrame();
      await nextFrame();
    }
  });
  await expect
    .poll(async () =>
      page.evaluate(
        (selector) =>
          [...document.querySelectorAll(selector)].filter(
            (element) => element.getAttribute("data-reveal-state") === "hidden",
          ).length,
        REVEAL_TARGET,
      ),
    )
    .toBe(0);
  // "Shown" starts the entrance; it does not end it. Wait on the animations
  // themselves — a condition, not a duration — so nothing downstream measures
  // a half-faded element.
  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          document.getAnimations().filter((animation) => animation.playState !== "finished").length,
      ),
    )
    .toBe(0);
}

/**
 * Document-relative top of every reveal unit, for layout-stability comparison.
 * Always sampled from the document top so the two readings share one origin
 * and cannot differ by sub-pixel scroll rounding.
 */
async function unitLayout(page: Page): Promise<{ tops: number[]; scrollHeight: number }> {
  return page.evaluate((selector) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    return {
      tops: [...document.querySelectorAll(selector)].map((element) =>
        Math.round(element.getBoundingClientRect().top),
      ),
      scrollHeight: document.documentElement.scrollHeight,
    };
  }, REVEAL_TARGET);
}

test("every same-page marketing destination stays a real anchor with a resolvable target", async ({
  page,
}) => {
  await gotoMarketing(page);

  const links = await page.evaluate(() =>
    [...document.querySelectorAll("a")]
      .filter((anchor) => anchor.getAttribute("href")?.startsWith("#") === true)
      .map((anchor) => ({
        tag: anchor.tagName,
        href: anchor.getAttribute("href") ?? "",
        // A skip link is chrome, not a marketing section link, but it is still
        // a same-page anchor and must resolve like one.
        resolves: document.getElementById((anchor.getAttribute("href") ?? "#").slice(1)) !== null,
      })),
  );

  expect(links.length).toBeGreaterThan(0);
  for (const link of links) {
    expect(link.tag).toBe("A");
    expect(link.resolves).toBe(true);
  }

  // Section links must not be intercepted: activating one has to leave the
  // browser's own navigation intact, hash and history included.
  const before = page.url();
  const closingAction = page.locator('[data-slot="marketing-closing-actions"] a').first();
  const href = await closingAction.getAttribute("href");
  await closingAction.click();
  await expect(page).toHaveURL(new RegExp(`${href ?? ""}$`));

  await page.goBack();
  expect(page.url()).toBe(before);
});

/**
 * Activates a same-page anchor and reports how the journey actually happened:
 * an animated scroll emits a scroll event per frame, an immediate one emits a
 * single jump. Counting the trip's own events keeps the distinction observable
 * without encoding how long a smooth scroll is supposed to take.
 */
async function travelToAnchor(page: Page, name: string, targetId: string): Promise<number> {
  await page.evaluate(() => {
    const counter = { ticks: 0 };
    Object.defineProperty(window, "__scrollTicks", { value: counter, configurable: true });
    window.addEventListener(
      "scroll",
      () => {
        counter.ticks += 1;
      },
      { passive: true },
    );
  });

  await page
    .getByRole("navigation", { name: "Footer navigation" })
    .getByRole("link", { name })
    .click();

  await expect
    .poll(async () =>
      page.evaluate(
        ({ id, header }) => {
          const top = Math.round(
            document.getElementById(id)?.getBoundingClientRect().top ?? -99_999,
          );
          return top >= header - 1 && top <= header + 1;
        },
        { id: targetId, header: HEADER_HEIGHT },
      ),
    )
    .toBe(true);

  return page.evaluate(
    () => (window as unknown as { __scrollTicks: { ticks: number } }).__scrollTicks.ticks,
  );
}

test("anchors travel when a reader activates them, and jump under reduced motion", async ({
  page,
}) => {
  const scrollBehavior = () =>
    page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);

  await gotoMarketing(page);
  expect(await scrollBehavior()).toBe("smooth");
  // A travelled scroll reports many positions on the way; the exact number is
  // frame rate, so the contract is only "more than a single jump".
  expect(await travelToAnchor(page, "Architecture", "architecture")).toBeGreaterThan(3);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoMarketing(page);
  expect(await scrollBehavior()).toBe("auto");
  // No travel at all: the page is simply already there.
  expect(await travelToAnchor(page, "Architecture", "architecture")).toBeLessThanOrEqual(2);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  expect(await scrollBehavior()).toBe("smooth");
});

test("smooth anchor scrolling is a global contract, not a marketing one", async ({ page }) => {
  const scrollBehavior = () =>
    page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);

  // Same declaration, same scroller, every route — a product built on this
  // foundation gets it without opting in.
  for (const route of ["/", "/showcase", "/showcase/site", "/showcase/forms"]) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    expect(await scrollBehavior(), `${route} must scroll smoothly`).toBe("smooth");
    // Its companion global: the sticky bar is cleared by scroll padding on the
    // same element, so no route or section owns an offset of its own.
    expect(
      await page.evaluate(() => getComputedStyle(document.documentElement).scrollPaddingBlockStart),
      `${route} must clear the sticky bar globally`,
    ).toBe(`${HEADER_HEIGHT}px`);
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["/", "/showcase", "/showcase/site", "/showcase/forms"]) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    expect(await scrollBehavior(), `${route} must jump immediately`).toBe("auto");
  }
});

test("the reveal stays marketing-only while the scroll contract is shared", async ({ page }) => {
  // Non-marketing routes inherit the global scroll behaviour and nothing else:
  // no reveal unit, no reveal state, no entrance animation on scroll.
  for (const route of ["/showcase", "/showcase/site", "/showcase/tokens", "/showcase/forms"]) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");

    expect(await page.locator(REVEAL_TARGET).count(), `${route} owns no reveal unit`).toBe(0);
    expect(await page.locator(`[${REVEAL_STATE}]`).count(), `${route} reveals nothing`).toBe(0);

    await page.evaluate(async () => {
      const nextFrame = (): Promise<void> =>
        new Promise((resolve) => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      const step = Math.round(window.innerHeight * 0.75);
      for (let top = 0; top <= document.documentElement.scrollHeight; top += step) {
        window.scrollTo({ top, behavior: "instant" });
        await nextFrame();
        await nextFrame();
      }
    });
    // Keyframe animations only: the shells' own state transitions (the header
    // boundary) are ordinary feedback and are expected to exist.
    expect(
      await page.evaluate(
        () =>
          document.getAnimations().filter((animation) => animation instanceof CSSAnimation).length,
      ),
      `${route} runs no entrance animation on scroll`,
    ).toBe(0);
  }
});

test("every marketing section lands clear of the sticky header, including on direct load", async ({
  page,
}) => {
  for (const id of SECTION_IDS) {
    await page.goto(`/#${id}`);
    await page.waitForLoadState("networkidle");

    // Polled, not sampled: the scroll is animated, so the landing position is
    // the value it settles on, never the one it passes through.
    await expect
      .poll(async () =>
        page.evaluate(
          ({ sectionId, header }) => {
            const element = document.getElementById(sectionId);
            if (element === null) return "missing";
            const top = Math.round(element.getBoundingClientRect().top);
            // `scroll-padding-block-start` on `html` reserves the bar, so a
            // section's top edge settles at the bar's lower edge. The final
            // section can stop short of it only because the document has
            // nothing left to scroll — it still must not be behind the bar.
            const atDocumentEnd =
              Math.ceil(window.scrollY) >=
              document.documentElement.scrollHeight - window.innerHeight - 1;
            if (top >= header - 1 && (top <= header + 1 || atDocumentEnd)) return "at-header";
            return `top:${top}`;
          },
          { sectionId: id, header: HEADER_HEIGHT },
        ),
      )
      .toBe("at-header");
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
});

test("keyboard activation navigates and leaves focus where the reader put it", async ({ page }) => {
  await gotoMarketing(page);

  const link = page
    .getByRole("navigation", { name: "Footer navigation" })
    .getByRole("link", { name: "Architecture" });
  await link.focus();
  await expect(link).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/#architecture$/);
  // Motion must not steal or trap focus; the anchor keeps it.
  await expect(link).toBeFocused();
  await expect(page.locator("#architecture")).toBeVisible();
});

test("marketing sections reveal once and never replay", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoMarketing(page);

  const story = page.locator('#capability-story [data-slot="marketing-story-grid"]');
  await expect(story).toHaveAttribute(REVEAL_STATE, "hidden");

  await revealEverything(page);
  await expect(story).toHaveAttribute(REVEAL_STATE, "shown");
  await expect(story).toHaveCSS("opacity", "1");

  // Leave and re-enter: a revealed unit is unobserved, so nothing re-runs.
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.evaluate(() => {
    document.querySelector("#capability-story")?.scrollIntoView({ behavior: "instant" });
  });
  await expect(story).toHaveAttribute(REVEAL_STATE, "shown");
  await expect(story).toHaveCSS("opacity", "1");
});

test("card entry is staggered inside its group only, in the same order in both locales", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const locale of ["en", "ar"] as const) {
    await gotoMarketing(page, locale);
    await revealEverything(page);

    const delays = await page
      .locator('#capability-story [data-slot="marketing-story-grid"] > *')
      .evaluateAll((cards) => cards.map((card) => getComputedStyle(card).animationDelay));
    // 60ms per sibling, in DOM order — which is reading order in both
    // directions, so English and Arabic run the identical sequence.
    expect(delays).toEqual(["0s", "0.06s", "0.12s", "0.18s", "0.24s", "0.3s"]);

    // Sections are never staggered against one another; only siblings are.
    const sectionDelays = await page
      .locator('#quality [data-slot="marketing-section-intro"]')
      .evaluate((element) => getComputedStyle(element).animationDelay);
    expect(sectionDelays).toBe("0s");
  }
});

test("revealing causes no layout shift and no horizontal overflow at any checkpoint", async ({
  page,
}) => {
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    await gotoMarketing(page);

    const before = await unitLayout(page);
    await revealEverything(page);
    const after = await unitLayout(page);

    // Opacity and a transform are the whole vocabulary, so every unit occupies
    // exactly the same box before and after it enters.
    expect(after.tops, `layout must be stable at ${viewport.width}px`).toEqual(before.tops);
    expect(after.scrollHeight).toBe(before.scrollHeight);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `no overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
  }
});

test("the reveal adds no scroll listener and no per-scroll work", async ({ page }) => {
  // Patch the one prototype every target inherits from, before any app code
  // runs, and record who asks for a scroll event.
  await page.addInitScript(() => {
    const seen: string[] = [];
    Object.defineProperty(window, "__scrollListeners", { value: seen });
    const original = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function patched(this: EventTarget, type, ...rest) {
      if (type === "scroll") {
        seen.push(this === window ? "window" : this.constructor.name || "unknown");
      }
      return Reflect.apply(original, this, [type, ...rest]);
    };
  });
  const scrollListeners = async (): Promise<string[]> =>
    page.evaluate(() => (window as unknown as { __scrollListeners: string[] }).__scrollListeners);

  await page.setViewportSize({ width: 1440, height: 900 });

  // Baseline from a route that renders no reveal unit, so the assertion is
  // about this feature rather than about anything the framework does.
  await page.goto("/showcase");
  await page.waitForLoadState("networkidle");
  const baseline = await scrollListeners();

  await gotoMarketing(page);
  await revealEverything(page);

  expect(await scrollListeners()).toEqual(baseline);
});

test("content stays visible without client JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL ?? ""}/`);

  // Nothing is enhanced, so nothing is hidden: the server's markup is the
  // readable page.
  expect(await page.locator(`[${REVEAL_STATE}]`).count()).toBe(0);
  const units = page.locator(REVEAL_TARGET);
  expect(await units.count()).toBeGreaterThan(0);
  for (const id of SECTION_IDS) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator('#capability-story [data-slot="marketing-story-grid"]')).toHaveCSS(
    "opacity",
    "1",
  );

  await context.close();
});

test("an unavailable IntersectionObserver fails open", async ({ page }) => {
  await page.addInitScript(() => {
    Reflect.deleteProperty(window, "IntersectionObserver");
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoMarketing(page);

  expect(await page.locator(`[${REVEAL_STATE}]`).count()).toBe(0);
  await expect(page.locator('#capability-story [data-slot="marketing-story-grid"]')).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(page.getByRole("heading", { level: 2, name: /Technical choices/ })).toBeVisible();
});

test("reduced motion renders every section immediately, in its final position", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoMarketing(page);

  // Nothing is taken over at all, so there is no hidden state to recover from
  // and no stagger delay left to wait through.
  expect(await page.locator(`[${REVEAL_STATE}]`).count()).toBe(0);

  const units = page.locator(REVEAL_TARGET);
  const count = await units.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    await expect(units.nth(index)).toHaveCSS("opacity", "1");
  }

  // Semantic state feedback survives — only the movement is gone.
  const card = page.locator('#capability-story [data-slot="marketing-story-card"]').first();
  const resting = await card.evaluate((element) => getComputedStyle(element).backgroundColor);
  await card.hover();
  await expect(card).toHaveCSS("translate", "none");
  expect(await card.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(
    resting,
  );
});

/*
 * One test per locale rather than one covering both. A full-page reveal sweep
 * followed by an axe scan is expensive, and four of them in a single test does
 * not fit the suite's per-test budget once the run is parallel — the cells are
 * unchanged, only the budget they are spread across.
 */
for (const locale of ["en", "ar"] as const) {
  test(`a revealed marketing page stays axe-clean and console-clean [${locale}]`, async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    for (const theme of ["light", "dark"] as const) {
      await page.addInitScript((themeValue) => {
        try {
          window.localStorage.setItem("theme", themeValue);
        } catch {
          // Storage unavailable: the app falls back gracefully.
        }
      }, theme);
      await gotoMarketing(page, locale);
      await revealEverything(page);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(
        results.violations.map((violation) => violation.id),
        `axe must stay clean after the reveal [${theme} ${locale}]`,
      ).toEqual([]);
    }

    expect(consoleErrors).toEqual([]);
  });
}
