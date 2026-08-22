import type { Metadata } from 'next';
import Link from 'next/link';

import {
  Breadcrumbs,
  CtaBanner,
  FaqSection,
  FeatureGrid,
  RelatedLinks,
  Section,
  SectionHeading,
  StatRow,
  type FaqEntry,
} from '@/components/marketing/primitives';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/feedback';
import {
  FREE_TEMPLATE_COUNT,
  TEMPLATE_CATEGORIES,
  TEMPLATE_COUNT,
  atsSafeTemplates,
  freeTemplates,
  getTemplateBySlug,
  premiumTemplates,
  templatesByCategory,
} from '@/lib/cv/template-registry';
import { PAPER } from '@/lib/cv/format';
import { PLANS } from '@/lib/plans';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';
import { BUILT_IN_SECTION_IDS, fontKeySchema, type TemplateDefinition } from '@/types/cv';

export const metadata: Metadata = pageMetadata({
  title: 'Features — Everything the CV Builder Does',
  description: `A full tour of the editor: live preview, autosave, drag-to-reorder sections, ${TEMPLATE_COUNT} templates you can switch between without losing data, PDF export and share links.`,
  path: '/features',
  keywords: [
    'cv builder features',
    'resume builder features',
    'live cv preview',
    'cv pdf export',
    'ats cv builder',
  ],
});

const freeLimits = PLANS.free.limits;
const proLimits = PLANS.pro.limits;

/** Derived from the registry so a new template updates the copy automatically. */
const ATS_SAFE_COUNT = atsSafeTemplates().length;
const FREE_ATS_SAFE_COUNT = freeTemplates().filter((template) => template.atsScore >= 5).length;
const FREE_ATS_CATEGORY_COUNT = templatesByCategory('ats').filter(
  (template) => !template.premium,
).length;

/* -------------------------------------------------------------------------- */
/* Data                                                                        */
/* -------------------------------------------------------------------------- */

const writingFeatures = [
  {
    title: 'A split editor, not a wizard',
    description:
      'Sections on the left, the form in the middle, a real page on the right. Nothing is hidden behind a “next” button, so you can jump straight to the one bullet you came back to fix.',
  },
  {
    title: 'A preview that is the document',
    description:
      'The preview, the print view and the exported PDF are rendered by the same component from the same data. There is no second renderer that can quietly disagree with the first.',
  },
  {
    title: 'Autosave while you type',
    description:
      'Edits are written about once every 1.2 seconds during active typing and immediately when you leave a field. Close the tab mid-sentence; the sentence is still there.',
  },
  {
    title: `${BUILT_IN_SECTION_IDS.length} built-in sections`,
    description:
      'Summary, experience, education, skills, languages, projects, certifications, awards, volunteering, publications, interests and references — each with fields that match what belongs on a CV.',
  },
  {
    title: 'Reorder, rename, hide',
    description:
      'Drag a section to move it; the array position is the render order, so the page updates as you drop. Rename “Work Experience” to “Selected Engagements”, or switch a section off without deleting a word of it.',
  },
  {
    title: 'Room for a long career',
    description:
      'One document holds up to 40 roles, 20 qualifications, 80 skills and 30 projects. The limit on your CV should be a reader’s attention, not the software.',
  },
];

/**
 * Getting a CV in — import and the AI writer.
 *
 * This page claims to describe everything the builder does, and for a while it described
 * everything except the two ways of starting. Both shipped and neither was mentioned, which
 * on a page titled "Everything the builder does" is a claim the page itself contradicts.
 */
