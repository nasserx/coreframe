import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ThemeContextValue } from "./theme-provider";

/*
 * Reference test for a module with browser-global state. The provider keeps
 * its theme in a module-level store (so every consumer shares one
 * subscription), which means each test must import a FRESH copy of the
 * module — `vi.resetModules()` + dynamic import — or state leaks between
 * tests. jsdom has no `matchMedia`, so the OS preference is a controllable
 * stub installed below. (Importing a TYPE from the static module path is
 * safe — types carry no module state.)
 */

let systemPrefersDark = false;
const mediaListeners = new Set<() => void>();

function setSystemPrefersDark(dark: boolean): void {
  systemPrefersDark = dark;
  for (const listener of mediaListeners) {
    listener();
  }
}

function installMatchMedia(): void {
  const matchMedia = (query: string): MediaQueryList => {
    const mediaQueryList: Partial<MediaQueryList> = {
      get matches() {
        return systemPrefersDark;
      },
      media: query,
      addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        mediaListeners.add(listener as () => void);
      },
      removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        mediaListeners.delete(listener as () => void);
      },
    };
    return mediaQueryList as MediaQueryList;
  };
  vi.stubGlobal("matchMedia", matchMedia);
}

function Probe({ useTheme }: { useTheme: () => ThemeContextValue }) {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <output data-testid="theme">{theme}</output>
      <button type="button" onClick={() => setTheme("dark")}>
        choose dark
      </button>
      <button type="button" onClick={() => setTheme("light")}>
        choose light
      </button>
    </div>
  );
}

async function renderThemeRuntime() {
  vi.resetModules();
  const { ThemeProvider, useTheme } = await import("./theme-provider");
  render(
    <ThemeProvider>
      <Probe useTheme={useTheme} />
    </ThemeProvider>,
  );
}

