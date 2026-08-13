import type { Metadata } from 'next';
import Link from 'next/link';
import { FilePlus2, LayoutGrid, Rows3 } from 'lucide-react';

import { CVGridCard, CVListRow } from '@/components/dashboard/CVCard';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { UpgradeCard } from '@/components/dashboard/UpgradeCard';
import { ButtonLink } from '@/components/ui/button';
import { Alert, EmptyState } from '@/components/ui/feedback';
import { requireViewer } from '@/lib/auth/guards';
import { getCV, listCVs } from '@/lib/db/cvs';
import { privateMetadata } from '@/lib/seo/metadata';
import { cn } from '@/lib/utils/cn';
import type { CVSummary } from '@/types/cv';

export const metadata: Metadata = privateMetadata(
  'My CVs',
  'Every CV in your account, with previews and one-click download.',
);

type ViewKey = 'grid' | 'list';
type SortKey = 'recent' | 'name' | 'complete';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Recently edited' },
  { key: 'name', label: 'Name' },
  { key: 'complete', label: 'Completeness' },
];

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

  const view: ViewKey = query.view === 'list' ? 'list' : 'grid';
  const sort: SortKey =
    query.sort === 'name' ? 'name' : query.sort === 'complete' ? 'complete' : 'recent';

  const summaries = sortSummaries(await listCVs(viewer.user.uid), sort);
  // Previews are real renders of the user's own documents, so the full bodies are needed.
  const documents = await Promise.all(summaries.map((cv) => getCV(viewer.user.uid, cv.id)));

  const limit = viewer.limits.maxCvs;
  const atLimit = limit !== null && summaries.length >= limit;

  const controlClasses = (active: boolean) =>
    cn(
      'rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors',
      active ? 'bg-white text-ink-950 shadow-sm' : 'text-ink-600 hover:text-ink-900',
    );

  return (
    <DashboardShell
      viewer={viewer}
      title="My CVs"
      description={
        summaries.length === 0
          ? 'Nothing here yet.'
          : `${summaries.length} saved${limit === null ? '' : ` of ${limit} on the ${viewer.plan.name} plan`}.`
      }
      actions={
        <ButtonLink
          href="/dashboard/cvs/new"
          size="sm"
          leadingIcon={<FilePlus2 size={15} aria-hidden />}
        >
          New CV
        </ButtonLink>
      }
    >
      <div className="flex flex-col gap-5">
        {atLimit ? (
          <Alert
            tone="warning"
            title={`All ${limit} CV slots on the ${viewer.plan.name} plan are in use`}
            action={
              <ButtonLink href="/pricing" size="sm">
                See plans
              </ButtonLink>
            }
          >
            Delete or rename an existing CV to reuse a slot, or upgrade to Pro for unlimited
            CVs.
          </Alert>
        ) : null}

        {summaries.length === 0 ? (
          <EmptyState
            icon={<FilePlus2 size={20} aria-hidden />}
            title="No CVs in your account"
            description="Create one from a blank page, from a worked example, or straight from a template you like."
            action={<ButtonLink href="/dashboard/cvs/new">Create a CV</ButtonLink>}
            secondaryAction={
              <ButtonLink href="/dashboard/templates" variant="outline">
                Browse templates
              </ButtonLink>
            }
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <nav aria-label="Sort CVs" className="inline-flex rounded-lg border border-ink-200 bg-ink-50 p-0.5">
                {SORTS.map((option) => (
                  <Link
                    key={option.key}
                    href={href(view, option.key)}
                    aria-current={option.key === sort ? 'true' : undefined}
                    className={controlClasses(option.key === sort)}
                    scroll={false}
                  >
                    {option.label}
                  </Link>
                ))}
              </nav>

              <nav aria-label="Layout" className="inline-flex rounded-lg border border-ink-200 bg-ink-50 p-0.5">
                <Link
                  href={href('grid', sort)}
                  aria-label="Grid view"
                  aria-current={view === 'grid' ? 'true' : undefined}
                  className={cn(controlClasses(view === 'grid'), 'inline-flex items-center gap-1.5')}
                  scroll={false}
                >
                  <LayoutGrid size={15} aria-hidden />
                  <span className="hidden sm:inline">Grid</span>
                </Link>
                <Link
                  href={href('list', sort)}
                  aria-label="List view"
                  aria-current={view === 'list' ? 'true' : undefined}
                  className={cn(controlClasses(view === 'list'), 'inline-flex items-center gap-1.5')}
                  scroll={false}
                >
                  <Rows3 size={15} aria-hidden />
                  <span className="hidden sm:inline">List</span>
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
