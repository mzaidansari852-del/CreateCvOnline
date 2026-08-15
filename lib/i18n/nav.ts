import { primaryNav, type NavGroup } from '@/lib/site';
import { LOCALES, type Locale } from './locales';

/**
 * The header and footer, per language.
 *
 * The French pages shipped with an English header — "CV Builder", "Templates", "Examples",
 * "Pricing" — sitting above French copy. It reads as a translated page rather than a French
 * product, and it is the first thing on the screen.
 *
 * The French nav is deliberately *shorter* than the English one rather than a translation
 * of it. The English nav's dropdowns point at fourteen guide pages — the ATS guide, the
 * profession guides, the examples — none of which exist in French. Translating their labels
 * would send a French visitor to English pages through a French menu, which is worse than
 * not offering them. So the French nav offers what is actually French: the gallery, its six
 * categories, and the two product pages that are language-neutral enough to work.
 */

/** French labels for the chrome that is not a nav link. */
export const CHROME: Record<Locale, { dashboard: string; newCv: string; signIn: string; menu: string; language: string; other: string }> = {
  en: {
    dashboard: 'Dashboard',
    newCv: 'New CV',
    signIn: 'Sign in',
    menu: 'Menu',
    language: 'Language',
    other: 'Français',
  },
  de: {
    dashboard: 'Mein Bereich',
    newCv: 'Lebenslauf erstellen',
    signIn: 'Anmelden',
    menu: 'Menü',
    language: 'Sprache',
    other: 'English',
  },
  fr: {
    dashboard: 'Mon espace',
    newCv: 'Créer un CV',
    signIn: 'Connexion',
    menu: 'Menu',
    language: 'Langue',
    other: 'English',
  },
};

/**
 * The six categories, written out rather than read from the template registry.
 *
 * `SiteHeader` is a client component and imports this file. Importing the registry here
 * would reach `templates.generated`, which imports all sixty-one CV template components —
 * several hundred kilobytes of server-rendered document code shipped to the browser to
 * populate a dropdown with six links. `tests/lib/i18n.test.ts` checks this list against the
 * registry, so it cannot drift without failing.
 */
const FR_CATEGORIES: { id: string; label: string; slug: string }[] = [
  { id: 'modern', label: 'Modernes', slug: 'moderne' },
  { id: 'corporate', label: 'Entreprise', slug: 'entreprise' },
  { id: 'creative', label: 'Créatifs', slug: 'creatif' },
  { id: 'technology', label: 'Informatique', slug: 'informatique' },
  { id: 'classic', label: 'Classiques', slug: 'classique' },
  { id: 'ats', label: 'Compatibles ATS', slug: 'ats' },
];

export const FR_NAV_CATEGORIES = FR_CATEGORIES;

/** The same six, in German. See the note above for why they are not read from the registry. */
const DE_CATEGORIES: { id: string; label: string; slug: string }[] = [
  { id: 'modern', label: 'Modern', slug: 'modern' },
  { id: 'corporate', label: 'Business', slug: 'business' },
  { id: 'creative', label: 'Kreativ', slug: 'kreativ' },
  { id: 'technology', label: 'IT', slug: 'it' },
  { id: 'classic', label: 'Klassisch', slug: 'klassisch' },
  { id: 'ats', label: 'ATS-tauglich', slug: 'ats' },
];

export const DE_NAV_CATEGORIES = DE_CATEGORIES;

export const NAV_CATEGORIES: Partial<Record<Locale, typeof FR_CATEGORIES>> = {
  fr: FR_CATEGORIES,
  de: DE_CATEGORIES,
};

const DE_NAV: NavGroup[] = [
  {
    label: 'Lebenslauf-Vorlagen',
    href: '/de/lebenslauf-vorlagen',
    links: [
      {
        label: 'Alle Vorlagen',
        href: '/de/lebenslauf-vorlagen',
        description: 'Die vollständige Galerie, alle Stile.',
      },
      ...DE_CATEGORIES.map((category) => ({
        label: category.label,
        href: `/de/lebenslauf-vorlagen/${category.slug}`,
      })),
    ],
  },
  {
    label: 'Preise',
    href: '/de/preise',
    links: [
      { label: 'Preise', href: '/de/preise', description: 'Kostenlos, Pro und einmalig.' },
    ],
  },
];

