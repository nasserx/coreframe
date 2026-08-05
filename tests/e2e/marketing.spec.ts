import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

type MarketingLocale = "en" | "ar";
type MarketingTheme = "light" | "dark";

const COPY = {
  en: {
    brand: "Coreframe",
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
    faqHeading: "Clear answers about Coreframe.",
    faqItems: [
      {
        question: "What does Coreframe include?",
        answer:
          "It provides a Next.js App Router structure, explicit TypeScript contracts, semantic light and dark themes, Inter and Tajawal typography, SiteShell and AppShell foundations, English/Arabic LTR/RTL behavior, accessibility-oriented Base UI primitives, automated tests, living documentation, and isolated Showcase examples. It is a frontend starting point—not a complete domain product or backend.",
      },
      {
        question: "How do English, Arabic, LTR, and RTL work together?",
        answer:
          "English and Arabic share one typed catalogue shape, and the visible page, document lang, and dir switch together at runtime. Inter owns Latin text, Tajawal owns Arabic, and logical layout rules support LTR and RTL. Locale selection is client-state-based rather than URL-routed, so server metadata remains the canonical server value.",
      },
      {
        question: "Can I replace the branding and design system?",
        answer:
          "Yes, with deliberate implementation work. Coreframe is a replaceable default identity, while semantic tokens centralize brand and theme adaptation. Preserve shared component and accessibility contracts, and replace identity through its existing owners instead of adding one-off colors or duplicated SVGs.",
      },
      {
        question: "Is the Showcase included in production?",
        answer:
          "Showcase is an isolated development and reference surface, not a production product area. The current release contract can disable it at build time; its routes and API then prerender as static 404 responses while / remains independently available. This is release isolation, not a security sandbox.",
      },
      {
        question: "Is every route statically generated?",
        answer:
          "No. The current / route is statically prerendered because it does not depend on request-time locale state. Static generation remains a route-by-route decision; future authenticated, personalized, or request-dependent routes may need dynamic rendering.",
      },
      {
        question: "Does Coreframe guarantee zero vulnerabilities?",
        answer:
          "No. Coreframe uses reviewed safeguards and quality gates to reduce risk, not to promise perfect security. Dependency install scripts are restricted by a reviewed allowlist, and known advisories are documented and reevaluated rather than hidden or cleared through unsafe forced downgrades. Adopters remain responsible for ongoing dependency and application-security review.",
      },
    ],
    architectureDiagram: "Architecture delivery path",
    bilingualDiagram: "Semantic design-system path",
    pipelineDiagram: "Automated validation pipeline",
    closingEyebrow: "A clear next step",
    closingHeading: "Build from a clear foundation.",
    closingDescription:
      "Review the architecture and safeguards, then adapt the system around your product while preserving its shared contracts.",
    closingPrimary: "Review the architecture",
    closingSecondary: "Inspect the safeguards",
    footerNavLabel: "Footer navigation",
    footerContext: "A domain-neutral base for production web applications.",
    footerStatus: "Built with semantic tokens, typed contracts, and static generation.",
    footerNavigation: [
      { label: "Overview", href: "#overview" },
      { label: "Capabilities", href: "#capability-story" },
      { label: "Architecture", href: "#architecture" },
      { label: "Bilingual design", href: "#bilingual-design" },
      { label: "Quality", href: "#quality" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  ar: {
    brand: "Coreframe",
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
    faqHeading: "إجابات واضحة عن Coreframe.",
    faqItems: [
      {
        question: "ماذا يتضمن Coreframe؟",
        answer:
          "يوفّر بنية Next.js App Router، وعقود TypeScript صريحة، ومظهرين دلاليين: الفاتح والداكن، وخطي Inter وTajawal، وأساسَي SiteShell وAppShell، ودعم الإنجليزية والعربية باتجاهي LTR وRTL، ومكوّنات Base UI تراعي الوصول، واختبارات آلية، ووثائق حيّة، وأمثلة معزولة في Showcase. وهو نقطة انطلاق للواجهة الأمامية، لا منتجًا مكتملًا لمجال محدد ولا خلفية خادمية.",
      },
      {
        question: "كيف يعمل دعم الإنجليزية والعربية واتجاهي LTR وRTL؟",
        answer:
          "تشترك الإنجليزية والعربية في بنية كتالوج واحدة مضبوطة الأنواع، ويتبدّل المحتوى الظاهر وسمتا lang وdir معًا وقت التشغيل. يتولى Inter النص اللاتيني وTajawal النص العربي، وتدعم قواعد التخطيط المنطقية اتجاهي LTR وRTL. يعتمد اختيار اللغة على حالة العميل لا على مسارات URL، لذلك تبقى البيانات الوصفية للخادم بالقيمة الأساسية المعتمدة.",
      },
      {
        question: "هل يمكن استبدال الهوية ونظام التصميم؟",
        answer:
          "نعم، لكن ذلك يتطلب عملاً تنفيذيًا مقصودًا. تمثل Coreframe الهوية الافتراضية القابلة للاستبدال، بينما تجمع الرموز الدلالية تكييف الهوية والمظهر في مواضع مركزية. ينبغي الحفاظ على عقود المكوّنات المشتركة والوصول، وتغيير الهوية عبر مواضع ملكيتها الحالية بدل إضافة ألوان منفردة أو نسخ SVG مكررة.",
      },
      {
        question: "هل يدخل Showcase ضمن إصدار الإنتاج؟",
        answer:
          "Showcase سطح معزول للتطوير والمرجعية، وليس جزءًا من المنتج الإنتاجي. يتيح عقد الإصدار الحالي تعطيله وقت البناء؛ وعندها تُولَّد مساراته وواجهة API كاستجابات 404 ثابتة، بينما يبقى المسار / متاحًا باستقلال. هذا عزل للإصدار، وليس صندوقًا أمنيًا معزولًا.",
      },
      {
        question: "هل تُولَّد جميع المسارات مسبقًا؟",
        answer:
          "لا. يُولَّد المسار / حاليًا مسبقًا لأنه لا يعتمد على حالة اللغة وقت الطلب. ويبقى التوليد الثابت قرارًا يخص كل مسار؛ فقد تحتاج المسارات المستقبلية التي تتطلب مصادقة أو تخصيصًا أو بيانات وقت الطلب إلى عرض ديناميكي.",
      },
      {
        question: "هل يضمن Coreframe انعدام الثغرات؟",
        answer:
          "لا. يستخدم Coreframe ضوابط مراجَعة وبوابات جودة لتقليل المخاطر، لا ليَعِد بأمان كامل. تُقيَّد سكربتات تثبيت الاعتمادات بقائمة سماح مراجَعة، وتُوثَّق التنبيهات المعروفة وتُعاد مراجعتها بدل إخفائها أو إزالة أثرها بخفض قسري غير آمن للإصدارات. ويبقى المتبنّون مسؤولين عن المراجعة المستمرة للاعتمادات وأمن التطبيق.",
      },
    ],
    architectureDiagram: "مسار التسليم المعماري",
    bilingualDiagram: "مسار نظام التصميم الدلالي",
    pipelineDiagram: "مسار التحقق الآلي",
    closingEyebrow: "خطوة تالية واضحة",
    closingHeading: "ابنِ على أساس واضح.",
    closingDescription:
      "راجع المعمارية وضوابط الجودة، ثم كيّف النظام حول منتجك مع الحفاظ على عقوده المشتركة.",
    closingPrimary: "راجع المعمارية",
    closingSecondary: "استعرض ضوابط الجودة",
    footerNavLabel: "تنقل التذييل",
    footerContext: "أساس محايد المجال لبناء تطبيقات ويب إنتاجية.",
    footerStatus: "مبني على رموز دلالية وعقود أنواع صريحة وتوليد ثابت.",
    footerNavigation: [
      { label: "نظرة عامة", href: "#overview" },
      { label: "الإمكانات", href: "#capability-story" },
      { label: "المعمارية", href: "#architecture" },
      { label: "التصميم ثنائي اللغة", href: "#bilingual-design" },
      { label: "الجودة", href: "#quality" },
      { label: "الأسئلة الشائعة", href: "#faq" },
    ],
  },
} as const;

const STATES = [
  { theme: "light", locale: "en" },
  { theme: "dark", locale: "en" },
  { theme: "light", locale: "ar" },
  { theme: "dark", locale: "ar" },
] as const satisfies ReadonlyArray<{ theme: MarketingTheme; locale: MarketingLocale }>;

const WIDTHS = [320, 390, 1024, 1440] as const;

const MARKETING_RHYTHM_WIDTHS = [
  { width: 390, containerPadding: 16, desktop: false },
  { width: 700, containerPadding: 24, desktop: false },
  { width: 768, containerPadding: 16, desktop: true },
  { width: 1024, containerPadding: 24, desktop: true },
  { width: 1440, containerPadding: 24, desktop: true },
] as const;

const FAQ_TECHNICAL_TERMS = [
  "API",
  "App Router",
  "AppShell",
  "Base UI",
  "Coreframe",
  "Inter",
  "LTR",
  "Next.js",
  "RTL",
  "SVG",
  "Showcase",
  "SiteShell",
  "Tajawal",
  "TypeScript",
  "URL",
  "dir",
  "lang",
] as const;

/**
 * English copy that must disappear entirely once the page switches to Arabic.
 *
 * The brand is deliberately absent: `Coreframe` is a proper name, so it is
 * locale-invariant and stays rendered in both languages (`COPY.en.brand ===
 * COPY.ar.brand`). Asserting it removed would contradict the identity
 * contract. Brand presence is covered by the shared brand-lockup test, which
 * checks the header and footer lockups in both locales.
 */
const ENGLISH_MARKETING_TEXT = [
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
  "Questions, answered",
  "Clear answers about Coreframe.",
  "Coreframe is explicit about what it provides, what remains adaptable, and where its guarantees end.",
  ...COPY.en.faqItems.map(({ question }) => question),
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
  COPY.en.closingEyebrow,
  COPY.en.closingHeading,
  COPY.en.closingDescription,
  COPY.en.closingPrimary,
  COPY.en.closingSecondary,
  "Bilingual design",
  "FAQ",
  COPY.en.footerContext,
  COPY.en.footerStatus,
] as const;

const ARABIC_MARKETING_TEXT = [
  // The untranslated brand — visible in Arabic exactly as it is in English.
  "Coreframe",
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
  "أسئلة وإجابات",
  "إجابات واضحة عن Coreframe.",
  "يوضح Coreframe ما يقدّمه، وما يمكن تكييفه، وأين تنتهي ضماناته.",
  ...COPY.ar.faqItems.map(({ question }) => question),
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
  COPY.ar.closingEyebrow,
  COPY.ar.closingHeading,
  COPY.ar.closingDescription,
  COPY.ar.closingPrimary,
  COPY.ar.closingSecondary,
  "التصميم ثنائي اللغة",
  "الأسئلة الشائعة",
  COPY.ar.footerContext,
  COPY.ar.footerStatus,
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

async function getCardSemanticColors(page: Page) {
  return page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.position = "fixed";
    probe.style.visibility = "hidden";
    const tokenOwner = document.querySelector('[data-slot="marketing-story-card"]');
    if (!tokenOwner) throw new Error("The marketing color check requires a StoryCard token owner.");
    tokenOwner.append(probe);

    const resolveColor = (value: string) => {
      probe.style.color = value;
      return getComputedStyle(probe).color;
    };
    const resolveBackground = (value: string) => {
      probe.style.backgroundColor = value;
      return getComputedStyle(probe).backgroundColor;
    };

    const foreground = resolveColor("var(--foreground)");
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("The marketing color check requires a 2D canvas context.");
    context.fillStyle = foreground;
    context.fillRect(0, 0, 1, 1);
    const [red = 0, green = 0, blue = 0] = context.getImageData(0, 0, 1, 1).data;
    const linearize = (channel: number) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    const result = {
      foreground,
      foregroundLuminance:
        0.2126 * linearize(red) + 0.7152 * linearize(green) + 0.0722 * linearize(blue),
      primary: resolveColor("var(--primary)"),
      transparent: resolveBackground("transparent"),
      primaryTint: resolveBackground("color-mix(in oklab, var(--primary) 10%, transparent)"),
    };

    probe.remove();
    return result;
  });
}

async function getNavigationSemanticColors(page: Page) {
  return page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.position = "fixed";
    probe.style.visibility = "hidden";
    const tokenOwner = document.querySelector('[data-slot="site-shell-nav"]');
    if (!tokenOwner) throw new Error("The navigation color check requires its token owner.");
    tokenOwner.append(probe);

    const resolveColor = (value: string) => {
      probe.style.color = value;
      return getComputedStyle(probe).color;
    };
    const result = {
      foreground: resolveColor("var(--foreground)"),
      mutedForeground: resolveColor("var(--muted-foreground)"),
    };

    probe.remove();
    return result;
  });
}

