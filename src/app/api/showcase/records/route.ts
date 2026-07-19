import { DEMO_RECORDS } from "@/features/showcase/api";

/*
 * Backing endpoint for the /showcase/data demo: a real HTTP round trip that
 * builds and tests offline (no external service in CI). GET route handlers
 * are dynamic by default in Next 16; this one serves a fixed payload, so it
 * is forced static to keep the entire route table prerendered.
 */
export const dynamic = "force-static";

export function GET(): Response {
  return Response.json(DEMO_RECORDS);
}
