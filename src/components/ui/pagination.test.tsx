import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

function renderEllipsis(label?: string) {
  const ellipsis =
    label === undefined ? <PaginationEllipsis /> : <PaginationEllipsis label={label} />;

  return render(
    <Pagination>
      <PaginationContent>
        <PaginationItem>{ellipsis}</PaginationItem>
      </PaginationContent>
    </Pagination>,
  );
}

describe("PaginationEllipsis", () => {
  it("uses the backward-compatible English label by default", () => {
    renderEllipsis();

    const label = screen.getByText("More pages");
    expect(label).toHaveClass("sr-only");
    expect(label).not.toHaveAttribute("aria-hidden");
    expect(label.parentElement).not.toHaveAttribute("aria-hidden");
  });

  it.each(["Additional pages", "المزيد من الصفحات"])(
    "announces the explicit label %s exactly once",
    (accessibleLabel) => {
      renderEllipsis(accessibleLabel);

      const labels = screen.getAllByText(accessibleLabel);
      expect(labels).toHaveLength(1);
      expect(labels[0]).toHaveClass("sr-only");
      expect(labels[0]).not.toHaveAttribute("aria-hidden");
      expect(labels[0]?.parentElement).not.toHaveAttribute("aria-hidden");
    },
  );

  it("keeps the visual icon decorative and preserves ellipsis geometry", () => {
    const { container } = renderEllipsis();

    const ellipsis = screen.getByText("More pages").parentElement;
    const icon = container.querySelector("svg");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(ellipsis).toHaveClass("flex", "size-8", "items-center", "justify-center");
    expect(ellipsis?.className).toContain("[&_svg:not([class*='size-'])]:size-4");
  });

  it("preserves navigation, current-page, and previous/next contracts", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="/previous" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="/2" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="/next" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByRole("navigation", { name: "pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to previous page" })).toHaveClass(
      "h-8",
      "ps-1.5!",
    );
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Go to next page" })).toHaveClass("h-8", "pe-1.5!");
  });
});
