import type { Metadata } from 'next';

import { TEMPLATE_COUNT } from '@/lib/cv/template-registry';
import { DEFAULT_LOCALE, LOCALE_META, alternatesFor, localesIn } from '@/lib/i18n/locales';
import type { Locale } from '@/lib/i18n/locales';
import { absoluteUrl, site } from '@/lib/site';
import { publicEnv } from '@/lib/env';

/**
 * Metadata helpers.
 *
 * Every public page builds its metadata through `pageMetadata` so that canonical URLs,
 * Open Graph, Twitter cards and robots directives are consistent and impossible to forget.
 * Nothing hardcodes the production domain — it all derives from `NEXT_PUBLIC_SITE_URL`.
 */

export interface PageMetaInput {
  title: string;
  description: string;
  /** Site-relative path, e.g. `/cv-templates`. Used for the canonical URL. */
  path: string;
  /** Overrides the generated OG image. */
  image?: string;
  /** Search keywords. Used sparingly — modern engines mostly ignore this. */
  keywords?: string[];
  /** Set for pages that must not be indexed. */
  noindex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  /**
   * The language this page is written in. Defaults to English.
   *
   * Setting it does three things at once: `og:locale`, the `hreflang` block, and the
   * `x-default`. They are one input because they are one fact, and splitting them is how
   * a page ends up announcing `fr_FR` to Facebook and `en` to Google.
   */
  locale?: Locale;
}

/** Title template: `Page title | CreateCVOnline`, with the home page using the raw title. */
export function pageTitle(title: string): string {
  return title.includes(site.name) ? title : `${title} | ${site.name}`;
}

export function ogImageUrl(title: string, subtitle?: string): string {
  const params = new URLSearchParams({ title });
  if (subtitle) params.set('subtitle', subtitle);
  return absoluteUrl(`/api/og?${params.toString()}`);
}

export function pageMetadata(input: PageMetaInput): Metadata {
  const url = absoluteUrl(input.path);
  const title = pageTitle(input.title);
  const image = input.image ?? ogImageUrl(input.title, site.tagline);
  const locale = input.locale ?? DEFAULT_LOCALE;

  /*
   * `hreflang`, built from the path map rather than from anything this page knows.
   *
   * Google requires the annotations to be reciprocal — if the English page names a French
   * alternate, the French page must name the English one back, or the whole cluster is
   * discarded. Deriving both sides from one table is the only version of that guarantee
   * that survives someone adding a page in a hurry.
   *
   * `x-default` points at English: it is the fallback for a searcher whose language we do
   * not publish, which is most of them.
   */
  const group = alternatesFor(input.path);
  const languages = group
    ? {
        ...Object.fromEntries(
          localesIn(group).map((code) => [LOCALE_META[code].tag, absoluteUrl(group[code]!)]),
        ),
        'x-default': absoluteUrl(group[DEFAULT_LOCALE]),
      }
    : undefined;

  return {
    // `absolute` bypasses the root layout's `%s | CreateCVOnline` template. Without it
    // the brand is appended twice, because `pageTitle` has already added it.
    title: { absolute: title },
    description: input.description,
    keywords: input.keywords?.length ? input.keywords : undefined,
    alternates: { canonical: url, languages },
    robots: input.noindex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      type: input.type ?? 'website',
      url,
      siteName: site.name,
      title,
      description: input.description,
      locale: LOCALE_META[locale].ogLocale,
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
      ...(input.type === 'article'
        ? {
            publishedTime: input.publishedTime,
            modifiedTime: input.modifiedTime,
            authors: input.authors,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      site: site.twitterHandle,
      creator: site.twitterHandle,
      title,
      description: input.description,
      images: [image],
    },
  };
}

/** Root metadata: applied to every page and overridden per route. */
export function rootMetadata(): Metadata {
  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name} — Create Your Professional CV Online`,
      template: `%s | ${site.name}`,
    },
    description: site.description,
    applicationName: site.name,
    generator: 'Next.js',
    referrer: 'strict-origin-when-cross-origin',
    authors: [{ name: site.name, url: site.url }],
    creator: site.name,
    publisher: site.name,
    formatDetection: { email: false, address: false, telephone: false },
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: '32x32' },
      ],
      apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
    },
    manifest: '/manifest.webmanifest',
    alternates: { canonical: site.url },
    openGraph: {
      type: 'website',
      url: site.url,
      siteName: site.name,
      title: `${site.name} — Create Your Professional CV Online`,
      description: site.shortDescription,
      locale: 'en_US',
      images: [
        {
          url: ogImageUrl(
            'Create your professional CV online',
            `${TEMPLATE_COUNT} templates · ATS-friendly · Free to start`,
          ),
          width: 1200,
          height: 630,
          alt: site.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: site.twitterHandle,
      title: `${site.name} — Create Your Professional CV Online`,
      description: site.shortDescription,
    },
    verification: publicEnv.googleSiteVerification
      ? { google: publicEnv.googleSiteVerification }
      : undefined,
    category: 'business',
  };
}

/**
 * Metadata for private areas: never indexed, no social preview.
 *
 * The canonical is explicitly removed rather than left to inherit. Without this, every
 * signed-in and auth page would declare the *homepage* as its canonical URL — a merge
 * artefact of the root layout's `alternates.canonical`, and exactly the kind of quiet
 * wrong signal that is hard to spot by eye.
 */
export function privateMetadata(title: string, description?: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: null },
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  };
}
