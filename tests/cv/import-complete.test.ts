import { describe, expect, it } from 'vitest';

import { completeCv } from '@/lib/cv/import/complete';
import { parseCvText } from '@/lib/cv/import/parse';
import { cvDataSchema } from '@/types/cv';

/**
 * The step between "we read the CV" and "the CV renders".
 *
 * `CVData.sections` is the render order and the editor's sidebar, and the parser does not
 * produce it. Nothing in the type system says so — `sections` defaults to `[]` — so a CV
 * with a complete work history and no sections validates cleanly, saves cleanly, and then
 * renders as a blank page with a name on it. That shipped. These tests are the guard.
 */

const FRENCH_CV = [
  'Saad Example',
  'Coordinateur de projet',
  'saad@example.com | 0655934432',
  'Profil',
  'Coordinateur de projet, huit ans dans la transformation industrielle.',
  'Expérience professionnelle',
  'Coordinateur de projet',
  'Groupe Meridian',
  'Depuis janvier 2021',
  'Pilotage de projets de transformation.',
  'Formation',
  'Master Management de Projet',
  'Université de Lyon',
  'septembre 2016 – juin 2018',
  'Compétences',
  'Gestion de projet, Budget, Reporting, Excel',
].join('\n');

describe('completeCv', () => {
  it('gives a parsed CV the section list it needs to render', () => {
    const { data } = parseCvText(FRENCH_CV);
    // What the parser alone produces: content, and nothing to render it with.
    expect(cvDataSchema.parse(data).sections).toEqual([]);

    const cv = completeCv(cvDataSchema.parse(data), 'fr');
    expect(cv.sections.length).toBeGreaterThan(0);
    for (const id of ['experience', 'education', 'skills', 'summary'] as const) {
      const section = cv.sections.find((entry) => entry.id === id);
      expect(section, `${id} must be listed`).toBeDefined();
      expect(section?.enabled, `${id} must be enabled`).toBe(true);
    }
  });

  it('keeps the content the parser found', () => {
    const cv = completeCv(cvDataSchema.parse(parseCvText(FRENCH_CV).data), 'fr');
    expect(cv.experience).toHaveLength(1);
    expect(cv.education).toHaveLength(1);
    expect(cv.personal.email).toBe('saad@example.com');
  });

  it('labels the sections in the account language', () => {
    // A French CV whose headings render in English is the same bug wearing a hat: the data
    // is there, and what the employer receives is still wrong.
    const cv = completeCv(cvDataSchema.parse(parseCvText(FRENCH_CV).data), 'fr');
    expect(cv.language).toBe('fr');
    expect(cv.sections.find((entry) => entry.id === 'experience')?.label).toMatch(/Expérience/i);
  });

  it('does not overwrite the sections an export already carries', () => {
    const exported = cvDataSchema.parse({
      personal: { firstName: 'Nadia' },
      sections: [{ id: 'skills', label: 'Mes atouts', enabled: true }],
    });
    const cv = completeCv(exported, 'en');
    expect(cv.sections).toEqual([{ id: 'skills', label: 'Mes atouts', enabled: true }]);
  });

  it('switches on a section that has content but defaults to off', () => {
    const withProjects = cvDataSchema.parse({
      personal: { firstName: 'Nadia' },
      projects: [{ id: 'p1', name: 'Atlas migration', description: 'Moved four sites.' }],
    });
    const projects = completeCv(withProjects, 'en').sections.find((s) => s.id === 'projects');
    expect(projects?.enabled).toBe(true);
  });
});
