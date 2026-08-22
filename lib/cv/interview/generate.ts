import 'server-only';

import { extractWithModel, AiExtractionError } from '@/lib/cv/import/ai';
import { cvFromModel } from '@/lib/cv/import/from-model';
import type { Locale } from '@/lib/i18n/locales';
import type { CVData } from '@/types/cv';
import type { InterviewAnswers } from './questions';

/**
 * Turning interview answers into a CV.
 *
 * ## Composing, not copying — and why that changes everything
 *
 * The importer reads a document somebody already wrote, so its worst failure is *losing*
 * something: a dropped bullet, a merged job. Visible, and the review screen catches it.
 *
 * This writes prose that did not exist before, and its worst failure is the opposite. Given
 * "I managed the maintenance team", a model will gladly return "Led a team of 12 technicians,
 * cutting average response time by 30%" — fluent, plausible, and a fabricated credential on a
 * document about to be sent to employers. Nobody proof-reads a sentence that flatters them.
 *
 * So the boundary is drawn at *facts*, and it is drawn in three places rather than trusting
 * any one of them:
 *
 * 1. The interview asks for figures in their own field, so a number in the output can be
 *    traced to a number in the input.
 * 2. The prompt forbids introducing any fact — number, name, date, employer, technology —
 *    that is not in the answers, and says why.
 * 3. `checkForInvention` re-reads the result and strips bullets containing digits that never
 *    appeared in what the user typed. A prompt is a request; this is a check.
 *
 * The third exists because the first two are advisory. A model that ignores an instruction
 * fails silently and convincingly, which is precisely the failure that must not reach a
 * stranger reading someone's CV.
 */

export class InterviewError extends Error {}

/**
 * Builds the prompt from the answers.
 *
 * Written as a transcript rather than as JSON, because the task is "rewrite what this person
 * told you" and a transcript is what that looks like. Empty answers are left out entirely: a
 * field labelled `numbers:` with nothing after it is an invitation to fill it in.
 */
function transcript(answers: InterviewAnswers, locale: Locale): string {
  const lines: string[] = [];
  const add = (label: string, value: string) => {
    if (value.trim()) lines.push(`${label}: ${value.trim()}`);
  };

  add('Name', answers.fullName);
  add('Role they are applying for', answers.targetRole);
  add('Email', answers.email);
  add('Phone', answers.phone);
  add('Location', answers.location);

  answers.jobs.forEach((job, index) => {
    if (!job.role && !job.company) return;
    lines.push('', `--- Job ${index + 1} ---`);
    add('Job title', job.role);
    add('Employer', job.company);
    add('When', job.period);
    add('What they did, in their own words', job.did);
    add('Figures they gave', job.numbers);
  });

  answers.education.forEach((entry, index) => {
    if (!entry.qualification) return;
    lines.push('', `--- Education ${index + 1} ---`);
    add('Qualification', entry.qualification);
    add('School', entry.school);
    add('Year', entry.year);
  });

  if (answers.skills.trim()) lines.push('', `--- Skills ---`, answers.skills.trim());
  if (answers.languages.trim()) lines.push('', `--- Languages ---`, answers.languages.trim());
  if (answers.extras.trim()) lines.push('', `--- Anything else ---`, answers.extras.trim());

  return [
    'Below is what somebody told you about their working life, in answer to a set of',
    'questions. Turn it into the given JSON structure, as their CV.',
    '',
    'What you may do:',
    '- Tidy their wording into clear, professional CV language.',
    '- Split one long answer into several bullet points, one action each.',
    '- Start each bullet with a verb, and keep it to a single sentence.',
    '- Work out dates from how they wrote them, and output YYYY-MM or YYYY.',
    '- Write a short professional summary, built only from what they told you.',
    '',
    'What you must never do:',
    '- Invent a fact. No number, percentage, team size, budget, employer, technology, tool,',
    '  qualification or date that is not in the text below. Not one.',
    '- Use a figure they did not give. If "Figures they gave" is absent for a job, that job',
    '  has no figures, and a bullet with an invented one is a lie on a document this person',
    '  will send to employers. An unremarkable true bullet is worth more than an impressive',
    '  false one.',
    '- Add achievements, responsibilities or skills they did not mention, however obvious',
    '  they seem for the job title.',
    '- Translate. Write in the language they answered in.',
    '',
    `Their interface language is ${locale}, but follow the language of their answers.`,
    'Reply with JSON only.',
    '',
    lines.join('\n'),
  ].join('\n');
}

