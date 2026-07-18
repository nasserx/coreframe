"use client";

import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type SkipLinkProps = ComponentProps<"a">;

/**
 * Skip navigation link (WCAG 2.4.1 Bypass Blocks): visually hidden until
 * focused, then pinned at the inline start of the viewport. Must be the
 * first focusable element on the page — AppShell renders it first
 * automatically.
 *
 * Accessibility: on activation it moves focus programmatically to the
 * target (which must carry `tabindex="-1"`, as AppShellMain does), because
 * fragment navigation alone does not move focus reliably across browsers.
 * The href still works as a plain anchor without JavaScript.
 *
 * Constraints: UI-only; the label is caller-provided text so products
 * localize it at the call site.
 */
export function SkipLink({ className, href = "#main-content", onClick, ...props }: SkipLinkProps) {
  return (
    <a
      data-slot="skip-link"
      href={href}
      className={cn(
        "sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:start-2 focus-visible:top-2 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-background focus-visible:px-3 focus-visible:py-2 focus-visible:text-small focus-visible:font-medium focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) {
          return;
        }
        const target = document.getElementById(href.replace(/^#/, ""));
        if (target !== null) {
          target.focus();
        }
      }}
      {...props}
    />
  );
}
