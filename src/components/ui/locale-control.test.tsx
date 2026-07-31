import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The locale runtime keeps its preference in a module-level store, so every
 * test imports a FRESH copy (`vi.resetModules()` + dynamic import) — otherwise
 * one Arabic switch leaks into every test after it. This also resets the
 * session catalogue cache, so a switch re-loads the code-split Arabic chunk
 * (which is why the Arabic assertions below are async).
 */

const EN_LABEL = "Switch to Arabic";
const AR_LABEL = "التبديل إلى الإنجليزية";

/**
 * A trivial client-state holder rendered beside the control: a locale switch
 * must re-render the tree, not remount it, so anything a visitor has typed
 * survives. Proving that here is cheaper and more precise than a browser test.
 */
function StatefulField() {
  return <input aria-label="draft" defaultValue="" />;
}

async function renderLocaleControl() {
  vi.resetModules();
  const { LocaleProvider } = await import("@/core/providers/locale-provider");
  const { LocaleControl } = await import("./locale-control");

  render(
    <LocaleProvider>
      <LocaleControl />
      <StatefulField />
    </LocaleProvider>,
  );
}

/*
 * Queried by slot rather than by accessible name: the name is the contract
 * under test and flips with the locale, so naming it in the query would make
 * the test assert its own premise.
 */
function localeButton(): HTMLElement {
  const element = document.querySelector<HTMLElement>('[data-slot="locale-control"]');
  if (element === null) {
    throw new Error('Expected a [data-slot="locale-control"] element to be rendered.');
  }
  return element;
}

describe("LocaleControl", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    document.documentElement.removeAttribute("dir");
    document.documentElement.removeAttribute("lang");
  });

  it("renders exactly one native button for the whole control", async () => {
    await renderLocaleControl();

    expect(document.querySelectorAll('[data-slot="locale-control"]')).toHaveLength(1);
    expect(localeButton().tagName).toBe("BUTTON");
    expect(localeButton()).not.toHaveAttribute("role");
  });

  it("renders a globe and nothing else, in either locale", async () => {
    for (const locale of ["en", "ar"] as const) {
      window.localStorage.clear();
      if (locale === "ar") {
        window.localStorage.setItem("locale", locale);
      }
      await renderLocaleControl();

      const button = localeButton();
      // Icon-only: no visible target code, no letters, no dropdown affordance.
      expect(button).toHaveTextContent("");
      expect(button.textContent).toBe("");
      expect(button.querySelector("bdi")).toBeNull();
      expect(button.querySelectorAll("svg")).toHaveLength(1);
      expect(button.querySelector("[data-icon]")).toHaveAttribute("data-icon", "globe");

      cleanup();
    }
  });

  it("never shows AR or EN as visible content", async () => {
    await renderLocaleControl();

    expect(screen.queryByText("AR")).not.toBeInTheDocument();
    expect(screen.queryByText("EN")).not.toBeInTheDocument();
  });

  it("keeps identical square dimensions in both locales", async () => {
    await renderLocaleControl();
    const english = localeButton().className;
    cleanup();

    window.localStorage.setItem("locale", "ar");
    await renderLocaleControl();

    // The size comes from one `size="icon-lg"` class set that cannot vary with
    // the locale, because no locale-dependent content sits inside the box.
    // (The exact 36px is measured in the browser — jsdom has no cascade.)
    expect(localeButton().className).toBe(english);
    expect(english).toContain("size-9");
  });

  it("takes its whole visual treatment from the outline Button variant", async () => {
    await renderLocaleControl();

    const className = localeButton().className;
    // The authoritative outline variant: semantic border and background.
    expect(className).toContain("border-border");
    expect(className).toContain("bg-background");
    expect(className).toContain("hover:bg-accent");
    expect(className).toContain("focus-visible:ring-2");
    // Nothing bespoke: no raw colour, no local border, shadow, or transform.
    expect(className).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|oklch\(/i);
    expect(className).not.toMatch(/\bborder-\[|\bshadow-|\brotate-|\bscale-(?!x)/);
  });

  it("names the action rather than the current value, in the active language", async () => {
    const user = userEvent.setup();
    await renderLocaleControl();

    expect(localeButton()).toHaveAccessibleName(EN_LABEL);

    await user.click(localeButton());

    await waitFor(() => {
      expect(localeButton()).toHaveAccessibleName(AR_LABEL);
    });
  });

  it("switches visible content, lang, and dir together, and persists the choice", async () => {
    const user = userEvent.setup();
    await renderLocaleControl();

    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");

    await user.click(localeButton());

    await waitFor(() => {
      expect(localeButton()).toHaveAccessibleName(AR_LABEL);
    });
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
    expect(window.localStorage.getItem("locale")).toBe("ar");
  });

  it("switches back, so the toggle is symmetric", async () => {
    const user = userEvent.setup();
    await renderLocaleControl();

    await user.click(localeButton());
    await waitFor(() => {
      expect(document.documentElement.dir).toBe("rtl");
    });

    await user.click(localeButton());
    await waitFor(() => {
      expect(document.documentElement.dir).toBe("ltr");
    });
    expect(localeButton()).toHaveAccessibleName(EN_LABEL);
    expect(window.localStorage.getItem("locale")).toBe("en");
  });

  it("activates with Enter and with Space", async () => {
    const user = userEvent.setup();
    await renderLocaleControl();

    localeButton().focus();
    expect(localeButton()).toHaveFocus();

    await user.keyboard("{Enter}");
    await waitFor(() => {
      expect(document.documentElement.dir).toBe("rtl");
    });

    await user.keyboard(" ");
    await waitFor(() => {
      expect(document.documentElement.dir).toBe("ltr");
    });
  });

  it("keeps entered client state across a switch", async () => {
    const user = userEvent.setup();
    await renderLocaleControl();

    const field = screen.getByRole("textbox", { name: "draft" });
    await user.type(field, "unsaved work");

    await user.click(localeButton());
    await waitFor(() => {
      expect(document.documentElement.dir).toBe("rtl");
    });

    expect(screen.getByRole("textbox", { name: "draft" })).toHaveValue("unsaved work");
  });

  it("keeps the globe decorative and free of any local styling", async () => {
    await renderLocaleControl();

    const icon = localeButton().querySelector("svg");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    // The component applies no className of its own to the glyph, so it can
    // carry no mirroring, sizing, or transform utility. (Rendered
    // non-mirroring is measured in the browser, where a cascade exists.)
    expect(icon).not.toHaveAttribute("style");
  });

  it("uses only logical spacing, so nothing is pinned to a physical side", async () => {
    await renderLocaleControl();

    expect(localeButton().className).not.toMatch(/\b(?:ml|mr|pl|pr|left|right)-/);
  });

  it("owns no selection semantics: no pressed state, no tabs, no radio group", async () => {
    await renderLocaleControl();

    const button = localeButton();
    expect(button).not.toHaveAttribute("aria-pressed");
    expect(button).not.toHaveAttribute("aria-selected");
    expect(button).not.toHaveAttribute("aria-haspopup");
    expect(button).not.toHaveAttribute("aria-expanded");

    for (const role of ["radio", "radiogroup", "tab", "tablist", "listbox", "menu"] as const) {
      expect(screen.queryAllByRole(role)).toHaveLength(0);
    }
    // The old segmented control offered both autonyms at once; neither may
    // remain as a selectable option.
    expect(screen.queryByRole("button", { name: "English" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "العربية" })).not.toBeInTheDocument();
  });
});
