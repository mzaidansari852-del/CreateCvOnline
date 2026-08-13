import type { ReactNode } from 'react';
import Link from 'next/link';

import { Prose, Section } from '@/components/marketing/primitives';
import { Alert } from '@/components/ui/feedback';
import { site } from '@/lib/site';

/**
 * The shell every legal page uses.
 *
 * Keeps the four documents structurally identical — same "last updated" line, the same
 * lawyer-review notice, the same plain-English summary box, the same table of contents —
 * so a reader who has skimmed one knows exactly where to look in the others.
 */

/** Single source of truth for the revision date printed on all four documents. */
export const LEGAL_LAST_UPDATED = '2026-08-12';

export function formatLegalDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`));
}

export interface LegalSection {
  /** Anchor id — also the table-of-contents target. */
  id: string;
  title: string;
  body: ReactNode;
}

export function LegalDocument({
  title,
  intro,
  summary,
  sections,
  updated = LEGAL_LAST_UPDATED,
  relatedLinks,
}: {
  title: string;
  intro: string;
  /** Three to six plain-English bullets. The bit most people will actually read. */
  summary: ReactNode[];
  sections: LegalSection[];
  updated?: string;
  relatedLinks?: { label: string; href: string }[];
}) {
  const formatted = formatLegalDate(updated);

  return (
    <Section size="sm">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold tracking-[0.14em] text-brand-700 uppercase">
          {site.name} · Legal
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-pretty text-ink-600">{intro}</p>

        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-y border-ink-200 py-4 text-sm">
          <div className="flex gap-2">
            <dt className="text-ink-500">Last updated</dt>
            <dd className="font-medium text-ink-900">
              <time dateTime={updated}>{formatted}</time>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-500">Applies to</dt>
            <dd className="font-medium text-ink-900">{site.domain}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-500">Questions</dt>
            <dd className="font-medium">
              <a
                href={`mailto:${site.supportEmail}`}
                className="text-brand-700 underline underline-offset-2 hover:text-brand-800"
              >
                {site.supportEmail}
              </a>
            </dd>
          </div>
        </dl>

        <Alert tone="warning" title="Please read this first" className="mt-8">
          <p>
            This document is a <strong>starting template</strong>. It describes how{' '}
            {site.name} is built and what we intend, but it has not been reviewed by a
            qualified lawyer, and it must be before the service goes live commercially. It is
            not legal advice, and nothing here should be treated as a statement that the
            service complies with any particular law or regulation in your country. If you are
            operating this software, have a solicitor or attorney in your jurisdiction review
            and adapt every one of these four documents.
          </p>
        </Alert>

        <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6">
          <h2 className="text-lg font-bold text-brand-900">The short version</h2>
          <p className="mt-1 text-sm text-brand-900/75">
            A plain-English summary. It is not a substitute for the full text below, but it is
            an honest précis of it.
          </p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {summary.map((item, index) => (
              <li key={index} className="flex gap-2.5 text-sm leading-relaxed text-ink-800">
                <svg
                  className="mt-1 size-3.5 shrink-0 text-brand-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="m5 12.5 4.5 4.5L19 7.5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-labelledby="toc-heading" className="mt-10 rounded-xl border border-ink-200 p-5">
          <h2 id="toc-heading" className="text-sm font-bold tracking-wide text-ink-950 uppercase">
            On this page
          </h2>
          <ol className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {sections.map((section, index) => (
              <li key={section.id} className="flex gap-2">
                <span className="tabular-nums text-ink-400">{index + 1}.</span>
                <a
                  href={`#${section.id}`}
                  className="text-brand-700 underline-offset-2 hover:underline"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-4">
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <Prose className="max-w-none">
                <h2>
                  {index + 1}. {section.title}
                </h2>
                {section.body}
              </Prose>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-ink-200 bg-ink-50 p-6">
          <h2 className="text-base font-bold text-ink-950">Questions about this document?</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Write to{' '}
            <a
              href={`mailto:${site.supportEmail}`}
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              {site.supportEmail}
            </a>{' '}
            or use the{' '}
            <Link
              href="/contact"
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              contact form
            </Link>
            . We answer every message within two working days.
          </p>
          {relatedLinks && relatedLinks.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {relatedLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
