import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

/*
 * tailwind-merge otherwise treats the foundation's custom `text-*` ramp
 * utilities as text colors. Register every ramp role as a font size so size
 * and color utilities can coexist; keep this list in sync with theme.css.
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
            "supporting",
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
