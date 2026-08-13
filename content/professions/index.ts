import { findTemplate } from '@/lib/cv/template-registry';
import type { Profession } from '@/types/profession';

import * as professions from './professions';

/**
 * Every profession guide, collected from `./professions.ts`.
 *
 * This module only sorts and guards. It catches the three mistakes a growing content
 * directory invites: a duplicate slug, a `related` entry pointing at a profession that
 * does not exist, and a recommended template id that is not in the registry — the last
 * of which would otherwise render as a silent fallback to the default template.
 *
 * Read professions through `lib/professions.ts` rather than importing this array: that
 * is where field grouping, related lookups and the word count live.
 */

const registered: Profession[] = Object.values(professions);

/** Alphabetical by slug, so the build output is deterministic. */
export const PROFESSIONS: Profession[] = [...registered].sort((a, b) =>
  a.slug.localeCompare(b.slug),
);

/** Slug → profession. Also the duplicate-slug detector: a clash would drop a page. */
export const PROFESSIONS_BY_SLUG: ReadonlyMap<string, Profession> = new Map(
  PROFESSIONS.map((profession) => [profession.slug, profession]),
);

if (process.env.NODE_ENV !== 'production') {
  if (PROFESSIONS_BY_SLUG.size !== PROFESSIONS.length) {
    const seen = new Set<string>();
    const duplicates = PROFESSIONS.filter((profession) => !seen.add(profession.slug)).map(
      (profession) => profession.slug,
    );
    throw new Error(`Duplicate profession slug(s): ${duplicates.join(', ')}`);
  }

  const brokenRelated = PROFESSIONS.flatMap((profession) =>
    profession.related
      .filter((slug) => !PROFESSIONS_BY_SLUG.has(slug) || slug === profession.slug)
      .map((slug) => `${profession.slug} → ${slug}`),
  );
  if (brokenRelated.length > 0) {
    throw new Error(`Profession "related" slug(s) that do not resolve: ${brokenRelated.join(', ')}`);
  }

  const brokenTemplates = PROFESSIONS.flatMap((profession) =>
    profession.templates
      .filter((pick) => !findTemplate(pick.id))
      .map((pick) => `${profession.slug} → ${pick.id}`),
  );
  if (brokenTemplates.length > 0) {
    throw new Error(
      `Profession template id(s) that are not in the registry: ${brokenTemplates.join(', ')}`,
    );
  }
}
