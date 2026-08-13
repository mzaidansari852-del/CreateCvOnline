import type { BlogPost } from '@/types/blog';

import { hiringDesk } from './authors';

const post: BlogPost = {
  slug: 'ats-cv-guide',
  title: 'Make your CV ATS-safe in 20 minutes',
  description:
    'How an applicant tracking system actually parses your CV, the six things that genuinely break it, and a timed 20-minute pass to fix a CV you already have.',
  excerpt:
    'Applicant tracking systems do not reject you — bad parsing does. Here is what the parser really does with your file, and a timed pass to fix the CV you already have.',
  category: 'ATS & applications',
  tags: ['ATS', 'Applications', 'Formatting', 'Job search'],
  publishedAt: '2025-10-07',
  updatedAt: '2026-08-04',
  readingMinutes: 0, // computed from the body by lib/blog.ts — leave at 0.
  author: hiringDesk,
  faq: [
    {
      question: 'Do applicant tracking systems reject CVs automatically?',
      answer:
        'Very rarely on their own. Most systems are databases with search and filtering on top; a recruiter runs the search. Auto-rejection is usually tied to explicit knockout questions on the application form — work authorisation, licences, notice period — rather than to the CV file itself. What the CV controls is whether you appear in the recruiter’s search results at all.',
    },
    {
      question: 'Is PDF or Word better for an ATS?',
      answer:
        'Modern systems handle text-based PDFs well, and PDF protects your layout. Send a Word document only when the advert or the upload field asks for one. The format that always fails is a scanned or image-based PDF, because there is no text layer to extract.',
    },
    {
      question: 'Will a two-column CV get through an ATS?',
      answer:
        'Sometimes, and that is the problem — you cannot tell which parser will handle it. A two-column layout can be read left-to-right across both columns, interleaving your skills sidebar into your job history. If you need one document for everything, use a single column.',
    },
    {
      question: 'How many keywords from the job advert should I include?',
      answer:
        'Enough that the vocabulary matches, not so many that the sentences stop being true. Mirror the exact terms the advert uses for skills, tools and certifications where you genuinely have them, and put them in the experience bullets where they are evidenced rather than in a keyword block at the bottom.',
    },
  ],
  body: [
    {
      type: 'paragraph',
      text: 'Almost everything written about applicant tracking systems is either fear or folklore. The fear says a robot reads your CV and bins it. The folklore says there is a magic score to beat. Neither is right, and both lead people to make their CVs worse — stuffing keywords, deleting formatting, obsessing over a number that no recruiter ever sees.',
    },
    {
      type: 'paragraph',
      text: 'This guide takes a narrow, practical cut: what the software actually does with your file, and a timed pass to make a CV you have already written safe to upload. If you want the longer explanation of parser-safe design and a set of layouts built for it, that lives on the [ATS CV templates page](/ats-cv). What follows assumes you have a CV and twenty minutes.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'What the parser actually does',
    },
    {
      type: 'paragraph',
      text: 'When you upload a file to Workday, Greenhouse, Lever, iCIMS, SuccessFactors or any of their competitors, roughly four things happen in sequence:',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        '**Text extraction.** The file is converted into a stream of characters in reading order. This is where image-based PDFs, text inside graphics and unusual glyphs disappear entirely.',
        '**Segmentation.** The parser splits that stream into sections by looking for headings it recognises: Experience, Education, Skills, and their common variants.',
        '**Entity extraction.** Within each section it tries to fill structured fields — employer, job title, start date, end date, institution, degree. This is the part that populates the “review your details” screen you get on some application forms.',
        '**Indexing.** The extracted text and fields go into a searchable record. Later, a recruiter searches or filters that database.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Read that list again and notice what is missing: judgement. There is no stage at which the system reads your career and forms an opinion. The failure you are protecting against is not rejection, it is **corruption** — your job title landing in the employer field, your skills sidebar interleaved into your 2019 role, your dates read as nonsense so you never appear in a search for people with five years of experience.',
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'The “ATS score” is not a real thing',
      text: 'No mainstream applicant tracking system shows recruiters a compatibility score for your CV. Scores exist in third-party CV checkers, including ours — they are a useful proxy for how cleanly a layout parses, not a number anyone hiring you will ever see.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'The six things that genuinely break parsing',
    },
    {
      type: 'table',
      head: ['What you did', 'What the parser does with it'],
      rows: [
        [
          'Contact details in the page header or footer',
          'Skips that region on many parsers — your phone and email vanish from the record',
        ],
        [
          'Two-column layout',
          'May read straight across both columns, splicing sidebar text into the middle of your job history',
        ],
        [
          'Text inside a text box, table cell, graphic or icon',
          'Extracted out of order, or not at all',
        ],
        [
          'Creative section headings (“Where I’ve Been”, “My Toolkit”)',
          'Segmentation fails and the whole block is treated as unclassified text',
        ],
        [
          'Dates as “‘19 – ‘21”, “Summer 2020” or graphic timelines',
          'No usable start and end date, so tenure and experience filters miss you',
        ],
        [
          'A CV exported as an image, or a scan',
          'No text layer at all; the record is empty apart from your file name',
        ],
      ],
    },
    {
      type: 'paragraph',
      text: 'Notice what is not on that list: colour, a sensible accent line, bold text, a two-page document, or an ordinary bulleted list. Those are fine. The advice to strip your CV back to unstyled black Times New Roman is a decade out of date and produces a document humans dislike reading.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'The 20-minute pass',
    },
    {
      type: 'paragraph',
      text: 'Open your current CV and a job advert you actually intend to apply for. Set a timer.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'Minutes 0–4: the paste test',
    },
    {
      type: 'paragraph',
      text: 'Export to PDF. Open the PDF, select all, copy, and paste into a plain text editor. What you see is approximately what the parser sees. Read it for three things: is anything missing, is the order right, and are the dates intact? A clean paste looks like this:',
    },
    {
      type: 'code',
      language: 'text',
      code: `EXPERIENCE

Senior Data Analyst
Atlas Retail Group, Casablanca | Mar 2023 - Present
- Rebuilt the weekly demand forecast across 120 stores ...`,
    },
    {
      type: 'paragraph',
      text: 'A broken paste looks like your skills list wedged between two job titles, or a block of contact details missing. If the paste is clean, most of your ATS risk is already gone.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'Minutes 4–8: fix the frame',
    },
    {
      type: 'checklist',
      items: [
        'Move contact details out of the page header or footer and into the body of the first page.',
        'Collapse any two-column layout into one column — sidebar content becomes ordinary sections.',
        'Delete text boxes, icons that carry meaning, skill bars, rating dots and photos of text.',
        'Replace a photo with nothing, unless you are applying in a market that expects one.',
      ],
    },
    {
      type: 'heading',
      level: 3,
      text: 'Minutes 8–12: rename the sections',
    },
    {
      type: 'paragraph',
      text: 'Use the boring names. Parsers are trained on the boring names.',
    },
    {
      type: 'table',
      head: ['Replace this', 'With this'],
      rows: [
        ['My Journey / Where I’ve Been', 'Work Experience'],
        ['Toolkit / What I Bring', 'Skills'],
        ['Academic Adventures', 'Education'],
        ['Beyond Work', 'Certifications, Languages, Volunteering (as separate sections)'],
      ],
    },
    {
      type: 'heading',
      level: 3,
      text: 'Minutes 12–17: match the vocabulary',
    },
    {
      type: 'paragraph',
      text: 'Read the advert and highlight the nouns: tools, certifications, methods, domains. Then check your CV uses **the same words for the things you have actually done**. If the advert says “stakeholder management” and your CV says “working with the business”, change yours. If it says “Power BI” and yours says “BI dashboards”, name the tool. Where you have a genuine equivalent rather than the exact thing, write both: “Looker Studio (equivalent to Power BI reporting)” is honest and searchable.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Do not hide keywords',
      text: 'White text on a white background, keywords in the document metadata, or a tiny block of terms at the bottom of the page: recruiters find these routinely, and a candidate caught doing it is finished for that role and usually for that company. It also does nothing useful, because relevance is judged by a human reading the visible text.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'Minutes 17–20: the upload',
    },
    {
      type: 'checklist',
      items: [
        'Name the file firstname-lastname-cv.pdf.',
        'Upload the PDF unless the form specifically requests Word.',
        'If the form auto-fills your history from the file, read every field it filled and correct it — that corrected data, not your PDF, is what gets searched.',
        'Answer the knockout questions carefully. These, not the parser, are what actually auto-rejects people.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'After the twenty minutes',
    },
    {
      type: 'paragraph',
      text: 'Keep two versions of your CV. The single-column, plain, parser-safe one goes into every online form. A slightly richer version — a second colour, a tighter grid, maybe two columns — is for the times you email a human directly or hand something over in a room. Both should contain identical facts.',
    },
    {
      type: 'quote',
      text: 'The applicant tracking system is not the audience. It is the doorway. Design for the recruiter standing behind it.',
    },
    {
      type: 'paragraph',
      text: 'If your existing layout keeps failing the paste test, it is usually faster to rebuild on a template that was designed single-column from the start — see the [ATS-friendly template set](/ats-cv) — and to check the result against [15 common CV mistakes](/blog/common-cv-mistakes) before you send it anywhere.',
    },
  ],
  related: ['common-cv-mistakes', 'how-to-write-a-professional-cv', 'cv-for-international-jobs'],
};

export default post;
