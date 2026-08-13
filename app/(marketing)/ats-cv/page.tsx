import type { Metadata } from 'next';

import {
  Breadcrumbs,
  CtaBanner,
  FaqSection,
  Prose,
  RelatedLinks,
  Section,
  SectionHeading,
  StepList,
} from '@/components/marketing/primitives';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import { Alert } from '@/components/ui/feedback';
import { ButtonLink } from '@/components/ui/button';
import { pageMetadata } from '@/lib/seo/metadata';
import { atsSafeTemplates } from '@/lib/cv/template-registry';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'ATS CV: How Applicant Tracking Systems Read Your CV',
  description:
    'How an ATS parses an uploaded CV, what really breaks text extraction, what is wrongly blamed for it, an honest note on ATS scores, and a final checklist.',
  path: '/ats-cv',
  keywords: [
    'ats cv',
    'ats friendly cv',
    'applicant tracking system',
    'cv parsing',
    'ats cv template',
    'ats checker',
  ],
});

/* -------------------------------------------------------------------------- */
/* Page data                                                                   */
/* -------------------------------------------------------------------------- */

const PIPELINE = [
  {
    title: 'Upload and storage',
    description:
      'Your original file is kept intact. It is usually what a recruiter opens later, which is why the design still matters even in a parser-driven process.',
  },
  {
    title: 'Text extraction',
    description:
      'The system pulls a stream of characters out of the file and reconstructs a reading order from where each glyph sits on the page.',
  },
  {
    title: 'Section and field detection',
    description:
      'Headings split the stream into blocks, then employer, job title, dates, degree and institution are picked out of each block.',
  },
  {
    title: 'Indexing and review',
    description:
      'The structured result lands in a searchable database. Many portals then show it to you and invite you to correct it before you submit.',
  },
];

const BREAKS: { title: string; body: string }[] = [
  {
    title: 'Text that lives inside an image',
    body: 'A CV exported as an image-only PDF, a scanned document, a name rendered as part of a logo, skill levels drawn as bars, an infographic timeline. To a text extractor there is nothing there at all. Some systems run OCR as a fallback; most do not, and the ones that do produce a rough approximation.',
  },
  {
    title: 'Contact details in the page header or footer',
    body: 'Several parsers treat the header and footer regions as page furniture and either drop them or append them somewhere unhelpful. The classic casualty is a beautifully designed CV that arrives in the database with no phone number and no email address. Keep contact details in the body of page one.',
  },
  {
    title: 'Tables used for layout',
    body: 'A table can be read column-first instead of row-first, and merged cells can concatenate two unrelated pieces of text into one line. A skills grid built as a table is a common way to end up with "Python Stakeholder management SQL Budgeting" in the indexed text. Ordinary paragraphs and line breaks are safer.',
  },
  {
    title: 'Multi-column reading order',
    body: 'Two columns are fine when the parser detects the gutter and reads each column in turn. They fail when a section wraps from one column into the other, when a heading spans both, or when the gap between them is too narrow to identify — at which point line one of the left column is joined to line one of the right.',
  },
  {
    title: 'Invented section headings',
    body: 'Section detection is largely dictionary-driven: the parser knows Experience, Work Experience, Professional Experience, Employment History and a few dozen synonyms. It does not know "Where I have been", "My toolkit" or "The story so far". An unrecognised heading usually means the block below it is never mapped to structured fields.',
  },
  {
    title: 'Fonts that do not extract cleanly',
    body: 'A PDF stores glyphs, not letters, and relies on an embedded mapping to say which character each glyph represents. When that mapping is missing or wrong — which happens with some subsetted and decorative fonts — the extracted text comes out as nonsense that looks perfect on screen.',
  },
  {
    title: 'PDFs from some design tools',
    body: 'Layout and illustration applications can export text as vector outlines, which turns every letter into a shape. The file looks flawless and contains zero extractable text. The same applies to a PDF exported with security restrictions that block content copying.',
  },
  {
    title: 'Dates a parser cannot normalise',
    body: 'Abbreviated years ("’19 – ’21"), seasons ("Spring 2020"), open-ended phrasing ("since 2018") and localised month names all risk producing a blank or wrong tenure. Since tenure feeds directly into search filters for years of experience, a mangled date can quietly exclude you from a shortlist.',
  },
];

