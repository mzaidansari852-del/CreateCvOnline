import type { Metadata } from 'next';
import Link from 'next/link';

import { PricingCards } from '@/components/marketing/PricingCards';
import {
  Breadcrumbs,
  CtaBanner,
  FaqSection,
  Section,
  SectionHeading,
} from '@/components/marketing/primitives';
import { JsonLd } from '@/components/seo/JsonLd';
import { Badge } from '@/components/ui/feedback';
import { publicEnv } from '@/lib/env';
import {
  FREE_TEMPLATE_COUNT,
  TEMPLATE_COUNT,
  atsSafeTemplates,
  freeTemplates,
  templatesByCategory,
} from '@/lib/cv/template-registry';
import { PLANS, PLAN_ORDER, type Plan } from '@/lib/plans';
import { pageMetadata } from '@/lib/seo/metadata';
import { softwareApplicationSchema } from '@/lib/seo/schema';
import { site } from '@/lib/site';
import { BUILT_IN_SECTION_IDS, fontKeySchema } from '@/types/cv';

export const metadata: Metadata = pageMetadata({
  title: 'Pricing',
  description:
    'Free forever for one solid CV, or unlock all 56 templates, unlimited CVs and unlimited PDF downloads with Pro or a one-off Lifetime licence. 14-day refund.',
  path: '/pricing',
  keywords: ['cv builder pricing', 'resume builder cost', 'free cv builder', 'cv builder plans'],
});

/* -------------------------------------------------------------------------- */
/* Comparison table                                                            */
/* -------------------------------------------------------------------------- */

/** Counts derived from the registry, so adding a template updates the copy. */
const ATS_SAFE_COUNT = atsSafeTemplates().length;
const FREE_ATS_SAFE_COUNT = freeTemplates().filter((template) => template.atsScore >= 5).length;
const FREE_ATS_CATEGORY_COUNT = templatesByCategory('ats').filter(
  (template) => !template.premium,
).length;

type Cell = { kind: 'text'; value: string } | { kind: 'bool'; value: boolean };

const text = (value: string): Cell => ({ kind: 'text', value });
const bool = (value: boolean): Cell => ({ kind: 'bool', value });

const currencySymbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', MAD: 'MAD ' };

