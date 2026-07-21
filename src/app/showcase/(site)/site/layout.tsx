import type { ReactNode } from "react";
import Link from "next/link";

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
    <SiteShell collapseBelow="md">
      <SiteShellHeader>
        <Link
          href="/showcase"
          className="rounded-md text-small font-semibold whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Foundation Showcase
        </Link>
        <SiteShellNav label="Site sections">
          <SiteShellNavItem href="/showcase/site">Overview</SiteShellNavItem>
          <SiteShellNavItem href="/showcase/layout">Layout</SiteShellNavItem>
          <SiteShellNavItem>Pricing</SiteShellNavItem>
        </SiteShellNav>
        <div className="ms-auto flex items-center gap-3">
          {/* Measured, not assumed (docs/LAYOUT.md §6): brand + both
              inspection controls exceed the bar below `sm`, so the controls
              collapse there — the overflow sweep fails this layout
              otherwise. The e2e matrix drives theme/direction
              programmatically, so narrow-viewport coverage is unaffected. */}
          <div className="flex items-center gap-3 max-sm:hidden">
            <DirectionControl />
            <ThemeControl />
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
