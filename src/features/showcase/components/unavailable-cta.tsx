"use client";

import { toast } from "sonner";

import { Button, type ButtonProps } from "@/components/ui/button";

export type UnavailableCtaProps = Pick<ButtonProps, "variant" | "size" | "className"> & {
  /** Visible + accessible label; also names the affordance in the toast copy. */
  label: string;
};

/**
 * Showcase auth CTA — the *action-shaped* half of the unavailable pattern
 * (docs/LAYOUT.md §6). The showcase has no authentication (a ROADMAP item),
 * but unlike a missing *destination* — which renders as non-interactive text,
 * because a dead link is never acceptable — an action-shaped affordance stays
 * a real, fully interactive `<button>` with hover / active / focus states and
 * explains itself on activation with a toast. The no-dead-destinations
 * guarantee is preserved by the explanation, not by faking non-interactivity:
 * a button that looks interactive must behave interactively.
 *
 * It also renders at real widths, so the SiteShell collapse-breakpoint
 * measurement (docs/LAYOUT.md §6) stays honest.
 */
export function UnavailableCta({ label, ...props }: UnavailableCtaProps) {
  return (
    <Button
      onClick={() =>
        toast(`“${label}” isn’t available here`, {
          description: "The showcase ships no authentication — this is a demo affordance.",
        })
      }
      {...props}
    >
      {label}
    </Button>
  );
}