async function getMarketingHorizontalRhythm(page: Page) {
  return page.evaluate(() => {
    const direction = document.documentElement.dir;
    const viewportWidth = document.documentElement.clientWidth;
    const containers = Array.from(
      document.querySelectorAll<HTMLElement>('[data-slot="container"]'),
    );
    const headerRow = document.querySelector<HTMLElement>('[data-slot="site-shell-header-row"]');
    const header = document.querySelector<HTMLElement>('[data-slot="site-shell-header"]');
    const navigation = header?.querySelector<HTMLElement>('[data-slot="site-shell-nav"]');
    const brand = headerRow?.querySelector<HTMLElement>('a[href="/"]');
    const controls = headerRow?.lastElementChild;
    const links = navigation
      ? Array.from(navigation.querySelectorAll<HTMLElement>('a[data-slot="site-shell-nav-item"]'))
      : [];

    if (
      containers.length === 0 ||
      headerRow === null ||
      header === null ||
      navigation === undefined ||
      navigation === null ||
      brand === undefined ||
      brand === null ||
      !(controls instanceof HTMLElement)
    ) {
      throw new Error("The marketing rhythm check requires the complete shell composition.");
    }

    const logicalEdges = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const innerLeft = rect.left + Number.parseFloat(style.paddingLeft);
      const innerRight = rect.right - Number.parseFloat(style.paddingRight);

      return {
        width: rect.width,
        paddingInlineStart: Number.parseFloat(style.paddingInlineStart),
        paddingInlineEnd: Number.parseFloat(style.paddingInlineEnd),
        inlineStart: direction === "rtl" ? viewportWidth - innerRight : innerLeft,
        inlineEnd: direction === "rtl" ? innerLeft : viewportWidth - innerRight,
      };
    };

    const brandRect = brand.getBoundingClientRect();
    const navigationRect = navigation.getBoundingClientRect();
    const controlsRect = controls.getBoundingClientRect();
    const itemRects = links.map((link) => link.getBoundingClientRect());

    return {
      direction,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      headerOverflow: headerRow.scrollWidth - headerRow.clientWidth,
      headerScrolled: header.hasAttribute("data-scrolled"),
      containers: containers.map(logicalEdges),
      headerRow: logicalEdges(headerRow),
      brandMarginInlineEnd: Number.parseFloat(getComputedStyle(brand).marginInlineEnd),
      brandNavigationGap:
        direction === "rtl"
          ? brandRect.left - navigationRect.right
          : navigationRect.left - brandRect.right,
      navigationDisplay: getComputedStyle(navigation).display,
      navigationItemGaps: itemRects.slice(0, -1).map((rect, index) => {
        const next = itemRects[index + 1];
        if (next === undefined) return Number.NaN;
        return direction === "rtl" ? rect.left - next.right : next.left - rect.right;
      }),
      controlsInlineEnd:
        direction === "rtl" ? controlsRect.left : viewportWidth - controlsRect.right,
    };
  });
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
  for (const id of [
    "capability-story",
    "architecture",
    "bilingual-design",
    "quality",
    "faq",
    "next-step",
  ]) {
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
  await page.getByRole("button", { name: "Switch to Arabic" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");

  await expect(page).toHaveTitle("Coreframe — Frontend Architecture Foundation");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "A reusable frontend architecture foundation for production web applications.",
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

test("marketing header navigation preserves responsive interaction states", async ({ page }) => {
  for (const { theme, locale } of STATES) {
    await page.setViewportSize({ width: 1024, height: 900 });
    await gotoMarketingState(page, theme, locale);

    const colors = await getNavigationSemanticColors(page);
    const banner = page.getByRole("banner");
    const desktopNavigation = banner.getByRole("navigation", { name: COPY[locale].navLabel });
    const desktopLinks = desktopNavigation.getByRole("link");
    await expect(desktopLinks).toHaveText(COPY[locale].navigation.map(({ label }) => label));

    for (const [index, { href }] of COPY[locale].navigation.entries()) {
      const link = desktopLinks.nth(index);
      await expect(link, `desktop idle [${theme}/${locale}] ${href}`).toHaveCSS(
        "color",
        colors.mutedForeground,
      );
      await expect(link).toHaveCSS("font-weight", "600");
      await expect(link).not.toHaveAttribute("aria-current");
    }

    const first = desktopLinks.first();
    await first.hover();
    await expect(first, `desktop hover [${theme}/${locale}]`).toHaveCSS("color", colors.foreground);

    const brand = banner.getByRole("link", { name: COPY[locale].brand, exact: true });
    await brand.focus();
    await page.keyboard.press("Tab");
    await expect(first, `desktop keyboard order [${theme}/${locale}]`).toBeFocused();
    expect(await first.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
    await expect(first, `desktop focus color [${theme}/${locale}]`).toHaveCSS(
      "color",
      colors.foreground,
    );
    expect(
      await first.evaluate((element) => getComputedStyle(element).boxShadow),
      `desktop focus ring [${theme}/${locale}]`,
    ).not.toBe("none");

    const second = desktopLinks.nth(1);
    const bounds = await second.boundingBox();
    if (!bounds) throw new Error("The pressed-state check requires a visible navigation link.");
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(1, 899);
    expect(await second.evaluate((element) => element.matches(":active"))).toBe(true);
    expect(await second.evaluate((element) => element.matches(":hover"))).toBe(false);
    await expect(second, `desktop pressed [${theme}/${locale}]`).toHaveCSS(
      "color",
      colors.foreground,
    );
    await page.mouse.up();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: COPY[locale].openNav }).click();
    const drawer = page.getByRole("dialog", { name: COPY[locale].navLabel });
    const drawerLinks = drawer.getByRole("link");
    await expect(drawerLinks).toHaveText(COPY[locale].navigation.map(({ label }) => label));

    for (const [index, { href }] of COPY[locale].navigation.entries()) {
      const link = drawerLinks.nth(index);
      await expect(link, `drawer idle [${theme}/${locale}] ${href}`).toHaveCSS(
        "color",
        colors.foreground,
      );
      await expect(link).not.toHaveAttribute("aria-current");
    }

    const drawerFirst = drawerLinks.first();
    await drawerFirst.hover();
    await expect(drawerFirst, `drawer hover [${theme}/${locale}]`).toHaveCSS(
      "color",
      colors.mutedForeground,
    );
  }
});

test("marketing shell keeps a shared, direction-safe horizontal rhythm", async ({ page }) => {
  for (const { theme, locale } of STATES) {
    await gotoMarketingState(page, theme, locale);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(page.getByRole("banner")).not.toHaveAttribute("data-scrolled");

    for (const { width, containerPadding, desktop } of MARKETING_RHYTHM_WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      const rhythm = await getMarketingHorizontalRhythm(page);

      expect(rhythm.direction, `${theme}/${locale} at ${width}px`).toBe(COPY[locale].direction);
      expect(rhythm.pageOverflow, `${theme}/${locale} page at ${width}px`).toBeLessThanOrEqual(1);
      expect(rhythm.headerOverflow, `${theme}/${locale} header at ${width}px`).toBeLessThanOrEqual(
        1,
      );

      const expectedContainerWidth = Math.min(width, 1280);
      for (const [index, container] of rhythm.containers.entries()) {
        expect(container.width, `container ${index} width — ${theme}/${locale} at ${width}px`).toBe(
          expectedContainerWidth,
        );
        expect(
          container.paddingInlineStart,
          `container ${index} start padding — ${theme}/${locale} at ${width}px`,
        ).toBe(containerPadding);
        expect(
          container.paddingInlineEnd,
          `container ${index} end padding — ${theme}/${locale} at ${width}px`,
        ).toBe(containerPadding);
        expect(
          Math.abs(container.inlineStart - rhythm.headerRow.inlineStart),
          `container ${index} start alignment — ${theme}/${locale} at ${width}px`,
        ).toBeLessThanOrEqual(1);
        expect(
          Math.abs(container.inlineEnd - rhythm.headerRow.inlineEnd),
          `container ${index} end alignment — ${theme}/${locale} at ${width}px`,
        ).toBeLessThanOrEqual(1);
      }

      expect(
        Math.abs(rhythm.controlsInlineEnd - rhythm.headerRow.inlineEnd),
        `header controls alignment — ${theme}/${locale} at ${width}px`,
      ).toBeLessThanOrEqual(1);

      if (desktop) {
        expect(rhythm.navigationDisplay, `${theme}/${locale} nav at ${width}px`).toBe("flex");
        expect(rhythm.brandMarginInlineEnd, `${theme}/${locale} brand at ${width}px`).toBe(24);
        expect(rhythm.brandNavigationGap, `${theme}/${locale} brand/nav at ${width}px`).toBe(40);
        for (const [index, gap] of rhythm.navigationItemGaps.entries()) {
          expect(gap, `${theme}/${locale} nav item gap ${index} at ${width}px`).toBeCloseTo(4, 1);
        }
      } else {
        expect(rhythm.navigationDisplay, `${theme}/${locale} nav at ${width}px`).toBe("none");
        expect(rhythm.brandMarginInlineEnd, `${theme}/${locale} brand at ${width}px`).toBe(16);
      }
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(() => window.scrollTo({ top: 800, behavior: "instant" }));
    await expect(page.getByRole("banner")).toHaveAttribute("data-scrolled", "");
    const scrolled = await getMarketingHorizontalRhythm(page);
    expect(scrolled.headerScrolled, `${theme}/${locale} scrolled header`).toBe(true);
    expect(scrolled.headerRow.width, `${theme}/${locale} scrolled header width`).toBe(1280);
    expect(scrolled.headerRow.paddingInlineStart).toBe(24);
    expect(scrolled.headerRow.paddingInlineEnd).toBe(24);
    expect(scrolled.brandNavigationGap).toBe(40);
    expect(scrolled.pageOverflow, `${theme}/${locale} scrolled page`).toBeLessThanOrEqual(1);
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
    COPY.en.faqHeading,
    COPY.en.closingHeading,
  ]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }

  await page.getByRole("button", { name: "Switch to Arabic" }).click();
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
    COPY.ar.faqHeading,
    COPY.ar.closingHeading,
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

test("marketing FAQ delegates its single-open disclosure contract to Base UI", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await gotoMarketingState(page, "light", "en");

  const faq = page.locator("section#faq");
  await expect(faq.getByRole("heading", { level: 2, name: COPY.en.faqHeading })).toHaveCount(1);
  const englishTriggers = faq.getByRole("button");
  await expect(englishTriggers).toHaveCount(6);
  await expect(englishTriggers).toHaveText(COPY.en.faqItems.map(({ question }) => question));
  for (const trigger of await englishTriggers.all()) {
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  }
  await expect(faq.getByRole("region")).toHaveCount(0);

  const relationshipIds = new Set<string>();
  for (const [index, item] of COPY.en.faqItems.entries()) {
    const trigger = englishTriggers.nth(index);
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    if (index > 0) {
      await expect(englishTriggers.nth(index - 1)).toHaveAttribute("aria-expanded", "false");
    }
    await expect(faq.getByText(item.answer, { exact: true })).toBeVisible();

    const triggerId = await trigger.getAttribute("id");
    const panelId = await trigger.getAttribute("aria-controls");
    expect(triggerId).toBeTruthy();
    expect(panelId).toBeTruthy();
    relationshipIds.add(triggerId ?? "");
    relationshipIds.add(panelId ?? "");
    const panel = page.locator(`#${panelId ?? "missing-faq-panel"}`);
    await expect(panel).toHaveAttribute("role", "region");
    await expect(panel).toHaveAttribute("aria-labelledby", triggerId ?? "missing-faq-trigger");
  }
  expect(relationshipIds.size).toBe(12);

  const firstTrigger = englishTriggers.first();
  await firstTrigger.focus();
  await page.keyboard.press("Enter");
  await expect(firstTrigger).toHaveAttribute("aria-expanded", "true");
  await expect(firstTrigger).toBeFocused();
  await page.keyboard.press("Space");
  await expect(firstTrigger).toHaveAttribute("aria-expanded", "false");
  await expect(firstTrigger).toBeFocused();

  const englishQuestionBox = await firstTrigger
    .locator('[data-slot="marketing-faq-question"]')
    .boundingBox();
  const englishTriggerBox = await firstTrigger.boundingBox();
  const englishIndicatorBox = await firstTrigger
    .locator('[data-slot="marketing-faq-indicator"]')
    .boundingBox();
  expect(englishQuestionBox).not.toBeNull();
  expect(englishTriggerBox).not.toBeNull();
  expect(englishIndicatorBox).not.toBeNull();
  expect(
    Math.abs(
      (englishQuestionBox?.x ?? 0) +
        (englishQuestionBox?.width ?? 0) / 2 -
        ((englishTriggerBox?.x ?? 0) + (englishTriggerBox?.width ?? 0) / 2),
    ),
  ).toBeLessThanOrEqual(1);
  expect(englishIndicatorBox?.x ?? 0).toBeGreaterThan(englishQuestionBox?.x ?? 0);

  await page.getByRole("button", { name: "Switch to Arabic" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(faq.getByRole("heading", { level: 2, name: COPY.ar.faqHeading })).toBeVisible();
  const arabicTriggers = faq.getByRole("button");
  await expect(arabicTriggers).toHaveText(COPY.ar.faqItems.map(({ question }) => question));

  const isolatedTechnicalTerms = new Set<string>();
  for (const [index, item] of COPY.ar.faqItems.entries()) {
    const trigger = arabicTriggers.nth(index);
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(faq.getByText(item.answer, { exact: true })).toBeVisible();
    for (const term of await faq.locator('bdi[dir="ltr"]').allTextContents()) {
      isolatedTechnicalTerms.add(term);
    }
  }
  expect(Array.from(isolatedTechnicalTerms).sort()).toEqual([...FAQ_TECHNICAL_TERMS].sort());

  const arabicQuestionBox = await arabicTriggers
    .first()
    .locator('[data-slot="marketing-faq-question"]')
    .boundingBox();
  const arabicTriggerBox = await arabicTriggers.first().boundingBox();
  const arabicIndicatorBox = await arabicTriggers
    .first()
    .locator('[data-slot="marketing-faq-indicator"]')
    .boundingBox();
  expect(arabicQuestionBox).not.toBeNull();
  expect(arabicTriggerBox).not.toBeNull();
  expect(arabicIndicatorBox).not.toBeNull();
  expect(
    Math.abs(
      (arabicQuestionBox?.x ?? 0) +
        (arabicQuestionBox?.width ?? 0) / 2 -
        ((arabicTriggerBox?.x ?? 0) + (arabicTriggerBox?.width ?? 0) / 2),
    ),
  ).toBeLessThanOrEqual(1);
  expect(arabicIndicatorBox?.x ?? 0).toBeLessThan(arabicQuestionBox?.x ?? 0);

  const duplicateIds = await page.locator("[id]").evaluateAll((elements) => {
    const ids = elements.map(({ id }) => id);
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  });
  expect(duplicateIds).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("post-hero marketing content uses its centered, text-first composition", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  for (const locale of ["en", "ar"] as const) {
    await gotoMarketingState(page, "light", locale);

    const composition = await page.evaluate(() => {
      const center = (element: Element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.x + bounds.width / 2;
      };

      const introductions = Array.from(
        document.querySelectorAll<HTMLElement>('[data-slot="marketing-section-intro"]'),
      ).map((intro) => ({
        centerDelta: Math.abs(center(intro) - center(intro.parentElement!)),
        textAlign: getComputedStyle(intro).textAlign,
      }));

      const cards = Array.from(
        document.querySelectorAll<HTMLElement>('[data-slot="marketing-story-card"]'),
      ).map((card) => {
        const icon = card.querySelector<HTMLElement>('[data-slot="marketing-story-icon"]')!;
        const style = getComputedStyle(card);
        const cardBounds = card.getBoundingClientRect();
        const inlineStart =
          style.direction === "rtl"
            ? cardBounds.right - Number.parseFloat(style.paddingRight)
            : cardBounds.left + Number.parseFloat(style.paddingLeft);
        const content = [
          icon,
          card.querySelector<HTMLElement>('[data-slot="marketing-story-technologies"]')!,
          card.querySelector<HTMLElement>('[data-slot="marketing-story-heading"]')!,
          card.querySelector<HTMLElement>('[data-slot="marketing-story-description"]')!,
          card.querySelector<HTMLElement>('[data-slot="marketing-story-evidence"]')!,
        ];
        const heading = card.querySelector<HTMLElement>('[data-slot="marketing-story-heading"]')!;
        const headingText = document.createRange();
        headingText.selectNodeContents(heading);
        const headingTextBounds = headingText.getBoundingClientRect();
        const headingTextInlineStart =
          style.direction === "rtl" ? headingTextBounds.right : headingTextBounds.left;
        return {
          direction: style.direction,
          inlineStartDeltas: content.map((element) => {
            const bounds = element.getBoundingClientRect();
            const elementInlineStart = style.direction === "rtl" ? bounds.right : bounds.left;
            return Math.abs(elementInlineStart - inlineStart);
          }),
          headingTextInlineStartDelta: Math.abs(headingTextInlineStart - inlineStart),
          textAlign: style.textAlign,
        };
      });

      const grids = Array.from(
        document.querySelectorAll<HTMLElement>('[data-slot="marketing-story-grid"]'),
      ).map((grid) => ({
        centerDelta: Math.abs(center(grid) - center(grid.closest('[data-slot="container"]')!)),
      }));

      const features = Array.from(
        document.querySelectorAll<HTMLElement>('[data-slot="marketing-centered-feature"]'),
      ).map((feature) => {
        const copy = feature.querySelector<HTMLElement>('[data-slot="marketing-feature-copy"]')!;
        const specimen = feature.querySelector<HTMLElement>(
          '[data-slot="marketing-feature-specimen"]',
        )!;
        return {
          copyBeforeSpecimen:
            copy.compareDocumentPosition(specimen) === Node.DOCUMENT_POSITION_FOLLOWING,
          copyAboveSpecimen:
            copy.getBoundingClientRect().bottom < specimen.getBoundingClientRect().top,
          specimenCenterDelta: Math.abs(center(specimen) - center(feature)),
        };
      });

      const centeredSupportingContent = Array.from(
        document.querySelectorAll<HTMLElement>(
          "#architecture figure li, #bilingual-design figure li, #quality aside, #quality figure figcaption, #quality figure li",
        ),
      ).map((element) => getComputedStyle(element).textAlign);

      return { introductions, cards, grids, features, centeredSupportingContent };
    });

    expect(composition.introductions).toHaveLength(6);
    for (const intro of composition.introductions) {
      expect(intro.centerDelta).toBeLessThanOrEqual(1);
      expect(intro.textAlign).toBe("center");
    }

    expect(composition.cards).toHaveLength(12);
    for (const card of composition.cards) {
      expect(card.direction).toBe(COPY[locale].direction);
      expect(card.textAlign).toBe("start");
      expect(card.headingTextInlineStartDelta).toBeLessThanOrEqual(1);
      for (const delta of card.inlineStartDeltas) {
        expect(delta).toBeLessThanOrEqual(1);
      }
    }

    expect(composition.grids).toHaveLength(2);
    for (const grid of composition.grids) {
      expect(grid.centerDelta).toBeLessThanOrEqual(1);
    }

    expect(composition.features).toHaveLength(2);
    for (const feature of composition.features) {
      expect(feature.copyBeforeSpecimen).toBe(true);
      expect(feature.copyAboveSpecimen).toBe(true);
      expect(feature.specimenCenterDelta).toBeLessThanOrEqual(1);
    }

    expect(composition.centeredSupportingContent.length).toBeGreaterThan(0);
    expect(composition.centeredSupportingContent.every((alignment) => alignment === "center")).toBe(
      true,
    );
  }
});

test("marketing FAQ open states remain accessible, reduced, and overflow-free", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const { theme, locale } of STATES) {
    await gotoMarketingState(page, theme, locale);
    const item = COPY[locale].faqItems[5];
    await page.getByRole("button", { name: item.question }).click();
    await expect(page.getByText(item.answer, { exact: true })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include("#faq")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const readable = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    }));
    expect(readable, `open FAQ [${theme} ${locale}]`).toEqual([]);
  }

  for (const locale of ["en", "ar"] as const) {
    const item = COPY[locale].faqItems[0];
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await gotoMarketingState(page, "light", locale);
      await page.getByRole("button", { name: item.question }).click();
      await expect(page.getByText(item.answer, { exact: true })).toBeVisible();

      const faq = page.locator("section#faq");
      const panel = faq.locator('[data-slot="marketing-faq-panel"]');
      const indicator = faq
        .getByRole("button", { name: item.question })
        .locator('[data-slot="marketing-faq-indicator-icon"]');
      await expect(panel).toHaveCSS("transition-property", "none");
      await expect(indicator).toHaveCSS("transition-property", "none");

      const measured = await page.evaluate(() => {
        const root = document.documentElement;
        const overflowingElements = Array.from(document.querySelectorAll("body *"))
          .filter((element) => {
            const bounds = element.getBoundingClientRect();
            return bounds.left < -1 || bounds.right > root.clientWidth + 1;
          })
          .map((element) => ({
            tag: element.tagName,
            slot: element.getAttribute("data-slot"),
            text: element.textContent,
            bounds: element.getBoundingClientRect().toJSON(),
          }));
        return {
          pageOverflow: root.scrollWidth - root.clientWidth,
          overflowingElements,
        };
      });
      expect(
        measured.pageOverflow,
        `open FAQ [${locale}] at ${width}px\n${JSON.stringify(measured.overflowingElements, null, 2)}`,
      ).toBeLessThanOrEqual(1);
    }
  }

  expect(consoleErrors).toEqual([]);
});

test("informational story cards coordinate restrained hover feedback and reduced motion", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  const cardSelectors = [
    "#capability-story [data-slot='marketing-story-card']",
    "#quality [data-slot='marketing-story-card']",
  ] as const;
  let lightSemantic: Awaited<ReturnType<typeof getCardSemanticColors>> | undefined;

  for (const theme of ["light", "dark"] as const) {
    await gotoMarketingState(page, theme, "en");
    const semantic = await getCardSemanticColors(page);
    if (theme === "light") lightSemantic = semantic;
    expect(
      theme === "light" ? semantic.foregroundLuminance < 0.5 : semantic.foregroundLuminance > 0.5,
    ).toBe(true);

    for (const selector of cardSelectors) {
      const card = page.locator(selector).first();
      const iconWrapper = card.locator('[data-slot="marketing-story-icon"]');
      const icon = card.locator('[data-slot="marketing-story-icon-glyph"]');
      const before = await card.evaluate((element) => ({
        text: element.textContent,
        backgroundColor: getComputedStyle(element).backgroundColor,
      }));
      const geometry = await iconWrapper.evaluate((element) => {
        const wrapperBounds = element.getBoundingClientRect();
        const glyph = element.querySelector<HTMLElement>(
          '[data-slot="marketing-story-icon-glyph"]',
        );
        const technologies = element.nextElementSibling;
        if (!glyph || !(technologies instanceof HTMLElement)) {
          throw new Error("A story icon requires its glyph and technologies line.");
        }
        const glyphBounds = glyph.getBoundingClientRect();
        const technologiesBounds = technologies.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          width: wrapperBounds.width,
          height: wrapperBounds.height,
          borderWidth: style.borderWidth,
          glyphWidth: glyphBounds.width,
          glyphHeight: glyphBounds.height,
          glyphCenterDeltaX: Math.abs(
            glyphBounds.x + glyphBounds.width / 2 - (wrapperBounds.x + wrapperBounds.width / 2),
          ),
          glyphCenterDeltaY: Math.abs(
            glyphBounds.y + glyphBounds.height / 2 - (wrapperBounds.y + wrapperBounds.height / 2),
          ),
          gapToTechnologies: technologiesBounds.top - wrapperBounds.bottom,
        };
      });

      await expect(icon).toHaveCSS("color", semantic.foreground);
      await expect(iconWrapper).toHaveCSS("background-color", semantic.transparent);
      await expect(iconWrapper).toHaveCSS("border-color", semantic.transparent);
      expect(geometry).toEqual({
        width: 40,
        height: 40,
        borderWidth: "1px",
        glyphWidth: 20,
        glyphHeight: 20,
        glyphCenterDeltaX: 0,
        glyphCenterDeltaY: 0,
        gapToTechnologies: 20,
      });
      await expect(card).not.toHaveAttribute("tabindex");
      await expect(card).not.toHaveAttribute("role");
      await expect(card).toHaveCSS("cursor", "auto");
      await expect(card).toHaveCSS("translate", "none");

      await card.hover();
      await expect(card).toHaveCSS("translate", "0px -2px");
      await expect(icon).toHaveCSS("translate", "0px -1px");
      await expect(icon).toHaveCSS("color", semantic.primary);
      await expect(iconWrapper).toHaveCSS("color", semantic.primary);
      await expect(iconWrapper).toHaveCSS("background-color", semantic.primaryTint);
      await expect(iconWrapper).toHaveCSS("border-color", semantic.primary);
      expect(await card.evaluate((element) => element.textContent)).toBe(before.text);
      expect(await card.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(
        before.backgroundColor,
      );
    }
  }

  const architectureSpecimen = page.getByRole("figure", { name: COPY.en.architectureDiagram });
  await architectureSpecimen.hover();
  await expect(architectureSpecimen).toHaveCSS("translate", "none");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoMarketingState(page, "light", "en");
  if (!lightSemantic) throw new Error("The reduced-motion check requires light-theme semantics.");
  const reducedCard = page.locator(cardSelectors[0]).nth(1);
  const reducedIconWrapper = reducedCard.locator('[data-slot="marketing-story-icon"]');
  const reducedIcon = reducedCard.locator('[data-slot="marketing-story-icon-glyph"]');
  await reducedCard.hover();
  await expect(reducedCard).toHaveCSS("translate", "none");
  await expect(reducedIcon).toHaveCSS("translate", "none");
  await expect(reducedIcon).toHaveCSS("color", lightSemantic.primary);
  await expect(reducedIconWrapper).toHaveCSS("color", lightSemantic.primary);
  await expect(reducedIconWrapper).toHaveCSS("background-color", lightSemantic.primaryTint);
  await expect(reducedIconWrapper).toHaveCSS("border-color", lightSemantic.primary);
  expect(consoleErrors).toEqual([]);
});

