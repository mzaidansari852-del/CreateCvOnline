import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getDocumentProxy } from 'unpdf';

import { readLayout, toMarkedText } from '@/lib/cv/import/layout';
import { isKnownSectionHeading, parseCvText } from '@/lib/cv/import/parse';

/**
 * A second template, chosen because it contradicts the first.
 *
 * Sidebar down the left; section headings set *smaller* than the body and in capitals; entry
 * titles set larger; dates right-aligned. Every rule that the first fixture confirmed, this
 * one breaks — which is the point. An importer is only as general as the number of layouts
 * it has been shown, and two that disagree are worth more than ten that agree.
 */

async function marked() {
  const bytes = new Uint8Array(readFileSync('tests/fixtures/sidebar-en.pdf'));
  const layout = await readLayout((await getDocumentProxy(bytes)) as never);
  return { layout, text: toMarkedText(layout, isKnownSectionHeading) };
}

describe('a sidebar template', () => {
  it('separates the sidebar from the body instead of interleaving them', async () => {
    /*
     * Read as one column, this comes out as `Gestion de projet` / `Coordinatrice de projet,
     * huit ans…` / `Reporting KPI` / … — the skills list threaded line by line through the
     * work history, and nothing downstream can recover from it.
     */
    const { layout, text } = await marked();
    expect(layout.multiColumn).toBe(true);
    const lines = text.split('\n');
    const skills = lines.indexOf('# SKILLS');
    const languages = lines.indexOf('# LANGUAGES');
    expect(skills).toBeGreaterThanOrEqual(0);
    // Everything between the two sidebar headings belongs to the sidebar.
    expect(lines.slice(skills + 1, languages).join(' ')).not.toMatch(/télécom|maintenance/);
  });

  it('finds headings that are smaller than the body text', async () => {
    // The first fixture sets headings larger. Judging by size alone finds the job titles
    // here and misses every section, so the band is confirmed against known section names.
    const { text } = await marked();
    const headings = text
      .split('\n')
      .filter((line) => line.startsWith('# '))
      .map((line) => line.slice(2));
    expect(headings).toContain('WORK EXPERIENCE');
    expect(headings).toContain('EDUCATION');
    expect(headings).toContain('SKILLS');
  });

  it('does not mistake a right-aligned date for a section heading', async () => {
    // The dates are set at the same size as the headings in this template — position is
    // what separates them, and every date became a section before it was used.
    const { text } = await marked();
    const headings = text.split('\n').filter((line) => line.startsWith('# '));
    expect(headings.some((line) => /\d{4}/.test(line))).toBe(false);
  });

  it('reads the name, which is in the second column', async () => {
    /*
     * Columns are emitted largest-text-first rather than left-to-right. Reading this one
     * left-to-right put the whole sidebar — headings included — ahead of the name, so the
     * header block was empty and the name was swallowed by the sidebar's last section.
     */
    const { data } = parseCvText((await marked()).text, { locale: 'en' });
    expect(data.personal?.firstName).toBe('Nadia');
    expect(data.personal?.email).toBe('nadia.belhaj@example.com');
  });

  it('reads each job with the employer printed below its dates', async () => {
    const { data } = parseCvText((await marked()).text, { locale: 'en' });
    expect(data.experience).toHaveLength(2);
    expect(data.experience?.[0]?.role).toBe('Cheffe de projet transverse');
    expect(data.experience?.[0]?.company).toBe('ORBINET MAROC');
    expect(data.experience?.[0]?.current).toBe(true);
    expect(data.experience?.[1]?.company).toBe('TALVENT MAROC');
  });

  it('leaves no structural marks in the content it stores', async () => {
    // `##` is how the layout says "entry title". A name that reads `## Nadia Belhaj` is
    // that structure leaking into the document the user is about to send to an employer.
    const { data } = parseCvText((await marked()).text, { locale: 'en' });
    expect(JSON.stringify(data)).not.toContain('##');
  });
});
