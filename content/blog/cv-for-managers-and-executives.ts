import type { BlogPost } from '@/types/blog';

import { hiringDesk } from './authors';

const post: BlogPost = {
  slug: 'cv-for-managers-and-executives',
  title: 'The senior CV: scope, budget, headcount and outcomes',
  description:
    'How senior CVs differ from everyone else’s: the scope line, the three numbers that anchor every role, and the length conventions at management and board level.',
  excerpt:
    'At senior level the question changes from “can you do the work?” to “what were you accountable for, and what happened?” Here is how the document changes with it.',
  category: 'Career stage',
  tags: ['Management', 'Executive', 'Leadership', 'Scope'],
  publishedAt: '2026-04-07',
  updatedAt: '2026-07-30',
  readingMinutes: 0, // computed from the body by lib/blog.ts — leave at 0.
  author: hiringDesk,
  faq: [
    {
      question: 'How long should an executive CV be?',
      answer:
        'Two pages remains the working standard for most senior roles, and three is accepted at board and C-suite level in many markets, particularly where a governance or publications record has to be listed. Length is only defensible if the extra page is scope and outcomes; a three-page CV of responsibilities reads as an inability to prioritise.',
    },
    {
      question: 'Should I include numbers that are commercially sensitive?',
      answer:
        'Never disclose figures you are contractually bound to protect. Use ranges (“a portfolio in the EUR 100–150m range”), percentages instead of absolutes, or public figures where the company reports them. A reader who is themselves senior will understand exactly why the number is expressed that way.',
    },
    {
      question: 'Do executives still need a skills section?',
      answer:
        'A short one, and not a list of software. At senior level it becomes a capability line — P&L ownership, M&A integration, turnaround, board reporting, regulatory relationships — which functions as the vocabulary a search will match. Tooling belongs on the CV of the person who uses it daily.',
    },
    {
      question: 'How do I show impact when results took years?',
      answer:
        'State the starting position, the intervention and the end position with the time frame attached: “inherited a business losing money on two of four product lines; both profitable within eight quarters”. Long horizons are a feature of senior work, and dating the change is what makes it credible.',
    },
  ],
  body: [
    {
      type: 'paragraph',
      text: 'Somewhere between managing a team and running a function, the question a CV has to answer changes. Junior and mid-level CVs answer “can this person do the work?”. Senior CVs answer something else entirely: what were you accountable for, how big was it, and what was different when you left?',
    },
    {
      type: 'paragraph',
      text: 'Most senior CVs are still written to the first question. They describe responsibilities in the language of a job description — “responsible for the commercial function”, “oversaw the transformation programme” — and leave the reader to guess at scale. That guess is rarely generous.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'The three numbers',
    },
    {
      type: 'paragraph',
      text: 'Every senior role on your CV should make three things unmissable within its first two lines:',
    },
    {
      type: 'table',
      head: ['Number', 'What it establishes', 'How to express it'],
      rows: [
        ['People', 'The size and shape of your organisation', 'Direct reports and total headcount: “7 directs, 140 total”'],
        ['Money', 'Whether you have carried commercial weight', 'Revenue, P&L, budget or portfolio value, with the currency'],
        ['Span', 'Complexity, not just size', 'Functions, sites, markets, legal entities, matrix or line'],
      ],
    },
    {
      type: 'paragraph',
      text: 'A director of operations with 140 people across three countries and a director of operations with 12 people in one office share a title and almost nothing else. Without the numbers, the reader assumes the smaller of the two.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'The scope line',
    },
    {
      type: 'paragraph',
      text: 'The single most effective device on a senior CV is a one-line scope statement in italics or plain text directly under each job title, before the achievement bullets. It gives the reader the frame before the evidence.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Commercial Director | Atlas Distribution, Casablanca | 2019-Present
Scope: EUR 180m revenue across Morocco, Tunisia and Senegal. 7 directs,
124 total. P&L ownership, pricing, key accounts, and the distributor
network. Reports to the CEO; presents to the board quarterly.

- Rebuilt the sales organisation around key accounts, taking gross
  margin from 21% to 26% over three years.
- Opened Senegal from a standing start to EUR 14m in 24 months.
- Replaced the distributor contract model, cutting channel disputes
  from roughly 30 a quarter to fewer than five.`,
    },
    {
      type: 'paragraph',
      text: 'Three lines of scope followed by three or four outcomes will out-perform ten bullets of responsibilities in every screen it goes through. It also protects you: a reader who knows the scope will not misread a modest number as a small achievement.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Outcomes, not duties — at senior level',
    },
    {
      type: 'paragraph',
      text: 'The duties-versus-outcomes rule applies to everyone, but the failure mode is different at the top. Senior people rarely write “responsible for filing”; they write “led the transformation of the commercial function”, which sounds like an outcome and is not one. It has no before, no after and no number.',
    },
    {
      type: 'table',
      head: ['Reads as a job description', 'Reads as a track record'],
      rows: [
        [
          'Led the digital transformation of the business.',
          'Moved 60% of order volume from phone and fax to a self-serve portal in two years, removing 11 FTE of order entry and redeploying the team into account management.',
        ],
        [
          'Responsible for a EUR 40m budget.',
          'Took EUR 40m of operating cost out of a EUR 46m base over three budget cycles without closing a site, chiefly through freight consolidation and a supplier rationalisation from 340 to 90.',
        ],
        [
          'Built and led a high-performing team.',
          'Rebuilt a leadership team of seven — five internal promotions, two external hires — and cut voluntary attrition in the function from 24% to 9%.',
        ],
        [
          'Oversaw the ERP implementation.',
          'Sponsored an 18-month SAP rollout across nine sites, delivered four months late and inside the revised budget, with order-to-cash cycle time unchanged through go-live.',
        ],
      ],
    },
    {
      type: 'paragraph',
      text: 'Notice the fourth row. Saying a programme ran late, and what you protected while it did, is more credible than a page of unbroken triumph — and senior readers, who have all sponsored a late programme, notice.',
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Own what you owned',
      text: 'Executive hiring involves reference calls with people who were in the room. Claim the outcomes you were accountable for; for the ones you contributed to, say so — “as part of the executive team that…” costs you nothing and protects everything else on the page.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Length and structure at senior level',
    },
    {
      type: 'paragraph',
      text: 'Conventions vary by market and sector, so treat these as defaults rather than rules:',
    },
    {
      type: 'list',
      items: [
        '**Two pages** for most senior appointments, including the great majority of director-level roles.',
        '**Three pages** is accepted for C-suite, board and academic-adjacent leadership, especially where governance roles, publications or regulated appointments must be listed.',
        '**A short profile of four to six lines** at the top, written as a scope statement rather than a personality sketch.',
        '**Detail decays with age**: full scope and outcomes for the last ten to fifteen years, one line each before that.',
        '**Board and non-executive roles in their own block**, with organisation, role, committee memberships and dates.',
        '**Education last and brief**, unless the qualification is a licence to practise or the school is genuinely part of the pitch.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Executive search firms and internal talent teams both keep candidate databases, so the same parsing considerations apply as at every other level — a single-column document with plain headings, and a file named for you. The [ATS guide](/blog/ats-cv-guide) covers the twenty-minute version of that.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'What senior readers discount',
    },
    {
      type: 'checklist',
      items: [
        'Adjectives instead of scope: “visionary”, “transformational”, “strategic leader”.',
        'Vanity metrics with no baseline — a percentage improvement on an unstated number.',
        'Long lists of software and methodologies, which read as a level below the role.',
        'Achievements from three roles ago given as much space as the current one.',
        'A profile that could belong to any of the last forty candidates for the same job.',
        'Claiming a whole company’s results as personal ones without saying what you owned.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'The confidentiality problem',
    },
    {
      type: 'paragraph',
      text: 'Senior candidates frequently cannot publish the number that makes the point. The workable compromise: express it as a range, a percentage, a multiple or a public figure. “Grew the division from roughly EUR 30m to EUR 50m” carries the argument without disclosing the plan. If a figure is genuinely off-limits, describe the mechanism instead and let the interview supply the rest.',
    },
    {
      type: 'quote',
      text: 'At senior level the CV is not the case. It is the evidence pack that gets you into the room where you make the case.',
    },
    {
      type: 'paragraph',
      text: 'One practical habit: keep a running scope note for your current role — headcount, budget, span, and the two or three numbers that moved — and update it every quarter while you still remember what the baseline was. Reconstructing it three years later is how good executives end up with vague CVs. If you are rebuilding from scratch, the [section-by-section guide](/blog/how-to-write-a-professional-cv) still applies; the difference is what goes in each section, not the sections themselves.',
    },
  ],
  related: ['how-to-write-a-professional-summary', 'cv-examples-by-role', 'how-to-write-a-professional-cv'],
};

export default post;
