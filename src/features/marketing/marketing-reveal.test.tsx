import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LocaleProvider } from "@/core/providers/locale-provider";
import { ThemeProvider } from "@/core/providers/theme-provider";

import { MarketingCapabilityStory } from "./marketing-capability-story";
import { MarketingShell } from "./marketing-shell";

/*
 * Contract of the marketing page's one-time viewport reveal. Everything here
 * is a DOM fact: which elements the observer takes over, what it writes, and
 * what happens when the enhancement is unavailable. Computed motion values —
 * stagger delays, animation state, smooth scrolling, the sticky-header landing
 * — are browser facts and live in tests/e2e/marketing-motion.spec.ts.
 */

// SiteShell dismisses its drawer on route change via usePathname; component
// tests render outside the App Router, so pin the hook (as the sibling
// marketing and shell tests do).
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

const REVEAL_TARGET = "[data-reveal]";
const REVEAL_STATE = "data-reveal-state";
// SiteShell's header boundary owns its own observer on a top-of-document
// sentinel (src/hooks/use-scrolled.ts). Its root margin is the default, so
// this value identifies the reveal observer whatever it ends up observing.
const REVEAL_ROOT_MARGIN = "0px 0px -10% 0px";

type ObserverHandle = {
  readonly callback: IntersectionObserverCallback;
  readonly observed: Element[];
  readonly unobserved: Element[];
  readonly rootMargin: string;
  disconnects: number;
};

let observers: ObserverHandle[] = [];

function installIntersectionObserver(): void {
  observers = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin: string;
      readonly thresholds: readonly number[] = [0];
      readonly #handle: ObserverHandle;

      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        this.rootMargin = options?.rootMargin ?? "";
        this.#handle = {
          callback,
          observed: [],
          unobserved: [],
          rootMargin: this.rootMargin,
          disconnects: 0,
        };
        observers.push(this.#handle);
      }

      observe(element: Element): void {
        this.#handle.observed.push(element);
      }

      unobserve(element: Element): void {
        this.#handle.unobserved.push(element);
      }

      disconnect(): void {
        this.#handle.disconnects += 1;
      }

      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    },
  );
}

function revealObservers(): ObserverHandle[] {
  return observers.filter((observer) => observer.rootMargin === REVEAL_ROOT_MARGIN);
}

/** Drives the sole reveal observer the way the browser would. */
function intersect(elements: readonly Element[], isIntersecting = true): void {
  const observer = revealObservers()[0];
  if (observer === undefined) {
    throw new Error("The reveal contract requires exactly one marketing observer.");
  }
  observer.callback(
    elements.map((target) => ({ target, isIntersecting }) as IntersectionObserverEntry),
    {} as IntersectionObserver,
  );
}

