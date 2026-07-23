import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Stack } from "@/components/ui/stack";
import { ShowcaseSection } from "@/features/showcase/components/showcase-section";

export const metadata: Metadata = {
  title: "Site shell",
};

export default function SitePage() {
  return (
    <>
      {/*
        Hero, not a PageHeader: this page demonstrates SiteShell as
        marketing chrome, so it leads the viewport with the identity's
        headline voice — display type, generous vertical breathing room,
        and the flat button pair (near-black primary + hairline outline).
      */}
      <Stack gap="lg" className="items-start py-16 sm:py-24">
        <Stack gap="md" className="items-start">
          <h1 className="max-w-prose text-title sm:text-display">
            The public shell, in its own voice.
          </h1>
          <p className="max-w-prose text-body-lg">
            This page renders inside the SiteShell — the public-site counterpart to the AppShell the
            rest of the showcase uses: a sticky top bar with brand, navigation, and actions, a
            footer with grouped link columns, and the same skip link and drawer mechanics.
            Contracts: docs/LAYOUT.md.
          </p>
        </Stack>
        <div className="flex flex-wrap items-center gap-3">
          {/* Navigation styled as buttons: buttonVariants on real Links,
              so the elements keep link semantics (role, middle-click,
              focus behavior). Button + render would re-brand them
              role="button". */}
          <Link href="/showcase/layout" className={buttonVariants({ size: "lg" })}>
            Read the layout contract
          </Link>
          <Link href="/showcase" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Back to the showcase
          </Link>
        </div>
      </Stack>
      <ShowcaseSection
        title="Responsive collapse"
        description="Below the collapse breakpoint the top-bar navigation moves into a modal drawer opened from the actions cluster — the same Base UI Dialog mechanics as the AppShell drawer: focus trap, Escape, backdrop dismissal, focus return, close on navigation."
      >
        <ul className="flex max-w-prose list-disc flex-col gap-2 ps-5 text-small">
          <li>
            The breakpoint is a prop (<code>collapseBelow</code>), not a constant. There is no width
            at which an unknown brand + navigation + actions row is guaranteed to fit — measure your
            own bar&apos;s content in every locale you ship, then pick the smallest screen it fits.
          </li>
          <li>
            A fully green build does not prove the bar fits: horizontal overflow is a runtime layout
            fact. The browser suite sweeps every route across the viewport range and fails when the
            page scrolls horizontally or the bar row overflows its container (
            <code>tests/e2e/overflow.spec.ts</code>).
          </li>
        </ul>
      </ShowcaseSection>
      <ShowcaseSection
        title="Unavailable destinations and actions"
        description="Two shapes, two treatments. A missing destination (“Pricing”, in the top bar and footer) has no href on purpose: it renders as non-interactive, non-focusable muted text with an sr-only availability hint — never a dead link, never a 404. An action-shaped affordance stays interactive and explains itself. Every new product has both on day one."
      >
        <p className="max-w-prose text-small">
          Tab through the header: focus moves from the brand through the real links and skips
          &ldquo;Pricing&rdquo; entirely; a screen reader announces it with its availability hint.
          When the destination ships, adding <code>href</code> turns the same item into a link with{" "}
          <code>aria-current</code> handling. The &ldquo;Log in&rdquo; and &ldquo;Get started&rdquo;
          actions take the other treatment: because a button that looks interactive must behave
          interactively, they are real buttons with full hover, active, and focus states that toast
          an explanation on activation — real widths for the collapse measurement, and no dead
          buttons.
        </p>
      </ShowcaseSection>
      <ShowcaseSection
        title="Landmarks and direction"
        description="banner, nav, main, and contentinfo landmarks; a skip link as the first focusable element; document-level scroll. All styling is logical, so the entire shell mirrors under dir=rtl — flip the direction control above to verify."
      >
        <p className="max-w-prose text-small">
          The shell is structural, not designed: it consumes the base background, border, and accent
          tokens (the <code>sidebar-*</code> set belongs to application chrome) and takes className
          on every part. Which shell to reach for when is documented in
          <code> docs/LAYOUT.md</code>.
        </p>
      </ShowcaseSection>
    </>
  );
}
