import { existsSync, statSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { PREVIEW_SLUGS } from '@/lib/cv/previews';
import { TEMPLATES } from '@/lib/cv/template-registry';

/**
 * Static preview images for the template pages.
 *
 * The gallery used to render a live CV per card: a `<div>` tree of styled text. It looked
 * right and was invisible to an image crawler, which is why a site whose entire product is
 * pictures of documents had no presence in Google Images. It was also heavy — 667KB of
 * prerendered HTML per template page, the same markup again in the RSC payload.
 *
 * These assertions exist because the failure mode of a missing preview is silent: the
 * component falls back to the live render, the page still looks correct, and the only
 * symptom is that one template quietly stops being indexable.
 */

const PREVIEWS = join(process.cwd(), 'public', 'previews');
const file = (name: string) => join(PREVIEWS, name);

describe('preview coverage', () => {
  it('has an image for every template in the registry', () => {
    const missing = TEMPLATES.filter((template) => !PREVIEW_SLUGS.includes(template.slug));
    expect(
      missing.map((template) => template.slug),
      'run `npm run previews` after adding a template',
    ).toEqual([]);
  });

  it('lists no slug that is not a template', () => {
    const slugs = new Set(TEMPLATES.map((template) => template.slug));
    expect(PREVIEW_SLUGS.filter((slug) => !slugs.has(slug))).toEqual([]);
  });

  it('ships all three variants for each slug', () => {
    const missing: string[] = [];
    for (const slug of PREVIEW_SLUGS) {
      for (const name of [`${slug}-card.webp`, `${slug}.webp`, `${slug}-og.jpg`]) {
        if (!existsSync(file(name))) missing.push(name);
      }
    }
    expect(missing).toEqual([]);
  });

  it('keeps every file small enough to be worth serving', () => {
    // A preview heavier than its own markup would defeat the point.
    const oversized = PREVIEW_SLUGS.flatMap((slug) =>
      [
        { name: `${slug}-card.webp`, limit: 120_000 },
        { name: `${slug}.webp`, limit: 400_000 },
        { name: `${slug}-og.jpg`, limit: 300_000 },
      ].filter(({ name, limit }) => statSync(file(name)).size > limit),
    );
    expect(oversized.map((entry) => entry.name)).toEqual([]);
  });

  it('never ships an empty or truncated image', () => {
    const tiny = PREVIEW_SLUGS.filter((slug) => statSync(file(`${slug}-card.webp`)).size < 2_000);
    expect(tiny).toEqual([]);
  });
});

describe('the pages actually use them', () => {
  const detail = readFileSync(
    join(process.cwd(), 'app/(marketing)/templates/[slug]/page.tsx'),
    'utf8',
  );
  const strip = readFileSync(join(process.cwd(), 'components/marketing/TemplateStrip.tsx'), 'utf8');
  const image = readFileSync(join(process.cwd(), 'components/cv/TemplateImage.tsx'), 'utf8');
  const robots = readFileSync(join(process.cwd(), 'app/robots.ts'), 'utf8');

  it('renders the image on the detail page and in the grid', () => {
    expect(detail).toContain('<TemplateImage');
    expect(strip).toContain('<TemplateImage');
  });

  it('keeps the live render as a fallback rather than removing it', () => {
    // A template added before its image is generated must not leave a hole in the grid.
    expect(strip).toContain('hasPreview(template.slug)');
    expect(strip).toContain('<CVThumbnail');
    expect(detail).toContain('<CVPagePreview');
  });

  it('points og:image at a file robots.txt does not block', () => {
    expect(detail).toContain('/previews/${template.slug}-og.jpg');
    // The previous value was `/api/og?...`, and `/api/` is disallowed.
    expect(robots).toContain('PRIVATE_PATH_PREFIXES');
    expect(existsSync(file('modern-ats-og.jpg'))).toBe(true);
  });

  it('writes alt text a crawler and a screen reader can both use', () => {
    /*
     * Not the filename, not "image": the template name and what the picture shows — and now
     * in the language of the page it is on, because Google Images matches the alt text
     * against the query and a German searcher does not type "CV template preview".
     */
    expect(image).toContain('CV template preview');
    expect(image).toContain('Aperçu du modèle de CV');
    expect(image).toContain('Vorschau der Lebenslauf-Vorlage');
    expect(image).toContain('alt={ALT[locale](template.name, template.category)}');
    expect(image).toContain('template.category');
  });

  it('marks only the hero as priority', () => {
    // A grid of preloaded images competes with itself and with the font stylesheet.
    expect(detail).toContain('priority');
    expect(strip).not.toContain('priority');
  });
});
