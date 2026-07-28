import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { ErrorFallback } from "./error-fallback";

it("keeps the primary action hover fill at the contrast-tested opacity", () => {
  render(<ErrorFallback onAction={vi.fn()} />);

  expect(screen.getByRole("button", { name: "Try again" })).toHaveClass(
    "h-8",
    "px-3",
    "rounded-md",
    "hover:-translate-y-0.5",
    "focus-visible:-translate-y-0.5",
    "motion-reduce:hover:translate-none",
    "motion-reduce:focus-visible:translate-none",
    "hover:bg-primary-hover",
  );
});
