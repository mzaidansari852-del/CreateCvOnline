import { describe, expect, it } from 'vitest';

import { CV_FONTS } from '@/lib/cv/format';
import { TEMPLATES, TEMPLATE_CATEGORIES, templateDefaults } from '@/lib/cv/template-registry';
import { fontKeySchema } from '@/types/cv';
import type { FontKey } from '@/types/cv';

/**
 * Typeface is the strongest single signal of "this is a different template".
 *
 * Before this, all 56 templates rendered in the same default pair, and the visible
 * differences between them came down to column count, rule weight and accent placement —
 * which is why a shopper scrolling the gallery saw six designs, not fifty-six. Each
 * template now declares the pair it was drawn around. These tests hold that claim up:
 * the pairs have to exist, be real fonts, be conventional where the template promises
 * ATS-safety, and actually differ from one another where a shopper would compare them.
 */

const pairOf = (template: { fonts: { heading: FontKey; body: FontKey } }) =>
  `${template.fonts.heading}/${template.fonts.body}`;

const FONT_BY_KEY = new Map(CV_FONTS.map((font) => [font.key, font]));

/**
 * Faces a parser and a hiring manager both take for granted.
 *
 * The exclusions are the display faces — Playfair, Garamond, Lora, Merriweather, Libre
 * Baskerville and Poppins. Nothing about them breaks text extraction; they are simply not
 * what an ATS-targeted document should be gambling on when its whole selling point is that
 * it takes no chances.
 */
const CONVENTIONAL: readonly FontKey[] = [
  'inter',
  'roboto',
  'open-sans',
  'lato',
  'ibm-plex-sans',
  'source-serif',
  'georgia',
  'arial',
  'times',
];

describe('template font pairings', () => {
  it('every template declares one', () => {
    const missing = TEMPLATES.filter((template) => !template.fonts?.heading || !template.fonts.body);
    expect(missing.map((template) => template.slug)).toEqual([]);
    expect(TEMPLATES).toHaveLength(56);
  });

  it('names only fonts the renderer can actually load', () => {
    for (const template of TEMPLATES) {
      expect(fontKeySchema.safeParse(template.fonts.heading).success, template.slug).toBe(true);
      expect(fontKeySchema.safeParse(template.fonts.body).success, template.slug).toBe(true);
      expect(FONT_BY_KEY.get(template.fonts.heading), template.slug).toBeTruthy();
      expect(FONT_BY_KEY.get(template.fonts.body), template.slug).toBeTruthy();
    }
  });

  it('never repeats a pairing inside a category', () => {
    // Two templates a shopper is comparing side by side in the same grid must not be
    // typeset identically — that is the specific comparison this change exists to lose.
    for (const category of TEMPLATE_CATEGORIES) {
      const siblings = TEMPLATES.filter((template) => template.category === category.id);
      const pairs = siblings.map(pairOf);
      const duplicated = pairs.filter((pair, index) => pairs.indexOf(pair) !== index);
      expect(duplicated, `${category.id} reuses a pairing`).toEqual([]);
    }
  });

  it('keeps ATS templates on conventional faces', () => {
    for (const template of TEMPLATES.filter((entry) => entry.category === 'ats')) {
      expect(CONVENTIONAL, `${template.slug} heading`).toContain(template.fonts.heading);
      expect(CONVENTIONAL, `${template.slug} body`).toContain(template.fonts.body);
    }
  });

  it('spreads across the catalogue rather than clustering on two safe faces', () => {
    const headings = new Set(TEMPLATES.map((template) => template.fonts.heading));
    const pairs = TEMPLATES.map(pairOf);
    const distinct = new Set(pairs);

    expect(headings.size).toBeGreaterThanOrEqual(10);
    expect(distinct.size).toBeGreaterThanOrEqual(30);

    // No single pairing may dominate: the failure mode being guarded against is a map that
    // technically differs everywhere but leaves forty templates on Inter.
    const counts = new Map<string, number>();
    for (const pair of pairs) counts.set(pair, (counts.get(pair) ?? 0) + 1);
    const commonest = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]!;
    expect(commonest[1], `${commonest[0]} is on ${commonest[1]} templates`).toBeLessThanOrEqual(6);
  });

  it('serif categories read as serif', () => {
    // Classic exists because law, academia and government still expect a serif document.
    // A sans-serif Classic template is not a variation, it is a miscategorisation. The
    // classification comes off the font table's own `kind`, so adding a face cannot
    // silently widen what counts as a serif.
    for (const template of TEMPLATES.filter((entry) => entry.category === 'classic')) {
      expect(FONT_BY_KEY.get(template.fonts.heading)?.kind, `${template.slug} heading`).toBe(
        'serif',
      );
      expect(FONT_BY_KEY.get(template.fonts.body)?.kind, `${template.slug} body`).toBe('serif');
    }
  });
});

describe('templateDefaults', () => {
  it('carries the pairing alongside the accent', () => {
    for (const template of TEMPLATES) {
      expect(templateDefaults(template)).toEqual({
        templateId: template.id,
        accentColor: template.accentDefault,
        headingFont: template.fonts.heading,
        bodyFont: template.fonts.body,
        // Metrics travel with the pairing for the same reason — see tests/cv/metrics.
        lineHeight: template.metrics.lineHeight,
        pageMargin: template.metrics.pageMargin,
      });
    }
  });

  it('is what every rendering call site passes', async () => {
    // The regression this guards: a new page hand-writes `{ templateId, accentColor }`,
    // silently drops the fonts, and one surface in the product renders every template in
    // the same face again. Nineteen call sites had to be found by hand the first time.
    const fs = await import('node:fs/promises');
    const path = await import('node:path');

    async function walk(dir: string): Promise<string[]> {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const found = await Promise.all(
        entries.map(async (entry) => {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || full === 'components/cv/templates') return [];
            return walk(full);
          }
          return /\.tsx?$/.test(entry.name) ? [full] : [];
        }),
      );
      return found.flat();
    }

    const files = (await Promise.all(['app', 'components', 'lib'].map(walk))).flat();
    expect(files.length).toBeGreaterThan(50);

    // `accentColor: <something>.accentDefault` outside the registry means a call site
    // assembled the defaults itself instead of asking for them.
    const offenders: string[] = [];
    for (const file of files) {
      if (file === path.join('lib', 'cv', 'template-registry.ts')) continue;
      const source = await fs.readFile(file, 'utf8');
      if (/accentColor:\s*\w+\.accentDefault/.test(source)) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });
});
