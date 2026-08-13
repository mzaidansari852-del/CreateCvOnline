import Link from 'next/link';

import { ArrowIcon, CheckIcon } from '@/components/marketing/home/icons';
import { atsSafeTemplates, TEMPLATE_COUNT } from '@/lib/cv/template-registry';

/**
 * The ATS section.
 *
 * Written to be correct rather than scary: parsing failures are a real problem, automatic
 * rejection on formatting is mostly folklore, and no builder can promise how a given
 * vendor's parser will behave. The counts come from the registry, so the claim on the page
 * and the templates that back it can never drift apart.
 */

const FAILURE_MODES: { title: string; body: string }[] = [
  {
    title: 'Two-column layouts',
    body: 'Text extraction follows the order elements sit in the file, not the order your eye reads them. A sidebar can be interleaved line by line with the main column, so "Python, SQL" ends up welded onto the middle of a job description.',
  },
  {
    title: 'Skill bars, rating dots and icons',
    body: 'A graphic carries no text. Four filled dots next to "French" tell a parser nothing; the words "French — full professional" tell it everything. The same goes for an envelope icon standing in for the word "Email".',
  },
  {
    title: 'Headers, footers and text boxes',
    body: 'Several parsers skip the header and footer region entirely, which is the classic way to lose your phone number and email. Free-floating text boxes have no fixed position in the reading order either.',
  },
  {
    title: 'Tables and invented section names',
    body: 'Flattening a table is guesswork, and cells can come out column-first — separating a job title from its dates. Section headings are one of the main anchors a parser uses, so "My Journey" costs you more than "Work Experience" does.',
  },
];

const CHECKLIST = [
  'One column, read strictly top to bottom',
  'Every date, title and skill written as real text',
  'Conventional section headings',
  'Nothing load-bearing in a header or footer',
  'PDF export with selectable, searchable text',
];

export function AtsExplainer() {
  const atsPerfect = atsSafeTemplates().length;

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-16">
      <div>
        <p className="text-xs font-bold tracking-[0.14em] text-brand-300 uppercase">
          Applicant tracking systems
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-balance text-white sm:text-4xl">
          What an ATS actually does to your CV
        </h2>

        <div className="mt-6 flex flex-col gap-4 text-[15px] leading-relaxed text-ink-300">
          <p>
            Most mid-size and large employers collect applications through an applicant
            tracking system — Workday, Greenhouse, Lever, SmartRecruiters and a few dozen
            others. Before a person reads anything, the system extracts the text from your
            file and tries to map it onto structured fields: name, email and phone; then one
            record per job with an employer, a title and a date range; then education; then
            skills. Recruiters search, sort and filter against those fields.
          </p>
          <p>
            The popular version of this story is that a robot rejects you. That is mostly
            folklore — very little is auto-rejected on formatting alone. What really happens
            is quieter and worse:{' '}
            <strong className="font-semibold text-white">
              a badly parsed CV produces a profile with your titles missing, your dates
              scrambled or your skills filed somewhere nobody searches
            </strong>
            . A recruiter skims that profile, not the carefully designed PDF sitting behind
            it, and moves on.
          </p>
        </div>

        <h3 className="mt-10 text-lg font-bold text-white">Where parsing tends to break</h3>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          {FAILURE_MODES.map((mode) => (
            <div key={mode.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <dt className="text-sm font-semibold text-white">{mode.title}</dt>
              <dd className="mt-1.5 text-[13px] leading-relaxed text-ink-400">{mode.body}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-ink-300">
          None of this comes with a guarantee, and you should distrust anyone who offers one.
          Every system parses differently, none of the vendors publish their rules, and those
          rules change. What a template can do is remove the known failure modes — and a
          two-column design is not automatically doomed, it simply has more ways to go wrong
          than a single column does.
        </p>

        <Link
          href="/ats-cv"
          className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-300 transition-colors hover:text-white"
        >
          How to write an ATS-friendly CV
          <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 lg:sticky lg:top-24 lg:self-start">
        <p className="text-2xs font-bold tracking-[0.14em] text-brand-300 uppercase">
          Our 5/5 checklist
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-300">
          We score every template out of five against the list below. A design has to pass all
          five to be marked 5/5.
        </p>

        <ul className="mt-5 flex flex-col gap-3">
          {CHECKLIST.map((item) => (
            <li key={item} className="flex gap-3 text-sm text-ink-200">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-500/15 text-success-500">
                <CheckIcon className="size-3" />
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t border-white/10 pt-5">
          <p className="text-3xl font-extrabold tracking-tight text-white">
            {atsPerfect}
            <span className="text-lg font-semibold text-ink-400"> / {TEMPLATE_COUNT}</span>
          </p>
          <p className="mt-1 text-sm text-ink-400">
            templates pass all five. The score sits on every template&rsquo;s own page, so you
            can check a design before you commit an evening to it.
          </p>
        </div>
      </div>
    </div>
  );
}
