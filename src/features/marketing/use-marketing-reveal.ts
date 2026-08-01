"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

import {
  MARKETING_REVEAL_STATE_ATTRIBUTE,
  MARKETING_REVEAL_TARGET_ATTRIBUTE,
} from "./marketing-motion";

/**
 * The marketing page's single reveal owner.
 *
 * Mechanism: one IntersectionObserver for the whole route, created inside the
 * scope element and shared by every `data-reveal` unit — never one observer
 * per card, no scroll listener, and no per-frame React work. Each unit is
 * unobserved the moment it reveals, so a reveal cannot replay when the reader
 * scrolls back, and the observer disconnects itself once the last one is done.
 * Nothing here writes React state, so scrolling triggers no re-render at all.
 *
 * Progressive enhancement is the reason this reads the way it does. Content is
 * server-rendered in its final position and the hidden state is *added* by
 * this hook, only to units that are still below the fold at the moment it
 * runs. So:
 *
 * - JavaScript that never arrives, fails, or hydrates late leaves every
 *   section exactly as the server rendered it — visible;
 * - a browser without IntersectionObserver fails open the same way;
 * - reduced motion opts out before anything is hidden;
 * - content already on screen is never hidden, so it cannot appear and then
 *   flash out;
 * - unmounting releases anything still hidden, so no code path can strand
 *   server-rendered content behind an observer that will never fire.
 */
export function useMarketingReveal(scopeRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const scope = scopeRef.current;
    if (scope === null || typeof IntersectionObserver === "undefined") {
      return undefined;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    // One batched read pass before any write, so discovery costs a single
    // layout. A unit whose top edge has not reached the viewport bottom yet is
    // the only kind that can be hidden without a reader seeing it happen.
    const viewportHeight = window.innerHeight;
    const pending = [
      ...scope.querySelectorAll<HTMLElement>(`[${MARKETING_REVEAL_TARGET_ATTRIBUTE}]`),
    ].filter((element) => element.getBoundingClientRect().top >= viewportHeight);
    if (pending.length === 0) {
      return undefined;
    }
    for (const element of pending) {
      element.setAttribute(MARKETING_REVEAL_STATE_ATTRIBUTE, "hidden");
    }

    let remaining = pending.length;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) {
            continue;
          }
          entry.target.setAttribute(MARKETING_REVEAL_STATE_ATTRIBUTE, "shown");
          observer.unobserve(entry.target);
          remaining -= 1;
        }
        if (remaining === 0) {
          observer.disconnect();
        }
      },
      // A small bottom inset lets a unit settle into view before it starts,
      // rather than beginning the moment its first pixel crosses the edge.
      { rootMargin: "0px 0px -10% 0px" },
    );
    for (const element of pending) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
      for (const element of pending) {
        if (element.getAttribute(MARKETING_REVEAL_STATE_ATTRIBUTE) === "hidden") {
          element.removeAttribute(MARKETING_REVEAL_STATE_ATTRIBUTE);
        }
      }
    };
  }, [scopeRef]);
}
