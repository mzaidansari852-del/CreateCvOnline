import type { MetadataRoute } from 'next';

import { absoluteUrl, PRIVATE_PATH_PREFIXES, site } from '@/lib/site';

/**
 * robots.txt
 *
 * Two rules that must both hold, and one trap between them.
 *
 * The private areas come from `PRIVATE_PATH_PREFIXES` — the same constant the sitemap
 * filters against and `proxy.ts` protects — so a private area cannot be crawlable but
 * missing from here, nor a public SEO page blocked by accident.
 *
 * The trap is the second group. A crawler obeys the *most specific* group that names it
 * and ignores every other, so a path listed only under `User-agent: *` is not blocked for
 * Googlebot at all. Maintaining the two lists separately meant the one crawler that
 * matters silently got the weaker rules: `/template-preview/` — 56 bare copies of the
 * sample CV, no heading, no prose — was disallowed for everyone except Google and Bing.
 *
 * Both groups are therefore built from the same array. The named group exists only to make
 * the rules unambiguous for the big crawlers, so it must never say anything different.
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = [
    ...PRIVATE_PATH_PREFIXES.map((prefix) => `${prefix}/`),
    // Shared CV links are unguessable and personal — never crawl them.
    '/cv/',
    // Query-string permutations of the gallery add nothing beyond the category views
    // that are listed explicitly in the sitemap.
    '/templates?*q=',
    // The render target for `npm run previews`: one bare CV per template, with no heading,
    // no copy and no links. Harmless to reach, worthless to index, and it would duplicate
    // the sample document 56 more times.
    '/template-preview/',
  ];

  /*
   * `/api/og` generates the Open Graph card for every page that does not have a committed
   * preview image — the blog, the profession guides, the landing pages. `/api/` is in
   * `PRIVATE_PATH_PREFIXES`, so those cards were unfetchable by any crawler that respects
   * robots, and the pages shared with no image at all.
   *
   * Google and Bing resolve conflicts by specificity, not order: `Allow: /api/og` is
   * longer than `Disallow: /api/` and therefore wins for that path alone. Everything else
   * under `/api/` stays blocked.
   */
  const allow = ['/', '/api/og'];

  return {
    rules: [
      { userAgent: '*', allow, disallow },
      // Named explicitly so there is no ambiguity about which group the big crawlers
      // match — with identical rules, which is the whole point.
      { userAgent: ['Googlebot', 'Bingbot'], allow, disallow },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    // The `Host` directive takes a bare hostname, not a URL.
    host: site.domain,
  };
}
