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

type FeatureSplitProps = Readonly<{
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

function FeatureSplit({
  eyebrow,
  headingId,
  title,
  lead,
  body,
  verificationLabel,
  verification,
  specimen,
}: FeatureSplitProps) {
  return (
    <Container className="grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-2 lg:gap-16">
      <div className="max-w-prose min-w-0">
        <p className="text-small font-semibold text-link">{eyebrow}</p>
        <h2 id={headingId} className="mt-3 text-heading sm:text-title">
          {title}
        </h2>
        <p className="mt-5 text-body-lg">{lead}</p>
        <div className="mt-6 space-y-4 text-body">{body}</div>
        <div className="mt-8 border-s-2 border-info ps-4">
          <p className="text-small font-semibold">{verificationLabel}</p>
          <p className="mt-1 text-supporting text-muted-foreground">{verification}</p>
        </div>
      </div>
      <div className="min-w-0">{specimen}</div>
    </Container>
  );
}

function StoryCard({ title, description, evidence, technologies, icon: Icon }: StoryCard) {
  const t = useTranslations("marketing");

  return (
    <article className="flex h-full min-w-0 flex-col rounded-xl border bg-card p-6">
      <div className="flex size-10 items-center justify-center rounded-lg border bg-surface text-info">
        <Icon aria-hidden={true} className="size-5" />
      </div>
      <bdi dir="auto" className="mt-5 self-start text-caption font-semibold text-link">
        {technologies}
      </bdi>
      <h3 className="mt-2 text-subheading">{title}</h3>
      <p className="mt-3 text-small">{description}</p>
      <p className="mt-6 border-t pt-4 text-supporting text-muted-foreground">
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
          <div className="max-w-prose">
            <p className="text-small font-semibold text-link">{t("storyEyebrow")}</p>
            <h2 id="capability-story-heading" className="mt-3 text-heading sm:text-title">
              {t("storyTitle")}
            </h2>
            <p className="mt-5 text-body-lg">{t("storyLead")}</p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
        <FeatureSplit
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
        <FeatureSplit
          eyebrow={t("bilingualEyebrow")}
          headingId="bilingual-design-heading"
          title={t("bilingualTitle")}
          lead={t("bilingualLead")}
          body={
            <dl className="grid gap-4 sm:grid-cols-2">
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
          <div className="max-w-prose">
            <p className="text-small font-semibold text-link">{t("qualityEyebrow")}</p>
            <h2 id="quality-heading" className="mt-3 text-heading sm:text-title">
              {t("qualityTitle")}
            </h2>
            <p className="mt-5 text-body-lg">{t("qualityLead")}</p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {safeguards.map((safeguard) => (
              <StoryCard key={safeguard.title} {...safeguard} />
            ))}
          </div>

          <aside
            className="mt-6 rounded-xl border bg-background p-6"
            aria-labelledby="dependency-posture-heading"
          >
            <h3 id="dependency-posture-heading" className="text-subheading">
              {t("dependencyPostureTitle")}
            </h3>
            <p className="mt-3 max-w-prose text-small">{t("dependencyPostureDescription")}</p>
          </aside>

          <div className="mt-8">
            <QualityPipeline label={t("pipelineLabel")} stages={pipeline} />
          </div>
        </Container>
      </section>
    </>
  );
}
