import Link from 'next/link';

import {
  Breadcrumbs,
  CtaBanner,
  Eyebrow,
  FaqSection,
  FeatureGrid,
  RelatedLinks,
  Section,
  SectionHeading,
  StatRow,
  StepList,
  type FaqEntry,
} from '@/components/marketing/primitives';
import { JsonLd } from '@/components/seo/JsonLd';
import { ButtonLink } from '@/components/ui/button';
import { TEMPLATE_COUNT } from '@/lib/cv/template-registry';
import { pageMetadata } from '@/lib/seo/metadata';
import { howToSchema } from '@/lib/seo/schema';
import { site } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Import a CV — Upload a PDF or Word File and Keep Editing',
  description:
    'Upload an existing CV and get it back as an editable document: jobs, dates, bullet points, education and skills. Reads the page layout, so a two-column CV does not come back scrambled.',
  path: '/import-cv',
  keywords: [
    'import cv',
    'upload cv and edit',
    'convert cv to editable',
    'pdf cv to editable',
    'change cv template',
    'cv converter',
  ],
});

const steps = [
  {
    title: 'Upload the file',
    description:
      'A PDF or a .docx, up to 8 MB. Drag it onto the page or pick it from your machine. Nothing is saved yet — the file is read and thrown away in the same request.',
  },
  {
    title: 'Read what it found',
    description:
      'Every section it read is listed with its contents: each job with its employer and dates, each qualification with its school, your skills and languages. Not a count — the actual entries, because "3 jobs found" tells you nothing about whether they are the right three.',
  },
  {
    title: 'Correct the contact block',
    description:
      'Name, title, email and phone are editable right there. They are what a recruiter reads first, and the name is the single weakest guess in the whole process — worth fixing before the document exists rather than after.',
  },
  {
    title: 'Keep it and carry on',
    description:
      'Press Create and it becomes an ordinary CV in the editor. Switch to any of the templates, reorder sections, rewrite a bullet, export a PDF. Nothing is locked because it arrived by upload.',
  },
];

const howItReads = [
  {
    title: 'It reads the layout, not the raw text',
    description:
      'A PDF stores text in the order the file happens to list it, which is not reading order — that is why most importers turn a two-column CV into a sidebar threaded line by line through your work history. This one rebuilds the lines from their positions on the page, finds the gutter between columns, and reads each column top to bottom the way you would.',
  },
  {
    title: 'Headings are measured, not guessed',
    description:
      'Section headings are identified by their type size and confirmed against what sections are called in four languages. That matters because templates disagree: some set headings larger than the body, some set them smaller and in capitals. Guessing from wording alone finds job titles and misses sections.',
  },
  {
    title: 'Bullets stay bullets',
    description:
      'Each bullet point becomes a separate achievement, word for word — including the ones Word writes with its own private symbol instead of a real bullet character, which is the usual reason a job comes back as one run-on paragraph.',
  },
  {
    title: 'Dates in four languages',
    description:
      '`Jan 2019 – Present`, `depuis mars 2021`, `09/2023 – 07/2024`, `seit 2020`, and a single `2021` for a graduation year. Month names are recognised in English, French, German and Dutch.',
  },
  {
    title: 'Sections it has no field for are kept anyway',
    description:
      'Certifications, interests, volunteering, publications — anything with a heading that does not map onto a standard section arrives as a custom section under your own title. Recognising a section and then dropping it is the worst of both outcomes.',
  },
  {
    title: 'It shows you before it saves',
    description:
      'Reading somebody else’s document is inference, and inference is sometimes wrong. Nothing reaches your account until you have looked at what it read — because the person who eventually notices a merged job or a shifted date is a recruiter, months later.',
  },
];

const useCases = [
  {
    title: 'Change how your CV looks without retyping it',
    description:
      'Import it, switch template, export. Your content and the design are separate things, so trying six layouts with your real career in them takes a couple of minutes rather than an evening.',
  },
  {
    title: 'Make an old CV ATS-safe',
    description:
      'A two-column CV with a graphics sidebar can be invisible to an applicant tracking system. Import it, move to a single-column layout scored for parser safety, and the same words become machine-readable.',
  },
  {
    title: 'Get an old file out of a format you cannot edit',
    description:
      'A .docx from a machine that no longer has the font, or a PDF whose source file is long gone. Import recovers the text into something you can actually work on.',
  },
];

const faqs: FaqEntry[] = [
  {
    question: 'What files can I upload?',
    answer:
      'PDF and Word (.docx), up to 8 MB, plus a CreateCVOnline JSON export if you are restoring a backup or moving between accounts. The JSON path is exact rather than inferred, because the file carries our own format.',
  },
  {
    question: 'Will a two-column CV come back scrambled?',
    answer:
      'That is the failure this was built around. The importer works from where text sits on the page, finds the empty gutter between columns, and reads each column in turn — so a sidebar arrives as a sidebar rather than interleaved through your work history. Where the columns overlap enough that no clean gutter exists, the review screen warns you that the order may be wrong.',
  },
  {
    question: 'Can it read a scanned CV or a photo of one?',
    answer:
      'No, and neither can anything else. A scanned or exported-as-image PDF has no text layer — there is nothing to extract. This is worth knowing beyond our importer: it is exactly why an image-based CV is invisible to every applicant tracking system it is sent to.',
  },
  {
    question: 'Does it change my wording?',
    answer:
      'No. Import copies. Your bullets arrive as you wrote them, spelling and all. The AI writer is a separate feature for people starting from nothing — if you already have a CV, there is nothing to write.',
  },
  {
    question: 'What if it gets something wrong?',
    answer:
      'You will see it before it is saved, which is the point of the review screen. It lists every entry it read rather than a count, so a merged job or a wrong employer is visible at a glance. Anything it missed you can add in the editor in seconds.',
  },
  {
    question: 'Is my CV stored when I upload it?',
    answer:
      'The file itself is never stored. It is read in the request and discarded; only the CV you choose to create is saved to your account, exactly as if you had typed it.',
  },
  {
    question: 'Does import cost anything?',
    answer:
      'No. Importing is available on the free plan, subject to the same limit on how many CVs an account holds. Paid accounts get an AI-assisted read that handles unusual layouts better, with the standard reader as the fallback.',
  },
];

