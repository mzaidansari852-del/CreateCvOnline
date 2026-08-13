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
  type FaqEntry,
} from '@/components/marketing/primitives';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import { ButtonLink } from '@/components/ui/button';
import { TEMPLATE_COUNT, getTemplateBySlug } from '@/lib/cv/template-registry';
import { PLANS } from '@/lib/plans';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';
import type { TemplateDefinition } from '@/types/cv';

export const metadata = pageMetadata({
  title: 'Create a CV Online: Honest Comparison With Word',
  description:
    'Why a CV built in a browser beats a Word file — and the four rows where it does not. Formatting drift, tailored copies, privacy, and what happens if you stop paying.',
  path: '/create-cv-online',
  keywords: [
    'create cv online',
    'online cv',
    'cv online vs word',
    'make cv in browser',
    'online cv builder comparison',
    'cv formatting problems',
  ],
});

function pickTemplates(slugs: string[]): TemplateDefinition[] {
  return slugs
    .map((slug) => getTemplateBySlug(slug))
    .filter((template): template is TemplateDefinition => Boolean(template));
}

const wordFailures = [
  {
    title: 'Fonts you have, they do not',
    description:
      'A .docx does not carry its fonts. Open a CV set in Garamond on a machine without it and the reader sees a substitute with different letter widths — every line re-wraps, and the document you spent an evening balancing arrives looking cramped.',
  },
  {
    title: 'The three-line spill',
    description:
      'The most common formatting complaint recruiters describe is a one-page CV that arrives as a page and three orphaned lines. Nothing was edited; the file simply re-flowed on a machine with different default margins or a different printer driver.',
  },
  {
    title: 'Invisible scaffolding',
    description:
      'Two-column Word CVs are usually built from tables or text boxes. On screen they look fine; a parser reads a table cell by cell and can interleave your job titles with your skill list, or skip a text box entirely.',
  },
  {
    title: 'Contact details in the header',
    description:
      'Word makes it natural to put your name and phone number in the page header. A number of applicant tracking systems ignore header and footer regions when extracting text, which is a memorable way to submit an anonymous CV.',
  },
  {
    title: 'Version sprawl',
    description:
      'cv-final.docx, cv-final-v2.docx, cv-final-REAL.docx. It is funny until the evening you attach the one that still has last year’s job title in the profile.',
  },
  {
    title: 'Metadata you forgot about',
    description:
      'A Word document carries an author name, revision count and sometimes tracked changes and comments. Exporting to PDF from a builder produces a file with none of that history attached.',
  },
];

const browserGains = [
  {
    title: 'One document, always current',
    description:
      'There is no local copy to fall out of date. The version in your account is the version you last touched, from any machine you log in on.',
  },
  {
    title: 'Tailoring is duplication, not surgery',
    description:
      'Copy the document, rewrite the profile for the specific role, reorder the skills, export. The original is untouched, so a tailored application never costs you your general CV.',
  },
  {
    title: 'One renderer, one result',
    description:
      'The export runs the same markup through headless Chromium with the fonts embedded. Your machine, our server and the recruiter’s screen produce the same page — there is no second layout engine to disagree.',
  },
  {
    title: 'Nothing to install, nothing to update',
    description:
      'No licence, no version differences between your laptop and the library computer, and no “this file was created in a newer version” dialogue at the worst possible moment.',
  },
];

const comparison: {
  feature: string;
  builder: string;
  word: string;
  docs: string;
  designer: string;
}[] = [
  {
    feature: 'Looks identical on every machine',
    builder: 'Yes — fonts embedded at export',
    word: 'No — substitutes missing fonts',
    docs: 'Yes, once exported to PDF',
    designer: 'Yes',
  },
  {
    feature: 'Survives an ATS text extraction',
    builder: 'Single-column layouts, each scored 1–5',
    word: 'Usually, if you avoid tables and text boxes',
    docs: 'Usually, same caveat',
    designer: 'Often not — columns, outlined text, images',
  },
  {
    feature: 'Still editable in two years',
    builder: 'Yes, it is in your account',
    word: 'If you can still find the file',
    docs: 'Yes',
    designer: 'Only if they kept the source file',
  },
  {
    feature: 'Making a tailored copy per application',
    builder: 'Duplicate, edit the profile, export',
    word: 'Save-as sprawl',
    docs: 'Make a copy',
    designer: 'Another invoice',
  },
  {
    feature: 'Works with no internet',
    builder: 'No',
    word: 'Yes',
    docs: 'Partly, in offline mode',
    designer: 'Yes — it is a file on your disk',
  },
  {
    feature: 'Complete freedom over layout',
    builder: 'No — the template owns the layout',
    word: 'Yes, with enough patience',
    docs: 'Limited',
    designer: 'Yes, that is the point of hiring one',
  },
  {
    feature: 'Comments and collaboration',
    builder: 'No',
    word: 'Yes, tracked changes',
    docs: 'The best of the four',
    designer: 'Email threads',
  },
  {
    feature: 'Cost for one finished CV',
    builder: 'Free plan, or a paid plan for unlimited exports',
    word: 'Included in a paid office suite',
    docs: 'Free',
    designer: 'Typically a few hundred, one-off',
  },
  {
    feature: 'Who holds the master copy',
    builder: 'Us, until you export a PDF',
    word: 'You',
    docs: 'Your cloud account',
    designer: 'The designer',
  },
];

