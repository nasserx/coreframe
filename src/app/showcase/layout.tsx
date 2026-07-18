import type { ReactNode } from "react";
import type { Metadata } from "next";

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

export const metadata: Metadata = {
  title: {
    template: "%s — Foundation Showcase",
    default: "Foundation Showcase",
  },
};

export default function ShowcaseLayout({ children }: Readonly<{ children: ReactNode }>) {
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
