"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ComponentProps, ReactNode, RefObject } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon, MenuIcon, XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { NavigationMenu } from "@base-ui/react/navigation-menu";

import { useDocumentDirection } from "@/hooks/use-document-direction";
import { useScrolled } from "@/hooks/use-scrolled";
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
  scrolled: boolean;
}>;

const SiteShellContext = createContext<SiteShellContextValue | null>(null);

function useSiteShell(caller: string): SiteShellContextValue {
  const context = useContext(SiteShellContext);
  if (context === null) {
    throw new Error(`${caller} must be rendered inside <SiteShell>.`);
  }
  return context;
}

// Nav children render in two surfaces — the horizontal bar and the mobile
// drawer — so a dropdown has to know which one it is in: a floating panel in
// the bar, a labelled group in the drawer. SiteShellNav stamps this on each
// render; SiteShellNavItem ignores it (it renders the same in both), only
// SiteShellNavMenu reads it.
type SiteShellNavSurface = "bar" | "drawer";

const SiteShellNavSurfaceContext = createContext<SiteShellNavSurface>("bar");

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

export type SiteShellNavMenuProps = Readonly<{
  /**
   * Trigger label in the bar; doubles as the group heading in the drawer.
   * Keep it a short string so both presentations read cleanly.
   */
  label: ReactNode;
  className?: string;
  /** SiteShellNavMenuItem children — the panel's sub-destinations. */
  children: ReactNode;
}>;

export type SiteShellNavMenuItemProps = Readonly<{
  /**
   * Destination. Omit it for a destination that does not exist yet: the item
   * renders as non-interactive, non-focusable muted text with an sr-only hint
   * — the same honesty rule as SiteShellNavItem, applied inside the panel.
   */
  href?: string;
  /** The item's label line (reads as the bold title against the description). */
  title: ReactNode;
  /** One-line muted supporting line beneath the title. */
  description?: ReactNode;
  /** sr-only availability hint for href-less items; localize at the call site. */
  unavailableLabel?: string;
  className?: string;
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
  const { sentinelRef, scrolled } = useScrolled();

  // Route navigation from a drawer link must dismiss the drawer; state is
  // adjusted during render (the React-sanctioned previous-value pattern),
  // exactly as AppShell does.
  const [previousPathname, setPreviousPathname] = useState(pathname);
  if (pathname !== previousPathname) {
    setPreviousPathname(pathname);
    setOpen(false);
  }

  return (
    <SiteShellContext.Provider value={{ open, setOpen, triggerRef, collapseBelow, scrolled }}>
      <div
        data-slot="site-shell"
        className={cn("flex min-h-dvh w-full flex-col", className)}
        {...props}
      >
        {/* Scroll sentinel for the header boundary (see SiteShellHeader):
            absolutely positioned at the document top, zero layout impact. */}
        <div ref={sentinelRef} aria-hidden="true" className="absolute top-0 h-px w-px" />
        <SkipLink>{skipLinkLabel}</SkipLink>
        {children}
      </div>
    </SiteShellContext.Provider>
  );
}

