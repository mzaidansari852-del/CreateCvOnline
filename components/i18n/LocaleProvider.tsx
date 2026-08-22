'use client';

import { createContext, useContext, useEffect, useSyncExternalStore } from 'react';

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

/**
 * The active language, published outside the React tree.
 *
 * Context only flows downwards, and one consumer sits *above* the provider: `ToastProvider`
 * is mounted in the root layout — it has to be, because toasts fire from the marketing
 * pages, the admin console and the payment routes as well as the app — while
 * `LocaleProvider` is mounted per-subtree in the layouts that know who the viewer is. The
 * toast viewport is therefore a sibling of everything localised, and `useCopy()` there
 * would return English in every language while looking perfectly correct in the source.
 *
 * Moving `ToastProvider` down would mean mounting it in five layouts and would throw at
 * runtime on any route that was missed, which is a poor trade for two accessible names. A
 * one-value store is the smaller mechanism: the provider writes to it, anything can read
 * it, and nothing changes position.
 */
let activeLocale: Locale = DEFAULT_LOCALE;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * The language of the subtree the user is actually looking at, for components that cannot
 * be inside `LocaleProvider`.
 *
 * `getServerSnapshot` returns the default so the server and the first client render agree;
 * the real value arrives in the provider's effect. That flash is invisible here because the
 * only consumers are accessible names, which assistive technology reads from the live DOM.
 * Do not reach for this from a component that *can* use `useCopy()` — it is strictly worse,
 * being a render-after-mount rather than a value the server already knew.
 */
export function useActiveLocale(): Locale {
  return useSyncExternalStore(
    subscribe,
    () => activeLocale,
    () => DEFAULT_LOCALE,
  );
}

/**
 * Publishes `locale` to the store above, for a subtree that has no `LocaleProvider`.
 *
 * The provider is mounted by the dashboard, the editor and the payment pages — everything
 * signed-in. The marketing tree has none, because its language comes from the URL and each
 * page already renders in it. That left `activeLocale` at its English default on every
 * public page, so the toast viewport announced "Notifications" on the Dutch site.
 *
 * `SiteHeader` calls this. It is a client component, it is on every public page, and it has
 * already computed the locale from the pathname to choose the nav — so this is one line in
 * the one component that cannot be missed, rather than a provider added to five layouts and
 * forgotten on the sixth.
 */
export function usePublishLocale(locale: Locale): void {
  useEffect(() => {
    activeLocale = locale;
    for (const listener of listeners) listener();
  }, [locale]);
}

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

  usePublishLocale(locale);

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
