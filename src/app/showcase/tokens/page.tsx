import type { Metadata } from "next";

import { ShowcasePageHeader } from "@/features/showcase/components/showcase-page-header";
import { ShowcaseSection } from "@/features/showcase/components/showcase-section";
import { ThemeStatus } from "@/features/showcase/components/theme-status";
import { TokenSwatch } from "@/features/showcase/components/token-swatch";

export const metadata: Metadata = {
  title: "Tokens",
};

const COLOR_TOKENS = [
  { name: "background", swatchClassName: "bg-background" },
  { name: "foreground", swatchClassName: "bg-foreground" },
  { name: "card", swatchClassName: "bg-card" },
  { name: "popover", swatchClassName: "bg-popover" },
  { name: "primary", swatchClassName: "bg-primary" },
  { name: "secondary", swatchClassName: "bg-secondary" },
  { name: "muted", swatchClassName: "bg-muted" },
  { name: "accent", swatchClassName: "bg-accent" },
  { name: "destructive", swatchClassName: "bg-destructive" },
  { name: "success", swatchClassName: "bg-success" },
  { name: "warning", swatchClassName: "bg-warning" },
  { name: "border", swatchClassName: "bg-border" },
  { name: "input", swatchClassName: "bg-input" },
  { name: "ring", swatchClassName: "bg-ring" },
] as const;

const TYPE_SCALE = [
  { label: "text-xs", className: "text-xs" },
  { label: "text-sm", className: "text-sm" },
  { label: "text-base", className: "text-base" },
  { label: "text-lg", className: "text-lg" },
  { label: "text-xl", className: "text-xl" },
  { label: "text-2xl", className: "text-2xl" },
  { label: "text-3xl", className: "text-3xl" },
] as const;

const RADIUS_SCALE = [
  { label: "rounded-sm", className: "rounded-sm" },
  { label: "rounded-md", className: "rounded-md" },
  { label: "rounded-lg", className: "rounded-lg" },
  { label: "rounded-xl", className: "rounded-xl" },
  { label: "rounded-full", className: "rounded-full" },
] as const;

export default function TokensPage() {
  return (
    <>
      <ShowcasePageHeader
        title="Tokens"
        description="Every color below resolves through the semantic CSS variable bridge — nothing on this page names a literal color."
      />
      <ShowcaseSection
        title="Theme behavior"
        description="The runtime is system-driven: the ThemeProvider mirrors the OS preference onto the dark class before first paint."
      >
        <ThemeStatus />
      </ShowcaseSection>
      <ShowcaseSection title="Semantic colors">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COLOR_TOKENS.map((token) => (
            <TokenSwatch key={token.name} {...token} />
          ))}
        </div>
      </ShowcaseSection>
      <ShowcaseSection
        title="Typography"
        description="Geist Sans through the font-sans bridge; Geist Mono for code."
      >
        <div className="flex flex-col gap-2 rounded-lg border p-4">
          {TYPE_SCALE.map((step) => (
            <p key={step.label} className={step.className}>
              <span className="text-muted-foreground">{step.label} — </span>
              The quick brown fox jumps over the lazy dog.
            </p>
          ))}
          <code className="mt-2 block font-mono text-sm text-muted-foreground">
            font-mono — const answer = 42;
          </code>
        </div>
      </ShowcaseSection>
      <ShowcaseSection title="Radius">
        <div className="flex flex-wrap gap-4">
          {RADIUS_SCALE.map((step) => (
            <div key={step.label} className="flex flex-col items-center gap-2">
              <div className={`size-16 border bg-muted ${step.className}`} />
              <code className="font-mono text-xs text-muted-foreground">
                {step.label}
              </code>
            </div>
          ))}
        </div>
      </ShowcaseSection>
    </>
  );
}
