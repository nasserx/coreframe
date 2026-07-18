import { readdirSync } from "node:fs";
import path from "node:path";

const PAGE_FILE = /^page\.(?:tsx|ts|jsx|js)$/;

/**
 * Discovers every App Router route by walking `src/app` for `page.*` files,
 * so a newly added page is covered by the browser suites automatically —
 * routes must never be hard-coded in a spec.
 *
 * Handles route groups `(name)` (transparent) and skips private `_folders`.
 * Dynamic (`[param]`) and parallel (`@slot`) segments throw: they need
 * concrete URLs/handling that discovery cannot invent, so the first team to
 * add one extends this helper instead of silently losing coverage.
 */
export function discoverRoutes(): string[] {
  const appDir = path.resolve(process.cwd(), "src", "app");
  const routes: string[] = [];

  const walk = (dir: string, routePath: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile()) {
        if (PAGE_FILE.test(entry.name)) {
          routes.push(routePath === "" ? "/" : routePath);
        }
        continue;
      }
      if (!entry.isDirectory()) {
        continue;
      }
      const segment = entry.name;
      if (segment.startsWith("_")) {
        continue;
      }
      if (segment.startsWith("[") || segment.startsWith("@")) {
        throw new Error(
          `Route discovery found an unsupported segment "${segment}" in ${dir}. ` +
            "Extend tests/e2e/routes.ts to map it to concrete URLs so browser coverage is not lost.",
        );
      }
      const childDir = path.join(dir, segment);
      if (segment.startsWith("(") && segment.endsWith(")")) {
        walk(childDir, routePath);
      } else {
        walk(childDir, `${routePath}/${segment}`);
      }
    }
  };

  walk(appDir, "");
  return routes.sort();
}

export const THEMES = ["light", "dark"] as const;
export const DIRECTIONS = ["ltr", "rtl"] as const;

export type Theme = (typeof THEMES)[number];
export type Direction = (typeof DIRECTIONS)[number];
