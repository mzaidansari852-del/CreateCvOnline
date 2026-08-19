import Link from 'next/link';

import {
  Breadcrumbs,
  CtaBanner,
  Eyebrow,
  FaqSection,
  RelatedLinks,
  Section,
  SectionHeading,
  StatRow,
  type FaqEntry,
} from '@/components/marketing/primitives';
import { PlanComparisonRows } from '@/components/marketing/PricingCards';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import { ButtonLink } from '@/components/ui/button';
import {
  DEFAULT_TEMPLATE_ID,
  FREE_TEMPLATE_COUNT,
  TEMPLATE_COUNT,
  freeTemplates,
  getTemplate,
  templatesByCategory,
} from '@/lib/cv/template-registry';
import { publicEnv } from '@/lib/env';
import { PLANS } from '@/lib/plans';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Free CV Builder — Every Limit Written Down',
  description:
    'The free plan in exact numbers: how many CVs, how many PDF downloads, which templates, and what the footer credit line looks like. No watermark, no card, no trial timer.',
  path: '/free-cv-builder',
  keywords: [
    'free cv builder',
    'free cv maker',
    'free cv templates',
    'cv builder no watermark',
    'free pdf cv download',
    'free resume builder',
  ],
});

const freePlan = PLANS.free;
const proPlan = PLANS.pro;
const lifetimePlan = PLANS.lifetime;
const limits = freePlan.limits;

const currencySymbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', MAD: 'MAD ' };

function formatPrice(value: string): string {
  const symbol = currencySymbols[publicEnv.storeCurrency] ?? `${publicEnv.storeCurrency} `;
  const amount = Number.parseFloat(value);
  return `${symbol}${Number.isInteger(amount) ? String(amount) : amount.toFixed(2)}`;
}

/** Everything below is derived from the plan object the server enforces, never retyped. */
const included: { label: string; detail: string }[] = [
  {
    label:
      limits.maxCvs === null
        ? 'Unlimited saved CVs'
        : `${limits.maxCvs} saved CVs, kept indefinitely`,
    detail:
      'Enough for a general document plus one tailored to the job you actually want. They do not expire, and they are still there in eighteen months when you next need them.',
  },
  {
    label:
      limits.maxDownloadsPerMonth === null
        ? 'Unlimited PDF downloads'
        : `${limits.maxDownloadsPerMonth} PDF downloads every calendar month`,
    detail:
      'A real export: page-accurate, fonts embedded, named after you. The counter resets on the first of the month, and a download is only counted when a file is actually produced.',
  },
  {
    label: `${FREE_TEMPLATE_COUNT} of the ${TEMPLATE_COUNT} templates`,
    detail:
      'Including the default template, which is also one of the highest-scoring layouts for automated parsing. The free set is not a demo set.',
  },
  {
    label: 'The complete editor',
    detail:
      'Live preview, autosave, drag-to-reorder sections, all twelve built-in sections, and template switching that keeps every word you have typed. Nothing in the writing experience is gated.',
  },
  {
    label: 'Accent colour, paper size, photo toggle and date format',
    detail:
      'The four settings that change whether a document is right for a given market — A4 or US Letter above all — are available without paying.',
  },
];

/** Gated features, read straight off the plan limits so the page cannot overstate the free tier. */
const gated: { feature: string; enabled: boolean; why: string }[] = [
  {
    feature: 'The premium templates',
    enabled: limits.premiumTemplates,
    why: `${TEMPLATE_COUNT - FREE_TEMPLATE_COUNT} designs are paid. Each one is a hand-built layout that has to be tested against long careers, short careers and both paper sizes. They are the part of the product with an ongoing cost per design.`,
  },
  {
    feature: 'Fonts, spacing, margins and full colour control',
    enabled: limits.advancedCustomization,
    why: 'Free documents render exactly as the template intends. This is partly a paid feature and partly a guard rail: most CVs are damaged rather than improved by a 9pt condensed typeface at 8 mm margins.',
  },
  {
    feature: 'Custom sections beyond the built-in twelve',
    enabled: limits.customSections,
    why: 'Bespoke sections — “Patents”, “Clinical rotations”, “Exhibitions” — are for specialist documents, and specialist documents are usually written by people already deep into a job search.',
  },
  {
    feature: 'A public share link',
    enabled: limits.shareLinks,
    why: 'A hosted, always-current URL for your CV costs us bandwidth on every view and has to be revocable. It is genuinely a hosting feature rather than an editing one.',
  },
  {
    feature: 'Exports without the footer credit line',
    enabled: limits.removeBranding,
    why: 'The single grey line at the foot of a free export is how people find the tool. Removing it is the one thing you are quite reasonably paying for when you upgrade.',
  },
];

