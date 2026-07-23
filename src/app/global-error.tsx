"use client";

import { useEffect } from "react";

import { APP_CONFIG } from "@/config";
import { ErrorFallback } from "@/core/errors/error-fallback";
import { applyStoredTheme, THEME_INIT_SCRIPT } from "@/core/providers/theme-provider";
import { FONT_VARIABLE_CLASSES } from "./fonts";
import "./globals.css";

/*
 * Last-resort boundary: fires only when the root layout itself throws, and
 * REPLACES it — so this file must rebuild the document shell the layout
 * normally provides: <html> with lang/dir from APP_CONFIG, the font
 * variable classes, the stylesheet import, and the pre-paint theme script
 * (the provider tree is gone, so the script is inlined directly; it reads
 * the same localStorage key and system preference as ThemeProvider).
 *
 * Recovery: `unstable_retry` re-fetches and re-renders from the root. No
 * metadata export is allowed here (client component) — <title> is set via
 * React's built-in hoisting.
 */
export default function GlobalError({
  error,
  unstable_retry: retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  // Client-swap path: the inline script below does not execute when this
  // document is created by a client-side render error (see applyStoredTheme).
  useEffect(() => {
    applyStoredTheme();
  }, []);

  return (
    <html
      lang={APP_CONFIG.defaultLocale}
      dir={APP_CONFIG.direction}
      className={`${FONT_VARIABLE_CLASSES} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <title>{`Something went wrong — ${APP_CONFIG.name}`}</title>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {/* This file rebuilds the document, so it owns the `<main>`
            landmark itself (docs/LAYOUT.md § The main landmark). */}
        <main className="flex flex-1 flex-col">
          <ErrorFallback
            description="The application failed to render. Try again, or reload the page if the problem persists."
            onAction={retry}
            detail={error.digest === undefined ? undefined : `Reference: ${error.digest}`}
            className="min-h-full flex-1"
          />
        </main>
      </body>
    </html>
  );
}
