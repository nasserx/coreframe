import type { ReactNode } from "react";
import Link from "next/link";

import { BrandMark } from "@/components/ui/brand-mark";
import { Container } from "@/components/ui/container";
import {
  SiteShell,
  SiteShellFooter,
  SiteShellHeader,
  SiteShellMain,
  SiteShellNav,
  SiteShellNavItem,
  SiteShellNavTrigger,
} from "@/components/ui/site-shell";
import { Stack } from "@/components/ui/stack";
import { ThemeControl } from "@/components/ui/theme-control";
import { DirectionControl } from "@/features/showcase/components/direction-control";
import { UnavailableCta } from "@/features/showcase/components/unavailable-cta";

/*
 * The auth CTAs are the action-shaped half of the unavailable pattern
 * (docs/LAYOUT.md §6): the showcase has no authentication, but a button that
 * looks interactive must behave interactively, so UnavailableCta renders a
 * real <button> with full hover/active/focus that toasts an explanation on
 * click — never a dead no-op. They also render at real widths, keeping the
 * collapse-breakpoint measurement honest. Header CTAs sit at the baseline
 * `default` size (h-8): the 2026-09 pass brought the cluster down a step from
 * lg/h-9 (docs/DESIGN_TOKENS.md § Control height) — h-9 read a touch oversized
 * for the flat identity, and h-8, the documented baseline, sits comfortably in
 * the tall (h-16) bar with the utility toggles aligned to the same height.
 */

/*
 * SiteShell reference composition — the marketing-site counterpart to the
 * `(app)` group's AppShell layout. Unlike the AppShell header (a pinned
 * LTR instrument panel), this whole shell IS the inspected canvas, so it
 * mirrors under the direction toggle like any product site would.
 *
 * "Pricing" deliberately has no href: it demonstrates the unavailable-
 * destination pattern every new product needs on day one.
 */
export default function ShowcaseSiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // collapseBelow="lg", measured, not assumed (docs/LAYOUT.md §6): the
    // larger brand, the 14px nav, the toggles, and the two auth CTAs put the
    // bar's min-content just over ~900px — still inside the ~976px available
    // at the `lg` (1024px) breakpoint, so `lg` holds and the overflow sweep
    // confirms it. The 2026-09 pass dropped the CTAs from lg/h-9 to the
    // baseline h-8 and removed their px-3.5 (default px-2.5): both are small
    // changes and the second only narrows the bar, so `lg` still holds — the
    // overflow sweep confirms `lg` fits and `md` would overflow.
    <SiteShell collapseBelow="lg">
      <SiteShellHeader>
        {/* The brand anchors the bar as its own cluster: two type steps
            above the nav items (text-subheading vs text-small) at bold,
            with clear breathing room (me-4) before navigation begins. It
            steps down to text-body below `sm`, where the bar is only brand
            + trigger and the full 20px wordmark overflows a 320px bar in
            RTL — the anchoring only matters once nav/actions share the bar.
            Nav links are secondary wayfinding — 14px, medium weight. */}
        <Link
          href="/showcase"
          className="me-4 flex items-center gap-2.5 rounded-md text-body font-bold whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-subheading"
        >
          <BrandMark className="size-6" />
          Foundation Showcase
        </Link>
        <SiteShellNav label="Site sections">
          <SiteShellNavItem href="/showcase/site">Overview</SiteShellNavItem>
          <SiteShellNavItem href="/showcase/layout">Layout</SiteShellNavItem>
          <SiteShellNavItem>Pricing</SiteShellNavItem>
          {/* The auth actions live in the drawer below `md` (measured: the
              CTAs beside the brand overflow the bar until ~768px), so the
              drawer is their home there — the same live, self-explaining CTAs
              as the bar (full-width in the column), not dead text. Hidden from
              `md` up, where the pair lives in the bar. */}
          <div className="mt-2 flex flex-col gap-2 border-t pt-2 md:hidden">
            <UnavailableCta variant="outline" label="Log in" className="w-full" />
            <UnavailableCta label="Get started" className="w-full" />
          </div>
        </SiteShellNav>
        <div className="ms-auto flex items-center gap-3">
          {/* Two coherent sub-groups, centre-aligned in one cluster: the
              utility toggles (inspection chrome) then the auth pair (secondary
              before primary; the primary CTA holds the end). The 2026-09 pass
              brought the WHOLE cluster down to the baseline h-8 — the toggles
              track the default-size CTAs, so every control shares one optical
              height (docs/DESIGN_TOKENS.md § Control height). h-8 reads right
              here: h-9 was a touch oversized for the flat identity, and h-8 is
              the documented baseline, comfortable in the tall (h-16) bar. The
              gap-3 separates the two families. Reveal breakpoints are measured,
              not uniform: the toggles fit beside the brand from `sm`, the CTA
              pair only from `md` (below it they move to the drawer) — the
              overflow sweep fails this layout otherwise. The e2e matrix drives
              theme/direction programmatically, so narrow coverage holds. */}
          <div className="flex items-center gap-2 max-sm:hidden">
            <DirectionControl />
            <ThemeControl />
          </div>
          <div className="flex items-center gap-2 max-md:hidden">
            <UnavailableCta variant="outline" label="Log in" />
            <UnavailableCta label="Get started" />
          </div>
          <SiteShellNavTrigger />
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
            <h2 className="text-small font-medium">Explore</h2>
            <ul className="flex flex-col gap-1">
              <li>
                <Link
                  href="/showcase"
                  className="text-small text-muted-foreground hover:text-foreground"
                >
                  Showcase index
                </Link>
              </li>
              <li>
                <Link
                  href="/showcase/tokens"
                  className="text-small text-muted-foreground hover:text-foreground"
                >
                  Tokens
                </Link>
              </li>
            </ul>
          </Stack>
          <Stack gap="sm">
            <h2 className="text-small font-medium">Product</h2>
            <ul className="flex flex-col gap-1">
              <li>
                {/* The unavailable pattern works in footer columns too:
                    className strips the bar-item padding and weight. */}
                <SiteShellNavItem className="px-0 py-0 font-normal">Pricing</SiteShellNavItem>
              </li>
              <li>
                <SiteShellNavItem className="px-0 py-0 font-normal">Changelog</SiteShellNavItem>
              </li>
            </ul>
          </Stack>
          <Stack gap="sm">
            <h2 className="text-small font-medium">Foundation</h2>
            <p className="max-w-prose text-small text-muted-foreground">
              Structural chrome only — restyle through tokens and className.
            </p>
          </Stack>
        </div>
      </SiteShellFooter>
    </SiteShell>
  );
}
