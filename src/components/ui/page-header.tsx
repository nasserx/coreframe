import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type PageHeaderProps = ComponentProps<"header">;

export type PageHeaderTitleProps = ComponentProps<"h1">;

export type PageHeaderDescriptionProps = ComponentProps<"p">;

/**
 * Page scaffold primitive: the recurring breadcrumb + title + description
 * block at the top of a page. Compose slots in reading order — an optional
 * Breadcrumb (or anything else), then PageHeaderTitle and
 * PageHeaderDescription. Rhythm and measure are owned here so pages never
 * re-decide them (docs/LAYOUT.md).
 *
 * Accessibility: renders a native `<header>`; PageHeaderTitle renders the
 * page's single `<h1>`. Inside AppShellMain the header element is scoped to
 * `main`, so it does not create a competing banner landmark.
 *
 * Constraints: UI-only and domain-neutral — no actions slot, no tabs, no
 * metadata rows until a real repeated need exists. Not part of the shadcn
 * registry (no official implementation exists).
 */
export function PageHeader({ className, ...props }: PageHeaderProps) {
  return (
    <header data-slot="page-header" className={cn("flex flex-col gap-3", className)} {...props} />
  );
}

export function PageHeaderTitle({ className, ...props }: PageHeaderTitleProps) {
  return <h1 data-slot="page-header-title" className={cn("text-heading", className)} {...props} />;
}

export function PageHeaderDescription({ className, ...props }: PageHeaderDescriptionProps) {
  return (
    <p
      data-slot="page-header-description"
      // -mt-2 tightens the title + description pair into a lockup (net
      // 0.25rem) while the header's gap-3 still separates it from a
      // preceding breadcrumb — one rhythm decision, owned here.
      className={cn("-mt-2 max-w-prose text-small text-muted-foreground", className)}
      {...props}
    />
  );
}
