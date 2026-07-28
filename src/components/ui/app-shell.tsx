"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ComponentProps, RefObject } from "react";
import { usePathname } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { MenuIcon, XIcon } from "lucide-react";

import { useScrolled } from "@/hooks/use-scrolled";
import { cn } from "@/lib/utils";
import { BREAKPOINTS } from "@/theme";

import { Button } from "./button";
import { DialogOverlay, DialogPortal } from "./dialog";
import { SkipLink } from "./skip-link";

type AppShellContextValue = Readonly<{
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  scrolled: boolean;
}>;

const AppShellContext = createContext<AppShellContextValue | null>(null);

function useAppShell(caller: string): AppShellContextValue {
  const context = useContext(AppShellContext);
  if (context === null) {
    throw new Error(`${caller} must be rendered inside <AppShell>.`);
  }
  return context;
}

export type AppShellProps = ComponentProps<"div"> & {
  /** Label of the built-in skip link; localize at the call site. */
  skipLinkLabel?: string;
};

export type AppShellSidebarProps = ComponentProps<"nav"> & {
  /** Accessible name of the navigation region and its mobile drawer. */
  label?: string;
  /** Accessible name of the drawer's close button; localize at the call site. */
  closeLabel?: string;
};

export type AppShellSidebarTriggerProps = ComponentProps<typeof Button>;

export type AppShellHeaderProps = ComponentProps<"header">;

export type AppShellMainProps = ComponentProps<"main">;

/**
 * Application shell primitive: a persistent inline-start navigation region,
 * a header region, and a scrolling main region, composed as direct children:
 *
 *   <AppShell>
 *     <AppShellSidebar>…navigation…</AppShellSidebar>
 *     <AppShellHeader>…</AppShellHeader>
 *     <AppShellMain>…</AppShellMain>
 *   </AppShell>
 *
 * Layout: a CSS grid (sidebar column + header/main rows). The document
 * itself scrolls — native scroll restoration is preserved — while the
 * sidebar and header stay pinned. Below `md` the sidebar collapses into a
 * modal drawer opened by AppShellSidebarTrigger (place it in the header).
 *
 * Accessibility: a skip link is always the first focusable element and
 * targets AppShellMain; regions are landmarks (nav / banner / main); the
 * drawer is a labelled modal dialog with focus trapped inside, Escape and
 * backdrop dismissal, and focus returned to the trigger on close. The
 * drawer also closes itself on route navigation.
 *
 * Direction: grid order, borders, and the drawer edge are all logical, so
 * the shell mirrors under `dir="rtl"` with no conditional logic.
 *
 * Constraints: structural only — no brand, no nav items, no user menu, no
 * widths beyond a neutral default. Products restyle via className and the
 * sidebar tokens (docs/LAYOUT.md). Not part of the shadcn registry (the
 * official sidebar is a designed product chrome; this is deliberately not).
 */
export function AppShell({
  className,
  children,
  skipLinkLabel = "Skip to main content",
  ...props
}: AppShellProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const pathname = usePathname();
  const { sentinelRef, scrolled } = useScrolled();

  // Route navigation from a drawer link must dismiss the drawer; the layout
  // (and therefore the drawer) survives App Router navigations. State is
  // adjusted during render (the React-sanctioned previous-value pattern),
  // not in an effect.
  const [previousPathname, setPreviousPathname] = useState(pathname);
  if (pathname !== previousPathname) {
    setPreviousPathname(pathname);
    setOpen(false);
  }

  return (
    <AppShellContext.Provider value={{ open, setOpen, triggerRef, scrolled }}>
      <div
        data-slot="app-shell"
        className={cn(
          "grid min-h-dvh w-full grid-rows-[auto_1fr] md:grid-cols-[auto_1fr]",
          className,
        )}
        {...props}
      >
        {/* Scroll sentinel for the header boundary (see AppShellHeader):
            absolutely positioned at the document top (no positioned
            ancestor exists), zero layout impact on the grid. */}
        <div ref={sentinelRef} aria-hidden="true" className="absolute top-0 h-px w-px" />
        <SkipLink>{skipLinkLabel}</SkipLink>
        {children}
      </div>
    </AppShellContext.Provider>
  );
}

