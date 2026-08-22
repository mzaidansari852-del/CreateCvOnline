import { describe, expect, it } from 'vitest';

import { cvFromModel } from '@/lib/cv/import/from-model';
import { cvDataSchema } from '@/types/cv';

/**
 * The boundary where a model's answer becomes a stored document.
 *
 * A JSON Schema constrains the *shape* of a reply, not its contents. Nothing in one stops a
 * date coming back as "summer 2019", a proficiency as "very good", or an achievements array
 * with four hundred entries — so everything below is about what happens when the model
 * returns something well-formed and wrong, which is the only interesting case.
 */

describe('cvFromModel', () => {
  it('mints its own ids rather than trusting any it is given', () => {
    const { data } = cvFromModel({
      experience: [{ role: 'Engineer', company: 'Atlas' }],
      education: [{ degree: 'BSc', institution: 'Bristol' }],
    });
    const ids = [data.experience![0]!.id, data.education![0]!.id];
    expect(ids.every((id) => typeof id === 'string' && id.length > 0)).toBe(true);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('discards a date it cannot trust instead of coercing it', () => {
    /*
     * "Summer 2019" is not a date, and the tempting repair — take the year, guess a month —
     * writes a start date the CV never claimed. An empty field the user fills in is honest;
     * a fabricated June is not, and it is the kind of thing nobody re-reads.
     */
    const { data } = cvFromModel({
      experience: [
        { role: 'A', startDate: 'summer 2019', endDate: '2019-13' },
        { role: 'B', startDate: '2020-3', endDate: '07/2021' },
      ],
    });
    expect(data.experience![0]!.startDate).toBe('');
    expect(data.experience![0]!.endDate).toBe('2019'); // month out of range: keep the year
    expect(data.experience![1]!.startDate).toBe('2020-03');
    expect(data.experience![1]!.endDate).toBe('2021-07');
  });

  it('clears the end date of a current role', () => {
    const { data } = cvFromModel({
      experience: [{ role: 'A', current: true, endDate: '2024-01' }],
    });
    expect(data.experience![0]!.current).toBe(true);
    expect(data.experience![0]!.endDate).toBe('');
  });

  it('survives values of the wrong type entirely', () => {
    // Well-formed JSON is not the same as well-typed content, and a crash here is a 500 on
    // an upload that would have worked with the rules-based reader.
    const { data } = cvFromModel({
      personal: { firstName: 42 as never, email: null as never },
      experience: [{ role: { nested: true } as never, achievements: [1, 2] as never }],
      skills: [{ name: undefined }, { name: 'Excel' }],
    });
    expect(data.personal!.firstName).toBe('');
    expect(data.experience![0]!.role).toBe('');
    expect(data.experience![0]!.achievements).toEqual([]);
    expect(data.skills!.map((skill) => skill.name)).toEqual(['Excel']);
  });

  it('caps a runaway response rather than storing it', () => {
    const { data } = cvFromModel({
      experience: Array.from({ length: 200 }, () => ({ role: 'A' })),
      skills: Array.from({ length: 500 }, (_, index) => ({ name: `S${index}` })),
    });
    expect(data.experience!.length).toBeLessThanOrEqual(40);
    expect(data.skills!.length).toBeLessThanOrEqual(80);
  });

  it('maps proficiencies written in any of the four languages', () => {
    const { data } = cvFromModel({
      languages: [
        { name: 'Arabe', level: 'Langue Maternelle' },
        { name: 'Français', level: 'courant' },
        { name: 'Deutsch', level: 'Grundkenntnisse' },
        { name: 'English', level: 'professional working' },
      ],
    });
    expect(data.languages!.map((language) => language.level)).toEqual([
      'native',
      'full-professional',
      'elementary',
      'professional-working',
    ]);
  });

  it('keeps a section that matches no field, under its own title', () => {
    const { data, report } = cvFromModel({
      customSections: [
        {
          title: 'Certifications',
          items: [{ heading: 'PRINCE2 Practitioner', subheading: 'PeopleCert', date: '2017' }],
        },
        // No items: nothing to keep, so nothing is kept.
        { title: 'References', items: [] },
      ],
    });
    expect(report.custom).toEqual(['Certifications']);
    expect(data.customSections).toHaveLength(1);
  });

  it('produces something the stored schema accepts', () => {
    // The real guarantee. Everything above is narrowing; this is the check that the
    // narrowing is sufficient, and it is what the route relies on before saving.
    const { data } = cvFromModel({
      personal: { firstName: 'Nadia', email: 'nadia@example.com' },
      summary: 'x'.repeat(9000),
      experience: [{ role: 'Engineer', company: 'Atlas', startDate: '2020-01', current: true }],
      languages: [{ name: 'French', level: 'nonsense' }],
      customSections: [{ title: 'Awards', items: [{ heading: 'Prize' }] }],
    });
    const parsed = cvDataSchema.safeParse(data);
    expect(parsed.success, JSON.stringify(parsed.error?.issues?.slice(0, 3))).toBe(true);
  });

  it('reports nothing found when the model returns an empty object', () => {
    // The route treats this as a failure and falls back, rather than showing an empty
    // review screen while the rules-based reader beside it would have found five jobs.
    const { report } = cvFromModel({});
    expect(report.found).toEqual([]);
  });
});
