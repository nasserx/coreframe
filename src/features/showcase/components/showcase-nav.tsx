"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandMark } from "@/components/ui/brand-mark";
import { cn } from "@/lib/utils";

import { SHOWCASE_SECTIONS } from "../showcase-sections";

/**
 * Sidebar navigation content for the showcase's AppShell: brand lockup plus
 * the section list. Rendered by AppShellSidebar in both the persistent
 * sidebar and the mobile drawer; active-state styling uses the sidebar
 * accent tokens, and the current page is exposed via aria-current.
 */
export function ShowcaseNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-2 p-3">
      <Link
        href="/showcase"
        aria-current={pathname === "/showcase" ? "page" : undefined}
        className="flex h-9 items-center gap-2 rounded-md px-3 text-small font-bold outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
      >
        <BrandMark className="size-4.5" />
        Foundation Showcase
      </Link>
      <ul className="flex flex-col gap-1">
        {SHOWCASE_SECTIONS.map((section) => {
          const isActive = pathname === section.href;
          return (
            <li key={section.href}>
              <Link
                href={section.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  // Idle nav sits at font-medium (500), matching the SiteShell
                  // nav rule that a primary nav element should not read thin;
                  // the active row is carried by the stronger neutral
                  // accent-selected fill (not a weight change), so it stays
                  // 500 too (docs/DESIGN_TOKENS.md § Weight scale).
                  "flex h-8 items-center rounded-md px-3 text-small font-medium text-sidebar-foreground/80 outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                  isActive && "bg-accent-selected text-sidebar-accent-foreground",
                )}
              >
                {section.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
