import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/api/errors";

import {
  readReferenceFormRejection,
  REFERENCE_FORM_PATH,
  submitReferenceForm,
} from "./reference-form-client";

/*
 * Browser-side transport only. The field contract it carries is asserted in
 * ./reference-form-contract.test.ts, and the form's use of this module is
 * asserted in ./components/reference-form.test.tsx; what is proven here is the
 * translation between `ApiError` and the form's own rejection shape, plus that
 * submission really goes through `apiFetch`.
 */

function httpError(body: unknown, status = 422): ApiError {
  return new ApiError({ kind: "http", message: "failed", url: "/x", status, body });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("submitReferenceForm", () => {
  it("posts JSON to the reference endpoint through apiFetch", async () => {
    const fetchStub = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ status: "accepted", reference: "REF-ABC123" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchStub);

    const accepted = await submitReferenceForm({
      projectName: "Atlas",
      ownerEmail: "owner@example.com",
      implementationGoal: "Wire the reference form end to end and prove it.",
    });

    expect(accepted).toEqual({ status: "accepted", reference: "REF-ABC123" });
    const [url, init] = fetchStub.mock.calls[0] as unknown as [string, RequestInit];
    // apiFetch owns the URL, method, serialization, content type, and timeout
    // signal — this module adds only the path and the response schema.
    expect(url).toBe(REFERENCE_FORM_PATH);
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("content-type")).toBe("application/json");
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("rejects a success body that does not match the contract", async () => {
    vi.stubGlobal("fetch", () =>
      Promise.resolve(
        new Response(JSON.stringify({ status: "accepted" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await expect(
      submitReferenceForm({
        projectName: "Atlas",
        ownerEmail: "owner@example.com",
        implementationGoal: "Wire the reference form end to end and prove it.",
      }),
    ).rejects.toMatchObject({ name: "ApiError", kind: "parse" });
  });
});

describe("readReferenceFormRejection", () => {
  it("reads a structured rejection out of an HTTP ApiError", () => {
    const rejection = readReferenceFormRejection(
      httpError({ status: "rejected", fieldErrors: { ownerEmail: "errorEmailTaken" } }, 409),
    );

    expect(rejection?.fieldErrors?.ownerEmail).toBe("errorEmailTaken");
  });

  it("reads a form-level rejection", () => {
    const rejection = readReferenceFormRejection(
      httpError({ status: "rejected", formError: "errorServiceUnavailable" }, 503),
    );

    expect(rejection?.formError).toBe("errorServiceUnavailable");
  });

  it("returns null for transport failures, so they fall back to the generic message", () => {
    expect(
      readReferenceFormRejection(new ApiError({ kind: "network", message: "offline", url: "/x" })),
    ).toBeNull();
    expect(
      readReferenceFormRejection(new ApiError({ kind: "timeout", message: "too slow", url: "/x" })),
    ).toBeNull();
    expect(readReferenceFormRejection(new Error("boom"))).toBeNull();
  });

  it("returns null for an HTTP body that does not match the contract", () => {
    expect(readReferenceFormRejection(httpError({ message: "Internal Server Error" }))).toBeNull();
    expect(readReferenceFormRejection(httpError(undefined, 500))).toBeNull();
  });
});
