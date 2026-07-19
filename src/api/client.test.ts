import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { apiFetch } from "./client";
import { type ApiError, isApiError } from "./errors";

/*
 * The error contract is the boundary's most important artifact: every
 * transport failure mode must surface as an ApiError with the right `kind`,
 * and caller cancellation must NOT be wrapped. fetch is stubbed per test —
 * these are contract tests of the normalization, not of the network.
 */

function stubFetch(implementation: typeof fetch): void {
  vi.stubGlobal("fetch", implementation);
}

async function captureApiError(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    if (isApiError(error)) {
      return error;
    }
    throw new Error(`Expected an ApiError, got: ${String(error)}`);
  }
  throw new Error("Expected the promise to reject.");
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch error normalization", () => {
  it('normalizes a failed connection into kind "network" with the cause preserved', async () => {
    const transportError = new TypeError("fetch failed");
    stubFetch(() => Promise.reject(transportError));

    const error = await captureApiError(apiFetch("/records"));

    expect(error.kind).toBe("network");
    expect(error.status).toBeNull();
    expect(error.url).toBe("/records");
    expect(error.cause).toBe(transportError);
  });

  it('normalizes a timeout into kind "timeout"', async () => {
    // A fetch that never resolves on its own and rejects only when the
    // combined signal aborts — exactly how real fetch reacts to
    // AbortSignal.timeout firing.
    stubFetch(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject((init.signal as AbortSignal).reason);
          });
        }),
    );

    const error = await captureApiError(apiFetch("/slow", { timeoutMs: 10 }));

    expect(error.kind).toBe("timeout");
    expect(error.message).toContain("10ms");
  });

  it("rethrows caller cancellation untouched — an abort is not a failure", async () => {
    stubFetch(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject((init.signal as AbortSignal).reason);
          });
        }),
    );

    const controller = new AbortController();
    const promise = apiFetch("/cancelled", { signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toSatisfy(
      (reason) => !isApiError(reason) && (reason as DOMException).name === "AbortError",
    );
  });

  it('normalizes a non-2xx response into kind "http" with status and parsed body', async () => {
    stubFetch(() =>
      Promise.resolve(
        new Response(JSON.stringify({ message: "nope" }), {
          status: 403,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    const error = await captureApiError(apiFetch("/forbidden"));

    expect(error.kind).toBe("http");
    expect(error.status).toBe(403);
    expect(error.body).toEqual({ message: "nope" });
  });

  it('normalizes an HTTP error with a non-JSON body into kind "http" with undefined body', async () => {
    stubFetch(() => Promise.resolve(new Response("<html>Bad Gateway</html>", { status: 502 })));

    const error = await captureApiError(apiFetch("/gateway"));

    expect(error.kind).toBe("http");
    expect(error.status).toBe(502);
    expect(error.body).toBeUndefined();
  });

  it('normalizes malformed JSON in a 2xx response into kind "parse"', async () => {
    stubFetch(() => Promise.resolve(new Response("not json {", { status: 200 })));

    const error = await captureApiError(apiFetch("/malformed"));

    expect(error.kind).toBe("parse");
    expect(error.status).toBeNull();
  });

  it('normalizes a schema rejection into kind "parse" naming the offending field', async () => {
    stubFetch(() => Promise.resolve(Response.json([{ id: "not-a-number" }])));

    const error = await captureApiError(
      apiFetch("/typed", { schema: z.array(z.object({ id: z.number() })) }),
    );

    expect(error.kind).toBe("parse");
    expect(error.message).toContain("id");
  });
});

describe("apiFetch success paths", () => {
  it("returns the schema's parsed output when a schema is provided", async () => {
    stubFetch(() => Promise.resolve(Response.json([{ id: 1 }])));

    const data = await apiFetch("/typed", { schema: z.array(z.object({ id: z.number() })) });

    expect(data).toEqual([{ id: 1 }]);
  });

  it("returns unknown (raw JSON) without a schema and resolves 204 to undefined", async () => {
    stubFetch(() => Promise.resolve(Response.json({ anything: true })));
    await expect(apiFetch("/raw")).resolves.toEqual({ anything: true });

    stubFetch(() => Promise.resolve(new Response(null, { status: 204 })));
    await expect(apiFetch("/empty")).resolves.toBeUndefined();
  });

  it("serializes a JSON body and sets the content-type header", async () => {
    const seen: { init?: RequestInit | undefined } = {};
    stubFetch((_input, init) => {
      seen.init = init;
      return Promise.resolve(new Response(null, { status: 204 }));
    });

    await apiFetch("/create", { method: "POST", body: { name: "a" } });

    expect(seen.init?.body).toBe(JSON.stringify({ name: "a" }));
    expect(new Headers(seen.init?.headers).get("content-type")).toBe("application/json");
  });
});
