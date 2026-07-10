/**
 * Transition tokens for motion timing and easing.
 */
export const TRANSITIONS = {
  durations: {
    instant: "0ms",
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
  },
  easings: {
    linear: "linear",
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    entrance: "cubic-bezier(0, 0, 0.2, 1)",
    exit: "cubic-bezier(0.4, 0, 1, 1)",
  },
} as const;

export type Transitions = typeof TRANSITIONS;
export type TransitionDurationToken = keyof Transitions["durations"];
export type TransitionEasingToken = keyof Transitions["easings"];
