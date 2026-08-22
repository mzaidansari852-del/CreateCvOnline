import { z } from 'zod';

/**
 * The interview: what we ask someone who has no CV yet.
 *
 * ## Why a fixed set of questions rather than a conversation
 *
 * A chat box asking "tell me about your experience" gets three words and a shrug. People do
 * not know what a good answer looks like, and an open prompt asks them to supply both the
 * content *and* the structure — which is the whole problem they came here with. One concrete
 * question at a time, with an example underneath, gets usable answers from someone who has
 * never written a CV.
 *
 * It is also the difference between a feature that can be tested and one that cannot. A fixed
 * shape means the answers can be validated, saved half-finished, resumed tomorrow, and turned
 * into the same document every time.
 *
 * ## The `numbers` question, and why it has its own field
 *
 * This is the load-bearing part of the design.
 *
 * A model asked to write a CV bullet from "I managed the maintenance team" will produce "Led
 * a team of 12 technicians, cutting response time by 30%" — fluent, professional, and a
 * fabricated credential on a document the user is about to send to employers. They may not
 * notice until an interviewer asks about the 30%.
 *
 * So figures are never the model's to invent: they are *asked for*, in their own field, and
 * the prompt is allowed to use only what appears there. Someone who leaves it blank gets
 * bullets with no numbers in them, which is the honest outcome. The alternative is a machine
 * that helps people lie, which is not a CV builder.
 */

export const MAX_JOBS = 5;
export const MAX_EDUCATION = 4;

/** One answer field, and how the flow should render it. */
export interface Question {
  id: string;
  /** `long` gets a textarea; the rest a single line. */
  kind: 'short' | 'long';
  /** Answers we will not generate a CV without. */
  required?: boolean;
}

/**
 * The steps, in the order they are asked.
 *
 * Contact first because it is the easiest thing anyone can answer and gets them moving;
 * work last-first because the most recent job is the one people remember in detail and the
 * one an employer reads. Education and the rest come after, when momentum is established and
 * the questions are short.
 */
export const INTERVIEW_STEPS = [
  {
    id: 'about',
    questions: [
      { id: 'fullName', kind: 'short', required: true },
      { id: 'targetRole', kind: 'short', required: true },
    ],
  },
  {
    id: 'contact',
    questions: [
      { id: 'email', kind: 'short', required: true },
      { id: 'phone', kind: 'short' },
      { id: 'location', kind: 'short' },
    ],
  },
  {
    id: 'work',
    repeats: 'jobs',
    questions: [
      { id: 'role', kind: 'short', required: true },
      { id: 'company', kind: 'short', required: true },
      { id: 'period', kind: 'short', required: true },
      { id: 'did', kind: 'long', required: true },
      { id: 'numbers', kind: 'long' },
    ],
  },
  {
    id: 'education',
    repeats: 'education',
    questions: [
      { id: 'qualification', kind: 'short', required: true },
      { id: 'school', kind: 'short' },
      { id: 'year', kind: 'short' },
    ],
  },
  { id: 'skills', questions: [{ id: 'skills', kind: 'long', required: true }] },
  { id: 'languages', questions: [{ id: 'languages', kind: 'short' }] },
  { id: 'extras', questions: [{ id: 'extras', kind: 'long' }] },
] as const satisfies readonly {
  id: string;
  repeats?: 'jobs' | 'education';
  questions: readonly Question[];
}[];

export type StepId = (typeof INTERVIEW_STEPS)[number]['id'];

/*
 * Length caps on every field, for the same reason the importer caps what it reads: this text
 * goes into a prompt, and a prompt is billed by the character. They are generous enough that
 * nobody writing honestly will meet them.
 */
const line = (max: number) => z.string().trim().max(max).default('');

export const interviewAnswersSchema = z.object({
  fullName: line(80),
  targetRole: line(120),
  email: line(160),
  phone: line(40),
  location: line(120),
  jobs: z
    .array(
      z.object({
        role: line(160),
        company: line(160),
        /** Free text — `Jan 2021 – present`, `2019-2021`, `depuis mars 2020`. Parsed later. */
        period: line(60),
        did: line(1200),
        numbers: line(600),
      }),
    )
    .max(MAX_JOBS)
    .default([]),
  education: z
    .array(z.object({ qualification: line(160), school: line(160), year: line(30) }))
    .max(MAX_EDUCATION)
    .default([]),
  skills: line(800),
  languages: line(400),
  extras: line(1200),
});

export type InterviewAnswers = z.infer<typeof interviewAnswersSchema>;

/**
 * Is there enough here to build a CV worth showing?
 *
 * Deliberately low. Somebody halfway through their first job history should get a document
 * they can finish in the editor, not a refusal — the editor is better at the rest than this
 * is. What it will not do is generate from nothing, because a CV with a name and no history
 * is a blank template with extra steps.
 */
export function hasEnoughToBuild(answers: InterviewAnswers): boolean {
  const filledJobs = answers.jobs.filter((job) => job.role && job.did);
  const filledEducation = answers.education.filter((entry) => entry.qualification);
  return Boolean(answers.fullName) && (filledJobs.length > 0 || filledEducation.length > 0);
}
