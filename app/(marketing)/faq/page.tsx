import type { Metadata } from 'next';
import Link from 'next/link';

import {
  Breadcrumbs,
  CtaBanner,
  Section,
  SectionHeading,
  type FaqEntry,
} from '@/components/marketing/primitives';
import { JsonLd } from '@/components/seo/JsonLd';
import { Accordion } from '@/components/ui/overlays';
import { PAPER } from '@/lib/cv/format';
import {
  FREE_TEMPLATE_COUNT,
  TEMPLATE_COUNT,
  atsSafeTemplates,
  freeTemplates,
  premiumTemplates,
  templatesByCategory,
} from '@/lib/cv/template-registry';
import { publicEnv } from '@/lib/env';
import { PLANS } from '@/lib/plans';
import { pageMetadata } from '@/lib/seo/metadata';
import { faqSchema } from '@/lib/seo/schema';
import { site } from '@/lib/site';
import { BUILT_IN_SECTION_IDS, fontKeySchema } from '@/types/cv';

export const metadata: Metadata = pageMetadata({
  title: 'Frequently Asked Questions',
  description:
    'Straight answers about templates and ATS, PDF downloads and paper sizes, plans, refunds and how your CV data is stored, exported and deleted.',
  path: '/faq',
  keywords: ['cv builder faq', 'resume builder questions', 'ats cv questions', 'cv builder refund'],
});

const free = PLANS.free;
const pro = PLANS.pro;
const lifetime = PLANS.lifetime;

const ATS_SAFE_COUNT = atsSafeTemplates().length;
const FREE_ATS_SAFE_COUNT = freeTemplates().filter((template) => template.atsScore >= 5).length;
const ATS_FAMILY_COUNT = templatesByCategory('ats').length;
const ATS_FAMILY_FREE_COUNT = templatesByCategory('ats').filter((t) => !t.premium).length;
const PREMIUM_COUNT = premiumTemplates().length;

interface FaqGroup {
  id: string;
  title: string;
  description: string;
  entries: FaqEntry[];
}

/**
 * Every answer below is checked against how the product actually behaves — plan limits
 * come from `lib/plans.ts`, template counts from the registry. Where the honest answer is
 * "no" or "we cannot promise that", it says so.
 */