/**
 * Every number the user actually typed, so the output can be checked against it.
 *
 * Years are excluded: a date is a fact the model is explicitly asked to *derive* — "since
 * March 2020" legitimately becomes `2020-03` — and treating that as invention would strip
 * correct dates out of every entry.
 */
function figuresGiven(answers: InterviewAnswers): Set<string> {
  const source = [
    answers.jobs.map((job) => `${job.numbers} ${job.did} ${job.period}`).join(' '),
    answers.education.map((entry) => `${entry.qualification} ${entry.year}`).join(' '),
    answers.skills,
    answers.languages,
    answers.extras,
    answers.targetRole,
  ].join(' ');

  return new Set((source.match(/\d+/g) ?? []).map((digits) => digits.replace(/^0+(?=\d)/, '')));
}

/**
 * Removes any achievement carrying a figure the user never gave.
 *
 * The blunt instrument, on purpose. Judging *which* invented number matters would need the
 * same kind of inference that produced it; dropping the bullet costs a line the user can add
 * back from their own answers, which are still on screen. Losing a true sentence is a
 * nuisance. Keeping a false one is a person explaining in an interview why their CV claims a
 * 30% improvement they never made.
 */
function checkForInvention(
  data: Partial<CVData>,
  allowed: Set<string>,
): { data: Partial<CVData>; removed: number } {
  let removed = 0;
  const keep = (text: string) => {
    const digits = text.match(/\d+/g) ?? [];
    const invented = digits.some((value) => !allowed.has(value.replace(/^0+(?=\d)/, '')));
    if (invented) removed += 1;
    return !invented;
  };

  const experience = data.experience?.map((job) => ({
    ...job,
    achievements: job.achievements.filter(keep),
  }));

  return { data: { ...data, ...(experience ? { experience } : {}) }, removed };
}

export interface GeneratedCv {
  data: Partial<CVData>;
  /** Bullets dropped because they carried a figure the user never gave. */
  removed: number;
}

export async function generateFromInterview(
  answers: InterviewAnswers,
  locale: Locale,
): Promise<GeneratedCv> {
  let model;
  try {
    model = await extractWithModel(transcript(answers, locale), locale);
  } catch (error) {
    if (error instanceof AiExtractionError) throw new InterviewError(error.message);
    throw error;
  }

  /*
   * The same mapper the importer uses.
   *
   * It is where a model's answer stops being untrusted text and becomes something the schema
   * will accept — ids minted here, dates that cannot be trusted discarded rather than
   * coerced, arrays capped. None of that is specific to reading a PDF, and a second copy of
   * it would drift from the first the moment either changed.
   */
  const { data } = cvFromModel(model);
  const checked = checkForInvention(data, figuresGiven(answers));

  // Their own words for the contact block: there is nothing to infer, and a model that
  // "tidies" an e-mail address has broken it.
  checked.data.personal = {
    ...checked.data.personal!,
    firstName: checked.data.personal?.firstName || answers.fullName.split(/\s+/)[0] || '',
    lastName:
      checked.data.personal?.lastName || answers.fullName.split(/\s+/).slice(1).join(' ') || '',
    email: answers.email || checked.data.personal?.email || '',
    phone: answers.phone || checked.data.personal?.phone || '',
    location: answers.location || checked.data.personal?.location || '',
  };

  return checked;
}
