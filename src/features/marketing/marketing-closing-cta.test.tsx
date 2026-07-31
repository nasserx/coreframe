import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LocaleControl } from "@/components/ui/locale-control";
import { LocaleProvider } from "@/core/providers/locale-provider";
import { ar } from "@/i18n/messages/ar";
import { en } from "@/i18n/messages/en";

import { MarketingClosingCta } from "./marketing-closing-cta";

const CLOSING_KEYS = [
  "closingEyebrow",
  "closingTitle",
  "closingDescription",
  "closingPrimaryAction",
  "closingSecondaryAction",
] as const;

function renderClosingCta({ withLocaleControl = false }: { withLocaleControl?: boolean } = {}) {
  return render(
    <LocaleProvider>
      {withLocaleControl ? <LocaleControl /> : null}
      <MarketingClosingCta />
    </LocaleProvider>,
  );
}

function closingSection(): HTMLElement {
  const section = document.querySelector("section#next-step");
  if (!(section instanceof HTMLElement)) {
    throw new Error("The closing CTA must own section#next-step.");
  }
  return section;
}

describe("MarketingClosingCta", () => {
  it("carries the exact bilingual catalogue entries in both locales", () => {
    expect(CLOSING_KEYS.map((key) => en.marketing[key])).toEqual([
      "A clear next step",
      "Build from a clear foundation.",
      "Review the architecture and safeguards, then adapt the system around your product while preserving its shared contracts.",
      "Review the architecture",
      "Inspect the safeguards",
    ]);
    expect(CLOSING_KEYS.map((key) => ar.marketing[key])).toEqual([
      "خطوة تالية واضحة",
      "ابنِ على أساس واضح.",
      "راجع المعمارية وضوابط الجودة، ثم كيّف النظام حول منتجك مع الحفاظ على عقوده المشتركة.",
      "راجع المعمارية",
      "استعرض ضوابط الجودة",
    ]);

    const englishClosingKeys = Object.keys(en.marketing).filter((key) => key.startsWith("closing"));
    const arabicClosingKeys = Object.keys(ar.marketing).filter((key) => key.startsWith("closing"));
    expect(arabicClosingKeys).toEqual(englishClosingKeys);
    expect(englishClosingKeys).toHaveLength(CLOSING_KEYS.length);
  });

  it("owns one labelled section with a single correctly associated h2", () => {
    renderClosingCta();

    const section = closingSection();
    expect(section).toHaveAttribute("aria-labelledby", "next-step-heading");

    const headings = within(section).getAllByRole("heading", { level: 2 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveAttribute("id", "next-step-heading");
    expect(headings[0]).toHaveTextContent("Build from a clear foundation.");
    expect(within(section).queryAllByRole("heading", { level: 1 })).toHaveLength(0);
    expect(within(section).queryAllByRole("heading", { level: 3 })).toHaveLength(0);
    expect(section).toHaveAccessibleName("Build from a clear foundation.");

    expect(within(section).getByText("A clear next step")).toBeVisible();
    expect(within(section).getByText(en.marketing.closingDescription)).toBeVisible();

    const ids = Array.from(document.querySelectorAll("[id]"), ({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("reuses the shared centered introduction owner instead of a new pattern", () => {
    renderClosingCta();

    const section = closingSection();
    const intros = section.querySelectorAll('[data-slot="marketing-section-intro"]');
    expect(intros).toHaveLength(1);
    const intro = intros[0];
    expect(intro?.className).toContain("mx-auto");
    expect(intro?.className).toContain("max-w-prose");
    expect(intro?.className).toContain("text-center");

    const container = section.querySelector('[data-slot="container"]');
    expect(container?.className).toContain("mx-auto");
    expect(container?.className).toContain("max-w-7xl");

    const actions = section.querySelector('[data-slot="marketing-closing-actions"]');
    expect(actions?.className).toContain("flex-wrap");
    expect(actions?.className).toContain("justify-center");
  });

  it("exposes exactly two honest same-page actions in primary-first DOM order", () => {
    renderClosingCta();

    const section = closingSection();
    const links = within(section).getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(within(section).queryAllByRole("button")).toHaveLength(0);

    const [primary, secondary] = links;
    expect(primary).toHaveAccessibleName("Review the architecture");
    expect(primary).toHaveAttribute("href", "#architecture");
    expect(secondary).toHaveAccessibleName("Inspect the safeguards");
    expect(secondary).toHaveAttribute("href", "#quality");
    expect(primary?.textContent).not.toBe(secondary?.textContent);

    if (!primary || !secondary) {
      throw new Error("The closing CTA requires both actions.");
    }
    expect(primary.compareDocumentPosition(secondary) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    // The prominent/outline pair at one shared target height
    // (docs/DESIGN_TOKENS.md § Control height), no new Button size.
    expect(primary.className).toContain("bg-primary");
    expect(primary.className).toContain("h-12");
    expect(primary.className).toContain("px-7");
    expect(secondary.className).toContain("border-border");
    expect(secondary.className).toContain("h-12");
    expect(secondary.className).toContain("px-7");
    expect(secondary.className).not.toContain("bg-primary");
  });

  it("promises no destination the repository does not own", () => {
    renderClosingCta();

    const section = closingSection();
    for (const link of within(section).getAllByRole("link")) {
      const href = link.getAttribute("href") ?? "";
      expect(href).toMatch(/^#(?:architecture|quality)$/);
      expect(link).not.toHaveAttribute("target");
      expect(link).not.toHaveAttribute("rel");
      expect(link).not.toHaveAttribute("data-unavailable");
      expect(link.querySelector(".sr-only")).toBeNull();
    }

    expect(section.innerHTML).not.toMatch(/showcase/i);
    expect(section.innerHTML).not.toMatch(/https?:\/\//);
    expect(section.innerHTML).not.toMatch(/mailto:|tel:/);
    expect(section.querySelectorAll("form, input, select, textarea")).toHaveLength(0);
    expect(section.querySelectorAll("[disabled], [aria-disabled]")).toHaveLength(0);
    expect(section.className).not.toMatch(/\b(?:ml|mr|pl|pr|left|right)-/);
  });

  it("owns no interactive state or event handling of its own", async () => {
    const user = userEvent.setup();
    renderClosingCta();

    const section = closingSection();
    const before = section.innerHTML;
    const [primary, secondary] = within(section).getAllByRole("link");
    if (!primary || !secondary) {
      throw new Error("The closing CTA requires both actions.");
    }

    // Both actions are keyboard reachable and stay plain anchors: focusing and
    // activating them changes nothing this component renders.
    await user.tab();
    expect(primary).toHaveFocus();
    await user.tab();
    expect(secondary).toHaveFocus();

    await user.click(primary);
    expect(section.innerHTML).toBe(before);
    expect(primary).not.toHaveAttribute("aria-expanded");
    expect(primary).not.toHaveAttribute("aria-pressed");
    expect(secondary).not.toHaveAttribute("aria-expanded");
  });

  it("switches every visible string live with the active locale", async () => {
    const user = userEvent.setup();
    renderClosingCta({ withLocaleControl: true });

    await user.click(screen.getByRole("button", { name: "Switch to Arabic" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));

    const section = closingSection();
    expect(within(section).getByText(ar.marketing.closingEyebrow)).toBeVisible();
    expect(
      within(section).getByRole("heading", { level: 2, name: ar.marketing.closingTitle }),
    ).toBeVisible();
    expect(within(section).getByText(ar.marketing.closingDescription)).toBeVisible();

    const links = within(section).getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAccessibleName(ar.marketing.closingPrimaryAction);
    expect(links[0]).toHaveAttribute("href", "#architecture");
    expect(links[1]).toHaveAccessibleName(ar.marketing.closingSecondaryAction);
    expect(links[1]).toHaveAttribute("href", "#quality");

    for (const key of CLOSING_KEYS) {
      expect(section).not.toHaveTextContent(en.marketing[key]);
    }
  });
});
