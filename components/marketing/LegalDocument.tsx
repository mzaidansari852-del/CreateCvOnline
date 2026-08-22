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

/**
 * The BCP-47 tag each locale formats its revision date with.
 *
 * `en-GB` rather than `en`, because `en` means `en-US` to `Intl` and prints "August 12,
 * 2026" — a US date on a document whose other conventions are British. The French entry
 * matters more: `12 août 2026` is the only form a French reader will parse without
 * pausing, and `Intl` produces it from the same ISO string with no per-language code.
 */
const DATE_LOCALE: Record<string, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  de: 'de-DE',
  nl: 'nl-NL',
};

export function formatLegalDate(iso: string, locale = 'en'): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[locale] ?? 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`));
}

/**
 * The shell's own words, per language.
 *
 * All of this was hardcoded English. The consequence was not subtle: a French privacy
 * policy would have rendered French body text inside an English frame — "Last updated",
 * "The short version", "On this page", and a three-sentence lawyer-review warning that is
 * the single most important paragraph on the page and the one a French reader would have
 * been least able to act on. A legal document is exactly the wrong place to leave half the
 * words in another language.
 */
interface LegalChrome {
  eyebrow: string;
  lastUpdated: string;
  appliesTo: string;
  questions: string;
  noticeTitle: string;
  notice: (brand: string) => ReactNode;
  summaryTitle: string;
  summaryLede: string;
  onThisPage: string;
  footerTitle: string;
  footerWriteTo: string;
  footerOrUse: string;
  footerContactForm: string;
  footerReply: string;
  contactPath: string;
}

const CHROME: Record<string, LegalChrome> = {
  en: {
    eyebrow: 'Legal',
    lastUpdated: 'Last updated',
    appliesTo: 'Applies to',
    questions: 'Questions',
    noticeTitle: 'Please read this first',
    notice: (brand) => (
      <p>
        This document is a <strong>starting template</strong>. It describes how {brand} is
        built and what we intend, but it has not been reviewed by a qualified lawyer, and it
        must be before the service goes live commercially. It is not legal advice, and
        nothing here should be treated as a statement that the service complies with any
        particular law or regulation in your country. If you are operating this software,
        have a solicitor or attorney in your jurisdiction review and adapt every one of
        these four documents.
      </p>
    ),
    summaryTitle: 'The short version',
    summaryLede:
      'A plain-English summary. It is not a substitute for the full text below, but it is an honest précis of it.',
    onThisPage: 'On this page',
    footerTitle: 'Questions about this document?',
    footerWriteTo: 'Write to',
    footerOrUse: 'or use the',
    footerContactForm: 'contact form',
    footerReply: '. We answer every message within two working days.',
    contactPath: '/contact',
  },
  fr: {
    eyebrow: 'Mentions légales',
    lastUpdated: 'Dernière mise à jour',
    appliesTo: 'S’applique à',
    questions: 'Questions',
    noticeTitle: 'À lire avant tout',
    notice: (brand) => (
      <p>
        Ce document est un <strong>modèle de départ</strong>. Il décrit la façon dont {brand}{' '}
        est construit et ce que nous entendons faire, mais il n’a pas été relu par un juriste
        — et il doit l’être avant toute exploitation commerciale du service. Il ne constitue
        pas un conseil juridique, et rien ici ne doit être lu comme une attestation de
        conformité à une loi ou à un règlement de votre pays. Si vous exploitez ce logiciel,
        faites relire et adapter ces quatre documents par un avocat de votre juridiction.
      </p>
    ),
    summaryTitle: 'En résumé',
    summaryLede:
      'Un résumé en langage courant. Il ne remplace pas le texte complet ci-dessous, mais il en donne une version honnête.',
    onThisPage: 'Sur cette page',
    footerTitle: 'Une question sur ce document ?',
    footerWriteTo: 'Écrivez à',
    footerOrUse: 'ou utilisez le',
    footerContactForm: 'formulaire de contact',
    footerReply: '. Nous répondons à chaque message sous deux jours ouvrés.',
    contactPath: '/fr/contact',
  },
};

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
  locale = 'en',
}: {
  title: string;
  intro: string;
  /** Three to six plain-English bullets. The bit most people will actually read. */
  summary: ReactNode[];
  sections: LegalSection[];
  updated?: string;
  relatedLinks?: { label: string; href: string }[];
  /** The language of the document body, so the shell around it matches. */
  locale?: string;
}) {
  const chrome = CHROME[locale] ?? CHROME.en!;
  const formatted = formatLegalDate(updated, locale);

  return (
    <Section size="sm">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold tracking-[0.14em] text-brand-700 uppercase">
          {site.name} · {chrome.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-pretty text-ink-600">{intro}</p>

        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-y border-ink-200 py-4 text-sm">
          <div className="flex gap-2">
            <dt className="text-ink-500">{chrome.lastUpdated}</dt>
            <dd className="font-medium text-ink-900">
              <time dateTime={updated}>{formatted}</time>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-500">{chrome.appliesTo}</dt>
            <dd className="font-medium text-ink-900">{site.domain}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-500">{chrome.questions}</dt>
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

        <Alert tone="warning" title={chrome.noticeTitle} className="mt-8">
          {chrome.notice(site.name)}
        </Alert>

        <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6">
          <h2 className="text-lg font-bold text-brand-900">{chrome.summaryTitle}</h2>
          <p className="mt-1 text-sm text-brand-900/75">{chrome.summaryLede}</p>
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
            {chrome.onThisPage}
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
          <h2 className="text-base font-bold text-ink-950">{chrome.footerTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            {chrome.footerWriteTo}{' '}
            <a
              href={`mailto:${site.supportEmail}`}
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              {site.supportEmail}
            </a>{' '}
            {chrome.footerOrUse}{' '}
            <Link
              href={chrome.contactPath}
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              {chrome.footerContactForm}
            </Link>
            {chrome.footerReply}
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
