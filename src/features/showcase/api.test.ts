import { describe, expect, it } from "vitest";

import { showcaseKeys } from "./api";

/*
 * Contract test for the query key strategy (docs/DATA_LAYER.md): keys are
 * tuples built from a per-feature root, so invalidating the root
 * structurally matches every query of the feature and two features can
 * never collide.
 */
describe("showcase query keys", () => {
  it("builds every key under the feature root", () => {
    expect(showcaseKeys.records()).toEqual(["showcase", "records"]);
    expect(showcaseKeys.records().slice(0, showcaseKeys.all.length)).toEqual([...showcaseKeys.all]);
  });

  it("returns stable (deeply equal) keys across calls — required for cache hits", () => {
    expect(showcaseKeys.records()).toEqual(showcaseKeys.records());
  });
});
