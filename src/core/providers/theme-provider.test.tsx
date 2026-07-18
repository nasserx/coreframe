import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ThemeContextValue } from "./theme-provider";

/*
 * Reference test for a module with browser-global state. The provider keeps
 * its preference in a module-level store (so every consumer shares one
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
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <output data-testid="theme">{theme}</output>
      <output data-testid="resolved">{resolvedTheme}</output>
      <button type="button" onClick={() => setTheme("dark")}>
        choose dark
      </button>
      <button type="button" onClick={() => setTheme("system")}>
        choose system
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

  it("defaults to the system preference with light resolution", async () => {
    await renderThemeRuntime();
    expect(screen.getByTestId("theme")).toHaveTextContent("system");
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("keeps preference and resolution distinct when the OS prefers dark", async () => {
    systemPrefersDark = true;
    await renderThemeRuntime();
    expect(screen.getByTestId("theme")).toHaveTextContent("system");
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("tracks a live OS preference change while in system mode", async () => {
    await renderThemeRuntime();
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");

    act(() => {
      setSystemPrefersDark(true);
    });

    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("applies and persists an explicit choice", async () => {
    const user = userEvent.setup();
    await renderThemeRuntime();

    await user.click(screen.getByRole("button", { name: "choose dark" }));

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(window.localStorage.getItem("theme")).toBe("dark");
  });

  it("restores a stored preference on mount, overriding the OS", async () => {
    window.localStorage.setItem("theme", "dark");
    systemPrefersDark = false;
    await renderThemeRuntime();
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
  });

  it("ignores garbage in storage and falls back to system", async () => {
    window.localStorage.setItem("theme", "solarized");
    await renderThemeRuntime();
    expect(screen.getByTestId("theme")).toHaveTextContent("system");
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
    expect(screen.getByTestId("theme")).toHaveTextContent("system");

    await user.click(screen.getByRole("button", { name: "choose dark" }));

    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("adopts a preference stored by another tab via the storage event", async () => {
    await renderThemeRuntime();
    expect(screen.getByTestId("theme")).toHaveTextContent("system");

    act(() => {
      // The storage event only fires in *other* tabs; simulate being the
      // other tab by writing the value and dispatching the event manually.
      window.localStorage.setItem("theme", "dark");
      window.dispatchEvent(new StorageEvent("storage", { key: "theme", newValue: "dark" }));
    });

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
  });
});
