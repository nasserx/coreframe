import { expect, type Request, test } from "@playwright/test";

import { gotoMatrixCell } from "./matrix";
import { DIRECTIONS, discoverRoutes, THEMES } from "./routes";

/*
 * The regression net for the failure class static analysis cannot see:
 * every route, in every theme × direction cell, must produce a completely
 * clean browser console — no errors, no warnings, no uncaught exceptions,
 * no unexpected failed requests.
 *
 * This suite runs against the DEV server (see playwright.config.ts): React
 * reports hydration mismatches to the console only in development builds —
 * production ignores attribute-level mismatches silently, which is exactly
 * how the Pagination data-slot defect shipped past a green build. Dev-only
 * React warnings are the detection signal, not noise.
 *
 * There is deliberately no message allowlist. The one expected development
 * request cancellation is instead proved by an exact, positive lifecycle
 * contract below.
 */
const routes = discoverRoutes();
const dataShowcaseRoute = "/showcase/data";
const recordsEndpoint = "/api/showcase/records";

function isRecordsRequest(request: Request) {
  const url = new URL(request.url());

  return request.method() === "GET" && url.pathname === recordsEndpoint && url.search === "";
}

for (const route of routes) {
  for (const theme of THEMES) {
    for (const direction of DIRECTIONS) {
      test(`console clean: ${route} [${theme} ${direction}]`, async ({ page }) => {
        const findings: string[] = [];
        const recordsRequests: Request[] = [];
        const canceledRecordsRequests: Request[] = [];
        const successfulRecordsResponses = new Set<Request>();
        const completedRecordsRequests = new Set<Request>();

        page.on("request", (request) => {
          if (route === dataShowcaseRoute && isRecordsRequest(request)) {
            recordsRequests.push(request);
          }
        });

        page.on("response", (response) => {
          const request = response.request();

          if (
            route === dataShowcaseRoute &&
            isRecordsRequest(request) &&
            response.status() === 200
          ) {
            successfulRecordsResponses.add(request);
          }
        });

        page.on("requestfinished", (request) => {
          if (route === dataShowcaseRoute && successfulRecordsResponses.has(request)) {
            completedRecordsRequests.add(request);
          }
        });

        page.on("console", (message) => {
          const type = message.type();
          if (type === "error" || type === "warning") {
            findings.push(`console.${type}: ${message.text()}`);
          }
        });
        page.on("pageerror", (error) => {
          findings.push(`uncaught exception: ${error.message}`);
        });
        page.on("requestfailed", (request) => {
          const failure = request.failure();

          // Next.js development hydration replays passive effects in React Strict
          // Mode, so TanStack Query cancels this first request and replaces it.
          if (
            route === dataShowcaseRoute &&
            isRecordsRequest(request) &&
            failure?.errorText === "net::ERR_ABORTED"
          ) {
            canceledRecordsRequests.push(request);
            return;
          }

          findings.push(`request failed: ${request.url()} (${failure?.errorText ?? "unknown"})`);
        });

        await gotoMatrixCell(page, route, theme, direction);

        if (route === dataShowcaseRoute) {
          await expect(page.getByText("Alpha", { exact: true })).toBeVisible();
          await expect(page.getByText("Beta", { exact: true })).toBeVisible();
          await expect(page.getByText("Gamma", { exact: true })).toBeVisible();

          expect(recordsRequests).toHaveLength(2);
          expect(canceledRecordsRequests).toHaveLength(1);
          expect(successfulRecordsResponses.size).toBe(1);
          expect(completedRecordsRequests.size).toBe(1);

          const canceledRequest = canceledRecordsRequests[0]!;
          const completedRequest = [...completedRecordsRequests][0]!;

          expect(recordsRequests).toContain(canceledRequest);
          expect(recordsRequests).toContain(completedRequest);
          expect(canceledRequest).not.toBe(completedRequest);
        }

        expect(findings).toEqual([]);
      });
    }
  }
}
