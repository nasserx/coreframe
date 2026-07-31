import AxeBuilder from "@axe-core/playwright";
import { type ConsoleMessage, expect, type Page, test } from "@playwright/test";

import { gotoMatrixCell } from "./matrix";
import { THEMES } from "./routes";

/*
 * The /showcase/forms reference form in a real browser: the wiring that only a
 * running build can falsify — RHF's first-invalid focus against real DOM focus,
 * a real HTTP round trip to the route handler, live locale switching through
 * the actual LocaleProvider, and RTL geometry with an LTR email control.
 *
 * Route-level a11y/console/overflow coverage for this page already comes from
 * discovery (a11y, overflow, console-clean); what is added here is the same
 * scrutiny in the form's ERROR and SUCCESS states, which discovery never
 * reaches. Runs in chromium-prod (against `next start`) — exactly what ships.
 */

const EN = {
  projectName: "Project name",
  ownerEmail: "Owner email",
  goal: "Implementation goal",
  submit: "Submit example",
  nameRequired: "Enter a project name.",
  emailTaken: "This owner email already belongs to another example.",
  unavailable: "The example service is unavailable. Try again.",
  success: "Example accepted",
} as const;

const AR = {
  projectName: "اسم المشروع",
  ownerEmail: "بريد المالك الإلكتروني",
  goal: "هدف التنفيذ",
  submit: "إرسال المثال",
  emailTaken: "هذا البريد يخص مثالًا آخر بالفعل.",
} as const;

/** The label set for one locale — the three controls `fill()` addresses. */
type Labels = Record<"projectName" | "ownerEmail" | "goal", string>;

const DEMO_FIELD_ERROR_EMAIL = "taken@example.com";
const DEMO_FORM_ERROR_EMAIL = "unavailable@example.com";
const VALID_GOAL = "Prove the reference wiring end to end in a real browser.";

const CHECKPOINTS = [320, 390, 1024, 1440] as const;
const ROUTE = "/showcase/forms";
const REFERENCE_ENDPOINT = "/api/showcase/forms/reference";

/** The reference form is the page's only `<form>` (asserted below). */
function form(page: Page) {
  return page.locator("form");
}

/** Switches the LIVE locale through the real control, not a stored preference. */
async function switchToArabic(page: Page): Promise<void> {
  await page.getByRole("button", { name: "العربية" }).click();
  await expect(page.getByLabel(AR.projectName)).toBeVisible();
}

/**
 * The ONE console exemption in this file, deliberately narrow.
 *
 * The documented demonstration values make the endpoint answer 409/503 on
 * purpose, and Chromium logs every failed response at error level. That line is
 * the browser reporting the scenario working — the app's own handling of it is
 * asserted by the server-error tests above. It is exempted here, never in the
 * global `console-clean.spec.ts` allowlist, because only this flow provokes it.
 *
 * Three independent conditions, each of which alone would keep an application
 * error out of the exemption:
 *
 * 1. `type() === "error"` — warnings are never exempt.
 * 2. The text must MATCH Chromium's network-failure sentence from its first
 *    character, with one of the two demonstration statuses. Anchoring means an
 *    app `console.error(...)` that merely quotes the phrase is not exempt, and
 *    no hydration, React, or runtime message can match this shape at all.
 * 3. `location().url` must be the reference endpoint. A failed request to any
 *    other URL — a chunk, a font, an unrelated API — is still noise.
 */
