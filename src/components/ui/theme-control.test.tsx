import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The theme and locale runtimes both keep their state in module-level stores,
 * so every test imports FRESH copies (`vi.resetModules()` + dynamic import) —
 * otherwise a stored choice or an Arabic switch leaks into the next test. jsdom
 * has no `matchMedia`, so the OS preference is the controllable stub below
 * (mirrors theme-provider.test.tsx).
 */

let systemPrefersDark = false;

function installMatchMedia(): void {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        get matches() {
          return systemPrefersDark;
        },
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList,
  );
}

const EN = {
  toDark: "Switch to dark mode",
  toLight: "Switch to light mode",
} as const;

const AR = {
  toDark: "التبديل إلى الوضع الداكن",
  toLight: "التبديل إلى الوضع الفاتح",
} as const;

/** Renders the control inside both runtimes, with a locale switch beside it. */
async function renderThemeControl() {
  vi.resetModules();
  const { ThemeProvider } = await import("@/core/providers/theme-provider");
  const { LocaleProvider } = await import("@/core/providers/locale-provider");
  const { LocaleControl } = await import("./locale-control");
  const { ThemeControl } = await import("./theme-control");

  render(
    <LocaleProvider>
      <ThemeProvider>
        <ThemeControl />
        <LocaleControl />
      </ThemeProvider>
    </LocaleProvider>,
  );
}

/*
 * Queried by slot, not by accessible name: the name is the thing under test and
 * changes with every activation, so naming it in the query would make the test
 * assert its own premise. `toHaveAccessibleName` then checks the real contract.
 */
function bySlot(slot: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
  if (element === null) {
    throw new Error(`Expected a [data-slot="${slot}"] element to be rendered.`);
  }
  return element;
}

function themeButton(): HTMLElement {
  return bySlot("theme-control");
}

describe("ThemeControl", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    systemPrefersDark = false;
    installMatchMedia();
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.removeAttribute("dir");
    document.documentElement.removeAttribute("lang");
  });

  it("renders exactly one native button for the whole control", async () => {
    await renderThemeControl();

    const controls = document.querySelectorAll('[data-slot="theme-control"]');
    expect(controls).toHaveLength(1);
    expect(themeButton().tagName).toBe("BUTTON");
    expect(themeButton()).not.toHaveAttribute("role");
  });

  it("is visually identical to the locale control: same variant, same square", async () => {
    await renderThemeControl();

    // Both take the whole treatment from the authoritative outline variant at
    // the same authoritative square, so border, radius, surface, and size
    // cannot drift apart. (The exact 36px is measured in the browser.)
    expect(themeButton().className).toBe(bySlot("locale-control").className);
    expect(themeButton().className).toContain("size-9");
    expect(themeButton().className).toContain("border-border");
    expect(themeButton().className).toContain("bg-background");
    expect(themeButton().className).not.toMatch(/\brotate-|\bscale-(?!x)|\bshadow-/);
  });

  it("shows a Moon and targets dark while light is applied", async () => {
    await renderThemeControl();

    expect(themeButton()).toHaveAccessibleName(EN.toDark);
    expect(themeButton().querySelector("[data-icon]")).toHaveAttribute("data-icon", "moon");
  });

  it("shows a Sun and targets light while dark is applied", async () => {
    window.localStorage.setItem("theme", "dark");
    await renderThemeControl();

    expect(themeButton()).toHaveAccessibleName(EN.toLight);
    expect(themeButton().querySelector("[data-icon]")).toHaveAttribute("data-icon", "sun");
  });

  it("applies and persists a concrete theme on activation, then offers the way back", async () => {
    const user = userEvent.setup();
    await renderThemeControl();

    await user.click(themeButton());

    expect(document.documentElement).toHaveClass("dark");
    expect(window.localStorage.getItem("theme")).toBe("dark");
    expect(themeButton()).toHaveAccessibleName(EN.toLight);

    await user.click(themeButton());

    expect(document.documentElement).not.toHaveClass("dark");
    expect(window.localStorage.getItem("theme")).toBe("light");
    expect(themeButton()).toHaveAccessibleName(EN.toDark);
  });

  it("activates with Enter and with Space", async () => {
    const user = userEvent.setup();
    await renderThemeControl();

    themeButton().focus();
    expect(themeButton()).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(document.documentElement).toHaveClass("dark");

    await user.keyboard(" ");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("localizes the action label, in both states, when the locale switches", async () => {
    const user = userEvent.setup();
    await renderThemeControl();

    await user.click(bySlot("locale-control"));
    expect(await screen.findByRole("button", { name: AR.toDark })).toBeInTheDocument();

    await user.click(themeButton());
    expect(themeButton()).toHaveAccessibleName(AR.toLight);
  });

  it("hides its icon from the accessibility tree", async () => {
    await renderThemeControl();

    const icon = themeButton().querySelector("svg");
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("applies no local styling to its icon, in either direction", async () => {
    const user = userEvent.setup();
    await renderThemeControl();

    await user.click(bySlot("locale-control"));
    expect(await screen.findByRole("button", { name: AR.toDark })).toBeInTheDocument();

    // No className and no inline style from this component, so there is no
    // mirroring or transform utility it could be carrying. Rendered
    // non-mirroring is measured in the browser, where a cascade exists.
    const icon = themeButton().querySelector("svg");
    expect(icon).not.toHaveAttribute("style");
  });

  it("owns no selection semantics: no pressed state, no System option, no menu", async () => {
    await renderThemeControl();

    const button = themeButton();
    expect(button).not.toHaveAttribute("aria-pressed");
    expect(button).not.toHaveAttribute("aria-selected");
    expect(button).not.toHaveAttribute("aria-haspopup");
    expect(button).not.toHaveAttribute("aria-expanded");

    for (const role of ["radio", "radiogroup", "tab", "tablist", "listbox", "menu"] as const) {
      expect(screen.queryAllByRole(role)).toHaveLength(0);
    }
    // No visible "System" affordance survives anywhere in the control.
    expect(screen.queryByText(/system/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /system|النظام/i })).not.toBeInTheDocument();
  });
});
