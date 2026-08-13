import type { BlogPost } from '@/types/blog';

import * as articles from './articles';

/**
 * Every article on the blog, newest first.
 *
 * The articles themselves live one-per-file next to this one and are collected by
 * `./articles.ts`, which is a flat list of re-exports — **adding an article is one
 * import line there and nothing else**. This module only sorts them and guards
 * against the two mistakes a growing content directory invites: a duplicate slug,
 * and a `related` entry pointing at an article that does not exist.
 *
 * Read posts through `lib/blog.ts` rather than importing this array directly: that
 * is where reading time is computed from the body, so `readingMinutes` on the raw
 * objects below is a placeholder.
 */

const registered: BlogPost[] = Object.values(articles);

/** Newest first, with the slug as a stable tie-breaker so builds are deterministic. */
export const BLOG_POSTS: BlogPost[] = [...registered].sort((a, b) => {
  const byDate = b.publishedAt.localeCompare(a.publishedAt);
  return byDate !== 0 ? byDate : a.slug.localeCompare(b.slug);
});

/** Slug → post. Also the duplicate-slug detector: a clash would silently drop a post. */
export const BLOG_POSTS_BY_SLUG: ReadonlyMap<string, BlogPost> = new Map(
  BLOG_POSTS.map((post) => [post.slug, post]),
);

if (process.env.NODE_ENV !== 'production') {
  if (BLOG_POSTS_BY_SLUG.size !== BLOG_POSTS.length) {
    const seen = new Set<string>();
    const duplicates = BLOG_POSTS.filter((post) => !seen.add(post.slug)).map((post) => post.slug);
    throw new Error(`Duplicate blog slug(s): ${duplicates.join(', ')}`);
  }

  const broken = BLOG_POSTS.flatMap((post) =>
    post.related
      .filter((slug) => !BLOG_POSTS_BY_SLUG.has(slug))
      .map((slug) => `${post.slug} → ${slug}`),
  );
  if (broken.length > 0) {
    throw new Error(`Blog post "related" slug(s) that do not exist: ${broken.join(', ')}`);
  }
}
