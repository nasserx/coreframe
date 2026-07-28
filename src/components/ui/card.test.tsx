import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from "./card";

describe("Card", () => {
  it("keeps the static primitive motionless", () => {
    render(<Card>Static information</Card>);
    const card = screen.getByText("Static information");
    expect(card.className).not.toMatch(/translate|scale|transition-transform/);
  });
});
