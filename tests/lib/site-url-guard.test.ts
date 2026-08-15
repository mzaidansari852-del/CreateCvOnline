/**
 * @vitest-environment node
 *
 * Node, not jsdom, and that is load-bearing: the guard is deliberately server-only
 * (`typeof window === 'undefined'`), so under the default DOM environment it would never
 * run and every assertion below would pass for the wrong reason.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { siteUrlProblem } from '@/lib/env';
import { TEMPLATE_CATEGORIES, categoryPath } from '@/lib/cv/template-registry';

/**
 * `NEXT_PUBLIC_SITE_URL`, and the category links.
 *
 * Both of these are failures that leave the site working perfectly.
 *
 * A missing site URL means every canonical tag, `og:url`, JSON-LD `@id` and sitemap entry
 * is published as `http://localhost:3000` — the pages render, nothing errors, and Google
 * is told on every one of them that the real home of the content is a machine it cannot
 * reach. There is no runtime symptom, so it has to be caught at build time.
 *
 * A `?category=` link means six pages written to rank — with their own title, lede, FAQ
 * and copy — receive no internal links at all, while the gallery collects them under a
 * URL that is, to a crawler, the same page it already has.
 */

describe('siteUrlProblem', () => {
  it('accepts a real origin', () => {
    expect(siteUrlProblem('https://www.createcvonline.com')).toBeNull();
    expect(siteUrlProblem('https://createcvonline.com')).toBeNull();
    expect(siteUrlProblem('https://staging.createcvonline.vercel.app')).toBeNull();
  });

  it('rejects every shape of "this machine"', () => {
    for (const url of [
      'http://localhost:3000',
      'https://localhost',
      'http://127.0.0.1:3000',
      'http://127.1.2.3',
      'http://0.0.0.0:8080',
      'http://macbook.local',
      'http://app.localhost:3000',
    ]) {
      expect(siteUrlProblem(url), url).not.toBeNull();
    }
  });

  it('rejects a value that is not a URL at all', () => {
    expect(siteUrlProblem('createcvonline .com')).toMatch(/not a valid URL/);
  });

  it('explains which of the two mistakes was made', () => {
    // "Unset" and "set to the wrong thing" both arrive here as localhost, because that is
    // the fallback. The fix is different, so the message has to tell them apart.
    const original = process.env.NEXT_PUBLIC_SITE_URL;
    try {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      expect(siteUrlProblem('http://localhost:3000')).toMatch(/is not set/);

      process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
      expect(siteUrlProblem('http://localhost:3000')).toMatch(/points at "localhost"/);
    } finally {
      if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
      else process.env.NEXT_PUBLIC_SITE_URL = original;
    }
  });
});

describe('the build guard', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.restoreAllMocks();
  });

  async function loadEnv() {
    vi.resetModules();
    return import('@/lib/env');
  }

  it('fails a deployment build when the site URL is missing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    await expect(loadEnv()).rejects.toThrow(/NEXT_PUBLIC_SITE_URL is not set/);
  });

  it('fails a deployment build when the site URL points at localhost', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CI', 'true');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');
    await expect(loadEnv()).rejects.toThrow(/points at "localhost"/);
  });

  it('only warns locally, because building against localhost is a normal thing to do', async () => {
    // `npm run previews` and `npm run verify:seo` both do a production build and then
    // crawl it on 127.0.0.1. Failing those would trade a real problem for an invented one.
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL', '');
    vi.stubEnv('CI', '');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(loadEnv()).resolves.toBeDefined();
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toMatch(/localhost/);
  });

  it('stays silent when the site URL is real', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://www.createcvonline.com');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mod = await loadEnv();
    expect(mod.publicEnv.siteUrl).toBe('https://www.createcvonline.com');
    expect(warn).not.toHaveBeenCalled();
  });

  it('does nothing at all in development, whatever the URL is', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('CI', 'true');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(loadEnv()).resolves.toBeDefined();
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('category links', () => {
  it('resolves every category to its own static path', () => {
    for (const category of TEMPLATE_CATEGORIES) {
      expect(categoryPath(category.id)).toBe(`/templates/${category.slug}`);
    }
  });

  it('is used everywhere instead of a ?category= query view', () => {
    const files = [
      'app/(marketing)/templates/[slug]/page.tsx',
      'app/(marketing)/cv-for/[profession]/page.tsx',
      'components/marketing/home/CategoryCards.tsx',
      'components/layout/SiteFooter.tsx',
    ];
    for (const file of files) {
      const source = readFileSync(join(process.cwd(), file), 'utf8');
      const links = source.match(/href=[{"'`][^\n]*templates\?category=/g) ?? [];
      expect(links, `${file} still links to a query view`).toEqual([]);
    }
  });

  it('links all six categories from the footer, which is on every page', () => {
    const footer = readFileSync(
      join(process.cwd(), 'components/layout/SiteFooter.tsx'),
      'utf8',
    );
    expect(footer).toContain('TEMPLATE_CATEGORIES.map');
    /*
     * The footer routes through `categoryHref`, not `categoryPath` directly, because it now
     * serves two languages: English categories go to `/templates/<slug>`, French ones to
     * `/fr/modeles-de-cv/<slug>`. What still has to hold is that neither is hand-written —
     * the English branch must go through `categoryPath` so a change to the canonical
     * category URL lands here too, which is the regression this test was written for.
     */
    expect(footer).toContain('categoryHref(category.id)');
    expect(footer).toContain('categoryPath(id)');
  });
});
