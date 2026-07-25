import type { ComponentProps } from "react";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button, type ButtonProps } from "./button";

export type PaginationProps = ComponentProps<"nav">;

export type PaginationContentProps = ComponentProps<"ul">;

export type PaginationItemProps = ComponentProps<"li">;

export type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  ComponentProps<"a">;

export type PaginationPreviousProps = PaginationLinkProps & { text?: string };

export type PaginationNextProps = PaginationLinkProps & { text?: string };

export type PaginationEllipsisProps = ComponentProps<"span">;

/**
 * Page navigation primitive, composed from PaginationContent,
 * PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, and
 * PaginationEllipsis. Links render as anchors styled through Button.
 *
 * Accessibility: renders a `<nav aria-label="pagination">` landmark with a
 * list of links; the active link carries `aria-current="page"`, prev/next
 * expose descriptive `aria-label`s, and the ellipsis announces the elision
 * through an `sr-only` label (see PaginationEllipsis).
 *
 * Constraints: UI-only — page math, ranges, and hrefs belong to the
 * consumer; the primitive renders whatever items it is given.
 */
export function Pagination({ className, ...props }: PaginationProps) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

export function PaginationContent({ className, ...props }: PaginationContentProps) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  );
}

export function PaginationItem(props: PaginationItemProps) {
  return <li data-slot="pagination-item" {...props} />;
}

export function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={className}
      nativeButton={false}
      render={
        <a
          aria-current={isActive ? "page" : undefined}
          data-slot="pagination-link"
          data-active={isActive}
          {...props}
        />
      }
    />
  );
}

export function PaginationPrevious({
  className,
  text = "Previous",
  ...props
}: PaginationPreviousProps) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("ps-1.5!", className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" className="rtl:rotate-180" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  );
}

export function PaginationNext({ className, text = "Next", ...props }: PaginationNextProps) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("pe-1.5!", className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon data-icon="inline-end" className="rtl:rotate-180" />
    </PaginationLink>
  );
}

/**
 * Marks elided pages in the range.
 *
 * Registry divergence (docs/UI_LIBRARY.md §8): upstream puts `aria-hidden` on
 * this wrapper AND an `sr-only` label inside it, which cannot both work —
 * `aria-hidden` prunes the whole subtree, so the label was unreachable and a
 * screen-reader user met a silent gap in the range. The elision is meaningful
 * information, so the wrapper is exposed and the label announces; only the icon
 * is decorative.
 */
export function PaginationEllipsis({ className, ...props }: PaginationEllipsisProps) {
  return (
    <span
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon aria-hidden="true" />
      <span className="sr-only">More pages</span>
    </span>
  );
}
