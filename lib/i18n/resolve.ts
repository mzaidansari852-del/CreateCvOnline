import { DEFAULT_LOCALE, LOCALES, type Locale } from './locales';

/**
 * Working out what language the signed-in product should be in.
 *
 * The marketing site answers this from the URL — `/fr/modeles-de-cv` is French because it
 * says so. The app cannot: `/dashboard` is one route for everybody, and duplicating every
 * private route under `/fr` and `/de` would triple the surface for no benefit, since none
 * of it is indexable and none of it competes for search traffic.
 *
 * So the app resolves language from two places, in order:
 *
 *   1. `profile.locale` — the account setting, which follows the user across devices.
 *   2. the `locale` cookie — what the *site* was last browsed in.
 *
 * The cookie is what makes signing up work. Someone who reads the French marketing pages
 * and clicks "Créer mon CV" has no profile yet, so `/register` has nothing to read; the
 * cookie carries their language across the sign-up boundary and becomes the initial
 * `profile.locale`. Without it, every French visitor would land in an English dashboard
 * and have to find the switcher — which is exactly the complaint that prompted this.
 */

/** The cookie the proxy writes when a visitor is on a localised marketing path. */
export const LOCALE_COOKIE = 'cvo_locale';

/**
 * A year. The cookie is a preference, not a session — someone who reads the German pages
 * in March and signs up in June should still get a German dashboard.
 */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Narrows an untrusted string to a `Locale`, or `null` if it is not one. */
export function parseLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;
  return (LOCALES as readonly string[]).includes(value) ? (value as Locale) : null;
}

/**
 * The language to render the app in.
 *
 * Both inputs are optional and both are untrusted — the cookie is client-writable, and a
 * profile written before `locale` was an enum may hold anything. An unrecognised value
 * falls through rather than throwing: the worst outcome of a bad cookie should be an
 * English page, not a crash on every authenticated route.
 */
export function resolveLocale(input: {
  profileLocale?: string | null;
  cookieLocale?: string | null;
}): Locale {
  return parseLocale(input.profileLocale) ?? parseLocale(input.cookieLocale) ?? DEFAULT_LOCALE;
}

/**
 * The best guess at a visitor's language from their browser, used only when nothing else
 * is known — a first visit to `/register` from a link, with no cookie and no profile.
 *
 * Deliberately crude. It reads the primary tag of each entry and takes the first one we
 * support, ignoring q-values: the ordering of `Accept-Language` already expresses
 * preference in practice, and mis-ranking a header is a smaller error than shipping a
 * parser for a field this rarely decisive. Region is dropped, so `de-AT` counts as German.
 */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;
  for (const entry of header.split(',')) {
    const tag = entry.split(';')[0]?.trim().toLowerCase();
    const primary = tag?.split('-')[0];
    const match = parseLocale(primary);
    if (match) return match;
  }
  return null;
}
