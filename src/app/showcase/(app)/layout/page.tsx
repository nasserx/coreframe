import type { Metadata } from "next";

import { Stack } from "@/components/ui/stack";
import { ShowcasePageHeader } from "@/features/showcase/components/showcase-page-header";
import { ShowcaseSection } from "@/features/showcase/components/showcase-section";

export const metadata: Metadata = {
  title: "Layout",
};

const RHYTHM_STEPS = [
  { gap: "xs", usage: "Lines of one text lockup — a title and its description." },
  { gap: "sm", usage: "Tightly related items: a label cluster, grouped controls." },
  { gap: "md", usage: "Sibling blocks within one section. The default." },
  { gap: "lg", usage: "Distinct groups of blocks inside a section." },
  { gap: "xl", usage: "Page-level sections — what this page's own layout uses." },
] as const;

function RhythmBlock() {
  return <div className="h-4 rounded-md bg-muted" />;
}

export default function LayoutPage() {
  return (
    <>
      <ShowcasePageHeader
        title="Layout"
        description="The layout vocabulary: Stack for vertical rhythm, measure tokens for line length, Container for page width, PageHeader for the page scaffold, and the AppShell this very page renders inside. Contracts: docs/LAYOUT.md."
      />
      <ShowcaseSection
        title="Vertical rhythm — Stack"
        description="Five named steps replace ad-hoc gap-* values. The name states the relationship between siblings, so the spacing is a decision, not a guess."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {RHYTHM_STEPS.map((step) => (
            <Stack key={step.gap} gap="sm">
              <code className="font-mono text-caption text-muted-foreground">
                gap=&quot;{step.gap}&quot;
              </code>
              <Stack gap={step.gap} className="rounded-lg border p-3">
                <RhythmBlock />
                <RhythmBlock />
                <RhythmBlock />
              </Stack>
              <p dir="auto" className="text-caption text-muted-foreground">
                {step.usage}
              </p>
            </Stack>
          ))}
        </div>
      </ShowcaseSection>
      <ShowcaseSection
        title="Content measure"
        description="A page makes exactly one of three width decisions per block: prose measure for running text, form measure for single-column interactive surfaces, or the full Container width for dense data. Never an ad-hoc max-w-*."
      >
        <Stack gap="md">
          <Stack gap="xs" className="max-w-prose rounded-lg border p-4">
            <code className="self-start font-mono text-caption text-muted-foreground">
              max-w-prose — 65ch
            </code>
            <p dir="auto" className="text-body">
              Running text reads best at 45–75 characters per line. Because the measure is
              character-based, it follows the element&apos;s own font size: larger text gets a
              proportionally wider column, captions a narrower one, and Arabic text measures against
              its own glyphs.
            </p>
          </Stack>
          <Stack gap="xs" className="max-w-form rounded-lg border p-4">
            <code className="self-start font-mono text-caption text-muted-foreground">
              max-w-form — 28rem
            </code>
            <p dir="auto" className="text-small">
              Single-column forms and other narrow interactive surfaces. Wider inputs do not get
              easier to use — they get harder to scan.
            </p>
          </Stack>
          <Stack gap="xs" className="rounded-lg border p-4">
            <code className="self-start font-mono text-caption text-muted-foreground">
              full width — no cap
            </code>
            <p dir="auto" className="text-small">
              Dense data surfaces — tables, card grids — take the full Container width. Capping them
              wastes space without improving readability; the tables and grids across this showcase
              are all uncapped.
            </p>
          </Stack>
        </Stack>
      </ShowcaseSection>
      <ShowcaseSection
        title="Page scaffold — PageHeader"
        description="The breadcrumb + title + description block at the top of this page is the live example: PageHeader owns the scaffold's rhythm, PageHeaderTitle renders the page's single h1 on the type ramp, and PageHeaderDescription caps itself at the prose measure."
      >
        <p dir="auto" className="max-w-prose text-small">
          Compose slots in reading order: an optional Breadcrumb, then PageHeaderTitle, then
          PageHeaderDescription. The showcase binds them once in ShowcasePageHeader; a product does
          the same with its own breadcrumb source.
        </p>
      </ShowcaseSection>
      <ShowcaseSection
        title="Application shell"
        description="This page renders inside the AppShell: a persistent sidebar built on the sidebar tokens, a sticky header, and a main region that scrolls with the document."
      >
        <ul className="flex max-w-prose list-disc flex-col gap-2 ps-5 text-small">
          <li>
            Press <kbd>Tab</kbd> from the address bar: the first focusable element is the skip link,
            which moves focus straight to the main region.
          </li>
          <li>
            Below the <code>md</code> breakpoint the sidebar collapses into a modal drawer opened
            from the header — focus is trapped inside, Escape or the backdrop closes it, focus
            returns to the trigger, and navigation closes it automatically.
          </li>
          <li>
            The regions are landmarks (<code>nav</code>, <code>banner</code>, <code>main</code>),
            and the whole shell mirrors under <code>dir=&quot;rtl&quot;</code> with no conditional
            logic — the sidebar sits at the inline start, wherever that is.
          </li>
          <li>
            The shell is structural, not designed: restyle it through the <code>sidebar-*</code>{" "}
            tokens and className, or replace it entirely — pages depend only on Container, Stack,
            and PageHeader, never on the shell.
          </li>
        </ul>
      </ShowcaseSection>
    </>
  );
}
