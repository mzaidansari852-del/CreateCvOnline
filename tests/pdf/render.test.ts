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

  it('puts the letter in front of the CV when there is one', async () => {
    const cv = createSampleCV();
    cv.coverLetter = {
      ...cv.coverLetter,
      enabled: true,
      company: 'Atlas Cloud',
      vacancy: 'Senior Product Designer',
      body: 'A short letter body.',
    };

    const html = await renderCVHtml({
      cv,
      customization: createDefaultCustomization(),
      document: 'cv+letter',
    });

    // One file, two documents, in reading order: the letter explains the CV behind it.
    expect(html).toContain('data-document="cover-letter"');
    // Both sheets carry `data-template`; the last one is the CV, because the letter is
    // emitted first. Comparing against the first occurrence would compare the letter's
    // own two attributes with each other.
    expect(html.indexOf('data-document="cover-letter"')).toBeLessThan(
      html.lastIndexOf('data-template='),
    );
    expect(html).toContain('class="cv-page cv-page-break"');
    expect(html).toContain('Application for Senior Product Designer');
  });

  it('leaves the CV alone when the letter is switched off', async () => {
    const html = await renderCVHtml({
      cv: createSampleCV(),
      customization: createDefaultCustomization(),
      document: 'cv+letter',
    });
    expect(html).not.toContain('data-document="cover-letter"');
    // The rule stays in the stylesheet; what must be absent is anything using it.
    expect(html).not.toContain('class="cv-page cv-page-break"');
  });

  it('does not paint the CV sidebar band behind the letter', async () => {
    /*
     * The band is painted on `<body>` so that it survives a page break, which means it
     * would also run down a letter sharing the same file — a stripe of colour beside a
     * document that has no sidebar in it. So a pair export drops the body background and
     * lets the CV page paint its own.
     */
    const cv = createSampleCV();
    cv.coverLetter = { ...cv.coverLetter, enabled: true, body: 'Body.' };

    const pair = await renderCVHtml({
      cv,
      customization: createDefaultCustomization({ templateId: 'modern-03' }),
      document: 'cv+letter',
    });
    const alone = await renderCVHtml({
      cv,
      customization: createDefaultCustomization({ templateId: 'modern-03' }),
      document: 'cv',
    });

    expect(alone).toMatch(/body \{ background: linear-gradient/);
    expect(pair).not.toMatch(/body \{ background: linear-gradient/);
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

/**
 * The text Chromium actually drew.
 *
 * Reading it back matters more here than in most PDF assertions. A PDF's content streams
 * are Flate-compressed and its fonts are subsetted, so the raw bytes contain neither
 * "Page 2 of 3" nor the candidate's name — but they *do* contain the name in the
 * uncompressed `/Title` metadata. A test that searches the buffer directly therefore
 * passes on a completely absent footer, which is the single outcome this is here to catch.
 *
 * `pdftotext` (poppler) does the decoding properly. Where it is not installed the
 * assertion is skipped rather than weakened, the same way the whole block is skipped
 * without Chromium: a test that cannot tell the difference is worse than one that admits
 * it did not run.
 */
function findPdfToText(): string | null {
  for (const candidate of ['/usr/bin/pdftotext', '/usr/local/bin/pdftotext', '/opt/homebrew/bin/pdftotext']) {
    try {
      accessSync(candidate);
      return candidate;
    } catch {
      /* keep looking */
    }
  }
  return null;
}

const pdftotext = findPdfToText();

async function pdfText(buffer: Buffer): Promise<string> {
  const { execFileSync } = await import('node:child_process');
  const { writeFileSync, rmSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { tmpdir } = await import('node:os');

  const file = join(tmpdir(), `cv-pdf-assert-${buffer.byteLength}.pdf`);
  writeFileSync(file, buffer);
  try {
    return execFileSync(pdftotext!, [file, '-'], { encoding: 'utf8', maxBuffer: 1 << 26 });
  } finally {
    rmSync(file, { force: true });
  }
}

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

  it.skipIf(!pdftotext)('numbers the pages and repeats the name once a CV runs long', async () => {
    /*
     * Two sheets with nothing tying them together is the failure this guards: page two
     * gets separated or printed alone, and there is nothing on it saying whose CV it is.
     *
     * Asserted against the rendered PDF rather than the options passed to Chromium, because
     * the two obvious CSS routes to a page number both *look* right and produce nothing —
     * `@page` margin boxes render blank in Chromium, and `counter(page)` resolves to 0.
     * Only reading the bytes back distinguishes a working footer from either of those.
     */
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
    expect(pageCount).toBeGreaterThan(1);

    const text = await pdfText(buffer);
    for (let page = 1; page <= pageCount; page++) {
      expect(text, `footer on page ${page} of ${pageCount}`).toContain(
        `Page ${page} of ${pageCount}`,
      );
    }
    // The identity, repeated: the reason the footer exists at all.
    expect(text.match(/Amina El Fassi/g)?.length ?? 0).toBeGreaterThanOrEqual(pageCount);
  }, 90_000);

  it.skipIf(!pdftotext)('leaves a one-page CV without a footer', async () => {
    // The footer costs 11mm of page height. A CV that already fits on one page must not
    // pay for a page marker it does not need — and must not be pushed onto a second page
    // by the strip reserved to say it is on a second page.
    const { buffer, pageCount } = await renderCVPdf({
      cv: createMinimalCV(),
      customization: createDefaultCustomization({ templateId: 'ats-01' }),
    });
    expect(pageCount).toBe(1);
    expect(await pdfText(buffer)).not.toContain('Page 1 of 1');
  }, 60_000);

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
