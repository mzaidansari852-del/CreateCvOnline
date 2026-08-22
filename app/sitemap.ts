import type { MetadataRoute } from 'next';

import { getAllCategories, getAllPosts } from '@/lib/blog';
import { getAllExampleSlugs } from '@/lib/cv-examples';
import { getAllProfessionSlugs } from '@/lib/professions';
import { PREVIEW_LOCALES, PREVIEW_SLUGS } from '@/lib/cv/previews';
import { TEMPLATES, TEMPLATE_CATEGORIES, templatesByCategory } from '@/lib/cv/template-registry';
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_META,
  TRANSLATED_PATHS,
  localesIn,
  templatePath,
} from '@/lib/i18n/locales';
import { absoluteUrl, isPrivatePath } from '@/lib/site';

/**
 * The sitemap.
 *
 * Built from the same sources the pages are: the template registry, the blog content
 * layer and one explicit list of static routes. Nothing is hand-maintained, so a new
 * template or article is in the sitemap the moment it exists.
 *
 * Every entry is filtered through `isPrivatePath`, which is the single definition of
 * "must never be indexed" shared with `robots.ts`. A dashboard or admin URL cannot leak
 * in here by accident.
 *
 * ## Why almost nothing here has a `lastmod`
 *
 * Every entry used to carry `new Date()` — the moment of the build. That is not a date on
 * which anything changed; it is a date on which the site was deployed, and it was stamped
 * identically onto all ~140 URLs whether or not a word of them had moved. Google's
 * documented behaviour is that it uses `lastmod` "if it's consistently and verifiably (for
 * example by comparing to the last modification of the page) accurate" — a claim that all
 * 140 pages changed at 03:14 on Tuesday fails that check the first time it is tested, and
 * the element is then discounted for the whole site, including the entries where it was
 * true.
 *
 * The mtime of the source file is no better: git does not record mtimes, so a CI checkout
 * gives every file the timestamp of the clone. That is the same lie with extra steps.
 *
 * So `lastmod` appears only where a real editorial date exists — the blog, where posts
 * carry `publishedAt` and `updatedAt` in their own source. Everywhere else it is omitted.
 * An absent `lastmod` costs a recrawl hint on pages that change a few times a year; a
 * wrong one costs the hint on the pages that change weekly. If template and guide pages
 * ever grow a real "last reviewed" field, this is where it plugs in.
 *
 * ## Images
 *
 * Entries carry `images`, which Next renders as `<image:image>` nodes in the standard
 * image-sitemap namespace. This is how a picture of a CV gets into Google Images: the
 * previews are lazily loaded and several screens down, so image discovery via crawl alone
 * is slow and partial. Only images that genuinely appear on the page in question are
 * listed — the card asset on the gallery and category pages, the full-size asset on the
 * template's own page — because an image sitemap that lists images the page does not show
 * is exactly the kind of inaccuracy that gets a signal ignored.
 */

const previewSet = new Set(PREVIEW_SLUGS);

/** The 520px asset used in every grid. */
function cardImage(slug: string): string | null {
  return previewSet.has(slug) ? absoluteUrl(`/previews/${slug}-card.webp`) : null;
}

/** The 1000px asset used once, at the top of the template's own page. */
function fullImage(slug: string): string | null {
  return previewSet.has(slug) ? absoluteUrl(`/previews/${slug}.webp`) : null;
}

function imagesFor(templates: { slug: string }[]): string[] {
  return templates
    .map((template) => cardImage(template.slug))
    .filter((url): url is string => url !== null);
}

interface Entry {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
}

