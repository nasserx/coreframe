/**
 * Feature flags. Each flag must be boolean.
 */
export const FEATURE_FLAGS = {
  ENABLE_EXPERIMENTAL_FEATURES: false,
} as const satisfies Record<string, boolean>;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;
export type FeatureFlags = typeof FEATURE_FLAGS;