const startingFeatures = [
  {
    title: 'Import a PDF or Word CV',
    description:
      'Upload the CV you already have and it comes back editable: jobs, dates, bullet points, education, skills and languages. It reads the page layout rather than the raw text order, which is why a two-column CV does not arrive shuffled — most importers extract the text and hope.',
  },
  {
    title: 'Headings found by measurement, not guesswork',
    description:
      'Section headings are identified by their type size and checked against what those sections are called in four languages. Templates disagree with each other — some set headings larger than the body, some smaller and in capitals — so guessing from wording alone finds job titles and misses sections.',
  },
  {
    title: 'You see what it read before anything saves',
    description:
      'The review screen lists every entry it found, not a count. "3 jobs" tells you nothing about whether they are the right three; the actual roles, employers and dates tell you at a glance. Nothing reaches your account until you have looked.',
  },
  {
    title: 'An AI writer for a blank page',
    description:
      'No CV to import? Answer about ten questions in plain words and it writes the first draft: the professional summary from scratch, your sentences turned into achievement bullets, and the dates worked out from however you wrote them.',
  },
  {
    title: 'It will not invent your achievements',
    description:
      'Ask any general AI for a CV bullet and it hands back a percentage you never earned. Here, figures are asked for in their own question and nothing else may produce one — any line that comes back carrying a number you did not give is removed before you see it, and you are told how many were.',
  },
  {
    title: 'Every word still yours to change',
    description:
      'Whether it arrived by upload or was written from your answers, the result is an ordinary CV in the ordinary editor. Rewrite a bullet, drop a job, switch template. Nothing is locked because a machine produced the first version.',
  },
];

const designFeatures = [
  {
    title: `${TEMPLATE_COUNT} templates, six families`,
    description: `Modern, corporate, creative, technology, classic and ATS-focused. ${FREE_TEMPLATE_COUNT} of them are free, and every one is a real layout rather than the same grid in a different colour.`,
  },
  {
    title: 'Switch template without losing data',
    description:
      'Your content and your styling are two separate objects. Moving from a serif classic to a two-column tech layout rewrites only the styling — no retyping, no dropped bullets, no truncation.',
  },
  {
    title: 'Colour and paper on every plan',
    description: `Accent colour, photo on or off, photo shape and date format are free-plan controls. So is paper: ${PAPER.a4.label} or ${PAPER.letter.label}, chosen per document.`,
  },
  {
    title: `${fontKeySchema.options.length} font families`,
    description:
      'Sans and serif faces chosen for legibility at 10pt, set separately for headings and body text. Pro-plan control, because typography is where a CV is won or lost on the second page.',
  },
  {
    title: 'Spacing you can actually tune',
    description:
      'Text size, line height, space between sections and page margins are sliders, not guesses. This is the toolkit for pulling three orphaned lines back onto page one.',
  },
  {
    title: 'Custom sections',
    description:
      'Up to six sections of your own — “Clinical Rotations”, “Exhibitions”, “Security Clearances” — with headings you write. A Pro feature; the twelve built-ins are free.',
  },
];

const outputFeatures = [
  {
    title: 'PDF with real text',
    description:
      'Headless Chromium renders the same markup with fonts embedded. The text is selectable, searchable and machine-readable — never a screenshot of your CV wrapped in a PDF.',
  },
  {
    title: 'Pagination you can see while editing',
    description: `Pages are laid out at true page pixels — ${PAPER.a4.width} × ${PAPER.a4.height} for A4, ${PAPER.letter.width} × ${PAPER.letter.height} for Letter — and scaled with a transform, so the page break in the preview is the page break in the file.`,
  },
  {
    title: 'Headings that do not strand themselves',
    description:
      'Section headings and the first row beneath them are kept together, and a job is not split so that only its dates land on page two.',
  },
  {
    title: 'Sensible file names',
    description:
      'The download is named after you — amina-el-fassi-cv.pdf — not document(3).pdf. It is the name a recruiter will see in their inbox.',
  },
  {
    title: 'Print straight from the browser',
    description:
      'A dedicated print view with the same stylesheet, for when the application asks for a hard copy or you want to proof it on paper.',
  },
  {
    title: 'A share link when you need one',
    description:
      'Publish a CV at an unguessable URL to paste into an e-mail, and switch it off again in one click. Turning sharing off always works, even if a paid period has lapsed.',
  },
];

