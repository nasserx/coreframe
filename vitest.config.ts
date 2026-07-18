import path from "node:path";
import { defineConfig } from "vitest/config";

/*
 * Unit/component layer only. Browser-level tests (console cleanliness, font
 * loading, accessibility scans) live in tests/e2e and run under Playwright —
 * see playwright.config.ts and docs/TESTING.md.
 *
 * JSX is transformed by esbuild using the tsconfig `jsx: "react-jsx"`
 * setting, so no React plugin is required.
 */
export default defineConfig({
  resolve: {
    // Mirror of the `@/*` path alias in tsconfig.json.
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["tests/setup.ts"],
    // Unit tests are colocated with the code they test; *.spec.ts under
    // tests/e2e belongs to Playwright and must never run here.
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
