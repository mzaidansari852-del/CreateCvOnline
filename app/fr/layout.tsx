import Link from 'next/link';

import { FR } from './fr-copy';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

/**
 * The French site shell.
 *
 * ## Why `lang` is on a `<div>` and not on `<html>`
 *
 * It should be on `<html>`. Next.js only allows that with multiple root layouts, which
 * requires there to be no `app/layout.tsx` — and there is one, shared by the dashboard,
 * the editor, the auth pages and the print route. Moving all of those under route groups
 * to change one attribute would be a large refactor of working code for a small gain.
 *
 * `lang` on a wrapping element is valid HTML and is what both assistive technology and
 * Google use to decide the language of the content inside it, so the French pages are
 * correctly identified. What is not fixed is the `<html lang="en">` above them, which is
 * a real if minor inaccuracy — recorded here rather than left for someone to discover.
 */
export default function FrenchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="fr" className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>

      {/*
        The language switch lives above the footer rather than in the header, because the
        header is a shared English component and the French pages are a small subtree. A
        visitor who lands here from a French search does not need it; a visitor who wants
        the English site is looking for a way out, and the bottom of the page is where they
        will look. It is a real link, so a crawler follows it in both directions.
      */}
      <nav aria-label={FR.chrome.languageLabel} className="border-t border-ink-200 bg-white">
        <div className="container-page flex justify-end py-3">
          <Link
            href="/"
            hrefLang="en"
            lang="en"
            className="text-sm font-medium text-ink-600 underline underline-offset-2 hover:text-brand-700"
          >
            {FR.chrome.switchToEnglish}
          </Link>
        </div>
      </nav>

      <SiteFooter />
    </div>
  );
}
