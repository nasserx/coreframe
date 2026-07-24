"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { APP_LOCALES, type AppLocale, LOCALE_INFO, type TextDirection } from "@/config";
import {
  createTranslator,
  DEFAULT_CATALOGUE,
  loadCatalogue,
  type Messages,
  type Namespace,
  type Translator,
} from "@/i18n";

const LOCALE_STORAGE_KEY = "locale";

export type LocaleContextValue = Readonly<{
  /** The active locale. */
  locale: AppLocale;
  /** Text direction of the active locale (derived from LOCALE_INFO). */
  direction: TextDirection;
  /** Every locale this deployment was built with (from APP_LOCALES.SUPPORTED). */
  availableLocales: readonly AppLocale[];
  /** Whether a locale switcher makes sense (more than one locale built in). */
  canSwitchLocale: boolean;
  /** Stores the locale, applies its lang/dir, and syncs it to other tabs. */
  setLocale: (locale: AppLocale) => void;
}>;

const LocaleContext = createContext<(LocaleContextValue & { messages: Messages }) | null>(null);

function isSupportedLocale(value: string | null): value is AppLocale {
  return value !== null && (APP_LOCALES.SUPPORTED as readonly string[]).includes(value);
}

/*
 * Runs before paint (inlined ahead of the app tree) so a returning visitor's
 * stored locale sets `<html lang/dir>` with zero flash of the wrong direction —
 * the layout is correct on the very first frame even when the stored locale
 * disagrees with the build-time default. It sets ONLY lang/dir (attributes),
 * never text: the message content still settles on hydration (like the theme
 * class), but direction — the thing a flash would be jarring for — is right
 * immediately. The locale→direction map is baked from LOCALE_INFO at build
 * time, so the single source of truth cannot be contradicted here.
 *
 * Its own try/catch means blocked storage simply leaves the server-rendered
 * default in place. Mirrors THEME_INIT_SCRIPT in theme-provider.tsx.
 */
const LOCALE_DIRECTIONS: Record<string, TextDirection> = Object.fromEntries(
  APP_LOCALES.SUPPORTED.map((locale) => [locale, LOCALE_INFO[locale].direction]),
);
export const LOCALE_INIT_SCRIPT = `(function(){try{var m=${JSON.stringify(
  LOCALE_DIRECTIONS,
)};var l=localStorage.getItem("${LOCALE_STORAGE_KEY}");if(l&&m[l]){document.documentElement.lang=l;document.documentElement.dir=m[l];}}catch(e){}})();`;

function readStoredLocale(): AppLocale {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isSupportedLocale(stored) ? stored : APP_LOCALES.DEFAULT;
  } catch {
    return APP_LOCALES.DEFAULT;
  }
}

/*
 * Preference store: a browser-side module singleton read through
 * useSyncExternalStore, so server rendering (and hydration) always see the
 * build-time default locale — which is exactly what the routes are statically
 * prerendered in — and the markup can never mismatch. localStorage is
 * persistence, not the in-session source of truth. Same pattern as the theme
 * preference store in theme-provider.tsx.
 */
let preference: AppLocale | undefined;
const preferenceListeners = new Set<() => void>();

function getPreferenceSnapshot(): AppLocale {
  preference ??= readStoredLocale();
  return preference;
}

function getServerPreferenceSnapshot(): AppLocale {
  return APP_LOCALES.DEFAULT;
}

function setPreference(next: AppLocale): void {
  preference = next;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    // Storage unavailable: the choice still applies for this session.
  }
  for (const listener of preferenceListeners) {
    listener();
  }
}

