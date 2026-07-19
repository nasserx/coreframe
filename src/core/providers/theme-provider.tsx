"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

const THEME_STORAGE_KEY = "theme";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export type ThemeContextValue = Readonly<{
  /** The user's stored preference. "system" until an explicit choice is made. */
  theme: ThemePreference;
  /** The theme actually applied to the document — never "system". */
  resolvedTheme: ResolvedTheme;
  /** Stores the preference, applies it, and syncs it to other tabs. */
  setTheme: (theme: ThemePreference) => void;
}>;

const ThemeContext = createContext<ThemeContextValue | null>(null);

/*
 * Runs before paint (rendered as an inline script ahead of the app tree) so
 * the initial HTML gets the correct theme class with zero flash in all three
 * states — including a stored preference that disagrees with the OS. The
 * storage read has its own try/catch so blocked storage still falls back to
 * the system preference. Must stay in sync with the resolution logic below.
 *
 * Exported for exactly one other consumer: `src/app/global-error.tsx`
 * replaces the root layout (and with it this provider), so it inlines the
 * same script to keep the stored/system theme correct on the error page.
 */
export const THEME_INIT_SCRIPT = `(function(){var t=null;try{t=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}try{document.documentElement.classList.toggle("dark",t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches))}catch(e){}})();`;

/**
 * Runtime equivalent of THEME_INIT_SCRIPT, for the one place the script
 * cannot run: `global-error.tsx` swapped in by a CLIENT-side render error.
 * A script element injected through dangerouslySetInnerHTML executes only
 * when server-rendered, and React recreates `<html>` during the swap,
 * discarding the `dark` class the original document carried — so the error
 * page re-applies the stored/system theme from an effect.
 */
export function applyStoredTheme(): void {
  const stored = readStoredTheme();
  try {
    document.documentElement.classList.toggle(
      "dark",
      stored === "dark" ||
        (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches),
    );
  } catch {
    // matchMedia unavailable: leave the server-rendered (light) default.
  }
}

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function readStoredTheme(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

/*
 * Preference store: a browser-side module singleton (the same pattern as the
 * query client in query-provider.tsx) read through useSyncExternalStore, so
 * server rendering always sees the "system" default and hydration can never
 * mismatch. localStorage is persistence, not the in-session source of truth —
 * when storage is unavailable (private mode, blocked) the in-memory value
 * still drives the session and only persistence is lost.
 */
let preference: ThemePreference | undefined;
const preferenceListeners = new Set<() => void>();

function getPreferenceSnapshot(): ThemePreference {
  preference ??= readStoredTheme();
  return preference;
}

function getServerPreferenceSnapshot(): ThemePreference {
  return "system";
}

function setPreference(next: ThemePreference): void {
  preference = next;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Storage unavailable: the choice still applies for this session.
  }
  for (const listener of preferenceListeners) {
    listener();
  }
}

function subscribeToPreference(onChange: () => void): () => void {
  preferenceListeners.add(onChange);
  // The storage event only fires in *other* tabs, which is exactly the
  // cross-tab sync channel; same-tab updates flow through setPreference.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === THEME_STORAGE_KEY) {
      preference = readStoredTheme();
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    preferenceListeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function subscribeToSystemTheme(onChange: () => void): () => void {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", onChange);
  return () => {
    query.removeEventListener("change", onChange);
  };
}

function getSystemSnapshot(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getServerSystemSnapshot(): boolean {
  return false;
}

export type ThemeProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Theme runtime: three states ("light" | "dark" | "system") applied as the
 * `dark` class on `<html>`, which drives the CSS variable system (see
 * `src/styles` and docs/DESIGN_TOKENS.md §5).
 *
 * - "system" tracks the OS preference live via matchMedia.
 * - Explicit choices persist in localStorage and sync across tabs through
 *   the storage event; routes stay statically prerendered (a cookie would
 *   let the server know the theme but forces dynamic rendering).
 * - SSR: the server renders no theme class; the inline script corrects the
 *   class before first paint, so the root `<html>` element must set
 *   `suppressHydrationWarning`.
 *
 * Consumers read the runtime through `useTheme()` and must never toggle the
 * `dark` class themselves.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useSyncExternalStore(
    subscribeToPreference,
    getPreferenceSnapshot,
    getServerPreferenceSnapshot,
  );
  const systemPrefersDark = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemSnapshot,
    getServerSystemSnapshot,
  );

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? (systemPrefersDark ? "dark" : "light") : theme;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme: setPreference }),
    [theme, resolvedTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Access the theme runtime: `{ theme, resolvedTheme, setTheme }`.
 *
 * `theme` is the user's preference (may be "system"); `resolvedTheme` is what
 * is actually applied ("light" | "dark") — render selection state from the
 * former, theme-dependent visuals from the latter.
 *
 * Hydration safety: on the server and during hydration both values are the
 * defaults ("system" / "light"); they settle to the real values immediately
 * after hydration, so server and client markup never diverge. The document's
 * `dark` class itself is always correct before first paint via the inline
 * script.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error(
      "useTheme must be used within ThemeProvider. It is mounted app-wide by AppProvider (src/core/providers/app-provider.tsx); check that your component renders inside the root layout tree.",
    );
  }
  return context;
}