const FR_NAV: NavGroup[] = [
  {
    label: 'Modèles de CV',
    href: '/fr/modeles-de-cv',
    links: [
      {
        label: 'Tous les modèles',
        href: '/fr/modeles-de-cv',
        description: 'La galerie complète, tous styles confondus.',
      },
      ...FR_CATEGORIES.map((category) => ({
        label: category.label,
        href: `/fr/modeles-de-cv/${category.slug}`,
      })),
    ],
  },
  {
    label: 'Tarifs',
    href: '/fr/tarifs',
    links: [{ label: 'Tarifs', href: '/fr/tarifs', description: 'Gratuit, Pro et accès à vie.' }],
  },
];

/** Footer strings, per language. */
export const FOOTER: Record<Locale, {
  blurb: (count: number) => string;
  browseByCategory: string;
  rights: string;
  strapline: string;
  columns: { label: string; links: { label: string; href: string }[] }[];
}> = {
  en: {
    blurb: (count) =>
      `is an online CV and resume builder with ${count} professional templates, a real-time editor and instant PDF download. Start free — no card, no trial timer.`,
    browseByCategory: 'Browse templates by category',
    rights: 'All rights reserved.',
    strapline: 'create your professional CV online.',
    columns: [],
  },
  de: {
    blurb: (count) =>
      `ist ein Online-Lebenslauf-Generator mit ${count} professionellen Vorlagen, einem Live-Editor und sofortigem PDF-Download. Kostenlos starten — ohne Kreditkarte.`,
    browseByCategory: 'Vorlagen nach Stil',
    rights: 'Alle Rechte vorbehalten.',
    strapline: 'erstellen Sie Ihren Lebenslauf online.',
    columns: [
      {
        label: 'Vorlagen',
        links: [
          { label: 'Alle Vorlagen', href: '/de/lebenslauf-vorlagen' },
          ...DE_CATEGORIES.map((category) => ({
            label: category.label,
            href: `/de/lebenslauf-vorlagen/${category.slug}`,
          })),
        ],
      },
      {
        label: 'Produkt',
        links: [
          { label: 'Preise', href: '/de/preise' },
          { label: 'Lebenslauf erstellen', href: '/register' },
          { label: 'Anmelden', href: '/login' },
        ],
      },
      {
        label: 'Seite',
        links: [
          { label: 'Startseite', href: '/de' },
          { label: 'English site', href: '/' },
        ],
      },
    ],
  },
  fr: {
    blurb: (count) =>
      `est un créateur de CV en ligne : ${count} modèles professionnels, un éditeur en direct et un téléchargement PDF immédiat. Gratuit pour commencer — sans carte bancaire.`,
    browseByCategory: 'Parcourir les modèles par style',
    rights: 'Tous droits réservés.',
    strapline: 'créez votre CV professionnel en ligne.',
    columns: [
      {
        label: 'Modèles',
        links: [
          { label: 'Tous les modèles', href: '/fr/modeles-de-cv' },
          ...FR_CATEGORIES.map((category) => ({
            label: category.label,
            href: `/fr/modeles-de-cv/${category.slug}`,
          })),
        ],
      },
      {
        label: 'Produit',
        links: [
          { label: 'Tarifs', href: '/fr/tarifs' },
          { label: 'Créer un CV', href: '/register' },
          { label: 'Connexion', href: '/login' },
        ],
      },
      {
        label: 'Site',
        links: [
          { label: 'Accueil', href: '/fr' },
          { label: 'English site', href: '/' },
        ],
      },
    ],
  },
};

export function navFor(locale: Locale): NavGroup[] {
  if (locale === 'fr') return FR_NAV;
  if (locale === 'de') return DE_NAV;
  return primaryNav;
}

/**
 * The languages the toggle offers, other than the one you are reading.
 *
 * Three languages means the header can no longer be a single "switch to the other one"
 * link. It lists the alternatives, and only those a given page actually has.
 */
export function otherLocales(locale: Locale): Locale[] {
  return LOCALES.filter((candidate) => candidate !== locale);
}
