import type { ReactNode } from "react";

import { ErrorBoundary } from "@/core/errors/error-boundary";

import { LocaleProvider } from "./locale-provider";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./toaster";

type AppProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Application composition root. Composes the runtime providers in their
 * required order and nothing else — implementation logic lives in the
 * individual provider files.
 *
 * Order: ErrorBoundary sits inside Theme/Locale/Query so its fallback renders
 * with correct theming, direction, and translated copy, and future fallbacks
 * can use queries; Toaster renders inside the boundary so notifications inherit
 * the same guarantees. LocaleProvider is the concrete Localization slot — it
 * owns `<html lang/dir>` and the active message catalogue (single-locale
 * deployments pay essentially nothing; see locale-provider.tsx).
 *
 * This file is a Server Component by design: each provider carries its own
 * `"use client"` boundary, so composing them here does NOT make the tree it
 * wraps a client tree — the root layout and every page below stay
 * server-rendered. Adding `"use client"` to this file would pull all of them
 * across the boundary at once.
 */
export function AppProvider({ children }: AppProviderProps) {
  // TODO: Add Authentication provider.
  return (
    <ThemeProvider>
      <LocaleProvider>
        <QueryProvider>
          <ErrorBoundary>
            {children}
            <Toaster />
          </ErrorBoundary>
        </QueryProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