test("informational story cards keep their static presentation in touch contexts", async ({
  baseURL,
  browser,
}) => {
  if (!baseURL) {
    throw new Error("The marketing touch-context test requires a configured Playwright baseURL.");
  }

  const context = await browser.newContext({
    baseURL,
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();

  try {
    for (const theme of ["light", "dark"] as const) {
      for (const locale of ["en", "ar"] as const) {
        await gotoMarketingState(page, theme, locale);
        const semantic = await getCardSemanticColors(page);

        expect(
          await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches),
        ).toBe(false);

        const card = page.locator("#capability-story [data-slot='marketing-story-card']").first();
        const iconWrapper = card.locator('[data-slot="marketing-story-icon"]');
        const icon = card.locator('[data-slot="marketing-story-icon-glyph"]');
        const before = await card.evaluate((element) => ({
          text: element.textContent,
          backgroundColor: getComputedStyle(element).backgroundColor,
        }));
        const beforeIcon = await iconWrapper.evaluate((element) => ({
          backgroundColor: getComputedStyle(element).backgroundColor,
          borderColor: getComputedStyle(element).borderColor,
          color: getComputedStyle(element).color,
        }));
        expect(beforeIcon).toEqual({
          backgroundColor: semantic.transparent,
          borderColor: semantic.transparent,
          color: semantic.foreground,
        });

        await card.hover();
        await expect(card).toHaveCSS("translate", "none");
        await expect(icon).toHaveCSS("translate", "none");
        expect(
          await card.evaluate((element) => ({
            text: element.textContent,
            backgroundColor: getComputedStyle(element).backgroundColor,
          })),
        ).toEqual(before);
        expect(
          await iconWrapper.evaluate((element) => ({
            backgroundColor: getComputedStyle(element).backgroundColor,
            borderColor: getComputedStyle(element).borderColor,
            color: getComputedStyle(element).color,
          })),
        ).toEqual(beforeIcon);

        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          ),
        ).toBeLessThanOrEqual(1);
      }
    }
  } finally {
    await context.close();
  }
});

