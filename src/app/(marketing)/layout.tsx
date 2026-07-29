import type { ReactNode } from "react";

import { MarketingShell } from "@/features/marketing/marketing-shell";

/*
 * Production public-site ownership for the URL-transparent `(marketing)`
 * route group. SiteShell owns the sole main landmark; pages render content
 * only (docs/LAYOUT.md § The main landmark).
 */
export default function MarketingLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <MarketingShell>{children}</MarketingShell>;
}
