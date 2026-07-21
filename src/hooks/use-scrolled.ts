"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

/**
 * Reports whether the document is scrolled away from the top, for chrome
 * that changes at scroll position zero (the shells' header boundary).
 *
 * Mechanism: an IntersectionObserver watching a 1px sentinel placed at the
 * document top — render the returned `sentinelRef` on an absolutely
 * positioned, zero-impact element. Chosen over a scroll listener because
 * the observer fires only when the boundary is crossed (no per-frame
 * work), causes no layout reads, and reports the correct state
 * immediately on mount (including restored/deep-linked scroll positions).
 *
 * Fallback: if IntersectionObserver is unavailable (jsdom, ancient
 * browsers), `scrolled` stays `true` — consumers degrade to their
 * always-on state, never to a missing affordance.
 */
export function useScrolled(): {
  sentinelRef: RefObject<HTMLDivElement | null>;
  scrolled: boolean;
} {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (sentinel === null || typeof IntersectionObserver === "undefined") {
      setScrolled(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry !== undefined) {
        setScrolled(!entry.isIntersecting);
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return { sentinelRef, scrolled };
}
