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
 *   loading, accessibility scans, the shell operability tests, and the
 *   horizontal-overflow sweep run against exactly what ships.
 *
 * A deleted or renamed spec must also be removed from the testMatch
 * patterns below — a stale name rots silently (docs/CLONING.md).
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
      // One retry absorbs the dev server's transient, non-app flakes, which
      // come in two observed forms: (1) a request that races a Turbopack HMR
      // invalidation (source file written while the suite runs) can 500 with
      // duplicated module instances; (2) under `fullyParallel`, a heavier
      // route's first (cold) compile can occasionally miss the 60s
      // `networkidle` wait — the navigation times out before the console
      // assertion even runs, so no finding is produced. Both are
      // environmental, not app defects. Genuine app errors — a hydration
      // mismatch, a real console warning — are deterministic and fail on
      // EVERY attempt, so the net is not weakened. Do not raise this to mask
      // a finding: a test that fails then passes with an actual console
      // message recorded is a real bug, not this.
      retries: 1,
    },
    {
      name: "chromium-prod",
      testMatch: /(fonts|a11y|shell|errors|overflow)\.spec\.ts/,
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
