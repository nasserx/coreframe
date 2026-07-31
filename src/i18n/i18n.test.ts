import { describe, expect, it } from "vitest";

import { APP_LOCALES } from "@/config";

import { CATALOGUE_LOADERS, DEFAULT_CATALOGUE } from "./catalogue";
import { en } from "./messages/en";
import { createTranslator, translate } from "./translate";

/**
 * Structural parity is enforced at the type level (each catalogue is
 * `: Messages`), but a runtime guard defends against a locale drifting if that
 * type coupling is ever loosened — the same belt-and-braces stance as the token
 * parity tests.
 */
function flatKeys(catalogue: Record<string, Record<string, string>>): string[] {
  return Object.entries(catalogue)
    .flatMap(([namespace, entries]) => Object.keys(entries).map((key) => `${namespace}.${key}`))
    .sort();
}

/*
 * Mirrors the PLACEHOLDER pattern in translate.ts. Types cannot reach inside a
 * message string, so placeholder drift is invisible to `tsc`: a translation
 * that drops {digest} or misspells {count} keeps perfect key parity, and
 * `translate` deliberately leaves unknown placeholders verbatim — so the only
 * symptom is a literal "{digest}" rendered to a user in that locale.
 */
function placeholdersByKey(catalogue: Record<string, Record<string, string>>): Map<string, string> {
  const found = new Map<string, string>();
  for (const [namespace, entries] of Object.entries(catalogue)) {
    for (const [key, message] of Object.entries(entries)) {
      const names = [...message.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? "");
      found.set(`${namespace}.${key}`, [...new Set(names)].sort().join(","));
    }
  }
  return found;
}

describe("message catalogues", () => {
  it("registers a loader for every supported locale", () => {
    for (const locale of APP_LOCALES.SUPPORTED) {
      expect(typeof CATALOGUE_LOADERS[locale]).toBe("function");
    }
  });

  it("every supported locale has the exact same keys as the canonical English catalogue", async () => {
    const englishKeys = flatKeys(en);
    for (const locale of APP_LOCALES.SUPPORTED) {
      const catalogue = await CATALOGUE_LOADERS[locale]();
      expect(flatKeys(catalogue), `locale "${locale}" key parity`).toEqual(englishKeys);
    }
  });

  it("every supported locale uses the same placeholders as the canonical English message", async () => {
    const englishPlaceholders = placeholdersByKey(en);
    // Guard against the comparison below going vacuous if the extraction ever
    // stops matching translate.ts's pattern.
    expect(
      [...englishPlaceholders.values()].filter((names) => names !== "").length,
    ).toBeGreaterThan(0);

    for (const locale of APP_LOCALES.SUPPORTED) {
      const catalogue = await CATALOGUE_LOADERS[locale]();
      const localePlaceholders = placeholdersByKey(catalogue);
      for (const [key, expected] of englishPlaceholders) {
        expect(localePlaceholders.get(key), `locale "${locale}", message "${key}"`).toBe(expected);
      }
    }
  });

  it("resolves the default locale's catalogue synchronously as the bundled default", () => {
    expect(DEFAULT_CATALOGUE).toBe(en);
  });
});

describe("translate", () => {
  it("returns the raw message when there are no variables", () => {
    expect(translate(en, "error", "title")).toBe(en.error.title);
  });

  it("fills named placeholders", () => {
    expect(translate(en, "error", "reference", { digest: "abc123" })).toBe("Reference: abc123");
  });

  it("coerces numeric variables to strings", () => {
    const result = translate(en, "site", "localesCount", { count: 2 });
    expect(result).toContain("2");
  });

  it("leaves an unknown placeholder verbatim so missing data is visible", () => {
    // `reference` expects {digest}; supplying an unrelated var leaves it intact.
    expect(translate(en, "error", "reference", { other: "x" })).toBe("Reference: {digest}");
  });

  it("createTranslator binds a catalogue and namespace", () => {
    const t = createTranslator(en, "theme");
    expect(t("toDark")).toBe(en.theme.toDark);
  });
});
