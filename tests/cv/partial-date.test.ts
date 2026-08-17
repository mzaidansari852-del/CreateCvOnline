import { describe, expect, it } from 'vitest';

import { isValidPartialDate, normalisePartialDate } from '@/lib/cv/partial-date';
import { partialDateSchema } from '@/types/cv';

/**
 * A hand-typed date must never be able to lock someone out of their own CV.
 *
 * `<input type="month">` guarantees `YYYY-MM` on a browser that implements it, and degrades
 * to a plain text box on one that does not. A user on Firefox typed their education dates
 * the way dates are written; `partialDateSchema` refused the document; the same value went
 * back up on every retry, so the autosave could never recover. Every save from that moment
 * failed with "Some of the submitted values are not valid" and no indication of where.
 *
 * The property that matters is the last test in this file: whatever this function returns,
 * the schema accepts it. Everything above is about returning something *useful*.
 */

describe('normalisePartialDate', () => {
  it('leaves an already-valid value alone', () => {
    for (const value of ['2024', '2024-06', '2024-06-15', '1999-12-31']) {
      expect(normalisePartialDate(value)).toBe(value);
    }
  });

  it('treats empty as empty, not as unreadable', () => {
    // A blank date means "not stated" and is perfectly valid; it must not become `null`.
    expect(normalisePartialDate('')).toBe('');
    expect(normalisePartialDate('   ')).toBe('');
  });

  it('reads numeric dates in either order', () => {
    expect(normalisePartialDate('01/2022')).toBe('2022-01');
    expect(normalisePartialDate('1/2022')).toBe('2022-01');
    expect(normalisePartialDate('12.2022')).toBe('2022-12');
    expect(normalisePartialDate('2022/01')).toBe('2022-01');
  });

  it('reads month names in all three shipped languages', () => {
    expect(normalisePartialDate('Jan 2022')).toBe('2022-01');
    expect(normalisePartialDate('January 2022')).toBe('2022-01');
    expect(normalisePartialDate('Janvier 2022')).toBe('2022-01');
    expect(normalisePartialDate('mars 2019')).toBe('2019-03');
    expect(normalisePartialDate('März 2019')).toBe('2019-03');
    expect(normalisePartialDate('Oktober 2020')).toBe('2020-10');
    expect(normalisePartialDate('août 2021')).toBe('2021-08');
  });

  it('separates juin from juillet', () => {
    // Both start `jui`, so a prefix table alone gets one of them wrong.
    expect(normalisePartialDate('juin 2022')).toBe('2022-06');
    expect(normalisePartialDate('juillet 2022')).toBe('2022-07');
  });

  it('takes the first year when a range was typed into one box', () => {
    expect(normalisePartialDate('2023 - 2024')).toBe('2023');
    expect(normalisePartialDate('2023 à 2024')).toBe('2023');
    expect(normalisePartialDate('2023-2024')).toBe('2023');
  });

  it('refuses to invent a month it was not given', () => {
    expect(normalisePartialDate('2022')).toBe('2022');
    expect(normalisePartialDate('en 2022')).toBe('2022');
  });

  it('rejects a month number that is not a month', () => {
    // `2024-13` was one of the values that broke a real document.
    expect(normalisePartialDate('2024-13')).toBe('2024');
    expect(normalisePartialDate('99/2024')).toBe('2024');
  });

  it('gives up rather than guess when there is no year at all', () => {
    for (const value of ["aujourd'hui", 'present', 'now', 'à ce jour', '—', 'abc']) {
      expect(normalisePartialDate(value)).toBeNull();
    }
  });

  it('accepts what the schema accepts, and nothing else', () => {
    expect(isValidPartialDate('')).toBe(true);
    expect(isValidPartialDate('2024-06')).toBe(true);
    expect(isValidPartialDate('2024-13')).toBe(false);
    expect(isValidPartialDate('Janvier 2022')).toBe(false);
  });

  it('NEVER returns something the schema would reject', () => {
    /*
     * The whole point. Every one of these is a value that a real text box can produce, and
     * the editor writes this function's output straight into the document — so a single
     * escape here is another CV that cannot be saved.
     */
    const inputs = [
      '',
      '   ',
      '2024',
      '2024-06',
      '2024-06-15',
      '2024-13',
      '2024-00',
      '0/2024',
      '99/2024',
      'Janvier 2022',
      'juillet 2022',
      'März 2019',
      'Sept 2020',
      'aujourd’hui',
      'present',
      '2023 - 2024',
      '2023/2024',
      '01/01/2022',
      '2022.13',
      '  2019  ',
      'depuis 2021',
      '31/12/1999',
      'x',
      '20244',
      '19',
      '2024-6',
      '2024-006',
      'jan',
      '—',
      '2024 —',
    ];
    for (const input of inputs) {
      const out = normalisePartialDate(input);
      const stored = out ?? '';
      expect(
        partialDateSchema.safeParse(stored).success,
        `${JSON.stringify(input)} → ${JSON.stringify(stored)}`,
      ).toBe(true);
    }
  });
});
