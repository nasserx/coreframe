import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  SiteShell,
  SiteShellFooter,
  SiteShellHeader,
  SiteShellMain,
  SiteShellNav,
  SiteShellNavItem,
  SiteShellNavMenu,
  SiteShellNavMenuItem,
  SiteShellNavTrigger,
} from "./site-shell";

/*
 * Reference test for the site shell's accessibility contract: landmarks,
 * the skip link, the drawer's keyboard/focus behavior, and the
 * unavailable-destination pattern. Visual layout (stickiness, responsive
 * collapse, overflow) is CSS and belongs to the browser layer
 * (shell.spec.ts, overflow.spec.ts).
 */

// The shell closes its drawer on route navigation via usePathname; unit
// tests render outside the App Router, so pin the hook to a stable value.
vi.mock("next/navigation", () => ({
  usePathname: () => "/products",
}));

// jsdom has no matchMedia. `matches: false` = a viewport below the collapse
// line, so the drawer's desktop auto-close guard stays inactive.
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
    <SiteShell>
      <SiteShellHeader>
        <a href="/brand-home">Brand</a>
        <SiteShellNav label="Site sections">
          <SiteShellNavItem href="/products">Products</SiteShellNavItem>
          <SiteShellNavItem>Pricing</SiteShellNavItem>
        </SiteShellNav>
        <SiteShellNavTrigger />
      </SiteShellHeader>
      <SiteShellMain>Page content</SiteShellMain>
      <SiteShellFooter>Footer content</SiteShellFooter>
    </SiteShell>,
  );
}

