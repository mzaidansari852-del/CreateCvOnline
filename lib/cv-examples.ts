import { CV_EXAMPLES, CV_EXAMPLES_BY_SLUG } from '@/content/examples';
import { templateDefaults, getTemplate } from '@/lib/cv/template-registry';
import { createDefaultCustomization } from '@/lib/cv/defaults';
import type { CVCustomization } from '@/types/cv';
import type { CvExample } from '@/types/cv-example';

/**
 * The worked examples' read API.
 *
 * The examples themselves are plain data; everything derived from them lives here so a
 * page never has to compute anything at render time. In particular the customization is
 * built from the example's template rather than stored alongside it, which means the
 * document on the page always uses the template's own accent colour and can never
 * drift from the registry.
 */

export function getAllExamples(): CvExample[] {
  return [...CV_EXAMPLES];
}

export function getExample(slug: string): CvExample | undefined {
  return CV_EXAMPLES_BY_SLUG.get(slug);
}

export function getAllExampleSlugs(): string[] {
  return CV_EXAMPLES.map((example) => example.slug);
}

/**
 * Related examples: the author's picks first, then whatever comes next in order.
 * Deterministic, so the page stays statically renderable.
 */
export function getRelatedExamples(slug: string, limit = 2): CvExample[] {
  const picked = new Map<string, CvExample>();
  const add = (example: CvExample | undefined) => {
    if (!example || example.slug === slug || picked.has(example.slug)) return;
    if (picked.size < limit) picked.set(example.slug, example);
  };

  for (const related of CV_EXAMPLES_BY_SLUG.get(slug)?.relatedExamples ?? []) {
    add(CV_EXAMPLES_BY_SLUG.get(related));
  }
  for (const example of CV_EXAMPLES) add(example);

  return [...picked.values()];
}

/**
 * How the example is rendered: the template's own accent, no photo, A4.
 *
 * Photos are switched off deliberately — every one of these examples is written for a
 * UK or US application, where a photograph is at best unconventional and at worst a
 * reason for the file to be discarded.
 */
export function getExampleCustomization(example: CvExample): CVCustomization {
  const template = getTemplate(example.templateId);
  return createDefaultCustomization({
    ...templateDefaults(template),
    showPhoto: false,
    paperSize: 'a4',
  });
}

/**
 * The bullets reproduced as selectable text on the page, paired with their commentary.
 * Read out of the document itself, so the explanation can never describe a sentence the
 * example does not contain.
 */
export function getHighlightedBullets(example: CvExample): { text: string; note: string }[] {
  const achievements = example.cv.experience[0]?.achievements ?? [];
  return achievements.map((text, index) => ({ text, note: example.bulletNotes[index] ?? '' }));
}

/** The role and employer the highlighted bullets came from, for the block's heading. */
export function getHighlightedRole(example: CvExample): { role: string; company: string } {
  const first = example.cv.experience[0];
  return { role: first?.role ?? '', company: first?.company ?? '' };
}
