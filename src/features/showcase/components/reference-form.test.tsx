import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LocaleProvider } from "@/core/providers/locale-provider";

import { REFERENCE_FORM_PATH } from "../reference-form-client";
import { REFERENCE_FORM_DEMO } from "../reference-form-contract";
import { ReferenceForm } from "./reference-form";

/*
 * The reference form's behavioral contract (docs/TESTING.md): accessible
 * wiring, first-invalid focus, the four submission outcomes, and live locale
 * behavior. The schema's own boundaries are proven once in ../forms.test.ts.
 *
 * `fetch` is stubbed rather than `apiFetch`: the form must reach the network
 * THROUGH the shared client, and stubbing at the platform boundary is what
 * proves it (a direct `fetch` in the component would be indistinguishable
 * otherwise — see the URL/method/header assertions below).
 */

const EN = {
  projectName: "Project name",
  ownerEmail: "Owner email",
  goal: "Implementation goal",
  submit: "Submit example",
  nameRequired: "Enter a project name.",
  nameShort: "Use at least 2 characters.",
  emailRequired: "Enter an owner email address.",
  goalRequired: "Describe the implementation goal.",
  goalShort: "Use at least 20 characters.",
  emailTaken: "This owner email already belongs to another example.",
  unavailable: "The example service is unavailable. Try again.",
  unexpected: "The example could not be submitted. Try again.",
  success: "Example accepted",
} as const;

const AR = {
  projectName: "اسم المشروع",
  submit: "إرسال المثال",
  nameRequired: "أدخل اسم المشروع.",
  emailTaken: "هذا البريد يخص مثالًا آخر بالفعل.",
} as const;

const VALID_GOAL = "Prove the reference wiring end to end.";

type FetchStub = ReturnType<typeof vi.fn>;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function stubFetch(responder: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) {
  const stub: FetchStub = vi.fn(responder);
  vi.stubGlobal("fetch", stub);
  return stub;
}

function renderForm(): void {
  render(
    <LocaleProvider>
      <ReferenceForm />
    </LocaleProvider>,
  );
}

/**
 * Same render, but on a FRESH module graph (`vi.resetModules()` + dynamic
 * import), because the locale runtime keeps its preference and catalogue cache
 * in module-level state — a switch to Arabic would otherwise leak into every
 * later test. Only the locale tests pay this cost; see locale-provider.test.tsx
 * for the same pattern.
 */
async function renderFormWithFreshLocaleRuntime(): Promise<void> {
  vi.resetModules();
  const providers = await import("@/core/providers/locale-provider");
  const form = await import("./reference-form");
  render(
    <providers.LocaleProvider>
      <form.ReferenceForm />
    </providers.LocaleProvider>,
  );
}

async function fillValid(user: ReturnType<typeof userEvent.setup>, email = "owner@example.com") {
  await user.type(screen.getByLabelText(EN.projectName), "Atlas");
  await user.type(screen.getByLabelText(EN.ownerEmail), email);
  await user.type(screen.getByLabelText(EN.goal), VALID_GOAL);
}

/** The form's only button — found by role, not by label, because the label
 * itself changes while a submission is pending. */