export function AppShellSidebar({
  className,
  children,
  label = "Primary",
  closeLabel = "Close navigation",
  ...props
}: AppShellSidebarProps) {
  const { open, setOpen, triggerRef } = useAppShell("AppShellSidebar");

  // The drawer exists only below `md` (the persistent sidebar takes over
  // above it). If the viewport crosses that line while the drawer is open,
  // close it — otherwise CSS hides the popup but the modal scroll lock and
  // focus trap would keep governing an invisible dialog.
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const desktop = window.matchMedia(`(min-width: ${BREAKPOINTS.md})`);
    if (desktop.matches) {
      setOpen(false);
      return undefined;
    }
    const onChange = (event: MediaQueryListEvent): void => {
      if (event.matches) {
        setOpen(false);
      }
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [open, setOpen]);

  return (
    <>
      <nav
        data-slot="app-shell-sidebar"
        aria-label={label}
        className={cn(
          "sticky top-0 row-span-2 hidden h-dvh w-64 flex-col overflow-y-auto border-e bg-sidebar text-sidebar-foreground md:flex",
          className,
        )}
        {...props}
      >
        {children}
      </nav>
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay className="md:hidden" />
          <DialogPrimitive.Popup
            data-slot="app-shell-drawer"
            aria-label={label}
            finalFocus={triggerRef}
            className="fixed inset-y-0 start-0 z-50 flex h-dvh w-72 max-w-[calc(100%-3rem)] flex-col border-e bg-sidebar text-sidebar-foreground duration-(--motion-moderate) outline-none md:hidden data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
          >
            {/* h-16 matches the header this drawer replaces, so the close
                button lands where the trigger was — same rule as SiteShell. */}
            <div className="flex h-16 shrink-0 items-center justify-end border-b px-2">
              <DialogPrimitive.Close
                render={<Button variant="ghost" size="icon-sm" />}
                data-slot="app-shell-drawer-close"
              >
                <XIcon />
                <span className="sr-only">{closeLabel}</span>
              </DialogPrimitive.Close>
            </div>
            <nav aria-label={label} className="flex flex-1 flex-col overflow-y-auto">
              {children}
            </nav>
          </DialogPrimitive.Popup>
        </DialogPortal>
      </DialogPrimitive.Root>
    </>
  );
}

export function AppShellSidebarTrigger({
  className,
  onClick,
  "aria-label": ariaLabel = "Open navigation",
  ...props
}: AppShellSidebarTriggerProps) {
  const { open, setOpen, triggerRef } = useAppShell("AppShellSidebarTrigger");

  return (
    <Button
      data-slot="app-shell-sidebar-trigger"
      ref={triggerRef}
      variant="ghost"
      size="icon"
      aria-label={ariaLabel}
      aria-haspopup="dialog"
      aria-expanded={open}
      className={cn("md:hidden", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setOpen(true);
        }
      }}
      {...props}
    >
      <MenuIcon />
    </Button>
  );
}

export function AppShellHeader({ className, ...props }: AppShellHeaderProps) {
  const { scrolled } = useAppShell("AppShellHeader");

  return (
    <header
      data-slot="app-shell-header"
      data-scrolled={scrolled ? "" : undefined}
      // The hairline under the bar appears only once the page has
      // scrolled: at position zero, bar and page are one surface. The
      // border is always present (transparent at top), so its arrival
      // never shifts layout; only border-color transitions.
      className={cn(
        "sticky top-0 z-40 flex h-16 min-w-0 items-center gap-3 border-b border-transparent bg-background px-4 transition-colors data-scrolled:border-border sm:px-6 lg:px-8",
        className,
      )}
      {...props}
    />
  );
}

export function AppShellMain({ className, ...props }: AppShellMainProps) {
  return (
    <main
      data-slot="app-shell-main"
      id="main-content"
      // Focus target of the skip link; never focusable by Tab.
      tabIndex={-1}
      className={cn("min-w-0 outline-none", className)}
      {...props}
    />
  );
}