const FINE: { title: string; body: string }[] = [
  {
    title: 'A modest accent colour',
    body: 'Colour is a rendering instruction. A text extractor never sees it. One accent colour on your headings is invisible to the parser and legible to the human who opens the file afterwards.',
  },
  {
    title: 'PDF, as a format',
    body: 'PDF is accepted and parsed by the systems in general use, and it is the only format that guarantees the recruiter sees the layout you built. The problem was never PDF; it was image-only PDFs and outlined text. Where a portal genuinely needs a Word file, it tells you so on the upload screen.',
  },
  {
    title: 'A clean two-column layout',
    body: 'Many current systems handle a well-separated sidebar without difficulty. Treat it as a small, managed risk rather than a disqualification: keep whole sections inside one column, leave a generous gutter, and keep a single-column version for portals you do not recognise.',
  },
  {
    title: 'Bold, italics and small caps',
    body: 'Emphasis is styling on ordinary text and extracts as ordinary text. Bold job titles and italic employer names cost nothing and make the document far quicker for a person to skim.',
  },
  {
    title: 'A second page',
    body: 'Page count is meaningless to a parser, which sees one continuous stream. Length is a question about the reader, not the software — and outside the United States, two pages is the norm rather than an indulgence.',
  },
  {
    title: 'Grouped skills and standard bullets',
    body: 'Skills organised under category labels parse fine and read better. Ordinary bullet characters are fine too; the ones that cause trouble are decorative glyphs from symbol fonts, which can extract as stray characters mid-line.',
  },
];

const CHECKLIST = [
  'Open your exported PDF, select all, copy, and paste into a plain text editor. If any text is missing, scrambled or out of order, no parser will do better.',
  'Contact details sit in the body of page one, never in the page header.',
  'Section headings are conventional: Summary, Experience, Education, Skills, Certifications.',
  'Every role gives job title, employer, location and a date range as ordinary text lines.',
  'Dates use one consistent format throughout, with months as well as years.',
  'No text is trapped inside an image, icon, chart, logo or skill bar.',
  'No tables, no text boxes, no content in the margins.',
  'One column, unless you have a specific reason and a single-column backup.',
  'The file is named with your actual name, and exported without security restrictions.',
  'Where the portal shows you what it parsed, you read it and fixed the fields it got wrong.',
];

