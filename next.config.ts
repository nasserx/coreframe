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

const nextConfig: NextConfig = {/* config options here */};

export default nextConfig;
