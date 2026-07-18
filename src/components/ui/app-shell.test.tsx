import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellSidebar,
  AppShellSidebarTrigger,
} from "./app-shell";

/*
 * Reference test for the shell's accessibility contract: landmarks, the
 * skip link, and the mobile drawer's keyboard/focus behavior. Visual layout
 * (grid placement, stickiness, responsive collapse) is CSS and belongs to
 * the browser layer.
 */

// The shell closes its drawer on route navigation via usePathname; unit
// tests render outside the App Router, so pin the hook to a stable value.
vi.mock("next/navigation", () => ({
  usePathname: () => "/showcase",
}));

// jsdom has no matchMedia. `matches: false` = a mobile-width viewport, so
// the drawer's desktop auto-close guard stays inactive.
function installMatchMedia(): void {
  vi.stubGlobal(
    "matchMedia",
    (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList,
  );
}

function renderShell() {
  return render(
    <AppShell>
      <AppShellSidebar label="Sections">
        <a href="/showcase/tokens">Tokens</a>
      </AppShellSidebar>
      <AppShellHeader>
        <AppShellSidebarTrigger />
      </AppShellHeader>
      <AppShellMain>Page content</AppShellMain>
    </AppShell>,
  );
}

describe("AppShell", () => {
  beforeEach(() => {
    installMatchMedia();
  });

  it("exposes the three landmark regions", () => {
    renderShell();
    expect(screen.getByRole("navigation", { name: "Sections" })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("makes the skip link the first focusable element and moves focus to main", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.tab();
    const skipLink = screen.getByRole("link", { name: "Skip to main content" });
    expect(skipLink).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("opens the drawer from the trigger, with focus moved inside", async () => {
    const user = userEvent.setup();
    renderShell();

    const trigger = screen.getByRole("button", { name: "Open navigation" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    const drawer = await screen.findByRole("dialog", { name: "Sections" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    // The drawer repeats the navigation region under the same label; the
    // background copy is correctly aria-hidden while the modal is open.
    expect(within(drawer).getByRole("navigation", { name: "Sections" })).toBeInTheDocument();
    await waitFor(() => {
      expect(drawer.contains(document.activeElement)).toBe(true);
    });
  });

  it("closes the drawer on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    renderShell();

    const trigger = screen.getByRole("button", { name: "Open navigation" });
    await user.click(trigger);
    await screen.findByRole("dialog", { name: "Sections" });

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Sections" })).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it("closes the drawer from its close button", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    await screen.findByRole("dialog", { name: "Sections" });

    await user.click(screen.getByRole("button", { name: "Close navigation" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Sections" })).not.toBeInTheDocument();
    });
  });

  it("throws an actionable error when shell parts render outside AppShell", () => {
    // Silence React's error boundary logging for the expected throw.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<AppShellSidebarTrigger />)).toThrow(
      "AppShellSidebarTrigger must be rendered inside <AppShell>.",
    );
    consoleError.mockRestore();
  });
});
