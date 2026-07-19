import { ENV_CONFIG } from "@/config/env";
import { DEMO_RECORDS } from "@/features/showcase/api";

/*
 * Backing endpoint for the /showcase/data demo: a real HTTP round trip that
 * builds and tests offline (no external service in CI). GET route handlers
 * are dynamic by default in Next 16; this one serves a fixed payload, so it
 * is forced static to keep the entire route table prerendered.
 */
export const dynamic = "force-static";

export function GET(): Response {
  // Mirrors the /showcase route gate (docs/CLONING.md): with the flag off,
  // the endpoint prerenders as a static 404 alongside the pages it serves.
  if (!ENV_CONFIG.NEXT_PUBLIC_ENABLE_SHOWCASE) {
    return new Response(null, { status: 404 });
  }
  return Response.json(DEMO_RECORDS);
}
