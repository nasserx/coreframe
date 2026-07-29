import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

type MarketingLocale = "en" | "ar";
type MarketingTheme = "light" | "dark";

const COPY = {
  en: {
    direction: "ltr",
    heading: "A dependable starting point for modern web products.",
    cta: "Explore the capabilities",
    navLabel: "Primary navigation",
    openNav: "Open navigation",
    capabilities: "Capabilities",
  },
  ar: {
    direction: "rtl",
    heading: "نقطة انطلاق موثوقة لمنتجات ويب حديثة.",
    cta: "استكشف الإمكانات",
    navLabel: "التنقل الرئيسي",
    openNav: "فتح التنقل",
    capabilities: "الإمكانات",
  },
} as const;

const STATES = [
  { theme: "light", locale: "en" },
  { theme: "dark", locale: "en" },
  { theme: "light", locale: "ar" },
  { theme: "dark", locale: "ar" },
] as const satisfies ReadonlyArray<{ theme: MarketingTheme; locale: MarketingLocale }>;

const WIDTHS = [320, 390, 1024, 1440] as const;

const ENGLISH_MARKETING_TEXT = [
  "Frontend Foundation",
  "Overview",
  "Capabilities",
  "Production-ready by design",
  "A dependable starting point for modern web products.",
  "Build on a typed, accessible foundation with semantic themes, bilingual direction support, responsive public chrome, and automated quality gates.",
  "Explore the capabilities",
  "App Router architecture",
  "Semantic light and dark themes",
  "English and Arabic ready",
  "Semantic themes",
  "Light and dark from one token system.",
  "Bilingual direction",
  "English LTR and Arabic RTL.",
  "Static by default",
  "Routes prerender without request-time locale state.",
  "Automated quality",
  "Formatting, types, tests, accessibility, and overflow checks.",
  "A domain-neutral base for production web applications.",
  "Built with semantic tokens, typed contracts, and static generation.",
] as const;

const ARABIC_MARKETING_TEXT = [
  "أساس الواجهات",
  "نظرة عامة",
  "الإمكانات",
  "جاهز للإنتاج من الأساس",
  "نقطة انطلاق موثوقة لمنتجات ويب حديثة.",
  "ابدأ من أساس مضبوط الأنواع ومتوافق مع معايير الوصول، يدعم المظهرين الفاتح والداكن، والإنجليزية والعربية باتجاهي LTR وRTL، مع هيكل واجهة عامة متجاوب وبوابات جودة آلية.",
  "استكشف الإمكانات",
  "معمارية App Router",
  "مظهران دلاليان: فاتح وداكن",
  "دعم متكامل للإنجليزية والعربية",
  "مظاهر دلالية",
  "مظهران فاتح وداكن من نظام رموز دلالي واحد.",
  "لغة واتجاه",
  "تجربة متكافئة للإنجليزية LTR والعربية RTL.",
  "ثابت افتراضيًا",
  "تُولَّد المسارات مسبقًا دون الاعتماد على حالة وقت الطلب.",
  "جودة آلية",
  "فحص التنسيق والأنواع والاختبارات والوصول ومنع التجاوز الأفقي.",
  "أساس محايد المجال لبناء تطبيقات ويب إنتاجية.",
  "مبني على رموز دلالية وعقود أنواع صريحة وتوليد ثابت.",
] as const;

async function gotoMarketingState(
  page: Page,
  theme: MarketingTheme,
  locale: MarketingLocale,
): Promise<void> {
  await page.goto("/");
  await page.evaluate(
    ({ themeValue, localeValue }) => {
      window.localStorage.setItem("theme", themeValue);
      window.localStorage.setItem("locale", localeValue);
    },
    { themeValue: theme, localeValue: locale },
  );
  await page.reload();
  await page.waitForLoadState("networkidle");

  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(page.locator("html")).toHaveAttribute("dir", COPY[locale].direction);
  await expect(page.getByRole("heading", { level: 1, name: COPY[locale].heading })).toBeVisible();
}

test("root marketing route owns one landmark set and a resolved primary action", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

  const cta = page.getByRole("link", { name: COPY.en.cta });
  await expect(cta).toHaveAttribute("href", "#capabilities");
  await expect(page.locator("section#capabilities")).toHaveCount(1);
  await expect(page.locator('[data-slot="marketing-preview"]')).toHaveAttribute(
    "aria-hidden",
    "true",
  );
});

