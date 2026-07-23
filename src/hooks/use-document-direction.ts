"use client";

import { useSyncExternalStore } from "react";

import type { TextDirection } from "@/config";

/**
 * Reactively reports the document's text direction from `<html dir>`.
 *
 * Anchored Base UI popups read direction from a `DirectionProvider`, not the
 * DOM (`useAnchorPositioning` calls `useDirection()`, which defaults to
 * `ltr`). A floating panel must therefore be told the real direction so it
 * aligns to the correct inline edge. Two deployment shapes have to work:
 *
 * - A product sets `dir` once at SSR from `APP_CONFIG` and never changes it;
 *   the observer below then never fires — watching a single attribute that
 *   never mutates costs nothing.
 * - The showcase (and the e2e matrix) flip `dir` on `<html>` at runtime for
 *   inspection; reading it reactively keeps the panel aligned in both
 *   directions without a page reload.
 *
 * `useSyncExternalStore` gives a hydration-safe read: the server snapshot is
 * `ltr` (Base UI's own default), and the client resubscribes to the live
 * attribute after mount. The provider it feeds renders no DOM, so a
 * post-hydration correction cannot cause a markup mismatch.
 */
export function useDocumentDirection(): TextDirection {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function getSnapshot(): TextDirection {
  return document.documentElement.dir === "rtl" ? "rtl" : "ltr";
}

function getServerSnapshot(): TextDirection {
  return "ltr";
}

function subscribe(onChange: () => void): () => void {
  if (typeof MutationObserver === "undefined") {
    return () => undefined;
  }
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["dir"],
  });
  return () => observer.disconnect();
}
