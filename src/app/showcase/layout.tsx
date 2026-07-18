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
      <header className="border-b">
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
