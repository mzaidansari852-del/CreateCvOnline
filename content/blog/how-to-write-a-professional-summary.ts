import type { BlogPost } from '@/types/blog';

import { editorialTeam } from './authors';

const post: BlogPost = {
  slug: 'how-to-write-a-professional-summary',
  title: 'How to write a professional summary',
  description:
    'Two formulas for the four lines at the top of your CV, worked examples from graduate to executive level, and the stock phrases worth deleting on sight.',
  excerpt:
    'The four lines under your name decide which pile your CV lands in. Two formulas, six worked examples from graduate to executive, and what to cut.',
  category: 'CV writing',
  tags: ['Professional summary', 'CV writing', 'Worked examples', 'Personal statement'],
  publishedAt: '2025-12-02',
  updatedAt: '2026-07-14',
  readingMinutes: 0, // computed from the body by lib/blog.ts — leave at 0.
  author: editorialTeam,
  faq: [
    {
      question: 'How long should a professional summary be?',
      answer:
        'Three to four lines of running text, or roughly 40–70 words. Long enough to say what you are, how long you have done it and one piece of proof; short enough that a recruiter reads all of it before deciding whether to continue.',
    },
    {
      question: 'What is the difference between a summary, a profile and an objective?',
      answer:
        'A summary and a profile are the same thing under different names: a short statement of what you offer. An objective states what you want, which is why it has fallen out of favour — the reader already knows you want the job. If you need to explain a career change or a relocation, do it in one clause of the summary rather than in a separate objective.',
    },
    {
      question: 'Should a professional summary use “I”?',
      answer:
        'Convention is to drop pronouns entirely and write in clipped third person: “Operations manager with nine years…” rather than “I am an operations manager…”. It reads as a professional register and saves a word on every sentence. A first-person summary is not wrong, but keep it consistent with the rest of the document.',
    },
    {
      question: 'Do I need a summary at all?',
      answer:
        'If your CV is one page and your last job title matches the advert, you can drop it. Everyone else benefits, and it is essential when your CV needs interpreting: career changers, returners, relocations, or anyone whose job titles do not describe what they actually do.',
    },
  ],
  body: [
    {
      type: 'paragraph',
      text: 'The professional summary is the most rewritten and least thought-about part of a CV. People treat it as a warm-up — a few lines of personality before the real content. In practice it is the only part of the document you can aim precisely at one advert, and it sits exactly where a reader decides whether to keep reading.',
    },
    {
      type: 'paragraph',
      text: 'Its job is narrow: tell the reader which pile you belong in, and give them one reason to believe it. That is all. Charm, mission statements and career philosophy belong in the cover letter, if anywhere.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Two formulas',
    },
    {
      type: 'paragraph',
      text: 'Almost every good summary is one of two shapes. The first is for people continuing along a track:',
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Formula A — the continuation',
      text: '[What you are] with [how long] in [domain/sector], specialising in [the two or three things the advert wants]. [One concrete piece of evidence with a number in it]. [Optional: tools, languages, credentials.]',
    },
    {
      type: 'paragraph',
      text: 'The second is for people whose next job is not a straight line from their last one — career changers, returners, people crossing sectors:',
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Formula B — the bridge',
      text: '[The transferable identity, in the language of the target role] built on [where it came from]. [The evidence that the transfer is real: a project, a qualification, a result in the new domain]. [What you are looking for, in one clause.]',
    },
    {
      type: 'paragraph',
      text: 'Both are deliberately unglamorous. A summary is not the place to be interesting; it is the place to be legible.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Six worked examples',
    },
    {
      type: 'heading',
      level: 3,
      text: '1. Student, no professional experience',
    },
    {
      type: 'code',
      language: 'text',
      code: `Final-year BSc Computer Science student at Mohammed V University,
focused on data engineering. Built and shipped a Flask API used by 300
students to check exam timetables; six months part-time as a support
agent handling 40+ tickets a day. Looking for a summer internship in
backend or data engineering.`,
    },
    {
      type: 'paragraph',
      text: 'With no employment history, evidence comes from projects, part-time work and volume. Note what is doing the work: a real user count and a real ticket rate. See [CVs for students and graduates](/blog/cv-for-students-and-graduates) for the sections that go under it.',
    },
    {
      type: 'heading',
      level: 3,
      text: '2. Early career (two to four years)',
    },
    {
      type: 'code',
      language: 'text',
      code: `Marketing executive with three years in B2B SaaS, running paid search
and lifecycle email. Took the trial-to-paid email sequence from 4% to
7% conversion over two quarters, and now own a EUR 25k/month Google Ads
budget. HubSpot and GA4; French and English.`,
    },
    {
      type: 'paragraph',
      text: 'At this stage the summary should sound like ownership, not exposure. “Supported the team with…” is what a CV says when it has nothing of its own; name the thing you were accountable for.',
    },
    {
      type: 'heading',
      level: 3,
      text: '3. Mid-level specialist (five to eight years)',
    },
    {
      type: 'code',
      language: 'text',
      code: `Data analyst with six years in retail and logistics, specialising in
demand forecasting and inventory reporting. Rebuilt the weekly stock
forecast across 120 stores, cutting manual reporting from two days to
two hours and reducing stockouts in the top 200 SKUs. SQL, Python,
Power BI, dbt.`,
    },
    {
      type: 'paragraph',
      text: 'The specialist summary needs a domain, not just a toolset. “Six years of SQL” describes a hobby; “six years of forecasting in retail” describes a professional.',
    },
    {
      type: 'heading',
      level: 3,
      text: '4. Career changer',
    },
    {
      type: 'code',
      language: 'text',
      code: `Operations analyst moving into product management, with seven years
running warehouse process improvement and two years working alongside
the product team that built the WMS replacement. Wrote the requirements
and ran the pilot for the pick-path redesign now used in nine sites.
Seeking a product role in supply-chain or logistics software.`,
    },
    {
      type: 'paragraph',
      text: 'This is Formula B. It never pretends the change has already happened; it shows a foot already on the other side, and it names the sector where the old experience is an asset rather than a detour.',
    },
    {
      type: 'heading',
      level: 3,
      text: '5. Manager',
    },
    {
      type: 'code',
      language: 'text',
      code: `Engineering manager, four years leading teams of 6-12 across payments
and identity, ten years in software overall. Grew a team from four to
nine while cutting median time-to-production from nine days to under
two. Two of my senior engineers were promoted from mid-level under my
management.`,
    },
    {
      type: 'paragraph',
      text: 'Managers are hired on three things: scope, outcomes, and whether people grow under them. The third one is the differentiator almost everybody omits.',
    },
    {
      type: 'heading',
      level: 3,
      text: '6. Executive',
    },
    {
      type: 'code',
      language: 'text',
      code: `Commercial director for a EUR 180m distribution business across
Morocco, Tunisia and Senegal. Rebuilt a 120-person sales organisation
around key accounts, taking gross margin from 21% to 26% in three years
while opening two markets. Board-level reporting; P&L ownership since
2018.`,
    },
    {
      type: 'paragraph',
      text: 'At executive level the summary is a scope statement: money, people, geography, and the change you were accountable for. [CVs for managers and executives](/blog/cv-for-managers-and-executives) goes into how the rest of the document follows from that.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'What to cut',
    },
    {
      type: 'table',
      head: ['Delete on sight', 'Because'],
      rows: [
        ['“Results-driven professional”', 'Every candidate claims it; it survives no scrutiny'],
        ['“Excellent communication skills”', 'The document itself is the evidence, or is not'],
        ['“Passionate about…”', 'Unfalsifiable, and usually filling a gap where a fact should be'],
        ['“Seeking a challenging role in a dynamic company”', 'States what you want, not what you offer'],
        ['“Proven track record of success”', 'A track record with no numbers is not proven'],
        ['“Team player who also works well independently”', 'Both halves cancel out'],
      ],
    },
    {
      type: 'paragraph',
      text: 'A useful test: delete any sentence that would still be true if you swapped in a different candidate from the same field. If it survives the swap, it is not about you.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Writing it in practice',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        'Write the CV first. The summary is a summary — you cannot compress what does not exist yet.',
        'Pull the three things the advert repeats. Adverts are written by the hiring manager and they repeat what matters.',
        'Draft it long, then cut to four lines. The cutting is where the precision comes from.',
        'Put one number in it. One is enough; a summary that is all figures reads like a dashboard.',
        'Read it next to the job title at the top of the advert. If a stranger could not tell they were related, start again.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Keep it honest',
      text: 'The summary is the part of a CV most likely to overclaim, and the part most likely to be quoted back at you in an interview. Every number in it should be one you can talk about for five minutes — how it was measured, what you did, what you would do differently.',
    },
    {
      type: 'paragraph',
      text: 'Once it is written, keep the last three versions in a file. Most applications are a variation on something you have already written, and a summary that took forty minutes the first time takes four the next. If you are rebuilding the whole document, the [section-by-section guide](/blog/how-to-write-a-professional-cv) shows where this one fits.',
    },
  ],
  related: [
    'how-to-write-a-professional-cv',
    'common-cv-mistakes',
    'cv-examples-by-role',
  ],
};

export default post;