describe("theme runtime", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    systemPrefersDark = false;
    mediaListeners.clear();
    installMatchMedia();
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  describe("initialization", () => {
    it("resolves the OS preference once when nothing is stored", async () => {
      systemPrefersDark = true;
      await renderThemeRuntime();

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      expect(document.documentElement).toHaveClass("dark");
    });

    it("does not persist a system-derived value merely because the page loaded", async () => {
      systemPrefersDark = true;
      await renderThemeRuntime();

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      // The visitor has made no choice; storage must still say so, or the OS
      // preference would be frozen at whatever it was on the first visit.
      expect(window.localStorage.getItem("theme")).toBeNull();
    });

    it("lets a stored light choice win over an OS that prefers dark", async () => {
      window.localStorage.setItem("theme", "light");
      systemPrefersDark = true;
      await renderThemeRuntime();

      expect(screen.getByTestId("theme")).toHaveTextContent("light");
      expect(document.documentElement).not.toHaveClass("dark");
    });

    it("lets a stored dark choice win over an OS that prefers light", async () => {
      window.localStorage.setItem("theme", "dark");
      systemPrefersDark = false;
      await renderThemeRuntime();

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      expect(document.documentElement).toHaveClass("dark");
    });

    it('treats a legacy stored "system" as no choice at all', async () => {
      // Written by the previous three-state runtime. It must neither survive as
      // an active state nor block the OS fallback.
      window.localStorage.setItem("theme", "system");
      systemPrefersDark = true;
      await renderThemeRuntime();

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      // Still not an explicit choice, so it is not rewritten on load.
      expect(window.localStorage.getItem("theme")).toBe("system");
    });

    it('overwrites a legacy "system" with a concrete value on the first toggle', async () => {
      window.localStorage.setItem("theme", "system");
      systemPrefersDark = true;
      const user = userEvent.setup();
      await renderThemeRuntime();

      await user.click(screen.getByRole("button", { name: "choose light" }));

      expect(screen.getByTestId("theme")).toHaveTextContent("light");
      expect(window.localStorage.getItem("theme")).toBe("light");
    });

    it("ignores garbage in storage and falls back to the OS preference", async () => {
      window.localStorage.setItem("theme", "solarized");
      systemPrefersDark = true;
      await renderThemeRuntime();

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    });

    it("stops following the OS once the session has resolved", async () => {
      await renderThemeRuntime();
      expect(screen.getByTestId("theme")).toHaveTextContent("light");

      act(() => {
        setSystemPrefersDark(true);
      });

      // A later OS change must not restyle a page the visitor is reading.
      expect(screen.getByTestId("theme")).toHaveTextContent("light");
      expect(document.documentElement).not.toHaveClass("dark");
    });
  });

  describe("pre-paint script parity", () => {
    /*
     * The inline script decides the class before first paint and the provider
     * decides the value after hydration. If they ever disagreed the page would
     * flash — so this executes the REAL exported script against the same
     * globals and compares its outcome with the provider's, in every
     * storage/OS combination that resolution distinguishes.
     */
    const CASES = [
      { stored: null, system: true, expected: "dark" },
      { stored: null, system: false, expected: "light" },
      { stored: "light", system: true, expected: "light" },
      { stored: "dark", system: false, expected: "dark" },
      { stored: "system", system: true, expected: "dark" },
      { stored: "system", system: false, expected: "light" },
      { stored: "solarized", system: true, expected: "dark" },
    ] as const;

    for (const { stored, system, expected } of CASES) {
      it(`agrees on ${expected} for stored=${String(stored)} / system dark=${String(system)}`, async () => {
        if (stored !== null) {
          window.localStorage.setItem("theme", stored);
        }
        systemPrefersDark = system;

        vi.resetModules();
        const { THEME_INIT_SCRIPT } = await import("./theme-provider");
        // Exactly what the browser runs ahead of the app tree.
        new Function(THEME_INIT_SCRIPT)();
        const scriptApplied = document.documentElement.classList.contains("dark")
          ? "dark"
          : "light";

        await renderThemeRuntime();

        expect(scriptApplied).toBe(expected);
        expect(screen.getByTestId("theme")).toHaveTextContent(expected);
      });
    }
  });

  describe("choice, persistence, and sync", () => {
    it("applies and persists an explicit choice", async () => {
      const user = userEvent.setup();
      await renderThemeRuntime();

      await user.click(screen.getByRole("button", { name: "choose dark" }));

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      expect(document.documentElement).toHaveClass("dark");
      expect(window.localStorage.getItem("theme")).toBe("dark");
    });

    it("survives blocked storage: the choice still applies, only persistence is lost", async () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("storage disabled");
      });
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("storage disabled");
      });
      const user = userEvent.setup();
      await renderThemeRuntime();
      expect(screen.getByTestId("theme")).toHaveTextContent("light");

      await user.click(screen.getByRole("button", { name: "choose dark" }));

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      expect(document.documentElement).toHaveClass("dark");
    });

    it("adopts a choice stored by another tab via the storage event", async () => {
      await renderThemeRuntime();
      expect(screen.getByTestId("theme")).toHaveTextContent("light");

      act(() => {
        // The storage event only fires in *other* tabs; simulate being the
        // other tab by writing the value and dispatching the event manually.
        window.localStorage.setItem("theme", "dark");
        window.dispatchEvent(new StorageEvent("storage", { key: "theme", newValue: "dark" }));
      });

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      expect(document.documentElement).toHaveClass("dark");
    });

    it("returns to the OS fallback when another tab clears the stored choice", async () => {
      window.localStorage.setItem("theme", "light");
      systemPrefersDark = true;
      await renderThemeRuntime();
      expect(screen.getByTestId("theme")).toHaveTextContent("light");

      act(() => {
        window.localStorage.removeItem("theme");
        window.dispatchEvent(new StorageEvent("storage", { key: "theme", newValue: null }));
      });

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    });
  });
});
