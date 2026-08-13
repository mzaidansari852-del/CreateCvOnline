import Link from 'next/link';

import { Logo } from '@/components/brand/Logo';
import { CVThumbnail } from '@/components/cv/CVThumbnail';
import { createDefaultCustomization, createSampleCV } from '@/lib/cv/defaults';
import { DEFAULT_TEMPLATE_ID, TEMPLATES, getTemplate } from '@/lib/cv/template-registry';
import { site } from '@/lib/site';

/**
 * The authentication shell.
 *
 * Deliberately outside the marketing group: no site header, no footer navigation, no
 * mega-menu. Someone who arrived to sign in should have exactly two things in front of
 * them — the form, and a reason to finish it.
 *
 * The right-hand panel is a real CV, rendered by the same components that produce the
 * PDF, not a stock illustration. It costs no client JavaScript (`CVThumbnail` is a server
 * component) and it is honest: that is precisely what the product makes. Below `lg` it is
 * dropped entirely so a phone gets the form and nothing else.
 */

const VALUE_POINTS = [
  {
    title: `${TEMPLATES.length} templates, all recruiter-ready`,
    body: 'Modern, classic, creative and ATS-safe layouts. Switch between them at any time without retyping a single line.',
  },
  {
    title: 'What you see is what prints',
    body: 'The preview is laid out at true page size, so the PDF you download matches the screen exactly — no surprise second page.',
  },
  {
    title: 'Free to start, yours to keep',
    body: 'Build and download a complete CV on the free plan. No credit card, no trial timer, and you can delete everything in one click.',
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const cv = createSampleCV();
  const template = getTemplate(DEFAULT_TEMPLATE_ID);
  const customization = createDefaultCustomization({
    templateId: template.id,
    accentColor: template.accentDefault,
  });
  const year = new Date().getFullYear();

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* ---------------------------------------------------------------- form */}
      <div className="flex min-h-dvh flex-col px-5 py-6 sm:px-8 lg:min-h-0">
        <header className="flex items-center justify-between gap-4">
          <Logo href="/" />
          <Link
            href="/templates"
            className="rounded-lg px-2 py-1 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
          >
            Browse templates
          </Link>
        </header>

        <main id="main" className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[26rem]">{children}</div>
        </main>

        <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-ink-500">
          <span>
            © {year} {site.name}
          </span>
          <Link href="/privacy" className="underline-offset-4 hover:text-ink-800 hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="underline-offset-4 hover:text-ink-800 hover:underline">
            Terms
          </Link>
          <Link href="/contact" className="underline-offset-4 hover:text-ink-800 hover:underline">
            Contact
          </Link>
        </footer>
      </div>

      {/* ------------------------------------------------------------- preview */}
      <aside className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-24 size-[30rem] rounded-full bg-brand-600/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-48 -left-32 size-[32rem] rounded-full bg-accent-500/15 blur-3xl"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-10 px-12 py-16">
          <div className="flex items-end gap-5">
            <CVThumbnail
              cv={cv}
              customization={customization}
              width={252}
              className="-rotate-2 ring-1 ring-white/10"
            />
            <div className="flex flex-col gap-3 pb-2">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-2xs font-semibold text-white ring-1 ring-white/15 ring-inset">
                <span className="size-1.5 rounded-full bg-success-500" aria-hidden />
                Live preview
              </span>
              <p className="text-sm leading-relaxed text-ink-300">
                Every template is rendered by the same engine that writes your PDF — this is a real
                document, not a mock-up.
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl leading-tight font-extrabold tracking-tight text-white">
              A CV a recruiter can read in six seconds.
            </h2>
            <ul className="mt-6 flex flex-col gap-5">
              {VALUE_POINTS.map((point) => (
                <li key={point.title} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-500/20 text-brand-300"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="m5 12.5 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">{point.title}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-ink-400">
                      {point.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="border-t border-white/10 pt-6 text-xs leading-relaxed text-ink-400">
            Sign-in is handled by Google Firebase Authentication — {site.name} never sees your
            Google password, and your CVs are private until you choose to share them.
          </p>
        </div>
      </aside>
    </div>
  );
}
