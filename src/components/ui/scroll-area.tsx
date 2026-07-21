import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";

import { cn } from "@/lib/utils";

export type ScrollAreaProps = ScrollAreaPrimitive.Root.Props;

export type ScrollBarProps = ScrollAreaPrimitive.Scrollbar.Props;

/**
 * Scrolling container primitive (Base UI ScrollArea) with themed, overlay
 * scrollbars. Renders a vertical ScrollBar by default; compose an
 * additional `<ScrollBar orientation="horizontal" />` for two-axis
 * scrolling. Size the area via `className` — content overflowing it
 * scrolls.
 *
 * Accessibility: the viewport is keyboard-focusable with a visible focus
 * ring so keyboard users can scroll; native wheel/touch/scroll semantics
 * are preserved by the underlying primitive.
 *
 * Constraints: UI-only — a scrolling surface, not a virtualization or
 * infinite-loading mechanism; those belong to consumers.
 */
export function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        // Inset focus ring: the viewport sits inside an overflow-clipping
        // container, so an outer or offset ring would be cut off.
        className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

export function ScrollBar({ className, ...props }: ScrollBarProps) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      className={cn(
        "flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-s data-vertical:border-s-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}
