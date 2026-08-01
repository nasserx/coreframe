"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useTranslations } from "@/core/providers/locale-provider";

import { marketingReveal } from "./marketing-motion";
import { MarketingSectionIntro } from "./marketing-section-intro";

/**
 * Closing marketing step. It is a client boundary for the same reason as the
 * sections above it: every visible string must follow the live locale runtime.
 * It owns no state, no browser API, and no event handling.
 *
 * Both actions are plain same-page anchors to sections this page already
 * renders, so the closing step promises nothing the repository does not have —
 * no unavailable affordance, no Showcase destination, no route that does not
 * exist. Their physical order follows the document direction because DOM order
 * is the only ordering expressed here.
 */
export function MarketingClosingCta() {
  const t = useTranslations("marketing");

  return (
    // Continues the section rhythm: `faq` sits on the background plane, so the
    // closing step takes the surface plane and the footer's own top hairline
    // closes it (docs/LAYOUT.md §6).
    <section id="next-step" aria-labelledby="next-step-heading" className="border-t bg-surface">
      <Container className="py-20 sm:py-24">
        <MarketingSectionIntro
          eyebrow={t("closingEyebrow")}
          headingId="next-step-heading"
          title={t("closingTitle")}
          lead={t("closingDescription")}
        />

        <div
          {...marketingReveal("mt-10 flex flex-wrap items-center justify-center gap-3")}
          data-slot="marketing-closing-actions"
        >
          <Link
            href="#architecture"
            className={buttonVariants({ size: "lg", className: "h-12 px-7 font-semibold" })}
          >
            {t("closingPrimaryAction")}
          </Link>
          <Link
            href="#quality"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "h-12 px-7 font-semibold",
            })}
          >
            {t("closingSecondaryAction")}
          </Link>
        </div>
      </Container>
    </section>
  );
}
