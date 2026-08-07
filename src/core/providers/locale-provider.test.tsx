import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AppLocale } from "@/config";
import type { Namespace, Translator } from "@/i18n";

import type { LocaleContextValue } from "./locale-provider";

/*
 * Reference test for the locale runtime. Like the theme runtime it keeps its
 * preference in a module-level store, so each test imports a FRESH copy
 * (`vi.resetModules()` + dynamic import) to avoid state leaking between tests —
 * this also resets the session catalogue cache, so a switch re-loads the
 * code-split Arabic chunk each time. (Importing TYPES from the static path is
 * safe; types carry no module state.)
 *
 * That reload is a real async transition, so every assertion about translated
 * text waits on `settleCatalogue` below rather than on a polling window.
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
      <output data-testid="label">{t("toDark")}</output>
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
  const { loadCatalogue } = await import("@/i18n");
  render(
    <LocaleProvider>
      <Probe useLocale={useLocale} useTranslations={useTranslations} />
    </LocaleProvider>,
  );

  return {
    /*
     * Wait for a non-default catalogue the way the provider does, instead of
     * watching the DOM until it happens to appear. Selecting a non-default
     * locale starts ONE code-split `import()` in the provider's locale effect
     * and commits the translated text when it resolves; awaiting the same
     * loader — from the same freshly reset registry, so it is the same module
     * job — settles exactly when that load is done, and the surrounding `act`
     * flushes the re-render it causes. Assertions afterwards are ordinary
     * synchronous reads.
     *
     * This is the async contract itself, not a delay: the provider still
     * performs its own load, still fills its own cache, and still re-renders on
     * its own, so a provider that stopped committing the catalogue would fail
     * here immediately rather than after a timeout.
     */
    async settleCatalogue(locale: AppLocale) {
      await act(async () => {
        await loadCatalogue(locale);
      });
    },
  };
}

describe("locale runtime", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.doUnmock("@/i18n");
    window.localStorage.clear();
    document.documentElement.removeAttribute("dir");
    document.documentElement.removeAttribute("lang");
  });

  it("defaults to the build-time default locale (en / ltr) and stamps lang/dir", async () => {
    await renderLocaleRuntime();
    expect(screen.getByTestId("locale")).toHaveTextContent("en");
    expect(screen.getByTestId("direction")).toHaveTextContent("ltr");
    expect(screen.getByTestId("label")).toHaveTextContent("Switch to dark mode");
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("reports that switching is possible when more than one locale is built in", async () => {
    await renderLocaleRuntime();
    expect(screen.getByTestId("can-switch")).toHaveTextContent("true");
  });

  it("switches language: translations, direction, lang/dir, and persistence all follow", async () => {
    const user = userEvent.setup();
    const { settleCatalogue } = await renderLocaleRuntime();

    await user.click(screen.getByRole("button", { name: "choose arabic" }));

    // The Arabic catalogue is code-split, so the label settles asynchronously.
    await settleCatalogue("ar");
    expect(screen.getByText("التبديل إلى الوضع الداكن")).toBeInTheDocument();
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
    const { settleCatalogue } = await renderLocaleRuntime();
    expect(screen.getByTestId("locale")).toHaveTextContent("ar");
    expect(screen.getByTestId("direction")).toHaveTextContent("rtl");
    await settleCatalogue("ar");
    expect(screen.getByText("التبديل إلى الوضع الداكن")).toBeInTheDocument();
  });

  it("ignores an unsupported stored locale and falls back to the default", async () => {
    window.localStorage.setItem("locale", "fr");
    await renderLocaleRuntime();
    expect(screen.getByTestId("locale")).toHaveTextContent("en");
  });

  it("adopts a locale stored by another tab via the storage event", async () => {
    const { settleCatalogue } = await renderLocaleRuntime();
    expect(screen.getByTestId("locale")).toHaveTextContent("en");

    act(() => {
      window.localStorage.setItem("locale", "ar");
      window.dispatchEvent(new StorageEvent("storage", { key: "locale", newValue: "ar" }));
    });

    expect(screen.getByTestId("locale")).toHaveTextContent("ar");
    await settleCatalogue("ar");
    expect(screen.getByText("التبديل إلى الوضع الداكن")).toBeInTheDocument();
  });

  it("survives blocked storage: the choice still applies, only persistence is lost", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    const user = userEvent.setup();
    const { settleCatalogue } = await renderLocaleRuntime();
    expect(screen.getByTestId("locale")).toHaveTextContent("en");

    await user.click(screen.getByRole("button", { name: "choose arabic" }));

    await settleCatalogue("ar");
    expect(screen.getByText("التبديل إلى الوضع الداكن")).toBeInTheDocument();
    expect(screen.getByTestId("direction")).toHaveTextContent("rtl");
  });

  /*
   * A code-split catalogue can fail to load (offline, CDN blip, chunk hashes
   * rotated by a deploy while the tab was open). Direction switches
   * synchronously with the locale while messages fall back to the default
   * catalogue, so the runtime must not settle half-switched — English prose in
   * an RTL document labelled `lang="ar"` would be silently wrong.
   */
  it("reverts the locale when a catalogue chunk fails to load, without throwing", async () => {
    const chunkFailure = new Error("Loading chunk for locale ar failed");
    const unhandled: unknown[] = [];
    const onUnhandledRejection = (reason: unknown) => {
      unhandled.push(reason);
    };
    process.on("unhandledRejection", onUnhandledRejection);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    // Everything else in the module passes through untouched; only the loader
    // is replaced, so the provider exercises its real rejection path.
    vi.doMock("@/i18n", async () => ({
      ...(await vi.importActual<Record<string, unknown>>("@/i18n")),
      loadCatalogue: () => Promise.reject(chunkFailure),
    }));

    try {
      const user = userEvent.setup();
      await renderLocaleRuntime();

      await user.click(screen.getByRole("button", { name: "choose arabic" }));

      // Language, direction, and the document attributes come back together.
      await waitFor(() => {
        expect(screen.getByTestId("locale")).toHaveTextContent("en");
      });
      expect(screen.getByTestId("direction")).toHaveTextContent("ltr");
      expect(document.documentElement.lang).toBe("en");
      expect(document.documentElement.dir).toBe("ltr");
      expect(screen.getByTestId("label")).toHaveTextContent("Switch to dark mode");
      // The failed choice must not persist for the next visit either.
      expect(window.localStorage.getItem("locale")).toBe("en");

      // Reported for diagnosis, and never left as an unhandled rejection.
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('Could not load the "ar" message catalogue'),
        chunkFailure,
      );
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
      expect(unhandled).toEqual([]);
    } finally {
      process.off("unhandledRejection", onUnhandledRejection);
      vi.doUnmock("@/i18n");
    }
  });
});
