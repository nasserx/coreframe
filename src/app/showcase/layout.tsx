import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ENV_CONFIG } from "@/config/env";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellSidebar,
  AppShellSidebarTrigger,
} from "@/components/ui/app-shell";
import { Container } from "@/components/ui/container";
import { Stack } from "@/components/ui/stack";
import { ThemeControl } from "@/components/ui/theme-control";
import { DirectionControl } from "@/features/showcase/components/direction-control";
import { ShowcaseNav } from "@/features/showcase/components/showcase-nav";

// With the showcase gated off, the segment prerenders the 404 page — the
// metadata must not brand that 404 with the showcase title template.
export const metadata: Metadata = ENV_CONFIG.NEXT_PUBLIC_ENABLE_SHOWCASE
  ? {
      title: {
        template: "%s — Foundation Showcase",
        default: "Foundation Showcase",
      },
    }
  : {};

export default function ShowcaseLayout({ children }: Readonly<{ children: ReactNode }>) {
  // Build-time gate: NEXT_PUBLIC_ENABLE_SHOWCASE is inlined during `next
  // build`, so with the flag off every /showcase route prerenders as the
  // static 404 page — routes stay static either way (docs/CLONING.md).
  if (!ENV_CONFIG.NEXT_PUBLIC_ENABLE_SHOWCASE) {
    notFound();
  }
  return (
    <AppShell>
      <AppShellSidebar label="Showcase sections">
        <ShowcaseNav />
      </AppShellSidebar>
      {/*
        The header is the showcase's instrument panel, not part of the
        inspected canvas: it stays physically fixed (dir="ltr") so the
        direction and theme controls never jump to the other side of the
        screen when the very toggle they host is used. Its copy is
        English-only sandbox chrome; the page below it is what mirrors.
      */}
      <AppShellHeader dir="ltr" className="justify-between">
        <AppShellSidebarTrigger />
        <div className="flex items-center gap-3">
          <p className="text-caption text-muted-foreground max-sm:hidden">
            Engineering sandbox — not a product
          </p>
          <DirectionControl />
          <ThemeControl />
        </div>
      </AppShellHeader>
      <AppShellMain>
        <Container className="py-10">
          <Stack gap="xl">{children}</Stack>
        </Container>
      </AppShellMain>
    </AppShell>
  );
}
