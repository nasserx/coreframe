import type { ReactNode } from "react";
import Link from "next/link";

import { BrandMark } from "@/components/ui/brand-mark";
import { buttonVariants } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

/*
 * Demo auth affordances. The showcase has no authentication (a ROADMAP
 * item waiting on a real product), so these are the nav's unavailable-
 * destination pattern in button clothing: real button styling (the bar's
 * collapse breakpoint is measured from real widths), but a non-focusable
 * <span> with an sr-only availability hint — never a dead link, never a
 * no-op <button>. `pointer-events-none` removes the hover/active
 * pretence along with the pointer cursor.
 */
function UnavailableAction({
  variant,
  children,
}: Readonly<{ variant?: "outline"; children: ReactNode }>) {
  return (
    <span
      data-unavailable=""
      className={cn(buttonVariants({ variant }), "pointer-events-none select-none")}
    >
      {children}
      <span className="sr-only"> — Not yet available</span>
    </span>
  );
}

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
    // auth pair widened the bar past what `md` could hold — brand + nav +
    // controls + both actions need more than 768px of min-content, so the
    // navigation collapses below `lg`.
    <SiteShell collapseBelow="lg">
      <SiteShellHeader>
        {/* The brand dominates the bar: one full type step above the nav
            items (text-body vs text-small) at bold — nav links are
            secondary wayfinding and stay muted/medium. */}
        <Link
          href="/showcase"
          className="flex items-center gap-2 rounded-md text-body font-bold whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <BrandMark />
          Foundation Showcase
        </Link>
        <SiteShellNav label="Site sections">
          <SiteShellNavItem href="/showcase/site">Overview</SiteShellNavItem>
          <SiteShellNavItem href="/showcase/layout">Layout</SiteShellNavItem>
          <SiteShellNavItem>Pricing</SiteShellNavItem>
          {/* Below `sm` the bar keeps only brand + trigger (measured: even
              the compact auth pair does not fit beside the brand at 320px),
              so the drawer is the auth actions' home there — same
              unavailable pattern, plain items. Hidden from `sm` up: at
              those widths the pair lives in the bar. */}
          <div className="mt-2 flex flex-col border-t pt-2 sm:hidden">
            <SiteShellNavItem>Log in</SiteShellNavItem>
            <SiteShellNavItem>Get started</SiteShellNavItem>
          </div>
        </SiteShellNav>
        <div className="ms-auto flex items-center gap-2">
          {/* One h-8 cluster: inspection controls, then the demo auth pair
              (secondary before primary; the primary CTA holds the end
              position). Everything here collapses below `sm` — measured,
              not assumed; the overflow sweep fails this layout otherwise.
              The e2e matrix drives theme/direction programmatically, so
              narrow-viewport coverage is unaffected. */}
          <div className="flex items-center gap-2 max-sm:hidden">
            <DirectionControl />
            <ThemeControl />
            <UnavailableAction variant="outline">Log in</UnavailableAction>
            <UnavailableAction>Get started</UnavailableAction>
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