test("closing CTA sits between the FAQ and the footer with resolvable bilingual actions", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.setViewportSize({ width: 1440, height: 1000 });

  for (const locale of ["en", "ar"] as const) {
    await gotoMarketingState(page, "light", locale);
    const copy = COPY[locale];

    const closing = page.locator("section#next-step");
    await expect(closing).toHaveCount(1);
    await expect(closing).toHaveAttribute("aria-labelledby", "next-step-heading");
    await expect(
      closing.getByRole("heading", { level: 2, name: copy.closingHeading }),
    ).toBeVisible();
    await expect(closing.getByText(copy.closingEyebrow, { exact: true })).toBeVisible();
    await expect(closing.getByText(copy.closingDescription, { exact: true })).toBeVisible();
    await expect(closing.locator("h1, h3, h4")).toHaveCount(0);

    const placement = await page.evaluate(() => {
      const faq = document.querySelector("section#faq");
      const step = document.querySelector("section#next-step");
      const footer = document.querySelector('[data-slot="site-shell-footer"]');
      const main = document.querySelector("main");
      if (!faq || !step || !footer || !main) {
        throw new Error("The closing CTA placement check requires the FAQ, section, footer, main.");
      }
      return {
        afterFaqInDom: (faq.compareDocumentPosition(step) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
        beforeFooterInDom:
          (step.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
        insideMain: main.contains(step),
        insideFooter: footer.contains(step),
        belowFaq: step.getBoundingClientRect().top >= faq.getBoundingClientRect().bottom - 1,
        aboveFooter: footer.getBoundingClientRect().top >= step.getBoundingClientRect().bottom - 1,
      };
    });
    expect(placement, `closing placement [${locale}]`).toEqual({
      afterFaqInDom: true,
      beforeFooterInDom: true,
      insideMain: true,
      insideFooter: false,
      belowFaq: true,
      aboveFooter: true,
    });

    const actions = closing.locator('[data-slot="marketing-closing-actions"]');
    await expect(actions.getByRole("link")).toHaveCount(2);
    await expect(closing.getByRole("button")).toHaveCount(0);

    const primary = closing.getByRole("link", { name: copy.closingPrimary, exact: true });
    const secondary = closing.getByRole("link", { name: copy.closingSecondary, exact: true });
    await expect(primary).toHaveAttribute("href", "#architecture");
    await expect(secondary).toHaveAttribute("href", "#quality");

    // Both destinations are real, unique sections of this same page.
    for (const target of ["#architecture", "#quality"]) {
      await expect(page.locator(`section${target}`)).toHaveCount(1);
    }

    // Heading order stays valid with the section appended.
    const headingLevels = await page
      .locator("h1, h2, h3")
      .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
    expect(headingLevels[0]).toBe(1);
    expect(headingLevels.filter((level) => level === 1)).toHaveLength(1);
    expect(headingLevels.at(-1)).toBe(2);
    for (let index = 1; index < headingLevels.length; index += 1) {
      expect(headingLevels[index] ?? 0).toBeLessThanOrEqual((headingLevels[index - 1] ?? 0) + 1);
    }

    const duplicateIds = await page.locator("[id]").evaluateAll((elements) => {
      const ids = elements.map(({ id }) => id);
      return ids.filter((id, index) => ids.indexOf(id) !== index);
    });
    expect(duplicateIds).toEqual([]);
  }

  expect(consoleErrors).toEqual([]);
});

test("closing CTA actions are keyboard reachable, visibly focused, and navigate", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  for (const locale of ["en", "ar"] as const) {
    await gotoMarketingState(page, "light", locale);
    const copy = COPY[locale];

    const closing = page.locator("section#next-step");
    const primary = closing.getByRole("link", { name: copy.closingPrimary, exact: true });
    const secondary = closing.getByRole("link", { name: copy.closingSecondary, exact: true });

    // Tab in from the last FAQ trigger — the closest preceding focusable — so
    // focus arrives by keyboard and :focus-visible genuinely applies.
    await page.locator('section#faq [data-slot="marketing-faq-trigger"]').last().focus();
    await page.keyboard.press("Tab");
    await expect(primary).toBeFocused();
    expect(await primary.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe(
      "none",
    );

    await page.keyboard.press("Tab");
    await expect(secondary).toBeFocused();
    expect(await secondary.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe(
      "none",
    );

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#quality$/);
    await expect(page.locator("section#quality")).toBeVisible();

    await page.locator('section#faq [data-slot="marketing-faq-trigger"]').last().focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#architecture$/);
    await expect(page.locator("section#architecture")).toBeVisible();
  }
});

test("closing CTA action group follows direction and never overflows", async ({ page }) => {
  for (const { theme, locale } of STATES) {
    await gotoMarketingState(page, theme, locale);

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });

      const measured = await page.evaluate(() => {
        const root = document.documentElement;
        const group = document.querySelector('[data-slot="marketing-closing-actions"]');
        const section = document.querySelector("section#next-step");
        if (!group || !section) {
          throw new Error("The closing CTA geometry check requires its section and action group.");
        }
        const style = getComputedStyle(group);
        const links = Array.from(group.querySelectorAll("a")).map((link) => {
          const bounds = link.getBoundingClientRect();
          return {
            top: bounds.top,
            left: bounds.left,
            right: bounds.right,
            height: Math.round(bounds.height),
          };
        });
        const [first, second] = links;
        if (!first || !second) {
          throw new Error("The closing CTA geometry check requires both actions.");
        }
        return {
          direction: getComputedStyle(section).direction,
          pageOverflow: root.scrollWidth - root.clientWidth,
          groupOverflow: group.scrollWidth - group.clientWidth,
          flexWrap: style.flexWrap,
          justifyContent: style.justifyContent,
          sameRow: Math.abs(first.top - second.top) <= 1,
          heights: links.map(({ height }) => height),
          insideViewport: links.every(
            ({ left, right }) => left >= -1 && right <= root.clientWidth + 1,
          ),
          first,
          second,
        };
      });

      const at = `${theme} ${locale} at ${width}px`;
      expect(measured.pageOverflow, at).toBeLessThanOrEqual(1);
      expect(measured.groupOverflow, at).toBeLessThanOrEqual(1);
      expect(measured.insideViewport, at).toBe(true);
      expect(measured.flexWrap, at).toBe("wrap");
      expect(measured.justifyContent, at).toBe("center");
      expect(measured.direction, at).toBe(COPY[locale].direction);
      // One shared target height for both treatments.
      expect(measured.heights, at).toEqual([48, 48]);

      if (measured.sameRow) {
        // The primary is first in DOM order, so direction alone decides which
        // physical edge it takes — no physical utility is involved.
        if (measured.direction === "rtl") {
          expect(measured.first.right, at).toBeGreaterThan(measured.second.right);
        } else {
          expect(measured.first.left, at).toBeLessThan(measured.second.left);
        }
      } else {
        expect(measured.first.top, at).toBeLessThan(measured.second.top);
      }
    }
  }
});

