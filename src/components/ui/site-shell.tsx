"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ComponentProps, ReactNode, RefObject } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";
import { BREAKPOINTS, type BreakpointToken } from "@/theme";

import { Button } from "./button";
import { Container } from "./container";
import { DialogOverlay, DialogPortal } from "./dialog";
import { SkipLink } from "./skip-link";

/**
 * The breakpoint below which the top-bar navigation collapses into the
 * drawer. Restricted to the Tailwind screen tokens so every class stays a
 * static literal (Tailwind cannot generate classes from runtime values)
 * and the matchMedia guard reads the same value from BREAKPOINTS.
 */
export type SiteShellCollapseBreakpoint = Extract<BreakpointToken, "sm" | "md" | "lg" | "xl">;

// One entry per breakpoint, spelled out as full literals for the Tailwind
// scanner: `nav` hides the horizontal navigation below the line; `belowOnly`
// confines the trigger, overlay, and drawer to widths below it.
const COLLAPSE_CLASSES: Record<SiteShellCollapseBreakpoint, { nav: string; belowOnly: string }> = {
  sm: { nav: "max-sm:hidden", belowOnly: "sm:hidden" },
  md: { nav: "max-md:hidden", belowOnly: "md:hidden" },
  lg: { nav: "max-lg:hidden", belowOnly: "lg:hidden" },
  xl: { nav: "max-xl:hidden", belowOnly: "xl:hidden" },
};

type SiteShellContextValue = Readonly<{
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  collapseBelow: SiteShellCollapseBreakpoint;
}>;

const SiteShellContext = createContext<SiteShellContextValue | null>(null);

function useSiteShell(caller: string): SiteShellContextValue {
  const context = useContext(SiteShellContext);
  if (context === null) {
    throw new Error(`${caller} must be rendered inside <SiteShell>.`);
  }
  return context;
}

export type SiteShellProps = ComponentProps<"div"> & {
  /** Label of the built-in skip link; localize at the call site. */
  skipLinkLabel?: string;
  /**
   * Tailwind screen below which the top-bar navigation collapses into the
   * drawer. There is deliberately no universal default that fits: the right
   * line depends on how wide YOUR brand + items + actions actually render
   * (in every locale you ship) — measure the bar's content and pick the
   * smallest screen it fits, rather than assuming `md`. The e2e overflow
   * sweep (`tests/e2e/overflow.spec.ts`) fails the build when the chosen
   * line is wrong.
   */
  collapseBelow?: SiteShellCollapseBreakpoint;
};

export type SiteShellHeaderProps = ComponentProps<"header">;

export type SiteShellNavProps = ComponentProps<"nav"> & {
  /** Accessible name of the navigation region and its mobile drawer. */
  label?: string;
  /** Accessible name of the drawer's close button; localize at the call site. */
  closeLabel?: string;
};

export type SiteShellNavItemProps = Readonly<{
  /**
   * Destination. Omit it for a destination that does not exist yet: the
   * item then renders as non-interactive, non-focusable muted text carrying
   * an sr-only availability hint — never a dead link, never a 404.
   */
  href?: string;
  /** sr-only availability hint for href-less items; localize at the call site. */
  unavailableLabel?: string;
  className?: string;
  children: ReactNode;
}>;

export type SiteShellNavTriggerProps = ComponentProps<typeof Button>;

export type SiteShellMainProps = ComponentProps<"main">;

export type SiteShellFooterProps = ComponentProps<"footer">;

