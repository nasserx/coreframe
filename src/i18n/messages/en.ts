/**
 * The canonical message catalogue. English is the SHAPE the whole system is
 * typed against: `Messages` (src/i18n/messages.ts) is `typeof en`, so every
 * other locale's catalogue must carry exactly these namespaces and keys (a
 * missing or misspelled key fails the typecheck), and `MessageKey<NS>` is
 * derived from here — call sites cannot reference a key that does not exist.
 *
 * Interpolation: `{name}` placeholders are filled by `translate()`
 * (src/i18n/translate.ts). Keep the placeholder spelling identical across
 * locales — an unknown `{var}` is left verbatim, which surfaces the drift.
 *
 * Adding a string: add it here first (this is the contract), then add the same
 * key to every other locale catalogue; the typecheck names any you forget.
 */
export const en = {
  /** Shared error-state copy (ErrorFallback + the route/global error files). */
  error: {
    title: "Something went wrong.",
    description:
      "An unexpected error occurred. Try again, or reload the page if the problem persists.",
    routeDescription:
      "An unexpected error occurred while loading this page. Try again, or reload if the problem persists.",
    globalDescription:
      "The application failed to render. Try again, or reload the page if the problem persists.",
    actionLabel: "Try again",
    // {digest} is the server error digest, shown as a support reference line.
    reference: "Reference: {digest}",
    documentTitle: "Something went wrong — {app}",
  },
  /** The root not-found boundary. */
  notFound: {
    code: "404",
    metaTitle: "Page not found",
    title: "Page not found",
    description: "The page you are looking for does not exist or may have moved.",
    homeAction: "Go to the home page",
  },
  /** Dialog primitive affordances localized at the call site. */
  dialog: {
    close: "Close",
  },
  /** Pagination primitive affordances localized at the call site. */
  pagination: {
    ellipsisLabel: "More pages",
  },
  /** ThemeControl accessible names (the group and its three options). */
  theme: {
    label: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  /** LocaleControl accessible name (option labels are autonyms from config). */
  localeControl: {
    label: "Language",
  },
  /** Shell chrome affordances (AppShell / SiteShell) localized at call sites. */
  shell: {
    skipLink: "Skip to main content",
    openNav: "Open navigation",
    closeNav: "Close navigation",
    unavailable: "Not yet available",
  },
  /** Production marketing ownership for the root route. */
  marketing: {
    brand: "Frontend Foundation",
    navLabel: "Primary navigation",
    navOverview: "Overview",
    navCapabilities: "Capabilities",
    eyebrow: "Production-ready by design",
    heroTitle: "A dependable starting point for modern web products.",
    heroLead:
      "Build on a typed, accessible foundation with semantic themes, bilingual direction support, responsive public chrome, and automated quality gates.",
    heroPrimaryCta: "Explore the capabilities",
    heroNoteArchitecture: "App Router architecture",
    heroNoteThemes: "Semantic light and dark themes",
    heroNoteBilingual: "English and Arabic ready",
    capabilitiesHeading: "Foundation capabilities",
    capabilityThemesTitle: "Semantic themes",
    capabilityThemesDescription: "Light and dark from one token system.",
    capabilityBilingualTitle: "Bilingual direction",
    capabilityBilingualDescription: "English LTR and Arabic RTL.",
    capabilityStaticTitle: "Static by default",
    capabilityStaticDescription: "Routes prerender without request-time locale state.",
    capabilityQualityTitle: "Automated quality",
    capabilityQualityDescription: "Formatting, types, tests, accessibility, and overflow checks.",
    footerContext: "A domain-neutral base for production web applications.",
    footerNavLabel: "Footer navigation",
    footerStatus: "Built with semantic tokens, typed contracts, and static generation.",
  },
  /**
   * The `(site)` showcase — the Arabic proof surface. This is real page copy
   * (brand, navigation, hero, sections, footer) translated end to end so the
   * message layer, RTL mirroring, Arabic type metrics, and the top bar are all
   * exercised together, not just the primitive affordances above.
   */
  site: {
    metaTitle: "Site shell",
    sandboxNote: "Engineering sandbox — not a product",
    brand: "Foundation Showcase",
    navLabel: "Site sections",
    exploreMenu: "Explore",
    overviewTitle: "Overview",
    overviewDescription: "The SiteShell reference composition.",
    layoutTitle: "Layout",
    layoutDescription: "Measure, rhythm, and page scaffold.",
    tokensTitle: "Design tokens",
    tokensDescription: "Colour, type, elevation, and motion.",
    navigationTitle: "Navigation",
    navigationDescription: "Menus, tabs, breadcrumbs, pagination.",
    dataTitle: "Data layer",
    dataDescription: "apiFetch, query keys, error states.",
    changelogTitle: "Changelog",
    changelogDescription: "Release notes — coming soon.",
    pricing: "Pricing",
    logIn: "Log in",
    getStarted: "Get started",
    ctaUnavailableTitle: "“{label}” isn’t available here",
    ctaUnavailableDescription: "The showcase ships no authentication — this is a demo affordance.",
    heroTitle: "The public shell, in its own voice.",
    heroLead:
      "This page renders inside the SiteShell — the public-site counterpart to the AppShell the rest of the showcase uses: a sticky top bar with brand, navigation, and actions, a footer with grouped link columns, and the same skip link and drawer mechanics.",
    heroPrimaryCta: "Read the layout contract",
    heroSecondaryCta: "Back to the showcase",
    localesCount: "This page is served in {count} languages from one static build.",
    collapseTitle: "Responsive collapse",
    collapseDescription:
      "Below the collapse breakpoint the top-bar navigation moves into a modal drawer opened from the actions cluster — focus trap, Escape, backdrop dismissal, focus return, close on navigation.",
    directionTitle: "Language and direction",
    directionDescription:
      "banner, nav, main, and contentinfo landmarks; a skip link as the first focusable element; document-level scroll. Direction follows the selected language, so the whole shell mirrors under Arabic with no component changes — switch the language in the top bar to verify.",
    footerExplore: "Explore",
    footerIndex: "Showcase index",
    footerTokens: "Tokens",
    footerProduct: "Product",
    footerChangelog: "Changelog",
    footerFoundation: "Foundation",
    footerFoundationNote: "Structural chrome only — restyle through tokens and className.",
  },
} as const;
