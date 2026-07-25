import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/*
 * Guards the light/dark parity contract from docs/DESIGN_TOKENS.md: every
 * semantic token must be defined in BOTH theme files. A token added to one
 * side only fails silently at runtime — the missing side inherits whatever
 * the cascade provides — so this is checked at the source-text level, where
 * jsdom's lack of a real CSS cascade doesn't matter. Visual resolution of
 * the tokens is the browser layer's job (tests/e2e).
 */
function tokenNames(file: string): Set<string> {
  const css = readFileSync(join(import.meta.dirname, file), "utf8");
  return new Set(Array.from(css.matchAll(/^\s*(--[\w-]+)\s*:/gm), (match) => match[1] ?? ""));
}

describe("theme token parity", () => {
  const light = tokenNames("light.css");
  const dark = tokenNames("dark.css");

  it("defines every dark token in light", () => {
    expect(Array.from(dark).filter((name) => !light.has(name))).toEqual([]);
  });

  it("defines every light color/elevation token in dark", () => {
    // Theme-neutral shape tokens (e.g. --radius-base) live in :root inside
    // light.css and deliberately have no dark counterpart.
    const themed = Array.from(light).filter(
      (name) => name.startsWith("--color-") || name.startsWith("--elevation-"),
    );
    expect(themed.filter((name) => !dark.has(name))).toEqual([]);
  });

  it("actually found tokens (the parser is not silently matching nothing)", () => {
    expect(light.size).toBeGreaterThan(30);
    expect(dark.size).toBeGreaterThan(30);
  });

  /*
   * Parity across the two themes is not enough on its own: a --color-* defined
   * in both, in perfect parity, but never referenced by the theme.css bridge
   * generates NO Tailwind utility. The token then looks correct in every review
   * of the theme files while being unreachable from a component.
   */
  it("references every semantic color token from the theme.css bridge", () => {
    const bridge = readFileSync(join(import.meta.dirname, "theme.css"), "utf8");
    const colors = Array.from(light).filter((name) => name.startsWith("--color-"));

    expect(colors.length).toBeGreaterThan(20);
    expect(colors.filter((name) => !bridge.includes(`var(${name})`))).toEqual([]);
  });
});