const faqs: FaqEntry[] = [
  {
    question: 'Is it really free, or is this a trial?',
    answer: `Really free, with no timer. The free plan is a plan, not a trial: ${limits.maxCvs} CVs, ${limits.maxDownloadsPerMonth} PDF downloads a month, ${FREE_TEMPLATE_COUNT} templates, for as long as you keep the account. Nothing switches off after fourteen days and no card is taken to start.`,
  },
  {
    question: 'Will my CV have a watermark?',
    answer: `No. There is no watermark, no diagonal text across the page and no logo on your document. Free exports carry one line of small grey type at the foot of the page reading “Made with ${site.name} · ${site.domain}”, set at 7.5 px in light grey. Paid exports have nothing at all.`,
  },
  {
    question: 'Do I have to enter a credit card?',
    answer:
      'No. An email address and a password create the account, and the editor opens straight away. Payment details are only requested if you decide to buy a paid plan, and even then they are entered in Paddle’s checkout rather than stored by us.',
  },
  {
    question: `What happens after my ${limits.maxDownloadsPerMonth} downloads?`,
    answer: `Exporting is blocked until the counter resets on the first of the next month; everything else keeps working, so you can carry on editing. Only successful exports count — if a render fails you are not charged a download. If you need more this month, ${proPlan.name} removes the cap.`,
  },
  {
    question: 'Can I keep my CV forever without ever paying?',
    answer:
      'Yes. Your documents stay in your account whether or not you ever buy anything, and the PDFs you have already exported are yours permanently — they do not phone home, expire or degrade. If you delete your account, the documents go with it.',
  },
  {
    question: 'Are the free templates the leftovers?',
    answer: `No, and this is checkable: the default template every new CV starts on is free, and most of the layouts built specifically for applicant tracking systems are free. The paid set is larger and more specialised — sector-specific, two-column and more decorative designs — not simply better.`,
  },
  {
    question: 'If I upgrade, am I locked into a subscription?',
    answer: `No. A ${proPlan.name} payment buys ${proPlan.accessDays} days of access and nothing renews automatically; when the period ends the account reverts to free with every document intact. ${lifetimePlan.name} is a single payment with no expiry at all.`,
  },
];

