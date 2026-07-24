"use client";

import { ErrorFallback } from "@/core/errors/error-fallback";
import { useTranslations } from "@/core/providers/locale-provider";

/*
 * Route-level error boundary (Next.js file convention): catches errors
 * thrown by pages and nested layouts — including Server Components, which
 * the client-side core ErrorBoundary can never see. Renders inside the
 * root layout, so theme, fonts, direction, and providers are all intact;
 * the UI is the same shared ErrorFallback the core boundary uses.
 *
 * Recovery: `unstable_retry` re-fetches and re-renders the failed segment
 * (Next 16; plain `reset` would re-render without re-fetching, which cannot
 * recover from a failed server render).
 *
 * Extension point: report `error` (and `error.digest`) to the monitoring
 * infrastructure in `src/core/monitoring` once it exists.
 */
export default function RouteError({
  error,
  unstable_retry: retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  // Renders inside the provider tree, so the ACTIVE locale's copy is used and
  // it re-translates when the visitor switches language.
  const t = useTranslations("error");
  return (
    // Boundary files replace the segment layouts, so this file owns the
    // `<main>` landmark itself (docs/LAYOUT.md § The main landmark).
    <main className="flex flex-1 flex-col">
      <ErrorFallback
        title={t("title")}
        description={t("routeDescription")}
        actionLabel={t("actionLabel")}
        onAction={retry}
        detail={error.digest === undefined ? undefined : t("reference", { digest: error.digest })}
        className="min-h-full flex-1"
      />
    </main>
  );
}