/**
 * Public site shell primitive: a sticky top bar (brand + navigation +
 * actions), a scrolling main region, and a footer, composed as direct
 * children:
 *
 *   <SiteShell collapseBelow="md">
 *     <SiteShellHeader>
 *       {brand element}
 *       <SiteShellNav>…SiteShellNavItem…</SiteShellNav>
 *       {actions cluster, typically `ms-auto` + SiteShellNavTrigger}
 *     </SiteShellHeader>
 *     <SiteShellMain>…</SiteShellMain>
 *     <SiteShellFooter>…link columns (plain Tailwind grid)…</SiteShellFooter>
 *   </SiteShell>
 *
 * Sibling of AppShell (sidebar application chrome): use SiteShell for
 * public marketing/content pages, AppShell for tool-like product surfaces —
 * docs/LAYOUT.md compares the two.
 *
 * Layout: a `min-h-dvh` column; the document itself scrolls. Below
 * `collapseBelow` the horizontal navigation collapses into a modal drawer
 * (the same Base UI Dialog mechanics as AppShell) opened by
 * SiteShellNavTrigger. The breakpoint is a prop, not a constant — see
 * SiteShellProps.
 *
 * Accessibility: a skip link is always the first focusable element and
 * targets SiteShellMain; regions are landmarks (banner / nav / main /
 * contentinfo); the drawer is a labelled modal dialog with focus trapped
 * inside, Escape and backdrop dismissal, and focus returned to the trigger
 * on close; it also closes itself on route navigation and when the
 * viewport grows past the collapse line.
 *
 * Direction: everything is logical-property based; the shell mirrors under
 * `dir="rtl"` with no conditional logic.
 *
 * Constraints: structural chrome only — no brand, no nav content, no
 * decorative styling; it consumes the base background/border/accent tokens
 * (not the `sidebar-*` set, which belongs to application chrome). Products
 * restyle via className on every part.
 */
export function SiteShell({
  className,
  children,
  skipLinkLabel = "Skip to main content",
  collapseBelow = "md",
  ...props
}: SiteShellProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const pathname = usePathname();

  // Route navigation from a drawer link must dismiss the drawer; state is
  // adjusted during render (the React-sanctioned previous-value pattern),
  // exactly as AppShell does.
  const [previousPathname, setPreviousPathname] = useState(pathname);
  if (pathname !== previousPathname) {
    setPreviousPathname(pathname);
    setOpen(false);
  }

  return (
    <SiteShellContext.Provider value={{ open, setOpen, triggerRef, collapseBelow }}>
      <div
        data-slot="site-shell"
        className={cn("flex min-h-dvh w-full flex-col", className)}
        {...props}
      >
        <SkipLink>{skipLinkLabel}</SkipLink>
        {children}
      </div>
    </SiteShellContext.Provider>
  );
}

export function SiteShellHeader({ className, children, ...props }: SiteShellHeaderProps) {
  return (
    <header
      data-slot="site-shell-header"
      className={cn("sticky top-0 z-40 border-b bg-background", className)}
      {...props}
    >
      {/* The row is capped by Container — bar content must fit inside that
          cap at every width above the collapse line; the e2e overflow sweep
          checks this row against its own box. */}
      <Container data-slot="site-shell-header-row" className="flex h-14 min-w-0 items-center gap-4">
        {children}
      </Container>
    </header>
  );
}