export default function FreeCvBuilderPage() {
  const showcase = freeTemplates().slice(0, 8);
  const atsCategory = templatesByCategory('ats');
  const atsFree = atsCategory.filter((template) => !template.premium);
  const defaultTemplate = getTemplate(DEFAULT_TEMPLATE_ID);

  return (
    <>
      <Section size="lg">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Free CV builder', path: '/free-cv-builder' },
          ]}
        />
        <div className="max-w-3xl">
          <Eyebrow>Free plan</Eyebrow>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
            A free CV builder, with every limit written down
          </h1>
          <p className="mt-5 text-base leading-relaxed text-pretty text-ink-600 sm:text-lg">
            “Free” on a CV site usually means free until the download button. This page lists the
            exact allowances of the free plan, what is deliberately behind a payment and why, and
            precisely what appears on a free PDF. The numbers below are read from the same plan
            definition the server checks before it lets you do anything.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">
              Start free — no card
            </ButtonLink>
            <ButtonLink href="/pricing" size="lg" variant="outline">
              Compare all plans
            </ButtonLink>
          </div>
        </div>

        <div className="mt-16 border-t border-ink-200 pt-10">
          <StatRow
            stats={[
              { value: formatPrice(freePlan.price), label: 'to start, and to stay' },
              {
                value: limits.maxCvs === null ? '∞' : String(limits.maxCvs),
                label: 'CVs saved in your account',
              },
              {
                value:
                  limits.maxDownloadsPerMonth === null
                    ? '∞'
                    : String(limits.maxDownloadsPerMonth),
                label: 'PDF downloads per month',
              },
              { value: String(FREE_TEMPLATE_COUNT), label: 'templates included' },
            ]}
          />
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="Included"
          title="What you get without paying anything"
          description="Not a stripped-down preview mode. The writing tool is the whole writing tool."
        />
        <ul className="mt-10 grid gap-4 lg:grid-cols-2">
          {included.map((item) => (
            <li key={item.label} className="flex gap-3 rounded-xl border border-ink-200 bg-white p-5">
              <svg
                className="mt-0.5 size-5 shrink-0 text-success-600"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="m5 12.5 4.5 4.5L19 7.5"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <h3 className="text-base font-semibold text-ink-950">{item.label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          eyebrow="Excluded"
          title="What is behind a payment, and the reason for each"
          description="Five things. Every one of them is a deliberate choice, and none of them stops you producing and sending a finished CV."
        />
        <ul className="mt-10 space-y-4">
          {gated.map((item) => (
            <li
              key={item.feature}
              className="flex flex-col gap-2 rounded-xl border border-ink-200 bg-white p-5 sm:flex-row sm:items-start sm:gap-5"
            >
              <span
                className={
                  item.enabled
                    ? 'inline-flex shrink-0 rounded-full bg-success-50 px-2.5 py-1 text-2xs font-bold tracking-wide text-success-700 uppercase ring-1 ring-success-500/25 ring-inset'
                    : 'inline-flex shrink-0 rounded-full bg-ink-100 px-2.5 py-1 text-2xs font-bold tracking-wide text-ink-600 uppercase ring-1 ring-ink-200 ring-inset'
                }
              >
                {item.enabled ? 'Free' : 'Paid'}
              </span>
              <div>
                <h3 className="text-base font-semibold text-ink-950">{item.feature}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{item.why}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <h3 className="text-xl font-bold text-ink-950">Free and Pro, row by row</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">
            The same table shown on the pricing page, with no asterisks under it.
          </p>
          <div className="mt-6">
            <PlanComparisonRows />
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="The honest answer"
              title="Is it actually free?"
            />
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-700">
              <p>
                Yes, and it stays free. There is no expiry date on the plan, no card taken at
                signup and no point at which a finished document is held hostage behind a payment
                screen. You can write a CV, export the PDF, send it and never see a checkout page.
              </p>
              <p>
                What funds it is straightforward: some people are in an active job search, want all{' '}
                {TEMPLATE_COUNT} templates and a dozen tailored copies, and pay for a month or buy
                the one-time plan. Rendering a PDF runs a real browser on a real server for a
                second or two, which is the one operation here with a per-use cost — that is why
                downloads are the metered thing rather than editing or saving.
              </p>
              <p>
                The limits are set where a normal, careful job application does not touch them.{' '}
                {limits.maxDownloadsPerMonth} exports a month is roughly one final PDF a week; if
                you are exporting more often than that, you are almost certainly running a real
                campaign of applications, which is exactly when {proPlan.name} at{' '}
                {formatPrice(proPlan.price)} starts to make sense.
              </p>
            </div>
          </div>

          <div>
            <SectionHeading
              align="left"
              eyebrow="No watermark"
              title="What a free export actually looks like"
            />
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-700">
              <p>
                There is no watermark. Nothing is stamped across your text, no logo is placed in a
                corner, and no diagonal “SAMPLE” sits behind your work history. A free PDF is your
                document, at full quality, with the fonts embedded.
              </p>
              <p>
                What it does carry is one line of small grey type, centred at the very bottom of
                the page, 10 px above the paper edge:
              </p>
            </div>

            <figure className="mt-5">
              <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-card">
                <div className="space-y-2" aria-hidden>
                  <div className="h-2 w-1/3 rounded-full bg-ink-200" />
                  <div className="h-1.5 w-3/4 rounded-full bg-ink-100" />
                  <div className="h-1.5 w-2/3 rounded-full bg-ink-100" />
                  <div className="h-1.5 w-4/5 rounded-full bg-ink-100" />
                </div>
                <div
                  className="mt-8 text-center"
                  style={{ fontSize: '7.5px', letterSpacing: '0.04em', color: '#9aa2b1' }}
                >
                  Made with {site.name} · {site.domain}
                </div>
              </div>
              <figcaption className="mt-3 text-[13px] leading-relaxed text-ink-500">
                Rendered at the size it appears in the PDF: 7.5 px, light grey, centred. On{' '}
                {proPlan.name} and {lifetimePlan.name} exports the line is absent entirely.
              </figcaption>
            </figure>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          eyebrow="Free templates"
          title="The free set is not the reject pile"
          description={`${atsFree.length} of the ${atsCategory.length} layouts built specifically for applicant tracking systems are free, and “${defaultTemplate.name}” — the template every new document starts on — is one of the highest-scoring designs in the whole library.`}
        />
        <div className="mt-10">
          <TemplateGrid templates={showcase} columns={4} />
        </div>
        <p className="mt-8 text-sm text-ink-600">
          <Link href="/templates" className="font-medium text-brand-700 underline underline-offset-2">
            Browse all {TEMPLATE_COUNT} templates
          </Link>{' '}
          — free ones are marked, so you can see exactly what you would be paying for before you
          create an account.
        </p>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="When to pay"
          title="Three situations, three honest answers"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <article className="rounded-xl border border-ink-200 bg-white p-6">
            <h3 className="text-base font-bold text-ink-950">Applying to one or two jobs</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Stay on free. Two documents and {limits.maxDownloadsPerMonth} exports a month cover
              this comfortably, and there is nothing about a paid template that will get you the
              interview.
            </p>
          </article>
          <article className="rounded-xl border border-ink-200 bg-white p-6">
            <h3 className="text-base font-bold text-ink-950">
              In an active search this month
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              {proPlan.name} at {formatPrice(proPlan.price)} buys {proPlan.accessDays} days of
              unlimited documents and exports, which is what tailoring a version per application
              actually requires. Nothing renews on its own.
            </p>
          </article>
          <article className="rounded-xl border border-ink-200 bg-white p-6">
            <h3 className="text-base font-bold text-ink-950">You will be back in two years</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              {lifetimePlan.name} at {formatPrice(lifetimePlan.price)} is a single payment with no
              expiry — worth it only if you expect to job-hunt again, which most people do.
            </p>
          </article>
        </div>
      </Section>

      <Section>
        <FaqSection
          entries={faqs}
          title="Questions about the free plan"
          description="The ones people ask before signing up, answered with numbers instead of adjectives."
        />
      </Section>

      <Section tone="muted">
        <CtaBanner
          title="Start on the free plan and stay there if it is enough"
          description="You can write a complete CV, choose a template, export a PDF and send it without ever seeing a payment screen. If you need more later, it is still here."
          primaryLabel="Create a free account"
          secondaryHref="/pricing"
          secondaryLabel="See paid plans"
          note={`No card required. ${limits.maxCvs} saved CVs and ${limits.maxDownloadsPerMonth} PDF downloads a month, indefinitely.`}
        />
        <div className="mt-16">
          <RelatedLinks
            title="Also worth reading"
            links={[
              {
                label: 'Pricing in full',
                href: '/pricing',
                description: 'Free, monthly and one-time, with what each includes.',
              },
              {
                label: 'How the editor works',
                href: '/cv-builder',
                description: 'Live preview, autosave and PDF export explained.',
              },
              {
                label: 'All templates',
                href: '/templates',
                description: `${FREE_TEMPLATE_COUNT} free and ${TEMPLATE_COUNT - FREE_TEMPLATE_COUNT} paid designs, clearly marked.`,
              },
              {
                label: 'Online versus Word',
                href: '/create-cv-online',
                description: 'Where a browser wins, and where it does not.',
              },
              {
                label: 'Write your CV in one sitting',
                href: '/cv-maker',
                description: 'A timed method for the first draft.',
              },
              {
                label: 'Blog',
                href: '/blog',
                description: 'Guides on applications, ATS and formatting.',
              },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