function subscribeToPreference(onChange: () => void): () => void {
  preferenceListeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === LOCALE_STORAGE_KEY) {
      preference = readStoredLocale();
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    preferenceListeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/*
 * Catalogue cache: the default catalogue is present synchronously (it is
 * statically bundled); other locales are loaded once via their code-split
 * chunk and memoised here across the whole session, so switching back and
 * forth never refetches.
 */
const catalogueCache = new Map<AppLocale, Messages>([[APP_LOCALES.DEFAULT, DEFAULT_CATALOGUE]]);

export type LocaleProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Locale runtime: the active language, its direction, and its message
 * catalogue, applied as `<html lang/dir>` and consumed via `useTranslations`.
 *
 * - Locale, direction, numerals, and the active catalogue all derive from the
 *   ONE selected locale through `LOCALE_INFO`/the catalogue registry, so they
 *   can never disagree (Arabic messages can never render LTR).
 * - The build-time default locale is what every route is statically
 *   prerendered in. An explicit choice persists in localStorage and syncs
 *   across tabs through the storage event; routes stay statically prerendered
 *   (a cookie would force dynamic rendering — the same trade-off the theme
 *   runtime makes).
 * - SSR/hydration render the default locale; the inline script corrects
 *   `lang`/`dir` before first paint, and a non-default catalogue settles in
 *   right after hydration (text swaps, direction never flashes). The root
 *   `<html>` already sets `suppressHydrationWarning` for the theme class, which
 *   also covers these attributes.
 *
 * Single-locale deployments pay effectively nothing: one catalogue is bundled,
 * no second-locale chunk is ever fetched, and `LocaleControl` renders nothing.
 *
 * Consumers read the runtime through `useLocale()` / `useTranslations()` and
 * must never set `<html dir>` themselves.
 */
export function LocaleProvider({ children }: LocaleProviderProps) {
  const locale = useSyncExternalStore(
    subscribeToPreference,
    getPreferenceSnapshot,
    getServerPreferenceSnapshot,
  );

  // Re-render trigger when a code-split catalogue finishes loading. The cache
  // is the source of truth; this state just forces the read below to re-run.
  const [, setLoadedVersion] = useState(0);
  const messages = catalogueCache.get(locale) ?? DEFAULT_CATALOGUE;

  useEffect(() => {
    if (catalogueCache.has(locale)) {
      return undefined;
    }
    let cancelled = false;
    void loadCatalogue(locale).then((loaded) => {
      catalogueCache.set(locale, loaded);
      if (!cancelled) {
        setLoadedVersion((version) => version + 1);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const direction = LOCALE_INFO[locale].direction;

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [locale, direction]);

  const value = useMemo<LocaleContextValue & { messages: Messages }>(
    () => ({
      locale,
      direction,
      availableLocales: APP_LOCALES.SUPPORTED,
      canSwitchLocale: APP_LOCALES.SUPPORTED.length > 1,
      setLocale: setPreference,
      messages,
    }),
    [locale, direction, messages],
  );

  return (
    <LocaleContext.Provider value={value}>
      <script dangerouslySetInnerHTML={{ __html: LOCALE_INIT_SCRIPT }} />
      {children}
    </LocaleContext.Provider>
  );
}

function useLocaleContext(hook: string): LocaleContextValue & { messages: Messages } {
  const context = useContext(LocaleContext);
  if (context === null) {
    throw new Error(
      `${hook} must be used within LocaleProvider. It is mounted app-wide by AppProvider (src/core/providers/app-provider.tsx); check that your component renders inside the root layout tree.`,
    );
  }
  return context;
}

/**
 * Access the locale runtime: `{ locale, direction, availableLocales,
 * canSwitchLocale, setLocale }`. Render selection state and switchers from
 * here; read `LOCALE_INFO` for a locale's numerals/label.
 */
export function useLocale(): LocaleContextValue {
  const { messages: _messages, ...rest } = useLocaleContext("useLocale");
  return rest;
}

/**
 * A namespace-scoped, type-safe translator bound to the ACTIVE catalogue.
 * Re-renders when the locale (or a just-loaded catalogue) changes, so text
 * follows the switcher. Keys are constrained to the namespace at compile time.
 *
 *   const t = useTranslations("error");
 *   <h2>{t("title")}</h2>
 *   <p>{t("reference", { digest })}</p>
 */
export function useTranslations<NS extends Namespace>(namespace: NS): Translator<NS> {
  const { messages } = useLocaleContext("useTranslations");
  return useMemo(() => createTranslator(messages, namespace), [messages, namespace]);
}

/**
 * Like `useTranslations`, but falls back to the build-time default catalogue
 * when no LocaleProvider is present instead of throwing. Reserved for code that
 * must never fail on a missing provider — chiefly error fallbacks (which may in
 * principle render very high in the tree) and isolated component stories.
 * Prefer `useTranslations` everywhere inside the app tree, where the provider
 * is guaranteed.
 */
export function useOptionalTranslations<NS extends Namespace>(namespace: NS): Translator<NS> {
  const context = useContext(LocaleContext);
  const messages = context?.messages ?? DEFAULT_CATALOGUE;
  return useMemo(() => createTranslator(messages, namespace), [messages, namespace]);
}
