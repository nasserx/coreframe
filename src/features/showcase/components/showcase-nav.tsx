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
        className="flex h-9 items-center gap-2 rounded-md px-3 text-small font-semibold hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                  "flex h-8 items-center rounded-md px-3 text-small text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
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
