/**
 * Route constants for application navigation and linking.
 */
export const ROUTES = {
  PUBLIC: {
    HOME: "/",
  },
} as const;

export type AppRouteGroup = keyof typeof ROUTES;
export type PublicRoute = (typeof ROUTES.PUBLIC)[keyof typeof ROUTES.PUBLIC];
export type AppRoute = PublicRoute;
