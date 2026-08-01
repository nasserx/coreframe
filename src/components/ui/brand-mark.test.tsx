import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandMark } from "./brand-mark";

describe("BrandMark", () => {
  it("renders the Coreframe mark as one decorative currentColor glyph", () => {
    render(<BrandMark data-testid="brand-mark" className="size-8" />);

    const mark = screen.getByTestId("brand-mark");
    const path = mark.querySelector("path");
    expect(mark).toHaveClass("size-8", "text-primary");
    expect(mark).toHaveAttribute("viewBox", "0 0 24 24");
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark).not.toHaveAttribute("aria-label");
    expect(mark).not.toHaveAttribute("role");
    expect(mark.querySelector("title")).toBeNull();
    expect(mark.querySelectorAll("path")).toHaveLength(1);
    expect(path).toHaveAttribute("fill", "currentColor");
    expect(path).toHaveAttribute("fill-rule", "nonzero");
  });

  it("keeps the favicon glyph in sync and uses its high-contrast static adaptation", () => {
    render(<BrandMark data-testid="brand-mark" />);
    const runtimePath = screen.getByTestId("brand-mark").querySelector("path")?.getAttribute("d");
    const iconPath = join(import.meta.dirname, "../../app/icon.svg");
    const favicon = readFileSync(iconPath, "utf8");
    const faviconPath = /<path[^>]*d="([^"]+)"/.exec(favicon)?.[1];

    expect(existsSync(iconPath)).toBe(true);
    expect(faviconPath).toBe(runtimePath);
    expect(favicon).toContain('viewBox="0 0 24 24"');
    expect(favicon).toContain('<rect width="24" height="24" rx="3" fill="#0c74e4"/>');
    expect(favicon).toContain('<path fill="#fff"');
    expect(favicon).not.toMatch(/(?:currentColor|var\()/);
  });

  it("is consumed through the shared owner instead of duplicated component SVGs", () => {
    const consumers = [
      "../../features/marketing/marketing-shell.tsx",
      "../../app/showcase/(site)/site/layout.tsx",
      "../../features/showcase/components/showcase-nav.tsx",
    ];

    for (const relativePath of consumers) {
      const source = readFileSync(join(import.meta.dirname, relativePath), "utf8");
      expect(source, relativePath).toContain(
        'import { BrandMark } from "@/components/ui/brand-mark"',
      );
      expect(source, relativePath).toContain("<BrandMark");
      expect(source, relativePath).not.toMatch(/<svg\b/);
    }
  });
});
