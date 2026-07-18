import { describe, expect, it } from "vitest";

import { cn } from "./utils";

/*
 * Reference test for a pure utility: no DOM, no mocks — inputs in,
 * string out. New utility tests should look like this.
 */
describe("cn", () => {
  it("joins class values and drops falsy entries", () => {
    expect(cn("a", undefined, null, false, "b")).toBe("a b");
  });

  it("supports clsx conditional syntax", () => {
    expect(cn("base", { active: true, hidden: false }, ["extra"])).toBe("base active extra");
  });

  it("resolves Tailwind conflicts in favor of the last class", () => {
    // tailwind-merge, not string concat: without it both padding classes
    // would ship and CSS order — not call order — would win.
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-start", "text-end")).toBe("text-end");
  });

  it("keeps non-conflicting classes from every argument", () => {
    expect(cn("rounded-lg p-2", "bg-primary")).toBe("rounded-lg p-2 bg-primary");
  });
});
