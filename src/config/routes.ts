/**
 * Route constants for application navigation and linking.
 *
 * A flat map of route paths. Grouping (public/protected, per-area) is an
 * application decision and should be introduced by the app that needs it,
 * not assumed by the foundation.
 */
export const ROUTES = {
  HOME: "/",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
