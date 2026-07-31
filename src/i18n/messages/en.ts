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
    navArchitecture: "Architecture",
    navQuality: "Quality",
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
    storyEyebrow: "Capabilities with evidence",
    storyTitle: "Technical choices that carry their evidence.",
    storyLead:
      "The Foundation turns its core decisions into maintainable outcomes. Each capability is owned in code, documented where it belongs, and exercised by a quality gate suited to the risk it reduces.",
    storyEvidenceLabel: "Repository check",
    storyArchitectureTitle: "Architecture with clear ownership",
    storyArchitectureDescription:
      "App Router pages stay focused on framework wiring while feature modules own product composition. Explicit TypeScript boundaries make integrations easier to maintain.",
    storyArchitectureEvidence:
      "Dependency-direction lint rules and strict typechecking enforce the boundary.",
    storyArchitectureTechnologies: "Next.js · App Router · TypeScript",
    storyTokensTitle: "A semantic design system",
    storyTokensDescription:
      "Tailwind CSS utilities resolve through one semantic token layer, so light and dark surfaces change by role instead of component-level raw colors.",
    storyTokensEvidence: "Token-parity and contrast tests exercise both themes.",
    storyTokensTechnologies: "Tailwind CSS · semantic tokens",
    storyBilingualTitle: "Bilingual by construction",
    storyBilingualDescription:
      "Each script has an appropriate typeface, while logical spacing and alignment let English and Arabic share the same component structure in both directions.",
    storyBilingualEvidence:
      "Catalogue, font, direction, accessibility, and overflow checks cover the contract.",
    storyBilingualTechnologies: "Inter · Tajawal · LTR · RTL",
    storyShellTitle: "Responsive public chrome",
    storyShellDescription:
      "SiteShell provides the header, main, footer, skip link, and a focus-managed mobile drawer without making pages duplicate shell behavior.",
    storyShellEvidence:
      "Component keyboard tests and production-browser shell coverage exercise it.",
    storyShellTechnologies: "SiteShell · Base UI",
    storyStaticTitle: "A static delivery path",
    storyStaticDescription:
      "The landing route prerenders from server-owned route composition and does not read request-time locale state.",
    storyStaticEvidence:
      "The production build and the Showcase-disabled root-route check verify it.",
    storyStaticTechnologies: "Next.js · static output",
    storyQualityTitle: "Quality gates that observe the browser",
    storyQualityDescription:
      "Formatting, linting, types, unit tests, builds, and browser tests cover both code contracts and rendered behavior.",
    storyQualityEvidence: "The CI workflow and auto-discovered route matrix own the verification.",
    storyQualityTechnologies: "Vitest · Playwright · axe",
    architectureEyebrow: "Architecture and delivery",
    architectureTitleBefore: "",
    architectureTitleAfter: ": static where the route allows it.",
    architectureLead:
      "Route composition and metadata remain server-owned. Translated content and controls cross explicit client boundaries only when they respond to live locale, theme, or shell state.",
    architectureBody:
      "The page reads no request-time locale state, so the build can prerender it from the configured default catalogue. That avoids unnecessary request-time work and keeps deployment simpler for this route, without promising that every future route will be static.",
    verificationLabel: "Repository evidence",
    architectureVerification:
      "Normal and Showcase-disabled builds both mark / as static, and disabling the Showcase does not change its HTTP 200 response.",
    architectureDiagramLabel: "Architecture delivery path",
    architectureStepRouteKicker: "Server",
    architectureStepRouteTitle: "Server-owned route",
    architectureStepRouteDescription:
      "The App Router page composes marketing content and canonical metadata.",
    architectureStepStaticKicker: "Static",
    architectureStepStaticTitle: "Prerendered output",
    architectureStepStaticDescription:
      "The build emits the root page as static content from the default locale.",
    architectureStepClientKicker: "Client",
    architectureStepClientTitle: "Explicit client boundaries",
    architectureStepClientDescription:
      "Translated content, SiteShell chrome, theme, and locale controls hydrate for live interaction.",
    bilingualEyebrow: "Bilingual design system",
    bilingualTitle: "One semantic system, equal care in both directions.",
    bilingualLead:
      "The interface begins with semantic roles for color, surface, and state rather than raw values inside each component. Logical properties then adapt spacing and alignment to the active language direction.",
    bilingualInterDescription: "Owns Latin text throughout the shared sans stack.",
    bilingualTajawalDescription:
      "Owns Arabic text through local font files limited to Arabic characters.",
    bilingualVerification:
      "Browser tests verify that both families are loaded and selected for their scripts; theme and direction matrices cover accessibility and overflow.",
    bilingualDiagramLabel: "Semantic design-system path",
    bilingualStepTokensKicker: "Tokens",
    bilingualStepTokensTitle: "Semantic roles",
    bilingualStepTokensDescription: "Background, surface, text, action, and status.",
    bilingualStepThemesKicker: "Themes",
    bilingualStepThemesTitle: "Theme values",
    bilingualStepThemesDescription: "Light and dark resolve from the same role vocabulary.",
    bilingualStepDirectionKicker: "Direction",
    bilingualStepDirectionTitle: "Language and direction",
    bilingualStepDirectionDescription: "English LTR and Arabic RTL share one structure.",
    qualityEyebrow: "Verified safeguards",
    qualityTitle: "Risk-reducing defaults, not absolute guarantees.",
    qualityLead:
      "The Foundation combines static analysis with browser checks because neither layer catches every class of failure. These safeguards reduce known risks and keep their evidence reviewable; they do not promise perfect security.",
    safeguardContractsTitle: "Explicit contracts",
    safeguardContractsDescription:
      "Strict TypeScript contracts and dependency-direction linting catch invalid message keys, missing catalogue entries, and layer violations before they cross a quality gate.",
    safeguardContractsEvidence: "Typecheck, catalogue-parity tests, and lint own the checks.",
    safeguardContractsTechnologies: "TypeScript · ESLint",
    safeguardAccessTitle: "Accessible interaction",
    safeguardAccessDescription:
      "Semantic landmarks, visible focus, keyboard-operated shell navigation, and reduced-motion rules reduce interaction barriers in the implemented shell.",
    safeguardAccessEvidence:
      "Component interaction tests and axe scans exercise both themes and directions.",
    safeguardAccessTechnologies: "Base UI · axe · keyboard",
    safeguardBrowserTitle: "Rendered-behavior checks",
    safeguardBrowserDescription:
      "Browser tests monitor console output, horizontal overflow, font selection, keyboard flows, themes, and directions against running builds.",
    safeguardBrowserEvidence:
      "Development and production Playwright projects own these observations for their configured routes and states.",
    safeguardBrowserTechnologies: "Playwright · Chromium",
    safeguardFontsTitle: "Bundled and local fonts",
    safeguardFontsDescription:
      "Inter is bundled through Next.js, while Tajawal is served from local Arabic subsets. Browser tests verify script ownership without runtime Google Fonts requests.",
    safeguardFontsEvidence:
      "Font ownership tests verify requests, loaded faces, and script-specific selection.",
    safeguardFontsTechnologies: "next/font · Inter · Tajawal",
    safeguardInstallTitle: "Controlled installation scripts",
    safeguardInstallDescription:
      "A strict allowlist restricts dependency install-time scripts to reviewed approvals, reducing unreviewed code execution during installation. Approvals are revisited when dependency versions change.",
    safeguardInstallEvidence:
      "The npm policy fails closed for unreviewed dependency lifecycle scripts.",
    safeguardInstallTechnologies: "npm · allowScripts",
    safeguardShowcaseTitle: "Showcase isolation",
    safeguardShowcaseDescription:
      "For the current release contract, a build-time flag turns Showcase routes and their API into static 404s while the production root remains independently available.",
    safeguardShowcaseEvidence:
      "The disabled build and root HTTP check verify that release boundary.",
    safeguardShowcaseTechnologies: "NEXT_PUBLIC_ENABLE_SHOWCASE",
    dependencyPostureTitle: "Transparent dependency posture",
    dependencyPostureDescription:
      "Known dependency advisories are documented and reviewed rather than hidden or cleared through an unsafe forced downgrade. This reduces uncertainty; it does not mean the dependency tree is risk-free.",
    pipelineLabel: "Automated validation pipeline",
    pipelineFormat: "Format",
    pipelineLint: "Lint",
    pipelineTypes: "Types",
    pipelineUnit: "Unit tests",
    pipelineBuild: "Production build",
    pipelineBrowser: "Browser tests",
    faqEyebrow: "Questions, answered",
    faqTitle: "Clear answers about the Foundation.",
    faqLead:
      "The Foundation is explicit about what it provides, what remains adaptable, and where its guarantees end.",
    faqIncludedQuestion: "What does the Foundation include?",
    faqIncludedAnswer:
      "It provides a Next.js App Router structure, explicit TypeScript contracts, semantic light and dark themes, Inter and Tajawal typography, SiteShell and AppShell foundations, English/Arabic LTR/RTL behavior, accessibility-oriented Base UI primitives, automated tests, living documentation, and isolated Showcase examples. It is a frontend starting point—not a complete domain product or backend.",
    faqLanguageQuestion: "How do English, Arabic, LTR, and RTL work together?",
    faqLanguageAnswer:
      "English and Arabic share one typed catalogue shape, and the visible page, document lang, and dir switch together at runtime. Inter owns Latin text, Tajawal owns Arabic, and logical layout rules support LTR and RTL. Locale selection is client-state-based rather than URL-routed, so server metadata remains the canonical server value.",
    faqBrandingQuestion: "Can I replace the branding and design system?",
    faqBrandingAnswer:
      "Yes, with deliberate implementation work. Foundation Frame is a replaceable default identity, while semantic tokens centralize brand and theme adaptation. Preserve shared component and accessibility contracts, and replace identity through its existing owners instead of adding one-off colors or duplicated SVGs.",
    faqShowcaseQuestion: "Is the Showcase included in production?",
    faqShowcaseAnswer:
      "Showcase is an isolated development and reference surface, not a production product area. The current release contract can disable it at build time; its routes and API then prerender as static 404 responses while / remains independently available. This is release isolation, not a security sandbox.",
    faqStaticQuestion: "Is every route statically generated?",
    faqStaticAnswer:
      "No. The current / route is statically prerendered because it does not depend on request-time locale state. Static generation remains a route-by-route decision; future authenticated, personalized, or request-dependent routes may need dynamic rendering.",
    faqSecurityQuestion: "Does the Foundation guarantee zero vulnerabilities?",
    faqSecurityAnswer:
      "No. The Foundation uses reviewed safeguards and quality gates to reduce risk, not to promise perfect security. Dependency install scripts are restricted by a reviewed allowlist, and known advisories are documented and reevaluated rather than hidden or cleared through unsafe forced downgrades. Adopters remain responsible for ongoing dependency and application-security review.",
    closingEyebrow: "A clear next step",
    closingTitle: "Build from a clear foundation.",
    closingDescription:
      "Review the architecture and safeguards, then adapt the system around your product while preserving its shared contracts.",
    closingPrimaryAction: "Review the architecture",
    closingSecondaryAction: "Inspect the safeguards",
    footerContext: "A domain-neutral base for production web applications.",
    footerNavLabel: "Footer navigation",
    footerOverview: "Overview",
    footerCapabilities: "Capabilities",
    footerArchitecture: "Architecture",
    footerBilingualDesign: "Bilingual design",
    footerQuality: "Quality",
    footerFaq: "FAQ",
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
