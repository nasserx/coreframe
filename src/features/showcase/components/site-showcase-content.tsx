"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Stack } from "@/components/ui/stack";
import { LOCALE_INFO } from "@/config";
import { useLocale, useTranslations } from "@/core/providers/locale-provider";

import { ShowcaseSection } from "./showcase-section";

/**
 * The `(site)` showcase body, as a client component so it re-renders when the
 * visitor switches language — the message-translation proof. It also exercises
 * locale-aware NUMBER formatting: the locale count runs through
 * `Intl.NumberFormat` with the active locale's configured numbering system
 * (`LOCALE_INFO.numerals`), so a deployment that sets Arabic to `arab` gets
 * Eastern Arabic-Indic digits with no code change here.
 */
export function SiteShowcaseContent() {
  const t = useTranslations("site");
  const { locale, availableLocales } = useLocale();

  const localeCount = new Intl.NumberFormat(
    `${locale}-u-nu-${LOCALE_INFO[locale].numerals}`,
  ).format(availableLocales.length);

  return (
    <>
      {/*
        Hero, not a PageHeader: this page demonstrates SiteShell as marketing
        chrome, so it leads the viewport with the identity's headline voice —
        display type, generous vertical breathing room, and the flat button
        pair. All copy is translated; the whole surface mirrors under Arabic.
      */}
      <Stack gap="lg" className="items-start py-16 sm:py-24">
        <Stack gap="md" className="items-start">
          <h1 className="max-w-prose text-title sm:text-display">{t("heroTitle")}</h1>
          <p className="max-w-prose text-body-lg">{t("heroLead")}</p>
          {/* Interpolation + locale-aware numerals in one line. */}
          <p className="max-w-prose text-small text-muted-foreground">
            {t("localesCount", { count: localeCount })}
          </p>
        </Stack>
        <div className="flex flex-wrap items-center gap-3">
          {/* Navigation styled as buttons: buttonVariants on real Links, so
              the elements keep link semantics. Button + render would re-brand
              them role="button". */}
          <Link
            href="/showcase/layout"
            className={buttonVariants({ size: "lg", className: "h-10 px-6 font-semibold" })}
          >
            {t("heroPrimaryCta")}
          </Link>
          <Link
            href="/showcase"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "h-10 px-6 font-semibold",
            })}
          >
            {t("heroSecondaryCta")}
          </Link>
        </div>
      </Stack>
      <ShowcaseSection title={t("collapseTitle")} description={t("collapseDescription")} />
      <ShowcaseSection title={t("directionTitle")} description={t("directionDescription")} />
    </>
  );
}
