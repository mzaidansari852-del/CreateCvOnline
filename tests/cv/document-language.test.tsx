import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { CVDocument } from '@/components/cv/CVDocument';
import { CoverLetterDocument, formatLetterDate } from '@/components/cv/CoverLetterDocument';
import { createDefaultCustomization, createEmptyCV, createSampleCV } from '@/lib/cv/defaults';
import { defaultSectionLabels, retitleSections, setCvLanguage } from '@/lib/i18n/cv-labels';
import { displayName, formatDateRange, formatPartialDate } from '@/lib/cv/format';
import { LOCALES, type Locale } from '@/lib/i18n/locales';
import { BUILT_IN_SECTION_IDS, type CVData } from '@/types/cv';

/**
 * The language of the document, as distinct from the language of the app.
 *
 * The bug this covers was the worst one in the product and the least visible from the
 * outside: a French user signed up on `/fr`, opened the editor, and got a CV headed
 * "Work Experience", "Education", "Skills". That is not a cosmetic miss — it is the
 * document they attach to an application. The headings existed in French the whole time;
 * they were wired to the marketing previews and to nothing else.
 */

afterEach(cleanup);

describe('a CV knows what language it is written in', () => {
  it('defaults to English so documents written before the field parse unchanged', () => {
    expect(createEmptyCV().language).toBe('en');
  });

  it.each(LOCALES)('starts a new %s CV with headings in that language', (locale) => {
    const cv = createEmptyCV({ language: locale });
    const expected = defaultSectionLabels(locale);
    expect(cv.language).toBe(locale);
    for (const section of cv.sections) {
      expect(section.label, `${locale}: ${section.id}`).toBe(expected[section.id as never]);
    }
  });

  it('heads a French CV in French rather than in English', () => {
    // The specific thing the user reported, asserted on the words themselves.
    const labels = createEmptyCV({ language: 'fr' }).sections.map((s) => s.label);
    expect(labels).toContain('Expérience professionnelle');
    expect(labels).toContain('Formation');
    expect(labels).not.toContain('Work Experience');
    expect(labels).not.toContain('Education');
  });

  it('heads a German CV in the words a Lebenslauf uses', () => {
    const labels = createEmptyCV({ language: 'de' }).sections.map((s) => s.label);
    expect(labels).toContain('Berufserfahrung');
    expect(labels).toContain('Ausbildung');
    expect(labels).not.toContain('Work Experience');
  });

  it('has a heading for every section in every language', () => {
    /*
     * This started life asserting that `cv-labels.ts` agreed with a second copy of the
     * same thirteen strings on `SECTION_META.defaultLabel`. It failed on the first run —
     * "Volunteering" against "Volunteer Experience" — which is the entire argument against
     * keeping two copies, so `defaultLabel` is gone and this checks completeness instead.
     *
     * A missing entry would render `undefined` as a section heading in the PDF.
     */
    for (const locale of LOCALES) {
      const labels = defaultSectionLabels(locale);
      for (const id of BUILT_IN_SECTION_IDS) {
        expect(labels[id], `${locale}: ${id}`).toBeTruthy();
        expect(typeof labels[id], `${locale}: ${id}`).toBe('string');
      }
      // And every section the app knows about is covered, with nothing left over.
      expect(Object.keys(labels).sort()).toEqual([...BUILT_IN_SECTION_IDS].sort());
    }
  });

  it('gives each language its own wording rather than reusing English', () => {
    const en = defaultSectionLabels('en');
    for (const locale of ['fr', 'de'] as const) {
      const labels = defaultSectionLabels(locale);
      // `Publications` is legitimately identical in all three, so this is a count rather
      // than a per-section assertion.
      const shared = BUILT_IN_SECTION_IDS.filter((id) => labels[id] === en[id]);
      expect(shared.length, `${locale} reuses ${shared.join(', ')}`).toBeLessThan(3);
    }
  });
});

describe('switching a CV between languages', () => {
  it('retitles the headings the user has not touched', () => {
    const cv = createEmptyCV({ language: 'en' });
    const french = setCvLanguage(cv, 'fr');
    expect(french.language).toBe('fr');
    expect(french.sections.find((s) => s.id === 'experience')?.label).toBe(
      'Expérience professionnelle',
    );
  });

  it('never overwrites a heading the user renamed', () => {
    /*
     * The destructive case. Someone who renamed "Work Experience" to "Selected
     * Engagements" and then switches language must keep their wording — there is no undo
     * in the editor for a change the app made on its own.
     */
    const cv = createEmptyCV({ language: 'en' });
    const renamed: CVData = {
      ...cv,
      sections: cv.sections.map((s) =>
        s.id === 'experience' ? { ...s, label: 'Selected Engagements' } : s,
      ),
    };

    for (const locale of LOCALES) {
      const switched = setCvLanguage(renamed, locale);
      expect(switched.sections.find((s) => s.id === 'experience')?.label, locale).toBe(
        'Selected Engagements',
      );
      // Everything the user did *not* rename still follows the language.
      expect(switched.sections.find((s) => s.id === 'education')?.label, locale).toBe(
        defaultSectionLabels(locale).education,
      );
    }
  });

  it('round-trips back to English without stranding a translated heading', () => {
    // en → fr → de → en has to land exactly where it started, or headings accumulate the
    // residue of every language the CV has ever been in.
    const start = createEmptyCV({ language: 'en' });
    const back = setCvLanguage(setCvLanguage(setCvLanguage(start, 'fr'), 'de'), 'en');
    expect(back.sections).toEqual(start.sections);
    expect(back.language).toBe('en');
  });

  it('leaves custom sections alone entirely', () => {
    const cv = createEmptyCV({ language: 'en' });
    const withCustom: CVData = {
      ...cv,
      sections: [...cv.sections, { id: 'custom:abc', label: 'Speaking', enabled: true }],
    };
    const french = retitleSections(withCustom, 'fr');
    expect(french.sections.find((s) => s.id === 'custom:abc')?.label).toBe('Speaking');
  });

  it('does not touch the content, only the headings', () => {
    const sample = createSampleCV();
    const french = setCvLanguage(sample, 'fr');
    expect(french.experience).toEqual(sample.experience);
    expect(french.summary).toBe(sample.summary);
    expect(french.personal).toEqual(sample.personal);
  });
});

