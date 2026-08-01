"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import Link from "next/link";

import { BrandMark } from "@/components/ui/brand-mark";
import { LocaleControl } from "@/components/ui/locale-control";
import {
  SiteShell,
  SiteShellFooter,
  SiteShellHeader,
  SiteShellMain,
  SiteShellNav,
  SiteShellNavItem,
  SiteShellNavTrigger,
} from "@/components/ui/site-shell";
import { ThemeControl } from "@/components/ui/theme-control";
import { useTranslations } from "@/core/providers/locale-provider";
import { cn } from "@/lib/utils";

import { useMarketingReveal } from "./use-marketing-reveal";

export type MarketingShellProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Footer destinations, in DOM order. Every entry is a section this page
 * actually renders, so the footer promises nothing the route does not own —
 * no external link, no unbuilt destination, no Showcase surface.
 *
 * `Capabilities` points at `#capability-story` (the named capability section),
 * not the hero's unlabelled `#capabilities` strip: the footer is a page index,
 * and an index entry should land on the section that carries the heading.
 * `#next-step` is deliberately absent — the closing CTA sits immediately above
 * the footer, so a link back to it would be a link to the reader's own
 * position.
 */
const FOOTER_LINKS = [
  { href: "#overview", key: "footerOverview" },
  { href: "#capability-story", key: "footerCapabilities" },
  { href: "#architecture", key: "footerArchitecture" },
  { href: "#bilingual-design", key: "footerBilingualDesign" },
  { href: "#quality", key: "footerQuality" },
  { href: "#faq", key: "footerFaq" },
] as const;

// Shared by the footer brand lockup and every footer destination: a focus ring
// on the semantic ring token, and the same recede-on-hover feedback the header
// navigation uses (SiteShellNavItem) so both chrome regions read as one system.
const FOOTER_FOCUS_RING =
  "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * Production public-site composition for the marketing route group.
 *
 * This is a client boundary because SiteShell's localized labels, the header,
 * controls, and footer must all follow the active client-side locale. Route
 * children remain server-owned slots and do not enter this module's client
 * graph.
 *
 * It is also the marketing route's single reveal owner: one observer created
 * here serves every reveal unit the page renders, scoped to the main region
 * (see `use-marketing-reveal.ts`). Owning it at this level adds no client
 * boundary — this module is already one — and keeps the page's sections free
 * of browser-API code. Anchor scrolling is not this module's concern: it is a
 * global foundation contract in `src/app/globals.css`.
 */
export function MarketingShell({ children }: MarketingShellProps) {
  const t = useTranslations("marketing");
  const tShell = useTranslations("shell");
  const mainRef = useRef<HTMLElement | null>(null);

  useMarketingReveal(mainRef);

  const navigationItems = [
    { href: "#overview", label: t("navOverview") },
    { href: "#capability-story", label: t("navCapabilities") },
    { href: "#architecture", label: t("navArchitecture") },
    { href: "#quality", label: t("navQuality") },
  ] as const;

  return (
    <SiteShell collapseBelow="md" skipLinkLabel={tShell("skipLink")}>
      <SiteShellHeader>
        <Link
          href="/"
          className="me-4 flex min-w-0 items-center gap-2.5 rounded-md text-body font-bold whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-subheading"
        >
          <BrandMark className="size-7 sm:size-8" />
          <span className="truncate">{t("brand")}</span>
        </Link>

        <SiteShellNav label={t("navLabel")} closeLabel={tShell("closeNav")}>
          {navigationItems.map(({ href, label }) => (
            <SiteShellNavItem key={href} href={href}>
              {label}
            </SiteShellNavItem>
          ))}

          <div className="mt-3 flex items-center gap-1 border-t pt-4 md:hidden">
            <LocaleControl />
            <ThemeControl />
          </div>
        </SiteShellNav>

        <div className="ms-auto flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1 max-md:hidden">
            <LocaleControl />
            <ThemeControl />
          </div>
          <SiteShellNavTrigger aria-label={tShell("openNav")} />
        </div>
      </SiteShellHeader>

      <SiteShellMain ref={mainRef}>{children}</SiteShellMain>

      <SiteShellFooter>
        {/* Stacks on narrow viewports and only becomes a two-column
            composition once the measure allows it; alignment is logical
            throughout, so English reads from the left edge and Arabic from the
            right with no conditional class. */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div data-slot="marketing-footer-identity" className="max-w-prose">
            <Link
              href="/"
              className={cn(
                "inline-flex items-center gap-2.5 text-subheading font-bold",
                FOOTER_FOCUS_RING,
              )}
            >
              <BrandMark className="size-7" />
              {t("brand")}
            </Link>
            <p className="mt-3 text-small text-muted-foreground">{t("footerContext")}</p>
          </div>

          <nav data-slot="marketing-footer-nav" aria-label={t("footerNavLabel")}>
            {/* Two comfortable columns rather than a dense sitemap: one column
                while stacked, two once there is room, in both compositions. */}
            <ul className="grid gap-x-10 gap-y-3 text-small font-semibold sm:grid-cols-2">
              {FOOTER_LINKS.map(({ href, key }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "inline-block transition-colors hover:text-muted-foreground",
                      FOOTER_FOCUS_RING,
                    )}
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* The closing status line sits beneath a semantic hairline: a quiet
            statement of fact, not a second call to action. */}
        <p
          data-slot="marketing-footer-status"
          className="mt-10 border-t pt-6 text-supporting text-muted-foreground"
        >
          {t("footerStatus")}
        </p>
      </SiteShellFooter>
    </SiteShell>
  );
}
