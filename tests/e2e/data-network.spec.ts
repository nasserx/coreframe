import { expect, type Request, test } from "@playwright/test";

import { gotoMatrixCell } from "./matrix";
import { DIRECTIONS, THEMES } from "./routes";

const recordsEndpoint = "/api/showcase/records";

function isRecordsRequest(request: Request) {
  const url = new URL(request.url());

  return request.method() === "GET" && url.pathname === recordsEndpoint && url.search === "";
}

test.describe("Data showcase production network lifecycle", () => {
  for (const theme of THEMES) {
    for (const direction of DIRECTIONS) {
      test(`${theme}, ${direction}`, async ({ page }) => {
        const requestFailures: string[] = [];
        const recordsRequests: Request[] = [];
        const successfulRecordsResponses = new Set<Request>();
        const completedRecordsRequests = new Set<Request>();

        page.on("request", (request) => {
          if (isRecordsRequest(request)) {
            recordsRequests.push(request);
          }
        });

        page.on("response", (response) => {
          const request = response.request();

          if (isRecordsRequest(request) && response.status() === 200) {
            successfulRecordsResponses.add(request);
          }
        });

        page.on("requestfinished", (request) => {
          if (successfulRecordsResponses.has(request)) {
            completedRecordsRequests.add(request);
          }
        });

        page.on("requestfailed", (request) => {
          const failure = request.failure();

          requestFailures.push(
            `request failed: ${request.url()} (${failure?.errorText ?? "unknown"})`,
          );
        });

        await gotoMatrixCell(page, "/showcase/data", theme, direction);

        await expect(page.getByText("Alpha", { exact: true })).toBeVisible();
        await expect(page.getByText("Beta", { exact: true })).toBeVisible();
        await expect(page.getByText("Gamma", { exact: true })).toBeVisible();

        expect(recordsRequests).toHaveLength(1);
        expect(successfulRecordsResponses.size).toBe(1);
        expect(completedRecordsRequests.size).toBe(1);
        expect([...completedRecordsRequests][0]).toBe(recordsRequests[0]);
        expect(requestFailures).toEqual([]);
      });
    }
  }
});
