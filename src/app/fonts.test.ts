import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const appSource = (file: string): string => readFileSync(join(import.meta.dirname, file), "utf8");
const styleSource = (file: string): string =>
  readFileSync(join(import.meta.dirname, "..", "styles", file), "utf8");

describe("bilingual font ownership", () => {
  it("mounts Tajawal before Inter in the shared sans stack", () => {
    const bridge = styleSource("theme.css");
    const tajawalIndex = bridge.indexOf("var(--font-tajawal)");
    const interIndex = bridge.indexOf("var(--font-inter)");

    expect(tajawalIndex).toBeGreaterThan(-1);
    expect(interIndex).toBeGreaterThan(tajawalIndex);
    expect(bridge).not.toContain("var(--font-manrope)");
    expect(bridge).not.toContain("var(--font-plus-jakarta-sans)");
    expect(bridge).toMatch(/ui-sans-serif,\s*system-ui,\s*sans-serif/);
  });

  it("pins the compact semantic typography ramp and Arabic leading", () => {
    const bridge = styleSource("theme.css");
    const globals = appSource("globals.css");
    const expected = [
      "--text-heading: 1.5rem;",
      "--text-heading--line-height: 1.2;",
      "--text-heading--font-weight: 700;",
      "--text-subheading: 1.125rem;",
      "--text-subheading--line-height: 1.35;",
      "--text-subheading--font-weight: 600;",
      "--text-body-lg: 1.125rem;",
      "--text-body-lg--line-height: 1.625;",
      "--text-body-lg--font-weight: 500;",
      "--text-body: 1rem;",
      "--text-body--line-height: 1.5;",
      "--text-body--font-weight: 500;",
      "--text-small: 0.875rem;",
      "--text-small--line-height: 1.45;",
      "--text-small--font-weight: 500;",
      "--text-supporting: 0.8125rem;",
      "--text-supporting--line-height: 1.45;",
      "--text-supporting--font-weight: 500;",
      "--text-caption: 0.75rem;",
      "--text-caption--font-weight: 500;",
    ] as const;

    for (const declaration of expected) {
      expect(bridge).toContain(declaration);
    }
    expect(bridge).toContain('[dir="rtl"]');
    expect(bridge).toContain("--text-body-lg: 1.0625rem;");
    expect(bridge).toContain("--text-body-lg--font-weight: 500;");
    expect(bridge).toContain("--text-body: 0.9375rem;");
    expect(bridge).toContain("--text-body--line-height: 1.65;");
    expect(bridge).toContain("--text-body--font-weight: 500;");
    expect(bridge).toContain("--text-small: 0.8125rem;");
    expect(bridge).toContain("--text-small--line-height: 1.6;");
    expect(bridge).toContain("--text-supporting--line-height: 1.6;");
    expect(globals).toContain("@apply bg-background text-body text-foreground;");
  });

  it("loads the authored Tajawal weight files and keeps its metric fallback disabled", () => {
    const source = appSource("fonts.ts");

    for (const weight of [400, 500, 700, 800] as const) {
      const file = `tajawal-arabic-${weight}.woff2`;
      expect(source).toContain(`path: "../assets/fonts/${file}", weight: "${weight}"`);
      expect(
        statSync(join(import.meta.dirname, "..", "assets", "fonts", file)).size,
      ).toBeGreaterThan(0);
    }
    expect(source).toContain('variable: "--font-tajawal"');
    expect(source).toContain("adjustFontFallback: false");
  });

  it("loads exactly the reference's authored Inter weights", () => {
    const source = appSource("fonts.ts");

    expect(source).toContain('weight: ["400", "500", "600", "700", "800"]');
    expect(source).toContain('variable: "--font-inter"');
    expect(source).not.toContain("Plus_Jakarta_Sans");
  });

  it("keeps both document shells on the shared font-variable ownership", () => {
    expect(appSource("layout.tsx")).toContain("FONT_VARIABLE_CLASSES");
    expect(appSource("global-error.tsx")).toContain("FONT_VARIABLE_CLASSES");
  });
});
