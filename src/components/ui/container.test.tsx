import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Container } from "./container";

describe("Container", () => {
  it("pins the global cap and responsive gutter contract", () => {
    render(<Container>Content</Container>);
    expect(screen.getByText("Content")).toHaveClass(
      "mx-auto",
      "w-full",
      "max-w-7xl",
      "px-4",
      "sm:px-6",
      "lg:px-8",
    );
  });

  it.each(["ltr", "rtl"] as const)("uses the same symmetric padding contract in %s", (dir) => {
    render(<Container dir={dir}>Directional content</Container>);
    const container = screen.getByText("Directional content");
    expect(container).toHaveAttribute("dir", dir);
    expect(container).toHaveClass("px-4", "sm:px-6", "lg:px-8");
    expect(container.className).not.toMatch(/(?:^|:)(?:p[se]|m[se])-/);
  });
});