describe('dates print in the document language', () => {
  it.each([
    ['en', 'Mar 2021', 'Present'],
    ['fr', 'mars 2021', 'aujourd’hui'],
    ['de', 'März 2021', 'heute'],
  ] as [Locale, string, string][])('%s', (locale, month, present) => {
    const range = formatDateRange('2021-03', '', true, 'month-year-short', locale);
    expect(range).toContain(month);
    expect(range).toContain(present);
  });

  it('lower-cases French and German month names, which is correct', () => {
    // Only German nouns are capitalised, and French never capitalises months. Getting this
    // wrong is the visible tell of a machine translation.
    expect(formatPartialDate('2021-01', 'month-year-long', 'fr')).toBe('janvier 2021');
    expect(formatPartialDate('2021-01', 'month-year-long', 'de')).toBe('Januar 2021');
    expect(formatPartialDate('2021-01', 'month-year-long', 'en')).toBe('January 2021');
  });

  it('does not depend on the host ICU data', () => {
    /*
     * These strings go into a PDF rendered by headless Chromium, and ICU differs between
     * the local build, Vercel and Lambda. If this ever starts going through `Intl`, the
     * same CV could export with different month names depending on where it ran.
     */
    const viaIntl = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date(2021, 0));
    expect(formatPartialDate('2021-01', 'month-year-long', 'fr')).toBe(`${viaIntl} 2021`);
    // Asserted as a literal too, so the test still means something if ICU is absent.
    expect(formatPartialDate('2021-01', 'month-year-long', 'fr')).toBe('janvier 2021');
  });
});

describe('the empty-state name', () => {
  it.each([
    ['en', 'Your Name'],
    ['fr', 'Votre nom'],
    ['de', 'Ihr Name'],
  ] as [Locale, string][])('reads %s as “%s”', (locale, expected) => {
    expect(displayName(createEmptyCV({ language: locale }))).toBe(expected);
  });

  it('gives way to a real name as soon as there is one', () => {
    const cv = createEmptyCV({ language: 'fr' });
    cv.personal.firstName = 'Amina';
    cv.personal.lastName = 'El Fassi';
    expect(displayName(cv)).toBe('Amina El Fassi');
  });
});

describe('the rendered document', () => {
  it.each(LOCALES)('carries lang="%s" for hyphenation and screen readers', (locale) => {
    const cv = createEmptyCV({ language: locale });
    const { container } = render(
      <CVDocument cv={cv} customization={createDefaultCustomization()} />,
    );
    expect(container.querySelector('[data-template]')?.getAttribute('lang')).toBe(locale);
  });

  it.each(LOCALES)('prints no English placeholder on a blank %s CV', (locale) => {
    const cv = createEmptyCV({ language: locale });
    const { container } = render(
      <CVDocument cv={cv} customization={createDefaultCustomization()} />,
    );
    if (locale === 'en') return;
    expect(container.textContent ?? '').not.toContain('Your Name');
  });
});

describe('the cover letter follows its CV', () => {
  const letterFor = (locale: Locale) => {
    const cv = setCvLanguage(createSampleCV(), locale);
    const { container } = render(
      <CoverLetterDocument
        cv={cv}
        customization={createDefaultCustomization()}
        today="2026-08-14"
      />,
    );
    return container.textContent ?? '';
  };

  it('opens and closes with the right convention', () => {
    expect(letterFor('en')).toContain('Dear Hiring Manager,');
    expect(letterFor('fr')).toContain('Madame, Monsieur,');
    expect(letterFor('de')).toContain('Sehr geehrte Damen und Herren,');

    expect(letterFor('fr')).toContain('Je vous prie d’agréer');
    expect(letterFor('de')).toContain('Mit freundlichen Grüßen');
  });

  it('dates itself the way a letter in that country is dated', () => {
    expect(formatLetterDate('2026-08-14', 'en')).toBe('14 August 2026');
    expect(formatLetterDate('2026-08-14', 'fr')).toBe('le 14 août 2026');
    expect(formatLetterDate('2026-08-14', 'de')).toBe('14. August 2026');
  });

  it('never leaves an English opening on a translated letter', () => {
    for (const locale of ['fr', 'de'] as const) {
      const text = letterFor(locale);
      expect(text, locale).not.toContain('Dear ');
      expect(text, locale).not.toContain('Yours sincerely');
      expect(text, locale).not.toContain('Yours faithfully');
    }
  });
});
