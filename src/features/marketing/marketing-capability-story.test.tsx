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
});
