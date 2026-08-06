"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { BrandMark } from "@/components/ui/brand-mark";
import { Container } from "@/components/ui/container";
import { LocaleControl } from "@/components/ui/locale-control";
import {
  SiteShell,
  SiteShellFooter,
  SiteShellHeader,
  SiteShellMain,
  SiteShellNav,
  SiteShellNavItem,
  SiteShellNavMenu,
  SiteShellNavMenuItem,
  SiteShellNavTrigger,
} from "@/components/ui/site-shell";
import { Stack } from "@/components/ui/stack";
import { ThemeControl } from "@/components/ui/theme-control";
import { useTranslations } from "@/core/providers/locale-provider";
import { UnavailableCta } from "@/features/showcase/components/unavailable-cta";

/*
 * The auth CTAs are the action-shaped half of the unavailable pattern
 * (docs/LAYOUT.md §6): the showcase has no authentication, but a button that
 * looks interactive must behave interactively, so UnavailableCta renders a
 * real <button> with full hover/active/focus that toasts an explanation on
 * click — never a dead no-op. They also render at real widths, keeping the
 * collapse-breakpoint measurement honest. Header CTAs use the authored
 * navigation treatment (`lg`/h-9 with px-5); drawer copies use the authored
 * mobile treatment (h-10). The icon-only utility toggles use the primitive's
 * `icon-lg` square, so they share the CTA's h-9 height and the cluster reads as
 * one row rather than two heights.
 */

/*
 * SiteShell reference composition — the marketing-site counterpart to the
 * `(app)` group's AppShell layout, AND the message-translation proof surface:
 * a "use client" layout whose chrome reads from `useTranslations`, so
 * selecting Arabic in the LocaleControl swaps every string here, mirrors the
 * whole shell to RTL (direction follows the locale through LOCALE_INFO), and
 * renders Arabic in Tajawal — the top bar included. Unlike the AppShell
 * header (a pinned LTR instrument panel), this whole shell IS the inspected
 * canvas, so it mirrors under the selected language like any product site.
 *
 * "Pricing" deliberately has no href: it demonstrates the unavailable-
 * destination pattern every new product needs on day one.
 */
