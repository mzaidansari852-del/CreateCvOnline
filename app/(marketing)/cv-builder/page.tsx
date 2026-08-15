import Link from 'next/link';

import { CVPagePreview } from '@/components/cv/CVThumbnail';
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
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import { JsonLd } from '@/components/seo/JsonLd';
import { ButtonLink } from '@/components/ui/button';
import { createDefaultCustomization, createSampleCV } from '@/lib/cv/defaults';
import {
  getTemplate,
  getTemplateBySlug,
  templateDefaults,
  DEFAULT_TEMPLATE_ID,
  FREE_TEMPLATE_COUNT,
  TEMPLATE_COUNT,
} from '@/lib/cv/template-registry';
import { PLANS } from '@/lib/plans';
import { pageMetadata } from '@/lib/seo/metadata';
import { howToSchema } from '@/lib/seo/schema';
import { site } from '@/lib/site';
import type { TemplateDefinition } from '@/types/cv';

export const metadata = pageMetadata({
  title: 'CV Builder — The Editor, Explained Screen by Screen',
  description:
    'A guided tour of the online CV builder: split editor and live preview, autosave, drag-to-reorder sections, template switching that keeps your text, and PDF export.',
  path: '/cv-builder',
  keywords: [
    'cv builder',
    'online cv builder',
    'cv editor',
    'live cv preview',
    'cv builder with pdf download',
    'drag and drop cv builder',
  ],
});

function pickTemplates(slugs: string[]): TemplateDefinition[] {
  return slugs
    .map((slug) => getTemplateBySlug(slug))
    .filter((template): template is TemplateDefinition => Boolean(template));
}

const freeLimits = PLANS.free.limits;

const editorPanes = [
  {
    title: 'Left: the section rail',
    description:
      'Every section of your CV as a row you can drag. Grab a handle and the order changes in the preview as you drop it — the array position is the render order, so there is no separate “apply” step. Toggle a section off and it disappears from the page without deleting the content behind it.',
  },
  {
    title: 'Middle: the form',
    description:
      'One panel per section, with fields for the things that actually belong on a CV: role, company, location, start and end dates, a one-line description and a list of achievement bullets. Long text fields grow as you type instead of scrolling inside a tiny box.',
  },
  {
    title: 'Right: the page',
    description:
      'A real A4 or US Letter page, laid out at true page pixels and scaled down with a CSS transform rather than reflowed at a smaller width. That is why the preview is trustworthy: it is not an approximation of the PDF, it is the PDF at a different zoom level.',
  },
];

const editorFeatures = [
  {
    title: 'A preview that is the document',
    description:
      'The preview and the exported PDF are produced by the same React component. There is no second renderer that can disagree with the first, which is the usual reason a downloaded CV looks nothing like the screen.',
  },
  {
    title: 'Autosave while you type',
    description:
      'Edits are written roughly once every 1.2 seconds during active typing, and immediately when you leave a field. Close the tab mid-sentence and the sentence is still there.',
  },
  {
    title: 'Drag to reorder anything',
    description:
      'Sections, jobs inside a section, and bullets inside a job. A career changer can lift Skills above Experience in about two seconds; a graduate can put Education first without editing a template.',
  },
  {
    title: 'Template switching keeps your text',
    description:
      'Your content and your styling are two separate objects. Switching from a serif classic to a two-column tech layout changes only the styling object — no re-typing, no lost bullets, no truncation.',
  },
  {
    title: 'Zoom and page navigation',
    description:
      'Zoom the preview to read 7pt type, or zoom out to see where page two begins. Page breaks are visible while you edit, so you find the orphaned heading before a recruiter does.',
  },
  {
    title: 'A4 or US Letter, per document',
    description:
      'A4 is 794 × 1123 px at 96 dpi; US Letter is 816 × 1056 px — wider and 67 px shorter. Choose per CV, because the same document on the wrong paper can push your last line onto a second page.',
  },
  {
    title: 'Twelve built-in sections',
    description:
      'Profile, experience, education, skills, projects, certifications, languages, awards, volunteering, publications, interests and references. Custom sections beyond those twelve are a paid feature.',
  },
  {
    title: 'Room for a long career',
    description:
      'A single document holds up to 40 roles, 20 education entries, 80 skills and 30 projects. The constraint on your CV should be the reader’s attention, not the software.',
  },
  {
    title: 'PDF export in one click',
    description:
      'Headless Chromium renders the same markup with the fonts embedded and hands back a file named after you — amina-el-fassi-cv.pdf, not document(3).pdf.',
  },
];

