import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";

import { ShowcasePageHeader } from "@/features/showcase/components/showcase-page-header";
import { ShowcaseSection } from "@/features/showcase/components/showcase-section";
import { ThemeStatus } from "@/features/showcase/components/theme-status";
import { TokenSwatch } from "@/features/showcase/components/token-swatch";
import { TypeSpecimen } from "@/features/showcase/components/type-specimen";

export const metadata: Metadata = {
  title: "Tokens",
};

/*
 * Reads the authored token values straight from the source CSS at build time
 * (this page is statically prerendered, so this runs once per build). The
 * swatches must show values exactly as written in src/styles — resolving
 * them in the browser via getComputedStyle yields the computed color space
 * serialization (lab()/hex), which is unreadable and cannot be copied back
 * into the token files.
 */
async function readAuthoredTokens(file: string): Promise<ReadonlyMap<string, string>> {
  const css = await readFile(join(process.cwd(), "src", "styles", file), "utf8");
  const tokens = new Map<string, string>();
  for (const match of css.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    const [, name, value] = match;
    if (name !== undefined && value !== undefined) {
      tokens.set(`--${name}`, value.replace(/\s+/g, " ").trim());
    }
  }
  return tokens;
}

type ColorToken = Readonly<{ name: string; variable: string; swatchClassName: string }>;

const COLOR_GROUPS: ReadonlyArray<Readonly<{ group: string; tokens: readonly ColorToken[] }>> = [
  {
    group: "Surfaces & text",
    tokens: [
      { name: "background", variable: "--color-background", swatchClassName: "bg-background" },
      { name: "foreground", variable: "--color-foreground", swatchClassName: "bg-foreground" },
      { name: "surface", variable: "--color-surface", swatchClassName: "bg-surface" },
      {
        name: "surface-foreground",
        variable: "--color-surface-foreground",
        swatchClassName: "bg-surface-foreground",
      },
      { name: "card", variable: "--color-card", swatchClassName: "bg-card" },
      {
        name: "card-foreground",
        variable: "--color-card-foreground",
        swatchClassName: "bg-card-foreground",
      },
      { name: "popover", variable: "--color-popover", swatchClassName: "bg-popover" },
      {
        name: "popover-foreground",
        variable: "--color-popover-foreground",
        swatchClassName: "bg-popover-foreground",
      },
    ],
  },
  {
    group: "Interactive",
    tokens: [
      { name: "primary", variable: "--color-primary", swatchClassName: "bg-primary" },
      {
        name: "primary-foreground",
        variable: "--color-primary-foreground",
        swatchClassName: "bg-primary-foreground",
      },
      { name: "link", variable: "--color-link", swatchClassName: "bg-link" },
      { name: "secondary", variable: "--color-secondary", swatchClassName: "bg-secondary" },
      {
        name: "secondary-foreground",
        variable: "--color-secondary-foreground",
        swatchClassName: "bg-secondary-foreground",
      },
      { name: "accent", variable: "--color-accent", swatchClassName: "bg-accent" },
      {
        name: "accent-foreground",
        variable: "--color-accent-foreground",
        swatchClassName: "bg-accent-foreground",
      },
      { name: "muted", variable: "--color-muted", swatchClassName: "bg-muted" },
      {
        name: "muted-foreground",
        variable: "--color-muted-foreground",
        swatchClassName: "bg-muted-foreground",
      },
    ],
  },
  {
    group: "Status",
    tokens: [
      { name: "info", variable: "--color-info", swatchClassName: "bg-info" },
      {
        name: "info-foreground",
        variable: "--color-info-foreground",
        swatchClassName: "bg-info-foreground",
      },
      { name: "success", variable: "--color-success", swatchClassName: "bg-success" },
      {
        name: "success-foreground",
        variable: "--color-success-foreground",
        swatchClassName: "bg-success-foreground",
      },
      { name: "warning", variable: "--color-warning", swatchClassName: "bg-warning" },
      {
        name: "warning-foreground",
        variable: "--color-warning-foreground",
        swatchClassName: "bg-warning-foreground",
      },
      { name: "destructive", variable: "--color-destructive", swatchClassName: "bg-destructive" },
      {
        name: "destructive-foreground",
        variable: "--color-destructive-foreground",
        swatchClassName: "bg-destructive-foreground",
      },
    ],
  },
  {
    group: "Boundaries",
    tokens: [
      { name: "border", variable: "--color-border", swatchClassName: "bg-border" },
      { name: "input", variable: "--color-input", swatchClassName: "bg-input" },
      { name: "ring", variable: "--color-ring", swatchClassName: "bg-ring" },
      { name: "overlay", variable: "--color-overlay", swatchClassName: "bg-overlay" },
    ],
  },
  {
    group: "Charts",
    tokens: [
      { name: "chart-1", variable: "--color-chart-1", swatchClassName: "bg-chart-1" },
      { name: "chart-2", variable: "--color-chart-2", swatchClassName: "bg-chart-2" },
      { name: "chart-3", variable: "--color-chart-3", swatchClassName: "bg-chart-3" },
      { name: "chart-4", variable: "--color-chart-4", swatchClassName: "bg-chart-4" },
      { name: "chart-5", variable: "--color-chart-5", swatchClassName: "bg-chart-5" },
    ],
  },
  {
    group: "Sidebar",
    tokens: [
      { name: "sidebar", variable: "--color-sidebar", swatchClassName: "bg-sidebar" },
      {
        name: "sidebar-foreground",
        variable: "--color-sidebar-foreground",
        swatchClassName: "bg-sidebar-foreground",
      },
      {
        name: "sidebar-primary",
        variable: "--color-sidebar-primary",
        swatchClassName: "bg-sidebar-primary",
      },
      {
        name: "sidebar-primary-foreground",
        variable: "--color-sidebar-primary-foreground",
        swatchClassName: "bg-sidebar-primary-foreground",
      },
      {
        name: "sidebar-accent",
        variable: "--color-sidebar-accent",
        swatchClassName: "bg-sidebar-accent",
      },
      {
        name: "sidebar-accent-foreground",
        variable: "--color-sidebar-accent-foreground",
        swatchClassName: "bg-sidebar-accent-foreground",
      },
      {
        name: "sidebar-border",
        variable: "--color-sidebar-border",
        swatchClassName: "bg-sidebar-border",
      },
      {
        name: "sidebar-ring",
        variable: "--color-sidebar-ring",
        swatchClassName: "bg-sidebar-ring",
      },
    ],
  },
];