function installMatchMedia(prefersReducedMotion: boolean): void {
  vi.stubGlobal(
    "matchMedia",
    (query: string): MediaQueryList =>
      ({
        matches: prefersReducedMotion && query.includes("prefers-reduced-motion"),
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList,
  );
}

/**
 * jsdom reports a zero rect for everything, so the "is this unit still below
 * the fold?" question has to be answered explicitly. `below` is the case the
 * enhancement exists for; the opposite case proves already-visible content is
 * never taken over.
 */
function stubGeometry(placement: "below-fold" | "in-viewport"): void {
  const top = placement === "below-fold" ? window.innerHeight + 500 : 0;
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (
    this: Element,
  ): DOMRect {
    const elementTop = this.matches(REVEAL_TARGET) ? top : 0;
    return {
      top: elementTop,
      y: elementTop,
      bottom: elementTop,
      left: 0,
      right: 0,
      x: 0,
      width: 0,
      height: 0,
      toJSON: () => ({}),
    };
  });
}

function renderMarketingPage() {
  return render(
    <ThemeProvider>
      <LocaleProvider>
        <MarketingShell>
          <MarketingCapabilityStory />
        </MarketingShell>
      </LocaleProvider>
    </ThemeProvider>,
  );
}

function revealTargets(): HTMLElement[] {
  return [...screen.getByRole("main").querySelectorAll<HTMLElement>(REVEAL_TARGET)];
}

function revealStates(): (string | null)[] {
  return revealTargets().map((element) => element.getAttribute(REVEAL_STATE));
}

describe("marketing reveal", () => {
  beforeEach(() => {
    installMatchMedia(false);
    installIntersectionObserver();
    stubGeometry("below-fold");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("marks the page's major sections and card groups as reveal units", () => {
    renderMarketingPage();

    const targets = revealTargets();
    // Every post-hero section opens with an intro lockup, and each carries its
    // own content block; the exact number is composition, but a page with no
    // units at all would mean the marking was lost.
    expect(targets.length).toBeGreaterThan(0);
    expect(
      targets.filter((element) => element.dataset["slot"] === "marketing-story-grid"),
    ).toHaveLength(2);
    expect(
      targets.filter((element) => element.dataset["slot"] === "marketing-section-intro").length,
    ).toBeGreaterThan(0);
  });

  it("uses one observer for the whole route and observes each unit once", () => {
    renderMarketingPage();

    const reveal = revealObservers();
    expect(reveal).toHaveLength(1);
    expect(reveal[0]?.observed).toEqual(revealTargets());
  });

  it("registers no scroll listener", () => {
    const addWindowListener = vi.spyOn(window, "addEventListener");
    const addDocumentListener = vi.spyOn(document, "addEventListener");

    renderMarketingPage();

    const events = [
      ...addWindowListener.mock.calls.map(([type]) => type),
      ...addDocumentListener.mock.calls.map(([type]) => type),
    ];
    expect(events).not.toContain("scroll");
  });

  it("hides a unit only while it is below the fold, then reveals it on entry", () => {
    renderMarketingPage();

    const targets = revealTargets();
    expect(revealStates().every((state) => state === "hidden")).toBe(true);

    intersect(targets);

    expect(revealStates().every((state) => state === "shown")).toBe(true);
    expect(revealObservers()[0]?.unobserved).toEqual(targets);
    // The last unit revealed, so the observer has no reason to stay alive.
    expect(revealObservers()[0]?.disconnects).toBe(1);
  });

  it("never replays a reveal once the unit has entered", () => {
    renderMarketingPage();

    const first = revealTargets()[0];
    if (first === undefined) throw new Error("The reveal contract requires at least one unit.");

    intersect([first]);
    expect(first.getAttribute(REVEAL_STATE)).toBe("shown");

    // Scrolling back out and in again: the browser would stop reporting an
    // unobserved element, and a stray record must not undo the reveal either.
    intersect([first], false);
    intersect([first]);
    expect(first.getAttribute(REVEAL_STATE)).toBe("shown");
  });

  it("never hides content that is already on screen", () => {
    stubGeometry("in-viewport");

    renderMarketingPage();

    expect(revealStates().every((state) => state === null)).toBe(true);
    expect(revealObservers()).toHaveLength(0);
    expect(screen.getByRole("heading", { level: 2, name: /technical choices/i })).toBeVisible();
  });

  it("leaves every section visible when IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);

    renderMarketingPage();

    expect(revealStates().every((state) => state === null)).toBe(true);
    expect(screen.getByRole("heading", { level: 2, name: /technical choices/i })).toBeVisible();
  });

  it("leaves every section visible when reduced motion is preferred", () => {
    installMatchMedia(true);

    renderMarketingPage();

    expect(revealStates().every((state) => state === null)).toBe(true);
    expect(revealObservers()).toHaveLength(0);
  });

  it("releases anything still hidden when the route unmounts", () => {
    const { unmount } = renderMarketingPage();
    const targets = revealTargets();
    expect(targets.every((element) => element.getAttribute(REVEAL_STATE) === "hidden")).toBe(true);

    unmount();

    expect(targets.every((element) => element.getAttribute(REVEAL_STATE) === null)).toBe(true);
    expect(revealObservers()[0]?.disconnects).toBe(1);
  });

  it("keeps a deterministic sibling order inside a staggered card group", () => {
    renderMarketingPage();

    const group = revealTargets().find(
      (element) => element.dataset["slot"] === "marketing-story-grid",
    );
    if (group === undefined) throw new Error("The stagger contract requires a card group.");

    const cards = [...group.children];
    expect(cards).toHaveLength(6);
    // The stagger step is expressed as `nth-child`, so the visual sequence is
    // whatever this DOM order is — identical in both directions.
    expect(cards.map((card) => card.querySelector("h3")?.textContent)).toEqual([
      "Architecture with clear ownership",
      "A semantic design system",
      "Bilingual by construction",
      "Responsive public chrome",
      "A static delivery path",
      "Quality gates that observe the browser",
    ]);
  });
});
