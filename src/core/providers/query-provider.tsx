"use client";

import type { ReactNode } from "react";
import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";

/*
 * Foundation defaults only — product caching policy belongs at the query
 * call site, not here.
 *
 * - `staleTime: 60s` prevents immediate client refetches of data that was
 *   just rendered on the server (the React Query SSR recommendation).
 * - `retry: false` surfaces failures immediately; silent built-in retries
 *   delay and mask errors during development. Queries that genuinely need
 *   retries opt in individually.
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/*
 * Server: always a fresh client, so requests never share cache state.
 * Browser: a module-level singleton, so Suspense re-renders and provider
 * remounts never discard the cache.
 */
function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient();
  }
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export type QueryProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Provides the application-wide React Query client. Foundation
 * configuration only — no product caching decisions and no Devtools.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = getQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
