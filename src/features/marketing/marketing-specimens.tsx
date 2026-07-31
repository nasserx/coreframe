export type MarketingSpecimenStep = Readonly<{
  kicker: string;
  title: string;
  description: string;
}>;

export type ArchitectureSpecimenProps = Readonly<{
  label: string;
  steps: readonly MarketingSpecimenStep[];
}>;

export type BilingualSystemSpecimenProps = Readonly<{
  label: string;
  steps: readonly MarketingSpecimenStep[];
}>;

export type QualityPipelineProps = Readonly<{
  label: string;
  stages: readonly string[];
}>;

/**
 * Informative delivery-path specimen. The visible ordered list is the
 * accessible diagram, not an aria-hidden visual duplicate.
 */
export function ArchitectureSpecimen({ label, steps }: ArchitectureSpecimenProps) {
  return (
    <figure
      aria-labelledby="architecture-specimen-caption"
      className="rounded-2xl border bg-background p-4 sm:p-6"
    >
      <figcaption id="architecture-specimen-caption" className="sr-only">
        {label}
      </figcaption>
      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map(({ kicker, title, description }, index) => (
          <li
            key={title}
            className="flex min-w-0 flex-col items-center rounded-xl border bg-card p-4 text-center"
          >
            <div className="mb-5 flex flex-col items-center gap-2">
              <span className="text-caption font-semibold text-link">{kicker}</span>
              <span aria-hidden="true" className="text-caption text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <p className="text-small font-semibold">{title}</p>
            <p className="mt-2 max-w-prose text-supporting text-muted-foreground">{description}</p>
          </li>
        ))}
      </ol>
    </figure>
  );
}

/**
 * Informative token-to-experience specimen. Its ordered semantic layers stay
 * in logical DOM order and therefore read correctly in both directions.
 */
export function BilingualSystemSpecimen({ label, steps }: BilingualSystemSpecimenProps) {
  return (
    <figure
      aria-labelledby="bilingual-specimen-caption"
      className="rounded-2xl border bg-surface p-4 sm:p-6"
    >
      <figcaption id="bilingual-specimen-caption" className="sr-only">
        {label}
      </figcaption>
      <ol className="flex flex-col gap-3">
        {steps.map(({ kicker, title, description }) => (
          <li key={title} className="min-w-0 rounded-xl border bg-background p-4 text-center">
            <div className="min-w-0">
              <span className="text-caption font-semibold text-link">{kicker}</span>
              <p className="mt-1 text-small font-semibold">{title}</p>
            </div>
            <p className="mx-auto mt-3 max-w-prose text-supporting text-muted-foreground">
              {description}
            </p>
          </li>
        ))}
      </ol>
    </figure>
  );
}

/**
 * Informative CI pipeline. The ordered list carries both visual sequencing and
 * accessible meaning; the step numerals are decorative only.
 */
export function QualityPipeline({ label, stages }: QualityPipelineProps) {
  return (
    <figure
      aria-labelledby="quality-pipeline-caption"
      className="rounded-2xl border bg-background p-4 sm:p-6"
    >
      <figcaption id="quality-pipeline-caption" className="text-center text-small font-semibold">
        {label}
      </figcaption>
      <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stages.map((stage, index) => (
          <li key={stage} className="min-w-0 rounded-lg border bg-card p-3 text-center">
            <span aria-hidden="true" className="text-caption font-semibold text-link">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="mt-2 text-supporting font-semibold">{stage}</p>
          </li>
        ))}
      </ol>
    </figure>
  );
}