function isDemonstrationRequestFailure(message: ConsoleMessage): boolean {
  return (
    message.type() === "error" &&
    /^Failed to load resource: the server responded with a status of (?:409|503) \(/.test(
      message.text(),
    ) &&
    message.location().url.endsWith(REFERENCE_ENDPOINT)
  );
}

async function gotoForms(page: Page): Promise<void> {
  await page.goto(ROUTE);
  await page.waitForLoadState("networkidle");
}

/** Labels default to English; the Arabic set is passed after a locale switch. */
async function fill(page: Page, email: string, labels: Labels = EN): Promise<void> {
  await page.getByLabel(labels.projectName).fill("Atlas");
  await page.getByLabel(labels.ownerEmail).fill(email);
  await page.getByLabel(labels.goal).fill(VALID_GOAL);
}

test.describe("reference form on /showcase/forms", () => {
  test("client validation blocks the submit and focuses the first invalid control", async ({
    page,
  }) => {
    const requests: string[] = [];
    page.on("request", (request) => {
      if (request.method() === "POST") {
        requests.push(request.url());
      }
    });

    await gotoForms(page);
    await page.getByRole("button", { name: EN.submit }).click();

    await expect(page.getByText(EN.nameRequired)).toBeVisible();
    await expect(page.getByLabel(EN.projectName)).toBeFocused();
    await expect(page.getByLabel(EN.projectName)).toHaveAttribute("aria-invalid", "true");
    // The error is programmatically owned by the control, not merely adjacent.
    const describedBy = await page.getByLabel(EN.projectName).getAttribute("aria-describedby");
    expect(describedBy?.split(" ")).toHaveLength(2);
    // Nothing left the browser: invalid input never reaches the endpoint.
    expect(requests).toEqual([]);
  });

  test("a keyboard-only submission succeeds and announces its reference", async ({ page }) => {
    await gotoForms(page);

    await page.getByLabel(EN.projectName).focus();
    await page.keyboard.type("Atlas");
    await page.keyboard.press("Tab");
    await page.keyboard.type("owner@example.com");
    await page.keyboard.press("Tab");
    await page.keyboard.type(VALID_GOAL);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: EN.submit })).toBeFocused();
    await page.keyboard.press("Enter");

    const status = form(page).getByRole("status");
    await expect(status).toContainText(EN.success);
    await expect(status).toContainText(/REF-[0-9A-Z]{6}/);
    // Values are preserved: the reference does not clear what was entered.
    await expect(page.getByLabel(EN.projectName)).toHaveValue("Atlas");
  });

  test("the pending state disables the action and prevents a duplicate submission", async ({
    page,
  }) => {
    await gotoForms(page);

    // Hold the response open in the browser, so pending state is observable
    // without any artificial delay in the endpoint itself.
    let release: (() => void) | undefined;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    let posts = 0;
    await page.route(`**${REFERENCE_ENDPOINT}`, async (route) => {
      posts += 1;
      await held;
      await route.continue();
    });

    await fill(page, "owner@example.com");
    const submit = page.getByRole("button", { name: EN.submit });
    await submit.click();

    await expect(form(page).getByRole("status")).toContainText("Submitting the example.");
    await expect(page.getByRole("button", { name: "Submitting" })).toBeDisabled();
    // A disabled default button also blocks the implicit Enter submission.
    await page.getByLabel(EN.projectName).press("Enter");
    expect(posts).toBe(1);

    release?.();
    await expect(form(page).getByRole("status")).toContainText(EN.success);
  });

  test("a server field error maps back to its control and keeps the entered values", async ({
    page,
  }) => {
    await gotoForms(page);
    await fill(page, DEMO_FIELD_ERROR_EMAIL);
    await page.getByRole("button", { name: EN.submit }).click();

    const email = page.getByLabel(EN.ownerEmail);
    await expect(page.getByText(EN.emailTaken)).toBeVisible();
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(email).toBeFocused();
    await expect(email).toHaveValue(DEMO_FIELD_ERROR_EMAIL);
    await expect(page.getByLabel(EN.projectName)).toHaveValue("Atlas");
  });

  test("a form-level server error is announced separately and takes focus", async ({ page }) => {
    await gotoForms(page);
    await fill(page, DEMO_FORM_ERROR_EMAIL);
    await page.getByRole("button", { name: EN.submit }).click();

    const alert = form(page).getByRole("alert");
    await expect(alert).toHaveText(EN.unavailable);
    await expect(alert).toBeFocused();
    // Form-level means form-level: no field is marked invalid.
    await expect(page.getByLabel(EN.ownerEmail)).not.toHaveAttribute("aria-invalid", "true");
  });

  test("the form produces no console noise across its error and success paths", async ({
    page,
  }) => {
    // The console listener pattern from console-clean.spec.ts, applied to the
    // flow rather than the page load (docs/TESTING.md § Extending).
    const noise: string[] = [];
    const expectedDemoFailures: string[] = [];
    page.on("console", (message) => {
      if (message.type() !== "error" && message.type() !== "warning") {
        return;
      }
      if (isDemonstrationRequestFailure(message)) {
        expectedDemoFailures.push(message.text());
        return;
      }
      noise.push(`${message.type()}: ${message.text()}`);
    });
    page.on("pageerror", (error) => noise.push(`pageerror: ${error.message}`));

    await gotoForms(page);
    await page.getByRole("button", { name: EN.submit }).click();
    await expect(page.getByText(EN.nameRequired)).toBeVisible();
    await fill(page, DEMO_FORM_ERROR_EMAIL);
    await page.getByRole("button", { name: EN.submit }).click();
    await expect(form(page).getByRole("alert")).toBeVisible();
    await page.getByLabel(EN.ownerEmail).fill("owner@example.com");
    await page.getByRole("button", { name: EN.submit }).click();
    await expect(form(page).getByRole("status")).toContainText(EN.success);

    expect(noise).toEqual([]);
    // The filter must stay live: if Chromium stops emitting this, or the
    // demonstration stops failing, the exemption is silently covering nothing
    // and should be deleted rather than left to rot.
    expect(expectedDemoFailures).toHaveLength(1);
  });
});

