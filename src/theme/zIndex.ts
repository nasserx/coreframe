/**
 * Named z-index layers for predictable stacking order.
 */
export const Z_INDEX = {
  base: 0,
  raised: 10,
  sticky: 100,
  overlay: 400,
  modal: 500,
  popover: 600,
  toast: 700,
  tooltip: 800,
} as const;

export type ZIndex = typeof Z_INDEX;
export type ZIndexToken = keyof ZIndex;
