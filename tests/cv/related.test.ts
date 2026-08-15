import { describe, expect, it } from 'vitest';

import { TEMPLATES, relatedTemplates } from '@/lib/cv/template-registry';

/**
 * The related-template grid, seen as a graph.
 *
 * Every template page renders six links to other templates. Read one page at a time that
 * looks fine; read all fifty-six as a graph and the shape matters, because on a domain with
 * no external links these are most of the internal links a template page will ever receive.
 *
 * The original implementation took the first six siblings in registry order, which meant
 * all ten templates in a category pointed at the same front of the list. Positions seven,
 * eight and nine were linked to by nobody — eighteen orphans out of fifty-six, invisible on
 * any individual page.
 */

function inbound(limit = 6): Map<string, number> {
  const counts = new Map<string, number>(TEMPLATES.map((template) => [template.id, 0]));
  for (const template of TEMPLATES) {
    for (const related of relatedTemplates(template.id, limit)) {
      counts.set(related.id, (counts.get(related.id) ?? 0) + 1);
    }
  }
  return counts;
}

describe('related templates', () => {
  it('links every template to something', () => {
    for (const template of TEMPLATES) {
      const related = relatedTemplates(template.id);
      expect(related.length, `${template.slug} has no related templates`).toBe(6);
      expect(
        related.some((entry) => entry.id === template.id),
        `${template.slug} links to itself`,
      ).toBe(false);
    }
  });

  it('leaves no template without inbound links', () => {
    const orphans = [...inbound()]
      .filter(([, count]) => count === 0)
      .map(([id]) => TEMPLATES.find((template) => template.id === id)?.slug ?? id);
    expect(orphans, 'these pages are linked to by nothing').toEqual([]);
  });

  it('spreads the links evenly rather than piling them on the front of each category', () => {
    const counts = [...inbound().values()];
    const lowest = Math.min(...counts);
    const highest = Math.max(...counts);
    // A cycle gives in-degree === out-degree. Allow slack for the six-template category,
    // which has to top up from elsewhere, but not the 0-vs-10 spread the old order produced.
    expect(highest - lowest, `inbound links range from ${lowest} to ${highest}`).toBeLessThanOrEqual(4);
  });

  it('prefers siblings, so the grid is a real comparison', () => {
    for (const template of TEMPLATES) {
      const related = relatedTemplates(template.id);
      const sameCategory = related.filter((entry) => entry.category === template.category).length;
      const availableSiblings = TEMPLATES.filter(
        (entry) => entry.category === template.category && entry.id !== template.id,
      ).length;
      expect(sameCategory, `${template.slug} shows too few siblings`).toBe(
        Math.min(6, availableSiblings),
      );
    }
  });
});
