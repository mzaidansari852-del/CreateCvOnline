import Link from 'next/link';

import { CVThumbnail } from '@/components/cv/CVThumbnail';
import {
  Breadcrumbs,
  CtaBanner,
  Eyebrow,
  FaqSection,
  RelatedLinks,
  Section,
  SectionHeading,
  type FaqEntry,
} from '@/components/marketing/primitives';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import { ButtonLink } from '@/components/ui/button';
import { createDefaultCustomization, createSampleCV } from '@/lib/cv/defaults';
import { PAPER } from '@/lib/cv/format';
import {
  DEFAULT_TEMPLATE_ID,
  getTemplate,
  getTemplateBySlug,
} from '@/lib/cv/template-registry';
import { pageMetadata } from '@/lib/seo/metadata';
import type { TemplateDefinition } from '@/types/cv';

export const metadata = pageMetadata({
  title: 'Resume Builder for US Applications — Letter, One Page',
  description:
    'A resume builder that follows US conventions: Letter paper, one page early in your career, no photo and no date of birth. Includes the resume vs CV distinction in full.',
  path: '/resume-builder',
  keywords: [
    'resume builder',
    'us resume format',
    'resume vs cv',
    'one page resume',
    'letter paper resume',
    'free resume builder',
  ],
});

function pickTemplates(slugs: string[]): TemplateDefinition[] {
  return slugs
    .map((slug) => getTemplateBySlug(slug))
    .filter((template): template is TemplateDefinition => Boolean(template));
}

const distinctions: { dimension: string; resume: string; cv: string; academic: string }[] = [
  {
    dimension: 'Where the word is used',
    resume: 'United States and Canada, for almost every commercial role',
    cv: 'UK, Ireland, most of Europe, Australia, New Zealand, South Africa, the Gulf',
    academic: 'Everywhere, for research, teaching, medicine and grant applications',
  },
  {
    dimension: 'Typical length',
    resume: 'One page under ten years’ experience; two pages beyond that',
    cv: 'Two pages is the working standard; one page for graduates',
    academic: 'No limit — four to twenty pages is normal',
  },
  {
    dimension: 'Photo',
    resume: 'Never',
    cv: 'No in the UK and Ireland; still common in parts of continental Europe',
    academic: 'No',
  },
  {
    dimension: 'Date of birth, marital status, nationality',
    resume: 'Never — US employers actively avoid protected characteristics',
    cv: 'Omit in the UK; occasionally still expected in parts of Europe and the Gulf',
    academic: 'Omit; citizenship only where a grant or visa requires it',
  },
  {
    dimension: 'Paper size',
    resume: 'US Letter, 8.5 × 11 in',
    cv: 'A4, 210 × 297 mm',
    academic: 'Whichever the institution’s country uses',
  },
  {
    dimension: 'What leads the document',
    resume: 'A three-line summary, then experience, achievements first',
    cv: 'A personal profile, then experience; slightly more duty-descriptive',
    academic: 'Research interests, publications, funding, teaching',
  },
];

const paperFacts = [
  {
    label: 'US Letter',
    value: '8.5 × 11 in — 215.9 × 279.4 mm',
    note: 'Wider and shorter. The North American default in every office printer.',
  },
  {
    label: 'A4',
    value: '210 × 297 mm — 8.27 × 11.69 in',
    note: 'Narrower and 17.6 mm taller. The default everywhere else.',
  },
  {
    label: 'The practical difference',
    value: `${PAPER.a4.height - PAPER.letter.height} px of vertical room at 96 dpi`,
    note: 'Roughly four to six lines of body text — enough to push your last bullet onto page two.',
  },
];

