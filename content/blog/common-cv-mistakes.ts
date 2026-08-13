import type { BlogPost } from '@/types/blog';

import { editorialTeam } from './authors';

const post: BlogPost = {
  slug: 'common-cv-mistakes',
  title: '15 common CV mistakes, and the line that fixes each one',
  description:
    'The fifteen CV mistakes that cost people interviews most often — each with the reason it hurts, the fix, and a before-and-after line to copy the pattern from.',
  excerpt:
    'Fifteen failure modes we see over and over, each with the fix and a before-and-after line. Most of them take under a minute to correct once you can see them.',
  category: 'CV writing',
  tags: ['CV writing', 'Editing', 'Before and after', 'Job search'],
  publishedAt: '2025-11-11',
  updatedAt: '2026-06-30',
  readingMinutes: 0, // computed from the body by lib/blog.ts — leave at 0.
  author: editorialTeam,
  faq: [
    {
      question: 'What is the single most common mistake on a CV?',
      answer:
        'Describing duties instead of outcomes. It is the default way people write about work, and it produces a document that reads like a job description rather than evidence that you were good at the job.',
    },
    {
      question: 'Should I explain an employment gap on my CV?',
      answer:
        'Yes, in one line, without apology. “Career break — full-time caring responsibilities (2023–2024)” or “Sabbatical: travel and language study” closes the question. An unexplained gap invites the reader to invent something worse than the truth.',
    },
    {
      question: 'Is “references available on request” still expected?',
      answer:
        'No. It has been redundant for years — employers assume references exist and ask for them at offer stage. The line costs you space that could carry evidence.',
    },
    {
      question: 'How many typos does it take to lose an interview?',
      answer:
        'For detail-critical roles — finance, law, editing, quality, safety — often one. Elsewhere, a couple of typos rarely sink a strong CV, but they consume goodwill you would rather spend elsewhere. Read the document aloud, and have someone else read it too.',
    },
  ],
  body: [
    {
      type: 'paragraph',
      text: 'These are the fifteen problems we see most often, roughly in the order they cost people interviews. None of them are about talent. Most are habits — the way people naturally describe work when nobody has told them what a reader is looking for. Each one below comes with the fix and a line you can pattern-match against your own CV.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Mistakes in what you write',
    },
    {
      type: 'heading',
      level: 3,
      text: '1. Describing duties instead of outcomes',
    },
    {
      type: 'paragraph',
      text: 'A duty tells the reader what your job was. An outcome tells them what changed because you held it. Rewrite every bullet to end at a result, or at least at a scale.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Before: Responsible for the company's social media accounts.
After:  Grew LinkedIn following from 2,000 to 11,000 in a year and made it
        the second-largest source of demo requests.`,
    },
    {
      type: 'heading',
      level: 3,
      text: '2. A summary made entirely of adjectives',
    },
    {
      type: 'paragraph',
      text: 'Every candidate is hard-working, detail-oriented and passionate. Adjectives are free, so they carry no information. Replace them with what you are, how long you have done it, and one fact.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Before: Dynamic, results-driven professional with a passion for excellence.
After:  Operations manager, nine years in cold-chain logistics, running a
        60-person warehouse at 99.2% on-time dispatch.`,
    },
    {
      type: 'heading',
      level: 3,
      text: '3. Claims with no scale attached',
    },
    {
      type: 'paragraph',
      text: '“Significantly improved” means nothing without a denominator. If you cannot measure the result, measure the thing: budget, headcount, users, tickets, stores, markets.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Before: Significantly improved customer satisfaction.
After:  Took CSAT from 3.6 to 4.4 across a support queue of ~1,800 tickets
        a month by rewriting the triage process.`,
    },
    {
      type: 'heading',
      level: 3,
      text: '4. Buzzwords doing the work of evidence',
    },
    {
      type: 'paragraph',
      text: 'Synergy, leverage, ideate, thought leader. Recruiters have read these thousands of times and skip them automatically. Say the concrete thing instead.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Before: Leveraged cross-functional synergies to drive alignment.
After:  Ran the weekly planning session with sales, support and engineering
        that cut duplicate escalations roughly in half.`,
    },
    {
      type: 'heading',
      level: 3,
      text: '5. Twenty years at equal detail',
    },
    {
      type: 'paragraph',
      text: 'The reader cares most about the last five years. Give recent roles four to six bullets, older roles one or two, and anything beyond about fifteen years a single “Earlier career” line.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Before: [Six bullets about a 2006 graduate role, same depth as the 2024 one]
After:  Earlier career: Analyst, Banque Atlas (2006-2009); Junior Analyst,
        Meridian Consulting (2004-2006).`,
    },
    {
      type: 'heading',
      level: 2,
      text: 'Mistakes in how it is laid out',
    },
    {
      type: 'heading',
      level: 3,
      text: '6. An order that is not reverse-chronological',
    },
    {
      type: 'paragraph',
      text: 'Current role first, always, within every section. Functional CVs that hide dates make recruiters assume you are hiding something, and they parse badly. If you are changing career, keep the chronology and use the summary to reframe it.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Before: Skills-based CV: "Leadership", "Analysis", "Communication",
        then an undated job list at the bottom.
After:  Reverse-chronological roles with months and years, plus a two-line
        summary explaining the pivot.`,
    },
    {
      type: 'heading',
      level: 3,
      text: '7. A two-column layout with a skills sidebar',
    },
    {
      type: 'paragraph',
      text: 'It looks good on screen and can be read straight across by a parser, splicing your sidebar into the middle of a job. Single column is the safe default for anything you upload; see the [ATS guide](/blog/ats-cv-guide) for the paste test that proves it.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Before: [Skills | Senior Analyst]  ->  parsed as "Python Senior Analyst
        SQL Atlas Retail Power BI Mar 2023"
After:  Full-width sections in reading order, skills as one labelled block.`,
    },
    {
      type: 'heading',
      level: 3,
      text: '8. Contact details in the page header',
    },
    {
      type: 'paragraph',
      text: 'Word and Google Docs headers and footers live outside the main text flow, and a good share of parsers skip them. Your name, email and phone belong in the first lines of the document body.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Before: [page header] amina.kadiri@email.com | +212 6 00 00 00 00
After:  First body lines: name, target title, city, phone, email, LinkedIn.`,
    },
    {
      type: 'heading',
      level: 3,
      text: '9. Bullets that run to three lines',
    },
    {
      type: 'paragraph',
      text: 'A bullet is a headline, not a paragraph. Two lines maximum; one is better. If a bullet contains two achievements, it is two bullets.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Before: A 55-word bullet covering the migration, the team, the timeline
        and the cost saving in one sentence.
After:  "Migrated 40 services to Kubernetes in eight months, cutting hosting
        spend 28%." plus a second bullet for the team you led.`,
    },
    {
      type: 'heading',
      level: 3,
      text: '10. Filler sections',
    },
    {
      type: 'paragraph',
      text: '“References available on request”, an “Objective” that restates the job title, a “Personal Statement” duplicating the summary, and hobbies that carry no information. Each one costs lines you could spend on evidence.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Before: Objective: To obtain a challenging position in a dynamic company.
After:  [deleted — the space went to two more achievement bullets]`,
    },
    {
      type: 'heading',
      level: 2,
      text: 'Mistakes that quietly signal something',
    },
    {
      type: 'heading',
      level: 3,
      text: '11. Gaps you leave to the imagination',
    },
    {
      type: 'paragraph',
      text: 'Readers fill silence with the worst plausible explanation. One neutral line closes it, and career breaks are far better understood than they were a decade ago.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Before: ...2019-2022 [nothing]  2022-Present ...
After:  Career break (2019-2022) - full-time caring responsibilities;
        completed AWS Solutions Architect certification in 2021.`,
    },
    {
      type: 'heading',
      level: 3,
      text: '12. Personal data the market does not want',
    },
    {
      type: 'paragraph',
      text: 'Date of birth, marital status, number of children, a photo where photos are discouraged. In the UK, Ireland, the US, Canada and Australia these create a discrimination risk that recruiters are trained to avoid. Elsewhere — much of continental Europe, the Gulf, North Africa — some of it is still conventional. Match the market, not the habit; [applying internationally](/blog/cv-for-international-jobs) covers the differences.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Before: DOB: 14/06/1991 | Married, two children | Nationality: ...
After:  Casablanca, Morocco | Right to work in the EU (Portuguese passport)`,
    },
    {
      type: 'heading',
      level: 3,
      text: '13. Contact details that fail on contact',
    },
    {
      type: 'paragraph',
      text: 'A shared family email, a university address that expires, a portfolio link that 404s, a LinkedIn URL that points to a search page. Click every link in the exported PDF before you send it.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Before: sexy_ninja99@webmail.com | www.mysite.com/portfolio_v2_FINAL
After:  amina.kadiri@email.com | aminakadiri.com/work`,
    },
    {
      type: 'heading',
      level: 3,
      text: '14. Skill bars and star ratings',
    },
    {
      type: 'paragraph',
      text: 'A four-fifths-full bar for Python tells a reader nothing they can act on, and it is invisible to a parser. Write the level in words, with the context that makes it meaningful.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Before: Python  [||||||||--]   SQL  [|||||||||-]
After:  Python (production ETL, 4 years) - SQL (window functions,
        query tuning) - R (occasional analysis)`,
    },
    {
      type: 'heading',
      level: 2,
      text: 'The mistake that costs the most',
    },
    {
      type: 'heading',
      level: 3,
      text: '15. One CV, sent to everything',
    },
    {
      type: 'paragraph',
      text: 'This is the expensive one. A generic CV is optimised for no advert in particular, which means it loses to a tailored one every time. You do not need to rewrite the document: change the target title, rewrite the summary, and reorder the skills so the advert’s vocabulary sits at the top. Ten minutes, per application.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Before: One "Marketing Manager CV.pdf" for a brand role, a growth role
        and an agency role.
After:  Same experience, three summaries: brand storytelling; paid
        acquisition and CAC; client management across six accounts.`,
    },
    {
      type: 'callout',
      tone: 'success',
      title: 'The two-minute sweep',
      text: 'Before any application: does every bullet end in a result or a scale? Is the top third of page one about the job you are applying for? Would a stranger, given the advert and your CV, put them in the same pile?',
    },
    {
      type: 'checklist',
      items: [
        'Every bullet leads with a verb and lands on a result.',
        'Dates are consistent, in months and years, with no unexplained gaps.',
        'One column, no text boxes, contact details in the body.',
        'Summary rewritten for this specific advert.',
        'File named firstname-lastname-cv.pdf, exported as text-based PDF.',
        'Read aloud once, and by one other person.',
      ],
    },
    {
      type: 'paragraph',
      text: 'If several of these apply, it is usually quicker to rebuild than to patch: start from the [section-by-section guide](/blog/how-to-write-a-professional-cv), or pick a layout from the [template gallery](/templates) that already enforces the structure.',
    },
  ],
  related: ['how-to-write-a-professional-cv', 'ats-cv-guide', 'how-to-write-a-professional-summary'],
};

export default post;
