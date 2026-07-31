import type { ReactNode } from "react";

export type MarketingSectionIntroProps = Readonly<{
  eyebrow: string;
  headingId: string;
  title: ReactNode;
  lead: ReactNode;
}>;

/**
 * Feature-owned introduction for post-hero marketing sections. It keeps the
 * heading hierarchy, lead measure, and centered alignment consistent without
 * changing the shared Container or typography contracts.
 */
export function MarketingSectionIntro({
  eyebrow,
  headingId,
  title,
  lead,
}: MarketingSectionIntroProps) {
  return (
    <div data-slot="marketing-section-intro" className="mx-auto max-w-prose text-center">
      <p className="text-small font-semibold text-link">{eyebrow}</p>
      <h2 id={headingId} className="mt-3 text-heading sm:text-title">
        {title}
      </h2>
      <p className="mt-5 text-body-lg">{lead}</p>
    </div>
  );
}
