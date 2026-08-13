import type { Metadata } from 'next';
import Link from 'next/link';

import { AtsExplainer } from '@/components/marketing/home/AtsExplainer';
import { CategoryCards } from '@/components/marketing/home/CategoryCards';
import { HomeHero } from '@/components/marketing/home/HomeHero';
import { Testimonials } from '@/components/marketing/home/Testimonials';
import {
  ArrowIcon,
  AutosaveIcon,
  DownloadIcon,
  DuplicateIcon,
  PreviewIcon,
  ReorderIcon,
  TemplateIcon,
} from '@/components/marketing/home/icons';
import { PricingCards } from '@/components/marketing/PricingCards';
import {
  CtaBanner,
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
import { CV_FONTS } from '@/lib/cv/format';
import {
  atsSafeTemplates,
  findTemplate,
  TEMPLATE_COUNT,
} from '@/lib/cv/template-registry';
import { pageMetadata } from '@/lib/seo/metadata';
import { howToSchema, softwareApplicationSchema } from '@/lib/seo/schema';
import { site } from '@/lib/site';
import { BUILT_IN_SECTION_IDS, type TemplateDefinition } from '@/types/cv';

export const metadata: Metadata = pageMetadata({
  title: 'Create a Professional CV Online — Free CV Builder',
  description:
    `Create a professional CV online with ${TEMPLATE_COUNT} ATS-friendly templates, a live page preview and instant PDF download. Start free — no credit card, no design skills.`,
  path: '/',
  keywords: [
    'create cv online',
    'online cv builder',
    'cv maker',
    'free cv builder',
    'professional cv',
    'ats cv template',
    'resume builder',
  ],
});

/* -------------------------------------------------------------------------- */
/* Content                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The four steps, defined once. `StepList` renders them and `howToSchema` describes them,
 * so the visible instructions and the structured data cannot disagree.
 */
const HOW_IT_WORKS: { title: string; description: string }[] = [
  {
    title: 'Pick a template',
    description: `Start from any of the ${TEMPLATE_COUNT} designs, filtered by category or by ATS score. Nothing is locked in — changing template later keeps every word you have written.`,
  },
  {
    title: 'Fill in the fields',
    description:
      'Type into real fields — role, employer, dates, achievements — instead of wrestling a text box. Load the worked example first if you want to see the shape of a strong entry.',
  },
  {
    title: 'Shape it for the job',
    description:
      'Reorder or switch off sections, adjust the accent colour, fonts and spacing, and trim to one page. The preview redraws as you type, at true page size.',
  },
  {
    title: 'Download the PDF',
    description:
      'Export to A4 or US Letter. The text stays selectable, so a parser reads words rather than a picture of them. Duplicate the CV to tailor the next version.',
  },
];

const FEATURES: { title: string; description: string; icon: React.ReactNode }[] = [
  {
    title: 'A preview that is the document',
    description:
      'Same renderer, same page box, same fonts as the export — not an approximation. You can see where the page break will land while you are still writing the sentence above it.',
    icon: PreviewIcon,
  },
  {
    title: 'Autosave you can forget about',
    description:
      'Edits are written to your account a second or two after you stop typing. There is no save button, and no lost draft when a laptop lid closes on the train.',
    icon: AutosaveIcon,
  },
  {
    title: 'Reorder or hide any section',
    description: `Drag the ${BUILT_IN_SECTION_IDS.length} built-in sections into the order your story needs — skills above experience for a career changer — and switch off the ones that do not earn their space.`,
    icon: ReorderIcon,
  },
  {
    title: 'Switch template, keep your text',
    description: `Your CV is stored as structured content, not as a page layout. Try all ${TEMPLATE_COUNT} designs on your real material; your section order, accent colour and spacing come with you.`,
    icon: TemplateIcon,
  },
  {
    title: 'PDF export that matches',
    description:
      'A4 or US Letter, drawn by the same engine as the preview. Text stays selectable and searchable, which is exactly what an applicant tracking system needs to read it.',
    icon: DownloadIcon,
  },
  {
    title: 'One CV per application',
    description:
      'Duplicate a master CV and rewrite the summary for a specific advert. Free accounts keep two CVs; Pro keeps as many versions as your search needs.',
    icon: DuplicateIcon,
  },
];

/** A deliberate mix of free and Pro designs across five of the six categories. */
const SHOWCASE_IDS = [
  'modern-01',
  'creative-03',
  'ats-02',
  'corporate-05',
  'tech-01',
  'modern-08',
  'classic-01',
  'tech-04',
  'corporate-02',
  'classic-03',
];

const FAQS: FaqEntry[] = [
  {
    question: `Is ${site.name} really free to use?`,
    answer:
      'Yes, and there is no trial countdown. A free account gives you the full editor, the real-time preview, autosave, up to two saved CVs and five PDF downloads a month, with no credit card at sign-up. Pro exists for people who want every template, unlimited CVs and unlimited downloads while they are actively applying.',
  },
  {
    question: 'How long does it take to create a CV online?',
    answer:
      'From a blank page, most people finish a solid first draft in 15 to 30 minutes — the writing is the slow part, not the formatting. Tailoring an existing CV to a new advert usually takes five to ten minutes: duplicate it, rewrite the summary, reorder a couple of bullet points.',
  },
  {
    question: 'Will my CV get through an applicant tracking system?',
    answer:
      'Nobody can promise that, and you should be wary of anyone who does: every system parses differently and none of the vendors publish their rules. What you can control is the format. Single-column layouts, conventional section headings, real text instead of graphics and a selectable-text PDF remove the common reasons a CV comes out garbled.',
  },
  {
    question: 'Can I change template after I have written everything?',
    answer:
      'Yes. Your content is stored as structured data — jobs, dates, bullet points — separately from the design, so switching template re-renders the same content in a new layout. Your section order, accent colour and paper size carry over, and nothing is retyped.',
  },
  {
    question: 'What is the difference between a CV and a resume?',
    answer:
      'It is mostly geography. In the UK, Ireland, most of Europe, the Middle East and much of Asia and Africa, a CV is the standard two-page job application document. In the US and Canada, that document is called a resume and is normally one page, while a CV means a long academic record of publications and teaching. The templates here cover both conventions.',
  },
  {
    question: 'Should I put a photo on my CV?',
    answer:
      'It depends on where you are applying. Photos are conventional in Germany, France, Spain, much of Latin America and the Middle East. They are actively discouraged in the UK, Ireland, the US, Canada and Australia, where employers often strip them out to reduce discrimination risk. Templates with a photo can render without one, so you can build both versions.',
  },
  {
    question: 'What do I actually download at the end?',
    answer:
      'A PDF, in A4 or US Letter, generated by the same rendering engine that drew your preview — so the spacing, fonts and page breaks are the ones you approved on screen. The text is real text, not an image, which means it can be searched, copied and parsed.',
  },
  {
    question: 'Who owns the CV I create, and can I delete it?',
    answer:
      'You do. Your CV content is yours, you can export it as a PDF at any time, and deleting a CV in your dashboard removes it. Deleting your account removes your CVs with it.',
  },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function HomePage() {
  const showcase = SHOWCASE_IDS.map((id) => findTemplate(id)).filter(
    (template): template is TemplateDefinition => Boolean(template),
  );
  const atsPerfect = atsSafeTemplates().length;

  return (
    <>
      <HomeHero />

      {/* 2 — Template showcase --------------------------------------------- */}
      <Section>
        <SectionHeading
          eyebrow="Templates"
          title="Designs a recruiter has seen before — done properly"
          description={`Ten of the ${TEMPLATE_COUNT} layouts in the library, previewed with real content rather than grey placeholder bars. Free designs sit next to Pro ones; every card shows which is which.`}
        />
        {/* `width` matches the card's inner width at the desktop container size, so the
            fixed-size thumbnail is not clipped by the card's overflow. */}
        <TemplateGrid templates={showcase} columns={5} width={200} className="mt-12" />
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/templates" size="lg" variant="outline">
            See all {TEMPLATE_COUNT} templates
          </ButtonLink>
          <Link
            href="/cv-templates"
            className="group inline-flex items-center gap-1.5 px-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Or read how to choose one
            <ArrowIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Section>

      {/* 3 — How it works --------------------------------------------------- */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="How it works"
          title="Four steps from blank page to finished PDF"
          description="No download, no template file to wrestle with in a word processor, and no formatting that falls apart when you add a line."
        />
        <div className="mt-12">
          <StepList steps={HOW_IT_WORKS} />
        </div>
        <p className="mt-10 text-center text-sm text-ink-600">
          Not sure what to write?{' '}
          <Link
            href="/cv-examples"
            className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
          >
            Worked CV examples by role
          </Link>{' '}
          show the finished article before you start.
        </p>
      </Section>

      {/* 4 — Features ------------------------------------------------------- */}
      <Section>
        <SectionHeading
          eyebrow="The editor"
          title="What you actually get to work with"
          description="The builder is the product, so it is worth being specific about what it does rather than listing adjectives."
        />
        <div className="mt-12">
          <FeatureGrid items={FEATURES} columns={3} />
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/cv-builder"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            A full tour of the online CV builder
            <ArrowIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Section>

      {/* 5 — ATS ------------------------------------------------------------ */}
      <Section tone="ink">
        <AtsExplainer />
      </Section>

      {/* 6 — Categories ----------------------------------------------------- */}
      <Section>
        <SectionHeading
          eyebrow="Browse by style"
          title="Six families, one library"
          description="Categories exist so you can rule things out quickly. Pick the one that matches how your industry expects a CV to look, then narrow by ATS score and column count."
        />
        <div className="mt-12">
          <CategoryCards />
        </div>
      </Section>

      {/* 7 — Stats ---------------------------------------------------------- */}
      <Section tone="muted" size="sm">
        <SectionHeading
          title="Numbers we can stand behind"
          description={`We have been building this since ${site.founded} and we are not going to invent a user count for a homepage. Everything below is read straight out of the product.`}
        />
        <div className="mt-12">
          <StatRow
            stats={[
              { value: String(TEMPLATE_COUNT), label: 'professional templates' },
              { value: String(atsPerfect), label: 'score 5/5 on our ATS checklist' },
              {
                value: String(BUILT_IN_SECTION_IDS.length),
                label: 'built-in sections, all reorderable',
              },
              { value: String(CV_FONTS.length), label: 'typefaces, on A4 or US Letter' },
            ]}
          />
        </div>
      </Section>

      {/* 8 — Pricing preview ------------------------------------------------ */}
      <Section>
        <SectionHeading
          eyebrow="Pricing"
          title="Build it free. Pay only if you need more."
          description="The free plan is a real plan, not a preview you have to buy your way out of at the download step. Upgrade when an active search makes unlimited versions worth it."
        />
        <PricingCards className="mt-12" />
        <div className="mt-10 text-center">
          <Link
            href="/pricing"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Compare every limit on the pricing page
            <ArrowIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Section>

      {/* 9 — Testimonials --------------------------------------------------- */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="Illustrative feedback"
          title="How people tend to use it"
          description="Three composite examples drawn from the themes that come up most often in support conversations."
        />
        <div className="mt-12">
          <Testimonials />
        </div>
      </Section>

      {/* 10 — FAQ ------------------------------------------------------------ */}
      <Section>
        <FaqSection
          entries={FAQS}
          description="The questions we are asked most, answered without marketing varnish."
        />
        <div className="mt-16">
          <RelatedLinks
            title="Keep reading"
            links={[
              {
                label: 'Online CV builder',
                href: '/cv-builder',
                description: 'The editor, the live preview and PDF export in detail.',
              },
              {
                label: 'CV templates',
                href: '/cv-templates',
                description: 'International CV formats and how to choose between them.',
              },
              {
                label: 'ATS CV templates',
                href: '/ats-cv',
                description: 'The parser-safe layouts, and why they are built that way.',
              },
              {
                label: 'CV examples',
                href: '/cv-examples',
                description: 'Worked examples by role and career stage.',
              },
              {
                label: 'Free CV builder',
                href: '/free-cv-builder',
                description: 'Exactly what the free plan includes — and what it does not.',
              },
              {
                label: 'Blog',
                href: '/blog',
                description: 'Guides on writing, formatting and applying.',
              },
            ]}
          />
        </div>
      </Section>

      {/* 11 — Final CTA ------------------------------------------------------ */}
      <Section size="sm">
        <CtaBanner
          title="Create your professional CV online today"
          description={`Pick a template, write it once, and keep a tailored version for every application. ${TEMPLATE_COUNT} designs, ${atsPerfect} of them rated 5/5 for ATS parsing.`}
          primaryLabel="Create my CV — free"
          secondaryHref="/templates"
          secondaryLabel="Browse templates"
          note="Free account · no credit card · your CV stays yours"
        />
      </Section>

      <JsonLd
        nodes={[
          softwareApplicationSchema(),
          howToSchema({
            name: `How to create a professional CV online with ${site.name}`,
            description: `Build an ATS-friendly CV online in four steps: choose one of ${TEMPLATE_COUNT} templates, fill in your details, tailor the layout to the job, and download a PDF.`,
            steps: HOW_IT_WORKS.map((step) => ({ name: step.title, text: step.description })),
          }),
        ]}
      />
    </>
  );
}
