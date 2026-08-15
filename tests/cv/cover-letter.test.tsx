import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CoverLetterDocument, formatLetterDate } from '@/components/cv/CoverLetterDocument';
import { createDefaultCustomization, createSampleCV } from '@/lib/cv/defaults';
import { fontStack } from '@/lib/cv/format';
import { TEMPLATES } from '@/lib/cv/template-registry';
import { coverLetterSchema, cvDataSchema } from '@/types/cv';
import type { CVData } from '@/types/cv';

/**
 * The cover letter.
 *
 * What is actually being sold is a *pair* — two documents that look like they came from
 * the same person — so most of these assertions are about the letter agreeing with the CV
 * rather than about the letter in isolation. The letter has no design of its own by
 * construction; these tests are what stop somebody giving it one.
 */

function letterCv(overrides: Partial<CVData['coverLetter']> = {}): CVData {
  const cv = createSampleCV();
  return {
    ...cv,
    coverLetter: coverLetterSchema.parse({ enabled: true, ...overrides }),
  };
}

describe('cover letter schema', () => {
  it('is present and off on every CV, without being asked for', () => {
    const fresh = cvDataSchema.parse({ personal: {} });
    expect(fresh.coverLetter.enabled).toBe(false);
    expect(fresh.coverLetter.body).toBe('');
  });

  it('survives a round trip through the CV schema', () => {
    // The letter rides on the CV document, so it goes through the same validation as
    // everything else on the way to Firestore. A field the schema drops is a field the
    // user loses on save.
    const cv = letterCv({ company: 'Atlas Cloud', body: 'One.\n\nTwo.', reference: 'REQ-2841' });
    const parsed = cvDataSchema.parse(cv);
    expect(parsed.coverLetter).toEqual(cv.coverLetter);
  });

  it('keeps the draft when the letter is switched off', () => {
    // `enabled` is deliberately not "has content": someone who turns the letter off to
    // send the CV alone expects the draft to still be there next week.
    const parsed = coverLetterSchema.parse({ enabled: false, body: 'Kept.' });
    expect(parsed.body).toBe('Kept.');
  });
});

describe('formatLetterDate', () => {
  it('uses the form a letter uses', () => {
    expect(formatLetterDate('2026-08-14')).toBe('14 August 2026');
    expect(formatLetterDate('2026-01-01')).toBe('1 January 2026');
  });

  it('renders nothing rather than something wrong', () => {
    // A partial date is valid on a CV — "2019" is a fine start date — and meaningless on a
    // letter. Better no date line than "NaN undefined 2019".
    expect(formatLetterDate('2026-08')).toBe('');
    expect(formatLetterDate('2026')).toBe('');
    expect(formatLetterDate('')).toBe('');
    expect(formatLetterDate('2026-13-01')).toBe('');
  });
});