export function SiteShellHeader({ className, children, ...props }: SiteShellHeaderProps) {
  const { scrolled } = useSiteShell("SiteShellHeader");

  return (
    <header
      data-slot="site-shell-header"
      data-scrolled={scrolled ? "" : undefined}
      // The hairline under the bar appears only once the page has
      // scrolled: at position zero, bar and page are one surface. The
      // border is always present (transparent at top), so its arrival
      // never shifts layout; only border-color transitions.
      className={cn(
        "sticky top-0 z-40 border-b border-transparent bg-background transition-colors data-scrolled:border-border",
        className,
      )}
      {...props}
    >
      {/* The row is capped by Container — bar content must fit inside that
          cap at every width above the collapse line; the e2e overflow sweep
          checks this row against its own box. */}
      <Container data-slot="site-shell-header-row" className="flex h-16 min-w-0 items-center gap-4">
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
        <SiteShellNavSurfaceContext.Provider value="bar">
          {children}
        </SiteShellNavSurfaceContext.Provider>
      </nav>
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay className={collapse.belowOnly} />
          <DialogPrimitive.Popup
            data-slot="site-shell-drawer"
            aria-label={label}
            finalFocus={triggerRef}
            className={cn(
              "fixed inset-y-0 start-0 z-50 flex h-dvh w-72 max-w-[calc(100%-3rem)] flex-col border-e bg-background text-foreground duration-(--motion-moderate) outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
              collapse.belowOnly,
            )}
          >
            <div className="flex h-16 shrink-0 items-center justify-end border-b px-2">
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
              <SiteShellNavSurfaceContext.Provider value="drawer">
                {children}
              </SiteShellNavSurfaceContext.Provider>
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
 * pill, no underline — weight and color distinguish states on a three-step
 * ladder that keeps nav items subordinate to the (larger, bolder) brand:
 *
 *   - idle link    → `text-foreground` + `font-medium`; on hover it
 *                    LIGHTENS to `text-muted-foreground` (the item recedes
 *                    under the cursor rather than lighting up).
 *   - current page → `text-foreground` + `font-bold` (`aria-current`).
 *                    Weight is what marks it: idle links already sit at
 *                    full foreground strength, so color cannot carry
 *                    current — and weight, unlike an underline, does not
 *                    fight a dropdown menu opening beneath the item. Idle is
 *                    medium (500) rather than normal so a primary nav element
 *                    does not read as thin; current is bold (700), keeping the
 *                    same 200-unit weight gap that makes current unambiguous
 *                    (medium-vs-semibold alone was too subtle to carry it).
 *   - unavailable  → `text-muted-foreground` + `font-normal`, muted at
 *                    rest so it reads distinct from a full-strength idle
 *                    link; non-interactive, non-focusable, sr-only hint.
 *
 * Hover is color-only (no moving/growing element) so an item can later
 * host a dropdown trigger without the affordance fighting the menu.
 * Items sit at `text-small`. The padding is hit area, not a shape; the
 * radius exists only for the focus ring.
 */
export function SiteShellNavItem({
  href,
  unavailableLabel = "Not yet available",
  className,
  children,
}: SiteShellNavItemProps) {
  const pathname = usePathname();
  const base = "flex items-center rounded-md px-3 py-2 text-small";

  if (href === undefined) {
    return (
      <span
        data-slot="site-shell-nav-item"
        data-unavailable=""
        className={cn(
          base,
          "cursor-default font-normal text-muted-foreground select-none",
          className,
        )}
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
        // Idle: full-strength foreground at medium weight (a primary
        // interactive element should not read as thin), lightening
        // (receding) on hover. Current: same color, distinguished by weight
        // — see the component doc for why weight, not color or an underline,
        // carries current.
        "font-medium text-foreground transition-colors outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isCurrent && "font-bold hover:text-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/**
 * A nav item that opens a dropdown panel of sub-destinations. Built on Base
 * UI's NavigationMenu — a navigation/disclosure primitive, NOT a `role="menu"`
 * menubar: its trigger is a disclosure button (`aria-expanded`/`aria-controls`,
 * managed by the primitive) and the panel holds real links, which is what a
 * list of page destinations is. A menu role would mis-announce links as
 * commands and impose menuitem arrow-key semantics that fight browser link
 * behaviour. The primitive owns focus management, outside-press and Escape
 * dismissal with focus return, and ARIA wiring — none of it is hand-rolled.
 *
 * Interaction: the panel opens on hover AND on click/tap (Base UI's default,
 * with a short delay that stops accidental opens while sweeping the bar), so
 * pointer users get it instantly and touch users — where hover does not exist
 * — still get it on tap; keyboard opens with Enter/Space, traverses with
 * Tab/arrows, and Escape closes and returns focus to the trigger. The trigger
 * has no destination of its own (it only discloses the panel), so its role is
 * unambiguous.
 *
 * Presentation: in the bar it is a floating popover panel (popover surface,
 * hairline ring, floating-layer elevation) laid out as two columns of
 * title+description items; below the collapse breakpoint the same children
 * render in the drawer as a labelled group with an indented list — grouped,
 * never a flat dump of every sub-item. Content is supplied by the consumer;
 * the primitive stays content-agnostic.
 *
 * Motion: the chevron rotates on open and the panel fades in with a slight
 * downward slide (transform/opacity only — never a layout-affecting property,
 * and never a translate on the trigger itself, which would jitter and fight
 * the panel opening directly beneath it). Both collapse under
 * `prefers-reduced-motion` via the global rule.
 *
 * Direction: the panel is told the live document direction through a Base UI
 * DirectionProvider (its positioning cannot read the DOM `dir`), so it aligns
 * to the correct inline edge in RTL; the two-column grid reorders via the
 * normal CSS direction cascade.
 */
export function SiteShellNavMenu({ label, className, children }: SiteShellNavMenuProps) {
  const surface = useContext(SiteShellNavSurfaceContext);

  if (surface === "drawer") {
    return (
      <div data-slot="site-shell-nav-menu" className={cn("flex flex-col", className)}>
        {/* Collapsed presentation: the trigger label becomes a group heading
            and the sub-destinations render as an indented list — grouped and
            labelled, so the drawer never receives a flat dump of sub-items. */}
        <p className="px-3 pt-2 pb-1 text-caption font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <ul className="flex flex-col">{children}</ul>
      </div>
    );
  }

  return (
    <SiteShellNavMenuBar label={label} className={className}>
      {children}
    </SiteShellNavMenuBar>
  );
}

function SiteShellNavMenuBar({
  label,
  className,
  children,
}: {
  label: ReactNode;
  className: string | undefined;
  children: ReactNode;
}) {
  const direction = useDocumentDirection();

  return (
    <DirectionProvider direction={direction}>
      <NavigationMenu.Root
        data-slot="site-shell-nav-menu"
        // Rendered as display:contents rather than the default <nav>: the sole
        // navigation landmark is the enclosing SiteShellNav, and `contents`
        // lets the trigger sit inline in the bar's flex row like a plain item.
        render={<div className="contents" />}
      >
        <NavigationMenu.List render={<div className="contents" />}>
          <NavigationMenu.Item render={<div className="contents" />}>
            <NavigationMenu.Trigger
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-2 text-small font-medium text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                className,
              )}
            >
              {label}
              {/* A downward chevron is symmetric under RTL — no per-icon flip.
                  It rotates to point up while the panel is open. */}
              <NavigationMenu.Icon className="flex transition-transform duration-(--motion-quick) data-popup-open:rotate-180">
                <ChevronDownIcon className="size-4" />
              </NavigationMenu.Icon>
            </NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <ul className="grid w-[34rem] max-w-[calc(100vw-2rem)] grid-cols-2 gap-1">
                {children}
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>

        <NavigationMenu.Portal>
          <NavigationMenu.Positioner
            side="bottom"
            align="start"
            sideOffset={8}
            collisionPadding={16}
          >
            <NavigationMenu.Popup className="relative z-50 rounded-xl bg-popover p-2 text-popover-foreground shadow-lg ring-1 ring-border transition-[opacity,transform] duration-(--motion-moderate) outline-none data-ending-style:-translate-y-1 data-ending-style:opacity-0 data-starting-style:-translate-y-1 data-starting-style:opacity-0">
              <NavigationMenu.Viewport className="relative" />
            </NavigationMenu.Popup>
          </NavigationMenu.Positioner>
        </NavigationMenu.Portal>
      </NavigationMenu.Root>
    </DirectionProvider>
  );
}

/**
 * One sub-destination inside a SiteShellNavMenu: a title with an optional
 * one-line muted description. With `href` it is a link (marking the current
 * page); without `href` it is the unavailable-destination pattern —
 * non-interactive, non-focusable muted text with an sr-only hint, so it is
 * also skipped in the tab order. Renders correctly in both the bar panel and
 * the drawer group.
 */
export function SiteShellNavMenuItem({
  href,
  title,
  description,
  unavailableLabel = "Not yet available",
  className,
}: SiteShellNavMenuItemProps) {
  const surface = useContext(SiteShellNavSurfaceContext);
  const pathname = usePathname();

  if (href === undefined) {
    return (
      <li>
        <span
          data-slot="site-shell-nav-menu-item"
          data-unavailable=""
          className={cn(
            "flex cursor-default flex-col gap-0.5 rounded-md p-3 text-muted-foreground select-none",
            className,
          )}
        >
          <span className="text-small font-normal">{title}</span>
          {description !== undefined && <span className="truncate text-small">{description}</span>}
          <span className="sr-only"> — {unavailableLabel}</span>
        </span>
      </li>
    );
  }

  const isCurrent = pathname === href;
  const cardClass = cn(
    "flex flex-col gap-0.5 rounded-md p-3 text-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
    className,
  );
  const lockup = (
    <>
      <span className="text-small font-medium">{title}</span>
      {description !== undefined && (
        <span className="truncate text-small text-muted-foreground">{description}</span>
      )}
    </>
  );

  // In the drawer the item is a plain link (no NavigationMenu context there);
  // in the bar it is a NavigationMenu.Link so the primitive manages roving
  // focus, activation, and current-page marking within the panel.
  if (surface === "drawer") {
    return (
      <li>
        <Link
          data-slot="site-shell-nav-menu-item"
          href={href}
          aria-current={isCurrent ? "page" : undefined}
          className={cn(cardClass, "aria-[current=page]:font-bold")}
        >
          {lockup}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <NavigationMenu.Link
        data-slot="site-shell-nav-menu-item"
        render={<Link href={href} />}
        active={isCurrent}
        className={cn(cardClass, "data-active:font-bold")}
      >
        {lockup}
      </NavigationMenu.Link>
    </li>
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
