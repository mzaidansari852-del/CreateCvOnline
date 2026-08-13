import type { BlogPost } from '@/types/blog';

import { regionalDesk } from './authors';

const post: BlogPost = {
  slug: 'cv-for-international-jobs',
  title: 'Adapting your CV for six international markets',
  description:
    'Length, photo, personal data, references and cover letters in six markets — plus what the CV-versus-résumé distinction actually means when you apply abroad.',
  excerpt:
    'There is no such thing as an international CV. Here is what changes between six of the most common destination markets, and what never changes anywhere.',
  category: 'International',
  tags: ['International', 'Relocation', 'Country conventions', 'Resume'],
  publishedAt: '2026-06-09',
  updatedAt: '2026-08-11',
  readingMinutes: 0, // computed from the body by lib/blog.ts — leave at 0.
  author: regionalDesk,
  faq: [
    {
      question: 'What is the difference between a CV and a résumé?',
      answer:
        'In the US and Canada a résumé is the one-to-two-page document you send for a normal job, while “CV” means the long academic record used for research, faculty and medical posts. In the UK, Europe, the Gulf, Africa, Australia and most of Asia, “CV” simply means the job-application document. Same file, different word — except in academia, where the long version is the CV everywhere.',
    },
    {
      question: 'Should I translate my CV or send it in English?',
      answer:
        'Send it in the language of the advert. An advert in German signals that the working language is German and that a Lebenslauf is expected; an English-language advert from the same company signals the opposite. If you apply speculatively and cannot tell, English is the safer default in the Netherlands and the Gulf, and the local language is safer in Germany and France.',
    },
    {
      question: 'Do I need to list references with contact details?',
      answer:
        'Only where it is conventional — the Gulf, and some public-sector applications. In the UK, the US, Canada, Germany and the Netherlands, references are requested later in the process, and printing a former manager’s mobile number without warning them is a courtesy problem as much as a formatting one.',
    },
    {
      question: 'Does the paper size really matter?',
      answer:
        'It matters more than people expect. A4 is standard everywhere except the US and Canada, which use US Letter. An A4 document printed on Letter shifts the margins and can push a tight two-page CV onto three pages. Export to the destination’s paper size before you send.',
    },
  ],
  body: [
    {
      type: 'paragraph',
      text: 'There is no international CV. There is a document that works in one market and gets quietly discounted in another, usually for reasons nobody explains to you: a photo that makes a UK recruiter’s compliance training twitch, a two-page résumé in a US market that expects one, a German application missing the references that would normally be attached to it.',
    },
    {
      type: 'paragraph',
      text: 'The good news is that the differences are small in number and easy to apply once you know them. The content of your career does not change. What changes is length, what personal information belongs on the page, and what else is expected in the envelope.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'CV, résumé, Lebenslauf: the words',
    },
    {
      type: 'paragraph',
      text: 'The vocabulary confuses people more than the conventions do. In the US and Canada, a **résumé** is the one-or-two-page document you send for a normal job; a **CV** is the long academic record used for faculty, research and medical roles, and it can run to twenty pages. Everywhere else — the UK, continental Europe, the Gulf, Africa, Australia, most of Asia — **CV** means the ordinary job-application document, typically two pages.',
    },
    {
      type: 'paragraph',
      text: 'So if a US job advert asks for a CV, it usually means a résumé, unless the role is academic. If a UK advert asks for a resume, someone has copied an American template. Neither is worth a second thought; match the word the employer used and get the length right.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Six markets at a glance',
    },
    {
      type: 'table',
      head: ['Market', 'Length', 'Photo', 'Personal data', 'References', 'Cover letter'],
      rows: [
        ['United Kingdom', '2 pages', 'No', 'City only; no age or status', 'On request, not listed', 'Usually expected'],
        ['Germany', '1–2 pages', 'Common, optional', 'DOB still frequent', 'Attach Arbeitszeugnisse', 'Expected (Anschreiben)'],
        ['Netherlands', '1–2 pages', 'Optional, often omitted', 'Minimal', 'On request', 'Expected (motivatiebrief)'],
        ['Gulf states', '2–3 pages', 'Common', 'Nationality and visa status', 'Often listed', 'Short covering email'],
        ['United States', '1 page (2 if senior)', 'No', 'None; work authorisation only', 'Never on the résumé', 'Often optional'],
        ['Canada', '1–2 pages', 'No', 'None; status if relevant', 'On request', 'Usually expected'],
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'The six, in a little more detail',
    },
    {
      type: 'heading',
      level: 3,
      text: 'United Kingdom',
    },
    {
      type: 'paragraph',
      text: 'Two pages, no photo, and no personal data beyond your city and contact details. British recruiters are trained to avoid information that could create a discrimination claim, so date of birth, marital status and nationality are out — state your right to work only if it is not obvious. A short personal statement at the top is standard, “references available on request” is redundant, and a covering letter or a substantial application-form answer is normally expected. Spelling should be British.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'Germany',
    },
    {
      type: 'paragraph',
      text: 'The German application is a package rather than a file. A tabular Lebenslauf of one to two pages, a covering letter, and — the part that surprises people most — copies of your **Arbeitszeugnisse**, the written references German employers issue when you leave, plus diploma copies. A professional photo is still widely used, though equal-treatment law means it cannot be required, and younger employers increasingly omit it. Dates of birth remain common. Chronological order is the norm and gaps are noticed, so account for them briefly.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'Netherlands',
    },
    {
      type: 'paragraph',
      text: 'Short, direct and unembellished. One to two pages, a plain layout, a factual profile and no self-promotion that the evidence does not support — Dutch hiring culture reads inflation as a character trait rather than a style choice. Photos are optional and increasingly left off. English CVs are widely accepted, particularly in technology, logistics and international business, but the motivatiebrief is genuinely read. Mention your work permit position if you are not an EU or EEA national.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'The Gulf',
    },
    {
      type: 'paragraph',
      text: 'The most personal-data-tolerant of the six. Nationality, current location and visa or sponsorship status are practical questions in a market built on expatriate hiring, and recruiters expect to see them; notice period is worth stating too. Photos are common. Two to three pages is accepted, and references with contact details are more often listed than elsewhere — ask permission first. Certificates may need attestation later in the process. Multinationals in the region run the same applicant tracking systems as their head offices, so keep the file parser-safe.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'United States',
    },
    {
      type: 'paragraph',
      text: 'One page is the working default, extending to two for genuinely senior or highly technical candidates. No photo, no date of birth, no marital status, no nationality — a single line on work authorisation if it is relevant. References never appear on the document. Use US spelling, US Letter paper, MM/DD dates or, better, spelled-out months, and a phone number with the country code if you are applying from abroad. Skip “References available on request”; American résumés are unusually intolerant of filler.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'Canada',
    },
    {
      type: 'paragraph',
      text: 'Close to the US in what it excludes — no photo, no personal data — and closer to the UK in length, with two pages readily accepted. Say plainly if you are a citizen, a permanent resident, or hold an open work permit, since employers cannot assume it. For Québec, expect French, and treat a French CV as a genuine rewrite rather than a translation. Foreign qualifications benefit from a one-line equivalence, and in regulated professions the assessment body matters more than the CV does.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Photos are not a neutral choice',
      text: 'In the UK, Ireland, the US, Canada and Australia, some recruiters discard CVs with photos, or ask for them to be removed, to protect the process from bias claims. It is not a judgement about you. If you are applying across markets, keep a version without a photo and use it whenever you are not certain.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'What never changes',
    },
    {
      type: 'checklist',
      items: [
        'Reverse chronological order, months and years, no unexplained gaps.',
        'Achievements with numbers attached, not lists of duties.',
        'A single-column layout that survives a parser — the [ATS guide](/blog/ats-cv-guide) applies in every market.',
        'A phone number in international format, +212 or +44 or +1, with no local shorthand.',
        'Spelled-out months (“Mar 2023 – Jun 2025”) so nobody has to guess whether 04/07 is April or July.',
        'A file named for you, exported as a text-based PDF.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'The practical approach',
    },
    {
      type: 'paragraph',
      text: 'Keep one master document with everything in it, and derive market versions from it rather than maintaining separate careers. In practice that is three exports for most people: an Anglo version with no photo and no personal data, a continental European version with the extra details and the local language, and a US résumé cut to a page.',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        'Set the paper size for the destination — A4 everywhere except the US and Canada.',
        'Strip or add personal details according to the table above.',
        'Adjust the length by cutting older roles to one line, never by shrinking margins to 8mm.',
        'Switch the spelling variant, and check the currency and units you quote.',
        'Add a one-line equivalence to any qualification the reader will not recognise.',
        'Re-read the advert once more and match its vocabulary before you send.',
      ],
    },
    {
      type: 'quote',
      text: 'Applying abroad is not about proving you understand another country’s culture. It is about removing every reason for a busy stranger to stop reading.',
    },
    {
      type: 'paragraph',
      text: 'Conventions drift, and individual employers deviate from all of this — a Berlin start-up may want a one-page English résumé, and a London bank may want three pages. Take the advert and the company’s own careers page as the higher authority. If you are applying within the MENA region as well, [CV conventions in Morocco and the MENA region](/blog/cv-for-morocco-and-mena) covers the local end in more detail, and the [template gallery](/templates) has A4 and US Letter layouts for the same designs.',
    },
  ],
  related: ['cv-for-morocco-and-mena', 'ats-cv-guide', 'how-to-write-a-professional-cv'],
};

export default post;
