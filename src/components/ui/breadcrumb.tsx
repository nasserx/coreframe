import type { ComponentProps } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type BreadcrumbProps = ComponentProps<"nav">;

export type BreadcrumbListProps = ComponentProps<"ol">;

export type BreadcrumbItemProps = ComponentProps<"li">;

export type BreadcrumbLinkProps = useRender.ComponentProps<"a">;

export type BreadcrumbPageProps = ComponentProps<"span">;

export type BreadcrumbSeparatorProps = ComponentProps<"li">;

export type BreadcrumbEllipsisProps = ComponentProps<"span">;

/**
 * Hierarchy trail primitive, composed from BreadcrumbList, BreadcrumbItem,
 * BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage, and
 * BreadcrumbEllipsis.
 *
 * Accessibility: renders a `<nav aria-label="breadcrumb">` landmark with an
 * ordered list; separators and the ellipsis are hidden from assistive
 * technologies, and BreadcrumbPage marks the current page with
 * `aria-current="page"`.
 *
 * Constraints: UI-only — link destinations and truncation logic belong to
 * the consumer. Use BreadcrumbLink's `render` prop to compose a framework
 * link (e.g. `next/link`).
 */
export function Breadcrumb({ className, ...props }: BreadcrumbProps) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" className={className} {...props} />;
}

export function BreadcrumbList({ className, ...props }: BreadcrumbListProps) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function BreadcrumbItem({ className, ...props }: BreadcrumbItemProps) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

export function BreadcrumbLink({ className, render, ...props }: BreadcrumbLinkProps) {
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn("transition-colors hover:text-foreground", className),
      },
      props,
    ),
    render,
    state: {
      slot: "breadcrumb-link",
    },
  });
}

export function BreadcrumbPage({ className, ...props }: BreadcrumbPageProps) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  );
}

export function BreadcrumbSeparator({ children, className, ...props }: BreadcrumbSeparatorProps) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRightIcon className="rtl:rotate-180" />}
    </li>
  );
}

/**
 * Marks a collapsed run of trail items.
 *
 * Registry divergence (docs/UI_LIBRARY.md §8): upstream nests an `sr-only`
 * label inside this `aria-hidden` wrapper, where it is unreachable — the two
 * are mutually exclusive on one subtree. The dead label is removed rather than
 * exposed: a breadcrumb trail is supplementary navigation, and the consumer
 * that decides WHICH items to collapse is also the one that can name them, so
 * announcing a bare "More" here would add noise, not information.
 */
export function BreadcrumbEllipsis({ className, ...props }: BreadcrumbEllipsisProps) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-5 items-center justify-center [&>svg]:size-4", className)}
      {...props}
    >
      <MoreHorizontalIcon />
    </span>
  );
}
