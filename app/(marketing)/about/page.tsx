import type { Metadata } from 'next';
import Link from 'next/link';

import {
  Breadcrumbs,
  CtaBanner,
  Prose,
  Section,
  SectionHeading,
} from '@/components/marketing/primitives';
import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/feedback';
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT, atsSafeTemplates } from '@/lib/cv/template-registry';
import { publicEnv } from '@/lib/env';
import { PLANS } from '@/lib/plans';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'About',
  description:
    'Why this CV builder exists, what it is opinionated about, how it makes money, and the things it will never do — written as product principles rather than a founding myth.',
  path: '/about',
  keywords: ['about createcvonline', 'cv builder principles', 'honest cv builder'],
});

const ATS_SAFE_COUNT = atsSafeTemplates().length;

const PRINCIPLES = [
  {
    title: 'Single column by default',
    body: `Two-column CVs look designed and read badly. Human eyes skip between the columns, and parsers frequently read the sidebar first, which is how "Skills: Excel" ends up as your job title. ${ATS_SAFE_COUNT} of our ${TEMPLATE_COUNT} templates are single-column, and the default template for a new document is one of them. Two-column layouts exist here, and some of them are lovely, but you have to choose one on purpose.`,
  },
  {
    title: 'Content and styling are separate',
    body: 'Your words live in one object and the design lives in another. That is why you can try six templates in a minute and lose nothing, and why a lapsed subscription can never damage what you wrote — the worst that happens is your document renders with the default styling until you upgrade again.',
  },
  {
    title: 'The preview is the document',
    body: 'The same React component renders the editor preview, the print view and the exported PDF. There is no second renderer to disagree with the first, which is the usual reason a downloaded CV looks nothing like the screen you approved.',
  },
  {
    title: 'Limits are enforced on the server',
    body: 'Hiding a button is a courtesy. Every quota and every paid feature is checked before the action runs, so what the pricing page promises is exactly what the software allows. It also means we cannot quietly advertise a limit we do not honour.',
  },
  {
    title: 'Honesty about ATS',
    body: 'We publish a per-template ATS score and describe what it measures — one column, no text inside graphics, structural headings, ordinary bullet characters. We do not sell "ATS-proof", "ATS-optimised" or a percentage match against a job description, because applicant tracking systems are dozens of products configured differently by every employer, and nobody can honestly guarantee an outcome across them.',
  },
  {
    title: 'A free plan you can finish a CV on',
    body: `Free means the full editor, ${FREE_TEMPLATE_COUNT} templates, ${PLANS.free.limits.maxCvs} saved CVs and ${PLANS.free.limits.maxDownloadsPerMonth} real PDF downloads a month, with no trial countdown and no card. The one thing we take is a small credit line at the foot of the exported page. If you never pay us, you still leave with a CV.`,
  },
];

const NEVER = [
  {
    title: 'Let you write a whole CV and then ask for a card to download it',
    body: 'The classic bait-and-switch of this category. The free plan downloads a real PDF from the first minute.',
  },
  {
    title: 'Put a watermark across your work in the editor',
    body: 'A diagonal “SAMPLE” over the preview is a hostage tactic. The only mark we add is one small credit line at the very bottom of a free-plan PDF.',
  },
  {
    title: 'Enrol you in a subscription that renews quietly',
    body: `Paid access is a single payment covering ${PLANS.pro.accessDays} days. We store no card, create no recurring agreement, and send no "your plan renewed" e-mail, because there is nothing to renew.`,
  },
  {
    title: 'Make cancelling harder than buying',
    body: 'There is no cancellation flow to survive, no retention offer and no phone call. When a paid period ends, the account returns to Free on its own.',
  },
  {
    title: 'Sell, rent or trade your data',
    body: 'Your CV contains your address, your employment history and often your date of birth. It is not inventory. We do not sell personal data and we do not run advertising against it.',
  },
  {
    title: 'Use fake urgency or invented social proof',
    body: 'No countdown timers on the pricing page, no "37 people are viewing this template", no review counts we cannot substantiate. If we quote a number anywhere on this site, it is computed from the product itself.',
  },
  {
    title: 'Claim compliance we have not verified',
    body: 'Our legal pages say plainly that they are a starting template pending review by a qualified lawyer. Pretending otherwise would be the exact dishonesty this page is about.',
  },
];

