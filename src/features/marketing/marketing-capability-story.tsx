"use client";

import type { ReactNode } from "react";
import {
  AccessibilityIcon,
  BlocksIcon,
  BracesIcon,
  LanguagesIcon,
  type LucideIcon,
  MonitorSmartphoneIcon,
  PackageCheckIcon,
  PaletteIcon,
  RouteIcon,
  ShieldCheckIcon,
  TestTubeDiagonalIcon,
} from "lucide-react";

import { Container } from "@/components/ui/container";
import { useTranslations } from "@/core/providers/locale-provider";

import {
  ArchitectureSpecimen,
  BilingualSystemSpecimen,
  type MarketingSpecimenStep,
  QualityPipeline,
} from "./marketing-specimens";
import { MarketingSectionIntro } from "./marketing-section-intro";
import styles from "./marketing-capability-story.module.css";

type CenteredFeatureProps = Readonly<{
  eyebrow: string;
  headingId: string;
  title: ReactNode;
  lead: string;
  body: ReactNode;
  verificationLabel: string;
  verification: string;
  specimen: ReactNode;
}>;

type StoryCard = Readonly<{
  title: string;
  description: string;
  evidence: string;
  technologies: string;
  icon: LucideIcon;
}>;

function CenteredFeature({
  eyebrow,
  headingId,
  title,
  lead,
  body,
  verificationLabel,
  verification,
  specimen,
}: CenteredFeatureProps) {
  return (
    <Container data-slot="marketing-centered-feature" className="py-20 sm:py-24">
      <MarketingSectionIntro eyebrow={eyebrow} headingId={headingId} title={title} lead={lead} />
      <div
        data-slot="marketing-feature-copy"
        className="mx-auto mt-6 max-w-prose space-y-4 text-center text-body"
      >
        {body}
        <div className="mt-8 border-t pt-4">
          <p className="text-small font-semibold">{verificationLabel}</p>
          <p className="mt-1 text-supporting text-muted-foreground">{verification}</p>
        </div>
      </div>
      <div data-slot="marketing-feature-specimen" className="mx-auto mt-12 max-w-5xl min-w-0">
        {specimen}
      </div>
    </Container>
  );
}

function StoryCard({ title, description, evidence, technologies, icon: Icon }: StoryCard) {
  const t = useTranslations("marketing");

  return (
    <article
      data-slot="marketing-story-card"
      className={`${styles["storyCard"]} flex h-full min-w-0 flex-col items-start rounded-xl border bg-card p-6 text-start`}
    >
      <div
        data-slot="marketing-story-icon"
        className={`${styles["storyIcon"]} flex size-10 items-center justify-center self-start rounded-lg border bg-surface text-foreground`}
      >
        <Icon
          aria-hidden={true}
          data-slot="marketing-story-icon-glyph"
          className={`${styles["storyIconGlyph"]} size-5`}
        />
      </div>
      <div data-slot="marketing-story-technologies" className="mt-5 w-full text-start">
        <bdi dir="auto" className="text-caption font-semibold text-link">
          {technologies}
        </bdi>
      </div>
      <h3 data-slot="marketing-story-heading" className="mt-2 w-full text-start text-subheading">
        {title}
      </h3>
      <p data-slot="marketing-story-description" className="mt-3 w-full text-start text-small">
        {description}
      </p>
      <p
        data-slot="marketing-story-evidence"
        className="mt-6 w-full border-t pt-4 text-start text-supporting text-muted-foreground"
      >
        <span className="font-semibold text-foreground">{t("storyEvidenceLabel")}:</span> {evidence}
      </p>
    </article>
  );
}

/**
 * Second-batch marketing composition. It is a client boundary because every
 * visible claim and informative specimen must follow the existing live locale
 * runtime. It owns no state or browser API beyond that translation context.
 */
