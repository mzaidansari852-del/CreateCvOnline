import { TEMPLATE_CATEGORIES } from '@/lib/cv/template-registry';
import { primaryNav, type NavGroup } from '@/lib/site';
import { DEFAULT_LOCALE, type Locale } from './locales';

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
  fr: {
    dashboard: 'Mon espace',
    newCv: 'Créer un CV',
    signIn: 'Connexion',
    menu: 'Menu',
    language: 'Langue',
    other: 'English',
  },
};

/** French category slugs, kept here so the nav does not import an app route folder. */
const FR_CATEGORY_SLUG: Record<string, string> = {
  modern: 'moderne',
  corporate: 'entreprise',
  creative: 'creatif',
  technology: 'informatique',
  classic: 'classique',
  ats: 'ats',
};

const FR_CATEGORY_LABEL: Record<string, string> = {
  modern: 'Modernes',
  corporate: 'Entreprise',
  creative: 'Créatifs',
  technology: 'Informatique',
  classic: 'Classiques',
  ats: 'Compatibles ATS',
};

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
      ...TEMPLATE_CATEGORIES.map((category) => ({
        label: FR_CATEGORY_LABEL[category.id] ?? category.label,
        href: `/fr/modeles-de-cv/${FR_CATEGORY_SLUG[category.id] ?? category.slug}`,
      })),
    ],
  },
  {
    label: 'Tarifs',
    href: '/pricing',
    links: [{ label: 'Tarifs', href: '/pricing', description: 'Gratuit, Pro et accès à vie.' }],
  },
];

export function navFor(locale: Locale): NavGroup[] {
  return locale === 'fr' ? FR_NAV : primaryNav;
}

/** Where the language toggle in the header should point, given the page you are on. */
export function otherLocale(locale: Locale): Locale {
  return locale === 'fr' ? DEFAULT_LOCALE : 'fr';
}
