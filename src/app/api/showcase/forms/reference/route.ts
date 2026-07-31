import { ENV_CONFIG } from "@/config/env";
import {
  isReferenceFormMessageKey,
  REFERENCE_FORM_DEMO,
  REFERENCE_FORM_FIELDS,
  type ReferenceFormAccepted,
  type ReferenceFormField,
  type ReferenceFormMessageKey,
  type ReferenceFormRejection,
  referenceFormSchema,
} from "@/features/showcase/reference-form-contract";

/*
 * Backing endpoint for the /showcase/forms reference form: the server half of
 * the contract in src/features/showcase/reference-form-contract.ts, parsing the
 * request with the SAME schema the browser validated against. It imports that
 * PURE contract only — never the browser's `reference-form-client.ts`, so no
 * server path can reach `apiFetch` (see ./import-boundary.test.ts).
 *
 * Unlike the /showcase/records GET, this handler is not (and cannot be)
 * prerendered — Next 16 never caches non-GET methods, so no `dynamic` config
 * applies. The Showcase gate therefore holds at REQUEST time here: with the
 * flag off the build still emits the route, and it answers 404 (docs/CLONING.md
 * §3 option 1). Its pages and the records endpoint remain static 404s.
 *
 * It is a reference, not a service: no persistence, no external call, no
 * artificial delay, and no internal detail in any response body.
 */

function rejection(status: number, body: ReferenceFormRejection): Response {
  return Response.json(body, { status });
}

/** Only the exact JSON media type is accepted; anything else is 415. */
function isJsonRequest(request: Request): boolean {
  const mediaType = (request.headers.get("content-type") ?? "").split(";")[0]?.trim().toLowerCase();
  return mediaType === "application/json";
}

/**
 * First message per field, in DOM order, so the client focuses the first
 * invalid control rather than whichever issue Zod happened to report last.
 * Keys the schema does not own are dropped instead of forwarded.
 */
function collectFieldErrors(
  issues: readonly { path: PropertyKey[]; message: string }[],
): Partial<Record<ReferenceFormField, ReferenceFormMessageKey>> {
  const fieldErrors: Partial<Record<ReferenceFormField, ReferenceFormMessageKey>> = {};
  for (const field of REFERENCE_FORM_FIELDS) {
    const issue = issues.find(
      (candidate) => candidate.path[0] === field && isReferenceFormMessageKey(candidate.message),
    );
    if (issue !== undefined) {
      fieldErrors[field] = issue.message as ReferenceFormMessageKey;
    }
  }
  return fieldErrors;
}

/**
 * A stable, content-derived reference. Deterministic on purpose: the same
 * payload always yields the same string, so tests and the documented
 * demonstration values stay reproducible.
 */
function buildReference(projectName: string): string {
  let hash = 0;
  for (const character of projectName) {
    hash = (hash * 31 + (character.codePointAt(0) ?? 0)) >>> 0;
  }
  return `REF-${hash.toString(36).toUpperCase().padStart(6, "0").slice(-6)}`;
}

export async function POST(request: Request): Promise<Response> {
  // Mirrors the /showcase route gate (docs/CLONING.md): with the flag off the
  // endpoint disappears alongside the page it serves.
  if (!ENV_CONFIG.NEXT_PUBLIC_ENABLE_SHOWCASE) {
    return new Response(null, { status: 404 });
  }

  if (!isJsonRequest(request)) {
    return rejection(415, { status: "rejected", formError: "errorUnexpected" });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    // The cause is deliberately not read: a malformed body is a client
    // contract failure, and parser text is internal detail.
    return rejection(400, { status: "rejected", formError: "errorUnexpected" });
  }

  const parsed = referenceFormSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors = collectFieldErrors(parsed.error.issues);
    return Object.keys(fieldErrors).length === 0
      ? rejection(422, { status: "rejected", formError: "errorUnexpected" })
      : rejection(422, { status: "rejected", fieldErrors });
  }

  // The two documented demonstration cases (the contract module):
  // one server-owned FIELD conflict, one FORM-level service failure.
  if (parsed.data.ownerEmail === REFERENCE_FORM_DEMO.fieldErrorEmail) {
    return rejection(409, {
      status: "rejected",
      fieldErrors: { ownerEmail: "errorEmailTaken" },
    });
  }
  if (parsed.data.ownerEmail === REFERENCE_FORM_DEMO.formErrorEmail) {
    return rejection(503, { status: "rejected", formError: "errorServiceUnavailable" });
  }

  return Response.json({
    status: "accepted",
    reference: buildReference(parsed.data.projectName),
  } satisfies ReferenceFormAccepted);
}
