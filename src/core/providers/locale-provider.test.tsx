import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Namespace, Translator } from "@/i18n";

import type { LocaleContextValue } from "./locale-provider";

/*
 * Reference test for the locale runtime. Like the theme runtime it keeps its
 * preference in a module-level store, so each test imports a FRESH copy
 * (`vi.resetModules()` + dynamic import) to avoid state leaking between tests —
 * this also resets the session catalogue cache, so a switch re-loads the
 * code-split Arabic chunk each time. (Importing TYPES from the static path is
 * safe; types carry no module state.)
 */

function Probe({
  useLocale,
  useTranslations,
}: {
  useLocale: () => LocaleContextValue;
  useTranslations: <NS extends Namespace>(ns: NS) => Translator<NS>;
}) {
  const { locale, direction, canSwitchLocale, setLocale } = useLocale();
  const t = useTranslations("theme");
  return (
    <div>
      <output data-testid="locale">{locale}</output>
      <output data-testid="direction">{direction}</output>
      <output data-testid="can-switch">{String(canSwitchLocale)}</output>
      <output data-testid="label">{t("label")}</output>
      <button type="button" onClick={() => setLocale("ar")}>
        choose arabic
      </button>
      <button type="button" onClick={() => setLocale("en")}>
        choose english
      </button>
    </div>
  );
}

async function renderLocaleRuntime() {
  vi.resetModules();
  const { LocaleProvider, useLocale, useTranslations } = await import("./locale-provider");
  render(
    <LocaleProvider>
      <Probe useLocale={useLocale} useTranslations={useTranslations} />
    </LocaleProvider>,
  );
}

describe("locale runtime", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    document.documentElement.removeAttribute("dir");
    document.documentElement.removeAttribute("lang");
  });

  it("defaults to the build-time default locale (en / ltr) and stamps lang/dir", async () => {
    await renderLocaleRuntime();
    expect(screen.getByTestId("locale")).toHaveTextContent("en");
    expect(screen.getByTestId("direction")).toHaveTextContent("ltr");
    expect(screen.getByTestId("label")).toHaveTextContent("Theme");
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("reports that switching is possible when more than one locale is built in", async () => {
    await renderLocaleRuntime();
    expect(screen.getByTestId("can-switch")).toHaveTextContent("true");
  });

  it("switches language: translations, direction, lang/dir, and persistence all follow", async () => {
    const user = userEvent.setup();
    await renderLocaleRuntime();

    await user.click(screen.getByRole("button", { name: "choose arabic" }));

    // The Arabic catalogue is code-split, so the label settles asynchronously.
    expect(await screen.findByText("المظهر")).toBeInTheDocument();
    expect(screen.getByTestId("locale")).toHaveTextContent("ar");
    // Direction is derived from the locale (not the catalogue), so it flips
    // immediately — it can never disagree with the language.
    expect(screen.getByTestId("direction")).toHaveTextContent("rtl");
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
    expect(window.localStorage.getItem("locale")).toBe("ar");
  });

  it("restores a stored locale on mount", async () => {
    window.localStorage.setItem("locale", "ar");
    await renderLocaleRuntime();
    expect(screen.getByTestId("locale")).toHaveTextContent("ar");
    expect(screen.getByTestId("direction")).toHaveTextContent("rtl");
    expect(await screen.findByText("المظهر")).toBeInTheDocument();
  });

  it("ignores an unsupported stored locale and falls back to the default", async () => {
    window.localStorage.setItem("locale", "fr");
    await renderLocaleRuntime();
    expect(screen.getByTestId("locale")).toHaveTextContent("en");
  });

  it("adopts a locale stored by another tab via the storage event", async () => {
    await renderLocaleRuntime();
    expect(screen.getByTestId("locale")).toHaveTextContent("en");

    act(() => {
      window.localStorage.setItem("locale", "ar");
      window.dispatchEvent(new StorageEvent("storage", { key: "locale", newValue: "ar" }));
    });

    expect(screen.getByTestId("locale")).toHaveTextContent("ar");
    expect(await screen.findByText("المظهر")).toBeInTheDocument();
  });

  it("survives blocked storage: the choice still applies, only persistence is lost", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    const user = userEvent.setup();
    await renderLocaleRuntime();
    expect(screen.getByTestId("locale")).toHaveTextContent("en");

    await user.click(screen.getByRole("button", { name: "choose arabic" }));

    expect(await screen.findByText("المظهر")).toBeInTheDocument();
    expect(screen.getByTestId("direction")).toHaveTextContent("rtl");
  });
});
