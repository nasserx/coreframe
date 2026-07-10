/**
 * Navigation data only. This file must not contain React components.
 */
import { ROUTES } from "./routes";

export const NAVIGATION_ITEMS = [
  {
    label: "Home",
    href: ROUTES.PUBLIC.HOME,
  },
] as const;

export type NavigationItem = (typeof NAVIGATION_ITEMS)[number];
