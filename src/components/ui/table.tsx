import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type TableProps = ComponentProps<"table">;

export type TableHeaderProps = ComponentProps<"thead">;

export type TableBodyProps = ComponentProps<"tbody">;

export type TableFooterProps = ComponentProps<"tfoot">;

export type TableRowProps = ComponentProps<"tr">;

export type TableHeadProps = ComponentProps<"th">;

export type TableCellProps = ComponentProps<"td">;

export type TableCaptionProps = ComponentProps<"caption">;

/**
 * Tabular data primitive composed from TableHeader, TableBody, TableFooter,
 * TableRow, TableHead, TableCell, and TableCaption. The root wraps the
 * `<table>` in a horizontally scrollable container so wide tables never
 * break the page layout.
 *
 * Accessibility: native table semantics throughout — use TableHead for
 * header cells (add `scope` when row/column context is ambiguous) and
 * TableCaption to name the table for assistive technologies.
 *
 * Constraints: UI-only — no sorting, selection, or pagination logic; row
 * selection styling reads `data-state="selected"` set by the consumer.
 */
export function Table({ className, ...props }: TableProps) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: TableHeaderProps) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />;
}

export function TableBody({ className, ...props }: TableBodyProps) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

export function TableFooter({ className, ...props }: TableFooterProps) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  );
}

export function TableCaption({ className, ...props }: TableCaptionProps) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
