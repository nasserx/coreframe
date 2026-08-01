import type { ReactNode } from "react";

import { marketingReveal } from "./marketing-motion";

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
 *
 * Every post-hero section opens with this lockup and no pre-hero content does,
 * so marking it as a reveal unit here is what gives each major section its
 * single entrance — the hero's initially visible content is untouched.
 */
export function MarketingSectionIntro({
  eyebrow,
  headingId,
  title,
  lead,
}: MarketingSectionIntroProps) {
  return (
    <div
      {...marketingReveal("mx-auto max-w-prose text-center")}
      data-slot="marketing-section-intro"
    >
      <p className="text-small font-semibold text-link">{eyebrow}</p>
      <h2 id={headingId} className="mt-3 text-heading sm:text-title">
        {title}
      </h2>
      <p className="mt-5 text-body-lg">{lead}</p>
    </div>
  );
}
