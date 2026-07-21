import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

/*
 * tailwind-merge must be taught the foundation's custom utilities, or it
 * misclassifies them and silently drops classes: the type-ramp steps
 * (`text-display` … `text-caption`, generated from the `--text-*` tokens
 * in theme.css) look like text-COLOR classes to the default config, so
 * `cn("text-small", "text-muted-foreground")` returned only the color —
 * a real shipped defect (ramp steps vanished wherever a size and a color
 * met in one cn call). Keep this list in sync with the `--text-*` steps
 * in src/styles/theme.css.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "title",
            "heading",
            "subheading",
            "body-lg",
            "body",
            "small",
            "caption",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