describe('CoverLetterDocument', () => {
  it('is set in the same faces as the CV it belongs to', () => {
    const customization = createDefaultCustomization({
      templateId: 'classic-03',
      headingFont: 'playfair',
      bodyFont: 'lora',
      accentColor: '#7c2d12',
    });
    const { container } = render(
      <CoverLetterDocument cv={letterCv()} customization={customization} />,
    );
    const page = container.querySelector('.cv-page') as HTMLElement;

    expect(page.style.getPropertyValue('--cv-font-heading')).toBe(fontStack('playfair'));
    expect(page.style.getPropertyValue('--cv-font-body')).toBe(fontStack('lora'));
    expect(page.style.getPropertyValue('--cv-accent')).toBe('#7c2d12');
  });

  it('follows the sign-off convention', () => {
    // "Sincerely" to a named person, "faithfully" otherwise. Getting this backwards is a
    // small thing that a certain kind of reader notices immediately.
    const named = render(
      <CoverLetterDocument
        cv={letterCv({ recipientName: 'Ms Okafor' })}
        customization={createDefaultCustomization()}
      />,
    );
    expect(named.container.textContent).toContain('Dear Ms Okafor,');
    expect(named.container.textContent).toContain('Yours sincerely,');

    const anonymous = render(
      <CoverLetterDocument cv={letterCv()} customization={createDefaultCustomization()} />,
    );
    expect(anonymous.container.textContent).toContain('Dear Hiring Manager,');
    expect(anonymous.container.textContent).toContain('Yours faithfully,');
  });

  it('lets the user override either', () => {
    const { container } = render(
      <CoverLetterDocument
        cv={letterCv({ recipientName: 'Ms Okafor', salutation: 'Hi Adaeze', signOff: 'Best,' })}
        customization={createDefaultCustomization()}
      />,
    );
    expect(container.textContent).toContain('Hi Adaeze');
    expect(container.textContent).toContain('Best,');
    expect(container.textContent).not.toContain('Yours sincerely');
  });

  it('signs with the CV name unless told otherwise', () => {
    const fromCv = render(
      <CoverLetterDocument cv={letterCv()} customization={createDefaultCustomization()} />,
    );
    expect(fromCv.container.textContent).toContain('Amina El Fassi');

    const explicit = render(
      <CoverLetterDocument
        cv={letterCv({ signature: 'A. El Fassi' })}
        customization={createDefaultCustomization()}
      />,
    );
    expect(explicit.container.textContent).toContain('A. El Fassi');
  });

  it('splits the body on blank lines, as every other long field does', () => {
    const { container } = render(
      <CoverLetterDocument
        cv={letterCv({ body: 'First para.\n\nSecond para.\n\nThird para.' })}
        customization={createDefaultCustomization()}
      />,
    );
    const text = container.textContent ?? '';
    for (const para of ['First para.', 'Second para.', 'Third para.']) {
      expect(text).toContain(para);
    }
  });

  it('dates itself only when it has a real date', () => {
    const undated = render(
      <CoverLetterDocument cv={letterCv()} customization={createDefaultCustomization()} />,
    );
    expect(undated.container.textContent).not.toMatch(/\d{4}/);

    const stamped = render(
      <CoverLetterDocument
        cv={letterCv()}
        customization={createDefaultCustomization()}
        today="2026-08-14"
      />,
    );
    expect(stamped.container.textContent).toContain('14 August 2026');

    // An explicit date beats "today".
    const explicit = render(
      <CoverLetterDocument
        cv={letterCv({ date: '2026-03-02' })}
        customization={createDefaultCustomization()}
        today="2026-08-14"
      />,
    );
    expect(explicit.container.textContent).toContain('2 March 2026');
    expect(explicit.container.textContent).not.toContain('August');
  });

  it('builds a subject line only from what it was given', () => {
    const both = render(
      <CoverLetterDocument
        cv={letterCv({ vacancy: 'Senior Product Designer', reference: 'REQ-2841' })}
        customization={createDefaultCustomization()}
      />,
    );
    expect(both.container.textContent).toContain('Application for Senior Product Designer');
    expect(both.container.textContent).toContain('Ref REQ-2841');

    const neither = render(
      <CoverLetterDocument cv={letterCv()} customization={createDefaultCustomization()} />,
    );
    // No stray separator or empty "Application for" line.
    expect(neither.container.textContent).not.toContain('Application for');
    expect(neither.container.textContent).not.toContain('Ref ');
  });

  it('renders against every template without throwing', () => {
    // The letter takes the CV's customization, which includes whatever the template set as
    // its defaults — including margins wide enough to matter and faces with no bold.
    for (const template of TEMPLATES) {
      const customization = createDefaultCustomization({
        templateId: template.id,
        headingFont: template.fonts.heading,
        bodyFont: template.fonts.body,
        accentColor: template.accentDefault,
        pageMargin: template.metrics.pageMargin,
        lineHeight: template.metrics.lineHeight,
      });
      expect(() =>
        render(
          <CoverLetterDocument
            cv={letterCv({ body: 'A paragraph.' })}
            customization={customization}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('has no landmark of its own that would nest inside the page', () => {
    // The document is rendered inside the app's `<main>`; a second one here breaks "skip
    // to main content" and landmark navigation, which is a bug this codebase has had once.
    const { container } = render(
      <CoverLetterDocument cv={letterCv()} customization={createDefaultCustomization()} />,
    );
    expect(container.querySelector('main')).toBeNull();
  });
});
