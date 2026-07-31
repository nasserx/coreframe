import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/*
 * Architectural coverage for the reference form's server/client split
 * (docs/DATA_LAYER.md § Forms).
 *
 * The Route Handler and the browser share ONE Zod contract, which is exactly
 * why the contract must stay transport-free: if it — or anything else the
 * handler reaches — imported `apiFetch` or the browser's transport module, the
 * server would carry client code, and the split would be a naming convention
 * rather than a boundary.
 *
 * A unit test cannot prove this by executing the handler (an unused import
 * still loads silently), so this walks the handler's TRANSITIVE import graph in
 * source form and asserts what is not in it. ESLint's folder rules do not cover
 * this case: `src/app` is allowed to import features, so nothing else fails
 * when the handler reaches client transport.
 */

const SRC = path.resolve(import.meta.dirname, "..", "..", "..", "..", "..");
const ROUTE = path.join(import.meta.dirname, "route.ts");

const FORBIDDEN = [
  path.join(SRC, "api", "client.ts"),
  path.join(SRC, "features", "showcase", "reference-form-client.ts"),
];

const CONTRACT = path.join(SRC, "features", "showcase", "reference-form-contract.ts");

/** Every `from "…"` specifier in a module, type-only imports included. */
function importSpecifiers(source: string): string[] {
  return [...source.matchAll(/\bfrom\s+["']([^"']+)["']/g)].map((match) => match[1] ?? "");
}

/**
 * Resolves a specifier to a first-party file, or `null` for a bare package.
 * Only `@/` and relative forms can reach repository code, which is the whole
 * surface this assertion needs to cover.
 */
function resolveFirstParty(specifier: string, fromFile: string): string | null {
  const base = specifier.startsWith("@/")
    ? path.join(SRC, specifier.slice(2))
    : specifier.startsWith(".")
      ? path.resolve(path.dirname(fromFile), specifier)
      : null;
  if (base === null) {
    return null;
  }
  for (const candidate of [
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ]) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

/** The handler's transitive first-party import graph, including its entry. */
function importGraph(entry: string): Set<string> {
  const seen = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop();
    if (file === undefined || seen.has(file)) {
      continue;
    }
    seen.add(file);
    const source = readFileSync(file, "utf8");
    for (const specifier of importSpecifiers(source)) {
      const resolved = resolveFirstParty(specifier, file);
      if (resolved !== null) {
        queue.push(resolved);
      }
    }
  }
  return seen;
}

describe("reference route handler import boundary", () => {
  const graph = importGraph(ROUTE);

  it("reaches the shared contract, so the assertions below are not vacuous", () => {
    expect(graph.has(ROUTE)).toBe(true);
    expect(graph.has(CONTRACT)).toBe(true);
    // More than the entry file alone was walked.
    expect(graph.size).toBeGreaterThan(1);
  });

  it("never reaches apiFetch or the browser transport module", () => {
    const reached = FORBIDDEN.filter((file) => graph.has(file));

    expect(reached).toEqual([]);
  });

  it("declares no import specifier pointing at client transport", () => {
    /*
     * Backstop for a specifier shape `resolveFirstParty` cannot resolve — a
     * different alias, an extensionless directory form, a re-export. It matches
     * SPECIFIERS only, never file text: `apiFetch` is named in prose in several
     * of these modules (a comment in the route, the contract's JSDoc, and the
     * `noteTransport` catalogue string the UI renders), and prose is not an
     * import.
     */
    const offenders = [...graph].flatMap((file) =>
      importSpecifiers(readFileSync(file, "utf8"))
        .filter(
          (specifier) =>
            specifier.endsWith("/api/client") || specifier.endsWith("reference-form-client"),
        )
        .map((specifier) => `${path.relative(SRC, file)} → ${specifier}`),
    );

    expect(offenders).toEqual([]);
  });

  it("keeps the shared contract itself free of transport and React", () => {
    const source = readFileSync(CONTRACT, "utf8");

    for (const forbidden of ["@/api/client", "@/api/errors", "react", "next/"]) {
      expect(source).not.toContain(`from "${forbidden}`);
    }
  });
});
