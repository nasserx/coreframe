import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ENV_CONFIG } from "@/config/env";

// With the showcase gated off, the segment prerenders the 404 page — the
// metadata must not brand that 404 with the showcase title template.
export const metadata: Metadata = ENV_CONFIG.NEXT_PUBLIC_ENABLE_SHOWCASE
  ? {
      title: {
        template: "%s — Coreframe Showcase",
        default: "Coreframe Showcase",
      },
    }
  : {};

/*
 * Gate-only segment layout. The chrome lives one level down in the route
 * groups: `(app)` wraps the component sections in the AppShell, `(site)`
 * wraps the site-shell demo in the SiteShell — so the showcase exercises
 * both shells as real layouts.
 */
export default function ShowcaseLayout({ children }: Readonly<{ children: ReactNode }>) {
  // Build-time gate: NEXT_PUBLIC_ENABLE_SHOWCASE is inlined during `next
  // build`, so with the flag off every /showcase route prerenders as the
  // static 404 page — routes stay static either way (docs/CLONING.md).
  if (!ENV_CONFIG.NEXT_PUBLIC_ENABLE_SHOWCASE) {
    notFound();
  }
  return children;
}
