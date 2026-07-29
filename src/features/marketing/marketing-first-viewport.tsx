"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CheckIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useTranslations } from "@/core/providers/locale-provider";

export type MarketingFirstViewportProps = Readonly<{
  preview: ReactNode;
}>;

/**
 * The translated first marketing batch: hero plus the compact evidence strip
 * targeted by its primary action. The preview is supplied by the Server
 * Component page so decorative visual markup does not enter this client graph.
 */
export function MarketingFirstViewport({ preview }: MarketingFirstViewportProps) {
  const t = useTranslations("marketing");

  const notes = [t("heroNoteArchitecture"), t("heroNoteThemes"), t("heroNoteBilingual")];
  const capabilities = [
    {
      title: t("capabilityThemesTitle"),
      description: t("capabilityThemesDescription"),
      markerClassName: "bg-primary",
    },
    {
      title: t("capabilityBilingualTitle"),
      description: t("capabilityBilingualDescription"),
      markerClassName: "bg-info",
    },
    {
      title: t("capabilityStaticTitle"),
      description: t("capabilityStaticDescription"),
      markerClassName: "bg-success",
    },
    {
      title: t("capabilityQualityTitle"),
      description: t("capabilityQualityDescription"),
      markerClassName: "bg-warning",
    },
  ] as const;

  return (
    <>
      <section id="overview" aria-labelledby="marketing-heading">
        <Container>
          <div className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16">
            <div className="flex min-w-0 flex-col items-start gap-8">
              <div className="flex flex-col items-start gap-4">
                <p className="inline-flex items-center gap-2 rounded-md border bg-surface px-3 py-1.5 text-small font-semibold">
                  <span aria-hidden="true" className="size-2 rounded-sm bg-info" />
                  {t("eyebrow")}
                </p>
                <h1 id="marketing-heading" className="max-w-prose text-title sm:text-display">
                  {t("heroTitle")}
                </h1>
                <p className="max-w-prose text-body-lg">{t("heroLead")}</p>
              </div>

              <Link
                href="#capabilities"
                className={buttonVariants({ size: "lg", className: "h-10 px-6 font-semibold" })}
              >
                {t("heroPrimaryCta")}
              </Link>

              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-small text-muted-foreground">
                {notes.map((note) => (
                  <li key={note} className="inline-flex items-center gap-2">
                    <CheckIcon aria-hidden="true" className="size-4 text-info" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">{preview}</div>
          </div>
        </Container>
      </section>

      <section
        id="capabilities"
        aria-labelledby="capabilities-heading"
        className="border-y bg-surface"
      >
        <Container className="py-8 sm:py-10">
          <h2 id="capabilities-heading" className="sr-only">
            {t("capabilitiesHeading")}
          </h2>
          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map(({ title, description, markerClassName }) => (
              <div key={title} className="min-w-0">
                <dt className="flex items-center gap-2 text-small font-semibold">
                  <span
                    aria-hidden="true"
                    className={`size-2 shrink-0 rounded-sm ${markerClassName}`}
                  />
                  {title}
                </dt>
                <dd className="mt-2 text-supporting text-muted-foreground">{description}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>
    </>
  );
}
