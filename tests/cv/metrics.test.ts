import { describe, expect, it } from 'vitest';

import { TEMPLATES, TEMPLATE_CATEGORIES, templateDefaults } from '@/lib/cv/template-registry';
import { cvCustomizationSchema } from '@/types/cv';

/**
 * Page metrics — leading and margin — were frozen at the schema default on all 56
 * templates: 1.5 line-height, 44px margins, every single one. Two of the handful of
 * variables that decide how a page *feels* before a word of it is read were doing no work.
 *
 * The values now on each template were derived from measuring the rendered documents, not
 * chosen by eye. `pageMargin` is banded by what kind of document the template is and
 * spread inside the band by measured line length; `lineHeight` follows from the measure
 * that produced. These tests pin the properties that derivation was supposed to have, so
 * a later hand-edit that flattens them back out fails loudly.
 */

const A4_WIDTH = 794; // px at 96dpi — the width the documents are laid out against.

describe('template page metrics', () => {
  it('every template declares metrics the customization schema accepts', () => {
    for (const template of TEMPLATES) {
      expect(template.metrics, template.slug).toBeTruthy();
      const parsed = cvCustomizationSchema.safeParse({
        ...templateDefaults(template),
      });
      expect(parsed.success, `${template.slug}: ${parsed.error?.message}`).toBe(true);
      expect(parsed.data?.lineHeight).toBe(template.metrics.lineHeight);
      expect(parsed.data?.pageMargin).toBe(template.metrics.pageMargin);
    }
  });

  it('is no longer frozen on the schema default', () => {
    // The exact failure this replaced: 56 templates, one value each.
    const leadings = new Set(TEMPLATES.map((template) => template.metrics.lineHeight));
    const margins = new Set(TEMPLATES.map((template) => template.metrics.pageMargin));
    expect(leadings.size).toBeGreaterThanOrEqual(4);
    expect(margins.size).toBeGreaterThanOrEqual(12);

    // And no value may quietly become the new default by covering most of the catalogue.
    const counts = new Map<number, number>();
    for (const template of TEMPLATES) {
      counts.set(template.metrics.pageMargin, (counts.get(template.metrics.pageMargin) ?? 0) + 1);
    }
    expect(Math.max(...counts.values())).toBeLessThanOrEqual(8);
  });

  it('leaves a usable text column at every margin', () => {
    // A margin generous enough to shorten the measure is only an improvement while the
    // page still holds a CV. Below about 600px of content width a two-column layout starts
    // breaking words rather than lines.
    for (const template of TEMPLATES) {
      const content = A4_WIDTH - 2 * template.metrics.pageMargin;
      expect(content, `${template.slug} content width`).toBeGreaterThanOrEqual(
        template.columns === 2 ? 640 : 600,
      );
    }
  });

  it('gives two-column templates tighter leading than one-column ones', () => {
    // The rule the values were derived from: leading tracks measure. Two columns halve the
    // measure, so they need less. If this inverts, the derivation has been overwritten by
    // hand with something that is not a typographic decision.
    const mean = (xs: number[]) => xs.reduce((total, x) => total + x, 0) / xs.length;
    const oneColumn = TEMPLATES.filter((template) => template.columns === 1);
    const twoColumn = TEMPLATES.filter((template) => template.columns === 2);

    expect(mean(twoColumn.map((template) => template.metrics.lineHeight))).toBeLessThan(
      mean(oneColumn.map((template) => template.metrics.lineHeight)),
    );
  });

  it('gives two-column templates a smaller page margin than one-column ones', () => {
    // Same reason from the other direction: a wide margin on a two-column page spends
    // width the columns need, and the columns are already set at the right measure.
    const mean = (xs: number[]) => xs.reduce((total, x) => total + x, 0) / xs.length;
    const oneColumn = TEMPLATES.filter((template) => template.columns === 1);
    const twoColumn = TEMPLATES.filter((template) => template.columns === 2);

    expect(mean(twoColumn.map((template) => template.metrics.pageMargin))).toBeLessThan(
      mean(oneColumn.map((template) => template.metrics.pageMargin)),
    );
  });

  it('gives formal categories a document margin and creative ones a poster margin', () => {
    const mean = (xs: number[]) => xs.reduce((total, x) => total + x, 0) / xs.length;
    const marginsOf = (category: string) =>
      TEMPLATES.filter(
        (template) => template.category === category && template.columns === 1,
      ).map((template) => template.metrics.pageMargin);

    // A Legal CV is a document and wants a document's margin. A portfolio page is a poster.
    expect(mean(marginsOf('classic'))).toBeGreaterThan(mean(marginsOf('creative')));
    expect(mean(marginsOf('ats'))).toBeGreaterThan(mean(marginsOf('technology')));
  });

  it('varies inside every category, not just between them', () => {
    // Six values applied by category would satisfy every test above and still leave ten
    // templates in a grid framed identically — which is the thing a shopper sees.
    for (const category of TEMPLATE_CATEGORIES) {
      const siblings = TEMPLATES.filter((template) => template.category === category.id);
      if (siblings.length < 4) continue;
      const margins = new Set(siblings.map((template) => template.metrics.pageMargin));
      expect(margins.size, `${category.id} margins`).toBeGreaterThanOrEqual(
        Math.ceil(siblings.length / 2),
      );
    }
  });
});
