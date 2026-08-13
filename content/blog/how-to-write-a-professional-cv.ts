import type { BlogPost } from '@/types/blog';

import { editorialTeam } from './authors';

const post: BlogPost = {
  slug: 'how-to-write-a-professional-cv',
  title: 'How to write a professional CV, section by section',
  description:
    'A section-by-section guide to writing a professional CV, with a worked example of every part — header, summary, experience, skills, education and extras.',
  excerpt:
    'Most CVs fail on structure rather than content. Here is the order the sections should run in, what belongs in each one, and a worked example of every part.',
  category: 'CV writing',
  tags: ['CV structure', 'CV writing', 'Formatting', 'Worked examples'],
  publishedAt: '2025-09-16',
  updatedAt: '2026-07-28',
  readingMinutes: 0, // computed from the body by lib/blog.ts — leave at 0.
  author: editorialTeam,
  faq: [
    {
      question: 'How long should a professional CV be?',
      answer:
        'Two pages is the safe default for most experienced candidates. One page is right for students, graduates and anyone with under three years of experience. Academic and research CVs are the exception and can run much longer because publications and funding are the substance of the document.',
    },
    {
      question: 'Should I include a photo on my CV?',
      answer:
        'It depends entirely on the country. Photos are conventional in much of continental Europe, the Middle East and North Africa, and are actively discouraged in the UK, Ireland, the US, Canada and Australia, where they raise discrimination concerns. Match the market you are applying to rather than your own preference.',
    },
    {
      question: 'Do I need a different CV for every application?',
      answer:
        'You need a different summary and a re-ordered skills section for every application. The experience section rarely changes. Budget ten minutes per application for that tailoring — it is the highest-return editing you can do.',
    },
    {
      question: 'What file format should I send?',
      answer:
        'PDF, unless the advert or the application form explicitly asks for a Word document. A PDF exported from a text-based editor keeps your layout intact and is still readable by applicant tracking systems, provided the text is real text and not an image.',
    },
  ],
  body: [
    {
      type: 'paragraph',
      text: 'A professional CV is not an autobiography. It is a decision document: a recruiter reads it to answer one question — is it worth spending half an hour of somebody senior’s time on this person? Everything on the page either helps answer that question or gets in the way of it.',
    },
    {
      type: 'paragraph',
      text: 'That framing settles most of the arguments people have about CVs. Should you include your 2009 retail job? Only if it answers the question. Should you list every technology you have touched? Only the ones you would be comfortable being interviewed on. The structure below is the one that has survived in professional hiring across most markets, and the worked examples show what each section looks like when it is doing its job.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'The shape of the document',
    },
    {
      type: 'paragraph',
      text: 'A CV is read top to bottom, and rarely to the end. The sections should therefore run in descending order of relevance to the job, not in the order your life happened. For almost everyone in work, that means this:',
    },
    {
      type: 'table',
      head: ['Section', 'What it is for', 'Typical space'],
      rows: [
        ['Header', 'Name, title, contact details, location', '3–4 lines'],
        ['Professional summary', 'The 15-second version of your case', '2–4 lines'],
        ['Experience', 'Evidence that you have done the work before', '55–70% of the CV'],
        ['Skills', 'Fast confirmation of the tools and domains', '3–6 lines'],
        ['Education', 'Qualification, institution, year', '2–4 lines'],
        ['Extras', 'Languages, certifications, publications, volunteering', 'Only if relevant'],
      ],
    },
    {
      type: 'paragraph',
      text: 'Two orderings depart from this. Students and recent graduates put education and projects above experience — there is more evidence there. Academics put research, publications and funding first. Everyone else: experience above education, from the day you finish your first full year of work.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'The header',
    },
    {
      type: 'paragraph',
      text: 'The header is where people quietly lose interviews — a missing phone number, an email address from 2006, a link that does not resolve. Keep it to one block of text, left-aligned or centred, with your target job title directly under your name. That title is a positioning statement: it tells the reader which pile you belong in before they have read a word of your experience.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Amina Kadiri
Senior Data Analyst
Casablanca, Morocco · +212 6 00 00 00 00
amina.kadiri@email.com · linkedin.com/in/aminakadiri`,
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Leave these out of the header',
      text: 'Full postal address (city and country is enough), date of birth, marital status, nationality and a photo — unless you are applying in a market where they are expected. Never put contact details in the page header or footer of the document: many parsers ignore that region entirely.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'The professional summary',
    },
    {
      type: 'paragraph',
      text: 'Three or four lines, written in the third person without pronouns, that state what you are, how long you have done it, the domain you know and one piece of evidence. No adjectives you cannot defend. “Detail-oriented team player” is not a claim, it is a noise floor.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Data analyst with six years in retail and logistics, specialising in demand
forecasting and inventory reporting. Rebuilt the weekly stock forecast at a
120-store retailer, cutting manual reporting time from two days to two hours.
Fluent in SQL, Python and Power BI; Arabic, French and English.`,
    },
    {
      type: 'paragraph',
      text: 'Rewrite this section for every application. It is four lines of work and it is the only part of the CV that can be tuned precisely to the advert. There is a longer treatment, with formulas and examples at six seniority levels, in [how to write a professional summary](/blog/how-to-write-a-professional-summary).',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Experience: the part that decides it',
    },
    {
      type: 'paragraph',
      text: 'Each role gets a title, an employer, a location and dates in month-and-year form. Under it, three to six bullets. The single most useful discipline in CV writing is that a bullet describes an **outcome**, not a duty. Duties describe the job description you were handed; outcomes describe what changed because you were the one doing it.',
    },
    {
      type: 'paragraph',
      text: 'A workable formula: **action verb + what you did + the mechanism + the result**. The mechanism matters — it is what makes the result believable.',
    },
    {
      type: 'table',
      head: ['Before', 'After'],
      rows: [
        [
          'Responsible for monthly reporting.',
          'Automated the monthly management pack in SQL and Power BI, cutting preparation from three days to four hours.',
        ],
        [
          'Worked on improving the checkout page.',
          'Rebuilt the checkout form validation with the design team, reducing abandoned payments by roughly a fifth over two quarters.',
        ],
        [
          'Managed a team of engineers.',
          'Grew a team of four to nine engineers across two time zones and introduced the on-call rota that took median incident response under 15 minutes.',
        ],
      ],
    },
    {
      type: 'paragraph',
      text: 'If you genuinely cannot measure something, describe scale instead: the size of the budget, the number of users, the volume of tickets, the number of markets. “Ran procurement for a 40-person office” tells a reader more than “handled procurement duties”.',
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'How far back to go',
      text: 'Ten to fifteen years in detail, then a two-line “Earlier career” block listing employers, titles and years for anything older. Nobody needs bullets from 2007, but the years should still be visible so the reader is not left wondering about a gap.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Skills, education and the extras',
    },
    {
      type: 'paragraph',
      text: 'The skills section exists so a reader can confirm in three seconds that you have the tools the job needs. Group them, write them as plain text on one line per group, and put the group the advert cares about first. Do not draw skill bars: they convert a precise claim into an unverifiable picture, and they parse badly.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Analysis: SQL (advanced), Python (pandas, scikit-learn), R (intermediate)
Reporting: Power BI, Looker Studio, Excel modelling
Data: Snowflake, dbt, Airflow
Languages: Arabic (native), French (fluent), English (professional)`,
    },
    {
      type: 'paragraph',
      text: 'Education is one line per qualification: degree, institution, year of completion. Add the classification or GPA only when it is strong and recent. Once you have five years of experience, this section shrinks to almost nothing — it is a fact to confirm, not a case to argue.',
    },
    {
      type: 'paragraph',
      text: 'For the extras, the test is whether a hiring manager would ask about it in an interview. Certifications that are licences to practise: keep. Languages: keep, with an honest level. Publications, patents, conference talks, open-source maintainership, meaningful volunteering: keep. Hobbies: only when they carry actual information — a mountain rescue volunteer or a nationally ranked chess player is telling you something; “socialising with friends” is not.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Formatting rules that do not change',
    },
    {
      type: 'checklist',
      items: [
        'One column. Two-column layouts read well on screen and confuse a meaningful share of parsers.',
        'One typeface, two sizes, one accent colour. Bold for emphasis; no underlining except on links.',
        '10–11.5pt body text with real margins (15–20mm). White space is what makes a dense CV readable.',
        'Consistent date format everywhere — “Mar 2023 – Present”, not a mix of styles.',
        'Reverse chronological order within every section.',
        'File name that identifies you: amina-kadiri-cv.pdf, never cv-final-v3.pdf.',
      ],
    },
    {
      type: 'paragraph',
      text: 'If you are formatting from scratch, start from a layout that already obeys these rules — the [ATS-friendly templates](/ats-cv) are built as single-column documents for exactly this reason, and every design in the [template gallery](/templates) exports to a text-based PDF.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'The last read-through',
    },
    {
      type: 'paragraph',
      text: 'Before you send anything, do these four passes. They take twenty minutes and catch most of what costs people interviews.',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        'Read it aloud. Anything you stumble over is a sentence a stranger will stumble over.',
        'Check every number and date against reality. One inflated figure that collapses in an interview undoes the whole document.',
        'Open the exported PDF, select all the text and paste it into a plain text editor. If the order is scrambled or text is missing, the layout is fighting the parser.',
        'Give it to someone who does not do your job and ask them what you are good at. If their answer is not the answer you wanted, the CV is not saying what you think it says.',
      ],
    },
    {
      type: 'quote',
      text: 'A good CV does not get you the job. It gets you the conversation in which you get the job — and that is a much lower bar than most people write for.',
    },
    {
      type: 'paragraph',
      text: 'When the structure is right, the rest is editing. If you want to see the same career written up for different targets, the [CV examples library](/cv-examples) shows the effect of changing nothing but emphasis, and [15 common CV mistakes](/blog/common-cv-mistakes) covers the failure modes worth checking for before you send.',
    },
  ],
  related: ['how-to-write-a-professional-summary', 'common-cv-mistakes', 'ats-cv-guide'],
};

export default post;
