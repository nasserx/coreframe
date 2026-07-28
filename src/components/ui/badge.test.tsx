import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./badge";

describe("Badge", () => {
  it("keeps the primary link hover fill at the contrast-tested opacity", () => {
    render(<Badge render={<a href="/docs" />}>Documentation</Badge>);

    expect(screen.getByRole("link", { name: "Documentation" })).toHaveClass(
      "[a]:hover:bg-primary/90",
    );
  });

  it("uses the contrast-safe semantic link color for the link variant", () => {
    render(
      <Badge variant="link" render={<a href="/docs" />}>
        Documentation
      </Badge>,
    );

    expect(screen.getByRole("link", { name: "Documentation" })).toHaveClass("text-link");
  });

  it.each(["secondary", "outline", "ghost"] as const)(
    "uses neutral accent for the %s interactive state",
    (variant) => {
      render(
        <Badge variant={variant} render={<a href="/docs" />}>
          Documentation
        </Badge>,
      );

      expect(screen.getByRole("link", { name: "Documentation" })).toHaveClass(
        variant === "secondary" || variant === "outline"
          ? "[a]:hover:bg-accent"
          : "hover:bg-accent",
      );
    },
  );
});
