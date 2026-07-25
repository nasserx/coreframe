import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { getTranslations } from "@/i18n";
import { cn } from "@/lib/utils";

// Server Component: statically prerendered in the build-time default locale, so
// its copy comes from the default catalogue via the synchronous server
// translator (no per-request work — the route stays static).
const t = getTranslations("notFound");

export const metadata: Metadata = {
  title: t("metaTitle"),
};

/*
 * Root not-found boundary (Next.js file convention): rendered for every
 * unmatched URL app-wide and for explicit `notFound()` calls. Renders
 * inside the root layout, so theme, fonts, and direction apply as on any
 * page; unlike the error files this is a static Server Component, so it
 * may use the UI primitives directly. As a boundary file it renders without
 * the segment layouts, so it owns the `<main>` landmark itself
 * (docs/LAYOUT.md § The main landmark).
 */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-small font-medium text-muted-foreground">{t("code")}</p>
      <h1 className="text-body font-medium text-foreground">{t("title")}</h1>
      <p className="max-w-prose text-small text-muted-foreground">{t("description")}</p>
      {/* Navigation styled as a button: buttonVariants on a real Link, so
          the element keeps link semantics (role, middle-click, focus
          behavior). Button + render would re-brand it role="button". */}
      <Link href="/" className={cn(buttonVariants(), "mt-1")}>
        {t("homeAction")}
      </Link>
    </main>
  );
}
