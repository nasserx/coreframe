import { describe, expect, it } from "vitest";

import {
  isReferenceFormMessageKey,
  REFERENCE_FORM_LIMITS,
  referenceFormRejectionSchema,
  referenceFormSchema,
} from "./reference-form-contract";

/*
 * The cross-boundary field contract. These are the boundaries the browser and
 * the route handler BOTH enforce, so they are asserted once here rather than
 * duplicated in the component and route tests. Transport behavior belongs to
 * ./reference-form-client.test.ts.
 */

const VALID = {
  projectName: "Atlas",
  ownerEmail: "owner@example.com",
  implementationGoal: "Wire the reference form end to end and prove it.",
} as const;

/** A goal of exactly `length` characters, so limits are asserted, not guessed. */
function goalOf(length: number): string {
  return "g".repeat(length);
}

function issuesFor(values: Record<string, unknown>): { path: string; message: string }[] {
  const parsed = referenceFormSchema.safeParse(values);
  return parsed.success
    ? []
    : parsed.error.issues.map((issue) => ({
        path: String(issue.path[0]),
        message: issue.message,
      }));
}

function firstMessage(values: Record<string, unknown>, field: string): string | undefined {
  return issuesFor(values).find((issue) => issue.path === field)?.message;
}

describe("referenceFormSchema", () => {
  it("accepts a valid payload and returns normalized values", () => {
    const parsed = referenceFormSchema.safeParse({
      projectName: "  Atlas  ",
      ownerEmail: "  Owner@Example.COM ",
      implementationGoal: `  ${VALID.implementationGoal}  `,
    });

    expect(parsed.success).toBe(true);
    // Trimming and lowercasing run BEFORE the checks, so the submitted payload
    // is the normalized one — the same value the server re-parses.
    expect(parsed.data).toEqual({
      projectName: "Atlas",
      ownerEmail: "owner@example.com",
      implementationGoal: VALID.implementationGoal,
    });
  });

  it("emits catalogue KEYS, never prose, so messages stay locale-independent", () => {
    const messages = issuesFor({ projectName: "", ownerEmail: "", implementationGoal: "" }).map(
      (issue) => issue.message,
    );

    expect(messages).not.toHaveLength(0);
    for (const message of messages) {
      expect(isReferenceFormMessageKey(message)).toBe(true);
    }
  });

  it("treats a whitespace-only value as missing, not as a short value", () => {
    const values = { ...VALID, projectName: "   ", implementationGoal: "        " };

    expect(firstMessage(values, "projectName")).toBe("errorProjectNameRequired");
    expect(firstMessage(values, "implementationGoal")).toBe("errorGoalRequired");
  });

  it("enforces the project-name boundaries", () => {
    expect(firstMessage({ ...VALID, projectName: "" }, "projectName")).toBe(
      "errorProjectNameRequired",
    );
    expect(firstMessage({ ...VALID, projectName: "A" }, "projectName")).toBe(
      "errorProjectNameShort",
    );
    expect(firstMessage({ ...VALID, projectName: "At" }, "projectName")).toBeUndefined();
    expect(
      firstMessage(
        { ...VALID, projectName: "a".repeat(REFERENCE_FORM_LIMITS.projectNameMax) },
        "projectName",
      ),
    ).toBeUndefined();
    expect(
      firstMessage(
        { ...VALID, projectName: "a".repeat(REFERENCE_FORM_LIMITS.projectNameMax + 1) },
        "projectName",
      ),
    ).toBe("errorProjectNameLong");
  });

  it("enforces the implementation-goal boundaries", () => {
    expect(firstMessage({ ...VALID, implementationGoal: goalOf(19) }, "implementationGoal")).toBe(
      "errorGoalShort",
    );
    expect(
      firstMessage(
        { ...VALID, implementationGoal: goalOf(REFERENCE_FORM_LIMITS.goalMin) },
        "implementationGoal",
      ),
    ).toBeUndefined();
    expect(
      firstMessage(
        { ...VALID, implementationGoal: goalOf(REFERENCE_FORM_LIMITS.goalMax) },
        "implementationGoal",
      ),
    ).toBeUndefined();
    expect(
      firstMessage(
        { ...VALID, implementationGoal: goalOf(REFERENCE_FORM_LIMITS.goalMax + 1) },
        "implementationGoal",
      ),
    ).toBe("errorGoalLong");
  });

  it("distinguishes a missing email from a malformed one", () => {
    expect(firstMessage({ ...VALID, ownerEmail: "   " }, "ownerEmail")).toBe(
      "errorOwnerEmailRequired",
    );
    expect(firstMessage({ ...VALID, ownerEmail: "owner@" }, "ownerEmail")).toBe(
      "errorOwnerEmailInvalid",
    );
    expect(firstMessage({ ...VALID, ownerEmail: "owner at example.com" }, "ownerEmail")).toBe(
      "errorOwnerEmailInvalid",
    );
  });

  it("reports every invalid field at once, so the first invalid control is knowable", () => {
    const paths = issuesFor({ projectName: "", ownerEmail: "", implementationGoal: "" }).map(
      (issue) => issue.path,
    );

    expect(new Set(paths)).toEqual(new Set(["projectName", "ownerEmail", "implementationGoal"]));
  });

  it("rejects a non-object payload", () => {
    expect(referenceFormSchema.safeParse(null).success).toBe(false);
    expect(referenceFormSchema.safeParse("Atlas").success).toBe(false);
  });
});

describe("referenceFormRejectionSchema", () => {
  it("rejects a message that is not part of the contract's vocabulary", () => {
    expect(
      referenceFormRejectionSchema.safeParse({
        status: "rejected",
        formError: "Error: connection refused at /srv/app/db.ts:42",
      }).success,
    ).toBe(false);
  });

  it("accepts a field-scoped rejection", () => {
    expect(
      referenceFormRejectionSchema.safeParse({
        status: "rejected",
        fieldErrors: { ownerEmail: "errorEmailTaken" },
      }).success,
    ).toBe(true);
  });
});
