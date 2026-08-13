import type { Metadata } from 'next';
import Link from 'next/link';

import { ContactForm } from '@/components/marketing/ContactForm';
import { Breadcrumbs, Section, SectionHeading } from '@/components/marketing/primitives';
import { Badge } from '@/components/ui/feedback';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description: `Get in touch with the ${site.name} team about billing, refunds, a bug or a template request. Every message is answered by a person within two working days.`,
  path: '/contact',
  keywords: ['contact createcvonline', 'cv builder support', 'cv builder help'],
});

const SELF_SERVICE = [
  {
    title: 'Frequently asked questions',
    body: 'Twenty-odd answers about templates, ATS, downloads, billing, refunds and data. Most support e-mail we receive is answered here already.',
    href: '/faq',
    cta: 'Read the FAQ',
  },
  {
    title: 'Guides on the blog',
    body: 'How to write a summary worth reading, how to quantify an achievement, what applicant tracking systems actually do with your file.',
    href: '/blog',
    cta: 'Browse the blog',
  },
  {
    title: 'What the plans include',
    body: 'Every limit on every plan, side by side, generated from the same definition the server enforces. Refunds and currency are covered there too.',
    href: '/pricing',
    cta: 'See pricing',
  },
];

const TIMES = [
  { label: 'First reply', value: 'Within 2 working days', note: 'Usually the same day.' },
  {
    label: 'Refund requests',
    value: 'Processed within 2 working days',
    note: 'PayPal then takes a few days to return the money.',
  },
  {
    label: 'Bug reports',
    value: 'Acknowledged with next steps',
    note: 'We will tell you honestly whether it is a quick fix or a long one.',
  },
];

export default function ContactPage() {
  return (
    <>
      <Section size="sm">
        <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]} />
        <SectionHeading
          as="h1"
          eyebrow="Contact"
          title="Talk to a person"
          description="No ticket numbers, no chatbot, no “your call is important to us”. Send the form below or write to us directly — the same small team reads both."
        />
      </Section>

      <Section size="sm" className="pt-0">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
          {/* Form ---------------------------------------------------------- */}
          <div>
            <h2 className="text-xl font-bold text-ink-950">Send us a message</h2>
            <p className="mt-1.5 text-sm text-ink-600">
              Everything marked with an asterisk is required. We reply to the address you give us
              and nothing else.
            </p>
            <div className="mt-7">
              <ContactForm />
            </div>
          </div>

          {/* Aside --------------------------------------------------------- */}
          <aside className="flex flex-col gap-6">
            <div className="rounded-xl border border-ink-200 bg-white p-6">
              <h2 className="text-base font-bold text-ink-950">Prefer plain e-mail?</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                Write to us at:
              </p>
              <a
                href={`mailto:${site.supportEmail}`}
                className="mt-2 inline-flex text-[15px] font-semibold break-all text-brand-700 underline underline-offset-4 hover:text-brand-800"
              >
                {site.supportEmail}
              </a>
              <p className="mt-4 text-sm leading-relaxed text-ink-600">
                If your question is about a payment, send it from the address on the account and
                include the PayPal transaction id — that lets us find the order without a second
                round trip.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">
                Press and partnership enquiries:{' '}
                <a
                  href={`mailto:${site.pressEmail}`}
                  className="font-medium break-all text-brand-700 underline underline-offset-2"
                >
                  {site.pressEmail}
                </a>
                .
              </p>
            </div>

            <div className="rounded-xl border border-ink-200 bg-ink-50 p-6">
              <div className="flex items-center gap-2">
                <Badge tone="success">Response times</Badge>
              </div>
              <dl className="mt-4 flex flex-col gap-4">
                {TIMES.map((item) => (
                  <div key={item.label}>
                    <dt className="text-xs font-bold tracking-wide text-ink-500 uppercase">
                      {item.label}
                    </dt>
                    <dd className="mt-0.5 text-sm font-semibold text-ink-900">{item.value}</dd>
                    <dd className="text-[13px] leading-relaxed text-ink-600">{item.note}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-[13px] leading-relaxed text-ink-500">
                We are a small team in one time zone, so a message sent late on Friday is most
                likely answered on Monday. We do answer everything.
              </p>
            </div>

            <div className="rounded-xl border border-ink-200 bg-white p-6">
              <h2 className="text-base font-bold text-ink-950">Deleting your data</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                You can delete your account and everything in it from your account settings at any
                time. If you cannot sign in, e-mail us from the registered address and we will do
                it for you. See the{' '}
                <Link
                  href="/privacy"
                  className="font-medium text-brand-700 underline underline-offset-2"
                >
                  privacy policy
                </Link>{' '}
                for what deletion covers.
              </p>
            </div>
          </aside>
        </div>
      </Section>

      {/* Self-service -------------------------------------------------------- */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="Faster than waiting"
          title="You might not need us"
          description="These three pages answer the large majority of the questions that reach our inbox."
        />
        <ul className="mt-12 grid gap-5 sm:grid-cols-3">
          {SELF_SERVICE.map((item) => (
            <li
              key={item.href}
              className="flex flex-col rounded-xl border border-ink-200 bg-white p-6"
            >
              <h3 className="text-base font-semibold text-ink-950">{item.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">{item.body}</p>
              <Link
                href={item.href}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                {item.cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M5 12h14m-6-6 6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center text-sm text-ink-500">
          Reporting a security problem? E-mail{' '}
          <a
            href={`mailto:${site.supportEmail}`}
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            {site.supportEmail}
          </a>{' '}
          with “security” in the subject and we will prioritise it. Please do not post details
          publicly until it is fixed.
        </p>
      </Section>
    </>
  );
}
