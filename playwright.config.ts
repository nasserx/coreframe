import { defineConfig } from "@playwright/test";

const PROD_PORT = 3100;
// Next allows one dev server per directory, so reuse the default dev port —
// a locally running `npm run dev` is picked up instead of conflicting.
const DEV_PORT = 3000;

/*
 * Browser-level layer (tests/e2e). Unit/component tests belong to Vitest —
 * see vitest.config.ts and docs/TESTING.md.
 *
 * Two servers, deliberately:
 *
 * - `chromium-dev` (next dev): the console-cleanliness harness. React only
 *   REPORTS attribute-level hydration mismatches in development builds —
 *   production silently ignores them (verified by reintroducing the
 *   historical Pagination data-slot defect: prod console stayed clean, dev
 *   failed loudly). Hydration detection therefore requires the dev server.
 * - `chromium-prod` (next start, requires `npm run build` first): font
 *   loading, accessibility scans, and the app-shell operability tests run
 *   against exactly what ships.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: process.env["CI"] !== undefined,
  reporter: [["list"]],
  projects: [
    {
      name: "chromium-dev",
      testMatch: /console-clean\.spec\.ts/,
      use: { baseURL: `http://localhost:${DEV_PORT}` },
      // Dev-server routes cold-compile on first hit; under full parallel
      // load the heaviest page can exceed the default 30s.
      timeout: 60_000,
      // A request that races a Turbopack HMR invalidation (source file
      // written while the suite runs) can transiently 500 with duplicated
      // module instances. One retry absorbs exactly that; genuine app
      // errors — e.g. a hydration mismatch — fail deterministically on
      // every attempt, so the net is not weakened.
      retries: 1,
    },
    {
      name: "chromium-prod",
      testMatch: /(fonts|a11y|shell)\.spec\.ts/,
      use: { baseURL: `http://localhost:${PROD_PORT}` },
    },
  ],
  webServer: [
    {
      command: `npx next dev --port ${DEV_PORT}`,
      url: `http://localhost:${DEV_PORT}`,
      reuseExistingServer: process.env["CI"] === undefined,
      timeout: 120_000,
    },
    {
      command: `npx next start --port ${PROD_PORT}`,
      url: `http://localhost:${PROD_PORT}`,
      reuseExistingServer: process.env["CI"] === undefined,
      timeout: 60_000,
    },
  ],
});