function submitButton(): HTMLElement {
  return screen.getByRole("button");
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ReferenceForm — accessible wiring", () => {
  it("labels every control and marks it required", async () => {
    renderForm();

    for (const label of [EN.projectName, EN.ownerEmail, EN.goal]) {
      const control = screen.getByLabelText(label);
      expect(control).toBeRequired();
      expect(control).not.toHaveAttribute("aria-invalid");
    }
    expect(submitButton()).toHaveAccessibleName(EN.submit);
    expect(submitButton()).toBeEnabled();
  });

  it("points aria-describedby at the description, then adds the error", async () => {
    const user = userEvent.setup();
    renderForm();
    const control = screen.getByLabelText(EN.projectName);
    const describedBy = () => (control.getAttribute("aria-describedby") ?? "").split(" ");

    expect(describedBy()).toHaveLength(1);
    const description = document.getElementById(describedBy()[0] ?? "");
    expect(description).toHaveTextContent("2 to 80 characters");

    await user.click(submitButton());

    await waitFor(() => expect(describedBy()).toHaveLength(2));
    // Help text is kept, not replaced — both ids resolve to rendered text.
    expect(document.getElementById(describedBy()[0] ?? "")).toBe(description);
    expect(document.getElementById(describedBy()[1] ?? "")).toHaveTextContent(EN.nameRequired);
  });

  it("keeps the owner email in LTR entry while the surrounding form follows the document", async () => {
    renderForm();

    expect(screen.getByLabelText(EN.ownerEmail)).toHaveAttribute("dir", "ltr");
    expect(screen.getByLabelText(EN.projectName)).not.toHaveAttribute("dir");
  });

  it("counts the goal's characters inside the description the control already references", async () => {
    const user = userEvent.setup();
    renderForm();
    const goal = screen.getByLabelText(EN.goal);

    const descriptionId = (goal.getAttribute("aria-describedby") ?? "").split(" ")[0] ?? "";
    expect(document.getElementById(descriptionId)).toHaveTextContent("0 of 500 used");

    // Counted after trimming, exactly as the schema measures it.
    await user.type(goal, "  four  ");
    expect(document.getElementById(descriptionId)).toHaveTextContent("4 of 500 used");
  });
});

