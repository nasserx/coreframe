import type { ReactNode } from "react";

/*
 * Bare-segment layout for routes that render without an application shell.
 * It exists to own the `<main>` landmark: the layout, never the page,
 * renders `main` (docs/LAYOUT.md § The main landmark). Shell-wrapped
 * segments get their landmark from AppShellMain / SiteShellMain instead —
 * see `src/app/showcase/(app)/layout.tsx` and `(site)/site/layout.tsx`.
 */
export default function HomeLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <main className="flex flex-1 flex-col">{children}</main>;
}
