import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandMark } from "./brand-mark";

describe("BrandMark", () => {
  it("owns the semantic blue identity while preserving currentColor geometry", () => {
    render(<BrandMark data-testid="brand-mark" className="size-8" />);

    const mark = screen.getByTestId("brand-mark");
    const path = mark.querySelector("path");
    expect(mark).toHaveClass("size-8", "text-primary");
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(path).toHaveAttribute("fill", "currentColor");
    expect(path).toHaveAttribute("fill-rule", "nonzero");
  });

  it("keeps the favicon geometry in sync and pins its static blue pair", () => {
    render(<BrandMark data-testid="brand-mark" />);
    const runtimePath = screen.getByTestId("brand-mark").querySelector("path")?.getAttribute("d");
    const favicon = readFileSync(join(import.meta.dirname, "../../app/icon.svg"), "utf8");
    const faviconPath = /<path[^>]*d="([^"]+)"/.exec(favicon)?.[1];

    expect(faviconPath).toBe(runtimePath);
    expect(favicon).toContain("path { fill: #0c74e4; }");
    expect(favicon).toContain("path { fill: #0c74e4; }");
    expect(favicon).not.toMatch(/(?:fill|stroke):?\s*(?:#000(?:000)?\b|black\b)/i);
  });
});