export default function ShowcaseSiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  const t = useTranslations("site");
  const tShell = useTranslations("shell");

  return (
    // collapseBelow="lg", measured, not assumed (docs/LAYOUT.md §6): above the
    // line the bar carries the brand, the language + theme toggles, and the two
    // auth CTAs; below it, nav AND auth collapse into the drawer, leaving only
    // brand + toggles + trigger. The overflow sweep (English, both directions —
    // `overflow.spec.ts`) confirms the bar fits at every width; the Arabic bar
    // is covered separately in `i18n.spec.ts`. Note both toggles are icon-only
    // squares, so the cluster's width is identical in every locale.
    <SiteShell collapseBelow="lg" skipLinkLabel={tShell("skipLink")}>
      <SiteShellHeader>
        {/* The brand anchors the bar as its own cluster: two type steps
            above the nav items (text-subheading vs text-small) at bold.
            SiteShell owns its responsive logical-end breathing room. The
            brand steps down to text-body below `sm`, where the bar is only
            brand + trigger. Nav links are secondary wayfinding — 14px,
            semibold. */}
        <Link
          href="/showcase"
          className="flex items-center gap-2.5 rounded-md text-body font-bold whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-subheading"
        >
          <BrandMark className="size-7 sm:size-8" />
          {t("brand")}
        </Link>
        <SiteShellNav label={t("navLabel")} closeLabel={tShell("closeNav")}>
          {/* A dropdown of real showcase destinations (docs/LAYOUT.md §6):
              every link resolves to an existing route, and "Changelog"
              demonstrates the unavailable-destination pattern INSIDE the
              panel. Below the collapse line this same set renders in the
              drawer as a labelled group. */}
          <SiteShellNavMenu label={t("exploreMenu")}>
            <SiteShellNavMenuItem
              href="/showcase/site"
              title={t("overviewTitle")}
              description={t("overviewDescription")}
            />
            <SiteShellNavMenuItem
              href="/showcase/layout"
              title={t("layoutTitle")}
              description={t("layoutDescription")}
            />
            <SiteShellNavMenuItem
              href="/showcase/tokens"
              title={t("tokensTitle")}
              description={t("tokensDescription")}
            />
            <SiteShellNavMenuItem
              href="/showcase/navigation"
              title={t("navigationTitle")}
              description={t("navigationDescription")}
            />
            <SiteShellNavMenuItem
              href="/showcase/data"
              title={t("dataTitle")}
              description={t("dataDescription")}
            />
            <SiteShellNavMenuItem
              title={t("changelogTitle")}
              description={t("changelogDescription")}
              unavailableLabel={tShell("unavailable")}
            />
          </SiteShellNavMenu>
          <SiteShellNavItem unavailableLabel={tShell("unavailable")}>
            {t("pricing")}
          </SiteShellNavItem>
          {/* The auth actions live in the drawer below `lg` — the collapse
              breakpoint — the same live, self-explaining CTAs as the bar
              (full-width in the column). */}
          <div className="mt-2 flex flex-col gap-2 border-t pt-2 lg:hidden">
            <UnavailableCta
              variant="outline"
              size="lg"
              label={t("logIn")}
              className="h-10 w-full px-5 font-semibold"
            />
            <UnavailableCta
              size="lg"
              label={t("getStarted")}
              className="h-10 w-full px-5 font-semibold"
            />
          </div>
        </SiteShellNav>
        <div className="ms-auto flex items-center gap-3">
          {/* Two coherent sub-groups on ONE h-9 height: the icon-only utility
              toggles (language + theme, `icon-lg` squares) then the navigation
              CTA pair (docs/DESIGN_TOKENS.md § Control height). Reveal
              breakpoints are measured, not uniform: the
              controls fit beside the brand from `sm`; the CTA pair only from
              `lg` — the collapse breakpoint — since the toggles plus the pair
              overflow the bar between `md` and `lg` (the overflow sweep proves
              it), so below the
              collapse line the auth actions live in the drawer with the nav.
              The LocaleControl renders nothing on a single-locale deployment. */}
          <div className="flex items-center gap-1 max-sm:hidden">
            <LocaleControl />
            <ThemeControl />
          </div>
          <div className="flex items-center gap-2 max-lg:hidden">
            <UnavailableCta
              variant="outline"
              size="lg"
              label={t("logIn")}
              className="px-5 font-semibold"
            />
            <UnavailableCta size="lg" label={t("getStarted")} className="px-5 font-semibold" />
          </div>
          <SiteShellNavTrigger aria-label={tShell("openNav")} />
        </div>
      </SiteShellHeader>
      <SiteShellMain>
        <Container className="py-10">
          <Stack gap="xl">{children}</Stack>
        </Container>
      </SiteShellMain>
      <SiteShellFooter>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Stack gap="sm">
            <h2 className="text-small font-semibold">{t("footerExplore")}</h2>
            <ul className="flex flex-col gap-1">
              <li>
                <Link
                  href="/showcase"
                  className="text-small text-muted-foreground hover:text-foreground"
                >
                  {t("footerIndex")}
                </Link>
              </li>
              <li>
                <Link
                  href="/showcase/tokens"
                  className="text-small text-muted-foreground hover:text-foreground"
                >
                  {t("footerTokens")}
                </Link>
              </li>
            </ul>
          </Stack>
          <Stack gap="sm">
            <h2 className="text-small font-semibold">{t("footerProduct")}</h2>
            <ul className="flex flex-col gap-1">
              <li>
                {/* The unavailable pattern works in footer columns too:
                    className strips the bar-item padding and weight. */}
                <SiteShellNavItem
                  className="px-0 py-0 font-medium"
                  unavailableLabel={tShell("unavailable")}
                >
                  {t("pricing")}
                </SiteShellNavItem>
              </li>
              <li>
                <SiteShellNavItem
                  className="px-0 py-0 font-medium"
                  unavailableLabel={tShell("unavailable")}
                >
                  {t("footerChangelog")}
                </SiteShellNavItem>
              </li>
            </ul>
          </Stack>
          <Stack gap="sm">
            <h2 className="text-small font-semibold">{t("footerFoundation")}</h2>
            <p className="max-w-prose text-small text-muted-foreground">
              {t("footerFoundationNote")}
            </p>
          </Stack>
        </div>
      </SiteShellFooter>
    </SiteShell>
  );
}