export default function AboutPage() {
  return (
    <>
      <Section size="sm">
        <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]} />
        <SectionHeading
          as="h1"
          eyebrow="About"
          title="Why this exists"
          description="This is a product-principles page, not a founding myth. No garage, no photograph of a team pointing at a whiteboard — just what we think a CV builder should be, what this one is opinionated about, and how it pays for itself."
        />
      </Section>

      {/* The problem -------------------------------------------------------- */}
      <Section tone="muted" size="md" id="the-problem">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <Badge tone="neutral">The first bad option</Badge>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink-950">
              Writing a CV in a word processor
            </h2>
            <Prose className="mt-4 max-w-none">
              <p>
                Almost everyone starts here, and almost everyone loses an afternoon to it. The
                problems are always the same, and none of them are about writing:
              </p>
              <ul>
                <li>
                  You add one line to a job from 2019 and everything below it shifts, silently
                  pushing a single orphaned bullet onto page two.
                </li>
                <li>
                  Invisible tables and text boxes hold the layout together. They look fine on your
                  screen and parse into nonsense in an employer&apos;s software.
                </li>
                <li>
                  The dates in one section are “Jan 2021” and in another “01/2021”, because
                  consistency is manual work you are doing by eye at midnight.
                </li>
                <li>
                  Tailoring for a specific role means duplicating the file, which means five files
                  called <em>CV-final-v3-real.docx</em> and no idea which one you sent.
                </li>
                <li>
                  Exporting to PDF changes the spacing just enough that you have to check the whole
                  document again.
                </li>
              </ul>
              <p>
                None of that is a writing problem. It is a layout engine problem, and software
                should be doing it.
              </p>
            </Prose>
          </div>

          <div>
            <Badge tone="neutral">The second bad option</Badge>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink-950">
              The beautiful designer PDF
            </h2>
            <Prose className="mt-4 max-w-none">
              <p>
                The other common answer is a template bought from a design marketplace, or a
                friend&apos;s InDesign file. It is genuinely better looking. It also tends to be:
              </p>
              <ul>
                <li>
                  <strong>Frozen.</strong> Changing a job title means opening a design tool you do
                  not own, or asking someone a favour every time you apply.
                </li>
                <li>
                  <strong>Two columns with a coloured sidebar.</strong> Attractive on screen,
                  regularly read out of order by parsers that flatten the page.
                </li>
                <li>
                  <strong>Full of graphics that carry meaning.</strong> Five-dot skill ratings and
                  circular language meters convey nothing to a machine and very little to a human —
                  what does four dots out of five for “leadership” actually mean?
                </li>
                <li>
                  <strong>Sometimes an image.</strong> A CV exported as a picture has no selectable
                  text at all, which is the single worst thing you can send.
                </li>
              </ul>
              <p>
                A CV has two readers, one of which is software. A good document has to satisfy both
                without pretending the second one does not exist.
              </p>
            </Prose>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-ink-950">So this is the third option</h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink-600">
            A structured document you can edit in a browser, rendered by {TEMPLATE_COUNT} layouts
            that were each built to survive a parser as well as a person, exported as a PDF with
            real text. You keep the editability of a word processor and the typography of a
            designed template, and you can produce a version tailored to a specific posting in
            about five minutes rather than an evening.
          </p>
        </div>
      </Section>

      {/* Principles --------------------------------------------------------- */}
      <Section id="principles">
        <SectionHeading
          eyebrow="Principles"
          title="What we are opinionated about"
          description="Defaults are the strongest opinion a product has. Here are ours, and the reasoning behind each."
        />
        <ol className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2">
          {PRINCIPLES.map((principle, index) => (
            <li
              key={principle.title}
              className="rounded-xl border border-ink-200 bg-white p-6 transition-shadow hover:shadow-card"
            >
              <span className="grid size-8 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                {index + 1}
              </span>
              <h3 className="mt-3 text-base font-semibold text-ink-950">{principle.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{principle.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Never -------------------------------------------------------------- */}
      <Section tone="muted" id="never">
        <SectionHeading
          eyebrow="Commitments"
          title="What we will never do"
          description="Every item here is something a competitor in this category does. Writing them down is the point — it is much harder to quietly start doing one of these later."
        />
        <ul className="mx-auto mt-12 flex max-w-3xl flex-col gap-4">
          {NEVER.map((item) => (
            <li key={item.title} className="flex gap-4 rounded-xl border border-ink-200 bg-white p-5">
              <svg
                className="mt-0.5 size-5 shrink-0 text-danger-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <circle cx="12" cy="12" r="9" />
                <path d="m15 9-6 6M9 9l6 6" strokeLinecap="round" />
              </svg>
              <div>
                <h3 className="text-base font-semibold text-ink-950">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* Money -------------------------------------------------------------- */}
      <Section id="how-we-make-money">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="Business model"
            title="How this makes money"
            description="A product that will not tell you how it is funded is telling you how it is funded."
          />
          <Prose className="mt-10 max-w-none">
            <p>
              People pay us. That is the entire model, and it is deliberately the boring one.
            </p>
            <h3>The paid plans</h3>
            <p>
              {PLANS.pro.name} costs {PLANS.pro.price} {publicEnv.storeCurrency} and grants{' '}
              {PLANS.pro.accessDays} days of access as a single payment. {PLANS.lifetime.name} is a
              one-off payment with no expiry. Both unlock all {TEMPLATE_COUNT} templates, unlimited
              CVs and downloads, full typography control, custom sections and a share link. Payment
              is taken through Paddle, which is the merchant of record for the sale and handles the
              tax and the receipt; we never see a card number.
            </p>
            <h3>What the free plan costs us</h3>
            <p>
              Every free download runs a headless browser to render a real PDF, which costs money.
              We accept that because a builder that cannot produce a document is not a builder. The
              one thing a free export carries is a single small credit line at the foot of the last
              page — that line is the advertising budget.
            </p>
            <h3>What we do not do</h3>
            <ul>
              <li>
                <strong>No advertising.</strong> There are no ad slots and no trackers sold to third
                parties.
              </li>
              <li>
                <strong>No selling data.</strong> Your CV is not a product we resell to recruiters,
                training datasets or anybody else.
              </li>
              <li>
                <strong>No affiliate spam.</strong> We do not push you toward paid CV-review
                services or “premium distribution” for a cut.
              </li>
              <li>
                <strong>No upsell theatre.</strong> One pricing page, three plans, all limits
                published on it.
              </li>
            </ul>
            <p>
              The consequence is simple and worth stating plainly: the only way this product
              survives is by being good enough that some people choose to pay for it. That is a
              healthier incentive than the alternatives, and it is why the free plan is generous
              rather than crippled.
            </p>
            <h3>Who is behind it</h3>
            <p>
              {site.name} is operated as a small independent software product. We are not going to
              invent an origin story, a headcount or a list of investors to make this page feel
              more substantial. If you need to reach a human, one address reaches all of us:{' '}
              <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>, answered within two
              working days.
            </p>
          </Prose>

          <div className="mt-10 rounded-xl border border-ink-200 bg-ink-50 p-6">
            <h3 className="text-base font-bold text-ink-950">Holding us to it</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              If you ever find something on this site that contradicts a principle above — a dark
              pattern, an unsubstantiated claim, a limit that is not published — tell us and we
              will fix it or remove the claim. That offer is not rhetorical; it is the only way a
              page like this stays true.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <ButtonLink href="/contact" variant="outline">
                Tell us we got something wrong
              </ButtonLink>
              <ButtonLink href="/pricing" variant="ghost">
                See the pricing
              </ButtonLink>
            </div>
          </div>

          <p className="mt-8 text-sm text-ink-500">
            Related reading:{' '}
            <Link href="/features" className="font-medium text-brand-700 underline underline-offset-2">
              what the builder does
            </Link>
            ,{' '}
            <Link href="/privacy" className="font-medium text-brand-700 underline underline-offset-2">
              how we handle your data
            </Link>{' '}
            and{' '}
            <Link
              href="/refund-policy"
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              the refund policy
            </Link>
            .
          </p>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <CtaBanner
          title="Judge it by the product, not the page"
          description={`Build a real CV on the free plan and download it as a PDF. If it is not better than what you would have written in a word processor, you have lost nothing but a quarter of an hour.`}
          primaryHref="/register"
          primaryLabel="Create your CV — free"
          secondaryHref="/contact"
          secondaryLabel="Ask us something first"
          note={`Questions go to ${site.supportEmail} and are answered by a person.`}
        />
      </Section>
    </>
  );
}
