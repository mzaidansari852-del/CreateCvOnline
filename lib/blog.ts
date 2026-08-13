import { BLOG_POSTS } from '@/content/blog';
import type { BlogBlock, BlogPost } from '@/types/blog';

/**
 * The blog's read API.
 *
 * Everything the app knows about articles comes through here rather than from
 * `content/blog` directly, for two reasons: reading time is *derived* from the body
 * instead of being typed by hand into every article, and the category/related/adjacent
 * lookups are computed once at module load rather than on every render.
 */

/** Average adult reading speed for prose of this kind. Deliberately conservative. */
const WORDS_PER_MINUTE = 225;

/* -------------------------------------------------------------------------- */
/* Text extraction                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The minimal inline syntax article bodies may use: `[label](/path)`, `**strong**`
 * and `` `code` ``. `BlogBody` renders these; here they are stripped so that markup
 * never inflates a word count.
 */
export function stripInlineMarkup(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
}

/** All human-readable text in a block, in reading order. */
export function blockText(block: BlogBlock): string {
  switch (block.type) {
    case 'paragraph':
      return block.text;
    case 'heading':
      return block.text;
    case 'list':
      return block.items.join(' ');
    case 'quote':
      return block.cite ? `${block.text} ${block.cite}` : block.text;
    case 'callout':
      return `${block.title} ${block.text}`;
    case 'table':
      return [...block.head, ...block.rows.flat()].join(' ');
    case 'checklist':
      return block.items.join(' ');
    case 'code':
      return block.code;
  }
}

export function countWords(body: BlogBlock[]): number {
  const text = stripInlineMarkup(body.map(blockText).join(' '));
  return text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

/** Reading time is computed from the body — articles never hand-write it. */
export function estimateReadingMinutes(body: BlogBlock[]): number {
  return Math.max(1, Math.round(countWords(body) / WORDS_PER_MINUTE));
}

export function getPostWordCount(post: BlogPost): number {
  return countWords(post.body);
}

/* -------------------------------------------------------------------------- */
/* Slugs and ids                                                               */
/* -------------------------------------------------------------------------- */

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** URL slug for a category name, e.g. "ATS & applications" → "ats-applications". */
export function categorySlug(category: string): string {
  return slugify(category);
}

/** Anchor id for an in-article heading. Shared by `BlogBody` and the table of contents. */
export function headingId(text: string): string {
  return slugify(stripInlineMarkup(text));
}

/* -------------------------------------------------------------------------- */
/* The collection                                                              */
/* -------------------------------------------------------------------------- */

/** Sorted newest-first by `content/blog`, with reading time filled in from the body. */
const POSTS: BlogPost[] = BLOG_POSTS.map((post) => ({
  ...post,
  readingMinutes: estimateReadingMinutes(post.body),
}));

const BY_SLUG = new Map(POSTS.map((post) => [post.slug, post]));
const INDEX_OF = new Map(POSTS.map((post, index) => [post.slug, index]));

/** Every article, newest first. Returns a copy, so callers may sort it freely. */
export function getAllPosts(): BlogPost[] {
  return [...POSTS];
}

export function getPost(slug: string): BlogPost | undefined {
  return BY_SLUG.get(slug);
}

/**
 * Articles dated in the future.
 *
 * Lives here rather than in the admin page because reading the clock is impure, and a
 * React component body must stay pure for the compiler to reason about it.
 */
export function getScheduledPosts(): BlogPost[] {
  const now = Date.now();
  return getAllPosts().filter((post) => new Date(post.publishedAt).getTime() > now);
}

export function getAllSlugs(): string[] {
  return POSTS.map((post) => post.slug);
}

/* -------------------------------------------------------------------------- */
/* Categories                                                                  */
/* -------------------------------------------------------------------------- */

export interface BlogCategory {
  /** Display name exactly as written in the article. */
  name: string;
  /** URL-safe form used in `?category=…`. */
  slug: string;
  count: number;
}

/** Categories in use, most populated first, then alphabetically. */
export function getAllCategories(): BlogCategory[] {
  const counts = new Map<string, number>();
  for (const post of POSTS) {
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, slug: categorySlug(name), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Accepts either the display name ("CV writing") or the slug ("cv-writing"). */
export function getPostsByCategory(category: string): BlogPost[] {
  const needle = categorySlug(category);
  return POSTS.filter((post) => categorySlug(post.category) === needle);
}

/** Resolves a `?category=…` value to the canonical display name, if it matches one. */
export function resolveCategory(value: string | undefined): BlogCategory | undefined {
  if (!value) return undefined;
  const needle = categorySlug(value);
  return getAllCategories().find((category) => category.slug === needle);
}

/* -------------------------------------------------------------------------- */
/* Relationships                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Related reading for a post: the slugs the author chose first, then same-category
 * articles, then articles sharing a tag, then whatever is newest. Deterministic, so
 * the page stays statically renderable.
 */
export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const current = BY_SLUG.get(slug);
  if (!current) return POSTS.slice(0, limit);

  const picked = new Map<string, BlogPost>();
  const add = (post: BlogPost | undefined) => {
    if (!post || post.slug === slug || picked.has(post.slug)) return;
    if (picked.size < limit) picked.set(post.slug, post);
  };

  for (const related of current.related) add(BY_SLUG.get(related));
  for (const post of POSTS) if (post.category === current.category) add(post);

  const tags = new Set(current.tags);
  for (const post of POSTS) if (post.tags.some((tag) => tags.has(tag))) add(post);
  for (const post of POSTS) add(post);

  return [...picked.values()];
}

export interface AdjacentPosts {
  /** The article published immediately *before* this one. */
  previous: BlogPost | undefined;
  /** The article published immediately *after* this one. */
  next: BlogPost | undefined;
}

/**
 * Neighbours in publication order. `POSTS` is newest-first, so the older article sits
 * at the higher index — "previous" means earlier in time, not earlier in the list.
 */
export function getAdjacentPosts(slug: string): AdjacentPosts {
  const index = INDEX_OF.get(slug);
  if (index === undefined) return { previous: undefined, next: undefined };
  return { previous: POSTS[index + 1], next: POSTS[index - 1] };
}

/* -------------------------------------------------------------------------- */
/* Presentation helpers                                                        */
/* -------------------------------------------------------------------------- */

export interface TocEntry {
  id: string;
  text: string;
}

/** On-page table of contents: the article's h2 blocks, with their anchor ids. */
export function getTableOfContents(post: BlogPost): TocEntry[] {
  return post.body
    .filter(
      (block): block is Extract<BlogBlock, { type: 'heading' }> =>
        block.type === 'heading' && block.level === 2,
    )
    .map((block) => ({ id: headingId(block.text), text: stripInlineMarkup(block.text) }));
}

/** Stable, locale-fixed date formatting — the same string on the server and the client. */
export function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso));
}
