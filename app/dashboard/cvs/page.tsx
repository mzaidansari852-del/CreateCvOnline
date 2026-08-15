import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { FilePlus2, LayoutGrid, Rows3 } from 'lucide-react';

import { CVGridCard, CVListRow } from '@/components/dashboard/CVCard';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { UpgradeCard } from '@/components/dashboard/UpgradeCard';
import { ButtonLink } from '@/components/ui/button';
import { Alert, EmptyState } from '@/components/ui/feedback';
import { requireViewer } from '@/lib/auth/guards';
import { getCV, listCVs } from '@/lib/db/cvs';
import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { privateMetadata } from '@/lib/seo/metadata';
import { cn } from '@/lib/utils/cn';
import type { CVSummary } from '@/types/cv';

export const metadata: Metadata = privateMetadata(
  'My CVs',
  'Every CV in your account, with previews and one-click download.',
);

type ViewKey = 'grid' | 'list';
type SortKey = 'recent' | 'name' | 'complete';

/** The order the controls appear in; the labels come from the copy table at render time. */
const SORT_KEYS: SortKey[] = ['recent', 'name', 'complete'];

function sortSummaries(summaries: CVSummary[], sort: SortKey): CVSummary[] {
  const copy = [...summaries];
  switch (sort) {
    case 'name':
      return copy.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));
    case 'complete':
      return copy.sort((a, b) => b.completeness - a.completeness);
    case 'recent':
    default:
      // `listCVs` already returns newest-first; re-sorting keeps it explicit.
      return copy.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}

function href(view: ViewKey, sort: SortKey): string {
  return `/dashboard/cvs?view=${view}&sort=${sort}`;
}

export default async function MyCVsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireViewer('/dashboard/cvs');
  const query = await searchParams;
  const locale = resolveLocale({
    profileLocale: viewer.profile.locale,
    cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
  });
  const copy = appCopy(locale);

  const view: ViewKey = query.view === 'list' ? 'list' : 'grid';
  const sort: SortKey =
    query.sort === 'name' ? 'name' : query.sort === 'complete' ? 'complete' : 'recent';

  const summaries = sortSummaries(await listCVs(viewer.user.uid), sort);
  // Previews are real renders of the user's own documents, so the full bodies are needed.
  const documents = await Promise.all(summaries.map((cv) => getCV(viewer.user.uid, cv.id)));

  const limit = viewer.limits.maxCvs;
  const atLimit = limit !== null && summaries.length >= limit;

  const sortLabels: Record<SortKey, string> = {
    recent: copy.dashboard.recentlyEdited,
    name: copy.cvs.sortName,
    complete: copy.dashboard.completeness,
  };

  const controlClasses = (active: boolean) =>
    cn(
      'rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors',
      active ? 'bg-white text-ink-950 shadow-sm' : 'text-ink-600 hover:text-ink-900',
    );

  return (
    <DashboardShell
      viewer={viewer}
      title={copy.cvs.title}
      description={
        summaries.length === 0
          ? copy.cvs.nothingSavedYet
          : copy.cvs.savedSummary(summaries.length, limit, viewer.plan.name)
      }
      actions={
        <ButtonLink
          href="/dashboard/cvs/new"
          size="sm"
          leadingIcon={<FilePlus2 size={15} aria-hidden />}
        >
          {copy.nav.newCv}
        </ButtonLink>
      }
    >
      <div className="flex flex-col gap-5">
        {atLimit ? (
          <Alert
            tone="warning"
            title={copy.cvs.slotsFullTitle(limit ?? 0, viewer.plan.name)}
            action={
              <ButtonLink href="/pricing" size="sm">
                {copy.dashboard.seePlans}
              </ButtonLink>
            }
          >
            {copy.cvs.slotsFullBody}
          </Alert>
        ) : null}

        {summaries.length === 0 ? (
          <EmptyState
            icon={<FilePlus2 size={20} aria-hidden />}
            title={copy.cvs.noneTitle}
            description={copy.cvs.noneBody}
            action={<ButtonLink href="/dashboard/cvs/new">{copy.cvs.createOne}</ButtonLink>}
            secondaryAction={
              <ButtonLink href="/dashboard/templates" variant="outline">
                {copy.dashboard.browseTemplates}
              </ButtonLink>
            }
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <nav
                aria-label={copy.cvs.sortAria}
                className="inline-flex rounded-lg border border-ink-200 bg-ink-50 p-0.5"
              >
                {SORT_KEYS.map((key) => (
                  <Link
                    key={key}
                    href={href(view, key)}
                    aria-current={key === sort ? 'true' : undefined}
                    className={controlClasses(key === sort)}
                    scroll={false}
                  >
                    {sortLabels[key]}
                  </Link>
                ))}
              </nav>

              <nav
                aria-label={copy.cvs.layoutAria}
                className="inline-flex rounded-lg border border-ink-200 bg-ink-50 p-0.5"
              >
                <Link
                  href={href('grid', sort)}
                  aria-label={copy.cvs.gridViewAria}
                  aria-current={view === 'grid' ? 'true' : undefined}
                  className={cn(
                    controlClasses(view === 'grid'),
                    'inline-flex items-center gap-1.5',
                  )}
                  scroll={false}
                >
                  <LayoutGrid size={15} aria-hidden />
                  <span className="hidden sm:inline">{copy.cvs.gridView}</span>
                </Link>
                <Link
                  href={href('list', sort)}
                  aria-label={copy.cvs.listViewAria}
                  aria-current={view === 'list' ? 'true' : undefined}
                  className={cn(
                    controlClasses(view === 'list'),
                    'inline-flex items-center gap-1.5',
                  )}
                  scroll={false}
                >
                  <Rows3 size={15} aria-hidden />
                  <span className="hidden sm:inline">{copy.cvs.listView}</span>
                </Link>
              </nav>
            </div>

            {view === 'grid' ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {documents.map((cv) => (
                  <CVGridCard key={cv.id} cv={cv} canShare={viewer.limits.shareLinks} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {documents.map((cv) => (
                  <CVListRow key={cv.id} cv={cv} canShare={viewer.limits.shareLinks} />
                ))}
              </div>
            )}
          </>
        )}

        <UpgradeCard plan={viewer.plan} />
      </div>
    </DashboardShell>
  );
}
