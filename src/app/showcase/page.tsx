import Link from "next/link";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SHOWCASE_SECTIONS = [
  {
    href: "/showcase/tokens",
    title: "Tokens",
    description: "Semantic colors, typography, radius, and theme behavior.",
  },
  {
    href: "/showcase/direction",
    title: "Direction & Arabic",
    description: "RTL behavior, Arabic type ramp, numerals, and bidi content.",
  },
  {
    href: "/showcase/actions",
    title: "Actions",
    description: "Buttons and badges across every variant and size.",
  },
  {
    href: "/showcase/forms",
    title: "Forms",
    description: "Inputs, textareas, labels, and Field composition.",
  },
  {
    href: "/showcase/display",
    title: "Display",
    description: "Cards, tables, avatars, separators, and scroll areas.",
  },
  {
    href: "/showcase/navigation",
    title: "Navigation",
    description: "Tabs, breadcrumbs, and pagination.",
  },
  {
    href: "/showcase/overlays",
    title: "Overlays",
    description: "Dialogs, alert dialogs, and toasts.",
  },
  {
    href: "/showcase/feedback",
    title: "Feedback",
    description: "Skeletons, spinners, empty states, and error boundaries.",
  },
  {
    href: "/showcase/data",
    title: "Data",
    description: "React Query wiring with loading composition.",
  },
] as const;

export default function ShowcaseIndexPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Foundation Showcase</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          An integration test for the reusable foundation: every page composes the real primitives,
          providers, and tokens exactly as a future product would. If something here feels awkward,
          the foundation — not the showcase — needs attention.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SHOWCASE_SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Card size="sm" className="h-full transition-colors group-hover:bg-muted/50">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
