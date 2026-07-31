/**
 * Browser-side transport for the reference form — the only half of the wiring
 * that knows about HTTP (docs/DATA_LAYER.md § Forms).
 *
 * Split from `reference-form-contract.ts` on purpose: the contract is imported
 * by BOTH the browser and the Route Handler, so it must stay free of
 * `apiFetch`. This module is imported by the form component alone, and the
 * route's import graph must never reach it — asserted by
 * `src/app/api/showcase/forms/reference/import-boundary.test.ts`.
 */
import { apiFetch } from "@/api/client";
import { isApiError } from "@/api/errors";

import {
  type ReferenceFormAccepted,
  referenceFormAcceptedSchema,
  type ReferenceFormRejection,
  referenceFormRejectionSchema,
  type ReferenceFormValues,
} from "./reference-form-contract";

/** The endpoint backing the reference form (Showcase-owned, gated with it). */
export const REFERENCE_FORM_PATH = "/api/showcase/forms/reference";

/** Submits through the shared client — never a bare `fetch` from a component. */
export function submitReferenceForm(
  values: ReferenceFormValues,
  signal?: AbortSignal,
): Promise<ReferenceFormAccepted> {
  return apiFetch(REFERENCE_FORM_PATH, {
    method: "POST",
    body: values,
    schema: referenceFormAcceptedSchema,
    ...(signal === undefined ? {} : { signal }),
  });
}

/**
 * Reads a structured rejection out of a thrown `ApiError`, so the component
 * branches on the form's own contract instead of on transport details. Returns
 * `null` for anything else — a network failure, a timeout, or a body that does
 * not match the contract all fall back to the generic form-level message.
 */
export function readReferenceFormRejection(error: unknown): ReferenceFormRejection | null {
  if (!isApiError(error) || error.kind !== "http") {
    return null;
  }
  const parsed = referenceFormRejectionSchema.safeParse(error.body);
  return parsed.success ? parsed.data : null;
}
