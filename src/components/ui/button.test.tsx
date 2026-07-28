import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlusIcon } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";

/*
 * Reference test for a UI primitive: behavior and contracts, not pixel
 * styling. Class assertions are limited to the variant tokens that define
 * the primitive's public API; everything else is asserted through roles,
 * accessible names, and DOM semantics.
 */
describe("Button", () => {
  it("renders a native button with an accessible name", () => {
    render(<Button>Save changes</Button>);
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  it("fires onClick when activated", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("exposes disabled state to assistive technology and blocks activation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    // Accessibility assertion: the disabled state must be programmatically
    // determinable, not just visually dimmed.
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies variant and size classes", () => {
    render(
      <Button variant="destructive" size="sm">
        Delete
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button).toHaveClass("text-destructive");
    expect(button).toHaveClass("h-7");
    expect(button).toHaveClass("px-2.5");
    expect(button).toHaveClass("text-xs");
  });

  it.each([
    ["default", "h-8", "px-3"],
    ["sm", "h-7", "px-2.5"],
    ["lg", "h-9", "px-6"],
  ] as const)("pins the %s text-button geometry", (size, height, padding) => {
    render(<Button size={size}>Localized action label</Button>);
    const button = screen.getByRole("button", { name: "Localized action label" });
    expect(button).toHaveClass(height);
    expect(button).toHaveClass(padding);
    expect(button).toHaveClass("gap-2");
    expect(button).toHaveClass("rounded-md");
  });

  it.each([
    ["icon", "size-8"],
    ["icon-sm", "size-7"],
    ["icon-lg", "size-9"],
  ] as const)("pins the %s icon-button geometry", (size, dimension) => {
    render(
      <Button size={size} aria-label={`Add ${size}`}>
        <PlusIcon />
      </Button>,
    );
    expect(screen.getByRole("button", { name: `Add ${size}` })).toHaveClass(dimension);
  });

  it("keeps disabled and loading compositions on the default geometry", () => {
    render(
      <>
        <Button disabled>Disabled action</Button>
        <Button disabled>
          <span data-icon="inline-start" aria-hidden="true" />
          Saving a localized record…
        </Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Disabled action" })).toHaveClass("h-8", "px-3");
    expect(screen.getByRole("button", { name: "Saving a localized record…" })).toHaveClass(
      "h-8",
      "px-3",
      "gap-2",
    );
  });

  it("keeps the primary hover fill at the contrast-tested opacity", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveClass("hover:bg-primary/90");
  });

  it("uses the exact lift contract without blanket transitions", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveClass(
      "hover:not-aria-[haspopup]:-translate-y-0.5",
      "focus-visible:not-aria-[haspopup]:-translate-y-0.5",
      "motion-reduce:hover:not-aria-[haspopup]:translate-none",
      "motion-reduce:focus-visible:not-aria-[haspopup]:translate-none",
      "transition-[color,background-color,border-color,box-shadow,translate]",
    );
    expect(button).not.toHaveClass("transition-all");
    expect(button.className).not.toMatch(/active:.*translate/);
  });

  it("keeps color-only variants motionless", () => {
    render(
      <>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </>,
    );
    for (const name of ["Secondary", "Ghost", "Link"]) {
      expect(screen.getByRole("button", { name }).className).not.toContain("-translate-y-0.5");
    }
  });

  it("uses the neutral interaction token for secondary and disclosure states", () => {
    render(
      <>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Menu trigger</Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Secondary" })).toHaveClass(
      "hover:bg-accent",
      "aria-expanded:bg-accent",
    );
    expect(screen.getByRole("button", { name: "Menu trigger" })).toHaveClass(
      "hover:bg-accent",
      "aria-expanded:bg-accent",
    );
  });

  it("uses the contrast-safe semantic link color for the link variant", () => {
    render(<Button variant="link">Documentation</Button>);
    expect(screen.getByRole("button", { name: "Documentation" })).toHaveClass("text-link");
  });

  it("stamps data-slot on the default element only", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("data-slot", "button");
  });

  /*
   * Regression guard for the Pagination hydration defect: when `render`
   * replaces the element, Button must stamp nothing — a data-slot set on
   * both the primitive and the render element resolves differently on
   * server and client once the render element crosses a server→client
   * boundary, producing a hydration mismatch (see the slot contract note
   * in button.tsx and docs/UI_LIBRARY.md §7). The browser-layer console
   * harness catches the mismatch itself; this pins the contract that
   * prevents it.
   */
  it("does not stamp data-slot when the render prop replaces the element", () => {
    render(
      <Button nativeButton={false} render={<a href="/docs" data-slot="pagination-link" />}>
        Docs
      </Button>,
    );
    // With nativeButton={false} Base UI keeps button semantics on the anchor
    // (role="button" + tabindex), exactly as PaginationLink uses it.
    const link = screen.getByRole("button", { name: "Docs" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("data-slot", "pagination-link");
    // Behavior (variant classes) still comes from Button.
    expect(link).toHaveClass("bg-primary");
  });
});
