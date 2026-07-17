"use client";

import { type ReactNode, useEffect } from "react";

/*
 * Runs before paint (rendered as an inline script ahead of the app tree) so
 * the initial HTML gets the correct theme class without a flash of the wrong
 * theme. Must stay in sync with the effect below.
 */
const THEME_INIT_SCRIPT =
  '(function(){try{document.documentElement.classList.toggle("dark",window.matchMedia("(prefers-color-scheme: dark)").matches);}catch(e){}})();';

export type ThemeProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Applies the runtime theme by managing the `dark` class on `<html>`, which
 * drives the CSS variable system (see `src/styles`). Foundation scope is
 * system preference only: the OS setting decides the theme and live changes
 * are tracked via `matchMedia`.
 *
 * SSR: the server renders no theme class; an inline script corrects the
 * class before first paint, so the root `<html>` element must set
 * `suppressHydrationWarning`.
 *
 * Extension points (not implemented by design): explicit user preference,
 * persistence, and a theme context belong here when a product needs them —
 * consumers should never toggle the `dark` class themselves.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.classList.toggle("dark", query.matches);
    };
    apply();
    query.addEventListener("change", apply);
    return () => {
      query.removeEventListener("change", apply);
    };
  }, []);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      {children}
    </>
  );
}
