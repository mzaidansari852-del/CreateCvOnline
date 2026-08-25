import { TEMPLATE_COUNT } from './cv/template-registry';
import { publicEnv } from './env';

/**
 * Single source of truth for brand, navigation and marketing copy.
 * Nothing in the app hardcodes the product name or the production URL.
 */

export const site = {
  name: publicEnv.siteName, // "CreateCVOnline"
  legalName: 'CreateCVOnline',
  domain: new URL(publicEnv.siteUrl).host, // "createcvonline.com" in production
  url: publicEnv.siteUrl,
  tagline: 'Create your professional CV online',
  shortDescription:
    'Build a professional, ATS-friendly CV online in minutes with 50+ recruiter-approved templates and instant PDF download.',
  description:
    'CreateCVOnline is an online CV and resume builder with 50+ professional templates, a real-time editor, ATS-friendly layouts and instant PDF download. Start free, no design skills required.',
  founded: '2024',
  supportEmail: 'support@createcvonline.com',
  pressEmail: 'press@createcvonline.com',
  contactAddress: {
    locality: 'Casablanca',
    country: 'MA',
  },
  social: {
    x: 'https://x.com/createcvonline',
    linkedin: 'https://www.linkedin.com/company/createcvonline',
    facebook: 'https://www.facebook.com/createcvonline',
    instagram: 'https://www.instagram.com/createcvonline',
  },
  /** Used by Twitter/X card metadata. */
  twitterHandle: '@createcvonline',
} as const;

/** Absolute URL builder — every canonical, OG and sitemap URL goes through this. */
export function absoluteUrl(path = '/'): string {
  const normalised = path.startsWith('/') ? path : `/${path}`;
  return `${site.url}${normalised === '/' ? '' : normalised.replace(/\/+$/, '')}`;
}

/* -------------------------------------------------------------------------- */
/* Navigation                                                                  */
/* -------------------------------------------------------------------------- */

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  href?: string;
  links: NavLink[];
}

/**
 * Whether a nav group should open a dropdown, or just be a link.
 *
 * The test is not "does it have children" — it is "do those children lead anywhere the
 * label does not already lead". The French and German navs each carry a Pricing group whose
 * single child is the pricing page, which is also the group's own destination, so the header
 * grew a chevron promising a menu and delivering one duplicate of the label above it. The
 * English header shows Pricing as a plain link, so the two languages disagreed about a
 * control that does the same thing in both.
 *
 * Keeping the rule here rather than in the header means the desktop menubar and the mobile
 * sheet cannot answer it differently, which they previously did.
 */
export function navGroupIsMenu(group: NavGroup): boolean {
  return group.links.some((link) => link.href !== group.href);
}

export const primaryNav: NavGroup[] = [
  {
    label: 'CV Builder',
    href: '/cv-builder',
    links: [
      {
        label: 'Online CV builder',
        href: '/cv-builder',
        description: 'The editor, live preview and PDF export explained.',
      },
      {
        label: 'CV maker',
        href: '/cv-maker',
        description: 'Turn an outline into a finished document in one sitting.',
      },
      {
        label: 'Resume builder',
        href: '/resume-builder',
        description: 'US-style resumes with Letter paper and recruiter conventions.',
      },
      {
        label: 'Free CV builder',
        href: '/free-cv-builder',
        description: 'Exactly what the free plan includes — and what it does not.',
      },
    ],
  },
  {
    label: 'Templates',
    href: '/templates',
    links: [
      {
        label: 'All templates',
        href: '/templates',
        // Read from the registry so the count cannot drift when a template is added.
        description: `Browse all ${TEMPLATE_COUNT} designs.`,
      },
      { label: 'CV templates', href: '/cv-templates', description: 'International CV formats.' },
      {
        label: 'Resume templates',
        href: '/resume-templates',
        description: 'One-page, US-market layouts.',
      },
      {
        label: 'ATS CV templates',
        href: '/ats-cv',
        description: 'Parser-safe layouts for applicant tracking systems.',
      },
    ],
  },
  {
    label: 'Examples',
    href: '/cv-examples',
    links: [
      {
        label: 'CV examples',
        href: '/cv-examples',
        description: 'Worked examples by role and career stage.',
      },
      {
        label: 'Resume examples',
        href: '/resume-examples',
        description: 'Before-and-after resume rewrites.',
      },
      {
        label: 'Professional CV guide',
        href: '/professional-cv',
        description: 'What separates a professional CV from an average one.',
      },
      { label: 'Blog', href: '/blog', description: 'Guides on writing, formatting and ATS.' },
    ],
  },
  { label: 'Pricing', href: '/pricing', links: [] },
];

export const footerNav: NavGroup[] = [
  {
    label: 'Product',
    links: [
      { label: 'CV builder', href: '/cv-builder' },
      { label: 'CV maker', href: '/cv-maker' },
      { label: 'Resume builder', href: '/resume-builder' },
      { label: 'Resume maker', href: '/resume-maker' },
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    label: 'Templates',
    links: [
      { label: 'All templates', href: '/templates' },
      { label: 'CV templates', href: '/cv-templates' },
      { label: 'Resume templates', href: '/resume-templates' },
      { label: 'ATS CV templates', href: '/ats-cv' },
      { label: 'ATS resume templates', href: '/ats-resume' },
      { label: 'Professional CV', href: '/professional-cv' },
    ],
  },
  {
    label: 'Learn',
    links: [
      { label: 'CV examples', href: '/cv-examples' },
      { label: 'CV advice by profession', href: '/cv-for' },
      { label: 'Resume examples', href: '/resume-examples' },
      { label: 'Create a CV online', href: '/create-cv-online' },
      { label: 'Free CV builder', href: '/free-cv-builder' },
      { label: 'Blog', href: '/blog' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    label: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of service', href: '/terms' },
      { label: 'Cookie policy', href: '/cookies' },
      { label: 'Refund policy', href: '/refund-policy' },
    ],
  },
];

export const dashboardNav: NavLink[] = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'My CVs', href: '/dashboard/cvs' },
  { label: 'Templates', href: '/dashboard/templates' },
  { label: 'Account', href: '/dashboard/account' },
  { label: 'Settings', href: '/dashboard/settings' },
];

export const adminNav: NavLink[] = [
  { label: 'Overview', href: '/admin' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Templates', href: '/admin/templates' },
  { label: 'Payments', href: '/admin/payments' },
  { label: 'Promo codes', href: '/admin/promo' },
  { label: 'Blog', href: '/admin/blog' },
  { label: 'Settings', href: '/admin/settings' },
];

/* -------------------------------------------------------------------------- */
/* Routing policy                                                              */
/* -------------------------------------------------------------------------- */

/** Prefixes that must never be indexed or listed in the sitemap. */
export const PRIVATE_PATH_PREFIXES = [
  '/dashboard',
  '/admin',
  '/account',
  '/login',
  '/register',
  '/forgot-password',
  '/verify-email',
  '/payment',
  '/print',
  '/api',
] as const;

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
