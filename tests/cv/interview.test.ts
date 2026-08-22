import { describe, expect, it, vi } from 'vitest';

import { hasEnoughToBuild, interviewAnswersSchema } from '@/lib/cv/interview/questions';

/**
 * The interview's guardrail.
 *
 * The importer's worst failure is losing a bullet — visible, and the review screen catches
 * it. This feature's worst failure is the opposite: a model given "I managed the maintenance
 * team" will happily return "Led a team of 12 technicians, cutting response time by 30%".
 * Fluent, plausible, and a fabricated credential on a document about to be sent to employers.
 * Nobody proof-reads a sentence that flatters them.
 *
 * So the tests that matter here are not about parsing. They are about what happens when the
 * model ignores the instruction — which it eventually will, silently and convincingly.
 */

const ANSWERS = interviewAnswersSchema.parse({
  fullName: 'Nadia Belhaj',
  targetRole: 'Project coordinator',
  email: 'nadia@example.com',
  jobs: [
    {
      role: 'Project coordinator',
      company: 'Orbinet',
      period: 'January 2021 to now',
      did: 'I managed the maintenance team and did the monthly reports.',
      numbers: 'about 15 people',
    },
  ],
  education: [{ qualification: 'Master in Marketing', school: 'Kenitra', year: '2021' }],
  skills: 'Project management, Excel',
});

/**
 * Stands in for the model, so the guard can be tested against a reply that breaks the rules.
 * Mocked at the module boundary rather than over the network: what is under test is what
 * happens to a bad answer, not how it arrived.
 */
async function generateWith(reply: Record<string, unknown>) {
  vi.resetModules();
  vi.doMock('@/lib/cv/import/ai', () => ({
    extractWithModel: vi.fn().mockResolvedValue(reply),
    aiExtractionAvailable: () => true,
    AiExtractionError: class extends Error {},
  }));
  const { generateFromInterview } = await import('@/lib/cv/interview/generate');
  return generateFromInterview(ANSWERS, 'en');
}

describe('building a CV from answers', () => {
  it('drops a bullet carrying a figure the user never gave', async () => {
    /*
     * The whole reason this feature has a guard rather than only a prompt. The user said
     * "about 15 people" and nothing else; "30%" and "four sites" came from nowhere, and a
     * CV claiming them is one an interviewer can disprove.
     */
    const { data, removed } = await generateWith({
      experience: [
        {
          role: 'Project coordinator',
          company: 'Orbinet',
          startDate: '2021-01',
          current: true,
          achievements: [
            'Managed a maintenance team of 15 technicians.',
            'Cut average response time by 30%.',
            'Oversaw maintenance across four sites, improving uptime by 12%.',
          ],
        },
      ],
    });

    expect(data.experience?.[0]?.achievements).toEqual([
      'Managed a maintenance team of 15 technicians.',
    ]);
    expect(removed).toBe(2);
  });

  it('keeps bullets with no figures in them at all', async () => {
    // The common case: someone who left the numbers question blank still gets a CV, it just
    // has plain sentences on it. That is the honest outcome, not a degraded one.
    const { data, removed } = await generateWith({
      experience: [
        {
          role: 'Project coordinator',
          achievements: ['Managed the maintenance team.', 'Produced the monthly reports.'],
        },
      ],
    });
    expect(data.experience?.[0]?.achievements).toHaveLength(2);
    expect(removed).toBe(0);
  });

  it('does not treat a year the user wrote as an invented figure', async () => {
    /*
     * `2021` appears in the answers as a graduation year and in `period` as a start year, and
     * the model is explicitly asked to turn "January 2021 to now" into `2021-01`. A guard
     * that flagged derived dates would strip correct bullets out of every entry.
     */
    const { data } = await generateWith({
      experience: [
        {
          role: 'Project coordinator',
          startDate: '2021-01',
          achievements: ['Ran the reporting cycle from 2021 onwards.'],
        },
      ],
      education: [{ degree: 'Master in Marketing', institution: 'Kenitra', startDate: '2021' }],
    });
    expect(data.experience?.[0]?.achievements).toHaveLength(1);
    expect(data.education?.[0]?.startDate).toBe('2021');
  });

  it('uses the contact details the user typed, not the model’s version of them', async () => {
    // There is nothing to infer in an e-mail address, and a model that "tidies" one has
    // broken it. The same goes for a name it decides to capitalise differently.
    const { data } = await generateWith({
      personal: { firstName: 'NADIA', lastName: 'BELHAJ', email: 'nadia@exampel.com' },
      experience: [{ role: 'Project coordinator', achievements: ['Managed the team.'] }],
    });
    expect(data.personal?.email).toBe('nadia@example.com');
  });
});

describe('hasEnoughToBuild', () => {
  it('refuses a name with no history behind it', () => {
    // A CV with a name and nothing else is a blank template with extra steps, and generating
    // one costs a request to produce something the editor would have given away.
    const empty = interviewAnswersSchema.parse({ fullName: 'Nadia Belhaj' });
    expect(hasEnoughToBuild(empty)).toBe(false);
  });

  it('accepts one job, or one qualification, and nothing more', () => {
    /*
     * Deliberately low. Someone with a single job and no degree should get a document they
     * can finish in the editor rather than a refusal — the editor is better at the rest of
     * it than this is.
     */
    const oneJob = interviewAnswersSchema.parse({
      fullName: 'Nadia Belhaj',
      jobs: [{ role: 'Coordinator', did: 'I ran the team.' }],
    });
    const oneDegree = interviewAnswersSchema.parse({
      fullName: 'Nadia Belhaj',
      education: [{ qualification: 'Master in Marketing' }],
    });
    expect(hasEnoughToBuild(oneJob)).toBe(true);
    expect(hasEnoughToBuild(oneDegree)).toBe(true);
  });
});
