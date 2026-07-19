/**
 * Reference endpoint module — the shape every feature copies for its own
 * server data (docs/DATA_LAYER.md):
 *
 * 1. A Zod schema describing the wire format (validation at the boundary).
 * 2. A key factory: one `all` root per feature, one method per query,
 *    every key built by spreading the root — typed `as const` tuples, so
 *    keys are collision-free across features and prefix invalidation
 *    (`queryClient.invalidateQueries({ queryKey: showcaseKeys.all })`)
 *    works structurally. No stringly-typed keys at call sites.
 * 3. Fetchers that pass React Query's `signal` through to `apiFetch`.
 */
import { z } from "zod";

import { apiFetch } from "@/api/client";

export const demoRecordSchema = z.object({
  id: z.number(),
  name: z.string(),
  state: z.enum(["ready", "pending"]),
});

export const demoRecordsSchema = z.array(demoRecordSchema);

export type DemoRecord = z.infer<typeof demoRecordSchema>;

/**
 * The payload served by `src/app/api/showcase/records/route.ts`. Lives here
 * (not in the route handler) because the app layer may import features,
 * never the reverse.
 */
export const DEMO_RECORDS: readonly DemoRecord[] = [
  { id: 1, name: "Alpha", state: "ready" },
  { id: 2, name: "Beta", state: "pending" },
  { id: 3, name: "Gamma", state: "ready" },
];

export const showcaseKeys = {
  all: ["showcase"] as const,
  records: () => [...showcaseKeys.all, "records"] as const,
};

export function fetchDemoRecords(signal?: AbortSignal): Promise<DemoRecord[]> {
  return apiFetch("/api/showcase/records", {
    schema: demoRecordsSchema,
    ...(signal === undefined ? {} : { signal }),
  });
}
