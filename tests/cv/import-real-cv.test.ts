import { describe, expect, it } from 'vitest';

import { parseCvText } from '@/lib/cv/import/parse';

/**
 * Every case here came from one real CV, and every one of them was a silent failure: the
 * import completed, the review screen looked plausible, and the document was wrong.
 *
 * That CV is not exotic. It is a two-column French template with bullet glyphs that carry no
 * space, dates on their own line, the city under the date and the employer in brackets — all
 * of which the hand-written fixtures happened not to contain. It found five separate bugs in
 * a parser that passed sixteen tests, which is the argument for keeping it pinned.
 */

const REAL_SHAPE = [
  'EXPERIENCE PROFESIONNELLE',
  'Chef de projet transverse (CIRCET MOROCCO)',
  '·Assurer la maintenance curative du parc réseau mobile Orange (2100 sites).',
  '·Suivi de la maintenance préventive et respect du planning établi.',
  '11/2024 – present',
  'CASABLANCA',
  '·Gestion et élaboration des tableaux de bord et rapports des KPI.',
  'Coordinateur Du Projet Corrective & Préventive, SAMSIC MAROC',
  '•Assurer la maintenance curative du parc réseau mobile INWI (800 sites).',
  '•Gestion et animation des techniciens de maintenance selon les régions.',
  '07/2024 – 10/2024',
  'Casablanca, Maroc',
  'FORMATION',
  'Master business manager & transformation digitale, Cigma 09/2023 – 07/2024',
  'Casablanca',
  'COMPÉTENCES LINGUISTIQUES',
  'Arabe',
  'Langue Maternelle.',
  'Français',
  'Langue Professionnel',
].join('\n');

describe('a real two-column French CV', () => {
  it('does not read the city under a date as a section heading', () => {
    /*
     * `CASABLANCA` is all caps and sits on its own line, which is what a heading looks like.
     * Treating it as one opened a discard block and threw away every job below it — four of
     * five. The date directly above is what distinguishes a place from a heading.
     */
    const { data } = parseCvText(REAL_SHAPE);
    expect(data.experience).toHaveLength(2);
  });

  it('recognises a bullet glyph with no space after it', () => {
    // `•Assurer …` is a bullet. Requiring the space meant the description lines above each
    // date were read as job titles, and roles came back named after their own first bullet.
    const { data } = parseCvText(REAL_SHAPE);
    expect(data.experience?.[1]?.role).toBe('Coordinateur Du Projet Corrective & Préventive');
    expect(data.experience?.[1]?.company).toBe('SAMSIC MAROC');
  });

  it('finds the heading even when the CV spells it wrong', () => {
    // `PROFESIONNELLE`, one S short. Qualified-heading matching carries it.
    const { report } = parseCvText(REAL_SHAPE);
    expect(report.found).toContain('experience');
  });

  it('takes the employer out of the brackets', () => {
    const { data } = parseCvText(REAL_SHAPE);
    expect(data.experience?.[0]?.role).toBe('Chef de projet transverse');
    expect(data.experience?.[0]?.company).toBe('CIRCET MOROCCO');
  });

  it('does not swallow the word before a date as if it were a month', () => {
    /*
     * The month pattern was "any word", so `…, Cigma 09/2023 - 07/2024` had `Cigma` consumed
     * as the month name and the school disappeared. Every CV that writes `Employer 2019 -
     * 2021` on one line lost its employer the same way, with the entry otherwise intact.
     */
    const { data } = parseCvText(REAL_SHAPE);
    expect(data.education?.[0]?.degree).toBe('Master business manager & transformation digitale');
    expect(data.education?.[0]?.institution).toBe('Cigma');
    expect(data.education?.[0]?.startDate).toBe('2023-09');
  });

  it('reads a proficiency on its own line as a level, not a language', () => {
    const { data } = parseCvText(REAL_SHAPE);
    expect(data.languages?.map((language) => language.name)).toEqual(['Arabe', 'Français']);
    expect(data.languages?.[0]?.level).toBe('native');
    expect(data.languages?.[1]?.level).toBe('professional-working');
  });

  it('rejoins a bullet the column width broke in half', () => {
    const { data } = parseCvText(
      [
        'Compétences',
        '•Coordination, Planification et Reporting de la',
        'maintenance des sites GSM.',
      ].join('\n'),
    );
    expect(data.skills?.map((skill) => skill.name)).toContain(
      'Planification et Reporting de la maintenance des sites GSM.',
    );
  });

  it('does not weld the next job title onto an unfinished bullet', () => {
    // The other half of the rejoin rule. A line starting upper case, after a bullet that did
    // not end in a comma, begins a new entry — it is not a continuation.
    const { data } = parseCvText(
      [
        'Work Experience',
        'Coordinateur Hotline, BTSCOM',
        '•Suivie des incidents pendant les week-ends',
        '02/2021 – 12/2021',
      ].join('\n'),
    );
    expect(data.experience?.[0]?.role).toBe('Coordinateur Hotline');
  });
});
