import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type Oklch = Readonly<{ lightness: number; chroma: number; hue: number }>;
type LinearSrgb = readonly [red: number, green: number, blue: number];

const OKLCH_PATTERN = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+)?\s*\)/g;

function tokenValues(file: string): ReadonlyMap<string, string> {
  const css = readFileSync(join(import.meta.dirname, file), "utf8");
  return new Map(
    Array.from(css.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm), (match) => [
      match[1] ?? "",
      match[2]?.trim() ?? "",
    ]),
  );
}

/*
 * Guards the light/dark parity contract from docs/DESIGN_TOKENS.md: every
 * semantic token must be defined in BOTH theme files. A token added to one
 * side only fails silently at runtime — the missing side inherits whatever
 * the cascade provides — so this is checked at the source-text level, where
 * jsdom's lack of a real CSS cascade doesn't matter. Visual resolution of
 * the tokens is the browser layer's job (tests/e2e).
 */
function tokenNames(file: string): Set<string> {
  return new Set(tokenValues(file).keys());
}

function resolveToken(tokens: ReadonlyMap<string, string>, name: string): string {
  const value = tokens.get(name);
  if (value === undefined) {
    throw new Error(`Missing token ${name}`);
  }
  const reference = /^var\((--[\w-]+)\)$/.exec(value)?.[1];
  return reference === undefined ? value : resolveToken(tokens, reference);
}

function parseOklch(value: string): Oklch {
  OKLCH_PATTERN.lastIndex = 0;
  const match = OKLCH_PATTERN.exec(value);
  if (match === null) {
    throw new Error(`Expected an authored OKLCH value, received ${value}`);
  }
  return {
    lightness: Number(match[1]),
    chroma: Number(match[2]),
    hue: Number(match[3]),
  };
}

