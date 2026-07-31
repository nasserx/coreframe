"use client";

import { useEffect, useId, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/core/providers/locale-provider";
import type { Translator } from "@/i18n";

import { readReferenceFormRejection, submitReferenceForm } from "../reference-form-client";
import {
  isReferenceFormMessageKey,
  REFERENCE_FORM_FIELDS,
  REFERENCE_FORM_LIMITS,
  referenceFormSchema,
  type ReferenceFormValues,
} from "../reference-form-contract";

/**
 * Resolves a stored message KEY to live locale text. Form state holds keys, so
 * this is the only place a message becomes prose — which is what lets a
 * language switch re-render existing errors without re-validating. An
 * unrecognized key (a server that drifted ahead of this build) degrades to the
 * generic message instead of leaking a raw identifier into the UI.
 */
function messageText(t: Translator<"showcaseForm">, message: string | undefined): string {
  return message !== undefined && isReferenceFormMessageKey(message)
    ? t(message)
    : t("errorUnexpected");
}

/** `aria-describedby` owns help AND error text; both, in reading order. */
function describedBy(...ids: (string | false | undefined)[]): string {
  return ids.filter((id): id is string => typeof id === "string").join(" ");
}

/**
 * The reference form (docs/DATA_LAYER.md § Forms): React Hook Form owns field
 * state and submission status, `zodResolver` runs the shared contract from
 * `../reference-form-contract`, and `../reference-form-client` carries the
 * payload to the Showcase endpoint through `apiFetch`.
 *
 * Accessibility: every control is visibly labelled and natively `required`;
 * `aria-describedby` combines its description with its error; `aria-invalid`
 * and `FieldError`'s `role="alert"` carry invalidity beyond color. RHF focuses
 * the first invalid control on a failed submit, and a server field error
 * focuses its own control. The form-level alert is focused when no field owns
 * the failure, and pending/success state is announced from one polite region.
 *
 * Constraints: Showcase-private. It adds no shared abstraction — the primitives
 * are used through their public props exactly as a product would use them.
 */
export function ReferenceForm() {
  const t = useTranslations("showcaseForm");
  const baseId = useId();
  const formErrorRef = useRef<HTMLDivElement>(null);
  const [reference, setReference] = useState<string | null>(null);
  // Bumped on every form-level failure so a repeated identical failure still
  // moves focus; the message alone would not change between attempts.
  const [formErrorNonce, setFormErrorNonce] = useState(0);

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<ReferenceFormValues>({
    resolver: zodResolver(referenceFormSchema),
    defaultValues: { projectName: "", ownerEmail: "", implementationGoal: "" },
  });

  useEffect(() => {
    if (formErrorNonce > 0) {
      formErrorRef.current?.focus();
    }
  }, [formErrorNonce]);

  const ids = {
    projectName: `${baseId}-project-name`,
    projectNameHint: `${baseId}-project-name-hint`,
    projectNameError: `${baseId}-project-name-error`,
    ownerEmail: `${baseId}-owner-email`,
    ownerEmailHint: `${baseId}-owner-email-hint`,
    ownerEmailError: `${baseId}-owner-email-error`,
    goal: `${baseId}-goal`,
    goalHint: `${baseId}-goal-hint`,
    goalError: `${baseId}-goal-error`,
  };

  // `useWatch` (not `watch`) so the subscription is a hook: `watch` returns a
  // function React Compiler cannot memoize, which opts the whole component out.
  const goalLength = useWatch({ control, name: "implementationGoal" }).trim().length;
  const formError = errors.root?.message;

  const onSubmit = handleSubmit(async (values) => {
    // Belt and braces with the disabled submit button, which already blocks
    // both the click and the implicit Enter submission: this closure is
    // recreated per render, so a second submit sees the pending render's flag.
    if (isSubmitting) {
      return;
    }
    setReference(null);
    try {
      const accepted = await submitReferenceForm(values);
      setReference(accepted.reference);
    } catch (error) {
      const rejected = readReferenceFormRejection(error);
      let focusedField = false;
      for (const field of REFERENCE_FORM_FIELDS) {
        const message = rejected?.fieldErrors?.[field];
        if (message === undefined) {
          continue;
        }
        // Entered values are untouched: only the error is added, and focus
        // goes to the FIRST field the server rejected.
        setError(field, { message }, { shouldFocus: !focusedField });
        focusedField = true;
      }
      if (rejected?.formError !== undefined || !focusedField) {
        setError("root", { message: rejected?.formError ?? "errorUnexpected" });
        setFormErrorNonce((nonce) => nonce + 1);
      }
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} aria-busy={isSubmitting} className="flex flex-col gap-5">
      <FieldSet>
        <FieldLegend variant="label">{t("legend")}</FieldLegend>
        <FieldGroup>
          <Field data-invalid={errors.projectName === undefined ? undefined : "true"}>
            <FieldLabel htmlFor={ids.projectName}>{t("projectNameLabel")}</FieldLabel>
            <Input
              id={ids.projectName}
              required
              aria-invalid={errors.projectName === undefined ? undefined : true}
              aria-describedby={describedBy(
                ids.projectNameHint,
                errors.projectName !== undefined && ids.projectNameError,
              )}
              {...register("projectName")}
            />
            <FieldDescription id={ids.projectNameHint}>
              {t("projectNameDescription")}
            </FieldDescription>
            {errors.projectName === undefined ? null : (
              <FieldError id={ids.projectNameError}>
                {messageText(t, errors.projectName.message)}
              </FieldError>
            )}
          </Field>

          <Field data-invalid={errors.ownerEmail === undefined ? undefined : "true"}>
            <FieldLabel htmlFor={ids.ownerEmail}>{t("ownerEmailLabel")}</FieldLabel>
            {/*
             * dir="ltr": an email address is a Latin-only token, so it is
             * entered and displayed left-to-right even while the page is RTL.
             * The field's label, description, and error stay in the document
             * direction (docs/DIRECTION_AND_I18N.md § Bidi isolation).
             */}
            <Input
              id={ids.ownerEmail}
              type="email"
              dir="ltr"
              required
              aria-invalid={errors.ownerEmail === undefined ? undefined : true}
              aria-describedby={describedBy(
                ids.ownerEmailHint,
                errors.ownerEmail !== undefined && ids.ownerEmailError,
              )}
              {...register("ownerEmail")}
            />
            <FieldDescription id={ids.ownerEmailHint}>
              {t("ownerEmailDescription")}
            </FieldDescription>
            {errors.ownerEmail === undefined ? null : (
              <FieldError id={ids.ownerEmailError}>
                {messageText(t, errors.ownerEmail.message)}
              </FieldError>
            )}
          </Field>

          <Field data-invalid={errors.implementationGoal === undefined ? undefined : "true"}>
            <FieldLabel htmlFor={ids.goal}>{t("goalLabel")}</FieldLabel>
            <Textarea
              id={ids.goal}
              required
              aria-invalid={errors.implementationGoal === undefined ? undefined : true}
              aria-describedby={describedBy(
                ids.goalHint,
                errors.implementationGoal !== undefined && ids.goalError,
              )}
              {...register("implementationGoal")}
            />
            {/*
             * The character count lives inside the description the control
             * already references, so it is available to assistive technology
             * without a second live region announcing every keystroke.
             */}
            <FieldDescription id={ids.goalHint}>
              {t("goalDescription", { count: goalLength, max: REFERENCE_FORM_LIMITS.goalMax })}
            </FieldDescription>
            {errors.implementationGoal === undefined ? null : (
              <FieldError id={ids.goalError}>
                {messageText(t, errors.implementationGoal.message)}
              </FieldError>
            )}
          </Field>
        </FieldGroup>
      </FieldSet>

      {formError === undefined ? null : (
        <div
          ref={formErrorRef}
          role="alert"
          tabIndex={-1}
          className="rounded-lg border border-destructive/40 p-3 text-small font-medium text-destructive outline-none focus-visible:ring-2 focus-visible:ring-destructive"
        >
          {messageText(t, formError)}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner aria-hidden="true" data-icon="inline-start" /> : null}
          {isSubmitting ? t("submitPending") : t("submit")}
        </Button>
        {/*
         * One polite region for submission progress and success. The failure
         * path is the assertive alert above, so the two never compete.
         */}
        <p role="status" className="text-small text-muted-foreground">
          {isSubmitting ? t("statusPending") : null}
          {!isSubmitting && reference !== null ? (
            <>
              {t("statusSuccess")}{" "}
              <bdi dir="ltr" className="font-mono text-foreground">
                {reference}
              </bdi>
            </>
          ) : null}
        </p>
      </div>
    </form>
  );
}
