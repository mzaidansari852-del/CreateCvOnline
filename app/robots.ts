import type { MetadataRoute } from 'next';

import { absoluteUrl, PRIVATE_PATH_PREFIXES, site } from '@/lib/site';

/**
 * robots.txt
 *
 * The disallow list is derived from `PRIVATE_PATH_PREFIXES` — the same constant the
 * sitemap filters against and the same one `proxy.ts` protects. There is therefore no way
 * for a private area to be crawlable but missing from here, or for a public SEO page to be
 * blocked by accident.
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = PRIVATE_PATH_PREFIXES.map((prefix) => `${prefix}/`);

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          ...disallow,
          // Shared CV links are unguessable and personal — never crawl them.
          '/cv/',
          // Query-string permutations of the gallery add nothing beyond the
          // category views that are listed explicitly in the sitemap.
          '/templates?*q=',
          // The render target for `npm run previews`: one bare CV per template, with no
          // heading, no copy and no links. Harmless to reach, worthless to index, and it
          // would duplicate the sample document 56 more times.
          '/template-preview/',
        ],
      },
      {
        // Give the big crawlers the same rules, explicitly, so there is no ambiguity
        // about which group they match.
        userAgent: ['Googlebot', 'Bingbot'],
        allow: '/',
        disallow: [...disallow, '/cv/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    // The `Host` directive takes a bare hostname, not a URL.
    host: site.domain,
  };
}