const buildSteps = [
  {
    title: 'Start a document',
    description:
      'Open a blank CV or load the built-in worked example and edit over it. The example is a complete, realistic CV, which is a far faster starting point than an empty form.',
  },
  {
    title: 'Fill the left, watch the right',
    description:
      'Work top to bottom: header, experience, education, skills. The page on the right redraws as you type, so you always know how much room is left.',
  },
  {
    title: 'Try three templates',
    description:
      'Switch layouts with your real content in place. A design that looked elegant with placeholder text often falls apart with a nine-year career in it — and vice versa.',
  },
  {
    title: 'Export the PDF',
    description:
      'Download the file, open it once to check the page breaks, and send it. The PDF carries embedded fonts, so it renders identically on a recruiter’s machine.',
  },
];

const deliberateOmissions = [
  {
    title: 'It will not write your CV for you',
    description:
      'There is no button that invents achievements. The bullets have to come from your own work — the editor makes them fast to write and easy to reorder, and that is the honest limit of what a layout tool can do.',
  },
  {
    title: 'There is no .docx export',
    description:
      'Only PDF. A Word file re-flows on a machine with different fonts, which defeats the point of designing the page in the first place. If an employer insists on Word, use their own form or template.',
  },
  {
    title: 'There is no import from an old PDF',
    description:
      'Extracting text from a two-column PDF reliably scrambles the reading order. Copying and pasting section by section takes about ten minutes and gives you a chance to cut the dead weight.',
  },
  {
    title: 'We do not score your writing',
    description:
      'Templates carry an ATS parse score from 1 to 5, because that is a property of a layout and can be tested. A number claiming your career is “87% optimised” would be invented.',
  },
  {
    title: 'You cannot drag a text box anywhere',
    description:
      'Layout is owned by the template. You choose the template, the accent colour, the paper and the section order; the template keeps the typography consistent so the document still looks deliberate at 2 a.m.',
  },
];

const faqs: FaqEntry[] = [
  {
    question: 'Does the preview really match the downloaded PDF?',
    answer:
      'Yes, and not by careful maintenance — by construction. The preview, the template gallery and the PDF all render the same document component. The export step simply runs it through headless Chromium at page size with the fonts embedded, so line breaks, page breaks and spacing are identical.',
  },
  {
    question: 'If I change template, do I lose my content?',
    answer:
      'No. Content and styling are stored separately: your text lives in the CV document, while the template id, colour, fonts and spacing live in a customisation object. Switching templates rewrites one field of the styling object and touches nothing you typed.',
  },
  {
    question: 'What happens if my browser crashes mid-edit?',
    answer:
      'The editor saves continuously while you type — about one write every 1.2 seconds — so the most you can lose is the word you were in the middle of. Reopen the document and carry on.',
  },
  {
    question: 'Can I hide a section without deleting it?',
    answer:
      'Yes. Every section has an enabled flag that is separate from its content, so you can switch Interests or References off for one application and back on for another without retyping anything.',
  },
  {
    question: 'Can I export to Word instead of PDF?',
    answer:
      'No. The builder exports PDF only. A .docx re-flows on any machine that lacks your fonts, which is exactly the failure the editor exists to prevent. Send PDF unless an employer explicitly demands a Word file, in which case use the form they provide.',
  },
  {
    question: 'How many CVs and downloads do I get without paying?',
    answer: `The free plan keeps ${freeLimits.maxCvs} CVs in your account and allows ${freeLimits.maxDownloadsPerMonth} PDF downloads per calendar month, using ${FREE_TEMPLATE_COUNT} of the ${TEMPLATE_COUNT} templates. Nothing expires and no card is required.`,
  },
  {
    question: 'Does the editor work on a phone?',
    answer:
      'It works, but the split view stacks: the form first, the page preview below it. Writing the content on a phone is fine; do the final fit-and-finish pass — page breaks, spacing, the last orphaned line — on a larger screen.',
  },
];

