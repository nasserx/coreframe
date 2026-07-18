import type { ReactNode } from "react";

type ShowcaseSectionProps = Readonly<{
  title: string;
  description?: string;
  children: ReactNode;
}>;

export function ShowcaseSection({ title, description, children }: ShowcaseSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">{title}</h2>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
