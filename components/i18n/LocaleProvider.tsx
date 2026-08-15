'use client';

import { createContext, useContext } from 'react';

import { appCopy, type AppCopy } from '@/lib/i18n/app-copy';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/locales';

/**
 * The app's language, handed down from the server layout that resolved it.
 *
 * Resolved on the server rather than in the browser on purpose. The alternative — a client
 * effect that reads the profile and re-renders — means every authenticated page paints in
 * English first and then flips, which is worse than being in the wrong language: the flash
 * is on every navigation, and it lands after the user has started reading.
 *
 * There is no fetching, no suspense and no message loading here. The whole catalogue is a
 * few kilobytes of strings that gzip well, so it is imported directly; a lazy per-route
 * loader would cost a network round trip to save less than one preview image.
 */

interface LocaleValue {
  locale: Locale;
  copy: AppCopy;
}

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  // Recomputed only when the locale actually changes — `appCopy` is a table lookup, so
  // memoising the object costs more than it saves, but the wrapper object should be stable.
  const value: LocaleValue = { locale, copy: appCopy(locale) };
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/**
 * The current app language and its strings.
 *
 * Falls back to English outside a provider rather than throwing. A `useAuth`-style throw is
 * right when the missing context means the component cannot work; here it would mean a
 * button somewhere renders in English instead of French, and taking the whole page down
 * over that is the wrong trade. The fallback is visible in development because the string
 * is simply English.
 */
export function useCopy(): AppCopy {
  return useContext(LocaleContext)?.copy ?? appCopy(DEFAULT_LOCALE);
}

/** The current app language on its own, for the few places that need the tag itself. */
export function useLocale(): Locale {
  return useContext(LocaleContext)?.locale ?? DEFAULT_LOCALE;
}