export default function ImportCvPage() {
  return (
    <>
      <Section size="lg">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Import a CV', path: '/import-cv' },
          ]}
        />

        <div className="max-w-3xl">
          <Eyebrow>Import</Eyebrow>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
            Already have a CV? Upload it and keep editing
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-pretty text-ink-600 sm:text-lg">
            A PDF or Word file goes in; jobs, dates, bullet points, education, skills and languages
            come out, in an editor where you can change the template without retyping a word. It
            reads the page layout rather than the raw text order — which is why a two-column CV does
            not come back shuffled.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">
              Upload a CV — free
            </ButtonLink>
            <ButtonLink href="/cv-templates" size="lg" variant="outline">
              See the {TEMPLATE_COUNT} templates
            </ButtonLink>
          </div>
          <p className="mt-4 text-[13px] text-ink-500">
            Free on every plan. The file is read and discarded — only the CV you create is saved.
          </p>
        </div>

        <div className="mt-16 border-t border-ink-200 pt-10">
          <StatRow
            stats={[
              { value: 'PDF + Word', label: 'plus JSON exports' },
              { value: '4', label: 'languages of dates and headings' },
              { value: '8 MB', label: 'maximum file size' },
              { value: '0', label: 'files kept after reading' },
            ]}
          />
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          eyebrow="How it works"
          title="Upload, check, keep"
          description="About thirty seconds, most of which is you reading what it found."
        />
        <div className="mt-12">
          <StepList steps={steps} />
        </div>
        <JsonLd
          nodes={[
            howToSchema({
              name: 'How to import an existing CV',
              description:
                'Upload a PDF or Word CV, review the sections it read, correct the contact details, and keep it as an editable document.',
              steps: steps.map((step) => ({ name: step.title, text: step.description })),
            }),
          ]}
        />
      </Section>

      <Section>
        <SectionHeading
          align="left"
          eyebrow="How it reads a CV"
          title="Why this one does not scramble your columns"
          description="Most importers extract the text and hope. These are the specific reasons this one behaves differently, each of which came from a real CV that broke it."
        />
        <div className="mt-10">
          <FeatureGrid items={howItReads} columns={3} />
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="What it is for"
          title="Three reasons people upload an old CV"
          description="All of them come down to the same thing: the words are fine, the file is the problem."
        />
        <div className="mt-10">
          <FeatureGrid items={useCases} columns={3} />
        </div>
        <p className="mt-10 max-w-3xl text-sm leading-relaxed text-ink-600">
          If your CV does not exist yet, importing has nothing to work with — start with{' '}
          <Link
            href="/ai-cv-builder"
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            the AI writer
          </Link>
          , which asks you about ten questions and writes the first draft from your answers.
        </p>
      </Section>

      <Section>
        <FaqSection
          entries={faqs}
          title="Questions about importing"
          description={`Specific to how ${site.name} reads an uploaded CV.`}
        />
      </Section>

      <Section tone="muted">
        <CtaBanner
          title="Upload the CV you already have"
          description="It takes about ten seconds, it costs nothing, and you see exactly what was read before anything is saved."
          primaryLabel="Import a CV — free"
          secondaryHref="/cv-templates"
          secondaryLabel="Browse templates"
          note="PDF or Word, up to 8 MB. The file is discarded after reading."
        />
        <div className="mt-16">
          <RelatedLinks
            title="Where to go next"
            links={[
              {
                label: 'AI CV builder',
                href: '/ai-cv-builder',
                description: 'For starting from nothing — ten questions, nothing invented.',
              },
              {
                label: 'The CV builder, screen by screen',
                href: '/cv-builder',
                description: 'What the editor does once your CV is in it.',
              },
              {
                label: 'ATS-friendly CV templates',
                href: '/ats-cv',
                description: 'Single-column layouts scored for parser safety.',
              },
              {
                label: `All ${TEMPLATE_COUNT} CV templates`,
                href: '/cv-templates',
                description: 'Switch to any of them without retyping.',
              },
              {
                label: 'Worked CV examples',
                href: '/cv-examples',
                description: 'Complete documents by role, with every choice explained.',
              },
              {
                label: 'Free CV builder',
                href: '/free-cv-builder',
                description: 'What the free plan includes, and what it does not.',
              },
              {
                label: 'CV advice by profession',
                href: '/cv-for',
                description: 'What to write for your field once the CV is editable.',
              },
              {
                label: 'Pricing',
                href: '/pricing',
                description: 'Free, Pro and one-time Lifetime, side by side.',
              },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