const jobSearchFeatures = [
  {
    title: 'One CV per application',
    description: `The highest-leverage thing you can do is tailor. Free keeps ${freeLimits.maxCvs} versions so you can see it work; Pro removes the ceiling entirely.`,
  },
  {
    title: 'Duplicate, then edit',
    description:
      'Copy a finished CV in one click and rewrite the summary and the top three bullets for the posting in front of you. A tailored version takes about five minutes.',
  },
  {
    title: 'A dashboard that shows the truth',
    description:
      'Every CV with its template, when you last touched it and how many times it has been downloaded — plus your live quota, so a limit is never a surprise at the download button.',
  },
  {
    title: 'ATS-focused layouts',
    description: `${ATS_SAFE_COUNT} templates score 5/5 on our parser checklist: one column, no text in graphics, real headings, ordinary bullet characters. ${FREE_ATS_SAFE_COUNT} of those are on the free plan, and ${FREE_ATS_CATEGORY_COUNT} sit in the dedicated ATS family.`,
  },
  {
    title: 'Worked examples to start from',
    description:
      'CV examples by role and career stage, written out in full rather than summarised, so you can see what a strong bullet looks like before you write your own.',
  },
  {
    title: 'Guides that are about writing',
    description:
      'The blog covers what to put in a summary, how to quantify an achievement, and what ATS software really does — not tips about “passion” and “synergy”.',
  },
];

const accountFeatures = [
  {
    title: 'Sign in with e-mail or Google',
    description:
      'Authentication is handled by Firebase Authentication. We never store your password; a short-lived token is exchanged once for an httpOnly session cookie.',
  },
  {
    title: 'Your CVs are yours',
    description:
      'Documents are stored per account and are private by default. A CV is only reachable by anyone else if you deliberately publish a share link.',
  },
  {
    title: 'Export and delete',
    description:
      'Download your data, or delete the account outright. Deletion removes the auth record, the profile, every CV and the payment history — not a “deactivated” flag on a row we keep.',
  },
  {
    title: 'Limits enforced on the server',
    description:
      'Every quota is checked before the action runs, not merely hidden in the interface. That cuts both ways: what the pricing page promises is what the server actually allows.',
  },
  {
    title: 'Nothing renews behind your back',
    description: `Paid access is a single payment covering ${PLANS.pro.accessDays} days, with no stored card and no recurring agreement. There is no cancellation maze because there is nothing to cancel.`,
  },
  {
    title: 'Analytics you can live with',
    description:
      'Event names and low-cardinality properties only. No CV content, no e-mail addresses and none of the free text you typed ever reaches an analytics tool.',
  },
];

function pickTemplates(slugs: string[]): TemplateDefinition[] {
  const found = slugs
    .map((slug) => getTemplateBySlug(slug))
    .filter((template): template is TemplateDefinition => Boolean(template));
  if (found.length >= 8) return found.slice(0, 8);
  // Fall back to a deterministic mix so the strip is never short.
  const filler = [...freeTemplates(), ...premiumTemplates()].filter(
    (template) => !found.some((item) => item.id === template.id),
  );
  return [...found, ...filler].slice(0, 8);
}

const STRIP_TEMPLATES = pickTemplates([
  'modern-professional',
  'ats-cv',
  'executive-cv',
  'software-engineer-cv',
  'elegant-serif-cv',
  'creative-designer-cv',
  'modern-minimal',
  'academic-cv',
]);