test("root marketing metadata remains the canonical server value after a locale switch", async ({
  page,
}) => {
  await gotoMarketingState(page, "light", "en");
  await page.getByRole("button", { name: "العربية" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");

  await expect(page).toHaveTitle("Frontend Foundation");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "A reusable frontend foundation for production web applications.",
  );
});

test("visible marketing copy, direction, and display metrics follow the live locale", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoMarketingState(page, "light", "en");

  const englishHeading = page.getByRole("heading", { level: 1, name: COPY.en.heading });
  const englishMetrics = await englishHeading.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      fontSize: Number.parseFloat(style.fontSize),
      lineHeight: Number.parseFloat(style.lineHeight),
      fontWeight: style.fontWeight,
    };
  });
  expect(englishMetrics.fontWeight).toBe("800");
  expect(englishMetrics.lineHeight / englishMetrics.fontSize).toBeCloseTo(1.05, 1);

  await page.getByRole("button", { name: "العربية" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(englishHeading).toHaveCount(0);

  for (const text of ARABIC_MARKETING_TEXT) {
    await expect(
      page.getByText(text, { exact: true }).first(),
      `Arabic copy: ${text}`,
    ).toBeVisible();
  }
  for (const text of ENGLISH_MARKETING_TEXT) {
    await expect(
      page.getByText(text, { exact: true }),
      `English copy removed: ${text}`,
    ).toHaveCount(0);
  }

  const arabicHeading = page.getByRole("heading", { level: 1, name: COPY.ar.heading });
  await expect(arabicHeading).toBeVisible();
  const arabicMetrics = await arabicHeading.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      fontSize: Number.parseFloat(style.fontSize),
      lineHeight: Number.parseFloat(style.lineHeight),
      fontWeight: style.fontWeight,
    };
  });
  expect(arabicMetrics.fontWeight).toBe("800");
  expect(arabicMetrics.lineHeight / arabicMetrics.fontSize).toBeCloseTo(1.2, 1);

  await expect(page.getByRole("link", { name: COPY.ar.cta })).toHaveAttribute(
    "href",
    "#capabilities",
  );
  await expect(page.getByRole("navigation", { name: COPY.ar.navLabel })).toBeVisible();
});

test("root marketing page is axe-clean in each theme and locale", async ({ page }) => {
  for (const { theme, locale } of STATES) {
    await gotoMarketingState(page, theme, locale);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const readable = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    }));

    expect(readable, `${theme} ${locale}`).toEqual([]);
  }
});

test("root marketing page and header do not overflow at checkpoint widths", async ({ page }) => {
  for (const { theme, locale } of STATES) {
    await gotoMarketingState(page, theme, locale);

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });

      const measured = await page.evaluate(() => {
        const root = document.documentElement;
        const headerRow = document.querySelector('[data-slot="site-shell-header-row"]');
        return {
          pageOverflow: root.scrollWidth - root.clientWidth,
          headerOverflow: headerRow === null ? null : headerRow.scrollWidth - headerRow.clientWidth,
        };
      });

      expect(measured.pageOverflow, `${theme} ${locale} at ${width}px`).toBeLessThanOrEqual(1);
      expect(measured.headerOverflow, `${theme} ${locale} header at ${width}px`).not.toBeNull();
      expect(
        measured.headerOverflow ?? 0,
        `${theme} ${locale} header at ${width}px`,
      ).toBeLessThanOrEqual(1);
    }
  }
});

test("mobile marketing navigation reaches a real anchor and dismisses", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const locale of ["en", "ar"] as const) {
    await gotoMarketingState(page, "light", locale);

    const trigger = page.getByRole("button", { name: COPY[locale].openNav });
    await trigger.click();

    const drawer = page.getByRole("dialog", { name: COPY[locale].navLabel });
    await expect(drawer).toBeVisible();
    await drawer.getByRole("link", { name: COPY[locale].capabilities }).click();

    await expect(drawer).toBeHidden();
    await expect(page).toHaveURL(/\/#capabilities$/);
    await expect(page.locator("section#capabilities")).toBeVisible();
  }
});