test.describe("reference form — locale and direction", () => {
  test("a live language switch translates the form and its existing error", async ({ page }) => {
    await gotoForms(page);
    await fill(page, DEMO_FIELD_ERROR_EMAIL);
    await page.getByRole("button", { name: EN.submit }).click();
    await expect(page.getByText(EN.emailTaken)).toBeVisible();

    await switchToArabic(page);

    // The error was already on screen; it re-renders in Arabic because form
    // state holds a message key, not one locale's prose.
    await expect(page.getByText(AR.emailTaken)).toBeVisible();
    await expect(page.getByLabel(AR.projectName)).toBeVisible();
    await expect(page.getByRole("button", { name: AR.submit })).toBeVisible();
    // Entered values survive the switch.
    await expect(page.getByLabel(AR.projectName)).toHaveValue("Atlas");
    expect(await page.evaluate(() => document.documentElement.dir)).toBe("rtl");
  });

  test("the email control stays LTR inside the RTL form", async ({ page }) => {
    await gotoForms(page);
    await switchToArabic(page);

    const directions = await page.evaluate(() => {
      const inputs = [...document.querySelectorAll("form input")];
      const email = inputs.find((input) => input.getAttribute("type") === "email");
      const text = inputs.find((input) => input.getAttribute("type") !== "email");
      return {
        email: email === undefined ? null : getComputedStyle(email).direction,
        text: text === undefined ? null : getComputedStyle(text).direction,
        document: getComputedStyle(document.documentElement).direction,
      };
    });

    expect(directions.document).toBe("rtl");
    // The email input owns LTR entry; the rest of the form follows the page.
    expect(directions.email).toBe("ltr");
    expect(directions.text).toBe("rtl");
  });

  test("the Arabic form never overflows at the checkpoint widths", async ({ page }) => {
    await gotoForms(page);
    await switchToArabic(page);
    await fill(page, DEMO_FORM_ERROR_EMAIL, AR);
    await page.getByRole("button", { name: AR.submit }).click();
    await expect(form(page).getByRole("alert")).toBeVisible();

    for (const width of CHECKPOINTS) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page.evaluate(() => {
        const formElement = document.querySelector("form");
        return {
          page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          form: formElement === null ? 0 : formElement.scrollWidth - formElement.clientWidth,
        };
      });
      expect(overflow.page, `page overflow at ${width}px`).toBeLessThanOrEqual(0);
      expect(overflow.form, `form overflow at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
});

test.describe("reference form — accessibility scans", () => {
  for (const theme of THEMES) {
    test(`the form's error and success states are axe-clean [${theme}]`, async ({ page }) => {
      // Same theme driver the discovery matrix uses — a stored preference
      // adopted before paint, not a class stamped after the fact.
      await gotoMatrixCell(page, ROUTE, theme, "ltr");
      await expect(form(page)).toHaveCount(1);

      // Client validation errors.
      await page.getByRole("button", { name: EN.submit }).click();
      await expect(page.getByText(EN.nameRequired)).toBeVisible();
      await expectAxeClean(page);

      // Form-level server error.
      await fill(page, DEMO_FORM_ERROR_EMAIL);
      await page.getByRole("button", { name: EN.submit }).click();
      await expect(form(page).getByRole("alert")).toBeVisible();
      await expectAxeClean(page);

      // Success.
      await page.getByLabel(EN.ownerEmail).fill("owner@example.com");
      await page.getByRole("button", { name: EN.submit }).click();
      await expect(form(page).getByRole("status")).toContainText(EN.success);
      await expectAxeClean(page);
    });
  }

  test("the Arabic form is axe-clean in its server-error state", async ({ page }) => {
    await gotoForms(page);
    await switchToArabic(page);
    await fill(page, DEMO_FIELD_ERROR_EMAIL, AR);
    await page.getByRole("button", { name: AR.submit }).click();
    await expect(page.getByText(AR.emailTaken)).toBeVisible();

    await expectAxeClean(page);
  });
});

async function expectAxeClean(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}
