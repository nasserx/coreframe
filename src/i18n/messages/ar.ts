import type { Messages } from "../messages";

/**
 * Arabic (العربية) catalogue. Declared `: Messages`, so it parity-checks
 * against the canonical English shape (src/i18n/messages/en.ts): a missing key
 * fails the typecheck and an extra one is rejected as an excess property.
 *
 * This catalogue is dynamically imported (src/i18n/catalogue.ts) — its bytes
 * are code-split out of the default First Load JS and fetched only when a
 * visitor switches to Arabic, so a Latin-default deployment never pays for it.
 */
export const ar: Messages = {
  error: {
    title: "حدث خطأ ما.",
    description: "حدث خطأ غير متوقع. حاول مرة أخرى، أو أعد تحميل الصفحة إذا استمرت المشكلة.",
    routeDescription:
      "حدث خطأ غير متوقع أثناء تحميل هذه الصفحة. حاول مرة أخرى، أو أعد التحميل إذا استمرت المشكلة.",
    globalDescription: "تعذّر عرض التطبيق. حاول مرة أخرى، أو أعد تحميل الصفحة إذا استمرت المشكلة.",
    actionLabel: "حاول مرة أخرى",
    reference: "المرجع: {digest}",
    documentTitle: "حدث خطأ ما — {app}",
  },
  notFound: {
    code: "404",
    metaTitle: "الصفحة غير موجودة",
    title: "الصفحة غير موجودة",
    description: "الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها.",
    homeAction: "الذهاب إلى الصفحة الرئيسية",
  },
  dialog: {
    close: "إغلاق",
  },
  pagination: {
    ellipsisLabel: "المزيد من الصفحات",
  },
  theme: {
    label: "المظهر",
    light: "فاتح",
    dark: "داكن",
    system: "النظام",
  },
  localeControl: {
    label: "اللغة",
  },
  shell: {
    skipLink: "تخطَّ إلى المحتوى الرئيسي",
    openNav: "فتح التنقل",
    closeNav: "إغلاق التنقل",
    unavailable: "غير متوفر بعد",
  },
  marketing: {
    brand: "أساس الواجهات",
    navLabel: "التنقل الرئيسي",
    navOverview: "نظرة عامة",
    navCapabilities: "القدرات",
    navArchitecture: "المعمارية",
    navQuality: "الجودة",
    eyebrow: "جاهز للإنتاج من الأساس",
    heroTitle: "نقطة انطلاق موثوقة لمنتجات ويب حديثة.",
    heroLead:
      "ابدأ من أساس مضبوط الأنواع ومتوافق مع معايير الوصول، يدعم المظهرين الفاتح والداكن، والإنجليزية والعربية باتجاهي LTR وRTL، مع هيكل واجهة عامة متجاوب وبوابات جودة آلية.",
    heroPrimaryCta: "استكشف الإمكانات",
    heroNoteArchitecture: "معمارية App Router",
    heroNoteThemes: "مظهران دلاليان: فاتح وداكن",
    heroNoteBilingual: "دعم متكامل للإنجليزية والعربية",
    capabilitiesHeading: "إمكانات الأساس",
    capabilityThemesTitle: "مظاهر دلالية",
    capabilityThemesDescription: "مظهران فاتح وداكن من نظام رموز دلالي واحد.",
    capabilityBilingualTitle: "لغة واتجاه",
    capabilityBilingualDescription: "تجربة متكافئة للإنجليزية LTR والعربية RTL.",
    capabilityStaticTitle: "ثابت افتراضيًا",
    capabilityStaticDescription: "تُولَّد المسارات مسبقًا دون الاعتماد على حالة وقت الطلب.",
    capabilityQualityTitle: "جودة آلية",
    capabilityQualityDescription: "فحص التنسيق والأنواع والاختبارات والوصول ومنع التجاوز الأفقي.",
    storyEyebrow: "قدرات موثَّقة",
    storyTitle: "اختيارات تقنية تحمل دليلها معها.",
    storyLead:
      "يحوّل الأساس قراراته الجوهرية إلى نتائج قابلة للصيانة. لكل قدرة مالك واضح في الشفرة، وعقد موثَّق في موضعه، وفحص يناسب نوع المخاطر التي تقلّلها.",
    storyEvidenceLabel: "التحقق في المستودع",
    storyArchitectureTitle: "معمارية بملكية واضحة",
    storyArchitectureDescription:
      "تبقى ملفات المسارات مخصّصة لربط إطار العمل، بينما تملك وحدات الميزات تركيب المنتج. وتُظهر عقود الأنواع الصريحة حدود التكامل وتحافظ على سهولة تطويرها.",
    storyArchitectureEvidence: "تفرض قواعد اتجاه الاعتماد وفحص الأنواع الصارم هذه الحدود.",
    storyArchitectureTechnologies: "Next.js · App Router · TypeScript",
    storyTokensTitle: "نظام تصميم دلالي",
    storyTokensDescription:
      "تُبنى المظاهر من أدوار لونية دلالية موحّدة، فتتغير الأسطح والحالات بحسب وظيفتها بدل تثبيت ألوان خام داخل المكوّنات.",
    storyTokensEvidence: "تختبر فحوص تكافؤ الرموز والتباين المظهرين كليهما.",
    storyTokensTechnologies: "رموز دلالية · Tailwind CSS",
    storyBilingualTitle: "ثنائية اللغة من صميم البنية",
    storyBilingualDescription:
      "يملك كل نص خطه المناسب، وتتبع المسافات والمحاذاة خصائص منطقية، فتستخدم الإنجليزية والعربية بنية المكوّنات نفسها في الاتجاهين.",
    storyBilingualEvidence:
      "تغطي فحوص الكتالوج والخطوط والاتجاه والوصول والتجاوز الأفقي هذا العقد.",
    storyBilingualTechnologies: "Inter · Tajawal · LTR · RTL",
    storyShellTitle: "هيكل عام متجاوب",
    storyShellDescription:
      "يوفّر هيكل الموقع الرأس والمحتوى الرئيسي والتذييل ورابط التخطي ودرجًا للجوال مضبوط التركيز، دون تكرار سلوك الهيكل داخل الصفحات.",
    storyShellEvidence: "تختبره فحوص لوحة المفاتيح للمكوّن وتغطية الهيكل في متصفح الإنتاج.",
    storyShellTechnologies: "SiteShell · Base UI",
    storyStaticTitle: "مسار جاهز للتوليد الثابت",
    storyStaticDescription:
      "يُولَّد المسار الرئيسي مسبقًا من تركيب مملوك للخادم، ولا يقرأ حالة اللغة وقت الطلب.",
    storyStaticEvidence: "يتحقق منه البناء الإنتاجي وفحص المسار الرئيسي عند تعطيل العرض التوضيحي.",
    storyStaticTechnologies: "ناتج ثابت · Next.js",
    storyQualityTitle: "بوابات جودة ترى السلوك الفعلي",
    storyQualityDescription:
      "تجمع دورة التحقق بين التنسيق والتحليل والأنواع واختبارات الوحدات والبناء واختبارات المتصفح، فتغطي عقود الشفرة والسلوك المعروض.",
    storyQualityEvidence: "يملك مسار التكامل المستمر ومصفوفة المسارات المكتشفة آليًا عملية التحقق.",
    storyQualityTechnologies: "Vitest · Playwright · axe",
    architectureEyebrow: "المعمارية والتسليم",
    architectureTitleBefore: "معمارية ",
    architectureTitleAfter: "، وتوليد ثابت حين يسمح المسار.",
    architectureLead:
      "تبقى ملكية المسار والبيانات الوصفية على الخادم. وتعبر المحتويات المترجمة وعناصر التحكم حدودًا واضحة إلى المكوّنات التفاعلية فقط عندما تستجيب مباشرةً للغة أو المظهر أو حالة الهيكل.",
    architectureBody:
      "لا تقرأ الصفحة حالة اللغة وقت الطلب، ولذلك يستطيع البناء توليدها مسبقًا من الكتالوج الافتراضي. يقلّل ذلك العمل غير الضروري وقت الطلب ويبقي نشر هذا المسار أبسط، من دون الادعاء بأن كل مسار مستقبلي سيكون ثابتًا.",
    verificationLabel: "دليل المستودع",
    architectureVerification:
      "يُظهر البناء العادي والبناء مع تعطيل العرض أن المسار الرئيسي ثابت، ويبقى متاحًا بنجاح عند تعطيل العرض.",
    architectureDiagramLabel: "مسار التسليم المعماري",
    architectureStepRouteKicker: "الخادم",
    architectureStepRouteTitle: "ملكية الخادم",
    architectureStepRouteDescription:
      "يربط المسار المملوك للخادم المحتوى التسويقي بالبيانات الوصفية الأساسية.",
    architectureStepStaticKicker: "ثابت",
    architectureStepStaticTitle: "ناتج مولّد مسبقًا",
    architectureStepStaticDescription:
      "ينتج البناء الصفحة الرئيسية كمحتوى ثابت من كتالوج اللغة الافتراضية.",
    architectureStepClientKicker: "العميل",
    architectureStepClientTitle: "حدود تفاعلية صريحة",
    architectureStepClientDescription:
      "تُفعَّل المحتويات المترجمة وهيكل الموقع وعناصر اللغة والمظهر للتفاعل المباشر.",
    bilingualEyebrow: "نظام تصميم ثنائي اللغة",
    bilingualTitle: "نظام دلالي واحد، وعناية متكافئة في الاتجاهين.",
    bilingualLead:
      "تبدأ الواجهة من أدوار دلالية للون والسطح والحالة، لا من قيم خام داخل كل مكوّن. ثم تطبّق الخصائص المنطقية التباعد والمحاذاة بحسب اتجاه اللغة تلقائيًا.",
    bilingualInterDescription: "يتولى النص اللاتيني في مجموعة الخطوط المشتركة.",
    bilingualTajawalDescription: "يتولى النص العربي عبر ملفات محلية مخصّصة للمحارف العربية.",
    bilingualVerification:
      "تتحقق اختبارات المتصفح من تحميل الخطين واختيارهما للنص المناسب، وتغطي مصفوفة المظهر والاتجاه الوصول والتجاوز الأفقي.",
    bilingualDiagramLabel: "مسار نظام التصميم الدلالي",
    bilingualStepTokensKicker: "الرموز",
    bilingualStepTokensTitle: "أدوار دلالية",
    bilingualStepTokensDescription: "الخلفية والسطح والنص والإجراء والحالة.",
    bilingualStepThemesKicker: "المظاهر",
    bilingualStepThemesTitle: "قيم المظهر",
    bilingualStepThemesDescription: "يُشتق الفاتح والداكن من مفردات الأدوار نفسها.",
    bilingualStepDirectionKicker: "الاتجاه",
    bilingualStepDirectionTitle: "اللغة والاتجاه",
    bilingualStepDirectionDescription: "تجربة متكافئة للإنجليزية LTR والعربية RTL.",
    qualityEyebrow: "ضوابط موثَّقة",
    qualityTitle: "إعدادات تقلّل المخاطر، لا ضمانات مطلقة.",
    qualityLead:
      "يجمع الأساس بين التحليل الساكن وفحوص المتصفح لأن أي طبقة منفردة لا تكشف كل أنواع الأعطال. تقلّل هذه الضوابط مخاطر معروفة وتجعل أدلتها قابلة للمراجعة، لكنها لا تدّعي أمانًا كاملًا.",
    safeguardContractsTitle: "عقود صريحة",
    safeguardContractsDescription:
      "تكشف عقود TypeScript الصريحة وقواعد اتجاه الاعتماد مفاتيح الرسائل غير الصالحة ونقص الكتالوج ومخالفات الطبقات قبل عبورها بوابة الجودة.",
    safeguardContractsEvidence:
      "تملك فحوص الأنواع واختبارات تكافؤ الكتالوج والتحليل الساكن هذا التحقق.",
    safeguardContractsTechnologies: "TypeScript · ESLint",
    safeguardAccessTitle: "تفاعل متوافق مع الوصول",
    safeguardAccessDescription:
      "تقلّل المعالم الدلالية والتركيز المرئي والتنقل بلوحة المفاتيح وقواعد تقليل الحركة عوائق التفاعل في هيكل الواجهة المنفّذ.",
    safeguardAccessEvidence: "تختبر فحوص تفاعل المكوّن وفحوص axe المظهرين والاتجاهين.",
    safeguardAccessTechnologies: "لوحة المفاتيح · Base UI · axe",
    safeguardBrowserTitle: "فحوص للسلوك المعروض",
    safeguardBrowserDescription:
      "تراقب اختبارات المتصفح سجل وحدة التحكم والتجاوز الأفقي واختيار الخطوط ومسارات لوحة المفاتيح والمظاهر والاتجاهات على بناء فعلي.",
    safeguardBrowserEvidence:
      "يملك مشروعا Playwright للتطوير والإنتاج هذه الملاحظات ضمن المسارات والحالات المضبوطة لكل منهما.",
    safeguardBrowserTechnologies: "Playwright · Chromium",
    safeguardFontsTitle: "خطوط محزّمة ومحلية",
    safeguardFontsDescription:
      "يُحزَّم Inter عبر Next.js، بينما يُقدَّم Tajawal من ملفات محلية مخصّصة للعربية. وتتحقق اختبارات المتصفح من اختيار الخط المناسب دون طلب Google Fonts وقت التشغيل.",
    safeguardFontsEvidence:
      "تتحقق اختبارات ملكية الخطوط من الطلبات والملفات المحمّلة واختيار الخط المناسب لكل نص.",
    safeguardFontsTechnologies: "next/font · Inter · Tajawal",
    safeguardInstallTitle: "سكربتات تثبيت مضبوطة",
    safeguardInstallDescription:
      "تحصر قائمة سماح صارمة سكربتات دورة حياة الاعتماد وقت التثبيت في الموافقات المراجَعة، فتقلّل تنفيذ شيفرة غير مراجَعة أثناء التثبيت. وتُعاد مراجعة الموافقات عند تغيّر إصدارات الاعتمادات.",
    safeguardInstallEvidence:
      "تمنع سياسة مدير الحزم افتراضيًا سكربتات دورة حياة الاعتماد غير المراجعة.",
    safeguardInstallTechnologies: "npm · allowScripts",
    safeguardShowcaseTitle: "عزل العرض التوضيحي",
    safeguardShowcaseDescription:
      "ضمن عقد الإصدار الحالي، يحوّل علم وقت البناء مسارات Showcase وواجهتها البرمجية إلى صفحات غير موجودة ثابتة، بينما يبقى المسار الإنتاجي الرئيسي متاحًا باستقلال.",
    safeguardShowcaseEvidence: "يتحقق البناء المعطّل وفحص استجابة المسار الرئيسي من حد النشر هذا.",
    safeguardShowcaseTechnologies: "NEXT_PUBLIC_ENABLE_SHOWCASE",
    dependencyPostureTitle: "موقف شفاف من الاعتمادات",
    dependencyPostureDescription:
      "تُوثَّق تنبيهات الاعتمادات المعروفة وتُراجع بدل إخفائها أو إزالتها بخفض قسري غير آمن للإصدارات. يقلّل ذلك الغموض، لكنه لا يعني أن شجرة الاعتمادات خالية من المخاطر.",
    pipelineLabel: "مسار التحقق الآلي",
    pipelineFormat: "التنسيق",
    pipelineLint: "التحليل الساكن",
    pipelineTypes: "الأنواع",
    pipelineUnit: "اختبارات الوحدات",
    pipelineBuild: "البناء الإنتاجي",
    pipelineBrowser: "اختبارات المتصفح",
    faqEyebrow: "أسئلة وإجابات",
    faqTitle: "إجابات واضحة عن الأساس.",
    faqLead: "يوضح الأساس ما يقدّمه، وما يمكن تكييفه، وأين تنتهي ضماناته.",
    faqIncludedQuestion: "ماذا يتضمن الأساس؟",
    faqIncludedAnswer:
      "يوفّر بنية Next.js App Router، وعقود TypeScript صريحة، ومظهرين دلاليين: الفاتح والداكن، وخطي Inter وTajawal، وأساسَي SiteShell وAppShell، ودعم الإنجليزية والعربية باتجاهي LTR وRTL، ومكوّنات Base UI تراعي الوصول، واختبارات آلية، ووثائق حيّة، وأمثلة معزولة في Showcase. وهو نقطة انطلاق للواجهة الأمامية، لا منتجًا مكتملًا لمجال محدد ولا خلفية خادمية.",
    faqLanguageQuestion: "كيف يعمل دعم الإنجليزية والعربية واتجاهي LTR وRTL؟",
    faqLanguageAnswer:
      "تشترك الإنجليزية والعربية في بنية كتالوج واحدة مضبوطة الأنواع، ويتبدّل المحتوى الظاهر وسمتا lang وdir معًا وقت التشغيل. يتولى Inter النص اللاتيني وTajawal النص العربي، وتدعم قواعد التخطيط المنطقية اتجاهي LTR وRTL. يعتمد اختيار اللغة على حالة العميل لا على مسارات URL، لذلك تبقى البيانات الوصفية للخادم بالقيمة الأساسية المعتمدة.",
    faqBrandingQuestion: "هل يمكن استبدال الهوية ونظام التصميم؟",
    faqBrandingAnswer:
      "نعم، لكن ذلك يتطلب عملاً تنفيذيًا مقصودًا. تمثل Foundation Frame الهوية الافتراضية القابلة للاستبدال، بينما تجمع الرموز الدلالية تكييف الهوية والمظهر في مواضع مركزية. ينبغي الحفاظ على عقود المكوّنات المشتركة والوصول، وتغيير الهوية عبر مواضع ملكيتها الحالية بدل إضافة ألوان منفردة أو نسخ SVG مكررة.",
    faqShowcaseQuestion: "هل يدخل Showcase ضمن إصدار الإنتاج؟",
    faqShowcaseAnswer:
      "Showcase سطح معزول للتطوير والمرجعية، وليس جزءًا من المنتج الإنتاجي. يتيح عقد الإصدار الحالي تعطيله وقت البناء؛ وعندها تُولَّد مساراته وواجهة API كاستجابات 404 ثابتة، بينما يبقى المسار / متاحًا باستقلال. هذا عزل للإصدار، وليس صندوقًا أمنيًا معزولًا.",
    faqStaticQuestion: "هل تُولَّد جميع المسارات مسبقًا؟",
    faqStaticAnswer:
      "لا. يُولَّد المسار / حاليًا مسبقًا لأنه لا يعتمد على حالة اللغة وقت الطلب. ويبقى التوليد الثابت قرارًا يخص كل مسار؛ فقد تحتاج المسارات المستقبلية التي تتطلب مصادقة أو تخصيصًا أو بيانات وقت الطلب إلى عرض ديناميكي.",
    faqSecurityQuestion: "هل يضمن الأساس انعدام الثغرات؟",
    faqSecurityAnswer:
      "لا. يستخدم الأساس ضوابط مراجَعة وبوابات جودة لتقليل المخاطر، لا ليَعِد بأمان كامل. تُقيَّد سكربتات تثبيت الاعتمادات بقائمة سماح مراجَعة، وتُوثَّق التنبيهات المعروفة وتُعاد مراجعتها بدل إخفائها أو إزالة أثرها بخفض قسري غير آمن للإصدارات. ويبقى المتبنّون مسؤولين عن المراجعة المستمرة للاعتمادات وأمن التطبيق.",
    closingEyebrow: "خطوة تالية واضحة",
    closingTitle: "ابنِ على أساس واضح.",
    closingDescription:
      "راجع المعمارية وضوابط الجودة، ثم كيّف النظام حول منتجك مع الحفاظ على عقوده المشتركة.",
    closingPrimaryAction: "راجع المعمارية",
    closingSecondaryAction: "استعرض ضوابط الجودة",
    footerContext: "أساس محايد المجال لبناء تطبيقات ويب إنتاجية.",
    footerNavLabel: "تنقل التذييل",
    footerOverview: "نظرة عامة",
    footerCapabilities: "الإمكانات",
    footerStatus: "مبني على رموز دلالية وعقود أنواع صريحة وتوليد ثابت.",
  },
  site: {
    metaTitle: "هيكل الموقع",
    sandboxNote: "بيئة اختبار هندسية — ليست منتجًا",
    brand: "معرض الأساس",
    navLabel: "أقسام الموقع",
    exploreMenu: "استكشف",
    overviewTitle: "نظرة عامة",
    overviewDescription: "التركيب المرجعي لهيكل الموقع.",
    layoutTitle: "التخطيط",
    layoutDescription: "المقاس والإيقاع وهيكل الصفحة.",
    tokensTitle: "رموز التصميم",
    tokensDescription: "اللون والخط والارتفاع والحركة.",
    navigationTitle: "التنقل",
    navigationDescription: "القوائم والتبويبات ومسارات التنقل والترقيم.",
    dataTitle: "طبقة البيانات",
    dataDescription: "apiFetch ومفاتيح الاستعلام وحالات الخطأ.",
    changelogTitle: "سجل التغييرات",
    changelogDescription: "ملاحظات الإصدار — قريبًا.",
    pricing: "الأسعار",
    logIn: "تسجيل الدخول",
    getStarted: "ابدأ الآن",
    ctaUnavailableTitle: "«{label}» غير متاح هنا",
    ctaUnavailableDescription: "لا يوفّر العرض أي مصادقة — هذا عنصر توضيحي.",
    heroTitle: "الهيكل العام، بصوته الخاص.",
    heroLead:
      "تُعرض هذه الصفحة داخل هيكل الموقع (SiteShell) — النظير العام لهيكل التطبيق (AppShell) الذي يستخدمه بقية العرض: شريط علوي ثابت يضم العلامة والتنقل والإجراءات، وتذييل بأعمدة روابط مُجمّعة، ونفس آليات رابط التخطي والدرج.",
    heroPrimaryCta: "اقرأ عقد التخطيط",
    heroSecondaryCta: "العودة إلى العرض",
    localesCount: "تُقدَّم هذه الصفحة بعدد {count} من اللغات من بناء ثابت واحد.",
    collapseTitle: "الطي المتجاوب",
    collapseDescription:
      "أسفل نقطة الطي، ينتقل تنقل الشريط العلوي إلى درج منبثق يُفتح من مجموعة الإجراءات — حبس التركيز، ومفتاح الهروب، والإغلاق بالنقر على الخلفية، وإعادة التركيز، والإغلاق عند التنقل.",
    directionTitle: "اللغة والاتجاه",
    directionDescription:
      "معالم banner وnav وmain وcontentinfo؛ ورابط تخطٍّ كأول عنصر قابل للتركيز؛ وتمرير على مستوى المستند. يتبع الاتجاهُ اللغةَ المختارة، لذا ينعكس الهيكل بالكامل مع العربية دون أي تغييرات في المكوّنات — بدّل اللغة في الشريط العلوي للتحقق.",
    footerExplore: "استكشف",
    footerIndex: "فهرس العرض",
    footerTokens: "الرموز",
    footerProduct: "المنتج",
    footerChangelog: "سجل التغييرات",
    footerFoundation: "الأساس",
    footerFoundationNote: "هيكل بنيوي فقط — أعد التصميم عبر الرموز وclassName.",
  },
};