const FAQS = [
  {
    question: 'Does an applicant tracking system reject my CV automatically?',
    answer:
      'Almost never on the basis of parsing quality. The widely repeated claim that three quarters of applications are auto-rejected before a human sees them is far more often quoted than sourced. What does filter people out is the application form: knockout questions about work authorisation, licences, location, notice period and minimum years of experience are answered by you, not extracted from your file, and they are frequently configured to reject automatically. The second filter is the recruiter, who searches the database and only ever sees the candidates whose extracted text matched the search.',
  },
  {
    question: 'Can an applicant tracking system read a two-column CV?',
    answer:
      'Often, yes. Modern parsers detect column boundaries and read each column in turn, and a clean sidebar carrying skills, languages and certifications usually survives. The failures happen at the edges: a section that wraps from the bottom of one column to the top of the other, a narrow gutter the parser cannot identify, or a heading that spans both columns. If the posting matters to you and you cannot tell what system sits behind it, upload a single-column version. Nothing is lost by doing so.',
  },
  {
    question: 'What exactly is an ATS score, and can any builder guarantee one?',
    answer:
      'An ATS score is a heuristic. Ours rates each template from one to five on properties we can inspect in the layout: whether it is single-column, whether any text is rendered as graphics, whether the section headings are conventional ones, and whether contact details sit in the document body. It is a measure of risk in the design, not a test result from real systems, and no builder anywhere can certify a file against every applicant tracking system in use. There is no standard to certify against, and each vendor parses differently and changes between releases.',
  },
  {
    question: 'Should I hide extra keywords in white text?',
    answer:
      'No. Keyword stuffing in white text, at one-point size or behind an image is an old trick that fails in three separate ways. Extractors read the text regardless of its colour, so the recruiter sees a wall of hidden terms in the parsed view. Any search it wins puts you in front of a human who will read the actual document. And where it is noticed, it is treated as deliberate deception, which is a much worse outcome than not matching a keyword.',
  },
  {
    question: 'Will colour, a logo or a photo make my CV fail an ATS?',
    answer:
      'Colour is invisible to a parser. A logo is only a problem if it contains text you need read, such as your name or job title, in which case that text does not exist as far as the system is concerned. A photograph is not a parsing problem at all — it is a regional convention question, and in the UK and the US the reason to leave it off is that employers there prefer not to receive one, not that software cannot cope with it.',
  },
  {
    question: 'How can I test my own CV without access to a real system?',
    answer:
      'The copy-and-paste test is the most reliable thing available to you: if the text comes out of your PDF complete and in a sensible order, the hard part of parsing is already solved. Beyond that, the portals themselves are the best test — the ones that show a parsed summary before you submit are effectively giving you a free report on your own file. Third-party checkers vary enormously in quality and none of them is running the system your employer uses.',
  },
  {
    question: 'Do small employers use applicant tracking systems too?',
    answer:
      'Increasingly, yes. Applicant tracking is now inexpensive software sold per user, and a ten-person company hiring twice a year will often use one because it comes bundled with the job board or the HR platform they already pay for. That said, plenty of small employers still work from a shared inbox, where the file lands in front of a human immediately. Writing for the parser costs you nothing in that scenario, because everything that helps a parser also helps a person skim.',
  },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function AtsCvPage() {
  const safeTemplates = atsSafeTemplates(5);

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'ATS CV', path: '/ats-cv' },
          ]}
        />
        <SectionHeading
          as="h1"
          align="left"
          eyebrow="ATS"
          title="ATS CV: how applicant tracking systems actually read your CV"
          description="An honest, technical account of what happens to your file between the upload button and a recruiter's screen — what genuinely breaks parsing, what gets blamed for it unfairly, and why no builder can promise you a pass."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/register" size="lg">
            Build an ATS-safe CV — free
          </ButtonLink>
          <ButtonLink href="#checklist" size="lg" variant="outline">
            Jump to the checklist
          </ButtonLink>
        </div>
      </Section>

      <Section tone="muted">
        <Prose>
          <h2>What an applicant tracking system actually is</h2>
          <p>
            An applicant tracking system is a database with a workflow attached. It holds
            requisitions, receives applications, moves candidates through stages, schedules
            interviews, stores notes and produces the reports the recruitment team is measured on.
            Parsing your CV is one small feature at the front of a much larger product, and it
            exists mainly to save a recruiter from typing your employment history into a form.
          </p>
          <p>
            That framing matters, because the popular picture of an ATS as a gatekeeper that reads
            your CV and decides your fate is mostly wrong. Systems in wide use — Workday, Oracle
            Taleo, SAP SuccessFactors, iCIMS, Greenhouse, Lever, Ashby and Bullhorn among them —
            differ enormously in how they parse, but almost none of them scores your document and
            rejects it. Applications are eliminated in two much more mundane ways: knockout
            questions on the application form, which you answer yourself, and recruiter searches,
            which only surface candidates whose extracted text contains the terms being searched
            for.
          </p>
          <p>
            So the goal is not to satisfy an algorithm. The goal is to make sure the text of your CV
            arrives in the database complete, in the right order and attached to the right fields —
            because you cannot be found in a search that never indexed your job titles.
          </p>

          <h2>What happens to your file after you press submit</h2>
        </Prose>
        <div className="mt-8">
          <StepList steps={PIPELINE} />
        </div>
        <Prose className="mt-12">
          <h3>Text extraction</h3>
          <p>
            A PDF does not store paragraphs, sentences or even words. It stores instructions to draw
            particular glyphs at particular coordinates, along with a font mapping that says which
            character each glyph represents. Extraction walks that list and reassembles a plausible
            reading order from position: text at the same vertical offset probably belongs to the
            same line, a large horizontal gap probably means a new column, a change in vertical
            spacing probably means a new paragraph. Every one of those inferences is a guess that a
            complicated layout can defeat. A Word file is easier because it carries a real document
            structure, but it introduces its own hazards in text boxes and floating shapes.
          </p>

          <h3>Section detection</h3>
          <p>
            With a character stream in hand, the parser looks for headings and cuts the document
            into blocks. It works from a dictionary of known headings and their synonyms, sometimes
            reinforced by formatting cues — a short line in bold, in a larger size, with space above
            it, is probably a heading. This is the single most fragile stage in the pipeline and the
            easiest to protect, because it depends almost entirely on your using words the parser
            has seen before.
          </p>

          <h3>Field extraction and date normalisation</h3>
          <p>
            Inside an experience block, the parser tries to identify the job title, the employer,
            the location and the start and end dates for each role, then normalises those dates into
            a machine-readable range. This is where tenure comes from, and tenure feeds directly
            into the filters recruiters apply — five years in the field, currently employed, three
            years in the last role. A date it cannot read becomes a blank, and a blank tenure can
            drop you out of a filtered list without anybody having formed an opinion about you.
          </p>

          <h3>Indexing and the review screen</h3>
          <p>
            The parsed result is written into the candidate record and indexed for search. Plenty of
            portals then show you what they extracted and ask you to check it — the step everybody
            resents, where you re-enter three jobs the system just read. Do not skip it. The fields
            on that screen, not your original file, are what the recruiter filters on, and it is
            your only chance to see the parse of your own CV.
          </p>
        </Prose>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          title="What genuinely breaks parsing"
          description="These are the failures worth designing around. Most of them produce a file that looks perfect to you and arrives empty or scrambled at the other end."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {BREAKS.map((item) => (
            <div key={item.title} className="rounded-xl border border-ink-200 bg-white p-5">
              <h3 className="flex items-start gap-2 text-base font-semibold text-ink-950">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className="mt-0.5 shrink-0 text-danger-600"
                >
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="m15 9-6 6M9 9l6 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          title="What is fine, and is routinely over-claimed as a problem"
          description="A large amount of ATS advice is folklore repeated until it sounded like fact. These things are not the reason you were not called."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FINE.map((item) => (
            <div key={item.title} className="rounded-xl border border-ink-200 bg-white p-5">
              <h3 className="flex items-start gap-2 text-base font-semibold text-ink-950">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className="mt-0.5 shrink-0 text-success-600"
                >
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="m8.5 12.3 2.4 2.4 4.6-4.9"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="max-w-3xl">
          <SectionHeading align="left" title="An honest note about ATS scores — including ours" />
          <div className="mt-6">
            <Alert tone="warning" title="An ATS score is a heuristic, not a certification">
              Every template on {site.name} carries a score from one to five. It is calculated from
              properties of the layout we can inspect — column count, whether any text is rendered
              as graphics, whether the section headings are conventional, whether contact details
              sit in the document body. It is not the output of a test against real applicant
              tracking systems, because such a test is not something any builder can honestly offer.
            </Alert>
          </div>
          <Prose className="mt-6">
            <p>
              There is no standard to certify against. Dozens of vendors each ship their own parser,
              each on its own release cycle, and large employers configure them differently on top
              of that. The same file can be read perfectly by one system and clumsily by another,
              and by the same system differently after an update. Any product — this one included —
              that promises your CV will pass every ATS is selling you a certainty that does not
              exist.
            </p>
            <p>
              What can be said honestly is narrower and still useful: a single-column document made
              of real text, with conventional headings, no graphics carrying information and no
              content in the page margins, is the lowest-risk file you can upload anywhere. Every
              template we score five has those properties. That is a statement about the design, and
              it is the only kind of statement that is defensible.
            </p>
            <p>
              Treat any score — ours, a checker&rsquo;s, a recruiter&rsquo;s browser extension&rsquo;s — as a
              smoke alarm rather than a building inspection. It is worth listening to when it goes
              off, and it is not evidence that the house is safe.
            </p>
          </Prose>
        </div>
      </Section>

      <Section tone="muted" id="checklist">
        <div className="max-w-3xl">
          <SectionHeading
            align="left"
            title="The checklist, before you press submit"
            description="Ten checks, none of which takes longer than a minute. The first one catches most of the serious failures on its own."
          />
          <ol className="mt-8 flex flex-col gap-3">
            {CHECKLIST.map((item, index) => (
              <li
                key={item}
                className="flex gap-3 rounded-xl border border-ink-200 bg-white p-4 text-sm leading-relaxed text-ink-700"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          title={`${safeTemplates.length} templates scored 5 out of 5`}
          description="Single-column reading order, conventional headings, contact details in the document body, and no text rendered as graphics. These are the lowest-risk layouts in the gallery."
        />
        <TemplateGrid className="mt-8" templates={safeTemplates} columns={5} />
      </Section>

      <Section tone="muted">
        <FaqSection
          entries={FAQS}
          description="The technical questions people ask about parsing, scoring and testing."
        />
      </Section>

      <Section>
        <CtaBanner
          title="Build it once, and stop guessing"
          description="Start from a layout that is single-column, text-only and conventionally structured, then spend your time on the writing instead of the formatting."
          primaryLabel="Create your CV — free"
          secondaryHref="/ats-resume"
          secondaryLabel="Read the practical guide"
          note="Free plan includes every ATS-safe template."
        />
        <div className="mt-16">
          <RelatedLinks
            title="Where to go next"
            links={[
              {
                label: 'ATS resume guide',
                href: '/ats-resume',
                description:
                  'The practical companion: keywords, headings, file names and .docx versus PDF.',
              },
              {
                label: 'CV templates',
                href: '/cv-templates',
                description: 'International formats, A4 and country-by-country conventions.',
              },
              {
                label: 'Resume templates',
                href: '/resume-templates',
                description: 'One page, Letter paper and the US conventions that go with them.',
              },
              {
                label: 'All templates',
                href: '/templates',
                description: 'Every design with its parsing score and column count.',
              },
              {
                label: 'Online CV builder',
                href: '/cv-builder',
                description: 'Real text, real structure and a PDF that copies cleanly.',
              },
              {
                label: 'Blog',
                href: '/blog',
                description: 'Longer guides on writing, formatting and applying.',
              },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
