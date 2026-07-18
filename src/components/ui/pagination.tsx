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
 * expose descriptive `aria-label`s, and the ellipsis is hidden with an
 * `sr-only` fallback.
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
      className={cn("pl-1.5!", className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  );
}

export function PaginationNext({ className, text = "Next", ...props }: PaginationNextProps) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("pr-1.5!", className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  );
}

export function PaginationEllipsis({ className, ...props }: PaginationEllipsisProps) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More pages</span>
    </span>
  );
}
