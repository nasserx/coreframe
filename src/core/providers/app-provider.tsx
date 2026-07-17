import type { ReactNode } from "react";

import { ErrorBoundary } from "@/core/errors/error-boundary";

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
 * Order: ErrorBoundary sits inside Theme/Query so its fallback renders with
 * correct theming and future fallbacks can use queries; Toaster renders
 * inside the boundary so notifications inherit the same guarantees.
 *
 * This file is a Server Component by design — each provider owns its client
 * boundary, keeping the app shell server-rendered (see FOUNDATION_REVIEW.md,
 * Runtime Review).
 */
export function AppProvider({ children }: AppProviderProps) {
  // TODO: Add Authentication provider.
  // TODO: Add Localization provider.
  return (
    <ThemeProvider>
      <QueryProvider>
        <ErrorBoundary>
          {children}
          <Toaster />
        </ErrorBoundary>
      </QueryProvider>
    </ThemeProvider>
  );
}
