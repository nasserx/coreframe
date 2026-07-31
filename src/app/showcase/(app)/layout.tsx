import type { ReactNode } from "react";

import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellSidebar,
  AppShellSidebarTrigger,
} from "@/components/ui/app-shell";
import { Container } from "@/components/ui/container";
import { LocaleControl } from "@/components/ui/locale-control";
import { Stack } from "@/components/ui/stack";
import { ThemeControl } from "@/components/ui/theme-control";
import { ShowcaseNav } from "@/features/showcase/components/showcase-nav";

/*
 * AppShell chrome for the component sections. The `<main>` landmark comes
 * from AppShellMain — layouts own the landmark, pages never render it
 * (docs/LAYOUT.md § The main landmark). The showcase gate lives one level
 * up in `../layout.tsx`.
 */
export default function ShowcaseAppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AppShell>
      <AppShellSidebar label="Showcase sections">
        <ShowcaseNav />
      </AppShellSidebar>
      {/*
        The header is the showcase's instrument panel, not part of the
        inspected canvas: it stays physically fixed (dir="ltr") so the
        language and theme controls never jump to the other side of the
        screen when the locale switch flips the document to RTL. Its copy is
        English-only sandbox chrome; the page below it is what mirrors.
      */}
      <AppShellHeader dir="ltr" className="justify-between">
        <AppShellSidebarTrigger />
        <div className="flex items-center gap-3">
          <p className="text-caption text-muted-foreground max-sm:hidden">
            Engineering sandbox — not a product
          </p>
          <div className="flex items-center gap-1">
            <LocaleControl />
            <ThemeControl />
          </div>
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
