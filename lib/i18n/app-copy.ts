import { AUTH_COPY, type AuthCopy } from './copy/auth';
import { CHROME_COPY, type ChromeCopy } from './copy/chrome';
import { DASHBOARD_COPY, type DashboardCopy } from './copy/dashboard';
import { EDITOR_COPY, type EditorCopy } from './copy/editor';
import { LOCALES, type Locale } from './locales';

/**
 * Every string the signed-in product shows, composed from one module per area.
 *
 * ## Why not an i18n library
 *
 * `next-intl` and friends add a provider, a message loader, a build step and a runtime
 * format parser. What they buy is pluralisation, interpolation and lazy per-route message
 * chunks. This app needs interpolation — supplied here by functions, which are *typed*, so
 * calling one with the wrong arguments is a build error rather than a mangled sentence —
 * and has three languages of a few hundred strings, which is smaller than the library.
 *
 * ## Why typed objects rather than a key-lookup function
 *
 * `t('dashboard.emptyTitle')` cannot tell you at build time that the German is missing.
 * These can: every area type demands all three languages, so a new string that has not been
 * translated does not compile. That matters more than it sounds — the bug this whole
 * arrangement replaces was German copy that existed, was correct, and rendered in English
 * because one branch asked `locale === 'fr'`. Nothing caught it for weeks.
 */

export type AppCopy = ChromeCopy & DashboardCopy & AuthCopy & EditorCopy;

export const APP_COPY: Record<Locale, AppCopy> = Object.fromEntries(
  LOCALES.map((locale) => [
    locale,
    {
      ...CHROME_COPY[locale],
      ...DASHBOARD_COPY[locale],
      ...AUTH_COPY[locale],
      ...EDITOR_COPY[locale],
    },
  ]),
) as Record<Locale, AppCopy>;

/** The strings for `locale`. Typed, so a missing key is a build error, not a blank label. */
export function appCopy(locale: Locale): AppCopy {
  return APP_COPY[locale];
}
