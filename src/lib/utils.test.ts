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

  it("treats the type-ramp steps as font-size, not text color", () => {
    // Regression: default tailwind-merge classified `text-small` etc. as
    // text-COLOR, so a later color class silently deleted the size —
    // ramp steps vanished wherever a size and a color met in one call.
    // The extended config in utils.ts fixes the classification.
    expect(cn("text-caption", "text-muted-foreground")).toBe("text-caption text-muted-foreground");
    expect(cn("text-small text-muted-foreground", "text-foreground")).toBe(
      "text-small text-foreground",
    );
    // Ramp steps still merge against each other and against stock sizes.
    expect(cn("text-small", "text-caption")).toBe("text-caption");
    expect(cn("text-sm", "text-body")).toBe("text-body");
  });
});
