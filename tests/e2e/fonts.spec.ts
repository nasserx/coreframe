import { expect, test } from "@playwright/test";

/*
 * Guards the bilingual font-selection contract (docs/DIRECTION_AND_I18N.md).
 * A visible string is not enough: a fallback can look plausible while the
 * intended face never loads. These probes verify both loaded faces and the
 * metrics actually selected by the shared body stack.
 */
const ARABIC_SAMPLE = "المعرفةأساسالتقدموالتصميمالجيديخدمالجميع";
const LATIN_SAMPLE = "Inter keeps bilingual interfaces clear and balanced";
const TAJAWAL_WEIGHTS = [400, 500, 700, 800] as const;

test("Inter and Tajawal load and render their respective scripts", async ({ page }) => {
  const fontRequests = new Map<string, { url: string; status?: number; failure?: string }>();
  const responseErrors: Array<{ url: string; status: number }> = [];
  const consoleErrors: string[] = [];

  page.on("request", (request) => {
    if (request.resourceType() === "font") {
      fontRequests.set(request.url(), { url: request.url() });
    }
  });
  page.on("response", (response) => {
    if (response.request().resourceType() === "font") {
      fontRequests.set(response.url(), {
        ...fontRequests.get(response.url()),
        url: response.url(),
        status: response.status(),
      });
    }
    if (response.status() >= 400) {
      responseErrors.push({ url: response.url(), status: response.status() });
    }
  });
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText ?? "unknown request failure";
    if (request.resourceType() === "font") {
      fontRequests.set(request.url(), { url: request.url(), failure });
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/showcase/direction");
  await page.waitForLoadState("networkidle");

  const probe = await page.evaluate(
    async ([arabicSample, latinSample, tajawalWeights]) => {
      const rootStyle = getComputedStyle(document.documentElement);
      const interFamily = rootStyle.getPropertyValue("--font-inter").trim();
      const tajawalFamily = rootStyle.getPropertyValue("--font-tajawal").trim();
      const bodyStack = getComputedStyle(document.body).fontFamily;

      // Exercise browser font matching through rendered text instead of
      // imperative FontFaceSet.load() calls. Chromium can reject load() with
      // an opaque NetworkError for one face in a comma-separated next/font
      // family (for example "Inter", "Inter Fallback"), losing the face and
      // request that failed. Layout-triggered loading is the production path;
      // ready + check() + loaded FontFace evidence below remains strict while
      // producing actionable diagnostics.
      const fixture = document.createElement("div");
      fixture.setAttribute("aria-hidden", "true");
      Object.assign(fixture.style, {
        position: "fixed",
        insetInlineStart: "0",
        top: "0",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        opacity: "0",
        pointerEvents: "none",
      });

      const fontChecks = [
        { family: "Inter", cssFamily: interFamily, weight: 400, sample: latinSample },
        ...tajawalWeights.map((weight) => ({
          family: "Tajawal",
          cssFamily: tajawalFamily,
          weight,
          sample: arabicSample,
        })),
      ];
      for (const check of fontChecks) {
        const text = document.createElement("span");
        text.style.fontFamily = check.cssFamily;
        text.style.fontSize = "16px";
        text.style.fontWeight = String(check.weight);
        text.textContent = check.sample;
        fixture.append(text);
      }
      document.body.append(fixture);

      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await document.fonts.ready;

      const faces = Array.from(document.fonts).map((face) => ({
        family: face.family,
        weight: face.weight,
        status: face.status,
      }));
      const checks = fontChecks.map((check) => ({
        ...check,
        loaded: document.fonts.check(`${check.weight} 16px ${check.cssFamily}`, check.sample),
      }));

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (context === null) {
        throw new Error("canvas 2d context unavailable");
      }
      const measure = (sample: string, fontFamily: string): number => {
        context.font = `32px ${fontFamily}`;
        return context.measureText(sample).width;
      };

      const result = {
        interFamily,
        tajawalFamily,
        bodyStack,
        fontSetStatus: document.fonts.status,
        checks,
        faces,
        latinStackWidth: measure(latinSample, bodyStack),
        interWidth: measure(latinSample, interFamily),
        arialLatinWidth: measure(latinSample, "Arial"),
        arabicStackWidth: measure(arabicSample, bodyStack),
        tajawalWidth: measure(arabicSample, tajawalFamily),
        arialArabicWidth: measure(arabicSample, "Arial"),
      };
      fixture.remove();
      return result;
    },
    [ARABIC_SAMPLE, LATIN_SAMPLE, TAJAWAL_WEIGHTS] as const,
  );

  const diagnostics = JSON.stringify(
    {
      fontSetStatus: probe.fontSetStatus,
      checks: probe.checks,
      faces: probe.faces,
      requests: Array.from(fontRequests.values()),
      responseErrors,
      consoleErrors,
    },
    null,
    2,
  );
  const firstFamily = (stack: string): string =>
    stack.split(",")[0]?.trim().replaceAll('"', "") ?? "";
  const loadedFace = (family: string, weight: number): boolean =>
    probe.faces.some(
      (face) =>
        firstFamily(face.family).toLowerCase() === family.toLowerCase() &&
        face.weight === String(weight) &&
        face.status === "loaded",
    );

  expect(probe.interFamily, diagnostics).not.toBe("");
  expect(probe.tajawalFamily, diagnostics).not.toBe("");
  expect(probe.fontSetStatus, diagnostics).toBe("loaded");
  expect(
    Array.from(fontRequests.values()).filter(
      (request) => request.failure !== undefined || request.status !== 200,
    ),
    diagnostics,
  ).toEqual([]);
  expect(
    probe.checks.every((check) => check.loaded),
    diagnostics,
  ).toBe(true);
  expect(loadedFace(firstFamily(probe.interFamily), 400), diagnostics).toBe(true);
  for (const weight of TAJAWAL_WEIGHTS) {
    expect(loadedFace(firstFamily(probe.tajawalFamily), weight), diagnostics).toBe(true);
  }

  expect(firstFamily(probe.bodyStack), diagnostics).toBe(firstFamily(probe.tajawalFamily));

  // Script selection, not locale-specific component classes, chooses the face.
  expect(Math.abs(probe.latinStackWidth - probe.interWidth), diagnostics).toBeLessThan(0.5);
  expect(Math.abs(probe.latinStackWidth - probe.arialLatinWidth), diagnostics).toBeGreaterThan(1);
  expect(Math.abs(probe.arabicStackWidth - probe.tajawalWidth), diagnostics).toBeLessThan(0.5);
  expect(Math.abs(probe.arabicStackWidth - probe.arialArabicWidth), diagnostics).toBeGreaterThan(1);
});