const blocks = [
  {
    heading: 'The header',
    points: [
      'Name, then the title of the job you are applying for — not your current internal title if it is company jargon.',
      'City and state. A street address is unnecessary and, for a document you email to strangers, unwise.',
      'One phone number with an area code, one email address you check daily, and a customised LinkedIn URL. Drop the rest.',
      'No photo, no date of birth, no marital status. A US recruiter is trained to avoid these, and some systems flag documents that contain them.',
    ],
  },
  {
    heading: 'The summary',
    points: [
      'Three lines maximum, written last. Role, years, the scale you work at, and one number.',
      'Mirror the vocabulary of the posting where it is honest to do so: if they say “demand planning”, do not write “stock forecasting”.',
      'Delete any objective statement that describes what you want from them. That belongs in the cover letter.',
    ],
  },
  {
    heading: 'Experience',
    points: [
      'Reverse chronological. Company, title, location, then Month Year – Month Year dates.',
      'Three to five achievement bullets for recent roles. Start with a verb, end with a result.',
      'Ten to fifteen years of history is enough for most applications. Older roles become a single “Earlier career” line.',
      'Contract or agency work: name the client and put the agency in brackets, so the reader can follow the timeline.',
    ],
  },
  {
    heading: 'Education',
    points: [
      'One line per degree once you have work experience: degree, institution, graduation year.',
      'Include a GPA only if it is roughly 3.5 or above and you graduated within the last two years.',
      'US employers rarely need your high school once you hold a degree.',
      'International qualifications: add a short equivalence in brackets, for example “First Class Honours (≈ 3.7 GPA)”.',
    ],
  },
  {
    heading: 'Skills',
    points: [
      'Eight to fourteen concrete, checkable skills. Software, languages, methods, certifications.',
      'No rating bars. A bar claiming 80% Python means nothing to a reader and nothing to a parser.',
      'Put the skills the posting names first — most screeners scan this block for exact matches before reading anything else.',
    ],
  },
];

const faqs: FaqEntry[] = [
  {
    question: 'Should I call my document a resume or a CV?',
    answer:
      'In the US and Canada, call it a resume for any commercial role. Call it a CV if you are applying to academia, research, medicine or a fellowship anywhere in the world, or to almost any employer in the UK, Ireland, Europe, Australia or New Zealand. The file name matters too: recruiters search their downloads folder for the word they expect.',
  },
  {
    question: 'Should a US resume include a photo?',
    answer:
      'No. US hiring processes deliberately avoid information about protected characteristics, and many companies instruct recruiters to discard or anonymise documents containing a photograph. A photo also breaks text extraction in some tracking systems. Keep the space for a bullet point.',
  },
  {
    question: 'Does the paper size actually matter if I only email the PDF?',
    answer: `Yes, in two situations that happen often: someone prints your resume for an interview panel, and a system re-paginates the file. A4 is ${PAPER.a4.height - PAPER.letter.height} px taller than Letter at 96 dpi, so a document built on A4 and printed on Letter can lose its last few lines to a second page. Set Letter for North America before you finish laying out the page, not after.`,
  },
  {
    question: 'Is one page still the rule?',
    answer:
      'One page is the expectation below roughly ten years of experience, and it is a genuine filter — recruiters read the top half of page one first regardless. Beyond ten years, or in senior technical and management roles, two pages are normal and cramming into one costs you more than it saves. Three pages is a CV, not a resume.',
  },
  {
    question: 'How far back should the work history go?',
    answer:
      'Ten to fifteen years of detail, then a compressed “Earlier career” line listing titles and employers without bullets. This keeps the document current, avoids implicit age signalling, and spares you from explaining a 2004 job in a 2026 interview.',
  },
  {
    question: 'Do I need a references section?',
    answer:
      '"References available on request" is a line every reader already assumes, so it is a wasted line. Keep referees ready in a separate document and provide them when asked, after the first or second interview.',
  },
  {
    question: 'What if I am applying for an academic post in the US?',
    answer:
      'Then you write a CV, not a resume: no page limit, and the emphasis moves to publications, funding, teaching, conference talks and service. The one-page rule and the summary section both disappear. Use a classic single-column layout with generous space for the publication list.',
  },
];

