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

/**
 * The theme runtime is two-state and concrete. There is no `"system"` value:
 * the operating-system preference is an *initialization input* (below), never
 * an interactive state a consumer can select, store, or render.
 */
export type Theme = "light" | "dark";

export type ThemeContextValue = Readonly<{
  /** The applied theme — always concrete, never a preference placeholder. */
  theme: Theme;
  /** Stores the choice, applies it, and syncs it to other tabs. */
  setTheme: (theme: Theme) => void;
}>;

const ThemeContext = createContext<ThemeContextValue | null>(null);

/*
 * Runs before paint (rendered as an inline script ahead of the app tree) so the
 * initial HTML gets the correct theme class with zero flash — including a
 * stored choice that disagrees with the OS. Storage decides only when it holds
 * a concrete `"light"`/`"dark"`; anything else (absent, garbage, or a LEGACY
 * `"system"` written by the previous three-state runtime) falls through to a
 * one-time `prefers-color-scheme` read. The script deliberately WRITES nothing:
 * a system-derived value is not a user choice and must not become one merely
 * because a page loaded. Its own try/catch means blocked storage still resolves.
 *
 * `color-scheme` needs no separate handling — `src/styles/light.css` and
 * `dark.css` declare it alongside the semantic variables, so toggling this one
 * class moves the browser's native surfaces with the theme.
 *
 * Must stay in sync with `resolveInitialTheme` below; the theme-provider tests
 * assert both resolve identically. Exported for exactly one other consumer:
 * `src/app/global-error.tsx` replaces the root layout (and with it this
 * provider), so it inlines the same script.
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
  document.documentElement.classList.toggle("dark", resolveInitialTheme() === "dark");
}

/**
 * The stored *explicit* choice, or `null` when there is none.
 *
 * `"system"` is read as `null` on purpose. The previous three-state runtime
 * persisted it, so it exists in returning visitors' storage; treating it as an
 * explicit state would resurrect the mode this control no longer exposes.
 * Migration is therefore implicit and lossless — the legacy value simply means
 * "no choice yet", and the next toggle overwrites it with a concrete one.
 */
function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

function prefersDark(): boolean {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    // matchMedia unavailable: fall back to the statically rendered default.
    return false;
  }
}

/**
 * Resolved ONCE per session, on the first snapshot read. The OS preference is
 * consulted only when no explicit choice exists, and the result is not written
 * back to storage — so a visitor who never touches the control keeps following
 * their OS across visits, while one who has chosen keeps their choice.
 *
 * Reading it once is also what makes the value stable for
 * `useSyncExternalStore`: a snapshot that re-derived from `matchMedia` on every
 * call could change identity mid-render.
 */
function resolveInitialTheme(): Theme {
  return readStoredTheme() ?? (prefersDark() ? "dark" : "light");
}

/*
 * Theme store: a browser-side module singleton (the same pattern as the query
 * client in query-provider.tsx) read through useSyncExternalStore, so server
 * rendering always sees the statically prerendered default and hydration can
 * never mismatch. localStorage is persistence, not the in-session source of
 * truth — when storage is unavailable (private mode, blocked) the in-memory
 * value still drives the session and only persistence is lost.
 */
let currentTheme: Theme | undefined;
const themeListeners = new Set<() => void>();

function getThemeSnapshot(): Theme {
  currentTheme ??= resolveInitialTheme();
  return currentTheme;
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

function setStoredTheme(next: Theme): void {
  currentTheme = next;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Storage unavailable: the choice still applies for this session.
  }
  for (const listener of themeListeners) {
    listener();
  }
}

function subscribeToTheme(onChange: () => void): () => void {
  themeListeners.add(onChange);
  // The storage event only fires in *other* tabs, which is exactly the
  // cross-tab sync channel; same-tab updates flow through setStoredTheme.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === THEME_STORAGE_KEY) {
      // A cleared key legitimately returns this tab to the system fallback.
      currentTheme = resolveInitialTheme();
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    themeListeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export type ThemeProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Theme runtime: one concrete theme ("light" | "dark") applied as the `dark`
 * class on `<html>`, which drives the CSS variable system (see `src/styles` and
 * docs/DESIGN_TOKENS.md §5).
 *
 * - The OS preference initializes the session when no explicit choice is
 *   stored, and is then left alone: a later OS change does not restyle a page
 *   the visitor is already reading. There is no live `matchMedia` subscription.
 * - Explicit choices persist in localStorage and sync across tabs through the
 *   storage event; routes stay statically prerendered (a cookie would let the
 *   server know the theme but forces dynamic rendering).
 * - SSR: the server renders no theme class; the inline script corrects the
 *   class before first paint, so the root `<html>` element must set
 *   `suppressHydrationWarning`.
 *
 * Consumers read the runtime through `useTheme()` and must never toggle the
 * `dark` class themselves.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme: setStoredTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Access the theme runtime: `{ theme, setTheme }`.
 *
 * `theme` is always the concrete applied theme, so selection UI and
 * theme-dependent visuals read the same value — there is no preference/resolved
 * split to reconcile, because there is no non-concrete preference.
 *
 * Hydration safety: on the server and during hydration the value is the
 * statically prerendered default ("light"); it settles to the resolved theme
 * immediately after hydration, so server and client markup never diverge. The
 * document's `dark` class itself is always correct before first paint via the
 * inline script.
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
