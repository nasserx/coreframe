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
      // size="lg" (h-9) + px-4: the reference gives header CTAs more
      // presence than the default control — taller with more horizontal
      // padding, still proportionate to the h-14 bar.
      className={cn(
        buttonVariants({ variant, size: "lg", className: "px-4" }),
        "pointer-events-none select-none",
      )}
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
    // larger brand, the 14px nav, and the h-9 auth buttons grew the bar's
    // min-content to ~915px — still inside the ~976px available at the `lg`
    // (1024px) breakpoint, so `lg` holds and the overflow sweep confirms it.
    // (Re-measured after the polish, not carried over on assumption.)
    <SiteShell collapseBelow="lg">
      <SiteShellHeader>
        {/* The brand anchors the bar as its own cluster: two type steps
            above the nav items (text-subheading vs text-small) at bold,
            with clear breathing room (me-4) before navigation begins. It
            steps down to text-body below `sm`, where the bar is only brand
            + trigger and the full 20px wordmark overflows a 320px bar in
            RTL — the anchoring only matters once nav/actions share the bar.
            Nav links are secondary wayfinding — 14px, normal weight. */}
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
              enlarged h-9 CTAs overflow the bar beside the brand until
              ~768px), so the drawer is their home there — same unavailable
              pattern, plain items. Hidden from `md` up, where the pair
              lives in the bar. */}
          <div className="mt-2 flex flex-col border-t pt-2 md:hidden">
            <SiteShellNavItem>Log in</SiteShellNavItem>
            <SiteShellNavItem>Get started</SiteShellNavItem>
          </div>
        </SiteShellNav>
        <div className="ms-auto flex items-center gap-3">
          {/* Two coherent sub-groups, centre-aligned in one cluster: the
              utility toggles (inspection chrome, kept at their compact
              intrinsic ~h-8 — deliberately not scaled up; a segmented
              control blown up to h-9 reads chunky, and the reference gives
              CTAs more presence than utilities) then the h-9 auth pair
              (secondary before primary; the primary CTA holds the end).
              The gap-3 separates the two families; heights differ by design
              (actions > utilities), centre-aligned so it reads intentional.
              Reveal breakpoints are measured, not uniform: the compact
              toggles fit beside the brand from `sm`, but the enlarged CTAs
              only fit from `md` (below it they move to the drawer) — the
              overflow sweep fails this layout otherwise. The e2e matrix
              drives theme/direction programmatically, so narrow coverage
              holds. */}
          <div className="flex items-center gap-2 max-sm:hidden">
            <DirectionControl />
            <ThemeControl />
          </div>
          <div className="flex items-center gap-2 max-md:hidden">
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
