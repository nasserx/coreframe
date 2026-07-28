import type { ComponentProps } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "./button";

export type DialogProps = DialogPrimitive.Root.Props;

export type DialogTriggerProps = DialogPrimitive.Trigger.Props;

export type DialogPortalProps = DialogPrimitive.Portal.Props;

export type DialogCloseProps = DialogPrimitive.Close.Props;

export type DialogOverlayProps = DialogPrimitive.Backdrop.Props;

export type DialogContentProps = DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
  /** Accessible name of the built-in close button; localize at the call site. */
  closeLabel?: string;
};

export type DialogHeaderProps = ComponentProps<"div">;

export type DialogFooterProps = ComponentProps<"div"> & {
  showCloseButton?: boolean;
  /** Visible label of the built-in close button; localize at the call site. */
  closeLabel?: string;
};

export type DialogTitleProps = DialogPrimitive.Title.Props;

export type DialogDescriptionProps = DialogPrimitive.Description.Props;

/**
 * Modal overlay primitive (Base UI Dialog), composed from DialogTrigger,
 * DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
 * and DialogClose. Supports controlled (`open`/`onOpenChange`) and
 * uncontrolled (`defaultOpen`) usage.
 *
 * Accessibility: the underlying primitive provides `role="dialog"`,
 * focus trapping and restoration, Escape-to-close, scroll locking, and wires
 * `aria-labelledby`/`aria-describedby` to DialogTitle/DialogDescription —
 * always render a DialogTitle. DialogContent portals to the document root
 * with a backdrop at a shared overlay z-index.
 *
 * Constraints: UI-only — no confirmation semantics (see AlertDialog), no
 * business workflows.
 */
export function Dialog(props: DialogProps) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

export function DialogTrigger(props: DialogTriggerProps) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

export function DialogPortal(props: DialogPortalProps) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

export function DialogClose(props: DialogCloseProps) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-overlay duration-(--motion-moderate) supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  children,
  showCloseButton = true,
  closeLabel = "Close",
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed inset-x-0 top-1/2 z-50 mx-auto grid w-full max-w-[calc(100%-2rem)] -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-border duration-(--motion-moderate) outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={<Button variant="ghost" className="absolute end-2 top-2" size="icon-sm" />}
          >
            <XIcon />
            <span className="sr-only">{closeLabel}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div data-slot="dialog-header" className={cn("flex flex-col gap-2", className)} {...props} />
  );
}

export function DialogFooter({
  className,
  showCloseButton = false,
  closeLabel = "Close",
  children,
  ...props
}: DialogFooterProps) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          {closeLabel}
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-base leading-none font-medium", className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
