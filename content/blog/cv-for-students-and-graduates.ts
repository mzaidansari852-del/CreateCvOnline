import type { BlogPost } from '@/types/blog';

import { editorialTeam } from './authors';

const post: BlogPost = {
  slug: 'cv-for-students-and-graduates',
  title: 'Writing a CV with no work experience',
  description:
    'What goes on a student CV when you have never had a full-time job: coursework, projects, part-time work, societies, volunteering — and the right section order.',
  excerpt:
    'You have more material than you think. Here is how to write coursework, part-time jobs, societies and volunteering so they read as evidence, and what order to put them in.',
  category: 'Career stage',
  tags: ['Students', 'Graduates', 'First CV', 'Internships'],
  publishedAt: '2026-03-03',
  updatedAt: '2026-07-07',
  readingMinutes: 0, // computed from the body by lib/blog.ts — leave at 0.
  author: editorialTeam,
  faq: [
    {
      question: 'How long should a student CV be?',
      answer:
        'One page, almost without exception, until you have a couple of years of full-time experience. A one-page CV for a first job is not a limitation — it forces the selection that makes the document readable.',
    },
    {
      question: 'Should I put my grades on my CV?',
      answer:
        'Include your overall classification or GPA when it is strong, and your degree subject and institution always. Individual module marks are worth listing only when a specific module is directly relevant to the job. Nobody expects secondary school detail once you are a year or two into a degree, beyond the qualification and year.',
    },
    {
      question: 'Does part-time retail or hospitality work belong on a graduate CV?',
      answer:
        'Yes. It shows reliability, customer contact and the ability to hold a job alongside study — things employers genuinely worry about with first hires. Write it with the same discipline as any other role: responsibility, scale, and anything you improved or were trusted with.',
    },
    {
      question: 'What do I write if I have literally nothing?',
      answer:
        'Then build something small this month: a project with a real user, a volunteering shift, a committee role, an online certification you finish. Two weeks of deliberate effort produces enough material for a credible first CV, and “what did you do about it” is a much better story than “I had no opportunities”.',
    },
  ],
  body: [
    {
      type: 'paragraph',
      text: 'The problem with a first CV is almost never a shortage of material. It is that the material is written as if it does not count. A student who ran a 200-person society event, tutored six children a week and built a working database for a coursework project has plenty of evidence — and usually writes three bullet points about a café job instead.',
    },
    {
      type: 'paragraph',
      text: 'Employers hiring at graduate level know you have not run a department. They are looking for a much simpler set of signals: that you finish things, that you can be trusted with responsibility, that you have some idea what the job involves, and that you can write.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'The order to put things in',
    },
    {
      type: 'paragraph',
      text: 'Section order is the single highest-impact decision on a student CV, because it decides what a reader sees in the first ten seconds. The rule: whatever is your strongest evidence for **this** job goes directly under the summary.',
    },
    {
      type: 'table',
      head: ['Your situation', 'Order after the header and summary'],
      rows: [
        [
          'Student, technical role',
          'Projects → Education → Part-time work → Skills → Activities',
        ],
        [
          'Student, non-technical role',
          'Education → Experience (any kind) → Activities → Skills',
        ],
        [
          'Graduate with an internship or placement',
          'Experience → Education → Projects → Skills',
        ],
        [
          'Graduate, career changer or unrelated degree',
          'Summary → Relevant projects/courses → Experience → Education',
        ],
        [
          'Postgraduate or research applicant',
          'Education → Research/dissertation → Publications → Experience',
        ],
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Once you are two years in',
      text: 'Experience moves permanently above education, projects shrink to the two that still say something, and the activities section usually disappears. A first CV is a temporary document — expect to restructure it entirely within about three years.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Education, written properly',
    },
    {
      type: 'paragraph',
      text: 'This is the one section where a student CV can afford detail. Give the degree, institution, dates and classification, then add only what is relevant: modules that match the advert, the dissertation topic if it is substantial, a term abroad, a scholarship, a prize.',
    },
    {
      type: 'code',
      language: 'text',
      code: `BSc Computer Science, Mohammed V University, Rabat          2022-2026
Final-year average 16/20. Dissertation: anomaly detection in
water-network telemetry (Python, scikit-learn), graded 17/20.
Relevant modules: databases, distributed systems, statistics.`,
    },
    {
      type: 'paragraph',
      text: 'Do not list every module you have ever taken. Four relevant ones is a signal; twenty is a transcript, and a reader skips transcripts.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Projects: coursework counts',
    },
    {
      type: 'paragraph',
      text: 'A coursework project is real work. It had a brief, a deadline, constraints and a result — which is more than can be said for a lot of what appears on professional CVs. Write it the way you would write a job: what it was, what you did, what came out of it. If it was a group project, be specific about your part.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Campus Timetable API (course project, team of 4)          Jan-Apr 2025
Built the Flask/PostgreSQL backend and the ICS export. Used by ~300
students in the pilot term; handled the timetable-clash logic and the
caching that kept response times under 200ms on the faculty server.`,
    },
    {
      type: 'paragraph',
      text: 'Two or three projects, three lines each. If you have a personal project with real users — even ten — put it first: unprompted work is the most persuasive thing on a student CV, because nobody made you do it.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Part-time work is experience',
    },
    {
      type: 'paragraph',
      text: 'Retail, hospitality, call centres, tutoring, campus jobs, family businesses, seasonal work. Employers read these for reliability and for how you handle people under pressure. Write them with numbers, like anything else.',
    },
    {
      type: 'table',
      head: ['Written as filler', 'Written as evidence'],
      rows: [
        [
          'Worked in a café. Duties included serving customers.',
          'Ran the morning shift alone twice a week; trained four new starters on till and opening procedure.',
        ],
        [
          'Private tutor.',
          'Tutored six secondary students weekly in maths for two years; five improved by at least one grade band.',
        ],
        [
          'Call centre agent (summer).',
          'Handled 60–80 inbound calls a day on a billing queue; joined the escalation rota after two months.',
        ],
      ],
    },
    {
      type: 'paragraph',
      text: 'Note what the strong versions have in common: a number, and something you were trusted with. Both are available in any job, including the least glamorous one you have had.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Societies, sport and volunteering',
    },
    {
      type: 'paragraph',
      text: 'These count when they carry responsibility, continuity or consequence — and not much otherwise. “Member of the debating society” is a line; “ran the debating society’s budget and booked eight external speakers” is evidence.',
    },
    {
      type: 'list',
      items: [
        '**Committee roles**: say what you were responsible for — money, people, an event, a rota.',
        '**Events**: attendance figures, budget, sponsors, how many people you coordinated.',
        '**Sport**: level and commitment, especially where it shows discipline over years or captaincy.',
        '**Volunteering**: hours or duration, the organisation, and what you actually did there.',
        '**Anything ongoing**: a two-year commitment says something a one-off weekend does not.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'The skills section on a first CV',
    },
    {
      type: 'paragraph',
      text: 'Be conservative and specific. A recruiter reading “expert in Excel” from a final-year student assumes it means pivot tables, and a hiring manager will find out in the interview. Levels in words, in a grouped block:',
    },
    {
      type: 'code',
      language: 'text',
      code: `Technical   Python (coursework + personal projects), SQL (PostgreSQL),
            Git, basic Linux
Tools       Excel (pivot tables, VLOOKUP), Google Analytics, Figma (basic)
Languages   Arabic (native), French (fluent, C1), English (professional, B2)`,
    },
    {
      type: 'heading',
      level: 2,
      text: 'What to leave off',
    },
    {
      type: 'checklist',
      items: [
        'Secondary school detail beyond the qualification and year, once you are into a degree.',
        '“References available on request” — assumed, and it costs you a line.',
        'Hobbies with no substance. “Reading, music, socialising” says nothing; a two-year kickboxing club membership or a chess rating does.',
        'A photo, unless you are applying in a market where photos are conventional.',
        'Skill bars, star ratings and percentages against languages.',
        'An objective that restates the job title in your own words.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Keep it to one page, single column, with the same date format throughout. Most graduate schemes route applications through an applicant tracking system, so the same parsing rules apply as everywhere else — the [ATS guide](/blog/ats-cv-guide) has the twenty-minute version, and the [entry-level templates](/cv-templates) are laid out for a CV whose strongest sections are education and projects.',
    },
    {
      type: 'quote',
      text: 'Nobody expects a first CV to be impressive. They expect it to be specific — and specific is entirely within your control.',
    },
  ],
  related: ['how-to-write-a-professional-cv', 'how-to-write-a-professional-summary', 'ats-cv-guide'],
};

export default post;
