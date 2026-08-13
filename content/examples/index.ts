import { PROFESSIONS_BY_SLUG } from '@/content/professions';
import { findTemplate } from '@/lib/cv/template-registry';
import type { CvExample } from '@/types/cv-example';

import * as examples from './examples';

/**
 * Every worked CV example, collected from `./examples.ts`.
 *
 * The guards here cover the four ways one of these pages can quietly become wrong: a
 * duplicate slug, a template id that is not in the registry (which would silently fall
 * back to the default template), a cross-link to something that does not exist, and —
 * the one specific to this content type — a `bulletNotes` array that has drifted out of
 * step with the achievements it is annotating, which would attach an explanation to the
 * wrong sentence.
 */

const registered: CvExample[] = Object.values(examples);

/** Alphabetical by slug, so the build output is deterministic. */
export const CV_EXAMPLES: CvExample[] = [...registered].sort((a, b) =>
  a.slug.localeCompare(b.slug),
);

export const CV_EXAMPLES_BY_SLUG: ReadonlyMap<string, CvExample> = new Map(
  CV_EXAMPLES.map((example) => [example.slug, example]),
);

if (process.env.NODE_ENV !== 'production') {
  if (CV_EXAMPLES_BY_SLUG.size !== CV_EXAMPLES.length) {
    const seen = new Set<string>();
    const duplicates = CV_EXAMPLES.filter((example) => !seen.add(example.slug)).map(
      (example) => example.slug,
    );
    throw new Error(`Duplicate CV example slug(s): ${duplicates.join(', ')}`);
  }

  const problems: string[] = [];

  for (const example of CV_EXAMPLES) {
    if (!findTemplate(example.templateId)) {
      problems.push(`${example.slug}: template "${example.templateId}" is not in the registry`);
    }

    const highlighted = example.cv.experience[0]?.achievements ?? [];
    if (highlighted.length !== example.bulletNotes.length) {
      problems.push(
        `${example.slug}: ${example.bulletNotes.length} bullet notes for ${highlighted.length} achievements`,
      );
    }

    for (const slug of example.relatedExamples) {
      if (slug === example.slug) problems.push(`${example.slug} links to itself`);
      else if (!CV_EXAMPLES_BY_SLUG.has(slug)) {
        problems.push(`${example.slug} → missing example "${slug}"`);
      }
    }

    for (const slug of example.relatedProfessions) {
      if (!PROFESSIONS_BY_SLUG.has(slug)) {
        problems.push(`${example.slug} → missing profession "${slug}"`);
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(`CV example content problems:\n  ${problems.join('\n  ')}`);
  }
}