export function SiteShellNav({
  className,
  children,
  label = "Primary",
  closeLabel = "Close navigation",
  ...props
}: SiteShellNavProps) {
  const { open, setOpen, triggerRef, collapseBelow } = useSiteShell("SiteShellNav");
  const collapse = COLLAPSE_CLASSES[collapseBelow];

  // The drawer exists only below the collapse line. If the viewport crosses
  // it while the drawer is open, close it — otherwise CSS hides the popup
  // but the modal scroll lock and focus trap keep governing an invisible
  // dialog (same guard as AppShellSidebar).
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const desktop = window.matchMedia(`(min-width: ${BREAKPOINTS[collapseBelow]})`);
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
  }, [open, setOpen, collapseBelow]);

  return (
    <>
      <nav
        data-slot="site-shell-nav"
        aria-label={label}
        className={cn("flex min-w-0 items-center gap-1", collapse.nav, className)}
        {...props}
      >
        {children}
      </nav>
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay className={collapse.belowOnly} />
          <DialogPrimitive.Popup
            data-slot="site-shell-drawer"
            aria-label={label}
            finalFocus={triggerRef}
            className={cn(
              "fixed inset-y-0 start-0 z-50 flex h-dvh w-72 max-w-[calc(100%-3rem)] flex-col border-e bg-background text-foreground duration-150 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
              collapse.belowOnly,
            )}
          >
            <div className="flex h-14 shrink-0 items-center justify-end border-b px-2">
              <DialogPrimitive.Close
                render={<Button variant="ghost" size="icon-sm" />}
                data-slot="site-shell-drawer-close"
              >
                <XIcon />
                <span className="sr-only">{closeLabel}</span>
              </DialogPrimitive.Close>
            </div>
            {/* Nav children render both here and in the horizontal bar, so
                navigation content must not rely on unique DOM ids. */}
            <nav aria-label={label} className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
              {children}
            </nav>
          </DialogPrimitive.Popup>
        </DialogPortal>
      </DialogPrimitive.Root>
    </>
  );
}

/**
 * One navigation destination. With `href` it is a link that marks the
 * current page via `aria-current`; without `href` it is the "unavailable
 * destination" pattern: non-interactive, non-focusable muted text with an
 * sr-only availability hint — for the destinations every new product has
 * not built yet. Works in both the horizontal bar and the drawer column.
 *
 * Styling is plain text on purpose (the flat identity): no background, no
 * pill, no underline — only weight and color distinguish states. The
 * padding is hit area, not a shape; the radius exists only for the focus
 * ring. The current page is `text-foreground` + semibold; idle links are
 * muted and darken on hover.
 */
export function SiteShellNavItem({
  href,
  unavailableLabel = "Not yet available",
  className,
  children,
}: SiteShellNavItemProps) {
  const pathname = usePathname();
  const base = "flex items-center rounded-md px-3 py-2 text-small font-medium";

  if (href === undefined) {
    return (
      <span
        data-slot="site-shell-nav-item"
        data-unavailable=""
        className={cn(base, "cursor-default text-muted-foreground select-none", className)}
      >
        {children}
        <span className="sr-only"> — {unavailableLabel}</span>
      </span>
    );
  }

  const isCurrent = pathname === href;
  return (
    <Link
      data-slot="site-shell-nav-item"
      href={href}
      aria-current={isCurrent ? "page" : undefined}
      className={cn(
        base,
        "text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        isCurrent && "font-semibold text-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function SiteShellNavTrigger({
  className,
  onClick,
  "aria-label": ariaLabel = "Open navigation",
  ...props
}: SiteShellNavTriggerProps) {
  const { open, setOpen, triggerRef, collapseBelow } = useSiteShell("SiteShellNavTrigger");

  return (
    <Button
      data-slot="site-shell-nav-trigger"
      ref={triggerRef}
      variant="ghost"
      size="icon"
      aria-label={ariaLabel}
      aria-haspopup="dialog"
      aria-expanded={open}
      className={cn(COLLAPSE_CLASSES[collapseBelow].belowOnly, className)}
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

export function SiteShellMain({ className, ...props }: SiteShellMainProps) {
  return (
    <main
      data-slot="site-shell-main"
      id="main-content"
      // Focus target of the skip link; never focusable by Tab.
      tabIndex={-1}
      className={cn("min-w-0 flex-1 outline-none", className)}
      {...props}
    />
  );
}

export function SiteShellFooter({ className, children, ...props }: SiteShellFooterProps) {
  return (
    <footer
      data-slot="site-shell-footer"
      className={cn("border-t bg-background", className)}
      {...props}
    >
      {/* Grouped link columns are the caller's plain Tailwind grid —
          the foundation deliberately ships no Grid wrapper (docs/LAYOUT.md). */}
      <Container className="py-10">{children}</Container>
    </footer>
  );
}
