import { createElement } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useDocumentDirection } from "./use-document-direction";

/*
 * This hook is the sole feeder of RTL positioning for anchored Base UI popups
 * (SiteShellNavMenu), because Base UI reads direction from a DirectionProvider
 * rather than the DOM. Its three branches all matter: the live subscription
 * keeps a panel aligned when `dir` flips at runtime, the MutationObserver-absent
 * fallback must not throw, and the server snapshot must match Base UI's own
 * default so hydration cannot mismatch.
 */

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute("dir");
});

describe("useDocumentDirection", () => {
  it("reads the current direction from <html dir>", () => {
    document.documentElement.dir = "rtl";
    expect(renderHook(() => useDocumentDirection()).result.current).toBe("rtl");
  });

  it('treats a missing or unrecognized dir as "ltr"', () => {
    document.documentElement.removeAttribute("dir");
    expect(renderHook(() => useDocumentDirection()).result.current).toBe("ltr");

    document.documentElement.dir = "auto";
    expect(renderHook(() => useDocumentDirection()).result.current).toBe("ltr");
  });

  it("re-reports when dir changes at runtime", async () => {
    document.documentElement.dir = "ltr";
    const { result } = renderHook(() => useDocumentDirection());

    // MutationObserver delivers on a microtask, so let it flush inside act.
    await act(async () => {
      document.documentElement.dir = "rtl";
    });
    expect(result.current).toBe("rtl");

    await act(async () => {
      document.documentElement.dir = "ltr";
    });
    expect(result.current).toBe("ltr");
  });

  it("stops observing on unmount", async () => {
    const disconnect = vi.fn();
    const observe = vi.fn();
    vi.stubGlobal(
      "MutationObserver",
      class {
        observe = observe;
        disconnect = disconnect;
        takeRecords = () => [];
      },
    );

    const { unmount } = renderHook(() => useDocumentDirection());
    expect(observe).toHaveBeenCalledOnce();
    // Watches only `dir` on the document element — a narrow filter is what makes
    // subscribing free for the common case of a direction that never changes.
    expect(observe.mock.calls[0]?.[0]).toBe(document.documentElement);
    expect(observe.mock.calls[0]?.[1]).toMatchObject({ attributeFilter: ["dir"] });

    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("degrades to a non-reactive read where MutationObserver is unavailable", () => {
    vi.stubGlobal("MutationObserver", undefined);
    document.documentElement.dir = "rtl";

    const { result, unmount } = renderHook(() => useDocumentDirection());

    // Still reports the direction; it simply cannot notice later changes.
    expect(result.current).toBe("rtl");
    expect(() => {
      unmount();
    }).not.toThrow();
  });

  it('renders "ltr" on the server even when the DOM says otherwise', async () => {
    // The server snapshot is what SSR emits and what hydration compares against.
    // Base UI's own default is `ltr`, so this must be `ltr` unconditionally —
    // reading the DOM here would make every RTL page hydrate against markup the
    // server could not have produced.
    document.documentElement.dir = "rtl";
    const { renderToString } = await import("react-dom/server");

    const rendered = renderToString(createElement(() => useDocumentDirection()));

    expect(rendered).toBe("ltr");
  });
});
