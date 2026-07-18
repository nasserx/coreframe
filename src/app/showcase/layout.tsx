import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { ThemeControl } from "@/components/ui/theme-control";
import { DirectionControl } from "@/features/showcase/components/direction-control";

export const metadata: Metadata = {
  title: {
    template: "%s — Foundation Showcase",
    default: "Foundation Showcase",
  },
};

export default function ShowcaseLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/*
        The header is the showcase's instrument panel, not part of the
        inspected canvas: it stays physically fixed (dir="ltr") so the
        direction and theme controls never jump to the other side of the
        screen when the very toggle they host is used. Its copy is
        English-only sandbox chrome; the page below it is what mirrors.
      */}
      <header dir="ltr" className="border-b">
        <Container className="flex h-12 items-center justify-between gap-4">
          <Link href="/showcase" className="text-sm font-medium">
            Foundation Showcase
          </Link>
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground max-sm:hidden">
              Engineering sandbox — not a product
            </p>
            <DirectionControl />
            <ThemeControl />
          </div>
        </Container>
      </header>
      <main className="flex-1 py-10">
        <Container className="flex flex-col gap-12">{children}</Container>
      </main>
    </div>
  );
}
