import Link from "next/link";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "@/components/ui/page-header";
import { SHOWCASE_SECTIONS } from "@/features/showcase/showcase-sections";

export default function ShowcaseIndexPage() {
  return (
    <>
      <PageHeader>
        <PageHeaderTitle>Foundation Showcase</PageHeaderTitle>
        <PageHeaderDescription>
          An integration test for the reusable foundation: every page composes the real primitives,
          providers, and tokens exactly as a future product would. If something here feels awkward,
          the foundation — not the showcase — needs attention.
        </PageHeaderDescription>
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SHOWCASE_SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-xl transition-[translate] outline-none hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:hover:translate-none motion-reduce:focus-visible:translate-none"
          >
            <Card size="sm" className="h-full transition-colors group-hover:bg-accent">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
