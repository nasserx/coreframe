import type { ReactNode } from "react";

import { Stack, stackVariants } from "@/components/ui/stack";

type ShowcaseSectionProps = Readonly<{
  title: string;
  description?: string;
  children: ReactNode;
}>;

export function ShowcaseSection({ title, description, children }: ShowcaseSectionProps) {
  return (
    <section className={stackVariants({ gap: "md" })}>
      <Stack gap="xs">
        <h2 className="text-subheading">{title}</h2>
        {description ? (
          // dir="auto": prose direction follows the text's first strong
          // character, so English copy stays LTR with correct punctuation
          // under the RTL inspection toggle (docs/DIRECTION_AND_I18N.md).
          <p dir="auto" className="max-w-prose text-body">
            {description}
          </p>
        ) : null}
      </Stack>
      {children}
    </section>
  );
}