const STATIC_ROUTES: Entry[] = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },

  // High-intent landing pages.
  { path: '/cv-builder', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/cv-maker', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/create-cv-online', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/resume-builder', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/resume-maker', priority: 0.85, changeFrequency: 'weekly' },
  { path: '/cv-templates', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/resume-templates', priority: 0.85, changeFrequency: 'weekly' },
  { path: '/professional-cv', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/ats-cv', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/ats-resume', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/free-cv-builder', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/cv-examples', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/cv-for', priority: 0.85, changeFrequency: 'monthly' },
  /*
   * Search Console shows this site at position 27 and 30 for "how to write a good cv with no
   * work experience" and "cv for no work experience template" — without a page for either.
   * That intent was buried inside a blog post and a profession guide; the priority reflects
   * demand that is already measured rather than demand that is hoped for.
   */
  { path: '/cv-no-experience', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/resume-examples', priority: 0.8, changeFrequency: 'monthly' },

  // Product and company.
  { path: '/templates', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/pricing', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/features', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'yearly' },

  // Legal.
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/cookies', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/refund-policy', priority: 0.3, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of STATIC_ROUTES) {
    if (isPrivatePath(route.path)) continue;
    entries.push({
      url: absoluteUrl(route.path),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      // The gallery is the one static route that is a page of pictures.
      ...(route.path === '/templates' ? { images: imagesFor(TEMPLATES) } : {}),
    });
  }

  // One page per category. These are real static paths served by the `[slug]` route,
  // not `?category=` query views — a query string is a weaker crawl signal and cannot
  // carry its own copy.
  for (const category of TEMPLATE_CATEGORIES) {
    entries.push({
      url: absoluteUrl(`/templates/${category.slug}`),
      changeFrequency: 'monthly',
      priority: 0.75,
      images: imagesFor(templatesByCategory(category.id)),
    });
  }

  // One page per template.
  for (const template of TEMPLATES) {
    const image = fullImage(template.slug);
    entries.push({
      url: absoluteUrl(`/templates/${template.slug}`),
      changeFrequency: 'monthly',
      priority: template.premium ? 0.6 : 0.7,
      ...(image ? { images: [image] } : {}),
    });
  }

  /*
   * The French pages.
   *
   * Eight, not seventy-four. The template detail pages are deliberately *not* translated
   * yet: audit item 3.5 records a first-party case where publishing ~284 pages at once on
   * a new domain cut impressions 75%, and this domain already shipped ~118 in one go. The
   * eight pages here are the ones that carry the terms the audit found unclaimed —
   * `modèle de CV`, `modèle de CV gratuit`, and the six style variants. Once those index,
   * the sixty-one detail pages are a known-good follow-up rather than a gamble.
   *
   * Each carries `alternates.languages`, which is how Google associates the French page
   * with its English counterpart rather than reading the two as duplicates.
   */
  for (const [path, group] of Object.entries(TRANSLATED_PATHS)) {
    const published = localesIn(group);
    for (const locale of published) {
      if (locale === DEFAULT_LOCALE) continue;
      entries.push({
        url: absoluteUrl(group[locale]!),
        changeFrequency: 'weekly',
        priority: path === '/' ? 0.9 : 0.75,
        alternates: {
          languages: Object.fromEntries(
            published.map((code) => [LOCALE_META[code].tag, absoluteUrl(group[code]!)]),
          ),
        },
      });
    }
  }

  /*
   * The French template pages.
   *
   * The eight pages above were held back from the sixty-one detail pages on the
   * launch-velocity reasoning in audit 3.5. Those sixty-one are now published too, and the
   * distinction that makes it a different bet: these are not new *content*, they are the
   * second language of pages Google has already been crawling for months, each one
   * `hreflang`-paired to an indexed English page rather than arriving unattached.
   */
  for (const template of TEMPLATES) {
    for (const locale of LOCALES) {
      if (locale === DEFAULT_LOCALE) continue;
      entries.push({
        url: absoluteUrl(templatePath(template.slug, locale)),
        changeFrequency: 'monthly',
        priority: template.premium ? 0.55 : 0.65,
        // The localised image, not the English one: Google Images is a separate surface,
        // and the picture on a German page really is a different picture.
        // Only where that language's image set has actually been generated — an image
        // sitemap listing files that 404 is worse than one that lists fewer.
        ...(PREVIEW_SLUGS.includes(template.slug) && PREVIEW_LOCALES.includes(locale)
          ? { images: [absoluteUrl(`/previews/${locale}/${template.slug}.webp`)] }
          : {}),
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((code) => [
              LOCALE_META[code].tag,
              absoluteUrl(templatePath(template.slug, code)),
            ]),
          ),
        },
      });
    }
  }

  // One guide per profession.
  for (const slug of getAllProfessionSlugs()) {
    entries.push({
      url: absoluteUrl(`/cv-for/${slug}`),
      changeFrequency: 'monthly',
      priority: 0.75,
    });
  }

  // One worked example per role.
  for (const slug of getAllExampleSlugs()) {
    entries.push({
      url: absoluteUrl(`/cv-examples/${slug}`),
      changeFrequency: 'monthly',
      priority: 0.75,
    });
  }

  // Blog. The only pages with a real, authored modification date.
  for (const post of getAllPosts()) {
    entries.push({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.updatedAt || post.publishedAt),
      changeFrequency: 'yearly',
      priority: 0.65,
    });
  }

  for (const category of getAllCategories()) {
    entries.push({
      url: absoluteUrl(`/blog?category=${category.slug}`),
      changeFrequency: 'weekly',
      priority: 0.4,
    });
  }

  return entries;
}