const TYPE_RAMP = [
  { label: "text-display", className: "text-display" },
  { label: "text-title", className: "text-title" },
  { label: "text-heading", className: "text-heading" },
  { label: "text-subheading", className: "text-subheading" },
  { label: "text-body-lg", className: "text-body-lg" },
  { label: "text-body", className: "text-body" },
  { label: "text-small", className: "text-small" },
  { label: "text-caption", className: "text-caption" },
] as const;

const ELEVATION_SCALE = [
  { label: "shadow-xs", token: "--elevation-xs", className: "shadow-xs" },
  { label: "shadow-sm", token: "--elevation-sm", className: "shadow-sm" },
  { label: "shadow-md", token: "--elevation-md", className: "shadow-md" },
  { label: "shadow-lg", token: "--elevation-lg", className: "shadow-lg" },
  { label: "shadow-xl", token: "--elevation-xl", className: "shadow-xl" },
] as const;

const RADIUS_SCALE = [
  { label: "rounded-sm", className: "rounded-sm" },
  { label: "rounded-md", className: "rounded-md" },
  { label: "rounded-lg", className: "rounded-lg" },
  { label: "rounded-xl", className: "rounded-xl" },
  { label: "rounded-2xl", className: "rounded-2xl" },
  { label: "rounded-full", className: "rounded-full" },
] as const;

