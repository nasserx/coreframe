import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { ErrorFallback } from "./error-fallback";

it("keeps the primary action hover fill at the contrast-tested opacity", () => {
  render(<ErrorFallback onAction={vi.fn()} />);

  expect(screen.getByRole("button", { name: "Try again" })).toHaveClass("hover:bg-primary/90");
});
