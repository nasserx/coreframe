import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LocaleProvider } from "@/core/providers/locale-provider";
import { ThemeProvider } from "@/core/providers/theme-provider";
import { ar } from "@/i18n/messages/ar";
import { en } from "@/i18n/messages/en";

import { MarketingShell } from "./marketing-shell";

/*
 * Contract of the marketing shell composition. Structure, destinations, and
 * bilingual behavior are DOM facts and belong here; resolved responsive
 * interaction states, direction geometry, overflow, and axe live in the
 * browser layer (tests/e2e/marketing.spec.ts).
 */

// SiteShell dismisses its drawer on route change via usePathname; component
// tests render outside the App Router, so pin the hook (as site-shell.test.tsx
// does).
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// The footer's destinations, in the order the page presents their sections.
const FOOTER_DESTINATIONS = [
  { key: "footerOverview", href: "#overview" },
  { key: "footerCapabilities", href: "#capability-story" },
  { key: "footerArchitecture", href: "#architecture" },
  { key: "footerBilingualDesign", href: "#bilingual-design" },
  { key: "footerQuality", href: "#quality" },
  { key: "footerFaq", href: "#faq" },
] as const;

const HEADER_DESTINATIONS = [
  { key: "navOverview", href: "#overview" },
  { key: "navCapabilities", href: "#capability-story" },
  { key: "navArchitecture", href: "#architecture" },
  { key: "navQuality", href: "#quality" },
] as const;

function installBrowserStubs(): void {
  vi.stubGlobal(
    "matchMedia",
    (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList,
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
      readonly root = null;
      readonly rootMargin = "";
      readonly thresholds: readonly number[] = [];
    },
  );
}

function renderMarketingShell() {
  return render(
    <ThemeProvider>
      <LocaleProvider>
        <MarketingShell>
          <section id="overview" />
        </MarketingShell>
      </LocaleProvider>
    </ThemeProvider>,
  );
}

function footer(): HTMLElement {
  return screen.getByRole("contentinfo");
}

function headerNav(): HTMLElement {
  return within(screen.getByRole("banner")).getByRole("navigation", {
    name: en.marketing.navLabel,
  });
}

function footerNav(): HTMLElement {
  const nav = footer().querySelector('[data-slot="marketing-footer-nav"]');
  if (!(nav instanceof HTMLElement)) {
    throw new Error("The marketing footer must own a labelled navigation region.");
  }
  return nav;
}

describe("MarketingShell header navigation", () => {
  beforeEach(() => {
    installBrowserStubs();
  });

  it("keeps ordered fragment destinations and applies only the desktop interaction override", () => {
    renderMarketingShell();

    const links = within(headerNav()).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(
      HEADER_DESTINATIONS.map(({ key }) => en.marketing[key]),
    );
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      HEADER_DESTINATIONS.map(({ href }) => href),
    );

    for (const link of links) {
      expect(link).not.toHaveAttribute("aria-current");
      expect(link).toHaveClass(
        "font-semibold",
        "text-foreground",
        "hover:text-muted-foreground",
        "focus-visible:ring-2",
        "md:text-muted-foreground",
        "md:hover:text-foreground",
        "md:focus-visible:text-foreground",
        "md:active:text-foreground",
        "md:aria-[current=page]:text-foreground",
      );
    }
  });

  it("delegates gutters and brand spacing to the shared layout contracts", () => {
    renderMarketingShell();

    const shell = document.querySelector('[data-slot="site-shell"]');
    expect(shell?.className).not.toMatch(/data-slot=(?:container|site-shell-header-row)/);

    const banner = screen.getByRole("banner");
    const brand = within(banner).getByRole("link", { name: en.marketing.brand });
    expect(brand.className).not.toMatch(/(?:^|:)me-/);
    expect(headerNav()).toHaveClass("gap-1");
  });
});

