import { accessSync } from 'node:fs';

import { beforeAll, describe, expect, it } from 'vitest';

import {
  createDefaultCustomization,
  createMinimalCV,
  createSampleCV,
} from '@/lib/cv/defaults';
import { countPdfPages, pdfFileName, renderCVHtml, renderCVPdf } from '@/lib/pdf/render';
import { TEMPLATES } from '@/lib/cv/template-registry';
import type { CVData } from '@/types/cv';

/**
 * The PDF pipeline, exercised for real.
 *
 * The heavy cases need a Chromium binary. On a machine without one the browser-dependent
 * block is skipped rather than failed — but the HTML-generation half always runs, because
 * that is where the interesting logic lives and it needs no browser.
 */

function findChromium(): string | null {
  const candidates = [
    process.env.PDF_CHROMIUM_EXECUTABLE_PATH,
    '/opt/pw-browsers/chromium',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome-stable',
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    try {
      accessSync(candidate);
      return candidate;
    } catch {
      /* keep looking */
    }
  }
  return null;
}

const chromium = findChromium();

beforeAll(() => {
  if (chromium) process.env.PDF_CHROMIUM_EXECUTABLE_PATH = chromium;
});

describe('renderCVHtml', () => {
  it('produces a self-contained document', async () => {
    const html = await renderCVHtml({
      cv: createSampleCV(),
      customization: createDefaultCustomization(),
    });

    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html).toContain('<meta name="robots" content="noindex, nofollow">');
    // The whole stylesheet a CV needs must be inlined — no external app CSS.
    expect(html).toContain('.cv-page');
    expect(html).toContain('@page');
    expect(html).toContain('Amina');
  });

  it('requests only the fonts the document actually uses', async () => {
    const html = await renderCVHtml({
      cv: createSampleCV(),
      customization: createDefaultCustomization({ bodyFont: 'lora', headingFont: 'playfair' }),
    });
    expect(html).toContain('Lora');
    expect(html).toContain('Playfair+Display');
    expect(html).not.toContain('Merriweather');
  });

  it('omits the font request entirely for web-safe stacks', async () => {
    const html = await renderCVHtml({
      cv: createSampleCV(),
      customization: createDefaultCustomization({ bodyFont: 'georgia', headingFont: 'times' }),
    });
    expect(html).not.toContain('fonts.googleapis.com');
  });

  it('adds the footer credit only when asked', async () => {
    const withBranding = await renderCVHtml({
      cv: createSampleCV(),
      customization: createDefaultCustomization(),
      branding: { label: 'Made with CreateCVOnline', url: 'createcvonline.com' },
    });
    const without = await renderCVHtml({
      cv: createSampleCV(),
      customization: createDefaultCustomization(),
      branding: null,
    });

    expect(withBranding).toContain('Made with CreateCVOnline');
    expect(without).not.toContain('cv-credit">');
  });

  it('escapes the document title', async () => {
    const cv: CVData = createSampleCV();
    cv.personal.firstName = '<script>alert(1)</script>';
    const html = await renderCVHtml({ cv, customization: createDefaultCustomization() });
    expect(html).not.toContain('<title><script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('paints the sidebar band on the body so it continues onto later pages', async () => {
    const html = await renderCVHtml({
      cv: createSampleCV(),
      // modern-03 is the reference full-bleed sidebar template.
      customization: createDefaultCustomization({ templateId: 'modern-03' }),
    });
    expect(html).toMatch(/body \{ background: linear-gradient/);
  });

  it('switches the page box with the paper size', async () => {
    const a4 = await renderCVHtml({ cv: createSampleCV(), customization: createDefaultCustomization() });
    const letter = await renderCVHtml({
      cv: createSampleCV(),
      customization: createDefaultCustomization({ paperSize: 'letter' }),
    });
    expect(a4).toContain('size: A4');
    expect(letter).toContain('size: Letter');
  });
});

describe('pdfFileName', () => {
  it('builds a filename a person is happy to see', () => {
    expect(pdfFileName(createSampleCV(), 'anything')).toBe('amina-el-fassi-cv.pdf');
  });

  it('falls back to the document title when there is no name', () => {
    const cv = createSampleCV();
    cv.personal.firstName = '';
    cv.personal.lastName = '';
    expect(pdfFileName(cv, 'Marketing application')).toBe('marketing-application-cv.pdf');
  });

  it('always yields something safe', () => {
    const cv = createSampleCV();
    cv.personal.firstName = '///';
    cv.personal.lastName = '';
    expect(pdfFileName(cv, '')).toBe('cv-cv.pdf');
  });
});

describe.skipIf(!chromium)('renderCVPdf (requires Chromium)', () => {
  it('renders a one-page CV', async () => {
    const { buffer, pageCount } = await renderCVPdf({
      cv: createMinimalCV(),
      customization: createDefaultCustomization({ templateId: 'ats-01' }),
    });
    expect(buffer.subarray(0, 5).toString()).toBe('%PDF-');
    expect(pageCount).toBe(1);
  }, 60_000);

  it('renders a multi-page CV without truncating it', async () => {
    const cv = createSampleCV();
    cv.experience = Array.from({ length: 12 }, (_, index) => ({
      ...cv.experience[0]!,
      id: `role-${index}`,
      role: `Role number ${index + 1}`,
      description: 'A deliberately long description. '.repeat(20),
      achievements: Array.from(
        { length: 6 },
        (_, position) => `Achievement ${position + 1}: ${'measurable detail '.repeat(12)}`,
      ),
    }));

    const { buffer, pageCount } = await renderCVPdf({
      cv,
      customization: createDefaultCustomization({ templateId: 'corporate-01' }),
    });

    expect(buffer.subarray(0, 5).toString()).toBe('%PDF-');
    expect(pageCount).toBeGreaterThanOrEqual(3);
    expect(countPdfPages(buffer)).toBe(pageCount);
  }, 90_000);

  it('renders a two-column sidebar template across pages', async () => {
    const { buffer, pageCount } = await renderCVPdf({
      cv: createSampleCV(),
      customization: createDefaultCustomization({ templateId: 'modern-03' }),
    });
    expect(buffer.subarray(0, 5).toString()).toBe('%PDF-');
    expect(pageCount).toBeGreaterThanOrEqual(1);
  }, 60_000);

  it('honours US Letter', async () => {
    const { buffer } = await renderCVPdf({
      cv: createSampleCV(),
      customization: createDefaultCustomization({ paperSize: 'letter', templateId: 'classic-01' }),
    });
    expect(buffer.subarray(0, 5).toString()).toBe('%PDF-');
  }, 60_000);

  it('renders a sample of templates from every category', async () => {
    const byCategory = new Map<string, string>();
    for (const template of TEMPLATES) {
      if (!byCategory.has(template.category)) byCategory.set(template.category, template.id);
    }

    for (const templateId of byCategory.values()) {
      const { buffer } = await renderCVPdf({
        cv: createSampleCV(),
        customization: createDefaultCustomization({ templateId }),
      });
      expect(buffer.subarray(0, 5).toString(), `${templateId} did not produce a PDF`).toBe('%PDF-');
    }
  }, 180_000);
});
