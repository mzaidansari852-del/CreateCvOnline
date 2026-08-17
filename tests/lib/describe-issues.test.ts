import { describe, expect, it } from 'vitest';

import { describeIssues, type IssueCopy } from '@/components/editor/describeIssues';
import { cvDataSchema } from '@/types/cv';

/**
 * The message that ends a save failure instead of restating it.
 *
 * A user completed an entire CV while every autosave was refused with "Some of the submitted
 * values are not valid". Fifteen sections, no clue which one, and retrying could never fix
 * it. The cause was one date typed as free text — and the server had said so on *every*
 * attempt: `data.experience.0.startDate — Use YYYY, YYYY-MM or YYYY-MM-DD` was in the
 * response body, discarded one layer below the screen that needed it.
 *
 * Verified against production before this was written: `Janvier 2022`, `2023-2024`,
 * `aujourd'hui`, `2024-13` and `01/2022` each return 422 with exactly that path.
 */

const copy: IssueCopy = {
  entry: (label, index) => `${label} — entrée ${index}`,
  dateFormat: 'Indiquez une année (2024) ou une année et un mois (2024-06).',
  tooLong: 'Ce texte dépasse la longueur maximale autorisée.',
};

/** A document whose section labels are French and author-renamed, as a real one would be. */
const data = cvDataSchema.parse({
  personal: {},
  sections: [
    { id: 'experience', label: 'Mon parcours', enabled: true },
    { id: 'projects', label: 'Projets', enabled: true },
  ],
});

describe('describeIssues', () => {
  it('names the section, the entry and the field', () => {
    const lines = describeIssues(
      [{ path: 'data.experience.0.startDate', message: 'Use YYYY, YYYY-MM or YYYY-MM-DD' }],
      data,
      copy,
    );
    expect(lines).toHaveLength(1);
    // The label the author gave the section, not the schema key.
    expect(lines[0]).toContain('Mon parcours');
    expect(lines[0]).toContain('entrée 1');
    expect(lines[0]).toContain('start date');
    expect(lines[0]).toContain('2024-06');
  });

  it('counts entries from 1, not 0', () => {
    // `data.projects.2` is the third project on screen. Reporting "entry 2" would send
    // someone to the wrong row, which is worse than reporting nothing.
    const lines = describeIssues([{ path: 'data.projects.2.endDate', message: 'x' }], data, copy);
    expect(lines[0]).toContain('entrée 3');
  });

  it('collapses the two complaints Zod makes about one bad date', () => {
    /*
     * A free-text date trips both the 10-character cap and the format refinement, so the
     * raw issues name the same field twice with different messages. Printing both reads as
     * two problems.
     */
    const lines = describeIssues(
      [
        { path: 'data.experience.0.startDate', message: 'Too big: expected string to have <=10' },
        { path: 'data.experience.0.startDate', message: 'Use YYYY, YYYY-MM or YYYY-MM-DD' },
      ],
      data,
      copy,
    );
    expect(lines).toHaveLength(1);
    // And the surviving line is the actionable one, not "too long".
    expect(lines[0]).toContain('2024-06');
    expect(lines[0]).not.toContain('longueur maximale');
  });

  it('translates a length complaint on a normal field', () => {
    const lines = describeIssues(
      [
        {
          path: 'data.experience.0.description',
          message: 'Too big: expected string to have <=3000',
        },
      ],
      data,
      copy,
    );
    expect(lines[0]).toContain('longueur maximale');
  });

  it('reports separate fields separately', () => {
    const lines = describeIssues(
      [
        { path: 'data.experience.0.startDate', message: 'Use YYYY' },
        { path: 'data.experience.1.endDate', message: 'Use YYYY' },
        { path: 'data.projects.0.startDate', message: 'Use YYYY' },
      ],
      data,
      copy,
    );
    expect(lines).toHaveLength(3);
  });

  it('falls back to the schema key when the document has no label for a section', () => {
    // `certifications` is not in this document's `sections`, and must still be identified.
    const lines = describeIssues(
      [{ path: 'data.certifications.0.expiryDate', message: 'Use YYYY' }],
      data,
      copy,
    );
    expect(lines[0]).toContain('certifications');
    expect(lines[0]).toContain('expiry date');
  });

  it('handles a path with no index, and an empty list', () => {
    expect(describeIssues([{ path: 'data.summary', message: 'Too big' }], data, copy)).toHaveLength(
      1,
    );
    expect(describeIssues([], data, copy)).toEqual([]);
  });

  it('never throws on a path it cannot parse', () => {
    // This comes off the wire. A malformed path must degrade, not break the editor's render.
    for (const path of ['', 'data', 'data.', '...', 'weird']) {
      expect(() => describeIssues([{ path, message: 'x' }], data, copy)).not.toThrow();
    }
  });
});