const faqs: FaqEntry[] = [
  {
    question: 'Do employers accept a CV that was made online?',
    answer:
      'They receive a PDF, like any other. Nothing in the file announces which tool produced it, apart from one small grey credit line on free-plan exports, which paid exports do not carry. What matters to the recipient is that it opens, prints on their paper size and can be searched for keywords.',
  },
  {
    question: 'Who can see my CV while it is stored online?',
    answer:
      'It sits in your account and is not published anywhere. A CV only becomes reachable by a link if you deliberately create a share link, which is a paid feature and can be switched off again. Export responses are sent with private, no-store caching, and the printable page is marked noindex so search engines never index a document. The privacy policy sets out retention and deletion in full.',
  },
  {
    question: 'What happens to my CVs if I stop paying?',
    answer: `Nothing is deleted and the account is not locked. An expired paid plan quietly reverts to the free plan: your documents stay, you can still open and edit them, and you are back to ${PLANS.free.limits.maxCvs} CVs and ${PLANS.free.limits.maxDownloadsPerMonth} downloads a month. Two things to know: a document using a paid-only template resets to the default template the next time it saves, and custom sections are dropped on save. Export the PDFs you care about before a plan lapses.`,
  },
  {
    question: 'Can I work on my CV offline?',
    answer:
      'No — this is the clearest thing a browser tool gives up. If you travel or work without reliable connectivity, export a PDF before you go, and keep the raw text of your bullets in a plain note. The note is worth keeping anyway: it is what you paste into application forms.',
  },
  {
    question: 'Will recruiters recognise the template?',
    answer: `Occasionally, yes — the popular layouts on every builder do recur, and anyone claiming otherwise is selling something. Three things reduce it to noise: choose from the less obvious end of the ${TEMPLATE_COUNT}-template library, set an accent colour that is not the default blue, and remember that a reader remembers your third bullet point, not your heading rules.`,
  },
  {
    question: 'Can I move my CV back into Word later?',
    answer:
      'Not as a .docx — there is no Word export. If an employer demands an editable Word file, the practical route is to paste your text into their template, which is what they usually want anyway: their formatting, your content.',
  },
  {
    question: 'Does an online CV work for applications in other countries?',
    answer:
      'Yes, but change the paper and the conventions rather than only the words. Set US Letter and drop the photo and date of birth for North America; keep A4 for the UK, Ireland and most of Europe. The résumé builder page covers the differences in detail.',
  },
];

