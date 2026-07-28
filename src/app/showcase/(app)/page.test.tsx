import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ShowcaseIndexPage from "./page";

describe("Showcase index linked cards", () => {
  it("owns pointer, keyboard, and reduced-motion lift on the interactive link", () => {
    render(<ShowcaseIndexPage />);
    const link = screen.getByRole("link", { name: /Actions/ });
    expect(link).toHaveClass(
      "transition-[translate]",
      "hover:-translate-y-1",
      "focus-visible:-translate-y-1",
      "motion-reduce:hover:translate-none",
      "motion-reduce:focus-visible:translate-none",
    );
    expect(link).toHaveClass(
      "focus-visible:ring-2",
      "focus-visible:ring-ring",
      "focus-visible:ring-offset-2",
    );
  });
});