test("closing CTA is axe-clean in each theme and locale", async ({ page }) => {
  for (const { theme, locale } of STATES) {
    await gotoMarketingState(page, theme, locale);

    const results = await new AxeBuilder({ page })
      .include("#next-step")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const readable = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    }));

    expect(readable, `closing CTA [${theme} ${locale}]`).toEqual([]);
  }
});

test("marketing footer closes the page with six real, bilingual page destinations", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.setViewportSize({ width: 1440, height: 1000 });

  for (const locale of ["en", "ar"] as const) {
    await gotoMarketingState(page, "light", locale);
    const copy = COPY[locale];

    const footer = page.getByRole("contentinfo");
    await expect(footer).toHaveCount(1);

    const brand = footer.getByRole("link", { name: copy.brand, exact: true });
    await expect(brand).toHaveAttribute("href", "/");
    await expect(footer.getByText(copy.footerContext, { exact: true })).toBeVisible();
    await expect(footer.getByText(copy.footerStatus, { exact: true })).toBeVisible();

    // A footer nav is a labelled region, never a heading level of its own.
    const footerNavigation = footer.getByRole("navigation", { name: copy.footerNavLabel });
    await expect(footerNavigation).toHaveCount(1);
    await expect(footer.locator("h1, h2, h3, h4, h5, h6")).toHaveCount(0);

    const footerLinks = footerNavigation.getByRole("link");
    await expect(footerLinks).toHaveText(copy.footerNavigation.map(({ label }) => label));
    // The brand lockup plus these six destinations — nothing else is promised.
    await expect(footer.getByRole("link")).toHaveCount(copy.footerNavigation.length + 1);
    await expect(footer.getByRole("button")).toHaveCount(0);

    for (const [index, { href }] of copy.footerNavigation.entries()) {
      await expect(footerLinks.nth(index)).toHaveAttribute("href", href);
      // Every destination resolves to exactly one section of this same page.
      await expect(page.locator(`section${href}`)).toHaveCount(1);
    }

    const destinations = await footer.getByRole("link").evaluateAll((links) =>
      links.map((link) => ({
        href: link.getAttribute("href"),
        target: link.getAttribute("target"),
        rel: link.getAttribute("rel"),
        unavailable: link.hasAttribute("data-unavailable"),
      })),
    );
    for (const destination of destinations) {
      expect(destination.href, `footer destination [${locale}]`).toMatch(/^(?:\/|#[a-z-]+)$/);
      expect(destination.target).toBeNull();
      expect(destination.rel).toBeNull();
      expect(destination.unavailable).toBe(false);
    }
    // The footer indexes the named capability section, not the hero's
    // unlabelled strip, and never links back to the closing CTA above it.
    const footerHrefs = destinations.map(({ href }) => href);
    expect(footerHrefs).not.toContain("#capabilities");
    expect(footerHrefs).not.toContain("#next-step");

    // The closing CTA still hands off to the footer, in that order.
    const boundary = await page.evaluate(() => {
      const step = document.querySelector("section#next-step");
      const region = document.querySelector('[data-slot="site-shell-footer"]');
      if (!step || !region) {
        throw new Error("The footer boundary check requires the closing CTA and the footer.");
      }
      return {
        ctaBeforeFooterInDom:
          (step.compareDocumentPosition(region) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
        ctaAboveFooter:
          region.getBoundingClientRect().top >= step.getBoundingClientRect().bottom - 1,
        footerHoldsCta: region.contains(step),
      };
    });
    expect(boundary, `footer boundary [${locale}]`).toEqual({
      ctaBeforeFooterInDom: true,
      ctaAboveFooter: true,
      footerHoldsCta: false,
    });

    const headingLevels = await page
      .locator("h1, h2, h3")
      .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
    expect(headingLevels.filter((level) => level === 1)).toHaveLength(1);
    for (let index = 1; index < headingLevels.length; index += 1) {
      expect(headingLevels[index] ?? 0).toBeLessThanOrEqual((headingLevels[index - 1] ?? 0) + 1);
    }

    const duplicateIds = await page.locator("[id]").evaluateAll((elements) => {
      const ids = elements.map(({ id }) => id);
      return ids.filter((id, index) => ids.indexOf(id) !== index);
    });
    expect(duplicateIds).toEqual([]);
  }

  expect(consoleErrors).toEqual([]);
});

test("marketing footer destinations are keyboard reachable, visibly focused, and navigate", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  for (const locale of ["en", "ar"] as const) {
    await gotoMarketingState(page, "light", locale);
    const copy = COPY[locale];

    const footer = page.getByRole("contentinfo");
    const footerLinks = footer
      .getByRole("navigation", { name: copy.footerNavLabel })
      .getByRole("link");

    // Tab in from the brand lockup — the footer's first focusable — so focus
    // arrives by keyboard and :focus-visible genuinely applies.
    await footer.getByRole("link", { name: copy.brand, exact: true }).focus();
    for (const [index] of copy.footerNavigation.entries()) {
      await page.keyboard.press("Tab");
      const link = footerLinks.nth(index);
      await expect(link, `footer tab order [${locale}] ${index}`).toBeFocused();
      expect(
        await link.evaluate((element) => getComputedStyle(element).boxShadow),
        `footer focus ring [${locale}] ${index}`,
      ).not.toBe("none");
    }

    // The last destination activates by keyboard and resolves its section.
    const faq = copy.footerNavigation[5];
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${faq.href}$`));
    await expect(page.locator(`section${faq.href}`)).toBeVisible();
  }
});

test("marketing footer follows direction and never overflows at checkpoint widths", async ({
  page,
}) => {
  for (const { theme, locale } of STATES) {
    await gotoMarketingState(page, theme, locale);

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });

      const measured = await page.evaluate(() => {
        const root = document.documentElement;
        const region = document.querySelector<HTMLElement>('[data-slot="site-shell-footer"]');
        const identity = document.querySelector<HTMLElement>(
          '[data-slot="marketing-footer-identity"]',
        );
        const navigation = document.querySelector<HTMLElement>(
          '[data-slot="marketing-footer-nav"]',
        );
        if (!region || !identity || !navigation) {
          throw new Error("The footer geometry check requires the footer, identity, and nav.");
        }

        const direction = getComputedStyle(region).direction;
        // Logical inline-start: the left edge in LTR, the right edge in RTL.
        // Every alignment claim below is expressed this way, so no assertion
        // depends on a physical side.
        const inlineStart = (element: Element) => {
          const bounds = element.getBoundingClientRect();
          return direction === "rtl" ? bounds.right : bounds.left;
        };
        const startOffset = (element: Element) =>
          direction === "rtl"
            ? inlineStart(region) - inlineStart(element)
            : inlineStart(element) - inlineStart(region);

        const container = region.querySelector<HTMLElement>('[data-slot="container"]')!;
        const containerStyle = getComputedStyle(container);
        const containerBounds = container.getBoundingClientRect();
        const contentStart =
          direction === "rtl"
            ? containerBounds.right - Number.parseFloat(containerStyle.paddingRight)
            : containerBounds.left + Number.parseFloat(containerStyle.paddingLeft);

        const status = region.querySelector<HTMLElement>('[data-slot="marketing-footer-status"]')!;
        const brand = identity.querySelector<HTMLElement>("a")!;
        const context = identity.querySelector<HTMLElement>("p")!;
        const links = Array.from(navigation.querySelectorAll<HTMLElement>("a"));

        return {
          direction,
          pageOverflow: root.scrollWidth - root.clientWidth,
          footerOverflow: region.scrollWidth - region.clientWidth,
          insideViewport: [brand, context, status, ...links].every((element) => {
            const bounds = element.getBoundingClientRect();
            return bounds.left >= -1 && bounds.right <= root.clientWidth + 1;
          }),
          // The brand, its context copy, and the closing status line all begin
          // at the container's own content start.
          identityStartDeltas: [brand, context, status].map((element) =>
            Math.abs(inlineStart(element) - contentStart),
          ),
          // Distinct rounded inline offsets = the number of link columns.
          linkColumnOffsets: Array.from(
            new Set(links.map((link) => Math.round(startOffset(link)))),
          ).sort((a, b) => a - b),
          linksAfterFooterStart: links.every((link) => startOffset(link) >= -1),
          navigationBesideIdentity:
            navigation.getBoundingClientRect().top < identity.getBoundingClientRect().bottom - 1,
          navigationAfterIdentityInline: startOffset(navigation) > startOffset(identity),
          statusBelow:
            status.getBoundingClientRect().top >=
            Math.max(
              identity.getBoundingClientRect().bottom,
              navigation.getBoundingClientRect().bottom,
            ) -
              1,
        };
      });

      const at = `${theme} ${locale} at ${width}px`;
      expect(measured.direction, at).toBe(COPY[locale].direction);
      expect(measured.pageOverflow, at).toBeLessThanOrEqual(1);
      expect(measured.footerOverflow, at).toBeLessThanOrEqual(1);
      expect(measured.insideViewport, at).toBe(true);
      for (const delta of measured.identityStartDeltas) {
        expect(delta, `footer logical start alignment — ${at}`).toBeLessThanOrEqual(1);
      }
      expect(measured.linksAfterFooterStart, at).toBe(true);
      expect(measured.statusBelow, at).toBe(true);

      // One comfortable column while stacked, two once there is room — the
      // same responsive grid in both directions, never a dense sitemap.
      expect(measured.linkColumnOffsets.length, `footer link columns — ${at}`).toBe(
        width < 640 ? 1 : 2,
      );

      // The two-column brand/navigation composition is a wide-width decision:
      // below it the blocks stack, and the navigation always follows the brand
      // in the inline direction rather than on a physical side.
      if (width >= 1440) {
        expect(measured.navigationBesideIdentity, at).toBe(true);
        expect(measured.navigationAfterIdentityInline, at).toBe(true);
      } else if (width < 640) {
        expect(measured.navigationBesideIdentity, at).toBe(false);
      }
    }
  }
});

test("marketing footer is axe-clean in each theme and locale", async ({ page }) => {
  for (const { theme, locale } of STATES) {
    await gotoMarketingState(page, theme, locale);

    const results = await new AxeBuilder({ page })
      .include('[data-slot="site-shell-footer"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const readable = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    }));

    expect(readable, `marketing footer [${theme} ${locale}]`).toEqual([]);
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
