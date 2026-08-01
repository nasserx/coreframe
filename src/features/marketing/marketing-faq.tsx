"use client";

import type { ReactNode } from "react";
import { Accordion } from "@base-ui/react/accordion";
import { ChevronDownIcon } from "lucide-react";

import { Container } from "@/components/ui/container";
import { useTranslations } from "@/core/providers/locale-provider";

import { marketingReveal } from "./marketing-motion";
import { MarketingSectionIntro } from "./marketing-section-intro";
import styles from "./marketing-faq.module.css";

type FaqItem = Readonly<{
  id: string;
  question: string;
  answer: string;
}>;

const TECHNICAL_TERMS = new Set([
  "App Router",
  "API",
  "AppShell",
  "Base UI",
  "Coreframe",
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
]);

const TECHNICAL_TERM_PATTERN =
  /(Coreframe|App Router|Base UI|Next\.js|TypeScript|SiteShell|AppShell|Showcase|Tajawal|Inter|LTR|RTL|URL|API|SVG|lang|dir)/g;

function BidiText({ children }: Readonly<{ children: string }>): ReactNode {
  return children.split(TECHNICAL_TERM_PATTERN).map((part, index) =>
    TECHNICAL_TERMS.has(part) ? (
      <bdi key={`${part}-${index}`} dir="ltr">
        {part}
      </bdi>
    ) : (
      part
    ),
  );
}

/**
 * Feature-owned FAQ boundary. Base UI owns the disclosure state, native
 * buttons, keyboard behavior, and ARIA relationships; this component owns only
 * translated marketing content and token-driven presentation.
 */
export function MarketingFaq() {
  const t = useTranslations("marketing");

  const items: readonly FaqItem[] = [
    {
      id: "included",
      question: t("faqIncludedQuestion"),
      answer: t("faqIncludedAnswer"),
    },
    {
      id: "language-direction",
      question: t("faqLanguageQuestion"),
      answer: t("faqLanguageAnswer"),
    },
    {
      id: "branding",
      question: t("faqBrandingQuestion"),
      answer: t("faqBrandingAnswer"),
    },
    {
      id: "showcase",
      question: t("faqShowcaseQuestion"),
      answer: t("faqShowcaseAnswer"),
    },
    {
      id: "static-generation",
      question: t("faqStaticQuestion"),
      answer: t("faqStaticAnswer"),
    },
    {
      id: "security",
      question: t("faqSecurityQuestion"),
      answer: t("faqSecurityAnswer"),
    },
  ];

  return (
    <section id="faq" aria-labelledby="faq-heading" className="border-t">
      <Container className="py-20 sm:py-24">
        <MarketingSectionIntro
          eyebrow={t("faqEyebrow")}
          headingId="faq-heading"
          title={t("faqTitle")}
          lead={t("faqLead")}
        />

        {/* The list enters once as a whole. Disclosure open/close motion stays
            entirely Base UI's and is never touched by the reveal. */}
        <Accordion.Root
          {...marketingReveal("mx-auto mt-10 max-w-prose border-y")}
          data-slot="marketing-faq-accordion"
        >
          {items.map(({ id, question, answer }) => (
            <Accordion.Item
              key={id}
              value={id}
              data-slot="marketing-faq-item"
              className="border-t first:border-t-0"
            >
              <Accordion.Header className="text-base">
                <Accordion.Trigger
                  id={`faq-${id}-trigger`}
                  data-slot="marketing-faq-trigger"
                  className={`${styles["trigger"]} min-h-14 w-full px-4 py-4 font-semibold transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset data-panel-open:bg-accent`}
                >
                  <span
                    data-slot="marketing-faq-question"
                    className={`${styles["question"]} min-w-0`}
                  >
                    <BidiText>{question}</BidiText>
                  </span>
                  <span
                    aria-hidden="true"
                    data-slot="marketing-faq-indicator"
                    className={`${styles["indicator"]} flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors`}
                  >
                    <ChevronDownIcon
                      data-slot="marketing-faq-indicator-icon"
                      className={`${styles["indicatorIcon"]} size-4`}
                    />
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel
                id={`faq-${id}-panel`}
                data-slot="marketing-faq-panel"
                className={styles["panel"]}
              >
                <p className="mx-auto max-w-prose px-4 pt-1 pb-5 text-center text-body text-muted-foreground">
                  <BidiText>{answer}</BidiText>
                </p>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </Container>
    </section>
  );
}
