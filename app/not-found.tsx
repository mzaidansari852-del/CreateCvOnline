import Link from 'next/link';
import type { Metadata } from 'next';

import { ButtonLink } from '@/components/ui/button';
import { Logo } from '@/components/brand/Logo';
import { site } from '@/lib/site';

/**
 * The 404 page.
 *
 * It lives at the root of `app`, outside the `(marketing)` group, so it renders inside the
 * root layout but without the site header and footer. That is deliberate: an unmatched URL
 * can be anything — a mistyped dashboard path, a dead inbound link, a scanner probing for
 * WordPress — and the navigation for one of those contexts would be wrong for the others.
 * Instead it carries its own way out.
 */

export const metadata: Metadata = {
  title: 'Page not found',
  description: `That page does not exist on ${site.domain}. Browse the CV templates, the builder, the examples or the blog instead.`,
  robots: { index: false, follow: true },
};

const DESTINATIONS = [
  {
    href: '/templates',
    label: 'CV templates',
    description: 'Every design, previewed at full size and filterable by ATS score.',
  },
  {
    href: '/cv-builder',
    label: 'The CV builder',
    description: 'How the editor, the live preview and the PDF export actually work.',
  },
  {
    href: '/cv-examples',
    label: 'CV examples',
    description: 'Worked examples by role and career stage, with the wording explained.',
  },
  {
    href: '/pricing',
    label: 'Pricing',
    description: 'What the free plan includes, and what Pro and Lifetime add.',
  },
  {
    href: '/blog',
    label: 'CV advice',
    description: 'Guides on structure, summaries, ATS and applying abroad.',
  },
  {
    href: '/',
    label: 'Home',
    description: `Start at the beginning of ${site.name}.`,
  },
];

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-ink-50">
      <header className="container-page py-6">
        <Logo />
      </header>

      <main id="main" className="container-page flex flex-1 items-center py-10 sm:py-16">
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-xs font-bold tracking-[0.14em] text-brand-700 uppercase">
            Error 404
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl">
            We could not find that page
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-pretty text-ink-600 sm:text-lg">
            The address you followed does not match anything on {site.domain}. It was most
            likely mistyped, or it points at a page that has since been renamed. Nothing is
            wrong with your account and no CV has been lost — this is just an address that
            leads nowhere.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/templates" size="lg">
              Browse the templates
            </ButtonLink>
            <ButtonLink href="/dashboard" size="lg" variant="outline">
              Go to my dashboard
            </ButtonLink>
          </div>

          <nav aria-labelledby="popular-heading" className="mt-14">
            <h2 id="popular-heading" className="text-sm font-bold tracking-wide text-ink-950 uppercase">
              Popular destinations
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {DESTINATIONS.map((destination) => (
                <li key={destination.href}>
                  <Link
                    href={destination.href}
                    className="group flex h-full flex-col rounded-xl border border-ink-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                  >
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-950 group-hover:text-brand-700">
                      {destination.label}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                        className="transition-transform group-hover:translate-x-0.5"
                      >
                        <path
                          d="M5 12h14m-6-6 6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="mt-1 text-[13px] leading-relaxed text-ink-600">
                      {destination.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>

      <footer className="container-page py-8">
        <p className="text-[13px] text-ink-500">
          Reached this from a link on {site.domain}?{' '}
          <Link
            href="/contact"
            className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
          >
            Tell us where it was
          </Link>{' '}
          and we will fix it.
        </p>
      </footer>
    </div>
  );
}
