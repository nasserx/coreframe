import { cn } from "@/lib/utils";

import styles from "./marketing-motion.module.css";

/**
 * The marker the single marketing observer discovers its targets by. It is an
 * attribute rather than a class so the discovery query never depends on a
 * hashed CSS-module name.
 */
export const MARKETING_REVEAL_TARGET_ATTRIBUTE = "data-reveal";

/**
 * Where the observer writes the one-time reveal state. Absent means "not
 * enhanced" — the element renders in its final position, which is what every
 * element looks like without JavaScript, without IntersectionObserver, and
 * under `prefers-reduced-motion: reduce`.
 */
export const MARKETING_REVEAL_STATE_ATTRIBUTE = "data-reveal-state";

/**
 * Marks one reveal unit: a block that fades and rises once, the first time it
 * enters the viewport. Pair the returned props with the element's own
 * `data-slot`; the attribute and the class must always travel together, which
 * is the reason this helper exists rather than two literals per call site.
 */
export function marketingReveal(className?: string): {
  "data-reveal": string;
  className: string;
} {
  return { [MARKETING_REVEAL_TARGET_ATTRIBUTE]: "", className: cn(styles["reveal"], className) };
}

/**
 * Marks a card group: the group is the single observed unit, and its direct
 * children enter in DOM order with a short stagger between them. Use it only
 * where the children really are siblings of one kind — never to stagger whole
 * sections against each other.
 */
export function marketingRevealGroup(className?: string): {
  "data-reveal": string;
  className: string;
} {
  return { [MARKETING_REVEAL_TARGET_ATTRIBUTE]: "", className: cn(styles["stagger"], className) };
}