describe("SiteShell", () => {
  beforeEach(() => {
    installMatchMedia();
  });

  it("exposes the four landmark regions", () => {
    renderShell();
    expect(screen.getByRole("navigation", { name: "Site sections" })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
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

  it("marks the current page's nav item with aria-current", () => {
    renderShell();
    const nav = screen.getByRole("navigation", { name: "Site sections" });
    expect(within(nav).getByRole("link", { name: "Products" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders an href-less item as non-interactive muted text with an sr-only hint", () => {
    renderShell();
    const nav = screen.getByRole("navigation", { name: "Site sections" });

    // Never a link, never focusable — it must not appear in the tab order
    // or the link list at all.
    expect(within(nav).queryByRole("link", { name: /Pricing/ })).not.toBeInTheDocument();
    const item = within(nav).getByText("Pricing");
    expect(item.closest("a, button")).toBeNull();
    expect(item).not.toHaveAttribute("tabindex");
    // The availability hint is exposed to assistive technology.
    expect(within(nav).getByText(/Not yet available/)).toBeInTheDocument();
  });

  it("opens the drawer from the trigger, with focus moved inside", async () => {
    const user = userEvent.setup();
    renderShell();

    const trigger = screen.getByRole("button", { name: "Open navigation" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    const drawer = await screen.findByRole("dialog", { name: "Site sections" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    // The drawer repeats the navigation region under the same label; the
    // background copy is correctly aria-hidden while the modal is open.
    expect(within(drawer).getByRole("navigation", { name: "Site sections" })).toBeInTheDocument();
    await waitFor(() => {
      expect(drawer.contains(document.activeElement)).toBe(true);
    });
  });

  it("closes the drawer on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    renderShell();

    const trigger = screen.getByRole("button", { name: "Open navigation" });
    await user.click(trigger);
    await screen.findByRole("dialog", { name: "Site sections" });

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Site sections" })).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it("closes the drawer from its close button", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    await screen.findByRole("dialog", { name: "Site sections" });

    await user.click(screen.getByRole("button", { name: "Close navigation" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Site sections" })).not.toBeInTheDocument();
    });
  });

  it("throws an actionable error when shell parts render outside SiteShell", () => {
    // Silence React's error boundary logging for the expected throw.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<SiteShellNavTrigger />)).toThrow(
      "SiteShellNavTrigger must be rendered inside <SiteShell>.",
    );
    consoleError.mockRestore();
  });
});

/*
 * The dropdown nav item (SiteShellNavMenu). Its keyboard contract — open,
 * traverse, Escape, focus return, and the unavailable panel item being skipped
 * in the tab order — is pinned here; the open/dismiss/navigate behaviour in a
 * real browser (and the axe scan with the panel OPEN) lives in the browser
 * layer (shell.spec.ts).
 */
function renderShellWithMenu() {
  return render(
    <SiteShell>
      <SiteShellHeader>
        <a href="/brand-home">Brand</a>
        <SiteShellNav label="Site sections">
          <SiteShellNavMenu label="Explore">
            <SiteShellNavMenuItem href="/products" title="Products" description="What we sell." />
            <SiteShellNavMenuItem href="/pricing" title="Pricing" description="Plans and costs." />
            <SiteShellNavMenuItem title="Changelog" description="Coming soon." />
          </SiteShellNavMenu>
        </SiteShellNav>
        <SiteShellNavTrigger />
      </SiteShellHeader>
      <SiteShellMain>Page content</SiteShellMain>
      <SiteShellFooter>Footer content</SiteShellFooter>
    </SiteShell>,
  );
}

describe("SiteShellNavMenu", () => {
  beforeEach(() => {
    installMatchMedia();
    // Base UI's anchor positioning observes size changes; jsdom ships no
    // ResizeObserver, so provide an inert one.
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      },
    );
  });

  it("renders a collapsed trigger button with a closed disclosure state", () => {
    renderShellWithMenu();
    const trigger = screen.getByRole("button", { name: /Explore/ });
    // A disclosure trigger, not a link and not a menu: no destination of its
    // own, and it announces its expanded state.
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger.tagName).toBe("BUTTON");
    // The panel's links are absent from the DOM until it opens.
    expect(screen.queryByRole("link", { name: /Products/ })).not.toBeInTheDocument();
  });

  it("opens the panel from the trigger and reveals the sub-destinations as links", async () => {
    const user = userEvent.setup();
    renderShellWithMenu();

    const trigger = screen.getByRole("button", { name: /Explore/ });
    await user.click(trigger);

    await waitFor(() => {
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });
    expect(await screen.findByRole("link", { name: /Products/ })).toHaveAttribute(
      "href",
      "/products",
    );
    expect(screen.getByRole("link", { name: /Pricing/ })).toHaveAttribute("href", "/pricing");
  });

  it("keeps the unavailable panel item out of the tab order as muted text", async () => {
    const user = userEvent.setup();
    renderShellWithMenu();

    await user.click(screen.getByRole("button", { name: /Explore/ }));
    await screen.findByRole("link", { name: /Products/ });

    // Never a link, never focusable — it must not appear in the link list.
    expect(screen.queryByRole("link", { name: /Changelog/ })).not.toBeInTheDocument();
    const changelog = screen.getByText("Changelog");
    expect(changelog.closest("a, button")).toBeNull();
    // The availability hint is exposed to assistive technology.
    expect(screen.getByText(/Not yet available/)).toBeInTheDocument();
  });

  it("traverses into the panel by keyboard, then Escape closes it and returns focus", async () => {
    const user = userEvent.setup();
    renderShellWithMenu();

    const trigger = screen.getByRole("button", { name: /Explore/ });
    await user.click(trigger);
    await screen.findByRole("link", { name: /Products/ });

    // Arrow/Tab reaches the panel links; assert one can hold focus.
    const firstLink = screen.getByRole("link", { name: /Products/ });
    firstLink.focus();
    expect(firstLink).toHaveFocus();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("link", { name: /Products/ })).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it("renders the same items in the drawer as a labelled group, not a flat dump", async () => {
    const user = userEvent.setup();
    renderShellWithMenu();

    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    const drawer = await screen.findByRole("dialog", { name: "Site sections" });

    // The trigger label becomes the group heading, and the sub-destinations
    // render as real links (no popup, no dropdown) inside the drawer.
    expect(within(drawer).getByText("Explore")).toBeInTheDocument();
    expect(within(drawer).getByRole("link", { name: /Products/ })).toHaveAttribute(
      "href",
      "/products",
    );
    // The unavailable item stays non-interactive in the drawer too.
    expect(within(drawer).queryByRole("link", { name: /Changelog/ })).not.toBeInTheDocument();
  });
});