function oklchToLinearSrgb({ lightness, chroma, hue }: Oklch): LinearSrgb {
  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function encodeSrgb(channel: number): number {
  return channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
}

function decodeSrgb(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance([red, green, blue]: LinearSrgb): number {
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(first: LinearSrgb, second: LinearSrgb): number {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  );
}

function compositeInSrgb(
  foreground: LinearSrgb,
  background: LinearSrgb,
  alpha: number,
): LinearSrgb {
  const foregroundSrgb = foreground.map(encodeSrgb);
  const backgroundSrgb = background.map(encodeSrgb);
  const composited = foregroundSrgb.map((channel, index) =>
    decodeSrgb(channel * alpha + (backgroundSrgb[index] ?? 0) * (1 - alpha)),
  );
  return [composited[0] ?? 0, composited[1] ?? 0, composited[2] ?? 0];
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

  it("exposes info through the Tailwind and shadcn compatibility bridge", () => {
    const bridge = readFileSync(join(import.meta.dirname, "theme.css"), "utf8");

    expect(bridge).toContain("--color-info: var(--info);");
    expect(bridge).toContain("--color-info-foreground: var(--info-foreground);");
    expect(bridge).toContain("--info: var(--color-info);");
    expect(bridge).toContain("--info-foreground: var(--color-info-foreground);");
  });
});

describe("semantic color contract", () => {
  const themes = ["light.css", "dark.css"] as const;
  const expectedValues = {
    "light.css": {
      "--color-background": "oklch(1 0 0)",
      "--color-foreground": "oklch(0.21 0.04 265)",
      "--color-surface": "oklch(0.985 0.005 250)",
      "--color-surface-foreground": "var(--color-foreground)",
      "--color-card": "oklch(1 0 0)",
      "--color-card-foreground": "var(--color-foreground)",
      "--color-popover": "oklch(1 0 0)",
      "--color-popover-foreground": "var(--color-foreground)",
      "--color-primary": "oklch(0.572 0.19 256)",
      "--color-primary-hover": "oklch(0.544 0.18 256)",
      "--color-primary-foreground": "oklch(1 0 0)",
      "--color-link": "oklch(0.56 0.18 256)",
      "--color-secondary": "oklch(0.97 0.008 250)",
      "--color-secondary-foreground": "var(--color-foreground)",
      "--color-muted": "oklch(0.97 0.008 250)",
      "--color-muted-foreground": "oklch(0.5 0.02 260)",
      "--color-accent": "oklch(0.96 0 0)",
      "--color-accent-selected": "oklch(0.92 0 0)",
      "--color-accent-foreground": "var(--color-foreground)",
      "--color-info": "oklch(0.52 0.101 231)",
      "--color-info-foreground": "oklch(1 0 0)",
      "--color-success": "oklch(0.52 0.12 155)",
      "--color-success-foreground": "oklch(0.985 0.005 155)",
      "--color-warning": "oklch(0.82 0.14 80)",
      "--color-warning-foreground": "oklch(0.28 0.05 80)",
      "--color-destructive": "oklch(0.516 0.21 27)",
      "--color-destructive-foreground": "oklch(1 0 0)",
      "--color-border": "oklch(0.93 0.01 255)",
      "--color-input": "oklch(0.658 0.01 255)",
      "--color-ring": "oklch(0.589 0.17 256)",
      "--color-sidebar": "var(--color-background)",
      "--color-sidebar-foreground": "var(--color-foreground)",
      "--color-sidebar-primary": "var(--color-primary)",
      "--color-sidebar-primary-foreground": "var(--color-primary-foreground)",
      "--color-sidebar-accent": "var(--color-accent)",
      "--color-sidebar-accent-foreground": "var(--color-accent-foreground)",
      "--color-sidebar-border": "var(--color-border)",
      "--color-sidebar-ring": "var(--color-ring)",
      "--color-overlay": "oklch(0 0 0 / 0.8)",
    },
    "dark.css": {
      "--color-background": "oklch(0.205 0 0)",
      "--color-foreground": "oklch(0.96 0 0)",
      "--color-surface": "oklch(0.258 0 0)",
      "--color-surface-foreground": "var(--color-foreground)",
      "--color-card": "oklch(0.295 0 0)",
      "--color-card-foreground": "var(--color-foreground)",
      "--color-popover": "oklch(0.295 0 0)",
      "--color-popover-foreground": "var(--color-foreground)",
      "--color-primary": "oklch(0.572 0.19 256)",
      "--color-primary-hover": "oklch(0.544 0.18 256)",
      "--color-primary-foreground": "oklch(1 0 0)",
      "--color-link": "oklch(0.68 0.145 256)",
      "--color-secondary": "oklch(0.258 0 0)",
      "--color-secondary-foreground": "var(--color-foreground)",
      "--color-muted": "oklch(0.258 0 0)",
      "--color-muted-foreground": "oklch(0.78 0 0)",
      "--color-accent": "oklch(0.34 0 0)",
      "--color-accent-selected": "oklch(0.39 0 0)",
      "--color-accent-foreground": "var(--color-foreground)",
      "--color-info": "oklch(0.72 0.14 231)",
      "--color-info-foreground": "oklch(0.15 0 0)",
      "--color-success": "oklch(0.7 0.13 155)",
      "--color-success-foreground": "oklch(0.145 0.01 155)",
      "--color-warning": "oklch(0.8 0.13 80)",
      "--color-warning-foreground": "oklch(0.15 0.012 80)",
      "--color-destructive": "oklch(0.766 0.138 27)",
      "--color-destructive-foreground": "oklch(0.15 0.01 25)",
      "--color-border": "oklch(0.355 0 0)",
      "--color-input": "oklch(0.57 0 0)",
      "--color-ring": "oklch(0.665 0.15 256)",
      "--color-sidebar": "var(--color-background)",
      "--color-sidebar-foreground": "var(--color-foreground)",
      "--color-sidebar-primary": "var(--color-primary)",
      "--color-sidebar-primary-foreground": "var(--color-primary-foreground)",
      "--color-sidebar-accent": "var(--color-accent)",
      "--color-sidebar-accent-foreground": "var(--color-accent-foreground)",
      "--color-sidebar-border": "var(--color-border)",
      "--color-sidebar-ring": "var(--color-ring)",
      "--color-overlay": "oklch(0 0 0 / 0.8)",
    },
  } as const;

  it.each(themes)("pins the approved authored semantic values in %s", (file) => {
    const tokens = tokenValues(file);

    for (const [name, value] of Object.entries(expectedValues[file])) {
      expect(tokens.get(name), `${file}: ${name}`).toBe(value);
    }
  });

  it.each(themes)("keeps every semantic OKLCH color inside the sRGB gamut in %s", (file) => {
    const tokens = tokenValues(file);

    for (const name of Array.from(tokens.keys()).filter((token) => token.startsWith("--color-"))) {
      const authored = resolveToken(tokens, name);
      const color = parseOklch(authored);
      for (const channel of oklchToLinearSrgb(color)) {
        expect(channel, `${file}: ${name} (${authored})`).toBeGreaterThanOrEqual(0);
        expect(channel, `${file}: ${name} (${authored})`).toBeLessThanOrEqual(1);
      }
    }
  });

  it.each(themes)("meets primary action, link, hover, and focus contrast in %s", (file) => {
    const tokens = tokenValues(file);
    const color = (name: string): LinearSrgb =>
      oklchToLinearSrgb(parseOklch(resolveToken(tokens, name)));
    const primary = color("--color-primary");
    const primaryHover = color("--color-primary-hover");
    const primaryForeground = color("--color-primary-foreground");
    const background = color("--color-background");
    const surfaces = ["--color-background", "--color-surface", "--color-card"] as const;
    const primaryOklch = parseOklch(resolveToken(tokens, "--color-primary"));
    const infoOklch = parseOklch(resolveToken(tokens, "--color-info"));
    const hueDistance = Math.min(
      Math.abs(primaryOklch.hue - infoOklch.hue),
      360 - Math.abs(primaryOklch.hue - infoOklch.hue),
    );

    expect(contrast(primaryForeground, primary), "primary fill").toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(primaryForeground, primaryHover),
      "dedicated primary hover fill",
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      parseOklch(resolveToken(tokens, "--color-primary-hover")).lightness,
      "primary hover is darker than rest",
    ).toBeLessThan(primaryOklch.lightness);
    expect(
      hueDistance,
      "primary remains perceptually blue, separate from info cyan",
    ).toBeGreaterThanOrEqual(24);
    for (const surfaceName of surfaces) {
      const surface = color(surfaceName);
      expect(
        contrast(color("--color-link"), surface),
        `link over ${surfaceName}`,
      ).toBeGreaterThanOrEqual(4.5);
    }

    const focusBackgrounds: ReadonlyArray<readonly [string, LinearSrgb]> = [
      ["background", background],
      ["surface", color("--color-surface")],
      ["card", color("--color-card")],
      [
        "input fill over surface",
        compositeInSrgb(color("--color-input"), color("--color-surface"), 0.3),
      ],
      ["muted", color("--color-muted")],
      ["sidebar", color("--color-sidebar")],
    ];
    for (const [context, focusBackground] of focusBackgrounds) {
      expect(
        contrast(color("--color-ring"), focusBackground),
        `ring over ${context}`,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(themes)("meets info fill and tinted-surface contrast in %s", (file) => {
    const tokens = tokenValues(file);
    const color = (name: string): LinearSrgb =>
      oklchToLinearSrgb(parseOklch(resolveToken(tokens, name)));
    const info = color("--color-info");
    const infoForeground = color("--color-info-foreground");

    expect(contrast(infoForeground, info), "info fill").toBeGreaterThanOrEqual(4.5);
    for (const surfaceName of ["--color-background", "--color-surface", "--color-card"] as const) {
      const surface = color(surfaceName);
      expect(contrast(info, surface), `info text over ${surfaceName}`).toBeGreaterThanOrEqual(4.5);
      expect(
        contrast(info, compositeInSrgb(info, surface, 0.1)),
        `info text over 10% tint on ${surfaceName}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(themes)("meets neutral, boundary, and status contrast in %s", (file) => {
    const tokens = tokenValues(file);
    const color = (name: string): LinearSrgb =>
      oklchToLinearSrgb(parseOklch(resolveToken(tokens, name)));
    const surfaces = ["--color-background", "--color-surface", "--color-card"] as const;

    for (const [foreground, fill] of [
      ["--color-foreground", "--color-background"],
      ["--color-surface-foreground", "--color-surface"],
      ["--color-card-foreground", "--color-card"],
      ["--color-popover-foreground", "--color-popover"],
      ["--color-secondary-foreground", "--color-secondary"],
      ["--color-accent-foreground", "--color-accent"],
      ["--color-success-foreground", "--color-success"],
      ["--color-warning-foreground", "--color-warning"],
      ["--color-destructive-foreground", "--color-destructive"],
    ] as const) {
      expect(
        contrast(color(foreground), color(fill)),
        `${foreground} / ${fill}`,
      ).toBeGreaterThanOrEqual(4.5);
    }

    for (const surfaceName of surfaces) {
      const surface = color(surfaceName);
      expect(
        contrast(color("--color-muted-foreground"), surface),
        `muted text over ${surfaceName}`,
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrast(color("--color-input"), surface),
        `input boundary over ${surfaceName}`,
      ).toBeGreaterThanOrEqual(3);
      expect(
        contrast(color("--color-destructive"), surface),
        `destructive text over ${surfaceName}`,
      ).toBeGreaterThanOrEqual(4.5);
    }

    const destructiveAlpha = file === "dark.css" ? 0.15 : 0.1;
    const surface = color("--color-surface");
    expect(
      contrast(
        color("--color-destructive"),
        compositeInSrgb(color("--color-destructive"), surface, destructiveAlpha),
      ),
      "destructive text over destructive tint",
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(color("--color-destructive"), compositeInSrgb(color("--color-input"), surface, 0.3)),
      "destructive text and invalid boundary over input fill",
    ).toBeGreaterThanOrEqual(4.5);
  });

  it.each(themes)("keeps selected, disabled, and invalid states distinguishable in %s", (file) => {
    const tokens = tokenValues(file);
    const token = (name: string): Oklch => parseOklch(resolveToken(tokens, name));
    const color = (name: string): LinearSrgb => oklchToLinearSrgb(token(name));
    const surface = color("--color-surface");
    const accent = token("--color-accent");
    const selectedAccent = token("--color-accent-selected");
    const primary = color("--color-primary");
    const selectedFill = compositeInSrgb(primary, surface, file === "dark.css" ? 0.1 : 0.05);
    const selectedBorder = compositeInSrgb(primary, surface, file === "dark.css" ? 0.2 : 0.3);
    const disabledFill = compositeInSrgb(primary, surface, 0.5);

    expect(accent.chroma, "generic interaction accent chroma").toBe(0);
    expect(selectedAccent.chroma, "persistent selected accent chroma").toBe(0);
    expect(resolveToken(tokens, "--color-sidebar-accent")).toBe(
      resolveToken(tokens, "--color-accent"),
    );
    for (const surfaceName of ["--color-background", "--color-surface", "--color-card"] as const) {
      expect(
        contrast(color("--color-accent"), color(surfaceName)),
        `neutral interaction fill vs ${surfaceName}`,
      ).toBeGreaterThanOrEqual(1.07);
      expect(
        contrast(color("--color-accent-selected"), color(surfaceName)),
        `persistent selected fill vs ${surfaceName}`,
      ).toBeGreaterThanOrEqual(1.2);
    }
    expect(
      contrast(color("--color-accent-foreground"), color("--color-accent-selected")),
      "persistent selected text",
    ).toBeGreaterThanOrEqual(4.5);

    expect(contrast(selectedFill, surface), "selected tint vs surface").toBeGreaterThan(1.02);
    expect(contrast(selectedBorder, selectedFill), "selected boundary vs tint").toBeGreaterThan(
      1.1,
    );
    expect(contrast(disabledFill, surface), "disabled primary vs surface").toBeGreaterThan(1.5);
    expect(contrast(primary, disabledFill), "resting primary vs disabled primary").toBeGreaterThan(
      1.2,
    );

    const input = token("--color-input");
    const destructive = token("--color-destructive");
    const ring = token("--color-ring");
    const distance = (first: Oklch, second: Oklch): number => {
      const radians = (hue: number): number => (hue * Math.PI) / 180;
      return Math.hypot(
        first.lightness - second.lightness,
        first.chroma * Math.cos(radians(first.hue)) - second.chroma * Math.cos(radians(second.hue)),
        first.chroma * Math.sin(radians(first.hue)) - second.chroma * Math.sin(radians(second.hue)),
      );
    };
    expect(distance(destructive, input), "invalid vs normal boundary").toBeGreaterThan(0.1);
    expect(distance(destructive, ring), "invalid vs focus boundary").toBeGreaterThan(0.1);
  });
});
