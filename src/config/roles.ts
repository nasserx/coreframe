/**
 * Application role constants for future access control.
 */
export const ROLES = {
  GUEST: "guest",
  USER: "user",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
