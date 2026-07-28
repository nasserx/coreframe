import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ShowcaseNav } from "./showcase-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/showcase/data",
}));

describe("ShowcaseNav", () => {
  it("separates transient hover from the persistent current-page fill", () => {
    render(<ShowcaseNav />);

    const current = screen.getByRole("link", { name: "Data" });
    const idle = screen.getByRole("link", { name: "Tokens" });
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveClass("bg-accent-selected");
    expect(idle).not.toHaveClass("bg-accent-selected");
    expect(idle).toHaveClass("hover:bg-sidebar-accent");
  });
});
