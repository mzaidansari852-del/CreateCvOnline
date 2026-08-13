import type { MetadataRoute } from 'next';

import { getAllCategories, getAllPosts } from '@/lib/blog';
import { getAllExampleSlugs } from '@/lib/cv-examples';
import { getAllProfessionSlugs } from '@/lib/professions';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '@/lib/cv/template-registry';
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
 */

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
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const route of STATIC_ROUTES) {
    if (isPrivatePath(route.path)) continue;
    entries.push({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    });
  }

  // One page per category. These are real static paths served by the `[slug]` route,
  // not `?category=` query views — a query string is a weaker crawl signal and cannot
  // carry its own copy.
  for (const category of TEMPLATE_CATEGORIES) {
    entries.push({
      url: absoluteUrl(`/templates/${category.slug}`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    });
  }

  // One page per template.
  for (const template of TEMPLATES) {
    entries.push({
      url: absoluteUrl(`/templates/${template.slug}`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: template.premium ? 0.6 : 0.7,
    });
  }

  // One guide per profession.
  for (const slug of getAllProfessionSlugs()) {
    entries.push({
      url: absoluteUrl(`/cv-for/${slug}`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    });
  }

  // One worked example per role.
  for (const slug of getAllExampleSlugs()) {
    entries.push({
      url: absoluteUrl(`/cv-examples/${slug}`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    });
  }

  // Blog.
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
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    });
  }

  return entries;
}