describe("ReferenceForm — client validation", () => {
  it("blocks an empty submission, reports every field, and never calls the network", async () => {
    const user = userEvent.setup();
    const fetchStub = stubFetch(() => Promise.resolve(jsonResponse({})));
    renderForm();

    await user.click(submitButton());

    await waitFor(() => expect(screen.getByText(EN.nameRequired)).toBeInTheDocument());
    expect(screen.getByText(EN.emailRequired)).toBeInTheDocument();
    expect(screen.getByText(EN.goalRequired)).toBeInTheDocument();
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("focuses the first invalid control and marks it aria-invalid", async () => {
    const user = userEvent.setup();
    stubFetch(() => Promise.resolve(jsonResponse({})));
    renderForm();

    await user.type(screen.getByLabelText(EN.projectName), "A");
    await user.click(submitButton());

    await waitFor(() => expect(screen.getByLabelText(EN.projectName)).toHaveFocus());
    expect(screen.getByLabelText(EN.projectName)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(EN.nameShort)).toBeInTheDocument();
  });

  it("announces each error through a role=alert region, not by color alone", async () => {
    const user = userEvent.setup();
    stubFetch(() => Promise.resolve(jsonResponse({})));
    renderForm();

    await user.click(submitButton());

    const alerts = await screen.findAllByRole("alert");
    expect(alerts.map((alert) => alert.textContent)).toEqual([
      EN.nameRequired,
      EN.emailRequired,
      EN.goalRequired,
    ]);
  });

  it("fails a whitespace-only submission", async () => {
    const user = userEvent.setup();
    const fetchStub = stubFetch(() => Promise.resolve(jsonResponse({})));
    renderForm();

    await user.type(screen.getByLabelText(EN.projectName), "   ");
    await user.type(screen.getByLabelText(EN.ownerEmail), "owner@example.com");
    await user.type(screen.getByLabelText(EN.goal), "                          ");
    await user.click(submitButton());

    await waitFor(() => expect(screen.getByText(EN.nameRequired)).toBeInTheDocument());
    expect(screen.getByText(EN.goalRequired)).toBeInTheDocument();
    expect(fetchStub).not.toHaveBeenCalled();
  });
});

describe("ReferenceForm — submission", () => {
  it("submits normalized JSON through apiFetch, never a bare fetch", async () => {
    const user = userEvent.setup();
    const fetchStub = stubFetch(() =>
      Promise.resolve(jsonResponse({ status: "accepted", reference: "REF-ABC123" })),
    );
    renderForm();

    await fillValid(user, "  Owner@Example.COM  ");
    await user.click(submitButton());

    await waitFor(() => expect(fetchStub).toHaveBeenCalledTimes(1));
    const [url, init] = fetchStub.mock.calls[0] as [string, RequestInit];
    // apiFetch owns the URL, method, JSON serialization, and content type.
    expect(url).toBe(REFERENCE_FORM_PATH);
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("content-type")).toBe("application/json");
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(String(init.body))).toEqual({
      projectName: "Atlas",
      ownerEmail: "owner@example.com",
      implementationGoal: VALID_GOAL,
    });
  });

  it("announces pending state, disables the action, and prevents a duplicate submit", async () => {
    const user = userEvent.setup();
    let release: ((response: Response) => void) | undefined;
    const fetchStub = stubFetch(
      () =>
        new Promise<Response>((resolve) => {
          release = resolve;
        }),
    );
    renderForm();

    await fillValid(user);
    await user.click(submitButton());

    await waitFor(() => expect(submitButton()).toBeDisabled());
    expect(screen.getByRole("status")).toHaveTextContent("Submitting the example.");

    // A second attempt while pending must not reach the network.
    await user.click(submitButton());
    expect(fetchStub).toHaveBeenCalledTimes(1);

    release?.(jsonResponse({ status: "accepted", reference: "REF-ABC123" }));
    await waitFor(() => expect(submitButton()).toBeEnabled());
  });

  it("reports success through a polite live region without resetting the values", async () => {
    const user = userEvent.setup();
    stubFetch(() => Promise.resolve(jsonResponse({ status: "accepted", reference: "REF-ABC123" })));
    renderForm();

    await fillValid(user);
    await user.click(submitButton());

    const status = screen.getByRole("status");
    await waitFor(() => expect(status).toHaveTextContent(EN.success));
    expect(status).toHaveTextContent("REF-ABC123");
    expect(screen.getByLabelText(EN.projectName)).toHaveValue("Atlas");
    expect(screen.getByLabelText(EN.goal)).toHaveValue(VALID_GOAL);
  });

  it("maps a server field error onto its control, focuses it, and keeps the values", async () => {
    const user = userEvent.setup();
    stubFetch(() =>
      Promise.resolve(
        jsonResponse({ status: "rejected", fieldErrors: { ownerEmail: "errorEmailTaken" } }, 409),
      ),
    );
    renderForm();

    await fillValid(user, REFERENCE_FORM_DEMO.fieldErrorEmail);
    await user.click(submitButton());

    const email = screen.getByLabelText(EN.ownerEmail);
    await waitFor(() => expect(email).toHaveAttribute("aria-invalid", "true"));
    expect(screen.getByText(EN.emailTaken)).toBeInTheDocument();
    expect(email).toHaveFocus();
    expect(email).toHaveValue(REFERENCE_FORM_DEMO.fieldErrorEmail);
    expect(screen.getByLabelText(EN.projectName)).toHaveValue("Atlas");
    // A field-owned failure stays on its field — no form-level alert appears.
    expect(screen.queryByText(EN.unavailable)).not.toBeInTheDocument();
  });

  it("keeps a form-level server error separate, focused, and outside the fields", async () => {
    const user = userEvent.setup();
    stubFetch(() =>
      Promise.resolve(
        jsonResponse({ status: "rejected", formError: "errorServiceUnavailable" }, 503),
      ),
    );
    renderForm();

    await fillValid(user, REFERENCE_FORM_DEMO.formErrorEmail);
    await user.click(submitButton());

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(EN.unavailable);
    await waitFor(() => expect(alert).toHaveFocus());
    expect(screen.getByLabelText(EN.ownerEmail)).not.toHaveAttribute("aria-invalid");
    expect(screen.getByLabelText(EN.ownerEmail)).toHaveValue(REFERENCE_FORM_DEMO.formErrorEmail);
  });

  it("falls back to the generic message when the failure is not contract-shaped", async () => {
    const user = userEvent.setup();
    stubFetch(() => Promise.reject(new TypeError("offline")));
    renderForm();

    await fillValid(user);
    await user.click(submitButton());

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(EN.unexpected);
  });

  it("submits from the keyboard alone", async () => {
    const user = userEvent.setup();
    const fetchStub = stubFetch(() =>
      Promise.resolve(jsonResponse({ status: "accepted", reference: "REF-ABC123" })),
    );
    renderForm();

    await fillValid(user);
    screen.getByLabelText(EN.ownerEmail).focus();
    await user.keyboard("{Enter}");

    await waitFor(() => expect(fetchStub).toHaveBeenCalledTimes(1));
  });
});