function money(value: string): string {
  const symbol = currencySymbols[publicEnv.storeCurrency] ?? `${publicEnv.storeCurrency} `;
  const amount = Number.parseFloat(value);
  return `${symbol}${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}

function billing(plan: Plan): string {
  switch (plan.interval) {
    case 'forever':
      return 'Free forever';
    case 'one-time':
      return `${money(plan.price)} once`;
    case 'year':
      return `${money(plan.price)} / year`;
    default:
      return `${money(plan.price)} / month`;
  }
}

interface ComparisonRow {
  label: string;
  hint?: string;
  cell: (plan: Plan) => Cell;
}

interface ComparisonGroup {
  title: string;
  rows: ComparisonRow[];
}

/**
 * Every cell is computed from `PLANS`, which is the same object the server reads when it
 * decides what a request is allowed to do. The table therefore cannot advertise a limit
 * that is not actually enforced, and changing a plan changes this page automatically.
 */
const COMPARISON: ComparisonGroup[] = [
  {
    title: 'Writing and editing',
    rows: [
      {
        label: 'Full editor with live preview',
        hint: 'Every field, every section, side by side with the rendered page.',
        cell: () => bool(true),
      },
      {
        label: 'Autosave',
        hint: 'Changes are written as you type; nothing to remember.',
        cell: () => bool(true),
      },
      {
        label: 'Built-in sections',
        hint: 'Summary, experience, education, skills, languages, projects, certifications, awards, volunteering, publications, interests, references.',
        cell: () => text(`All ${BUILT_IN_SECTION_IDS.length}`),
      },
      {
        label: 'Reorder, rename and hide sections',
        cell: () => bool(true),
      },
      {
        label: 'Custom sections of your own',
        hint: 'Up to six extra sections with headings you choose.',
        cell: (plan) => bool(plan.limits.customSections),
      },
      {
        label: 'Saved CVs',
        hint: 'One tailored version per application is the whole point.',
        cell: (plan) =>
          text(plan.limits.maxCvs === null ? 'Unlimited' : `Up to ${plan.limits.maxCvs}`),
      },
    ],
  },
  {
    title: 'Design',
    rows: [
      {
        label: 'Templates',
        cell: (plan) =>
          text(
            plan.limits.premiumTemplates
              ? `All ${TEMPLATE_COUNT}`
              : `${FREE_TEMPLATE_COUNT} free designs`,
          ),
      },
      {
        label: 'ATS-focused layouts',
        hint: `${ATS_SAFE_COUNT} templates score 5/5 on our parser checklist.`,
        cell: (plan) =>
          text(
            plan.limits.premiumTemplates
              ? `All ${ATS_SAFE_COUNT}`
              : `${FREE_ATS_SAFE_COUNT} of them`,
          ),
      },
      {
        label: 'Switch template without losing data',
        cell: () => bool(true),
      },
      { label: 'Accent colour', cell: () => bool(true) },
      { label: 'Paper size (A4 or US Letter)', cell: () => bool(true) },
      { label: 'Photo on or off, and photo shape', cell: () => bool(true) },
      {
        label: 'Fonts, text size, line height, spacing, margins',
        hint: `${fontKeySchema.options.length} font families, and control over the vertical rhythm that decides whether you fit on one page.`,
        cell: (plan) => bool(plan.limits.advancedCustomization),
      },
      {
        label: 'Heading case, icons and skill display style',
        cell: (plan) => bool(plan.limits.advancedCustomization),
      },
    ],
  },
  {
    title: 'Output and sharing',
    rows: [
      {
        label: 'PDF downloads',
        hint: 'Real, selectable, machine-readable text — never a picture of your CV.',
        cell: (plan) =>
          text(
            plan.limits.maxDownloadsPerMonth === null
              ? 'Unlimited'
              : `${plan.limits.maxDownloadsPerMonth} per month`,
          ),
      },
      {
        label: `“Made with ${site.name}” credit on the PDF`,
        cell: (plan) => text(plan.limits.removeBranding ? 'Removed' : 'One small line'),
      },
      {
        label: 'Public share link',
        hint: 'An unguessable URL you can paste into an e-mail, switchable off at any time.',
        cell: (plan) => bool(plan.limits.shareLinks),
      },
      { label: 'Print directly from the browser', cell: () => bool(true) },
    ],
  },
  {
    title: 'Account and billing',
    rows: [
      { label: 'Price', cell: (plan) => text(billing(plan)) },
      {
        label: 'How long access lasts',
        cell: (plan) =>
          text(
            plan.accessDays === null
              ? plan.id === 'free'
                ? 'Forever'
                : 'Never expires'
              : `${plan.accessDays} days per payment`,
          ),
      },
      {
        label: 'Renews automatically',
        hint: 'It does not. Every payment is a single charge you make deliberately.',
        cell: () => text('No'),
      },
      { label: 'Export your data and delete your account', cell: () => bool(true) },
      {
        label: 'Support',
        cell: (plan) => text(plan.id === 'lifetime' ? 'Priority e-mail' : 'E-mail'),
      },
    ],
  },
];

function CellValue({ cell }: { cell: Cell }) {
  if (cell.kind === 'text') {
    return <span>{cell.value}</span>;
  }
  return cell.value ? (
    <>
      <svg className="size-4 text-success-600" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="m5 12.5 4.5 4.5L19 7.5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">Included</span>
    </>
  ) : (
    <>
      <svg className="size-4 text-ink-300" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M6 12h12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span className="sr-only">Not included</span>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* FAQ                                                                         */
/* -------------------------------------------------------------------------- */

const FAQ = [
  {
    question: 'Is the free plan a trial?',
    answer:
      `No. It has no timer and no expiry date. You can build a CV with ${FREE_TEMPLATE_COUNT} templates, keep ` +
      `${PLANS.free.limits.maxCvs} of them saved in your account and download ${PLANS.free.limits.maxDownloadsPerMonth} ` +
      'PDFs a month, indefinitely and without giving us a card. The paid plans exist for people running an ' +
      'active job search, not as a gate on the basics.',
  },
  {
    question: 'What exactly does Pro unlock?',
    answer:
      `All ${TEMPLATE_COUNT} templates instead of ${FREE_TEMPLATE_COUNT}, unlimited saved CVs and unlimited PDF ` +
      'downloads, full typography and spacing control, custom sections, a public share link, and removal of the ' +
      'one-line credit at the foot of the exported PDF. Nothing about the writing experience is different — the ' +
      'editor, autosave and live preview are identical on every plan.',
  },
  {
    question: 'Does Pro renew automatically?',
    answer:
      `Pro is a single payment that grants ${PLANS.pro.accessDays} days of access, and that fixed term is the whole ` +
      'of what you buy. When the period ends your account simply returns to Free — your CVs stay where they are — ' +
      'and buying another period is a separate, deliberate purchase. We hold no card details of our own; they are ' +
      'entered in Paddle’s checkout. Your account page lists every payment and the date your access ends.',
  },
  {
    question: 'What happens to my CVs if I stop paying?',
    answer:
      'Nothing is deleted. Your documents stay in your account and you keep read access to all of them. ' +
      `Free-plan limits apply again from that moment: you can download ${PLANS.free.limits.maxDownloadsPerMonth} ` +
      `PDFs a month, and a CV using a Pro template or Pro typography will render with the default template and ` +
      'default styling until you upgrade again. The underlying content is never touched.',
  },
  {
    question: 'Which payment methods can I use?',
    answer:
      'Checkout runs through Paddle and opens as an overlay on the page rather than sending you elsewhere. Inside ' +
      'it you can pay by debit or credit card — Visa, Mastercard, American Express — or with PayPal, Apple Pay or ' +
      'Google Pay. We never see or store your card number: the form is served by Paddle and the number goes ' +
      'straight to them.',
  },
  {
    question: 'Which currency am I charged in?',
    answer:
      `All prices on this page are in ${publicEnv.storeCurrency} and that is the currency you are charged in. If ` +
      'your bank account is in another currency, your bank or Paddle converts it at their rate and may add a ' +
      'foreign-transaction fee, which is outside our control. Paddle is the merchant of record, so it adds any VAT ' +
      'or sales tax your country requires, shows it before you confirm, and remits it.',
  },
  {
    question: 'Can I get a refund?',
    answer:
      'Yes — within 14 days of the payment, for any reason, including simply changing your mind. E-mail ' +
      `${site.supportEmail} from the address on the account and we will refund the full amount through Paddle. ` +
      'We do not ask you to justify it and we do not make you talk to anyone first.',
  },
  {
    question: 'Is Lifetime really lifetime?',
    answer:
      `Lifetime is a single ${money(PLANS.lifetime.price)} payment with no expiry date on the account, and it ` +
      'includes templates we add later. It is honest about being tied to the lifetime of the service rather than ' +
      'of the buyer: if we ever shut down, you would get notice and an export of everything you have made. ' +
      'For most people it pays for itself after eight months of Pro.',
  },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function PricingPage() {
  return (
    <>
      <Section size="sm">
        <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Pricing', path: '/pricing' }]} />
        <SectionHeading
          as="h1"
          eyebrow="Pricing"
          title="Pay for a job search, not for a text editor"
          description={
            <>
              Writing a CV should not cost anything. The free plan is a complete builder with{' '}
              {FREE_TEMPLATE_COUNT} templates and no trial timer. Pro exists for the weeks when you
              are applying to twenty places and want a tailored version for each of them.
            </>
          }
        />

        <PricingCards className="mt-14" />

        <p className="mt-8 text-center text-sm text-ink-500">
          Prices in {publicEnv.storeCurrency}. Secure checkout through Paddle.{' '}
          <Link href="#refunds" className="font-medium text-brand-700 underline underline-offset-2">
            14-day refund
          </Link>{' '}
          on every paid plan.
        </p>
      </Section>

      {/* What Pro buys ------------------------------------------------------ */}
      <Section tone="muted" id="what-pro-buys">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">
              What you are actually paying for
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-600">
              Pro does not make you a better writer and we are not going to pretend otherwise. It
              removes the three frictions that show up once a job search gets serious.
            </p>
            <dl className="mt-7 flex flex-col gap-6">
              <div>
                <dt className="text-base font-semibold text-ink-950">
                  A different CV for every application
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink-600">
                  The single highest-leverage thing you can do is reorder and rewrite your CV to
                  match the posting in front of you. On Free you can keep{' '}
                  {PLANS.free.limits.maxCvs} versions, which is enough to see why it works. Pro
                  removes the ceiling on both saved CVs and downloads, so a tailored version costs
                  you five minutes instead of a decision.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold text-ink-950">Control over the last page</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink-600">
                  Almost every CV problem is a spacing problem: three lines spill onto a second
                  page, or a one-page CV looks empty. Pro unlocks font family and size, line
                  height, section spacing and page margins, which is the toolkit for fixing that
                  properly instead of deleting a job you are proud of.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold text-ink-950">
                  The other {TEMPLATE_COUNT - FREE_TEMPLATE_COUNT} templates
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink-600">
                  Different industries genuinely expect different documents. Pro opens every
                  category — modern, corporate, creative, technology, classic and ATS-focused —
                  plus custom sections, a share link, and a PDF with no credit line at the foot.
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
            <Badge tone="success">No catch</Badge>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink-950">
              Why the free plan is genuinely usable
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-600">
              Plenty of builders let you type a whole CV and then ask for a card at the download
              button. That is the one thing we will not do. On the free plan you get:
            </p>
            <ul className="mt-5 flex flex-col gap-3 text-sm text-ink-700">
              {[
                'The complete editor — no locked fields, no watermark on screen.',
                `${FREE_TEMPLATE_COUNT} full templates, ${FREE_ATS_CATEGORY_COUNT} of them built specifically for applicant tracking systems.`,
                `${PLANS.free.limits.maxDownloadsPerMonth} real PDF downloads every month, with selectable text.`,
                'Autosave, section reordering, accent colour and A4 or US Letter paper.',
                'Your CVs stored in your account for as long as you want them.',
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <svg
                    className="mt-0.5 size-4 shrink-0 text-success-600"
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
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-ink-600">
              The only line we add is a small{' '}
              <span className="font-medium text-ink-800">“Made with {site.name}”</span> credit at
              the very bottom of the exported PDF. It is how a free plan pays for itself, and it is
              the whole of the deal.
            </p>
          </div>
        </div>
      </Section>

      {/* Full comparison ---------------------------------------------------- */}
      <Section id="compare">
        <SectionHeading
          eyebrow="Line by line"
          title="Compare every feature"
          description="Generated from the same plan definition the server enforces, so nothing here is aspirational."
        />

        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <caption className="sr-only">
              Feature comparison of the {PLAN_ORDER.length} {site.name} plans
            </caption>
            <thead>
              <tr>
                <th scope="col" className="w-2/5 px-4 py-3 text-left font-semibold text-ink-950">
                  Feature
                </th>
                {PLAN_ORDER.map((planId) => {
                  const plan = PLANS[planId];
                  return (
                    <th
                      key={plan.id}
                      scope="col"
                      className="px-4 py-3 text-left font-semibold text-ink-950"
                    >
                      <span className="flex flex-col gap-0.5">
                        <span className={plan.featured ? 'text-brand-700' : undefined}>
                          {plan.name}
                        </span>
                        <span className="text-xs font-normal text-ink-500">{billing(plan)}</span>
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            {COMPARISON.map((group) => (
              <tbody key={group.title}>
                <tr>
                  <th
                    scope="colgroup"
                    colSpan={PLAN_ORDER.length + 1}
                    className="border-t border-ink-200 bg-ink-50 px-4 py-2.5 text-left text-xs font-bold tracking-[0.12em] text-ink-700 uppercase"
                  >
                    {group.title}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.label} className="border-t border-ink-100 align-top">
                    <th scope="row" className="px-4 py-3.5 text-left font-medium text-ink-800">
                      {row.label}
                      {row.hint ? (
                        <span className="mt-1 block text-xs leading-relaxed font-normal text-ink-500">
                          {row.hint}
                        </span>
                      ) : null}
                    </th>
                    {PLAN_ORDER.map((planId) => (
                      <td key={planId} className="px-4 py-3.5 text-ink-700">
                        <span className="flex items-center gap-1.5">
                          <CellValue cell={row.cell(PLANS[planId])} />
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>

        <p className="mt-6 text-sm text-ink-500">
          Every limit above is checked on the server before the action runs, not just hidden in the
          interface. See{' '}
          <Link href="/features" className="font-medium text-brand-700 underline underline-offset-2">
            the full feature tour
          </Link>{' '}
          for how each of these works in practice.
        </p>
      </Section>

      {/* Payment, refunds, currency ------------------------------------------ */}
      <Section tone="muted" id="refunds">
        <SectionHeading
          eyebrow="Paying"
          title="How payment works"
          description="Three short answers, because this is where most pricing pages get vague."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-ink-200 bg-white p-6">
            <h3 className="text-base font-semibold text-ink-950">Payment methods</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Checkout is handled by <strong className="font-semibold text-ink-800">Paddle</strong>.
              Inside it you can pay by debit or credit card — Visa, Mastercard, American Express —
              or with PayPal, Apple Pay or Google Pay. The payment form is served by Paddle, so your
              card details never reach our servers.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">
              The checkout opens over this page rather than sending you away, and closes when the
              payment is done. Access is granted only after our server has confirmed the transaction
              with Paddle directly. Paddle is the merchant of record, so it handles the tax and the
              receipt — and your statement will read Paddle, not {site.name}.
            </p>
          </div>

          <div className="rounded-xl border border-ink-200 bg-white p-6">
            <h3 className="text-base font-semibold text-ink-950">Refunds</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              <strong className="font-semibold text-ink-800">14 days, no questions.</strong> If the
              product is not what you expected — or you found a job the same week — e-mail{' '}
              <a
                href={`mailto:${site.supportEmail}`}
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                {site.supportEmail}
              </a>{' '}
              from the address on your account and we refund the full amount through Paddle,
              normally within two working days.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">
              You keep every CV you made. Read the{' '}
              <Link
                href="/refund-policy"
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                full refund policy
              </Link>{' '}
              for the handful of cases it does not cover.
            </p>
          </div>

          <div className="rounded-xl border border-ink-200 bg-white p-6">
            <h3 className="text-base font-semibold text-ink-950">Currency and tax</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Prices are shown and charged in{' '}
              <strong className="font-semibold text-ink-800">{publicEnv.storeCurrency}</strong>. If
              your account is in a different currency, Paddle or your bank converts at their own
              rate and may add a cross-border fee — that part is between you and them.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">
              Paddle is the merchant of record, so any sales tax or VAT your country requires is
              worked out by Paddle, shown at checkout before you confirm, and remitted by Paddle.
              Nothing is ever charged after the fact.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-ink-200 bg-white p-6">
          <h3 className="text-base font-semibold text-ink-950">What a payment actually buys</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-600">
            A fixed term of access, and nothing more elaborate than that. Pro is a payment for{' '}
            {PLANS.pro.accessDays} days; when it ends, the account quietly returns to Free and
            buying another period is a separate, deliberate purchase. Lifetime is bought once and
            never expires. We hold no card details of our own — they are entered in Paddle&apos;s
            checkout — and your account page lists every payment recorded against the account
            alongside the date your access ends.
          </p>
        </div>
      </Section>

      <Section>
        <FaqSection
          entries={FAQ}
          title="Pricing questions"
          description="Anything else is answered on the full FAQ page — or just ask us."
        />
        <p className="mt-8 text-center text-sm text-ink-500">
          More questions?{' '}
          <Link href="/faq" className="font-medium text-brand-700 underline underline-offset-2">
            Read the full FAQ
          </Link>{' '}
          or{' '}
          <Link href="/contact" className="font-medium text-brand-700 underline underline-offset-2">
            contact us
          </Link>
          .
        </p>
      </Section>

      <Section tone="muted" size="sm">
        <CtaBanner
          title="Start free. Upgrade only if it earns it."
          description={`Build a complete CV with ${FREE_TEMPLATE_COUNT} templates and download it as a PDF today — no card, no trial countdown, no watermark across your work.`}
          primaryHref="/register"
          primaryLabel="Create your CV — free"
          secondaryHref="/templates"
          secondaryLabel={`Browse all ${TEMPLATE_COUNT} templates`}
          note="Takes about fifteen minutes if your dates are to hand."
        />
      </Section>

      <JsonLd nodes={[softwareApplicationSchema()]} />
    </>
  );
}