describe("MarketingShell footer", () => {
  beforeEach(() => {
    installBrowserStubs();
  });

  it("carries the exact bilingual destination labels with catalogue parity", () => {
    expect(FOOTER_DESTINATIONS.map(({ key }) => en.marketing[key])).toEqual([
      "Overview",
      "Capabilities",
      "Architecture",
      "Bilingual design",
      "Quality",
      "FAQ",
    ]);
    expect(FOOTER_DESTINATIONS.map(({ key }) => ar.marketing[key])).toEqual([
      "نظرة عامة",
      "الإمكانات",
      "المعمارية",
      "التصميم ثنائي اللغة",
      "الجودة",
      "الأسئلة الشائعة",
    ]);

    const englishFooterKeys = Object.keys(en.marketing).filter((key) => key.startsWith("footer"));
    const arabicFooterKeys = Object.keys(ar.marketing).filter((key) => key.startsWith("footer"));
    expect(arabicFooterKeys).toEqual(englishFooterKeys);
  });

  it("keeps one contentinfo landmark holding the brand, context, and status copy", () => {
    renderMarketingShell();

    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);

    const region = footer();
    const brand = within(region).getByRole("link", { name: en.marketing.brand });
    expect(brand).toHaveAttribute("href", "/");
    expect(within(region).getByText(en.marketing.footerContext)).toBeVisible();
    expect(within(region).getByText(en.marketing.footerStatus)).toBeVisible();

    // The status line stays a plain closing statement beneath a semantic
    // hairline, never a heading and never another call to action.
    expect(within(region).queryAllByRole("heading")).toHaveLength(0);
    expect(within(region).queryAllByRole("button")).toHaveLength(0);
    expect(region.querySelectorAll("form, input, select, textarea")).toHaveLength(0);
  });

  it("exposes exactly six ordered destinations in a distinctly named navigation", () => {
    renderMarketingShell();

    const nav = footerNav();
    expect(nav).toHaveAccessibleName(en.marketing.footerNavLabel);
    expect(nav.tagName).toBe("NAV");

    const links = within(nav).getAllByRole("link");
    expect(links).toHaveLength(FOOTER_DESTINATIONS.length);
    expect(links.map((link) => link.textContent)).toEqual(
      FOOTER_DESTINATIONS.map(({ key }) => en.marketing[key]),
    );
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      FOOTER_DESTINATIONS.map(({ href }) => href),
    );

    // Labels are unique, so no two entries read the same in the tab order.
    const labels = links.map((link) => link.textContent);
    expect(new Set(labels).size).toBe(labels.length);

    // The footer holds the brand lockup plus these six destinations, nothing else.
    expect(within(footer()).getAllByRole("link")).toHaveLength(FOOTER_DESTINATIONS.length + 1);
  });

  it("resolves the Capabilities collision and promises no destination the page lacks", () => {
    renderMarketingShell();

    const region = footer();
    for (const link of within(region).getAllByRole("link")) {
      const href = link.getAttribute("href") ?? "";
      expect(href).toMatch(/^(?:\/|#[a-z-]+)$/);
      expect(link).not.toHaveAttribute("target");
      expect(link).not.toHaveAttribute("rel");
      expect(link).not.toHaveAttribute("data-unavailable");
    }

    const hrefs = within(footerNav())
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    // The footer indexes the named capability section, never the hero's
    // unlabelled strip, and never the closing CTA directly above it.
    expect(hrefs).not.toContain("#capabilities");
    expect(hrefs).not.toContain("#next-step");

    expect(region.innerHTML).not.toMatch(/showcase/i);
    expect(region.innerHTML).not.toMatch(/https?:\/\//);
    expect(region.innerHTML).not.toMatch(/mailto:|tel:/);
    expect(region.querySelectorAll("[disabled], [aria-disabled]")).toHaveLength(0);
    // `getAttribute` rather than `className`: the brand mark is an SVG, whose
    // `className` is an SVGAnimatedString, not a string.
    for (const element of region.querySelectorAll("[class]")) {
      expect(element.getAttribute("class") ?? "").not.toMatch(/\b(?:ml|mr|pl|pr|left|right)-/);
    }
  });

  it("keeps footer destinations keyboard reachable in DOM order", async () => {
    const user = userEvent.setup();
    renderMarketingShell();

    const links = within(footerNav()).getAllByRole("link");
    const [first] = links;
    if (!first) {
      throw new Error("The marketing footer requires its destinations.");
    }

    first.focus();
    expect(first).toHaveFocus();
    for (const link of links.slice(1)) {
      await user.tab();
      expect(link).toHaveFocus();
    }
  });

  it("switches every footer label live with the active locale", async () => {
    const user = userEvent.setup();
    renderMarketingShell();

    // The shell renders the same control twice (desktop cluster + drawer);
    // either one switches the whole runtime.
    await user.click(screen.getAllByRole("button", { name: "Switch to Arabic" })[0]!);
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));

    const region = footer();
    expect(within(region).getByRole("link", { name: ar.marketing.brand })).toHaveAttribute(
      "href",
      "/",
    );
    expect(within(region).getByText(ar.marketing.footerContext)).toBeVisible();
    expect(within(region).getByText(ar.marketing.footerStatus)).toBeVisible();
    expect(footerNav()).toHaveAccessibleName(ar.marketing.footerNavLabel);

    const links = within(footerNav()).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(
      FOOTER_DESTINATIONS.map(({ key }) => ar.marketing[key]),
    );
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      FOOTER_DESTINATIONS.map(({ href }) => href),
    );

    for (const { key } of FOOTER_DESTINATIONS) {
      expect(region).not.toHaveTextContent(en.marketing[key]);
    }
    // `brand` is excluded on purpose: Coreframe is a proper name, so it is
    // locale-invariant and both catalogues carry the same string (DECISIONS.md
    // → _Project identity: Coreframe_). Its presence in Arabic is asserted
    // above via `ar.marketing.brand`; asserting it absent would be asserting
    // that the brand gets translated.
    expect(en.marketing.brand).toBe(ar.marketing.brand);
    for (const key of ["footerContext", "footerNavLabel", "footerStatus"] as const) {
      expect(region).not.toHaveTextContent(en.marketing[key]);
    }
  });
});
