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
    navCapabilities: "الإمكانات",
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
    footerContext: "أساس محايد المجال لبناء تطبيقات ويب إنتاجية.",
    footerNavLabel: "تنقل التذييل",
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
