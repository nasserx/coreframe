import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LocaleControl } from "@/components/ui/locale-control";
import { LocaleProvider } from "@/core/providers/locale-provider";
import { ar } from "@/i18n/messages/ar";
import { en } from "@/i18n/messages/en";

import { MarketingFaq } from "./marketing-faq";

const FAQ_QUESTION_KEYS = [
  "faqIncludedQuestion",
  "faqLanguageQuestion",
  "faqBrandingQuestion",
  "faqShowcaseQuestion",
  "faqStaticQuestion",
  "faqSecurityQuestion",
] as const;

const FAQ_ANSWER_KEYS = [
  "faqIncludedAnswer",
  "faqLanguageAnswer",
  "faqBrandingAnswer",
  "faqShowcaseAnswer",
  "faqStaticAnswer",
  "faqSecurityAnswer",
] as const;

const TECHNICAL_TERMS_FOR_TEST = [
  "App Router",
  "API",
  "AppShell",
  "Base UI",
  "Foundation Frame",
  "Inter",
  "LTR",
  "Next.js",
  "RTL",
  "SVG",
  "Showcase",
  "SiteShell",
  "Tajawal",
  "TypeScript",
  "URL",
  "dir",
  "lang",
] as const;

function renderFaq({ withLocaleControl = false }: { withLocaleControl?: boolean } = {}) {
  return render(
    <LocaleProvider>
      {withLocaleControl ? <LocaleControl /> : null}
      <MarketingFaq />
    </LocaleProvider>,
  );
}

describe("MarketingFaq", () => {
  it("keeps exact six-question catalogue parity and one logical section heading", () => {
    const englishFaqKeys = Object.keys(en.marketing).filter((key) => key.startsWith("faq"));
    const arabicFaqKeys = Object.keys(ar.marketing).filter((key) => key.startsWith("faq"));

    expect(arabicFaqKeys).toEqual(englishFaqKeys);
    expect(FAQ_QUESTION_KEYS.map((key) => en.marketing[key])).toEqual([
      "What does the Foundation include?",
      "How do English, Arabic, LTR, and RTL work together?",
      "Can I replace the branding and design system?",
      "Is the Showcase included in production?",
      "Is every route statically generated?",
      "Does the Foundation guarantee zero vulnerabilities?",
    ]);
    expect(FAQ_QUESTION_KEYS.map((key) => ar.marketing[key])).toEqual([
      "ماذا يتضمن الأساس؟",
      "كيف يعمل دعم الإنجليزية والعربية واتجاهي LTR وRTL؟",
      "هل يمكن استبدال الهوية ونظام التصميم؟",
      "هل يدخل Showcase ضمن إصدار الإنتاج؟",
      "هل تُولَّد جميع المسارات مسبقًا؟",
      "هل يضمن الأساس انعدام الثغرات؟",
    ]);
    expect(FAQ_ANSWER_KEYS).toHaveLength(6);

    renderFaq();
    const section = document.querySelector("section#faq");
    expect(section).toBeInTheDocument();
    expect(
      within(section as HTMLElement).getAllByRole("heading", {
        level: 2,
        name: "Clear answers about the Foundation.",
      }),
    ).toHaveLength(1);
    expect(within(section as HTMLElement).getAllByRole("heading", { level: 3 })).toHaveLength(6);
  });

  it("delegates a collapsed, single-open, collapsible keyboard contract to Base UI", async () => {
    const user = userEvent.setup();
    renderFaq();

    const faq = document.querySelector("section#faq") as HTMLElement;
    const triggers = within(faq).getAllByRole("button");
    expect(triggers).toHaveLength(6);
    for (const trigger of triggers) {
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    }
    expect(within(faq).queryAllByRole("region")).toHaveLength(0);

    await user.click(triggers[0] as HTMLElement);
    expect(triggers[0]).toHaveAttribute("aria-expanded", "true");
    expect(triggers[1]).toHaveAttribute("aria-expanded", "false");

    await user.click(triggers[1] as HTMLElement);
    expect(triggers[0]).toHaveAttribute("aria-expanded", "false");
    expect(triggers[1]).toHaveAttribute("aria-expanded", "true");

    (triggers[1] as HTMLElement).focus();
    await user.keyboard("{Enter}");
    expect(triggers[1]).toHaveAttribute("aria-expanded", "false");
    expect(triggers[1]).toHaveFocus();

    await user.keyboard(" ");
    expect(triggers[1]).toHaveAttribute("aria-expanded", "true");
    expect(triggers[1]).toHaveFocus();

    const triggerId = triggers[1]?.getAttribute("id");
    const panelId = triggers[1]?.getAttribute("aria-controls");
    expect(triggerId).toBeTruthy();
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId ?? "")).toHaveAttribute("aria-labelledby", triggerId);

    const ids = Array.from(document.querySelectorAll("[id]"), ({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("switches every question and answer live while preserving logical RTL ownership", async () => {
    const user = userEvent.setup();
    renderFaq({ withLocaleControl: true });

    await user.click(screen.getByRole("button", { name: "العربية" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));

    const faq = document.querySelector("section#faq") as HTMLElement;
    const triggers = within(faq).getAllByRole("button");
    expect(triggers).toHaveLength(6);

    for (const [index, questionKey] of FAQ_QUESTION_KEYS.entries()) {
      const answerKey = FAQ_ANSWER_KEYS[index];
      if (!answerKey) {
        throw new Error("The FAQ question and answer catalogues must remain index-aligned.");
      }

      const trigger = triggers[index] as HTMLElement;
      expect(trigger).toHaveAccessibleName(ar.marketing[questionKey]);
      await user.click(trigger);
      const panel = faq.querySelector('[data-slot="marketing-faq-panel"]');
      expect(panel).toBeVisible();
      expect(panel).toHaveTextContent(ar.marketing[answerKey]);
      expect(panel).not.toHaveTextContent(en.marketing[answerKey]);
    }

    for (const indicator of faq.querySelectorAll('[data-slot="marketing-faq-indicator"]')) {
      expect(indicator.className).not.toMatch(/\b(?:ml|mr|left|right)-/);
      expect(indicator).toHaveAttribute("aria-hidden", "true");
    }
    for (const trigger of triggers) {
      expect(trigger.className).not.toMatch(/\b(?:ml|mr|pl|pr|left|right)-/);
    }
    const isolatedTerms = faq.querySelectorAll('bdi[dir="ltr"]');
    expect(isolatedTerms.length).toBeGreaterThan(0);
    for (const term of isolatedTerms) {
      expect(TECHNICAL_TERMS_FOR_TEST).toContain(term.textContent);
    }
  });

  it("uses measured, token-owned reveal motion with an explicit reduced-motion state", () => {
    const css = readFileSync(join(import.meta.dirname, "marketing-faq.module.css"), "utf8");

    expect(css).toContain("height: var(--accordion-panel-height)");
    expect(css).toContain("var(--motion-moderate)");
    expect(css).toContain("var(--motion-quick)");
    expect(css).toContain("var(--ease-standard)");
    expect(css).toContain('grid-template-areas: "question indicator"');
    expect(css).toContain(".trigger:dir(rtl)");
    expect(css).toContain('grid-template-areas: "indicator question"');
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.panel,[\s\S]*\.indicatorIcon[\s\S]*transition: none/,
    );
    expect(css).not.toMatch(/#[\da-f]{3,8}|\brgb\(|\bhsl\(|\boklch\(|box-shadow|scale|bounce/i);
  });
});