describe("ReferenceForm — live locale", () => {
  it("switches labels, actions, and EXISTING errors without losing entered values", async () => {
    const user = userEvent.setup();
    const fetchStub = stubFetch(() => Promise.resolve(jsonResponse({})));
    await renderFormWithFreshLocaleRuntime();

    await user.type(screen.getByLabelText(EN.projectName), "A");
    await fillValidEmailAndGoal(user, "owner@example.com");
    await user.click(submitButton());
    await waitFor(() => expect(screen.getByText(EN.nameShort)).toBeInTheDocument());
    expect(fetchStub).not.toHaveBeenCalled();

    await switchToArabic();

    // Labels and the action follow the live locale…
    expect(screen.getByLabelText(AR.projectName)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: new RegExp(AR.submit) })).toBeInTheDocument();
    // …and so does the error that was already on screen, because form state
    // holds a message KEY, not one locale's prose.
    expect(screen.getByText("استخدم حرفين على الأقل.")).toBeInTheDocument();
    // Entered values survive the switch.
    expect(screen.getByLabelText(AR.projectName)).toHaveValue("A");
  });

  it("re-renders a server-owned error in the new locale", async () => {
    const user = userEvent.setup();
    stubFetch(() =>
      Promise.resolve(
        jsonResponse({ status: "rejected", fieldErrors: { ownerEmail: "errorEmailTaken" } }, 409),
      ),
    );
    await renderFormWithFreshLocaleRuntime();

    await user.type(screen.getByLabelText(EN.projectName), "Atlas");
    await fillValidEmailAndGoal(user, REFERENCE_FORM_DEMO.fieldErrorEmail);
    await user.click(submitButton());
    await waitFor(() => expect(screen.getByText(EN.emailTaken)).toBeInTheDocument());

    await switchToArabic();

    expect(screen.getByText(AR.emailTaken)).toBeInTheDocument();
    expect(screen.queryByText(EN.emailTaken)).not.toBeInTheDocument();
  });
});

async function fillValidEmailAndGoal(
  user: ReturnType<typeof userEvent.setup>,
  email: string,
): Promise<void> {
  await user.type(screen.getByLabelText(EN.ownerEmail), email);
  await user.type(screen.getByLabelText(EN.goal), VALID_GOAL);
}

/**
 * Drives the REAL locale runtime: the provider reads its preference from
 * storage through `useSyncExternalStore`, so writing the key and firing the
 * storage event is the same path a second tab takes — no component is
 * re-rendered by the test, which is what makes "the live locale switched"
 * a genuine claim.
 */
async function switchToArabic(): Promise<void> {
  window.localStorage.setItem("locale", "ar");
  window.dispatchEvent(new StorageEvent("storage", { key: "locale", newValue: "ar" }));
  // The Arabic catalogue is a code-split chunk; wait for it to settle.
  await waitFor(() => {
    expect(screen.getByRole("button", { name: new RegExp(AR.submit) })).toBeInTheDocument();
  });
}