export default async function TokensPage() {
  const [lightTokens, darkTokens] = await Promise.all([
    readAuthoredTokens("light.css"),
    readAuthoredTokens("dark.css"),
  ]);

  return (
    <>
      <ShowcasePageHeader
        title="Tokens"
        description="The complete token contract: every color, type step, elevation level, and radius resolves through the semantic CSS variable bridge — nothing on this page names a literal value. Reference and rebranding guide: docs/DESIGN_TOKENS.md."
      />
      <ShowcaseSection
        title="Theme behavior"
        description="Three-state runtime: an explicit choice from the header control persists in localStorage and syncs across tabs; system tracks the OS live via matchMedia. A pre-paint inline script applies the stored choice with zero flash. Swatch values below follow the resolved theme."
      >
        <ThemeStatus />
      </ShowcaseSection>
      {COLOR_GROUPS.map(({ group, tokens }) => (
        <ShowcaseSection key={group} title={`Colors — ${group}`}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tokens.map((token) => (
              <TokenSwatch
                key={token.name}
                name={token.name}
                swatchClassName={token.swatchClassName}
                lightValue={lightTokens.get(token.variable) ?? "—"}
                darkValue={darkTokens.get(token.variable) ?? "—"}
              />
            ))}
          </div>
        </ShowcaseSection>
      ))}
      <ShowcaseSection
        title="Rendered color hierarchy"
        description="Equivalent semantic roles are nested together so canvas, surface, card, popover, border, primary, link, muted copy, and selection can be judged as a system rather than isolated swatches."
      >
        <div className="rounded-xl border bg-background p-4 text-foreground">
          <p className="text-small text-muted-foreground">Background and muted copy</p>
          <div className="mt-3 rounded-xl border bg-surface p-4 text-surface-foreground">
            <p className="text-small text-muted-foreground">Surface</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-4 text-card-foreground">
                <p className="font-medium">Card</p>
                <a className="mt-2 inline-block text-link underline underline-offset-4" href="#">
                  Accessible primary link
                </a>
              </div>
              <div className="rounded-lg border bg-popover p-4 text-popover-foreground shadow-md">
                <p className="font-medium">Popover</p>
                <p className="mt-2 rounded-lg bg-accent px-3 py-2 text-small text-accent-foreground">
                  Neutral selected state
                </p>
              </div>
            </div>
          </div>
        </div>
      </ShowcaseSection>
      <ShowcaseSection
        title="Information color"
        description="Info is a semantic signal, not a component variant: use the foreground pair on a solid fill, or info itself as text on a restrained tint."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-info p-4 text-info-foreground">
            <p className="font-medium">Solid information surface</p>
            <p className="text-small">
              The paired foreground is reserved for the authored info fill.
            </p>
          </div>
          <div className="rounded-lg border border-info/25 bg-info/10 p-4 text-info">
            <p className="font-medium">Tinted information surface</p>
            <p className="text-small">
              Info text remains readable without promoting cyan to an action.
            </p>
          </div>
        </div>
      </ShowcaseSection>
      <ShowcaseSection
        title="Type ramp"
        description="The foundation's typographic voice: headings differ from body by weight and negative tracking, not typeface. Metrics are measured from the rendered element, so they cannot drift from the tokens."
      >
        <div className="flex flex-col rounded-lg border px-4">
          {TYPE_RAMP.map((step) => (
            <TypeSpecimen key={step.label} label={step.label} className={step.className}>
              The quick brown fox jumps over the lazy dog.
            </TypeSpecimen>
          ))}
        </div>
        <code className="mt-2 block font-mono text-small text-muted-foreground">
          font-mono — const answer = 42;
        </code>
      </ShowcaseSection>
      <ShowcaseSection
        title="Elevation"
        description="shadow-xs through shadow-xl resolve through the per-theme --elevation-* tokens. In dark mode the surface lightness ladder (background → surface → popover) carries elevation; shadows only ground floating layers."
      >
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {ELEVATION_SCALE.map((level) => (
            <div key={level.label} className="flex flex-col items-center gap-2">
              <div className={`h-20 w-full rounded-lg border bg-card ${level.className}`} />
              <div className="flex flex-col items-center">
                <code className="font-mono text-caption">{level.label}</code>
                <code className="font-mono text-caption text-muted-foreground">{level.token}</code>
              </div>
            </div>
          ))}
        </div>
      </ShowcaseSection>
      <ShowcaseSection
        title="Radius"
        description="Every step derives from the single --radius-base token in src/styles/base.css."
      >
        <div className="flex flex-wrap gap-4">
          {RADIUS_SCALE.map((step) => (
            <div key={step.label} className="flex flex-col items-center gap-2">
              <div className={`size-16 border bg-muted ${step.className}`} />
              <code className="font-mono text-caption text-muted-foreground">{step.label}</code>
            </div>
          ))}
        </div>
      </ShowcaseSection>
    </>
  );
}
