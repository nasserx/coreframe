import type { Metadata } from "next";
import { PlusIcon, TrashIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ShowcasePageHeader } from "@/features/showcase/components/showcase-page-header";
import { ShowcaseSection } from "@/features/showcase/components/showcase-section";

export const metadata: Metadata = {
  title: "Actions",
};

const BUTTON_VARIANTS = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const;

const BADGE_VARIANTS = ["default", "secondary", "destructive", "outline", "ghost", "link"] as const;

export default function ActionsPage() {
  return (
    <>
      <ShowcasePageHeader
        title="Actions"
        description="Button and Badge across the full official variant and size matrix, plus the loading composition pattern."
      />
      <ShowcaseSection title="Button variants">
        <div className="flex flex-wrap items-center gap-2">
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
      </ShowcaseSection>
      <ShowcaseSection title="Button sizes">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Add">
            <PlusIcon />
          </Button>
          <Button size="icon-xs" variant="ghost" aria-label="Add compact item">
            <PlusIcon />
          </Button>
          <Button size="icon-sm" variant="outline" aria-label="Delete">
            <TrashIcon />
          </Button>
          <Button size="icon-lg" aria-label="Add prominent item">
            <PlusIcon />
          </Button>
        </div>
      </ShowcaseSection>
      <ShowcaseSection
        title="Public-site CTA geometry"
        description="Reference-authored navigation, hero, pricing, and prominent heights remain composition-level treatments over the frozen Button size vocabulary. They are specimens, not new primitive sizes."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" className="px-5 font-semibold">
            Navigation CTA
          </Button>
          <Button size="lg" className="h-10 px-6 font-semibold">
            Hero CTA
          </Button>
          <Button size="lg" className="h-11 px-5 font-semibold">
            Pricing CTA
          </Button>
          <Button size="lg" className="h-12 px-7 font-semibold">
            Prominent CTA
          </Button>
        </div>
      </ShowcaseSection>
      <ShowcaseSection
        title="States"
        description="Disabled and loading are compositions: a disabled button plus an inline Spinner. No LoadingButton primitive exists by design."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button disabled>Disabled</Button>
          <Button disabled>
            <Spinner data-icon="inline-start" aria-hidden="true" />
            Saving…
          </Button>
          <Button variant="outline">
            <PlusIcon data-icon="inline-start" />
            With icon
          </Button>
          <Button className="h-auto min-h-8 max-w-full py-1.5 whitespace-normal">
            Continue with a deliberately long English action label
          </Button>
          <Button
            dir="rtl"
            lang="ar"
            className="h-auto min-h-8 max-w-full py-1.5 whitespace-normal"
          >
            متابعة باستخدام تسمية إجراء عربية طويلة للاختبار
          </Button>
        </div>
      </ShowcaseSection>
      <ShowcaseSection title="Badge variants">
        <div className="flex flex-wrap items-center gap-2">
          {BADGE_VARIANTS.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      </ShowcaseSection>
      <ShowcaseSection
        title="Badge as a link"
        description="The render prop swaps the element while keeping badge styling; the primary example exposes the dedicated semantic hover state."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge render={<a href="/showcase" />}>Primary link badge</Badge>
          <Badge variant="outline" render={<a href="/showcase" />}>
            Outline link badge
          </Badge>
        </div>
      </ShowcaseSection>
    </>
  );
}
