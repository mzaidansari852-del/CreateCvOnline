import { site } from '@/lib/site';

/**
 * Illustrative testimonials.
 *
 * These are composites written from recurring support themes, not quotes from identifiable
 * customers, and the block says so in plain sight. A young product that invents named
 * referees with company logos is one screenshot away from losing every bit of trust it
 * has — so the honest version ships instead.
 */

const QUOTES: { quote: string; name: string; role: string; country: string }[] = [
  {
    quote:
      'I had written the whole thing in a two-column template before realising the sidebar was the problem. Switching to a single-column layout took one click and I did not retype a word — the content is stored separately from the design.',
    name: 'Yasmine',
    role: 'UX researcher',
    country: 'France',
  },
  {
    quote:
      'I keep a master CV and three tailored versions: one for operations roles, one for supply chain, one for consultancies. Duplicating and rewording the summary takes about ten minutes instead of an evening of copy-paste.',
    name: 'Daniel',
    role: 'Operations manager',
    country: 'United Kingdom',
  },
  {
    quote:
      'First proper CV, no design sense, and a deadline that evening. The example content showed me what a bullet point is supposed to look like — results first, not a list of duties — and the free plan covered everything I needed.',
    name: 'Kwame',
    role: 'Graduate, computer science',
    country: 'Ghana',
  },
];

export function Testimonials() {
  return (
    <div>
      <ul className="grid gap-5 md:grid-cols-3">
        {QUOTES.map((entry) => (
          <li
            key={entry.name}
            className="flex flex-col rounded-2xl border border-ink-200 bg-white p-6 shadow-card"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-7 text-brand-200"
              fill="currentColor"
              aria-hidden
            >
              <path d="M9.6 5.4C6.5 6.9 4.6 9.7 4.6 13.3c0 3.3 1.9 5.3 4.3 5.3 2.1 0 3.7-1.5 3.7-3.5 0-2-1.4-3.4-3.2-3.4-.4 0-.8.1-1 .2.4-1.8 2-3.3 3.9-4.1l-2.7-2.4Zm9.1 0c-3.1 1.5-5 4.3-5 7.9 0 3.3 1.9 5.3 4.3 5.3 2.1 0 3.7-1.5 3.7-3.5 0-2-1.4-3.4-3.2-3.4-.4 0-.8.1-1 .2.4-1.8 2-3.3 3.9-4.1l-2.7-2.4Z" />
            </svg>
            <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-700">
              {entry.quote}
            </blockquote>
            <div className="mt-5 border-t border-ink-100 pt-4">
              <p className="text-sm font-semibold text-ink-950">{entry.name}</p>
              <p className="text-[13px] text-ink-500">
                {entry.role} · {entry.country}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-ink-500">
        Illustrative only: composite examples written from recurring {site.name} support and
        survey themes. They show how people work with the editor and are not quotes attributed
        to identifiable individuals or endorsements by any named employer.
      </p>
    </div>
  );
}