const FAQ: FaqEntry[] = [
  {
    question: 'Do I need design skills to use this?',
    answer:
      'No. Every template already makes the typographic decisions — margins, hierarchy, how a date sits next to a job title. You choose a layout, type your content, and the page stays consistent. The customisation controls are there for the day you need to reclaim three lines, not as homework.',
  },
  {
    question: 'Will I lose my text if I change template?',
    answer:
      'No. Content and styling are separate objects, and every template consumes exactly the same content shape. Switching template swaps the renderer, never the data — you can try six layouts in a minute and go back to the first one unchanged.',
  },
  {
    question: 'Is the downloaded PDF readable by applicant tracking systems?',
    answer: `The PDF contains real, selectable text with a normal reading order, which is the part that matters to a parser. Beyond that, layout decides: ${ATS_SAFE_COUNT} of our ${TEMPLATE_COUNT} templates are single-column with no text inside graphics and score 5/5 on our own parser checklist. We will not claim a guarantee — no builder can, because every employer configures their system differently.`,
  },
  {
    question: 'Can I work on more than one CV at a time?',
    answer: `Yes. The free plan keeps ${freeLimits.maxCvs} saved CVs and the paid plans are unlimited. Duplicating a finished CV and rewriting the summary for a specific posting is the workflow the product is built around.`,
  },
  {
    question: 'How many PDFs can I download?',
    answer: `${freeLimits.maxDownloadsPerMonth} per calendar month on the free plan, resetting on the 1st, and unlimited on Pro and Lifetime. Downloads only count when a file is actually produced, so a failed export never eats into your allowance.`,
  },
  {
    question: 'Does my CV work on A4 and US Letter?',
    answer: `Both, chosen per document. ${PAPER.a4.label} is the norm across Europe, Africa and most of Asia; ${PAPER.letter.label} is standard in the United States and Canada. The paper size is part of the document, so you can keep an A4 CV and a Letter resume side by side.`,
  },
  {
    question: 'Can I share a CV without sending a file?',
    answer:
      'Yes, on the paid plans. Publishing gives you a link with an unguessable id that renders the CV in a browser. You can unpublish at any time, and unpublishing keeps working even if your paid period has ended — you can never be locked into having something public.',
  },
  {
    question: 'What happens to my documents if I stop paying?',
    answer:
      'They stay in your account and you keep access to them. Free-plan limits apply again, so a CV built on a Pro template will render with the default template and default styling until you upgrade. Your words are never modified or deleted.',
  },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function FeaturesPage() {
  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Features', path: '/features' },
          ]}
        />
        <SectionHeading
          as="h1"
          eyebrow="Product tour"
          title="Everything the builder does — and why each part exists"
          description={
            <>
              A CV builder is only worth using if it removes work you would otherwise do badly in a
              word processor. Here is the whole product, grouped by the job it does, with the limits
              stated where they apply.
            </>
          }
        />

        <div className="mt-12">
          <StatRow
            stats={[
              { value: String(TEMPLATE_COUNT), label: 'templates' },
              { value: String(FREE_TEMPLATE_COUNT), label: 'free on the free plan' },
              { value: String(BUILT_IN_SECTION_IDS.length), label: 'built-in sections' },
              { value: String(ATS_SAFE_COUNT), label: 'score 5/5 for ATS' },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/register" size="lg">
            Start building — free
          </ButtonLink>
          <ButtonLink href="/templates" size="lg" variant="outline">
            See the templates
          </ButtonLink>
        </div>
      </Section>

      {/* 0. Starting -------------------------------------------------------- */}
      <Section id="starting">
        <SectionHeading
          eyebrow="01 · Starting"
          title="Getting your CV in"
          description="Three ways to begin: upload the one you have, answer questions and let the AI write it, or start from a blank page. The first two are what most people need and what most builders do not offer."
          align="left"
        />
        <div className="mt-10">
          <FeatureGrid items={startingFeatures} />
        </div>
      </Section>

      {/* 1. Writing --------------------------------------------------------- */}
      <Section tone="muted" id="writing">
        <SectionHeading
          eyebrow="02 · Writing"
          title="The editor"
          description="Three panes, no wizard, and a preview you can trust because it is the same code that makes the PDF."
          align="left"
        />
        <div className="mt-10">
          <FeatureGrid items={writingFeatures} />
        </div>
      </Section>

      {/* 2. Design ---------------------------------------------------------- */}
      <Section id="design">
        <SectionHeading
          eyebrow="03 · Design"
          title="Templates and customisation"
          description={`${TEMPLATE_COUNT} layouts across six families, and the controls to bend any of them to your content.`}
          align="left"
        />
        <div className="mt-10">
          <FeatureGrid items={designFeatures} />
        </div>

        <div className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-ink-950">Eight of the {TEMPLATE_COUNT}</h3>
              <p className="mt-1 text-sm text-ink-600">
                Live previews, rendered by the same components that build your document.
              </p>
            </div>
            <ButtonLink href="/templates" variant="outline">
              Browse all templates
            </ButtonLink>
          </div>
          <TemplateGrid templates={STRIP_TEMPLATES} columns={4} className="mt-6" />
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATE_CATEGORIES.map((category) => (
            <li
              key={category.id}
              className="rounded-xl border border-ink-200 bg-white p-5 transition-shadow hover:shadow-card"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-ink-950">{category.label}</h3>
                <Badge tone="neutral">{templatesByCategory(category.id).length}</Badge>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{category.blurb}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* 3. Output ---------------------------------------------------------- */}
      <Section tone="muted" id="output">
        <SectionHeading
          eyebrow="04 · Output"
          title="Export, pagination and sharing"
          description="The bit most builders get wrong: what actually lands in the recruiter’s inbox."
          align="left"
        />
        <div className="mt-10">
          <FeatureGrid items={outputFeatures} />
        </div>

        <div className="mt-10 rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
          <h3 className="text-lg font-bold text-ink-950">
            Why we are careful about the phrase “ATS-proof”
          </h3>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink-600">
            Applicant tracking systems are dozens of different products, configured differently by
            every employer that buys one. Nobody can promise your CV will parse perfectly
            everywhere, and a builder that promises it is selling you something. What we can do is
            control the things that reliably break parsers: multi-column reading order, text baked
            into images, decorative bullet glyphs, and headings that are styled rather than
            structural. That is what our {ATS_SAFE_COUNT} highest-scoring templates avoid, and it is
            why we publish a per-template score instead of a badge.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/ats-cv" variant="outline">
              ATS-focused templates
            </ButtonLink>
            <ButtonLink href="/blog" variant="ghost">
              Read the ATS guide
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* 4. Job search ------------------------------------------------------ */}
      <Section id="job-search">
        <SectionHeading
          eyebrow="05 · Job search"
          title="Running an actual search"
          description="Twenty applications is twenty documents. The product is organised around that fact."
          align="left"
        />
        <div className="mt-10">
          <FeatureGrid items={jobSearchFeatures} />
        </div>
      </Section>

      {/* 5. Account --------------------------------------------------------- */}
      <Section tone="muted" id="account">
        <SectionHeading
          eyebrow="06 · Your account"
          title="Data, billing and control"
          description="Boring by design. You should be able to leave as easily as you arrived."
          align="left"
        />
        <div className="mt-10">
          <FeatureGrid items={accountFeatures} />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Free plan"
            body={`${FREE_TEMPLATE_COUNT} templates, ${freeLimits.maxCvs} saved CVs, ${freeLimits.maxDownloadsPerMonth} PDF downloads a month, forever.`}
            href="/free-cv-builder"
            linkLabel="What free includes"
          />
          <SummaryCard
            title="Paid plans"
            body={`All ${TEMPLATE_COUNT} templates, ${proLimits.maxCvs === null ? 'unlimited' : proLimits.maxCvs} CVs and unlimited downloads, full typography control.`}
            href="/pricing"
            linkLabel="See pricing"
          />
          <SummaryCard
            title="Your data"
            body="Stored in Firebase, private by default, exportable and deletable at any time from your account."
            href="/privacy"
            linkLabel="Privacy policy"
          />
        </div>
      </Section>

      <Section>
        <FaqSection entries={FAQ} title="Questions about the features" />
      </Section>

      <Section tone="muted" size="sm">
        <RelatedLinks
          title="Keep reading"
          links={[
            {
              label: 'The editor, screen by screen',
              href: '/cv-builder',
              description: 'A closer look at the three panes and what each control does.',
            },
            {
              label: `All ${TEMPLATE_COUNT} templates`,
              href: '/templates',
              description: 'Filter by category, column count and ATS score.',
            },
            {
              label: 'CV examples',
              href: '/cv-examples',
              description: 'Worked examples by role and career stage.',
            },
            {
              label: 'Pricing',
              href: '/pricing',
              description: 'What Pro unlocks, and why the free plan is not a trial.',
            },
            {
              label: 'Frequently asked questions',
              href: '/faq',
              description: 'Twenty-odd answers about templates, downloads, billing and data.',
            },
            {
              label: 'About this product',
              href: '/about',
              description: 'What we are opinionated about, and what we will never do.',
            },
          ]}
        />
      </Section>

      <Section size="sm">
        <CtaBanner
          title="Open the editor and see for yourself"
          description={`A free account gives you the whole builder, ${FREE_TEMPLATE_COUNT} templates and a real PDF at the end of it. No card, no countdown.`}
          primaryHref="/register"
          primaryLabel="Create your CV — free"
          secondaryHref="/pricing"
          secondaryLabel="Compare the plans"
          note={`Questions first? Write to ${site.supportEmail}.`}
        />
      </Section>
    </>
  );
}

function SummaryCard({
  title,
  body,
  href,
  linkLabel,
}: {
  title: string;
  body: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5">
      <h3 className="text-base font-semibold text-ink-950">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{body}</p>
      <Link
        href={href}
        className="mt-3 inline-flex text-sm font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
      >
        {linkLabel}
      </Link>
    </div>
  );
}
