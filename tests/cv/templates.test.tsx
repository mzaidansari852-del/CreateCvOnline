import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { CVDocument } from '@/components/cv/CVDocument';
import { createDefaultCustomization, createEmptyCV, createMinimalCV, createSampleCV } from '@/lib/cv/defaults';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '@/lib/cv/template-registry';
import { cvCustomizationSchema } from '@/types/cv';
import type { CVCustomization, CVData } from '@/types/cv';

/**
 * The template contract, enforced across all 56 designs.
 *
 * These are the tests that make "add a template by dropping in a file" safe: a new
 * template cannot be merged if it crashes on empty data, loses a section, drops a
 * heading, or ignores the user's customization.
 */

const DATASETS: { name: string; cv: CVData }[] = [
  { name: 'a full CV', cv: createSampleCV() },
  { name: 'a sparse CV', cv: createMinimalCV() },
  { name: 'an empty CV', cv: createEmptyCV() },
];

const VARIANTS: { name: string; customization: Partial<CVCustomization> }[] = [
  { name: 'defaults', customization: {} },
  {
    name: 'no photo, no icons, mixed-case headings',
    customization: { showPhoto: false, showIcons: false, headingCase: 'none' },
  },
  {
    name: 'small type, tight margins, US Letter',
    customization: { fontSize: 8.5, pageMargin: 20, sectionSpacing: 6, paperSize: 'letter' },
  },
  {
    name: 'large type, wide margins, tag skills',
    customization: { fontSize: 13, pageMargin: 80, sectionSpacing: 40, skillDisplay: 'tags' },
  },
];

function render(cv: CVData, customization: CVCustomization): string {
  return renderToStaticMarkup(<CVDocument cv={cv} customization={customization} />);
}

