import { afterEach, describe, expect, it, vi } from "vitest";

import {
  REFERENCE_FORM_DEMO,
  referenceFormRejectionSchema,
} from "@/features/showcase/reference-form-contract";

import { POST } from "./route";

/*
 * The server half of the reference-form contract. It parses with the same
 * schema the browser validated against, so these tests assert what only the
 * server owns: media-type handling, the deterministic demonstration cases, the
 * Showcase gate, and the promise that no internal detail reaches a response.
 */

const VALID_BODY = {
  projectName: "Atlas",
  ownerEmail: "owner@example.com",
  implementationGoal: "Wire the reference form end to end and prove it.",
} as const;

function jsonRequest(body: unknown, contentType = "application/json"): Request {
  return new Request("https://example.test/api/showcase/forms/reference", {
    method: "POST",
    headers: { "content-type": contentType },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function rejectionBody(response: Response) {
  const parsed = referenceFormRejectionSchema.safeParse(await response.json());
  expect(parsed.success).toBe(true);
  return parsed.data;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("POST /api/showcase/forms/reference", () => {
  it("accepts a valid payload with a typed success result", async () => {
    const response = await POST(jsonRequest(VALID_BODY));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "accepted",
      reference: expect.stringMatching(/^REF-[0-9A-Z]{6}$/),
    });
  });

  it("returns the same reference for the same payload", async () => {
    const first = await (await POST(jsonRequest(VALID_BODY))).json();
    const second = await (await POST(jsonRequest(VALID_BODY))).json();

    expect(first).toEqual(second);
  });

  it("normalizes before accepting, exactly as the client does", async () => {
    const response = await POST(
      jsonRequest({ ...VALID_BODY, ownerEmail: "  Owner@Example.COM  " }),
    );

    expect(response.status).toBe(200);
  });

  it("rejects an unsupported content type with 415", async () => {
    const response = await POST(jsonRequest(VALID_BODY, "text/plain"));

    expect(response.status).toBe(415);
    expect((await rejectionBody(response))?.formError).toBe("errorUnexpected");
  });

  it("rejects malformed JSON with 400 and no parser detail", async () => {
    const response = await POST(jsonRequest("{ not json"));

    expect(response.status).toBe(400);
    expect(await rejectionBody(response)).toEqual({
      status: "rejected",
      formError: "errorUnexpected",
    });
  });

  it("maps a schema failure to 422 with per-field message keys", async () => {
    const response = await POST(
      jsonRequest({ projectName: " ", ownerEmail: "nope", implementationGoal: "too short" }),
    );

    expect(response.status).toBe(422);
    expect((await rejectionBody(response))?.fieldErrors).toEqual({
      projectName: "errorProjectNameRequired",
      ownerEmail: "errorOwnerEmailInvalid",
      implementationGoal: "errorGoalShort",
    });
  });

  it("rejects a payload that is not an object with a form-level 422", async () => {
    const response = await POST(jsonRequest("null"));

    expect(response.status).toBe(422);
    expect((await rejectionBody(response))?.formError).toBe("errorUnexpected");
  });

  it("returns the documented server-owned FIELD error for the demonstration email", async () => {
    const response = await POST(
      jsonRequest({ ...VALID_BODY, ownerEmail: REFERENCE_FORM_DEMO.fieldErrorEmail }),
    );

    expect(response.status).toBe(409);
    expect(await rejectionBody(response)).toEqual({
      status: "rejected",
      fieldErrors: { ownerEmail: "errorEmailTaken" },
    });
  });

  it("returns the documented FORM-level error for the demonstration email", async () => {
    const response = await POST(
      jsonRequest({ ...VALID_BODY, ownerEmail: REFERENCE_FORM_DEMO.formErrorEmail }),
    );

    expect(response.status).toBe(503);
    expect(await rejectionBody(response)).toEqual({
      status: "rejected",
      formError: "errorServiceUnavailable",
    });
  });

  it("never leaks internal detail: every failure body is contract-shaped", async () => {
    const responses = await Promise.all([
      POST(jsonRequest(VALID_BODY, "text/plain")),
      POST(jsonRequest("{ not json")),
      POST(jsonRequest({ projectName: "", ownerEmail: "", implementationGoal: "" })),
      POST(jsonRequest({ ...VALID_BODY, ownerEmail: REFERENCE_FORM_DEMO.formErrorEmail })),
    ]);

    for (const response of responses) {
      const text = await response.clone().text();
      expect(referenceFormRejectionSchema.safeParse(await response.json()).success).toBe(true);
      // A stack frame, a file path, or a raw exception name would all show up
      // here; the contract only ever carries catalogue keys.
      expect(text).not.toMatch(/at |\.ts:|Error:|node_modules/);
    }
  });

  it("returns 404 for every case once the Showcase is disabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_SHOWCASE", "false");
    vi.resetModules();
    // Re-imported so ENV_CONFIG is recomputed from the stubbed environment;
    // the flag is inlined at build time in a real deployment.
    const { POST: gatedPost } = await import("./route");

    const responses = await Promise.all([
      gatedPost(jsonRequest(VALID_BODY)),
      gatedPost(jsonRequest("{ not json")),
      gatedPost(jsonRequest(VALID_BODY, "text/plain")),
    ]);

    for (const response of responses) {
      expect(response.status).toBe(404);
      await expect(response.text()).resolves.toBe("");
    }
  });
});
