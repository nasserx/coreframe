import type { Metadata } from "next";

import { ShowcasePageHeader } from "@/features/showcase/components/showcase-page-header";
import { ShowcaseSection } from "@/features/showcase/components/showcase-section";

export const metadata: Metadata = {
  title: "Site shell",
};

export default function SitePage() {
  return (
    <>
      <ShowcasePageHeader
        title="Site shell"
        description="This page renders inside the SiteShell — the public-site counterpart to the AppShell the rest of the showcase uses: a sticky top bar with brand, navigation, and actions, a footer with grouped link columns, and the same skip link and drawer mechanics. Contracts: docs/LAYOUT.md."
      />
      <ShowcaseSection
        title="Responsive collapse"
        description="Below the collapse breakpoint the top-bar navigation moves into a modal drawer opened from the actions cluster — the same Base UI Dialog mechanics as the AppShell drawer: focus trap, Escape, backdrop dismissal, focus return, close on navigation."
      >
        <ul className="flex max-w-prose list-disc flex-col gap-2 ps-5 text-small text-muted-foreground">
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
        title="Unavailable destinations"
        description="“Pricing” in the top bar and the footer has no href on purpose: an item without a destination renders as non-interactive, non-focusable muted text with an sr-only availability hint — never a dead link, never a 404. Every new product has unbuilt destinations on day one."
      >
        <p className="max-w-prose text-small text-muted-foreground">
          Tab through the header: focus moves from the brand through the real links and skips
          &ldquo;Pricing&rdquo; entirely; a screen reader announces it with its availability hint.
          When the destination ships, adding <code>href</code> turns the same item into a link with{" "}
          <code>aria-current</code> handling.
        </p>
      </ShowcaseSection>
      <ShowcaseSection
        title="Landmarks and direction"
        description="banner, nav, main, and contentinfo landmarks; a skip link as the first focusable element; document-level scroll. All styling is logical, so the entire shell mirrors under dir=rtl — flip the direction control above to verify."
      >
        <p className="max-w-prose text-small text-muted-foreground">
          The shell is structural, not designed: it consumes the base background, border, and accent
          tokens (the <code>sidebar-*</code> set belongs to application chrome) and takes className
          on every part. Which shell to reach for when is documented in
          <code> docs/LAYOUT.md</code>.
        </p>
      </ShowcaseSection>
    </>
  );
}
