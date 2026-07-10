/**
 * Permission constants for future authorization boundaries.
 */
export const PERMISSIONS = {
  APPLICATION: {
    READ: "application:read",
    MANAGE: "application:manage",
  },
} as const;

export type PermissionGroup = keyof typeof PERMISSIONS;
export type ApplicationPermission =
  (typeof PERMISSIONS.APPLICATION)[keyof typeof PERMISSIONS.APPLICATION];
export type Permission = ApplicationPermission;
