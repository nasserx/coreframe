/**
 * The single error contract of the API boundary.
 *
 * Every failure `apiFetch` can produce is normalized into one `ApiError`
 * with a discriminating `kind`, so consumers branch on four stable cases
 * and never on transport details (fetch's `TypeError`, `DOMException`
 * names, response internals):
 *
 * - `"network"` — the request never produced a response (offline, DNS,
 *   CORS, connection reset).
 * - `"timeout"` — the request exceeded the client timeout.
 * - `"http"`    — the server responded with a non-2xx status; `status` is
 *   set and `body` carries the parsed JSON error payload when there is one.
 * - `"parse"`   — the response arrived but its body is unusable (malformed
 *   JSON, or a Zod schema rejected it).
 *
 * Deliberately NOT normalized: cancellation. When the caller's own
 * `AbortSignal` aborts, the abort reason is rethrown untouched — React
 * Query (and anything else signal-aware) treats cancellation specially,
 * and wrapping it would turn intentional teardown into a fake failure.
 */
export type ApiErrorKind = "network" | "timeout" | "http" | "parse";

type ApiErrorInit = Readonly<{
  kind: ApiErrorKind;
  message: string;
  /** The full request URL, for logs and error reporting. */
  url: string;
  /** HTTP status code; only meaningful (non-null) when `kind` is "http". */
  status?: number;
  /** Parsed JSON error payload of an "http" failure, when the server sent one. */
  body?: unknown;
  /** The underlying transport/parse error, preserved for diagnostics. */
  cause?: unknown;
}>;

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly url: string;
  readonly status: number | null;
  readonly body: unknown;

  constructor(init: ApiErrorInit) {
    super(init.message, init.cause === undefined ? undefined : { cause: init.cause });
    this.name = "ApiError";
    this.kind = init.kind;
    this.url = init.url;
    this.status = init.status ?? null;
    this.body = init.body;
  }
}

/** Narrowing helper for `catch` blocks and query error rendering. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