describe('template registry', () => {
  it('contains more than fifty templates', () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(50);
  });

  it('covers every advertised category', () => {
    for (const category of TEMPLATE_CATEGORIES) {
      const inCategory = TEMPLATES.filter((template) => template.category === category.id);
      expect(inCategory.length, `category "${category.id}" has no templates`).toBeGreaterThan(0);
    }
  });

  it('has unique ids and unique slugs', () => {
    const ids = TEMPLATES.map((template) => template.id);
    const slugs = TEMPLATES.map((template) => template.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('uses URL-safe slugs', () => {
    for (const template of TEMPLATES) {
      expect(template.slug, `${template.id} has an unsafe slug`).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('offers a usable free tier', () => {
    const free = TEMPLATES.filter((template) => !template.premium);
    expect(free.length).toBeGreaterThanOrEqual(8);
    // A free user must be able to produce something a parser can read.
    expect(free.some((template) => template.atsScore === 5)).toBe(true);
  });

  it('publishes complete, non-boilerplate marketing copy for every template', () => {
    const descriptions = new Set<string>();
    const taglines = new Set<string>();

    for (const template of TEMPLATES) {
      expect(template.name.length, `${template.id} name`).toBeGreaterThan(2);
      expect(template.tagline.length, `${template.id} tagline`).toBeGreaterThan(20);
      expect(template.description.length, `${template.id} description`).toBeGreaterThan(120);
      expect(template.bestFor.length, `${template.id} bestFor`).toBeGreaterThanOrEqual(3);
      expect(template.features.length, `${template.id} features`).toBeGreaterThanOrEqual(3);
      expect(template.keywords.length, `${template.id} keywords`).toBeGreaterThanOrEqual(3);
      expect(template.atsScore).toBeGreaterThanOrEqual(1);
      expect(template.atsScore).toBeLessThanOrEqual(5);
      expect(template.accentDefault).toMatch(/^#[0-9a-fA-F]{6}$/);

      descriptions.add(template.description);
      taglines.add(template.tagline);
    }

    // Every description and tagline must be unique — duplicated copy across template
    // pages is exactly the thin content this project is meant to avoid.
    expect(descriptions.size).toBe(TEMPLATES.length);
    expect(taglines.size).toBe(TEMPLATES.length);
  });

  it('declares an ATS score consistent with the layout', () => {
    for (const template of TEMPLATES) {
      // A two-column layout is inherently riskier to parse; claiming a perfect score for
      // one would be dishonest marketing.
      if (template.columns === 2) {
        expect(template.atsScore, `${template.id} is two-column but claims 5/5`).toBeLessThan(5);
      }
      if (template.category === 'ats') {
        expect(template.atsScore, `${template.id} is in the ATS category`).toBe(5);
        expect(template.columns, `${template.id} is in the ATS category`).toBe(1);
      }
    }
  });
});

describe.each(TEMPLATES.map((template) => [template.name, template] as const))(
  'template: %s',
  (_name, template) => {
    it.each(DATASETS.map((dataset) => [dataset.name, dataset.cv] as const))(
      'renders %s without throwing',
      (_label, cv) => {
        const customization = createDefaultCustomization({
          templateId: template.id,
          accentColor: template.accentDefault,
        });
        expect(() => render(cv, customization)).not.toThrow();
      },
    );

    it.each(VARIANTS.map((variant) => [variant.name, variant.customization] as const))(
      'survives customization: %s',
      (_label, overrides) => {
        const customization = cvCustomizationSchema.parse({
          ...createDefaultCustomization({ templateId: template.id }),
          ...overrides,
        });
        expect(() => render(createSampleCV(), customization)).not.toThrow();
      },
    );

    it('emits exactly one h1 and a heading for every visible section', () => {
      const cv = createSampleCV();
      const html = render(cv, createDefaultCustomization({ templateId: template.id }));

      const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
      expect(h1Count, 'the candidate name must be the single h1').toBe(1);

      const enabled = cv.sections.filter((section) => section.enabled);
      const h2Count = (html.match(/<h2[\s>]/g) ?? []).length;
      expect(h2Count, 'every visible section needs a heading').toBeGreaterThanOrEqual(
        enabled.length,
      );
    });

    it('never leaks undefined, NaN or [object Object] into the document', () => {
      for (const dataset of DATASETS) {
        const html = render(dataset.cv, createDefaultCustomization({ templateId: template.id }));
        expect(html, `${template.id} with ${dataset.name}`).not.toMatch(/>undefined</);
        expect(html, `${template.id} with ${dataset.name}`).not.toMatch(/NaN/);
        expect(html, `${template.id} with ${dataset.name}`).not.toMatch(/\[object Object\]/);
      }
    });

    it('renders the candidate name and headline', () => {
      const html = render(createSampleCV(), createDefaultCustomization({ templateId: template.id }));
      expect(html).toContain('Amina');
      expect(html).toContain('Senior Product Designer');
    });

    it('marks entries as unbreakable so pagination cannot split them', () => {
      const html = render(createSampleCV(), createDefaultCustomization({ templateId: template.id }));
      expect(html).toContain('cv-block');
      expect(html).toContain('cv-section');
    });

    it('honours the accent colour', () => {
      const html = render(
        createSampleCV(),
        createDefaultCustomization({ templateId: template.id, accentColor: '#ff00aa' }),
      );
      // Server-rendered inline styles use rgb() notation.
      expect(html.toLowerCase()).toMatch(/#ff00aa|rgb\(255,\s*0,\s*170\)/);
    });

    it('uses no viewport units or fixed positioning', () => {
      const html = render(createSampleCV(), createDefaultCustomization({ templateId: template.id }));
      expect(html).not.toMatch(/\d(vh|vw|dvh|svh)\b/);
      expect(html).not.toMatch(/position:\s*fixed/);
    });
  },
);

describe('switching template', () => {
  it('changes nothing but the template id', () => {
    const cv = createSampleCV();
    const before = createDefaultCustomization({
      templateId: 'modern-01',
      accentColor: '#123456',
      fontSize: 11.5,
      paperSize: 'letter',
      sectionSpacing: 22,
    });
    const after = { ...before, templateId: 'classic-01' };

    // Every customization value and the entire document survive the switch untouched.
    expect(after.accentColor).toBe(before.accentColor);
    expect(after.fontSize).toBe(before.fontSize);
    expect(after.paperSize).toBe(before.paperSize);
    expect(after.sectionSpacing).toBe(before.sectionSpacing);

    const first = render(cv, before);
    const second = render(cv, after);
    expect(first).not.toBe(second);
    // The content is identical even though the markup differs.
    for (const needle of ['Atlas Cloud', 'Medina Labs', 'Université Grenoble Alpes']) {
      expect(first).toContain(needle);
      expect(second).toContain(needle);
    }
  });

  it('renders every template against an unknown id by falling back', () => {
    expect(() =>
      render(createSampleCV(), createDefaultCustomization({ templateId: 'does-not-exist' })),
    ).not.toThrow();
  });
});
