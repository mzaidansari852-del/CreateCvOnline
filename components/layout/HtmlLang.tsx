'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { LOCALE_META, localeOf } from '@/lib/i18n/locales';

/**
 * Corrects `<html lang>` to the language of the page being viewed.
 *
 * ## Why this is not done properly, in the markup
 *
 * `<html>` is written by the root layout, which is shared by all 424 routes and cannot know
 * the locale. The correct fix is multiple root layouts — one per language, each with its own
 * `<html lang>` — and the Next.js documentation rules it out for this site in one line:
 *
 *   "Navigating across multiple root layouts will cause a full page load."
 *
 * Every localised page links to `/register` and `/login`, which are single routes shared by
 * all four languages and would therefore live under a different root layout. So the French
 * "Créer mon CV" button — the conversion path the French pages exist to feed — would stop
 * being a client-side navigation and become a full reload. Trading that for an attribute is
 * a bad deal, and it is why the `fr`, `de` and `nl` layouts each carry a note saying the
 * refactor was considered and declined.
 *
 * ## What this fixes, and what it does not
 *
 * The page content is already inside `<div lang="fr">`, and both assistive technology and
 * Google read the nearest `lang` ancestor, so the *body* has always been announced and
 * indexed correctly. What sits outside that wrapper is `<title>` — so a screen reader
 * announced "Gratis cv maken online" using English pronunciation rules on page load. That
 * is the actual defect, it is small, and setting the attribute on mount fixes it: assistive
 * technology reads the live DOM, not the HTML that arrived over the wire.
 *
 * It does not change the served HTML, which still says `lang="en"`. That is a real
 * remaining inaccuracy and is recorded here rather than left to be rediscovered. It costs
 * little: Google's documentation states it does not use `lang` for language detection, and
 * the `hreflang` cluster and the wrapper both already say what the page is.
 */
export function HtmlLang() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.lang = LOCALE_META[localeOf(pathname ?? '/')].tag;
  }, [pathname]);

  return null;
}