export default function ResumeBuilderPage() {
  const sampleCv = createSampleCV();
  const paperDemo = getTemplateBySlug('ats-resume') ?? getTemplate(DEFAULT_TEMPLATE_ID);

  // Both previews are rendered at the same scale, so the shapes are honestly comparable.
  const a4Width = 230;
  const scale = a4Width / PAPER.a4.width;
  const letterWidth = Math.round(PAPER.letter.width * scale);

  const a4Customization = createDefaultCustomization({
    templateId: paperDemo.id,
    accentColor: paperDemo.accentDefault,
    paperSize: 'a4',
  });
  const letterCustomization = createDefaultCustomization({
    templateId: paperDemo.id,
    accentColor: paperDemo.accentDefault,
    paperSize: 'letter',
  });

  const resumeTemplates = pickTemplates([
    'ats-resume',
    'entry-level-resume',
    'modern-professional',
    'modern-minimal',
    'business-professional-cv',
    'software-engineer-cv',
    'tech-minimal-cv',
    'ats-cv',
  ]);

  return (
    <>
      <Section size="lg">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Resume builder', path: '/resume-builder' },
          ]}
        />
        <div className="max-w-3xl">
          <Eyebrow>US market</Eyebrow>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
            A resume builder that follows US conventions
          </h1>
          <p className="mt-5 text-base leading-relaxed text-pretty text-ink-600 sm:text-lg">
            Most builders hand you the same document whichever country you are applying in. A US
            resume is a different artefact from a European CV: shorter, printed on different
            paper, and stripped of personal details that are normal elsewhere. Here is the
            distinction in full, and how to set the builder up for it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">
              Build a resume — free
            </ButtonLink>
            <ButtonLink href="/resume-maker" size="lg" variant="outline">
              Guidance by career stage
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="Terminology"
          title="Resume, CV, academic CV: three different documents"
          description="The words are used interchangeably in casual conversation and precisely by the people who screen applications. Getting this wrong is the fastest way to look like you did not check."
        />
        <div className="mt-10 overflow-x-auto rounded-xl border border-ink-200 bg-white">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <caption className="sr-only">
              US resume compared with a European CV and an academic CV
            </caption>
            <thead>
              <tr className="bg-ink-50 text-left">
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  Dimension
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-brand-700">
                  US resume
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  UK / EU CV
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  Academic CV
                </th>
              </tr>
            </thead>
            <tbody>
              {distinctions.map((row) => (
                <tr key={row.dimension} className="border-t border-ink-200 align-top">
                  <th scope="row" className="px-4 py-3 text-left font-medium text-ink-800">
                    {row.dimension}
                  </th>
                  <td className="px-4 py-3 font-medium text-ink-900">{row.resume}</td>
                  <td className="px-4 py-3 text-ink-600">{row.cv}</td>
                  <td className="px-4 py-3 text-ink-600">{row.academic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Paper"
              title="Set Letter before you lay the page out"
              description="Paper size is not a printing detail. It changes the line length and therefore where every page break falls."
            />
            <dl className="mt-8 space-y-5">
              {paperFacts.map((fact) => (
                <div key={fact.label} className="border-l-2 border-brand-300 pl-4">
                  <dt className="text-sm font-semibold text-ink-950">{fact.label}</dt>
                  <dd className="mt-0.5 text-sm text-ink-700">{fact.value}</dd>
                  <dd className="mt-1 text-[13px] leading-relaxed text-ink-500">{fact.note}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink-600">
              Paper size is one of the few layout controls available on every plan, precisely
              because getting it wrong ruins a document that is otherwise correct.
            </p>
          </div>

          <figure className="rounded-2xl border border-ink-200 bg-ink-50 p-6">
            <div className="flex items-end justify-center gap-8">
              <div className="text-center">
                <CVThumbnail
                  cv={sampleCv}
                  customization={a4Customization}
                  width={a4Width}
                  className="mx-auto ring-1 ring-ink-200"
                />
                <p className="mt-3 text-xs font-semibold text-ink-700">A4</p>
                <p className="text-[11px] text-ink-500">210 × 297 mm</p>
              </div>
              <div className="text-center">
                <CVThumbnail
                  cv={sampleCv}
                  customization={letterCustomization}
                  width={letterWidth}
                  className="mx-auto ring-1 ring-ink-200"
                />
                <p className="mt-3 text-xs font-semibold text-ink-700">US Letter</p>
                <p className="text-[11px] text-ink-500">8.5 × 11 in</p>
              </div>
            </div>
            <figcaption className="mt-6 text-center text-[13px] leading-relaxed text-ink-500">
              The same resume, the same template, rendered at the same scale on both paper sizes.
              Letter is visibly wider and shorter — the reason a page-perfect A4 document spills
              when it is printed in Chicago.
            </figcaption>
          </figure>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="Length"
          title="One page early, two pages later, never three"
          description="The one-page rule is real, but it is a rule about relevance rather than about typography."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <article className="rounded-xl border border-ink-200 bg-white p-6">
            <h3 className="text-base font-bold text-ink-950">Under 10 years: one page</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              If you are shrinking the type below about 10pt or the margins below 12 mm to make it
              fit, you are not fitting a page — you are hiding text. Cut a role instead, or
              compress the oldest one to a single line.
            </p>
          </article>
          <article className="rounded-xl border border-ink-200 bg-white p-6">
            <h3 className="text-base font-bold text-ink-950">10 years and beyond: two pages</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Two full pages read as senior. Two pages with four lines on the second read as
              careless, so either expand the second page to at least half full or cut back to one.
              Repeat your name in the header area of page two.
            </p>
          </article>
          <article className="rounded-xl border border-ink-200 bg-white p-6">
            <h3 className="text-base font-bold text-ink-950">Three pages: change document</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Past two pages you are writing a CV. That is correct for academia, medicine and some
              federal roles — and wrong for a commercial application, where the third page is
              rarely reached.
            </p>
          </article>
        </div>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          eyebrow="Block by block"
          title="What a US recruiter expects to find, and where"
          description="Screening is fast and pattern-based. Meeting the pattern is not conformity for its own sake — it is what lets a reader find your evidence in fifteen seconds."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {blocks.map((block) => (
            <article key={block.heading} className="rounded-xl border border-ink-200 bg-white p-6">
              <h3 className="text-lg font-bold text-ink-950">{block.heading}</h3>
              <ul className="mt-3 flex flex-col gap-2.5">
                {block.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-ink-700">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="Templates"
          title="Layouts built for the US convention"
          description="Single column, no photo frame, contact details in the body rather than a page header — the combination that survives both a recruiter’s glance and a parser."
        />
        <div className="mt-10">
          <TemplateGrid templates={resumeTemplates} columns={4} />
        </div>
        <p className="mt-8 text-sm text-ink-600">
          Applying through large career portals?{' '}
          <Link href="/ats-cv" className="font-medium text-brand-700 underline underline-offset-2">
            See how each layout is scored for parser safety
          </Link>{' '}
          before you choose.
        </p>
      </Section>

      <Section>
        <FaqSection
          entries={faqs}
          title="US resume questions"
          description="The conventions that differ from the rest of the world, answered directly."
        />
      </Section>

      <Section tone="muted">
        <CtaBanner
          title="Set Letter, drop the photo, write the summary last"
          description="Start from a US-convention template with the paper already correct, and spend your evening on the bullets instead of the margins."
          primaryLabel="Build a resume — free"
          secondaryHref="/resume-maker"
          secondaryLabel="Advice for my career stage"
          note="Free plan includes the ATS-scored resume layouts and PDF export."
        />
        <div className="mt-16">
          <RelatedLinks
            title="Continue"
            links={[
              {
                label: 'Resume maker by career stage',
                href: '/resume-maker',
                description: 'Student, career changer, mid-level and executive.',
              },
              {
                label: 'ATS-friendly layouts',
                href: '/ats-cv',
                description: 'How each template scores for text extraction.',
              },
              {
                label: 'Resume and CV examples',
                href: '/cv-examples',
                description: 'Complete documents by role and seniority.',
              },
              {
                label: 'Inside the builder',
                href: '/cv-builder',
                description: 'Paper size, page breaks and export, explained.',
              },
              {
                label: 'All templates',
                href: '/templates',
                description: 'Every design, filterable by column count and score.',
              },
              {
                label: 'CV templates for Europe',
                href: '/cv-templates',
                description: 'A4 layouts for applications outside North America.',
              },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
