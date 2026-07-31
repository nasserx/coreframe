"use client";

import { useTranslations } from "@/core/providers/locale-provider";

import { REFERENCE_FORM_DEMO } from "../reference-form-contract";
import { ReferenceForm } from "./reference-form";
import { ShowcaseSection } from "./showcase-section";

/**
 * The `/showcase/forms` reference-form section: what the example proves, the
 * form itself, the two deterministic demonstration values, and a short note on
 * which library owns which concern.
 *
 * Client-owned because every string follows the LIVE locale — the point of the
 * example is that labels, help text, validation messages, and server-owned
 * errors all switch language without losing entered values.
 */
export function ReferenceFormSection() {
  const t = useTranslations("showcaseForm");

  return (
    <ShowcaseSection title={t("sectionTitle")} description={t("sectionDescription")}>
      <div className="flex max-w-form flex-col gap-6">
        <ReferenceForm />
        <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
          <p className="text-small font-semibold">{t("demoTitle")}</p>
          <ul className="flex flex-col gap-1 text-small text-muted-foreground">
            {/*
             * The addresses are Latin tokens inside prose that may be Arabic,
             * so each is isolated with <bdi dir="ltr"> — the documented
             * convention for opposite-direction runs
             * (docs/DIRECTION_AND_I18N.md § Bidi isolation).
             */}
            <li className="flex flex-wrap items-baseline gap-x-2">
              <bdi dir="ltr" className="font-mono text-caption text-foreground">
                {REFERENCE_FORM_DEMO.fieldErrorEmail}
              </bdi>
              <span>{t("demoFieldError")}</span>
            </li>
            <li className="flex flex-wrap items-baseline gap-x-2">
              <bdi dir="ltr" className="font-mono text-caption text-foreground">
                {REFERENCE_FORM_DEMO.formErrorEmail}
              </bdi>
              <span>{t("demoFormError")}</span>
            </li>
            <li>{t("demoSuccess")}</li>
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-small font-semibold">{t("noteTitle")}</p>
          <ul className="ms-4 flex list-disc flex-col gap-1 text-small text-muted-foreground">
            <li>{t("noteState")}</li>
            <li>{t("noteValidation")}</li>
            <li>{t("noteTransport")}</li>
            <li>{t("noteMapping")}</li>
          </ul>
        </div>
      </div>
    </ShowcaseSection>
  );
}