export function MarketingCapabilityStory() {
  const t = useTranslations("marketing");

  const capabilities: readonly StoryCard[] = [
    {
      title: t("storyArchitectureTitle"),
      description: t("storyArchitectureDescription"),
      evidence: t("storyArchitectureEvidence"),
      technologies: t("storyArchitectureTechnologies"),
      icon: RouteIcon,
    },
    {
      title: t("storyTokensTitle"),
      description: t("storyTokensDescription"),
      evidence: t("storyTokensEvidence"),
      technologies: t("storyTokensTechnologies"),
      icon: PaletteIcon,
    },
    {
      title: t("storyBilingualTitle"),
      description: t("storyBilingualDescription"),
      evidence: t("storyBilingualEvidence"),
      technologies: t("storyBilingualTechnologies"),
      icon: LanguagesIcon,
    },
    {
      title: t("storyShellTitle"),
      description: t("storyShellDescription"),
      evidence: t("storyShellEvidence"),
      technologies: t("storyShellTechnologies"),
      icon: MonitorSmartphoneIcon,
    },
    {
      title: t("storyStaticTitle"),
      description: t("storyStaticDescription"),
      evidence: t("storyStaticEvidence"),
      technologies: t("storyStaticTechnologies"),
      icon: BlocksIcon,
    },
    {
      title: t("storyQualityTitle"),
      description: t("storyQualityDescription"),
      evidence: t("storyQualityEvidence"),
      technologies: t("storyQualityTechnologies"),
      icon: TestTubeDiagonalIcon,
    },
  ];

  const architectureSteps: readonly MarketingSpecimenStep[] = [
    {
      kicker: t("architectureStepRouteKicker"),
      title: t("architectureStepRouteTitle"),
      description: t("architectureStepRouteDescription"),
    },
    {
      kicker: t("architectureStepStaticKicker"),
      title: t("architectureStepStaticTitle"),
      description: t("architectureStepStaticDescription"),
    },
    {
      kicker: t("architectureStepClientKicker"),
      title: t("architectureStepClientTitle"),
      description: t("architectureStepClientDescription"),
    },
  ];

  const bilingualSteps: readonly MarketingSpecimenStep[] = [
    {
      kicker: t("bilingualStepTokensKicker"),
      title: t("bilingualStepTokensTitle"),
      description: t("bilingualStepTokensDescription"),
    },
    {
      kicker: t("bilingualStepThemesKicker"),
      title: t("bilingualStepThemesTitle"),
      description: t("bilingualStepThemesDescription"),
    },
    {
      kicker: t("bilingualStepDirectionKicker"),
      title: t("bilingualStepDirectionTitle"),
      description: t("bilingualStepDirectionDescription"),
    },
  ];

  const safeguards: readonly StoryCard[] = [
    {
      title: t("safeguardContractsTitle"),
      description: t("safeguardContractsDescription"),
      evidence: t("safeguardContractsEvidence"),
      technologies: t("safeguardContractsTechnologies"),
      icon: BracesIcon,
    },
    {
      title: t("safeguardAccessTitle"),
      description: t("safeguardAccessDescription"),
      evidence: t("safeguardAccessEvidence"),
      technologies: t("safeguardAccessTechnologies"),
      icon: AccessibilityIcon,
    },
    {
      title: t("safeguardBrowserTitle"),
      description: t("safeguardBrowserDescription"),
      evidence: t("safeguardBrowserEvidence"),
      technologies: t("safeguardBrowserTechnologies"),
      icon: TestTubeDiagonalIcon,
    },
    {
      title: t("safeguardFontsTitle"),
      description: t("safeguardFontsDescription"),
      evidence: t("safeguardFontsEvidence"),
      technologies: t("safeguardFontsTechnologies"),
      icon: LanguagesIcon,
    },
    {
      title: t("safeguardInstallTitle"),
      description: t("safeguardInstallDescription"),
      evidence: t("safeguardInstallEvidence"),
      technologies: t("safeguardInstallTechnologies"),
      icon: PackageCheckIcon,
    },
    {
      title: t("safeguardShowcaseTitle"),
      description: t("safeguardShowcaseDescription"),
      evidence: t("safeguardShowcaseEvidence"),
      technologies: t("safeguardShowcaseTechnologies"),
      icon: ShieldCheckIcon,
    },
  ];

  const pipeline = [
    t("pipelineFormat"),
    t("pipelineLint"),
    t("pipelineTypes"),
    t("pipelineUnit"),
    t("pipelineBuild"),
    t("pipelineBrowser"),
  ];

  return (
    <>
      <section id="capability-story" aria-labelledby="capability-story-heading">
        <Container className="py-20 sm:py-24">
          <MarketingSectionIntro
            eyebrow={t("storyEyebrow")}
            headingId="capability-story-heading"
            title={t("storyTitle")}
            lead={t("storyLead")}
          />

          <div
            data-slot="marketing-story-grid"
            className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {capabilities.map((capability) => (
              <StoryCard key={capability.title} {...capability} />
            ))}
          </div>
        </Container>
      </section>

      <section
        id="architecture"
        aria-labelledby="architecture-heading"
        className="border-y bg-surface"
      >
        <CenteredFeature
          eyebrow={t("architectureEyebrow")}
          headingId="architecture-heading"
          title={
            <>
              {t("architectureTitleBefore")}
              <bdi dir="ltr">App Router</bdi>
              {t("architectureTitleAfter")}
            </>
          }
          lead={t("architectureLead")}
          body={<p>{t("architectureBody")}</p>}
          verificationLabel={t("verificationLabel")}
          verification={t("architectureVerification")}
          specimen={
            <ArchitectureSpecimen label={t("architectureDiagramLabel")} steps={architectureSteps} />
          }
        />
      </section>

      <section id="bilingual-design" aria-labelledby="bilingual-design-heading">
        <CenteredFeature
          eyebrow={t("bilingualEyebrow")}
          headingId="bilingual-design-heading"
          title={t("bilingualTitle")}
          lead={t("bilingualLead")}
          body={
            <dl className="grid gap-4 text-center sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-4">
                <dt>
                  <bdi dir="ltr" className="text-small font-semibold text-link">
                    Inter
                  </bdi>
                </dt>
                <dd className="mt-2 text-supporting text-muted-foreground">
                  {t("bilingualInterDescription")}
                </dd>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <dt>
                  <bdi dir="ltr" className="text-small font-semibold text-link">
                    Tajawal
                  </bdi>
                </dt>
                <dd className="mt-2 text-supporting text-muted-foreground">
                  {t("bilingualTajawalDescription")}
                </dd>
              </div>
            </dl>
          }
          verificationLabel={t("verificationLabel")}
          verification={t("bilingualVerification")}
          specimen={
            <BilingualSystemSpecimen label={t("bilingualDiagramLabel")} steps={bilingualSteps} />
          }
        />
      </section>

      <section id="quality" aria-labelledby="quality-heading" className="border-t bg-surface">
        <Container className="py-20 sm:py-24">
          <MarketingSectionIntro
            eyebrow={t("qualityEyebrow")}
            headingId="quality-heading"
            title={t("qualityTitle")}
            lead={t("qualityLead")}
          />

          <div
            data-slot="marketing-story-grid"
            className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {safeguards.map((safeguard) => (
              <StoryCard key={safeguard.title} {...safeguard} />
            ))}
          </div>

          <aside
            className="mx-auto mt-6 max-w-prose rounded-xl border bg-background p-6 text-center"
            aria-labelledby="dependency-posture-heading"
          >
            <h3 id="dependency-posture-heading" className="text-subheading">
              {t("dependencyPostureTitle")}
            </h3>
            <p className="mt-3 text-small">{t("dependencyPostureDescription")}</p>
          </aside>

          <div className="mx-auto mt-8 max-w-5xl">
            <QualityPipeline label={t("pipelineLabel")} stages={pipeline} />
          </div>
        </Container>
      </section>
    </>
  );
}
