import { expect, test } from "@playwright/test";

/*
 * Guards the bilingual font-selection contract (docs/DIRECTION_AND_I18N.md).
 * A visible string is not enough: a fallback can look plausible while the
 * intended face never loads. These probes verify both loaded faces and the
 * metrics actually selected by the shared body stack.
 */
const ARABIC_SAMPLE = "المعرفةأساسالتقدموالتصميمالجيديخدمالجميع";
const LATIN_SAMPLE = "Inter keeps bilingual interfaces clear and balanced";
const INTER_WEIGHTS = [400, 500, 600, 700, 800] as const;
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
    async ([arabicSample, latinSample, interWeights, tajawalWeights]) => {
      const rootStyle = getComputedStyle(document.documentElement);
      const interFamily = rootStyle.getPropertyValue("--font-inter").trim();
      const tajawalFamily = rootStyle.getPropertyValue("--font-tajawal").trim();
      const bodyStack = getComputedStyle(document.body).fontFamily;
      const primaryFamily = (stack: string): string => stack.split(",")[0]?.trim() ?? "";
      const interPrimary = primaryFamily(interFamily);
      const tajawalPrimary = primaryFamily(tajawalFamily);

      // Exercise browser font matching through rendered text instead of
      // imperative FontFaceSet.load() calls. Chromium can reject load() with
      // an opaque NetworkError for one face in a comma-separated next/font
      // family (for example "Inter", "Inter Fallback"), losing the face and
      // request that failed. Layout-triggered loading is the production path;
      // ready + primary-family check() + computed ownership + loaded FontFace
      // evidence below remains strict while producing actionable diagnostics.
      // Generated fallback faces remain visible in diagnostics but do not own
      // readiness for their healthy primary family.
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
        ...interWeights.map((weight) => ({
          family: "Inter",
          cssFamily: interPrimary,
          weight,
          sample: latinSample,
        })),
        ...tajawalWeights.map((weight) => ({
          family: "Tajawal",
          cssFamily: tajawalPrimary,
          weight,
          sample: arabicSample,
        })),
      ];
      const renderedProbes = fontChecks.map((check) => {
        const text = document.createElement("span");
        text.style.fontFamily = check.cssFamily;
        text.style.fontSize = "16px";
        text.style.fontWeight = String(check.weight);
        text.textContent = check.sample;
        fixture.append(text);
        return { check, text };
      });
      document.body.append(fixture);

      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await document.fonts.ready;

      const faces = Array.from(document.fonts).map((face) => ({
        family: face.family,
        weight: face.weight,
        status: face.status,
      }));
      const checks = renderedProbes.map(({ check, text }) => {
        const style = getComputedStyle(text);
        return {
          ...check,
          computedFamily: style.fontFamily,
          computedWeight: style.fontWeight,
          loaded: document.fonts.check(`${check.weight} 16px ${check.cssFamily}`, check.sample),
        };
      });

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
        interPrimary,
        tajawalFamily,
        tajawalPrimary,
        bodyStack,
        fontSetStatus: document.fonts.status,
        checks,
        faces,
        latinStackWidth: measure(latinSample, bodyStack),
        interWidth: measure(latinSample, interPrimary),
        arialLatinWidth: measure(latinSample, "Arial"),
        arabicStackWidth: measure(arabicSample, bodyStack),
        tajawalWidth: measure(arabicSample, tajawalPrimary),
        arialArabicWidth: measure(arabicSample, "Arial"),
      };
      fixture.remove();
      return result;
    },
    [ARABIC_SAMPLE, LATIN_SAMPLE, INTER_WEIGHTS, TAJAWAL_WEIGHTS] as const,
  );

  const diagnostics = JSON.stringify(
    {
      fontSetStatus: probe.fontSetStatus,
      generatedStacks: {
        inter: probe.interFamily,
        tajawal: probe.tajawalFamily,
      },
      primaryFamilies: {
        inter: probe.interPrimary,
        tajawal: probe.tajawalPrimary,
      },
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
  expect(probe.interPrimary, diagnostics).not.toBe("");
  expect(probe.tajawalPrimary, diagnostics).not.toBe("");
  expect(probe.fontSetStatus, diagnostics).toBe("loaded");
  expect(
    Array.from(fontRequests.values()).filter(
      (request) => request.failure !== undefined || request.status !== 200,
    ),
    diagnostics,
  ).toEqual([]);
  expect(
    probe.checks.map((check) => ({
      family: check.family,
      weight: check.weight,
      loaded: check.loaded,
      computedFamily: firstFamily(check.computedFamily),
      computedWeight: check.computedWeight,
    })),
    diagnostics,
  ).toEqual(
    probe.checks.map((check) => ({
      family: check.family,
      weight: check.weight,
      loaded: true,
      computedFamily: firstFamily(check.cssFamily),
      computedWeight: String(check.weight),
    })),
  );
  for (const weight of INTER_WEIGHTS) {
    expect(loadedFace(firstFamily(probe.interPrimary), weight), diagnostics).toBe(true);
  }
  for (const weight of TAJAWAL_WEIGHTS) {
    expect(loadedFace(firstFamily(probe.tajawalPrimary), weight), diagnostics).toBe(true);
  }

  expect(firstFamily(probe.bodyStack), diagnostics).toBe(firstFamily(probe.tajawalFamily));

  // Script selection, not locale-specific component classes, chooses the face.
  expect(Math.abs(probe.latinStackWidth - probe.interWidth), diagnostics).toBeLessThan(0.5);
  expect(Math.abs(probe.latinStackWidth - probe.arialLatinWidth), diagnostics).toBeGreaterThan(1);
  expect(Math.abs(probe.arabicStackWidth - probe.tajawalWidth), diagnostics).toBeLessThan(0.5);
  expect(Math.abs(probe.arabicStackWidth - probe.arialArabicWidth), diagnostics).toBeGreaterThan(1);
});
