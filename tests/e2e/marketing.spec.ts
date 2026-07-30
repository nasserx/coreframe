import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

type MarketingLocale = "en" | "ar";
type MarketingTheme = "light" | "dark";

const COPY = {
  en: {
    brand: "Frontend Foundation",
    direction: "ltr",
    heading: "A dependable starting point for modern web products.",
    cta: "Explore the capabilities",
    navLabel: "Primary navigation",
    openNav: "Open navigation",
    navigation: [
      { label: "Overview", href: "#overview" },
      { label: "Capabilities", href: "#capability-story" },
      { label: "Architecture", href: "#architecture" },
      { label: "Quality", href: "#quality" },
    ],
    storyHeading: "Technical choices that carry their evidence.",
    architectureHeading: "App Router: static where the route allows it.",
    bilingualHeading: "One semantic system, equal care in both directions.",
    qualityHeading: "Risk-reducing defaults, not absolute guarantees.",
    architectureDiagram: "Architecture delivery path",
    bilingualDiagram: "Semantic design-system path",
    pipelineDiagram: "Automated validation pipeline",
  },
  ar: {
    brand: "أساس الواجهات",
    direction: "rtl",
    heading: "نقطة انطلاق موثوقة لمنتجات ويب حديثة.",
    cta: "استكشف الإمكانات",
    navLabel: "التنقل الرئيسي",
    openNav: "فتح التنقل",
    navigation: [
      { label: "نظرة عامة", href: "#overview" },
      { label: "القدرات", href: "#capability-story" },
      { label: "المعمارية", href: "#architecture" },
      { label: "الجودة", href: "#quality" },
    ],
    storyHeading: "اختيارات تقنية تحمل دليلها معها.",
    architectureHeading: "معمارية App Router، وتوليد ثابت حين يسمح المسار.",
    bilingualHeading: "نظام دلالي واحد، وعناية متكافئة في الاتجاهين.",
    qualityHeading: "إعدادات تقلّل المخاطر، لا ضمانات مطلقة.",
    architectureDiagram: "مسار التسليم المعماري",
    bilingualDiagram: "مسار نظام التصميم الدلالي",
    pipelineDiagram: "مسار التحقق الآلي",
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
  "Architecture",
  "Quality",
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
  "Technical choices that carry their evidence.",
  "App Router: static where the route allows it.",
  "One semantic system, equal care in both directions.",
  "Risk-reducing defaults, not absolute guarantees.",
  "The landing route prerenders from server-owned route composition and does not read request-time locale state.",
  "Inter is bundled through Next.js, while Tajawal is served from local Arabic subsets. Browser tests verify script ownership without runtime Google Fonts requests.",
  "Known dependency advisories are documented and reviewed rather than hidden or cleared through an unsafe forced downgrade. This reduces uncertainty; it does not mean the dependency tree is risk-free.",
  "Tailwind CSS · semantic tokens",
  "Next.js · static output",
  "Base UI · axe · keyboard",
  "Server",
  "Static",
  "Client",
  "Tokens",
  "Themes",
  "Direction",
  "A domain-neutral base for production web applications.",
  "Built with semantic tokens, typed contracts, and static generation.",
] as const;

const ARABIC_MARKETING_TEXT = [
  "أساس الواجهات",
  "نظرة عامة",
  "القدرات",
  "المعمارية",
  "الجودة",
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
  "اختيارات تقنية تحمل دليلها معها.",
  "معمارية App Router، وتوليد ثابت حين يسمح المسار.",
  "نظام دلالي واحد، وعناية متكافئة في الاتجاهين.",
  "إعدادات تقلّل المخاطر، لا ضمانات مطلقة.",
  "يُولَّد المسار الرئيسي مسبقًا من تركيب مملوك للخادم، ولا يقرأ حالة اللغة وقت الطلب.",
  "يُحزَّم Inter عبر Next.js، بينما يُقدَّم Tajawal من ملفات محلية مخصّصة للعربية. وتتحقق اختبارات المتصفح من اختيار الخط المناسب دون طلب Google Fonts وقت التشغيل.",
  "تُوثَّق تنبيهات الاعتمادات المعروفة وتُراجع بدل إخفائها أو إزالتها بخفض قسري غير آمن للإصدارات. يقلّل ذلك الغموض، لكنه لا يعني أن شجرة الاعتمادات خالية من المخاطر.",
  "رموز دلالية · Tailwind CSS",
  "ناتج ثابت · Next.js",
  "لوحة المفاتيح · Base UI · axe",
  "الخادم",
  "ثابت",
  "العميل",
  "الرموز",
  "المظاهر",
  "الاتجاه",
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

  const headingLevels = await page
    .locator("h1, h2, h3")
    .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
  expect(headingLevels[0]).toBe(1);
  for (let index = 1; index < headingLevels.length; index += 1) {
    expect(headingLevels[index] ?? 0).toBeLessThanOrEqual((headingLevels[index - 1] ?? 0) + 1);
  }

  const cta = page.getByRole("link", { name: COPY.en.cta });
  await expect(cta).toHaveAttribute("href", "#capabilities");
  await expect(page.locator("section#capabilities")).toHaveCount(1);
  for (const id of ["capability-story", "architecture", "bilingual-design", "quality"]) {
    await expect(page.locator(`section#${id}`)).toHaveCount(1);
  }
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

test("shared brand lockups keep text-owned names and resolve the app icon", async ({
  page,
  request,
}) => {
  for (const locale of ["en", "ar"] as const) {
    await gotoMarketingState(page, "light", locale);

    const headerBrand = page
      .getByRole("banner")
      .getByRole("link", { name: COPY[locale].brand, exact: true });
    const footerBrand = page
      .getByRole("contentinfo")
      .getByRole("link", { name: COPY[locale].brand, exact: true });

    await expect(headerBrand).toBeVisible();
    await expect(footerBrand).toBeVisible();
    await expect(page.getByRole("link", { name: COPY[locale].brand, exact: true })).toHaveCount(2);
    await expect(headerBrand.locator('[data-slot="brand-mark"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await expect(footerBrand.locator('[data-slot="brand-mark"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await expect(page.getByRole("img", { name: COPY[locale].brand })).toHaveCount(0);
  }

  const iconLink = page.locator('link[rel="icon"]');
  await expect(iconLink).toHaveCount(1);
  const iconHref = await iconLink.getAttribute("href");
  expect(iconHref).not.toBeNull();
  const iconUrl = new URL(iconHref ?? "", page.url());
  expect(iconUrl.pathname).toBe("/icon.svg");

  const iconResponse = await request.get(iconUrl.toString());
  expect(iconResponse.status()).toBe(200);
  expect(iconResponse.headers()["content-type"]).toContain("image/svg+xml");
});

test("desktop and drawer navigation share four ordered, unique page targets", async ({ page }) => {
  for (const locale of ["en", "ar"] as const) {
    await page.setViewportSize({ width: 1024, height: 900 });
    await gotoMarketingState(page, "light", locale);

    const desktopNavigation = page
      .getByRole("banner")
      .getByRole("navigation", { name: COPY[locale].navLabel });
    const desktopLinks = desktopNavigation.getByRole("link");
    await expect(desktopLinks).toHaveText(COPY[locale].navigation.map(({ label }) => label));

    for (const [index, { href }] of COPY[locale].navigation.entries()) {
      await expect(desktopLinks.nth(index)).toHaveAttribute("href", href);
      await expect(page.locator(href)).toHaveCount(1);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: COPY[locale].openNav }).click();

    const drawer = page.getByRole("dialog", { name: COPY[locale].navLabel });
    const drawerLinks = drawer.getByRole("link");
    await expect(drawerLinks).toHaveText(COPY[locale].navigation.map(({ label }) => label));
    for (const [index, { href }] of COPY[locale].navigation.entries()) {
      await expect(drawerLinks.nth(index)).toHaveAttribute("href", href);
    }

    const duplicateIds = await page.locator("[id]").evaluateAll((elements) => {
      const ids = elements.map(({ id }) => id);
      return ids.filter((id, index) => ids.indexOf(id) !== index);
    });
    expect(duplicateIds).toEqual([]);
  }
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

  for (const name of [
    COPY.en.storyHeading,
    COPY.en.architectureHeading,
    COPY.en.bilingualHeading,
    COPY.en.qualityHeading,
  ]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }

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

  for (const name of [
    COPY.ar.storyHeading,
    COPY.ar.architectureHeading,
    COPY.ar.bilingualHeading,
    COPY.ar.qualityHeading,
  ]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }
  for (const name of [
    COPY.ar.architectureDiagram,
    COPY.ar.bilingualDiagram,
    COPY.ar.pipelineDiagram,
  ]) {
    await expect(page.getByRole("figure", { name })).toBeVisible();
  }
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

test("a newly added mobile marketing anchor reaches its target and dismisses", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const locale of ["en", "ar"] as const) {
    await gotoMarketingState(page, "light", locale);

    const trigger = page.getByRole("button", { name: COPY[locale].openNav });
    await trigger.click();

    const drawer = page.getByRole("dialog", { name: COPY[locale].navLabel });
    await expect(drawer).toBeVisible();
    const quality = COPY[locale].navigation[3];
    await drawer.getByRole("link", { name: quality.label }).click();

    await expect(drawer).toBeHidden();
    await expect(page).toHaveURL(new RegExp(`/${quality.href}$`));
    await expect(page.locator(quality.href)).toBeVisible();
  }
});
