'use client';

import { usePathname } from 'next/navigation';

import { localeOf } from '@/lib/i18n/locales';
import { CHROME } from '@/lib/i18n/nav';

/**
 * The "skip to main content" link, in the language of the page it is on.
 *
 * It is the first focusable element in the document, which is exactly why it mattered that
 * it was hardcoded English: a Dutch keyboard or screen-reader user's very first interaction
 * with the site was a control announced in the wrong language.
 *
 * ## Why a client component rather than moving it into each layout
 *
 * It lives in the root layout, which is shared by every route and cannot read the locale —
 * `headers()` there would opt all 424 static pages into dynamic rendering. The alternative
 * to this component is rendering a skip link in each of the eight subtree layouts, where
 * the failure mode is silent: miss one and that route simply has no skip link, which is an
 * accessibility regression nobody notices.
 *
 * The cost is that the server sends the English string and the right one arrives on
 * hydration. That is invisible and harmless here, and only here: the link is `sr-focusable`,
 * so it is not rendered to the page until it receives focus, and focus cannot happen before
 * hydration. A crawler never reads it either way.
 */
export function SkipLink() {
  const chrome = CHROME[localeOf(usePathname() ?? '/')];

  return (
    <a href="#main" className="sr-focusable rounded-lg bg-brand-600 font-semibold text-white">
      {chrome.skipToContent}
    </a>
  );
}
