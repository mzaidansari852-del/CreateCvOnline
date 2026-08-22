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

/**
 * Labels for the chrome that is not a nav link.
 *
 * The last five keys exist because the mobile header did not use this object at all. Its
 * drawer hardcoded "Go to dashboard", "Sign out", "Create my CV — free", "Sign in" and
 * "Open menu" in English, so every French and German visitor on a phone — which is most of
 * them — got a French page with an English menu inside it, while the desktop header two
 * breakpoints away was correctly translated. Nothing typed the mobile strings, so nothing
 * noticed. They are keys now, which means the next language cannot forget them.
 */
export const CHROME: Record<
  Locale,
  {
    dashboard: string;
    newCv: string;
    signIn: string;
    menu: string;
    language: string;
    other: string;
    openMenu: string;
    closeMenu: string;
    goToDashboard: string;
    signOut: string;
    createFree: string;
    /*
     * Accessible names for the two `<nav>` landmarks.
     *
     * They were the literals "Main" and "Mobile". A screen-reader user on a Dutch page
     * heard an English landmark name announced for the primary navigation of a page that
     * is otherwise entirely in Dutch — and "Mobile" was never a good name in any language:
     * it describes the breakpoint that reveals the menu, not what the menu is.
     */
    mainNavLabel: string;
    mobileNavLabel: string;
    /*
     * The rest of the accessible names on a marketing page. None of these is visible, and
     * all of them were English on every translated page — the logo link, the footer
     * landmark, the category nav inside it, and the "opens in a new tab" warning on the
     * social icons. An audit that only reads the visible copy never finds them.
     */
    homeLabel: (brand: string) => string;
    footerNavLabel: string;
    footerCategoriesLabel: string;
    newTab: (label: string) => string;
    /** First focusable element on the page. See `components/layout/SkipLink.tsx`. */
    skipToContent: string;
  }
