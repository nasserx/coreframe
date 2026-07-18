import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ShowcasePageHeader } from "@/features/showcase/components/showcase-page-header";
import { ShowcaseSection } from "@/features/showcase/components/showcase-section";

export const metadata: Metadata = {
  title: "Forms",
};

export default function FormsPage() {
  return (
    <>
      <ShowcasePageHeader
        title="Forms"
        description="Field composition over Input, Textarea, and Label. All wiring is explicit — ids, aria-describedby, and aria-invalid are owned by the caller, exactly as the Field contract documents."
      />
      <ShowcaseSection
        title="Field composition"
        description="Label, control, and description connected with standard HTML attributes."
      >
        <div className="max-w-form">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="display-name">Display name</FieldLabel>
              <Input
                id="display-name"
                placeholder="A short name"
                aria-describedby="display-name-description"
              />
              <FieldDescription id="display-name-description">
                Shown wherever this entry appears.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <Textarea id="notes" placeholder="Anything worth remembering…" />
            </Field>
            <FieldSeparator>Optional details</FieldSeparator>
            <Field>
              <FieldLabel htmlFor="reference">Reference</FieldLabel>
              <Input id="reference" placeholder="Free-form text" disabled />
              <FieldDescription>Disabled until a source exists.</FieldDescription>
            </Field>
          </FieldGroup>
        </div>
      </ShowcaseSection>
      <ShowcaseSection
        title="Invalid state"
        description="aria-invalid drives the control styling; data-invalid tints the field; FieldError announces via role=alert."
      >
        <div className="max-w-form">
          <Field data-invalid="true">
            <FieldLabel htmlFor="invalid-example">Identifier</FieldLabel>
            <Input
              id="invalid-example"
              defaultValue="not a valid identifier"
              aria-invalid="true"
              aria-describedby="invalid-example-error"
            />
            <FieldError id="invalid-example-error">
              Use lowercase letters, digits, and dashes only.
            </FieldError>
          </Field>
        </div>
      </ShowcaseSection>
      <ShowcaseSection
        title="Error lists"
        description="FieldError deduplicates and renders message objects from any source."
      >
        <div className="max-w-form">
          <FieldError
            errors={[
              { message: "Must be at least 8 characters." },
              { message: "Must contain a digit." },
              { message: "Must contain a digit." },
            ]}
          />
        </div>
      </ShowcaseSection>
      <ShowcaseSection
        title="Grouped controls"
        description="FieldSet and FieldLegend carry native grouping semantics."
      >
        <div className="max-w-form">
          <FieldSet>
            <FieldLegend>Delivery window</FieldLegend>
            <FieldGroup>
              <Field orientation="responsive">
                <FieldLabel htmlFor="window-start">Start</FieldLabel>
                <Input id="window-start" type="time" defaultValue="09:00" />
              </Field>
              <Field orientation="responsive">
                <FieldLabel htmlFor="window-end">End</FieldLabel>
                <Input id="window-end" type="time" defaultValue="17:00" />
              </Field>
            </FieldGroup>
          </FieldSet>
        </div>
      </ShowcaseSection>
      <ShowcaseSection title="Form actions">
        <div className="flex gap-2">
          <Button type="button">Save</Button>
          <Button type="button" variant="ghost">
            Cancel
          </Button>
        </div>
      </ShowcaseSection>
    </>
  );
}
