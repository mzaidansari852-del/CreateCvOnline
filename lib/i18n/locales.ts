/**
 * Locales, and the map between the paths that mean the same thing.
 *
 * ## Why this exists at all
 *
 * The audit recorded that "the i18n architecture already exists". It does not. There was a
 * `locale` field on the user profile, unused by anything that renders, and `lang="en"`
 * hardcoded in the root layout. Nothing else — no routing, no dictionaries, no `hreflang`.
 * This file is the architecture, built from nothing, and it is worth saying so plainly
 * because the next person will otherwise go looking for the rest of it.
 *
 * ## Why a path map rather than a prefix
 *
 * The cheap way to add a language is `/fr/templates` — the English route with a prefix on
 * the front. It is also the wrong way here, because the whole reason to build a French
 * site is that `modèle de CV` is a term with demand and no strong incumbent. A URL that
 * says `templates` to a French searcher throws away the one signal the page had.
 *
 * So each localised page declares its own path, and the pairing between them lives here.
 * That pairing is what makes `hreflang` reciprocal *by construction* rather than by
 * remembering: `alternatesFor()` reads the same map from either side, so a page cannot
 * point at a translation that does not point back. Google ignores non-reciprocal
 * annotations entirely, which is the failure mode that looks like it is working.
 */

export const LOCALES = ['en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_META: Record<
  Locale,
  {
    /** BCP-47 tag for `lang`, `hreflang` and `Intl`. */
    tag: string;
    /** Open Graph wants `fr_FR`, not `fr`. */
    ogLocale: string;
    /** Endonym — what speakers of the language call it, for the language switcher. */
    label: string;
    /** URL prefix. Empty for the default locale: `/pricing`, not `/en/pricing`. */
    prefix: string;
  }
> = {
  en: { tag: 'en', ogLocale: 'en_US', label: 'English', prefix: '' },
  fr: { tag: 'fr', ogLocale: 'fr_FR', label: 'Français', prefix: '/fr' },
};

/**
 * Pages that exist in both languages, keyed by the English path.
 *
 * Only the pages that are actually translated belong here. An entry for a page that does
 * not exist in French produces an `hreflang` pointing at a 404, which is worse than no
 * annotation at all — so this map grows one line at a time as pages are written, and the
 * test suite checks every path in it actually resolves.
 */
export const TRANSLATED_PATHS: Record<string, Record<Locale, string>> = {
  '/': { en: '/', fr: '/fr' },
  '/templates': { en: '/templates', fr: '/fr/modeles-de-cv' },
  '/templates/modern': { en: '/templates/modern', fr: '/fr/modeles-de-cv/moderne' },
  '/templates/corporate': { en: '/templates/corporate', fr: '/fr/modeles-de-cv/entreprise' },
  '/templates/creative': { en: '/templates/creative', fr: '/fr/modeles-de-cv/creatif' },
  '/templates/technology': { en: '/templates/technology', fr: '/fr/modeles-de-cv/informatique' },
  '/templates/classic': { en: '/templates/classic', fr: '/fr/modeles-de-cv/classique' },
  '/templates/ats': { en: '/templates/ats', fr: '/fr/modeles-de-cv/ats' },
};

/** Every path in the map, from either side, so a lookup works in both directions. */
const BY_PATH = new Map<string, Record<Locale, string>>();
for (const group of Object.values(TRANSLATED_PATHS)) {
  for (const path of Object.values(group)) BY_PATH.set(normalisePath(path), group);
}

/** Trailing slashes and casing are not meaningful here; `/fr/` and `/fr` are one page. */
export function normalisePath(path: string): string {
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  const trimmed = withSlash.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/** The locale a path belongs to, read from its prefix. */
export function localeOf(path: string): Locale {
  const normalised = normalisePath(path);
  for (const locale of LOCALES) {
    const { prefix } = LOCALE_META[locale];
    if (prefix && (normalised === prefix || normalised.startsWith(`${prefix}/`))) return locale;
  }
  return DEFAULT_LOCALE;
}

/**
 * The other language versions of this page, including itself.
 *
 * Returns `null` when the page is not translated. That is the common case and it must stay
 * cheap to express: an untranslated page should carry no `hreflang` at all rather than one
 * that claims a French version exists.
 */
export function alternatesFor(path: string): Record<Locale, string> | null {
  return BY_PATH.get(normalisePath(path)) ?? null;
}
