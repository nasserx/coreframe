/**
 * The foundation's HTTP client: native `fetch` behind one function that
 * adds the three things raw fetch lacks — a configured base URL, a default
 * timeout, and normalization of every failure into `ApiError` (see
 * `./errors.ts`). Native fetch (not axios) because it is what Next.js
 * extends for caching/revalidation, it costs zero bundle bytes, and the
 * one thing axios would add — interceptors — is replaced by this single
 * choke point (docs/DATA_LAYER.md, DECISIONS.md).
 *
 * Response validation is opt-in via `schema` and the types make skipping
 * it explicit: with a schema the promise resolves to the schema's output
 * type; without one it resolves to `unknown`, so an unvalidated consumer
 * must cast deliberately at the call site.
 *
 * AUTH EXTENSION POINT: this function is the single place every request
 * passes through. A product adds authentication by attaching credentials
 * here (e.g. an `Authorization` header read from its auth state, or
 * `credentials: "include"` for cookie sessions) — never per call site.
 * See docs/DATA_LAYER.md § Authentication.
 */
import type { ZodType } from "zod";

import { ENV_CONFIG } from "@/config/env";

import { ApiError } from "./errors";

const DEFAULT_TIMEOUT_MS = 10_000;

export type ApiFetchOptions = Readonly<{
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** JSON-serialized into the request body; sets `content-type: application/json`. */
  body?: unknown;
  headers?: HeadersInit;
  /**
   * Caller cancellation (pass React Query's `signal` through). Combined
   * with the timeout signal; an abort from here is rethrown as-is, not
   * wrapped in ApiError.
   */
  signal?: AbortSignal | undefined;
  timeoutMs?: number;
}>;

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions & { schema: ZodType<T> },
): Promise<T>;
export async function apiFetch(path: string, options?: ApiFetchOptions): Promise<unknown>;
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions & { schema?: ZodType<T> } = {},
): Promise<unknown> {
  assertRootRelativePath(path);

  // Empty base URL (the default) means same-origin paths — correct for the
  // browser and for this repo's own route handlers. Server-side callers
  // need an absolute NEXT_PUBLIC_API_BASE_URL (docs/DATA_LAYER.md).
  const url = `${ENV_CONFIG.NEXT_PUBLIC_API_BASE_URL}${path}`;

  const timeoutSignal = AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const signal =
    options.signal === undefined ? timeoutSignal : AbortSignal.any([options.signal, timeoutSignal]);

  const headers = new Headers(options.headers);
  if (options.body !== undefined && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  // The combined signal stays armed for the WHOLE exchange — the fetch and the
  // body read alike — so both rejection sites classify aborts the same way.
  const abortContext: AbortContext = {
    callerSignal: options.signal,
    timeoutSignal,
    url,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      signal,
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch (cause) {
    throwIfAborted(cause, abortContext);
    throw new ApiError({
      kind: "network",
      message: `Request to ${url} failed before a response was received.`,
      url,
      cause,
    });
  }

  if (!response.ok) {
    throw new ApiError({
      kind: "http",
      message: `Request to ${url} failed with HTTP ${response.status}.`,
      url,
      status: response.status,
      body: await parseJsonBodyOrUndefined(response),
    });
  }

  if (response.status === 204) {
    return undefined;
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (cause) {
    // Streaming the body can still be cancelled or time out. Without this, an
    // ordinary React Query teardown mid-body would surface as malformed JSON
    // (docs/audit/2026-07-comprehensive-review.md DATA-01).
    throwIfAborted(cause, abortContext);
    throw new ApiError({
      kind: "parse",
      message: `Response from ${url} is not valid JSON.`,
      url,
      cause,
    });
  }

  if (options.schema === undefined) {
    return payload;
  }
  const parsed = options.schema.safeParse(payload);
  if (!parsed.success) {
    // Format from the ZodError instance's own `issues` rather than
    // `z.prettifyError`: calling a zod runtime helper here would make a static
    // `import { z }` unavoidable, coupling EVERY apiFetch consumer to zod's
    // ~69 KB gz even when they pass no schema (docs/audit/2026-07-health-audit.md
    // §1.2). A caller that does pass a schema already bundles zod to define it,
    // so validated call sites pay nothing extra; unvalidated ones now pay zero.
    // `parsed.error` still rides on `cause` for full structured detail.
    const detail = parsed.error.issues
      .map((issue) => `  • ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new ApiError({
      kind: "parse",
      message: `Response from ${url} does not match the expected schema:\n${detail}`,
      url,
      cause: parsed.error,
    });
  }
  return parsed.data;
}

/**
 * `path` must be root-relative, so the configured base URL is the only thing
 * that can decide the request's origin.
 *
 * The URL is built by concatenation, and with the default empty base a `path`
 * starting `//` (or `/\`, which browsers normalize to `//`) becomes a
 * PROTOCOL-RELATIVE url — `fetch` would send the request to an origin the path
 * chose. Every call site today passes a developer-written literal, so this is
 * latent, but the auth extension point documented at the top of this file lives
 * in this same function: once credentials are attached here, a path built from
 * user or CMS input becomes credential exfiltration. Guarding is free now
 * (docs/audit/2026-07-comprehensive-review.md SEC-01).
 *
 * A `TypeError`, deliberately not an `ApiError`: this is a caller contract
 * violation, not a transport failure, and it must not be swallowed by the
 * `isApiError` handling that wraps ordinary request errors.
 */
function assertRootRelativePath(path: string): void {
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    throw new TypeError(
      `apiFetch path must be root-relative and start with a single "/", got ${JSON.stringify(path)}. Set the request's origin through NEXT_PUBLIC_API_BASE_URL, never through the path.`,
    );
  }
}

type AbortContext = Readonly<{
  callerSignal: AbortSignal | undefined;
  timeoutSignal: AbortSignal;
  url: string;
  timeoutMs: number;
}>;

/**
 * Classifies a rejection that happened while the request was in flight. Both
 * awaits in `apiFetch` — the fetch and the response-body read — remain subject
 * to the combined abort signal, so both must reach this before assuming the
 * rejection describes what they were nominally doing.
 *
 * - Caller cancellation is NOT a failure: the reason is rethrown untouched so
 *   signal-aware consumers see a genuine abort (see `./errors.ts`,
 *   docs/DATA_LAYER.md § Cancellation).
 * - A timeout is a timeout wherever it lands, not a transport or parse error.
 *
 * Returns normally when neither signal aborted, leaving the caller to throw the
 * site-specific `network` / `parse` error.
 */
function throwIfAborted(cause: unknown, context: AbortContext): void {
  if (context.callerSignal?.aborted === true) {
    throw cause;
  }
  if (context.timeoutSignal.aborted) {
    throw new ApiError({
      kind: "timeout",
      message: `Request to ${context.url} timed out after ${context.timeoutMs}ms.`,
      url: context.url,
      cause,
    });
  }
}

/** Best-effort read of an error response's JSON payload; never throws. */
async function parseJsonBodyOrUndefined(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}
