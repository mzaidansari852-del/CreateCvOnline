import { TEMPLATE_ROOT, TRANSLATED_PATHS, type Locale } from './locales';

/**
 * The shape of a commercial landing page, and the chrome that surrounds one.
 *
 * ## Why this is shared rather than per language
 *
 * The French set was written first as `FrLanding` + `FrenchLandingPage`, on the reasoning
 * that eight near-identical 400-line page files is eight places to get a schema field or an
 * `hreflang`-relevant path wrong individually. That reasoning does not stop at one language.
 * Copying the shell for German and again for Dutch would have produced three renderers to
 * keep in step, and the whole point was to have one.
 *
 * So the *shape* lives here and the *words* live per language. A structural fix now lands on
 * every locale at once, and adding the fourth costs a copy file and nothing else.
 */

export interface LandingStep {
  title: string;
  body: string;
}

export interface Landing {
  /** The canonical path. Must match this locale's entry in `TRANSLATED_PATHS`. */
  path: string;
  breadcrumb: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  heading: string;
  lede: string;
  ctaPrimary?: string;
  badges?: string[];
  stats?: { value: string; label: string }[];
  steps?: { title: string; items: LandingStep[] };
  /** Emit `HowTo` structured data. Only true where the steps really are instructions. */
  howTo?: boolean;
  features?: {
    title: string;
    description?: string;
    columns?: 2 | 3 | 4;
    items: LandingStep[];
  };
  prose?: { heading: string; paragraphs: string[] }[];
  showTemplates?: boolean;
  faqTitle?: string;
  faq: { question: string; answer: string }[];
  related: { label: string; href: string; description?: string }[];
}

/** The surrounding chrome: the words and destinations that are the same on every landing page. */
export interface LandingShell {
  locale: Locale;
  homeLabel: string;
  homePath: string;
  galleryPath: string;
  pricingPath: string;
  galleryHeading: string;
  galleryLede: string;
  browseCta: string;
  allTemplates: string;
  relatedTitle: string;
  faqTitle: string;
  cta: { primary: string; title: string; description: string; secondary: string };
}

/**
 * What each language calls its own home page in a breadcrumb.
 *
 * Not derived from the nav, which labels it with the product name rather than the word
 * "home" — a breadcrumb reading `CreateCVOnline › Créer un CV` says the site's name twice
 * and the position once.
 */
const HOME_LABEL: Record<Locale, string> = {
  en: 'Home',
  fr: 'Accueil',
  de: 'Startseite',
  nl: 'Home',
};

/**
 * The subset of a locale's copy object that the shell needs.
 *
 * Structural, not nominal: `FR`, `DE` and `NL` are three separate `as const` objects that
 * happen to share this shape, and typing the parameter by shape rather than by union means
 * a fourth language satisfies it by being written correctly, not by being added here.
 */
export interface LandingCopySource {
  gallery: { heading: string; lede: string; ctaPrimary: string };
  related: { title: string; allTemplates: string };
  cta: { primary: string; title: string; description: string; secondary: string };
  home: { faqTitle: string };
}

/**
 * Builds the shell for `locale` from that language's copy object.
 *
 * The three paths come from the path map rather than from literals, so a landing page's
 * breadcrumb and its CTA cannot drift from the URLs `hreflang` and the sitemap use. That
 * mattered enough to be worth the indirection: those are exactly the links a reader follows
 * out of the page, and a wrong one is invisible until someone clicks it.
 */
export function landingShell(locale: Locale, copy: LandingCopySource): LandingShell {
  return {
    locale,
    homeLabel: HOME_LABEL[locale],
    homePath: TRANSLATED_PATHS['/']![locale]!,
    galleryPath: TEMPLATE_ROOT[locale],
    pricingPath: TRANSLATED_PATHS['/pricing']![locale]!,
    galleryHeading: copy.gallery.heading,
    galleryLede: copy.gallery.lede,
    browseCta: copy.gallery.ctaPrimary,
    allTemplates: copy.related.allTemplates,
    relatedTitle: copy.related.title,
    faqTitle: copy.home.faqTitle,
    cta: copy.cta,
  };
}
