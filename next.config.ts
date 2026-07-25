import type { NextConfig } from "next";

// Side-effect import: runs the fail-fast environment validation in
// `src/config/env-validation.ts` (the Zod half of the env contract, kept out
// of `env.ts` so Zod never ships to the client — docs/audit/
// 2026-07-health-audit.md §1.2). The config file is loaded by every Next.js
// entry point — `next dev`, `next build`, and `next start` — before the app
// itself, so this is the one place that guarantees validation executes at
// startup in both development and production, while keeping the validator out
// of every client bundle. (An import from the root layout would not run under
// `next start` when every route is prerendered.)
import "./src/config/env-validation";

const nextConfig: NextConfig = {
  // PER-DEVELOPER VALUE — replace or delete it in a clone (docs/CLONING.md §3).
  // Lets the DEV server accept requests whose Origin is this LAN address, so a
  // phone or tablet on the same network can browse the dev site; it has no
  // effect on `next build`/`next start`, so there is no production exposure.
  // Still a security control, though: an entry inherited from a template points
  // at whatever device now holds that address on the reader's network.
  allowedDevOrigins: ["192.168.1.2"],
};

export default nextConfig;