> = {
  en: {
    dashboard: 'Dashboard',
    newCv: 'New CV',
    signIn: 'Sign in',
    menu: 'Menu',
    language: 'Language',
    other: 'Français',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    goToDashboard: 'Go to dashboard',
    signOut: 'Sign out',
    createFree: 'Create my CV — free',
    mainNavLabel: 'Main',
    mobileNavLabel: 'Site navigation',
    homeLabel: (brand) => `${brand} home`,
    footerNavLabel: 'Footer',
    footerCategoriesLabel: 'Templates by category',
    newTab: (label) => `${label} (opens in a new tab)`,
    skipToContent: 'Skip to main content',
  },
  de: {
    dashboard: 'Mein Bereich',
    newCv: 'Lebenslauf erstellen',
    signIn: 'Anmelden',
    menu: 'Menü',
    language: 'Sprache',
    other: 'English',
    openMenu: 'Menü öffnen',
    closeMenu: 'Menü schließen',
    goToDashboard: 'Zu meinem Bereich',
    signOut: 'Abmelden',
    createFree: 'Lebenslauf erstellen — kostenlos',
    mainNavLabel: 'Hauptnavigation',
    mobileNavLabel: 'Seitennavigation',
    homeLabel: (brand) => `${brand} Startseite`,
    footerNavLabel: 'Fußzeile',
    footerCategoriesLabel: 'Vorlagen nach Stil',
    newTab: (label) => `${label} (wird in einem neuen Tab geöffnet)`,
    skipToContent: 'Zum Hauptinhalt springen',
  },
  fr: {
    dashboard: 'Mon espace',
    newCv: 'Créer un CV',
    signIn: 'Connexion',
    menu: 'Menu',
    language: 'Langue',
    other: 'English',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    goToDashboard: 'Aller à mon espace',
    signOut: 'Se déconnecter',
    createFree: 'Créer mon CV — gratuitement',
    mainNavLabel: 'Navigation principale',
    mobileNavLabel: 'Navigation du site',
    homeLabel: (brand) => `${brand} — accueil`,
    footerNavLabel: 'Pied de page',
    footerCategoriesLabel: 'Modèles par style',
    newTab: (label) => `${label} (ouvre un nouvel onglet)`,
    skipToContent: 'Aller au contenu principal',
  },
  nl: {
    dashboard: 'Mijn omgeving',
    newCv: 'CV maken',
    signIn: 'Inloggen',
    menu: 'Menu',
    language: 'Taal',
    other: 'English',
    openMenu: 'Menu openen',
    closeMenu: 'Menu sluiten',
    goToDashboard: 'Naar mijn omgeving',
    signOut: 'Uitloggen',
    createFree: 'Maak mijn cv — gratis',
    mainNavLabel: 'Hoofdnavigatie',
    mobileNavLabel: 'Sitenavigatie',
    homeLabel: (brand) => `${brand} — home`,
    footerNavLabel: 'Voettekst',
    footerCategoriesLabel: 'Sjablonen op stijl',
    newTab: (label) => `${label} (opent in een nieuw tabblad)`,
    skipToContent: 'Naar de hoofdinhoud',
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

/** The same six, in Dutch. */
const NL_CATEGORIES: { id: string; label: string; slug: string }[] = [
  { id: 'modern', label: 'Modern', slug: 'modern' },
  { id: 'corporate', label: 'Zakelijk', slug: 'zakelijk' },
  { id: 'creative', label: 'Creatief', slug: 'creatief' },
  { id: 'technology', label: 'IT', slug: 'it' },
  { id: 'classic', label: 'Klassiek', slug: 'klassiek' },
  { id: 'ats', label: 'ATS-vriendelijk', slug: 'ats' },
];

export const NL_NAV_CATEGORIES = NL_CATEGORIES;

export const NAV_CATEGORIES: Partial<Record<Locale, typeof FR_CATEGORIES>> = {
  fr: FR_CATEGORIES,
  de: DE_CATEGORIES,
  nl: NL_CATEGORIES,
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

/**
 * The French nav, now that French is more than a gallery and a price list.
 *
 * The note at the top of this file explains why the French nav was deliberately shorter
 * than the English one: its dropdowns pointed at fourteen guide pages that did not exist in
 * French, and a French menu leading to English pages is worse than a menu that does not
 * offer them. That constraint is what has changed — the builder, maker, online, free and
 * ATS pages are French pages now, so they belong in the French menu. What is still absent
 * is still absent on purpose: the blog, the role examples and the profession guides remain
 * English-only and remain unlinked from here.
 */
const FR_NAV: NavGroup[] = [
  {
    label: 'Créer un CV',
    href: '/fr/creer-un-cv',
    links: [
      {
        label: 'Créateur de CV en ligne',
        href: '/fr/creer-un-cv',
        description: 'L’éditeur, l’aperçu en direct et l’export PDF.',
      },
      {
        label: 'Faire un CV',
        href: '/fr/faire-un-cv',
        description: 'D’une page blanche à un CV fini en une séance.',
      },
      {
        label: 'CV en ligne',
        href: '/fr/cv-en-ligne',
        description: 'Rédiger, mettre en forme et télécharger depuis le navigateur.',
      },
      {
        label: 'CV gratuit',
        href: '/fr/cv-gratuit',
        description: 'Ce que l’offre gratuite comprend — et ce qu’elle ne comprend pas.',
      },
    ],
  },
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
      {
        label: 'Exemples de CV',
        href: '/fr/exemples-de-cv',
        description: 'Des CV complets à reprendre section par section.',
      },
      {
        label: 'CV compatible ATS',
        href: '/fr/cv-ats',
        description: 'Les mises en page que les logiciels de recrutement lisent sans erreur.',
      },
    ],
  },
  {
    label: 'Fonctionnalités',
    href: '/fr/fonctionnalites',
    links: [
      {
        label: 'Fonctionnalités',
        href: '/fr/fonctionnalites',
        description: 'Tout ce que fait l’éditeur.',
      },
    ],
  },
  {
    label: 'Tarifs',
    href: '/fr/tarifs',
    links: [{ label: 'Tarifs', href: '/fr/tarifs', description: 'Gratuit, Pro et accès à vie.' }],
  },
];

const NL_NAV: NavGroup[] = [
  {
    label: 'CV-sjablonen',
    href: '/nl/cv-sjablonen',
    links: [
      {
        label: 'Alle sjablonen',
        href: '/nl/cv-sjablonen',
        description: 'De volledige galerij, alle stijlen.',
      },
      ...NL_CATEGORIES.map((category) => ({
        label: category.label,
        href: `/nl/cv-sjablonen/${category.slug}`,
      })),
    ],
  },
  {
    label: 'Prijzen',
    href: '/nl/prijzen',
    links: [
      { label: 'Prijzen', href: '/nl/prijzen', description: 'Gratis, Pro en eenmalig.' },
    ],
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
          { label: 'Créer un CV', href: '/fr/creer-un-cv' },
          { label: 'Faire un CV', href: '/fr/faire-un-cv' },
          { label: 'CV en ligne', href: '/fr/cv-en-ligne' },
          { label: 'CV gratuit', href: '/fr/cv-gratuit' },
          { label: 'Fonctionnalités', href: '/fr/fonctionnalites' },
          { label: 'Tarifs', href: '/fr/tarifs' },
        ],
      },
      {
        label: 'Ressources',
        links: [
          { label: 'Exemples de CV', href: '/fr/exemples-de-cv' },
          { label: 'CV compatible ATS', href: '/fr/cv-ats' },
          { label: 'Questions fréquentes', href: '/fr/faq' },
          { label: 'À propos', href: '/fr/a-propos' },
          { label: 'Contact', href: '/fr/contact' },
        ],
      },
      {
        label: 'Site',
        links: [
          { label: 'Accueil', href: '/fr' },
          { label: 'Confidentialité', href: '/fr/confidentialite' },
          { label: 'Conditions générales', href: '/fr/conditions-generales' },
          { label: 'Cookies', href: '/fr/cookies' },
          { label: 'Remboursement', href: '/fr/remboursement' },
          { label: 'English site', href: '/' },
        ],
      },
    ],
  },
  nl: {
    blurb: (count) =>
      `is een cv-maker voor online gebruik: ${count} professionele sjablonen, een editor met live voorbeeld en meteen een pdf. Gratis beginnen — zonder creditcard.`,
    browseByCategory: 'Sjablonen op stijl',
    rights: 'Alle rechten voorbehouden.',
    strapline: 'maak je professionele cv online.',
    columns: [
      {
        label: 'Sjablonen',
        links: [
          { label: 'Alle sjablonen', href: '/nl/cv-sjablonen' },
          ...NL_CATEGORIES.map((category) => ({
            label: category.label,
            href: `/nl/cv-sjablonen/${category.slug}`,
          })),
        ],
      },
      {
        label: 'Product',
        links: [
          { label: 'Prijzen', href: '/nl/prijzen' },
          { label: 'CV maken', href: '/register' },
          { label: 'Inloggen', href: '/login' },
        ],
      },
      {
        label: 'Site',
        links: [
          { label: 'Home', href: '/nl' },
          { label: 'English site', href: '/' },
        ],
      },
    ],
  },
};

export function navFor(locale: Locale): NavGroup[] {
  if (locale === 'fr') return FR_NAV;
  if (locale === 'de') return DE_NAV;
  if (locale === 'nl') return NL_NAV;
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
