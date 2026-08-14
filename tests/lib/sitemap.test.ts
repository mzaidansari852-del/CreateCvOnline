import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import sitemap from '@/app/sitemap';
import { getAllPosts } from '@/lib/blog';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '@/lib/cv/template-registry';
import { isPrivatePath, site } from '@/lib/site';

/**
 * The sitemap.
 *
 * Two things are being defended here, and both are about *honesty* rather than coverage.
 *
 * `lastmod` used to be `new Date()` on every URL: a claim that all ~140 pages changed at
 * the moment of the deploy. Google uses `lastmod` only while it is "consistently and
 * verifiably accurate", and a claim that fails that test once is discounted everywhere —
 * including on the blog, where the dates are real. So the assertion is not "every entry
 * has a date"; it is the opposite.
 *
 * `images` has the same failure mode. An image sitemap listing pictures that are not on
 * the page, or files that are not deployed, is worse than no image sitemap.
 */

const entries = sitemap();
const byUrl = new Map(entries.map((entry) => [entry.url, entry]));
const path = (url: string) => url.slice(site.url.length) || '/';
const publicFile = (url: string) => join(process.cwd(), 'public', new URL(url).pathname);

describe('sitemap coverage', () => {
  it('lists every template and every category page', () => {
    for (const template of TEMPLATES) {
      expect(byUrl.has(`${site.url}/templates/${template.slug}`)).toBe(true);
    }
    for (const category of TEMPLATE_CATEGORIES) {
      expect(byUrl.has(`${site.url}/templates/${category.slug}`)).toBe(true);
    }
  });

  it('leaks no private path', () => {
    const leaked = entries.map((entry) => path(entry.url)).filter((value) => isPrivatePath(value));
    expect(leaked).toEqual([]);
  });

  it('has no duplicate URLs', () => {
    expect(entries.length).toBe(byUrl.size);
  });

  it('emits absolute URLs on the configured origin', () => {
    const foreign = entries.map((entry) => entry.url).filter((url) => !url.startsWith(site.url));
    expect(foreign).toEqual([]);
  });
});

describe('lastmod', () => {
  it('is set on blog posts, where a real editorial date exists', () => {
    const posts = getAllPosts();
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) {
      const entry = byUrl.get(`${site.url}/blog/${post.slug}`);
      expect(entry?.lastModified, `${post.slug} should carry its own date`).toBeDefined();
      expect(new Date(entry?.lastModified as Date).toISOString()).toBe(
        new Date(post.updatedAt || post.publishedAt).toISOString(),
      );
    }
  });

  it('is absent everywhere else, rather than stamped with the build time', () => {
    const blogPosts = new Set(getAllPosts().map((post) => `${site.url}/blog/${post.slug}`));
    const stamped = entries
      .filter((entry) => !blogPosts.has(entry.url) && entry.lastModified !== undefined)
      .map((entry) => path(entry.url));
    expect(
      stamped,
      'a lastmod nobody can verify gets the element ignored for the whole site',
    ).toEqual([]);
  });

  it('never claims a date in the future', () => {
    const now = Date.now();
    for (const entry of entries) {
      if (!entry.lastModified) continue;
      expect(new Date(entry.lastModified).getTime()).toBeLessThanOrEqual(now);
    }
  });
});

describe('image entries', () => {
  it('gives the gallery every card image', () => {
    const gallery = byUrl.get(`${site.url}/templates`);
    expect(gallery?.images?.length).toBe(TEMPLATES.length);
  });

  it('gives each category page exactly its own templates', () => {
    for (const category of TEMPLATE_CATEGORIES) {
      const entry = byUrl.get(`${site.url}/templates/${category.slug}`);
      const expected = TEMPLATES.filter((template) => template.category === category.id);
      expect(entry?.images?.length, `${category.slug} image count`).toBe(expected.length);
      for (const template of expected) {
        expect(entry?.images).toContain(`${site.url}/previews/${template.slug}-card.webp`);
      }
    }
  });

  it('gives each template page the full-size asset it actually renders', () => {
    for (const template of TEMPLATES) {
      const entry = byUrl.get(`${site.url}/templates/${template.slug}`);
      expect(entry?.images).toEqual([`${site.url}/previews/${template.slug}.webp`]);
    }
  });

  it('lists no image that is not a deployed file', () => {
    const missing = entries
      .flatMap((entry) => entry.images ?? [])
      .filter((url) => !existsSync(publicFile(url)));
    expect([...new Set(missing)]).toEqual([]);
  });

  it('lists no image on a page that does not show one', () => {
    // Prose pages carry no gallery, and inventing images for them is the exact
    // inaccuracy that gets the whole image sitemap discounted.
    for (const entry of entries) {
      if (path(entry.url).startsWith('/cv-for/') || path(entry.url).startsWith('/blog/')) {
        expect(entry.images ?? []).toEqual([]);
      }
    }
  });
});