export default function CreateCvOnlinePage() {
  const internationalTemplates = pickTemplates([
    'classic-professional-cv',
    'traditional-cv',
    'business-professional-cv',
    'modern-elegant',
    'timeless-cv',
    'formal-cv',
  ]);

  return (
    <>
      <Section size="lg">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Create a CV online', path: '/create-cv-online' },
          ]}
        />
        <div className="max-w-3xl">
          <Eyebrow>Online versus offline</Eyebrow>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
            Create your CV online, or keep fighting a Word file
          </h1>
          <p className="mt-5 text-base leading-relaxed text-pretty text-ink-600 sm:text-lg">
            A word processor is a general-purpose tool asked to do a very specific job. It does it
            adequately until the document leaves your machine. This page sets out precisely what
            changes when the document lives in a browser instead — including the four things that
            get worse.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">
              Create a CV online — free
            </ButtonLink>
            <ButtonLink href="#comparison" size="lg" variant="outline">
              Jump to the comparison
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="The failure modes"
          title="What actually goes wrong with a Word CV"
          description="None of these are hypothetical. They are the reasons a document that looked finished on your laptop arrives looking careless."
        />
        <div className="mt-10">
          <FeatureGrid items={wordFailures} columns={3} />
        </div>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          eyebrow="The trade"
          title="What a browser gives you in exchange"
          description="Fewer moving parts, mostly. The document, the renderer and the copies all live in one place."
        />
        <div className="mt-10">
          <FeatureGrid items={browserGains} columns={2} />
        </div>
      </Section>

      <Section tone="muted" id="comparison">
        <SectionHeading
          align="left"
          eyebrow="Side by side"
          title="The honest comparison"
          description="Four ways to produce the same document. The builder loses four of these nine rows, and pretending otherwise would not help you choose."
        />
        <div className="mt-10 overflow-x-auto rounded-xl border border-ink-200 bg-white">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <caption className="sr-only">
              An online CV builder compared with Microsoft Word, Google Docs and a designer-made PDF
            </caption>
            <thead>
              <tr className="bg-ink-50 text-left">
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  What you care about
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-brand-700">
                  Online builder
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  Microsoft Word
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  Google Docs
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  Designer-made PDF
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.feature} className="border-t border-ink-200 align-top">
                  <th scope="row" className="px-4 py-3 text-left font-medium text-ink-800">
                    {row.feature}
                  </th>
                  <td className="px-4 py-3 font-medium text-ink-900">{row.builder}</td>
                  <td className="px-4 py-3 text-ink-600">{row.word}</td>
                  <td className="px-4 py-3 text-ink-600">{row.docs}</td>
                  <td className="px-4 py-3 text-ink-600">{row.designer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-ink-600">
          Read that table as a decision rather than a scoreboard. If you are a set designer
          applying to three studios, hire the designer. If you write for a living and want
          comments from a friend, draft in Google Docs and rebuild the final page here. If you are
          sending twenty applications through career portals this month, the builder is the tool
          that stops you re-formatting twenty times.
        </p>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          eyebrow="Objections"
          title="The three worth taking seriously"
          description="Answered with mechanics rather than reassurance."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <article className="rounded-xl border border-ink-200 bg-white p-6">
            <h3 className="text-lg font-bold text-ink-950">“Who can see my personal data?”</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
              A CV is a concentrated file of personal information: your address, your phone number,
              your employment history. Yours is stored against your account and is not published.
              It becomes reachable by URL only if you create a share link yourself, and that link
              can be revoked. Exported files are served with private, no-store caching, and the
              printable version is marked noindex so it can never be crawled.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
              Read the{' '}
              <Link href="/privacy" className="font-medium text-brand-700 underline underline-offset-2">
                privacy policy
              </Link>{' '}
              for what is retained and how account deletion works — and apply the same scrutiny to
              every other builder you are considering.
            </p>
          </article>

          <article className="rounded-xl border border-ink-200 bg-white p-6">
            <h3 className="text-lg font-bold text-ink-950">“What if I stop paying?”</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
              An expired plan reverts to free rather than locking the account. Your documents
              remain, editable, and you go back to the free allowances of{' '}
              {PLANS.free.limits.maxCvs} saved CVs and {PLANS.free.limits.maxDownloadsPerMonth} PDF
              downloads a month.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
              Two consequences worth planning for: a document set in a paid-only template is reset
              to the default template the next time it saves, and custom sections are removed on
              save. So export a PDF of anything you might need before a plan lapses — that file is
              yours permanently and does not depend on us.
            </p>
          </article>

          <article className="rounded-xl border border-ink-200 bg-white p-6">
            <h3 className="text-lg font-bold text-ink-950">“Is a template CV too generic?”</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
              Sometimes. A handful of layouts are used everywhere, and a recruiter who screens two
              hundred CVs a week has seen them. The mitigation is not a wilder design — it is
              picking from the quieter end of the library, choosing your own accent colour, and
              spending the saved time on the third bullet of your current role.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
              For genuinely design-led applications, a bespoke document from a designer still wins
              on craft. It just cannot be re-tailored on a Tuesday night for a role that closes on
              Wednesday.
            </p>
          </article>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="Templates"
          title="Conventional layouts that travel well"
          description="Restrained, single-accent designs that read as normal in the UK, Ireland, most of Europe and the Gulf — the situations where an unusual CV is a liability."
        />
        <div className="mt-10">
          <TemplateGrid templates={internationalTemplates} columns={3} />
        </div>
      </Section>

      <Section>
        <FaqSection
          entries={faqs}
          title="Questions about building a CV in a browser"
          description={`What ${site.domain} stores, what happens when a plan ends, and where a word processor still wins.`}
        />
      </Section>

      <Section tone="muted">
        <CtaBanner
          title="Try it against your current CV"
          description="Paste one job from the document you have now and compare the two pages. Ten minutes is enough to know whether the browser version is better than yours."
          primaryLabel="Create a CV online — free"
          secondaryHref="/pricing"
          secondaryLabel="See what a paid plan adds"
          note="No card, no trial timer. Export a PDF and keep it whatever you decide."
        />
        <div className="mt-16">
          <RelatedLinks
            title="Related reading"
            links={[
              {
                label: 'Inside the CV builder',
                href: '/cv-builder',
                description: 'The editor, the live preview and the export path.',
              },
              {
                label: 'Free CV builder',
                href: '/free-cv-builder',
                description: 'What the free plan covers, in exact numbers.',
              },
              {
                label: 'CV templates',
                href: '/cv-templates',
                description: 'Every layout, grouped by category and ATS score.',
              },
              {
                label: 'What makes a CV professional',
                href: '/professional-cv',
                description: 'Structure, evidence and what to leave out.',
              },
              {
                label: 'Pricing',
                href: '/pricing',
                description: 'Free, monthly and one-time options compared.',
              },
              {
                label: 'Blog',
                href: '/blog',
                description: 'Longer guides on formatting, ATS and applications.',
              },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
