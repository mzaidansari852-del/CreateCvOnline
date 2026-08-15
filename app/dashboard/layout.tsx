import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import { cookies } from 'next/headers';

import { LocaleProvider } from '@/components/i18n/LocaleProvider';
import { requireViewer } from '@/lib/auth/guards';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { privateMetadata } from '@/lib/seo/metadata';

/**
 * The authenticated area.
 *
 * This layout does exactly two things: it refuses anonymous visitors, and it gives the
 * tree a full-height box. It deliberately renders **no chrome** — the CV editor at
 * `/dashboard/cvs/[id]/edit` needs the entire viewport with no top bar and no sidebar,
 * and a layout that imposed them would force that route to fight its own container.
 * Pages that want the navigation opt in with `<DashboardShell>`.
 */

export const metadata: Metadata = privateMetadata('Dashboard');

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Every page below re-reads the viewer from the same request-scoped cache, so this
  // costs one lookup, not one per page.
  const viewer = await requireViewer('/dashboard');

  /*
   * The language is resolved here, once, and handed down.
   *
   * Doing it in the layout rather than in each page is what keeps the editor and the
   * dashboard in step, and doing it on the server is what stops every authenticated page
   * painting in English and then flipping. `lang` goes on this wrapper for the same reason
   * the marketing subtrees put it on theirs: there is one shared root layout serving the
   * app, the print routes and the auth pages, so a per-locale `<html>` would need multiple
   * root layouts.
   */
  const locale = resolveLocale({
    profileLocale: viewer.profile.locale,
    cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
  });

  return (
    <LocaleProvider locale={locale}>
      <div lang={locale} className="min-h-dvh bg-ink-50">
        {children}
      </div>
    </LocaleProvider>
  );
}
