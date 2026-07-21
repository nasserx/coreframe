import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Page not found",
};

/*
 * Root not-found boundary (Next.js file convention): rendered for every
 * unmatched URL app-wide and for explicit `notFound()` calls. Renders
 * inside the root layout, so theme, fonts, and direction apply as on any
 * page; unlike the error files this is a static Server Component, so it
 * may use the UI primitives directly. As a boundary file it renders without
 * the segment layouts, so it owns the `<main>` landmark itself
 * (docs/LAYOUT.md § The main landmark).
 */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-base font-medium text-foreground">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you are looking for does not exist or may have moved.
      </p>
      {/* Navigation styled as a button: buttonVariants on a real Link, so
          the element keeps link semantics (role, middle-click, focus
          behavior). Button + render would re-brand it role="button". */}
      <Link href="/" className={cn(buttonVariants(), "mt-1")}>
        Go to the home page
      </Link>
    </main>
  );
}
