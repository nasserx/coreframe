import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LocaleProvider } from "@/core/providers/locale-provider";

import { MarketingCapabilityStory } from "./marketing-capability-story";
import { MarketingFirstViewport } from "./marketing-first-viewport";
import { NeutralPreview } from "./neutral-preview";

function renderMarketingPage() {
  return render(
    <LocaleProvider>
      <MarketingFirstViewport preview={<NeutralPreview />} />
      <MarketingCapabilityStory />
    </LocaleProvider>,
  );
}

describe("MarketingCapabilityStory", () => {
  it("extends the existing hero with one logical heading hierarchy and stable section IDs", () => {
    renderMarketingPage();

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 2, name: "Foundation capabilities" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Technical choices that carry their evidence.",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "App Router: static where the route allows it.",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "One semantic system, equal care in both directions.",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Risk-reducing defaults, not absolute guarantees.",
      }),
    ).toBeVisible();

    for (const id of [
      "capabilities",
      "capability-story",
      "architecture",
      "bilingual-design",
      "quality",
    ]) {
      expect(document.querySelector(`section#${id}`)).toBeInTheDocument();
    }

    const levels = Array.from(document.querySelectorAll("h1, h2, h3"), (heading) =>
      Number(heading.tagName.slice(1)),
    );
    expect(levels[0]).toBe(1);
    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index] ?? 0).toBeLessThanOrEqual((levels[index - 1] ?? 0) + 1);
    }
  });

  it("renders exact risk-bounded claims and gives every informative specimen an accessible name", () => {
    renderMarketingPage();

    expect(
      screen.getByText(
        "The landing route prerenders from server-owned route composition and does not read request-time locale state.",
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Inter is bundled through Next.js, while Tajawal is served from local Arabic subsets. Browser tests verify script ownership without runtime Google Fonts requests.",
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Known dependency advisories are documented and reviewed rather than hidden or cleared through an unsafe forced downgrade. This reduces uncertainty; it does not mean the dependency tree is risk-free.",
      ),
    ).toBeVisible();

    expect(screen.getByRole("figure", { name: "Architecture delivery path" })).toBeVisible();
    expect(screen.getByRole("figure", { name: "Semantic design-system path" })).toBeVisible();
    expect(screen.getByRole("figure", { name: "Automated validation pipeline" })).toBeVisible();

    const icons = document.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThan(0);
    for (const icon of icons) {
      expect(icon).toHaveAttribute("aria-hidden", "true");
    }
    expect(document.querySelectorAll('article bdi[dir="auto"]')).toHaveLength(12);
    expect(document.querySelectorAll('bdi[dir="ltr"]')).not.toHaveLength(0);
  });

  it("keeps the shared capability and safeguard cards informational while coordinating their icons", () => {
    renderMarketingPage();

    const storyCards = document.querySelectorAll('[data-slot="marketing-story-card"]');
    expect(storyCards).toHaveLength(12);
    expect(
      document.querySelectorAll('#capability-story [data-slot="marketing-story-card"]'),
    ).toHaveLength(6);
    expect(document.querySelectorAll('#quality [data-slot="marketing-story-card"]')).toHaveLength(
      6,
    );

    for (const card of storyCards) {
      expect(card.tagName).toBe("ARTICLE");
      expect(card).not.toHaveAttribute("tabindex");
      expect(card).not.toHaveAttribute("role");
      expect(card).not.toHaveAttribute("onclick");
      expect(card.className).not.toContain("cursor-pointer");
      expect(card.querySelectorAll("a, button, input, select, textarea, [tabindex]")).toHaveLength(
        0,
      );
      expect(card.querySelector('[data-slot="marketing-story-icon"]')).toBeInTheDocument();
      expect(card.querySelector('[data-slot="marketing-story-icon-glyph"]')).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    }

    for (const specimen of document.querySelectorAll("figure")) {
      expect(specimen.querySelector('[data-slot="marketing-story-card"]')).toBeNull();
    }
  });

  it("owns a fine-pointer, token-based 2px interaction with an explicit reduced-motion opt-out", () => {
    const css = readFileSync(
      join(import.meta.dirname, "marketing-capability-story.module.css"),
      "utf8",
    );

    expect(css).toContain("@media (hover: hover) and (pointer: fine)");
    expect(css).toContain("translate: 0 -2px");
    expect(css).toContain("translate: 0 -1px");
    expect(css).toContain("background-color: var(--accent)");
    expect(css).toContain("border-color: var(--primary)");
    expect(css).toContain("color: var(--primary)");
    expect(css).toContain("color-mix(in oklab, var(--primary) 10%, transparent)");
    expect(css).toContain("transition-duration: var(--motion-quick)");
    expect(css).toContain("transition-timing-function: var(--ease-standard)");
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.storyCard:hover[\s\S]*\.storyIconGlyph[\s\S]*translate: none/,
    );
    expect(css).not.toMatch(
      /cursor|scale|rotate|box-shadow|#[\da-f]{3,8}|\brgb\(|\bhsl\(|\boklch\(/i,
    );
  });
});
