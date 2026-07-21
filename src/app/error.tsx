"use client";

import { ErrorFallback } from "@/core/errors/error-fallback";

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
  return (
    // Boundary files replace the segment layouts, so this file owns the
    // `<main>` landmark itself (docs/LAYOUT.md § The main landmark).
    <main className="flex flex-1 flex-col">
      <ErrorFallback
        description="An unexpected error occurred while loading this page. Try again, or reload if the problem persists."
        onAction={retry}
        detail={error.digest === undefined ? undefined : `Reference: ${error.digest}`}
        className="min-h-full flex-1"
      />
    </main>
  );
}
