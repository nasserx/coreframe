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
    expect(t("light")).toBe(en.theme.light);
  });
});
