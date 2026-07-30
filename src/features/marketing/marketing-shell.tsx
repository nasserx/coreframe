"use client";

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

export type MarketingShellProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Production public-site composition for the marketing route group.
 *
 * This is a client boundary because SiteShell's localized labels, the header,
 * controls, and footer must all follow the active client-side locale. Route
 * children remain server-owned slots and do not enter this module's client
 * graph.
 */
export function MarketingShell({ children }: MarketingShellProps) {
  const t = useTranslations("marketing");
  const tShell = useTranslations("shell");
  const tTheme = useTranslations("theme");

  const themeLabels = {
    light: tTheme("light"),
    dark: tTheme("dark"),
    system: tTheme("system"),
  } as const;

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

          <div className="mt-3 flex flex-col items-start gap-3 border-t pt-4 md:hidden">
            <LocaleControl />
            <ThemeControl aria-label={tTheme("label")} optionLabels={themeLabels} />
          </div>
        </SiteShellNav>

        <div className="ms-auto flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 max-md:hidden">
            <LocaleControl />
            <ThemeControl aria-label={tTheme("label")} optionLabels={themeLabels} />
          </div>
          <SiteShellNavTrigger aria-label={tShell("openNav")} />
        </div>
      </SiteShellHeader>

      <SiteShellMain>{children}</SiteShellMain>

      <SiteShellFooter>
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
          <div className="max-w-prose">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-md text-subheading font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <BrandMark className="size-7" />
              {t("brand")}
            </Link>
            <p className="mt-3 text-small text-muted-foreground">{t("footerContext")}</p>
          </div>

          <nav aria-label={t("footerNavLabel")}>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-small font-semibold">
              <li>
                <Link
                  href="#overview"
                  className="rounded-md transition-colors outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t("footerOverview")}
                </Link>
              </li>
              <li>
                <Link
                  href="#capabilities"
                  className="rounded-md transition-colors outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t("footerCapabilities")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-8 border-t pt-6 text-supporting text-muted-foreground">
          {t("footerStatus")}
        </p>
      </SiteShellFooter>
    </SiteShell>
  );
}