export default function CvBuilderPage() {
  const sampleCv = createSampleCV();
  const previewTemplate = getTemplate(DEFAULT_TEMPLATE_ID);
  const previewCustomization = createDefaultCustomization({
    ...templateDefaults(previewTemplate),
  });

  const showcase = pickTemplates([
    'modern-professional',
    'ats-cv',
    'software-engineer-cv',
    'executive-cv',
    'traditional-cv',
    'ui-ux-designer-cv',
    'modern-clean',
    'data-scientist-cv',
  ]);

  return (
    <>
      <Section size="lg">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'CV builder', path: '/cv-builder' },
          ]}
        />

        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Eyebrow>The editor</Eyebrow>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
              The CV builder, screen by screen
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-ink-600 sm:text-lg">
              Most builders sell you a screenshot. This page walks through what is actually on the
              screen — the split editor, the live page beside it, and every control in between — and
              is honest about the things the tool does not do.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/register" size="lg">
                Open the editor — free
              </ButtonLink>
              <ButtonLink href="/templates" size="lg" variant="outline">
                Browse {TEMPLATE_COUNT} templates
              </ButtonLink>
            </div>
            <p className="mt-4 text-[13px] text-ink-500">
              No card required. {FREE_TEMPLATE_COUNT} templates and{' '}
              {freeLimits.maxDownloadsPerMonth} PDF downloads a month on the free plan.
            </p>
          </div>

          <figure className="mx-auto w-full max-w-[460px]">
            <CVPagePreview
              cv={sampleCv}
              customization={previewCustomization}
              maxWidth={440}
              className="mx-auto ring-1 ring-ink-200"
            />
            <figcaption className="mt-4 text-center text-[13px] leading-relaxed text-ink-500">
              A live render of the {previewTemplate.name} template with the built-in example CV.
              This is not an image — it is the same component that produces your PDF.
            </figcaption>
          </figure>
        </div>

        <div className="mt-16 border-t border-ink-200 pt-10">
          <StatRow
            stats={[
              { value: String(TEMPLATE_COUNT), label: 'templates in the editor' },
              { value: String(FREE_TEMPLATE_COUNT), label: 'usable on the free plan' },
              { value: '2', label: 'paper sizes: A4 and Letter' },
              { value: '1.2s', label: 'between autosaves while typing' },
            ]}
          />
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="The layout"
          title="Three panes, no hidden modes"
          description="The whole editor is one screen. There is no wizard to complete before you can see your document, and no separate design mode where the preview goes stale."
        />
        <div className="mt-10">
          <FeatureGrid items={editorPanes} columns={3} />
        </div>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          eyebrow="Features"
          title="What the builder does"
          description="Each of these is a thing you can verify in the first ten minutes of using it."
        />
        <div className="mt-10">
          <FeatureGrid items={editorFeatures} columns={3} />
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          eyebrow="How it works"
          title="From empty document to exported PDF"
          description="Four steps. The realistic total for a first draft is under an hour, most of which is writing rather than formatting."
        />
        <div className="mt-12">
          <StepList steps={buildSteps} />
        </div>
        <JsonLd
          nodes={[
            howToSchema({
              name: 'How to build a CV with the online CV builder',
              description:
                'Create a document, fill the editor form while watching the live page preview, try several templates with your real content, and export a PDF.',
              steps: buildSteps.map((step) => ({ name: step.title, text: step.description })),
            }),
          ]}
        />
      </Section>

      <Section>
        <SectionHeading
          align="left"
          eyebrow="Templates"
          title="Every template runs in the same editor"
          description="Switching between these does not change a single character of your content. A sample of eight, one from each corner of the library:"
        />
        <div className="mt-10">
          <TemplateGrid templates={showcase} columns={4} />
        </div>
        <p className="mt-8 text-sm text-ink-600">
          <Link
            href="/templates"
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            See all {TEMPLATE_COUNT} templates
          </Link>{' '}
          or narrow it down to{' '}
          <Link href="/ats-cv" className="font-medium text-brand-700 underline underline-offset-2">
            the layouts that parse cleanly in applicant tracking systems
          </Link>
          .
        </p>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="Limits"
          title="What it deliberately does not do"
          description="Every one of these is a decision rather than a missing feature, and each has a reason."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {deliberateOmissions.map((item) => (
            <li key={item.title} className="rounded-xl border border-ink-200 bg-white p-5">
              <h3 className="text-base font-semibold text-ink-950">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{item.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <FaqSection
          entries={faqs}
          title="Questions about the editor"
          description={`Specific to how ${site.name} works. Pricing questions are answered on the free plan page.`}
        />
      </Section>

      <Section tone="muted">
        <CtaBanner
          title="Open the editor and put your own text in it"
          description="The fastest way to judge a CV builder is to paste one job into it and see what the page does. That takes about four minutes and costs nothing."
          primaryLabel="Start building — free"
          secondaryHref="/cv-maker"
          secondaryLabel="See the 45-minute plan"
          note="No credit card. Your CV stays in your account whether or not you ever upgrade."
        />
        <div className="mt-16">
          <RelatedLinks
            title="Where to go next"
            links={[
              {
                label: 'CV maker: the one-sitting method',
                href: '/cv-maker',
                description: 'A timed plan for turning rough notes into a finished document.',
              },
              {
                label: 'Free CV builder',
                href: '/free-cv-builder',
                description: 'Exactly what the free plan includes, and what it does not.',
              },
              {
                label: 'Why build a CV online',
                href: '/create-cv-online',
                description: 'The browser compared honestly with Word, Docs and a designer.',
              },
              {
                label: 'ATS-friendly CV templates',
                href: '/ats-cv',
                description: 'Single-column layouts scored for parser safety.',
              },
              {
                label: 'CV advice by profession',
                href: '/cv-for',
                description: 'What to write for your field — metrics, section order and rewrites.',
              },
              {
                label: 'Worked CV examples',
                href: '/cv-examples',
                description: 'Complete documents by role, with every choice in them explained.',
              },
              {
                label: 'All CV templates',
                href: '/cv-templates',
                description: `Browse the full library of ${TEMPLATE_COUNT} designs by category.`,
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
