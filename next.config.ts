import type { NextConfig } from "next";

// Side-effect import: runs the fail-fast environment validation in
// `src/config/env.ts`. The config file is loaded by every Next.js entry
// point — `next dev`, `next build`, and `next start` — before the app
// itself, so this is the one place that guarantees validation executes at
// startup in both development and production. (An import from the root
// layout would not run under `next start` when every route is prerendered.)
import "./src/config/env";

const nextConfig: NextConfig = {/* config options here */};

export default nextConfig;
