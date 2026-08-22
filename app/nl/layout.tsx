import Link from 'next/link';

import { NL } from './nl-copy';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

/**
 * The Dutch site shell.
 *
 * ## Why `lang` is on a `<div>` and not on `<html>`
 *
 * Same reason as the French and German shells: Next.js only allows a per-language `<html>`
 * with multiple root layouts, which requires there to be no `app/layout.tsx` — and there is
 * one, shared by the dashboard, the editor, the auth pages and the print route.
 *
 * `lang` on a wrapping element is valid HTML and is what assistive technology and Google
 * both use to decide the language of the content inside it, so the Dutch pages are
 * correctly identified. The `<html lang="en">` above them remains a real if minor
 * inaccuracy, recorded in all three of these files rather than left to be discovered.
 */
export default function DutchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="nl" className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>

      {/*
        The way back to English, as a real link so a crawler follows it in both directions.
        The header carries the full switcher — on desktop and, since this release, in the
        mobile drawer too — so this is a second affordance for the visitor who has scrolled
        to the bottom looking for one, not the only one.
      */}
      <nav aria-label={NL.chrome.languageLabel} className="border-t border-ink-200 bg-white">
        <div className="container-page flex justify-end py-3">
          <Link
            href="/"
            hrefLang="en"
            lang="en"
            className="text-sm font-medium text-ink-600 underline underline-offset-2 hover:text-brand-700"
          >
            {NL.chrome.switchToEnglish}
          </Link>
        </div>
      </nav>

      <SiteFooter />
    </div>
  );
}
