import type { BlogPost } from '@/types/blog';

import { editorialTeam } from './authors';

const post: BlogPost = {
  slug: 'cv-examples-by-role',
  title: 'One career, five CVs: the same years, retold',
  description:
    'The same six years of experience, rewritten for five target roles — what each reader scans for, which facts get promoted, and where the honest line sits.',
  excerpt:
    'Take one messy, ordinary career and aim it at five different jobs. Nothing is invented; the promotion and demotion of facts does all the work.',
  category: 'By role',
  tags: ['CV examples', 'Tailoring', 'Career change', 'Worked examples'],
  publishedAt: '2026-01-13',
  updatedAt: '2026-07-21',
  readingMinutes: 0, // computed from the body by lib/blog.ts — leave at 0.
  author: editorialTeam,
  faq: [
    {
      question: 'Is it dishonest to write a different CV for each role?',
      answer:
        'No, as long as the facts stay identical. Emphasis is the writer’s job: you are choosing which true things to put first for this particular reader. It becomes dishonest the moment a title, a date, a scope or a result changes to fit the advert.',
    },
    {
      question: 'How different should each version actually be?',
      answer:
        'For most people: a new target title, a rewritten four-line summary, a reordered skills block and two or three re-pointed bullets in the most recent role. That is ten minutes of work, and it is the difference between a CV that fits and one that nearly fits.',
    },
    {
      question: 'What if my job title does not match the work I did?',
      answer:
        'Keep the official title — it has to survive a reference check — and clarify in brackets or in the first bullet. “Operations Analyst (acting team lead, 2024–2025)” or a first bullet that states the real scope is accurate and searchable.',
    },
  ],
  body: [
    {
      type: 'paragraph',
      text: 'A CV is not a record of what happened. It is an argument that you should be interviewed, assembled from things that happened. Which is why the same six years can produce five quite different documents without a single invented fact — and why the person who says “my CV just is what it is” tends to get fewer interviews than someone with less experience and more focus.',
    },
    {
      type: 'paragraph',
      text: 'Below is one ordinary career, aimed at five roles. The [CV examples library](/cv-examples) has full documents by role and career stage; this piece is about the editing decisions behind them.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'The raw material',
    },
    {
      type: 'paragraph',
      text: 'Six years, one sector — a mid-sized distribution business. The unedited list of what this person actually did:',
    },
    {
      type: 'list',
      items: [
        'Two years on a customer support desk, then four in operations.',
        'Built the weekly stock report in SQL and Power BI, replacing a spreadsheet that took two days.',
        'Ran the pilot for a new warehouse management system across three sites, then the rollout to nine.',
        'Wrote the requirements document with the product team of the software vendor.',
        'Line-managed two junior analysts for eighteen months.',
        'Renegotiated two courier contracts, saving about 8% of outbound shipping cost.',
        'Reduced pick errors in the pilot sites by redesigning the pick path.',
        'Handled escalations from the top twenty accounts during the rollout.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Every version below uses only those facts.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'What each reader is scanning for',
    },
    {
      type: 'table',
      head: ['Target role', 'The reader’s first question', 'What gets promoted'],
      rows: [
        ['Operations manager', 'Have they run a process at scale?', 'Nine sites, pick errors, courier costs'],
        ['Data analyst', 'Can they build the pipeline and the report?', 'SQL, Power BI, the two-day to two-hour rebuild'],
        ['Product manager', 'Can they define and ship a change?', 'Requirements, pilot, rollout, vendor'],
        ['Customer success manager', 'Can they hold a difficult account?', 'Top twenty accounts, escalations, support desk'],
        ['Project manager', 'Can they land it on time across sites?', 'Three-to-nine-site rollout, stakeholders, sequencing'],
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Five versions of the same six years',
    },
    {
      type: 'heading',
      level: 3,
      text: '1. Operations manager',
    },
    {
      type: 'code',
      language: 'text',
      code: `Operations professional with six years in distribution, covering
warehouse process, courier contracts and reporting across nine sites.

- Rolled out a new warehouse management system from a three-site pilot
  to nine sites, cutting pick errors in the pilot group by a third.
- Renegotiated two courier contracts, taking ~8% off outbound shipping.`,
    },
    {
      type: 'paragraph',
      text: 'The SQL stays, but drops into the skills line. Cost and error rates lead, because an operations manager is hired to move exactly those two numbers.',
    },
    {
      type: 'heading',
      level: 3,
      text: '2. Data analyst',
    },
    {
      type: 'code',
      language: 'text',
      code: `Analyst with six years in distribution, specialising in operational
reporting: SQL, Power BI, and the messy warehouse data underneath.

- Rebuilt the weekly stock report in SQL and Power BI, replacing a
  two-day spreadsheet process with a two-hour refresh.
- Instrumented pick-error reporting across nine sites, which is how the
  pick-path redesign was measured.`,
    },
    {
      type: 'paragraph',
      text: 'Same rollout, different framing: it becomes the place where measurement happened. The courier negotiation drops to a single line, because a data hiring manager will not read past it.',
    },
    {
      type: 'heading',
      level: 3,
      text: '3. Product manager',
    },
    {
      type: 'code',
      language: 'text',
      code: `Operations specialist moving into product, with two years working
alongside a software vendor's product team on a warehouse management
system now live in nine sites.

- Wrote the requirements for the pick-path redesign and ran the
  three-site pilot that validated it before rollout.
- Owned the feedback loop between nine sites and the vendor's roadmap.`,
    },
    {
      type: 'paragraph',
      text: 'This is the hardest of the five, because the title has never been “product manager”. The summary says so plainly. What makes it credible is the artefact — a requirements document — and a pilot with a decision attached to it.',
    },
    {
      type: 'heading',
      level: 3,
      text: '4. Customer success manager',
    },
    {
      type: 'code',
      language: 'text',
      code: `Six years in distribution across support and operations, including
two years as the escalation point for the top twenty accounts during a
nine-site systems migration.

- Held the top twenty accounts through a nine-site WMS migration,
  handling escalations directly and keeping churn at zero.
- Started on the support desk: 40+ tickets a day, then built the
  reporting the desk now runs on.`,
    },
    {
      type: 'paragraph',
      text: 'The support desk, which the other four versions bury, becomes an asset here. Careers are full of experience that is embarrassing in one room and valuable in the next.',
    },
    {
      type: 'heading',
      level: 3,
      text: '5. Project manager',
    },
    {
      type: 'code',
      language: 'text',
      code: `Project lead with six years in distribution operations; delivered a
nine-site warehouse management rollout from pilot to completion,
working across operations, IT, an external vendor and site managers.

- Sequenced the rollout site by site, running the pilot first and
  carrying its findings into the remaining six.
- Coordinated vendor, IT and nine site teams; managed escalations from
  the twenty largest accounts throughout.`,
    },
    {
      type: 'paragraph',
      text: 'Note the vocabulary shift — sequencing, stakeholders, delivery — applied to identical events. That is the legitimate version of keyword matching: using the target discipline’s words for work you genuinely did.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'The rules underneath',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        '**Change the target title, not the job title.** The line under your name is positioning; the title inside a role is a fact.',
        '**Promote, demote, never delete a whole role.** Gaps raise questions that emphasis never does.',
        '**Reorder the skills block.** The first group should be the one the advert names first.',
        '**Re-point two or three bullets, not all of them.** The most recent role does most of the work.',
        '**Use the target field’s vocabulary for what you actually did.** Not for what you did not.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Where the line is',
      text: 'Reframing is choosing which true things to lead with. Inflation is changing the truth: a title you never held, a team size that includes people who did not report to you, a result you contributed to described as one you owned. The first survives an interview and a reference check. The second does not, and it ends candidacies.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Doing it in ten minutes',
    },
    {
      type: 'paragraph',
      text: 'Keep one master document with every bullet you have ever written for yourself — the long, unedited version nobody sees. Applying then becomes selection rather than composition: copy the master, change the target title, rewrite the summary against the advert, reorder the skills, cut it back to two pages, export.',
    },
    {
      type: 'quote',
      text: 'The candidate who gets the interview is rarely the one who has done the most. It is the one whose document answers the question the reader actually had.',
    },
    {
      type: 'paragraph',
      text: 'For the mechanics of the four lines at the top, see [how to write a professional summary](/blog/how-to-write-a-professional-summary). For role-specific full examples, the [CV examples library](/cv-examples) is organised the same way this article is.',
    },
  ],
  related: [
    'how-to-write-a-professional-summary',
    'cv-for-software-engineers',
    'how-to-write-a-professional-cv',
  ],
};

export default post;
