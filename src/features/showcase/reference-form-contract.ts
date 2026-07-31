/**
 * The reference form's CROSS-BOUNDARY contract — the one module the browser and
 * the Route Handler both import (docs/DATA_LAYER.md § Forms).
 *
 * ONE schema, two consumers. `zodResolver` validates against
 * `referenceFormSchema` in the browser, and
 * `src/app/api/showcase/forms/reference/route.ts` parses the request body with
 * the same object — a client and a server that cannot drift.
 *
 * Deliberately PURE and transport-free: schemas, wire types, demonstration
 * values, and helpers that behave identically on both sides. It must not import
 * `apiFetch`, React, browser APIs, components, or providers, so the server's
 * import graph never reaches client transport. Submission lives next door in
 * `reference-form-client.ts`, which only the browser imports
 * (`import-boundary.test.ts` in the route folder enforces the direction).
 *
 * Zod messages are CATALOGUE KEYS, not prose. Locale-aware validation with no
 * second form-state system: React Hook Form stores the key, the component
 * translates it at render time, so switching language re-renders existing
 * errors in the new locale without re-validating and without ever freezing one
 * locale's strings into long-lived form state. The wire format carries the same
 * keys, so a server-owned error localizes exactly like a client-owned one.
 *
 * This is a reference pattern, not a form framework: no generic Form
 * abstraction, no RHF-aware wrappers around the shared primitives.
 */
import { z } from "zod";

import type { MessageKey } from "@/i18n";

/** The form's fields, in DOM order — also the server's field-error ordering. */
export const REFERENCE_FORM_FIELDS = ["projectName", "ownerEmail", "implementationGoal"] as const;

export type ReferenceFormField = (typeof REFERENCE_FORM_FIELDS)[number];

/**
 * Every message this contract may emit, client- or server-owned. Declared
 * `satisfies readonly MessageKey<"showcaseForm">[]`, so a key that is missing
 * from the catalogue fails the typecheck instead of rendering as raw text.
 */
export const REFERENCE_FORM_MESSAGE_KEYS = [
  "errorProjectNameRequired",
  "errorProjectNameShort",
  "errorProjectNameLong",
  "errorOwnerEmailRequired",
  "errorOwnerEmailInvalid",
  "errorGoalRequired",
  "errorGoalShort",
  "errorGoalLong",
  "errorEmailTaken",
  "errorServiceUnavailable",
  "errorUnexpected",
] as const satisfies readonly MessageKey<"showcaseForm">[];

export type ReferenceFormMessageKey = (typeof REFERENCE_FORM_MESSAGE_KEYS)[number];

/** Narrows an arbitrary message string to a catalogue key. */
export function isReferenceFormMessageKey(value: string): value is ReferenceFormMessageKey {
  return (REFERENCE_FORM_MESSAGE_KEYS as readonly string[]).includes(value);
}

/**
 * The field contract. Normalization runs BEFORE the length checks (`.trim()`,
 * `.toLowerCase()`), so a whitespace-only value fails "required" rather than
 * passing a minimum, and `onSubmit` receives the normalized values that are
 * sent and re-parsed server-side.
 */
export const referenceFormSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(1, { error: "errorProjectNameRequired" satisfies ReferenceFormMessageKey })
    .min(2, { error: "errorProjectNameShort" satisfies ReferenceFormMessageKey })
    .max(80, { error: "errorProjectNameLong" satisfies ReferenceFormMessageKey }),
  ownerEmail: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, { error: "errorOwnerEmailRequired" satisfies ReferenceFormMessageKey })
    .pipe(z.email({ error: "errorOwnerEmailInvalid" satisfies ReferenceFormMessageKey })),
  implementationGoal: z
    .string()
    .trim()
    .min(1, { error: "errorGoalRequired" satisfies ReferenceFormMessageKey })
    .min(20, { error: "errorGoalShort" satisfies ReferenceFormMessageKey })
    .max(500, { error: "errorGoalLong" satisfies ReferenceFormMessageKey }),
});

export type ReferenceFormValues = z.infer<typeof referenceFormSchema>;

/** Authored limits, shared by the schema above and the character counter. */
export const REFERENCE_FORM_LIMITS = {
  projectNameMax: 80,
  goalMin: 20,
  goalMax: 500,
} as const;

/** The accepted response: a reference string, and nothing created. */
export const referenceFormAcceptedSchema = z.object({
  status: z.literal("accepted"),
  reference: z.string().min(1),
});

export type ReferenceFormAccepted = z.infer<typeof referenceFormAcceptedSchema>;

/**
 * The rejected response. `fieldErrors` maps back onto controls; `formError` is
 * deliberately separate, because a service failure belongs to the submission,
 * not to any one field. Both carry catalogue keys, never server prose and never
 * internal detail.
 */
export const referenceFormRejectionSchema = z.object({
  status: z.literal("rejected"),
  formError: z.enum(REFERENCE_FORM_MESSAGE_KEYS).optional(),
  fieldErrors: z
    .partialRecord(z.enum(REFERENCE_FORM_FIELDS), z.enum(REFERENCE_FORM_MESSAGE_KEYS))
    .optional(),
});

export type ReferenceFormRejection = z.infer<typeof referenceFormRejectionSchema>;

/**
 * Deterministic demonstration inputs. Documented in the UI next to the form
 * (`components/reference-form-section.tsx`) so the behavior is discoverable
 * rather than hidden magic, and used by both the route handler and its tests.
 */
export const REFERENCE_FORM_DEMO = {
  /** Produces a server-owned error on the `ownerEmail` field (HTTP 409). */
  fieldErrorEmail: "taken@example.com",
  /** Produces a form-level service error (HTTP 503). */
  formErrorEmail: "unavailable@example.com",
} as const;
