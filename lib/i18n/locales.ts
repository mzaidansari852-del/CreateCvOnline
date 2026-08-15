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

export const LOCALES = ['en', 'fr', 'de'] as const;
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
  de: { tag: 'de', ogLocale: 'de_DE', label: 'Deutsch', prefix: '/de' },
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
  '/': { en: '/', fr: '/fr', de: '/de' },
  '/templates': { en: '/templates', fr: '/fr/modeles-de-cv', de: '/de/lebenslauf-vorlagen' },
  '/pricing': { en: '/pricing', fr: '/fr/tarifs', de: '/de/preise' },
  '/templates/modern': {
    en: '/templates/modern',
    fr: '/fr/modeles-de-cv/moderne',
    de: '/de/lebenslauf-vorlagen/modern',
  },
  '/templates/corporate': {
    en: '/templates/corporate',
    fr: '/fr/modeles-de-cv/entreprise',
    de: '/de/lebenslauf-vorlagen/business',
  },
  '/templates/creative': {
    en: '/templates/creative',
    fr: '/fr/modeles-de-cv/creatif',
    de: '/de/lebenslauf-vorlagen/kreativ',
  },
  '/templates/technology': {
    en: '/templates/technology',
    fr: '/fr/modeles-de-cv/informatique',
    de: '/de/lebenslauf-vorlagen/it',
  },
  '/templates/classic': {
    en: '/templates/classic',
    fr: '/fr/modeles-de-cv/classique',
    de: '/de/lebenslauf-vorlagen/klassisch',
  },
  '/templates/ats': {
    en: '/templates/ats',
    fr: '/fr/modeles-de-cv/ats',
    de: '/de/lebenslauf-vorlagen/ats',
  },
};

/** Every path in the map, from either side, so a lookup works in both directions. */
const BY_PATH = new Map<string, Record<Locale, string>>();
for (const group of Object.values(TRANSLATED_PATHS)) {
  for (const path of Object.values(group)) BY_PATH.set(normalisePath(path), group);
}

/**
 * Where a template's detail page lives, per language.
 *
 * The template slugs themselves are not translated — `modern-professional` is the product's
 * name for the design, and inventing a French slug for each of sixty-one would mean two
 * sets of identifiers to keep in step for no search gain, since nobody queries a template
 * by its slug. What is translated is the segment above them, which is the part carrying
 * `modèle de CV`.
 */
export function templatePath(slug: string, locale: Locale): string {
  if (locale === 'fr') return `/fr/modeles-de-cv/${slug}`;
  if (locale === 'de') return `/de/lebenslauf-vorlagen/${slug}`;
  return `/templates/${slug}`;
}

/** The segment each language puts its templates under. */
export const TEMPLATE_ROOT: Record<Locale, string> = {
  en: '/templates',
  fr: '/fr/modeles-de-cv',
  de: '/de/lebenslauf-vorlagen',
};

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
  const normalised = normalisePath(path);
  const listed = BY_PATH.get(normalised);
  if (listed) return listed;

  /*
   * Template detail pages, by rule rather than by sixty-one table rows.
   *
   * Writing them out would mean this file importing the registry, and the registry reaches
   * `templates.generated`, which imports all sixty-one CV components — a dependency this
   * module must not have, because `SiteHeader` is a client component and imports it.
   *
   * The rule cannot produce an `hreflang` to a 404 in practice: both routes call
   * `notFound()` for a slug they do not recognise, so an unknown slug never renders a page
   * that could emit one.
   */
  for (const root of Object.values(TEMPLATE_ROOT)) {
    const match = normalised.startsWith(`${root}/`) ? normalised.slice(root.length + 1) : null;
    if (!match || match.includes('/')) continue;
    if (RESERVED_SLUGS.has(match)) return null;
    return {
      en: templatePath(match, 'en'),
      fr: templatePath(match, 'fr'),
      de: templatePath(match, 'de'),
    };
  }
  return null;
}

/**
 * Slugs that belong to a category page rather than a template, in any language.
 *
 * One flat set rather than one per language, because the rule above only needs to know
 * "is this segment a template slug", and a category slug from any language answers no.
 */
const RESERVED_SLUGS = new Set([
  'modern',
  'corporate',
  'creative',
  'technology',
  'classic',
  'ats',
  'moderne',
  'entreprise',
  'creatif',
  'informatique',
  'classique',
  'business',
  'kreativ',
  'it',
  'klassisch',
]);