const GROUPS: FaqGroup[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    description: 'What you need, how long it takes and what the free plan really is.',
    entries: [
      {
        question: 'Do I need an account to build a CV?',
        answer:
          'Yes, and it takes about twenty seconds. Your document is saved to your account as you type, which is what makes autosave, multiple versions and coming back tomorrow possible. You can register with an e-mail address and password or with a Google account. No card is requested at any point on the free plan.',
      },
      {
        question: 'Is it actually free, or free until the download button?',
        answer: `Actually free. The free plan gives you the complete editor, ${FREE_TEMPLATE_COUNT} templates, ${free.limits.maxCvs} saved CVs and ${free.limits.maxDownloadsPerMonth} real PDF downloads every month, with no trial countdown and no watermark across your work. The only thing we add is one small credit line at the very bottom of the exported PDF, which the paid plans remove.`,
      },
      {
        question: 'How long does it take to make a CV?',
        answer:
          'About fifteen minutes if your dates and job titles are to hand, and closer to forty-five if you are writing your achievement bullets from scratch. The formatting takes none of that time — you pick a template and the layout is already decided.',
      },
      {
        question: 'Can I start from an example instead of a blank page?',
        answer:
          'Yes. Every template can be opened pre-filled with a complete, realistic example CV so you can see what belongs in each field before you replace it with your own text. It is far easier to edit a good example than to face an empty form.',
      },
      {
        question: 'What sections can a CV have?',
        answer: `There are ${BUILT_IN_SECTION_IDS.length} built-in sections: summary, work experience, education, skills, languages, projects, certifications, awards, volunteering, publications, interests and references. You can reorder them, rename their headings and switch any of them off without deleting the content. Paid plans add up to six custom sections of your own.`,
      },
      {
        question: 'Does it work on a phone or tablet?',
        answer:
          'The site works on any modern browser and you can review and make small edits on a phone. We will be honest though: writing a full CV means looking at a full page next to a form, so a laptop or tablet is a much better experience. Nothing is locked on mobile — it is simply a small canvas for an A4 document.',
      },
      {
        question: 'What is the difference between a CV and a resume here?',
        answer: `Mostly convention and paper. A resume is usually one page on ${PAPER.letter.label} for the United States and Canada; a CV is often two pages on ${PAPER.a4.label} elsewhere, and in academia it is longer still. Both are the same document type in this builder — choose a template suited to your market and set the paper size to match.`,
      },
    ],
  },
  {
    id: 'templates-ats',
    title: 'Templates and ATS',
    description: 'Choosing a layout, switching between them, and what applicant tracking systems really do.',
    entries: [
      {
        question: 'How many templates are there, and how many are free?',
        answer: `${TEMPLATE_COUNT} templates in six families: modern, corporate, creative, technology, classic and a dedicated ATS family. ${FREE_TEMPLATE_COUNT} are available on the free plan and the remaining ${PREMIUM_COUNT} are included with any paid plan. Every template renders the same content structure, so none of them is a downgrade in what it can hold.`,
      },
      {
        question: 'Can I change template after I have written everything?',
        answer:
          'Yes, as often as you like, and you will not lose a word. Your content and your styling are stored as two separate objects, so switching template replaces only the styling. Try six layouts in a minute and go back to the first one unchanged.',
      },
      {
        question: 'What is an ATS, and will my CV get through one?',
        answer:
          'An applicant tracking system is the software an employer uses to receive and search applications. It reads your PDF and tries to turn it back into structured fields. We cannot promise your CV will parse perfectly everywhere, because ATS software is dozens of different products configured differently by each employer, and any builder that guarantees otherwise is overselling. What we can control is the part that reliably breaks parsers.',
      },
      {
        question: 'Which templates are safest for applicant tracking systems?',
        answer: `${ATS_SAFE_COUNT} of the ${TEMPLATE_COUNT} templates score 5/5 on our published checklist — single column, no text baked into graphics, real structural headings and ordinary bullet characters — and ${FREE_ATS_SAFE_COUNT} of those are on the free plan. The dedicated ATS family has ${ATS_FAMILY_COUNT} templates, ${ATS_FAMILY_FREE_COUNT} of them free, and is stripped back on purpose. Every template page shows its score so you can decide with your eyes open.`,
      },
      {
        question: 'Are two-column templates a bad idea?',
        answer:
          'For a strongly parser-driven application, yes — a sidebar is frequently read out of order, which is how a skills list ends up merged into your job title. For a design, marketing or agency role where a human opens the file first, a two-column layout can be exactly right. The default template for a new document is single column, and you have to choose a two-column layout deliberately.',
      },
      {
        question: 'Should I include a photo?',
        answer:
          'It depends entirely on where you are applying. Photos are normal in much of continental Europe, the Middle East and parts of Asia, and are actively discouraged in the United Kingdom, the United States, Canada and Australia, where they can create a discrimination risk for the employer. The photo is a single toggle, so you can keep one CV with and one without.',
      },
      {
        question: 'Can I change the colours and fonts?',
        answer: `The accent colour, paper size, photo shape and date format are available on every plan, including free. Font family (${fontKeySchema.options.length} to choose from), text size, line height, section spacing, page margins, heading case, icon display and skill display style are paid-plan controls — those are the tools for fitting a stubborn CV onto one page.`,
      },
    ],
  },
  {
    id: 'downloads',
    title: 'Downloads, formats and printing',
    description: 'What actually lands in the recruiter’s inbox.',
    entries: [
      {
        question: 'What format do I download?',
        answer:
          'A PDF containing real, selectable, searchable text with an embedded font — never an image of your CV. It is rendered by a headless Chromium from exactly the markup you saw in the preview, so the file matches the screen.',
      },
      {
        question: 'Can I export to Word or .docx?',
        answer:
          'No, and we would rather say so plainly than bury it. The builder exports PDF only. PDF is what the overwhelming majority of employers and job boards ask for, and it is the only format that guarantees your layout survives the trip. If an application form insists on a .docx upload, you will need to rebuild it in a word processor for that one submission.',
      },
      {
        question: 'How many PDFs can I download?',
        answer: `${free.limits.maxDownloadsPerMonth} per calendar month on the free plan, resetting on the 1st, and unlimited on ${pro.name} and ${lifetime.name}. A download only counts once a file has actually been produced, so a failed or cancelled export never eats into your allowance. Your dashboard shows the counter and the reset date.`,
      },
      {
        question: 'Is there a watermark on the free plan?',
        answer: `No watermark, and nothing across your content. Free exports carry a single small line at the very bottom of the page reading “Made with ${site.name}”. Paid plans remove it. There is nothing over the preview while you work, on any plan.`,
      },
      {
        question: 'Can I choose A4 or US Letter?',
        answer: `Both, and it is set per document rather than per account. ${PAPER.a4.label} is standard across Europe, Africa and most of Asia; ${PAPER.letter.label} is standard in the United States and Canada — wider and slightly shorter, which is enough to move your last line onto a second page if you pick the wrong one.`,
      },
      {
        question: 'How do I control where page two begins?',
        answer:
          'The preview shows page breaks as you edit, at the true page size, so you can see the problem before you download. Section headings are kept with the content beneath them, and a role is not split so that only its dates land on the next page. If you are two lines over, the spacing and font-size controls on the paid plans are usually a cleaner fix than deleting a job.',
      },
      {
        question: 'Can I print directly instead of downloading?',
        answer:
          'Yes. There is a dedicated print view that uses the same stylesheet as the export, so printing from your browser gives the same page as the PDF.',
      },
      {
        question: 'Can I send a link instead of a file?',
        answer:
          'On the paid plans, yes. Publishing a CV gives you a link with an unguessable identifier that renders the document in a browser. You can unpublish at any time — and unpublishing keeps working even after a paid period ends, so you can never be stuck with something public.',
      },
    ],
  },
  {
    id: 'billing',
    title: 'Plans, billing and refunds',
    description: 'Prices, what happens when a plan ends, and how to get your money back.',
    entries: [
      {
        question: 'What do the plans cost?',
        answer: `The ${free.name} plan costs nothing and never expires. ${pro.name} is ${pro.price} ${publicEnv.paypalCurrency} for ${pro.accessDays} days of access. ${lifetime.name} is ${lifetime.price} ${publicEnv.paypalCurrency} once, with no expiry. Paid plans unlock all ${TEMPLATE_COUNT} templates, unlimited CVs, unlimited downloads, full typography control, custom sections, a share link and a PDF with no credit line.`,
      },
      {
        question: 'Does a paid plan renew automatically?',
        answer: `No. Every payment is a single, deliberate PayPal transaction. We do not store a payment method and we do not create a recurring agreement, so there is no subscription to find and cancel. When the ${pro.accessDays} days are up, the account quietly returns to the free plan.`,
      },
      {
        question: 'How do I cancel?',
        answer:
          'There is nothing to cancel — simply do not buy another period. No cancellation form, no retention offer, no e-mail exchange. If you would like the current period refunded instead, see the refund question below.',
      },
      {
        question: 'Which payment methods do you accept?',
        answer:
          'Checkout runs through PayPal. You can pay from a PayPal balance or a linked bank account, and PayPal itself accepts debit and credit cards at checkout, so you do not need a PayPal account to buy. Your card details are entered on PayPal’s pages; they never touch our servers and we never store them.',
      },
      {
        question: 'What currency will I be charged in?',
        answer: `Prices are shown and charged in ${publicEnv.paypalCurrency}. If your account is in a different currency, PayPal or your bank converts at their rate and may add a cross-border fee, which is outside our control. Any sales tax or VAT that applies to your country is shown by PayPal before you confirm.`,
      },
      {
        question: 'Can I get a refund?',
        answer: `Yes — within 14 days of the payment, for any reason at all, including simply changing your mind or finding a job the same week. E-mail ${site.supportEmail} from the address on the account and we refund the full amount through PayPal, normally within two working days. You keep every CV you made.`,
      },
      {
        question: 'What happens to my CVs when a paid plan ends?',
        answer:
          'Nothing is deleted and nothing is locked away. Your documents stay in your account and you keep access to all of them. Free-plan limits apply again from that moment, so a CV built on a paid template renders with the default template and default styling until you upgrade. Your words are never modified.',
      },
      {
        question: 'I paid and my account still shows the free plan.',
        answer: `Access is granted only after our server has confirmed the capture with PayPal directly, so a slow confirmation can leave a short gap. Reload the confirmation page first. If it still has not applied, e-mail ${site.supportEmail} with the PayPal transaction id and we will fix it the same day — we can see the order in our own ledger.`,
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy, data and your account',
    description: 'Where your CV lives, who can see it, and how to take it away.',
    entries: [
      {
        question: 'Where is my CV stored?',
        answer:
          'In Google Cloud Firestore, through Firebase, under your user account. Your documents are private by default and are only reachable by anyone else if you deliberately publish a share link. Accounts and sign-in are handled by Firebase Authentication — we never see or store your password.',
      },
      {
        question: 'Do you read, sell or train on my CV?',
        answer:
          'No. We do not sell or rent personal data, we do not run advertising against it, and your CV content is not used to train models. Staff access to stored documents is limited to what is needed to investigate a specific problem you have reported to us.',
      },
      {
        question: 'Can I export my data or delete my account?',
        answer:
          'Both, from your account settings. Deletion is real deletion: it removes your authentication record, your profile, every CV you have made and your payment history — not a flag on a row we keep. It cannot be undone, so export anything you want to keep first.',
      },
      {
        question: 'What cookies do you use?',
        answer:
          'One strictly necessary cookie that keeps you signed in — it is httpOnly, Secure and SameSite=Lax, and it holds a session token, not your CV. Analytics cookies are only ever set if the operator of this deployment has configured an analytics measurement id, and analytics collects event names and low-cardinality properties only: never CV content, e-mail addresses or free text you typed.',
      },
      {
        question: 'Is a shared CV link private?',
        answer:
          'It is unguessable rather than password-protected: anyone who has the link can open it, which is the point of being able to paste it into an e-mail. It is not listed anywhere on the site. Switch sharing off and the link stops working immediately.',
      },
      {
        question: 'Who processes my payment data?',
        answer:
          'PayPal. We store the order id, the plan, the amount and the status so we can support you and honour refunds. We never receive your card number, and we do not store one.',
      },
      {
        question: 'How do I contact a human?',
        answer: `Use the contact form or e-mail ${site.supportEmail}. Every message is read and answered by a person, normally the same day and always within two working days.`,
      },
    ],
  },
];

const ALL_ENTRIES: FaqEntry[] = GROUPS.flatMap((group) => group.entries);

export default function FaqPage() {
  return (
    <>
      <Section size="sm">
        <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }]} />
        <SectionHeading
          as="h1"
          eyebrow="FAQ"
          title="Frequently asked questions"
          description={`${ALL_ENTRIES.length} straight answers about how ${site.name} works — including the places where the honest answer is “no”.`}
        />

        <nav aria-labelledby="faq-groups" className="mx-auto mt-10 max-w-3xl">
          <h2 id="faq-groups" className="sr-only">
            Question categories
          </h2>
          <ul className="flex flex-wrap justify-center gap-2">
            {GROUPS.map((group) => (
              <li key={group.id}>
                <a
                  href={`#${group.id}`}
                  className="inline-flex rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
                >
                  {group.title}
                  <span className="ml-1.5 text-ink-400">{group.entries.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Section>

      <Section size="sm" className="pt-0">
        <div className="mx-auto flex max-w-3xl flex-col gap-14">
          {GROUPS.map((group) => (
            <section key={group.id} id={group.id} className="scroll-mt-28">
              <h2 className="text-2xl font-bold tracking-tight text-ink-950">{group.title}</h2>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-600">
                {group.description}
              </p>
              <Accordion
                className="mt-6"
                items={group.entries.map((entry) => ({
                  question: entry.question,
                  answer: entry.answer,
                }))}
              />
            </section>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-3xl text-center text-sm text-ink-500">
          Still stuck? Read the{' '}
          <Link href="/features" className="font-medium text-brand-700 underline underline-offset-2">
            feature tour
          </Link>{' '}
          or the{' '}
          <Link href="/pricing" className="font-medium text-brand-700 underline underline-offset-2">
            pricing page
          </Link>
          , or just{' '}
          <Link href="/contact" className="font-medium text-brand-700 underline underline-offset-2">
            ask us
          </Link>{' '}
          — every message reaches a person.
        </p>
      </Section>

      <Section tone="muted" size="sm">
        <CtaBanner
          title="The fastest way to answer the rest"
          description={`Open the editor and build something. The free plan gives you ${FREE_TEMPLATE_COUNT} templates and a real PDF at the end of it, without a card.`}
          primaryHref="/register"
          primaryLabel="Create your CV — free"
          secondaryHref="/templates"
          secondaryLabel={`Browse ${TEMPLATE_COUNT} templates`}
        />
      </Section>

      <JsonLd nodes={[faqSchema(ALL_ENTRIES)]} />
    </>
  );
}
