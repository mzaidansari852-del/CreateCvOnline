import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CircleGauge, Download, FileText, Sparkles, Wallet } from 'lucide-react';

import { CVGridCard } from '@/components/dashboard/CVCard';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { StartCVPanel } from '@/components/dashboard/StartCVPanel';
import { StatTile } from '@/components/dashboard/StatTile';
import { UpgradeCard } from '@/components/dashboard/UpgradeCard';
import { topGaps } from '@/components/dashboard/completeness';
import { ButtonLink } from '@/components/ui/button';
import { Alert, EmptyState } from '@/components/ui/feedback';
import { requireViewer } from '@/lib/auth/guards';
import { getCV, listCVs } from '@/lib/db/cvs';
import { usageSnapshot } from '@/lib/entitlements';
import { formatDateTime } from '@/lib/cv/format';
import { privateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = privateMetadata(
  'Dashboard',
  'Your CVs, your plan usage and everything you have not finished yet.',
);

function firstNameOf(displayName: string, email: string): string {
  const fromName = displayName.trim().split(/\s+/)[0];
  if (fromName) return fromName;
  const localPart = email.split('@')[0] ?? '';
  const candidate = localPart.split(/[._-]/)[0] ?? '';
  return candidate ? candidate.charAt(0).toUpperCase() + candidate.slice(1) : 'there';
}

export default async function DashboardOverviewPage() {
  const viewer = await requireViewer('/dashboard');

  const [summaries, usage] = await Promise.all([
    listCVs(viewer.user.uid),
    usageSnapshot(viewer.profile),
  ]);

  const recent = summaries.slice(0, 3);
  // The weakest CV drives the "finish this" nudge; it is often also a recent one, so the
  // ids are de-duplicated before any document is read twice.
  const weakest = [...summaries].sort((a, b) => a.completeness - b.completeness)[0];
  const needed = new Set(recent.map((cv) => cv.id));
  if (weakest && weakest.completeness < 100) needed.add(weakest.id);

  const documents = new Map(
    (await Promise.all([...needed].map((id) => getCV(viewer.user.uid, id)))).map((cv) => [
      cv.id,
      cv,
    ]),
  );

  const averageCompleteness =
    summaries.length === 0
      ? 0
      : Math.round(
          summaries.reduce((total, cv) => total + cv.completeness, 0) / summaries.length,
        );

  const weakestDocument = weakest && weakest.completeness < 100 ? documents.get(weakest.id) : undefined;
  const gaps = weakestDocument ? topGaps(weakestDocument.data, 4) : [];

  const atCvLimit = usage.cvs.limit !== null && usage.cvs.used >= usage.cvs.limit;
  const atDownloadLimit =
    usage.downloads.limit !== null && usage.downloads.used >= usage.downloads.limit;

  return (
    <DashboardShell
      viewer={viewer}
      title={`${summaries.length === 0 ? 'Welcome' : 'Welcome back'}, ${firstNameOf(
        viewer.profile.displayName || viewer.user.displayName,
        viewer.user.email,
      )}`}
      description={
        summaries.length === 0
          ? 'Nothing saved yet. Pick a starting point below and you will have a finished CV in one sitting.'
          : `You have ${summaries.length} CV${summaries.length === 1 ? '' : 's'} in your account.`
      }
      actions={
        summaries.length > 0 ? (
          <ButtonLink href="/dashboard/cvs" variant="outline" size="sm">
            View all CVs
          </ButtonLink>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-6">
        <section aria-label="Plan usage" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            label="CVs saved"
            icon={<FileText size={14} aria-hidden />}
            value={usage.cvs.limit === null ? usage.cvs.used : `${usage.cvs.used} / ${usage.cvs.limit}`}
            meter={usage.cvs}
            hint={
              usage.cvs.limit === null
                ? 'Unlimited on your plan.'
                : atCvLimit
                  ? 'At the limit — delete one or upgrade to add more.'
                  : `${usage.cvs.limit - usage.cvs.used} left on ${viewer.plan.name}.`
            }
          />
          <StatTile
            label="Downloads"
            icon={<Download size={14} aria-hidden />}
            value={
              usage.downloads.limit === null
                ? usage.downloads.used
                : `${usage.downloads.used} / ${usage.downloads.limit}`
            }
            meter={usage.downloads}
            hint={
              usage.downloads.limit === null
                ? 'Unlimited PDF exports.'
                : `Resets ${formatDateTime(usage.downloads.resetsOn)}.`
            }
          />
          <StatTile
            label="Plan"
            icon={<Wallet size={14} aria-hidden />}
            value={usage.planName}
            hint={
              viewer.isPremium
                ? viewer.profile.entitlement.currentPeriodEnd
                  ? `Renews ${formatDateTime(viewer.profile.entitlement.currentPeriodEnd)}.`
                  : 'Permanent access — no renewal.'
                : 'Free forever, with limits.'
            }
          />
          <StatTile
            label="Avg. completeness"
            icon={<CircleGauge size={14} aria-hidden />}
            value={summaries.length === 0 ? '—' : `${averageCompleteness}%`}
            meter={summaries.length === 0 ? undefined : { used: averageCompleteness, limit: 100 }}
            hint={
              summaries.length === 0
                ? 'Create a CV to start tracking this.'
                : 'Across every CV in your account.'
            }
          />
        </section>

        {atDownloadLimit ? (
          <Alert
            tone="warning"
            title="You have used every download this month"
            action={
              <ButtonLink href="/pricing" size="sm">
                See plans
              </ButtonLink>
            }
          >
            The counter resets on {formatDateTime(usage.downloads.resetsOn)}. Pro removes the
            limit entirely.
          </Alert>
        ) : null}

        {gaps.length > 0 && weakestDocument ? (
          <section
            aria-labelledby="finish-heading"
            className="rounded-xl border border-ink-200 bg-white p-5 shadow-card"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 id="finish-heading" className="text-base font-semibold text-ink-950">
                  Finish “{weakestDocument.title}”
                </h2>
                <p className="mt-1 text-sm text-ink-600">
                  It is {weakest?.completeness ?? 0}% complete. These are the biggest gaps:
                </p>
              </div>
              <ButtonLink
                href={`/dashboard/cvs/${weakestDocument.id}/edit`}
                size="sm"
                trailingIcon={<ArrowRight size={15} aria-hidden />}
              >
                Continue editing
              </ButtonLink>
            </div>

            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {gaps.map((gap) => (
                <li
                  key={gap.id}
                  className="flex items-start gap-2.5 rounded-lg bg-ink-50 px-3 py-2.5 text-[13px] leading-snug text-ink-700"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning-500" aria-hidden />
                  {gap.todo}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="recent-heading">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="recent-heading" className="text-base font-semibold text-ink-950">
              Recently edited
            </h2>
            {summaries.length > 3 ? (
              <Link
                href="/dashboard/cvs"
                className="text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                All {summaries.length} CVs
              </Link>
            ) : null}
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon={<Sparkles size={20} aria-hidden />}
              title="No CVs yet"
              description="Start blank, start from a worked example, or browse the templates first — whichever gets you writing."
              action={
                <ButtonLink href="/dashboard/cvs/new">Create my first CV</ButtonLink>
              }
              secondaryAction={
                <ButtonLink href="/dashboard/templates" variant="outline">
                  Browse templates
                </ButtonLink>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recent.map((summary) => {
                const document = documents.get(summary.id);
                if (!document) return null;
                return (
                  <CVGridCard
                    key={document.id}
                    cv={document}
                    canShare={viewer.limits.shareLinks}
                  />
                );
              })}
            </div>
          )}
        </section>

        <section aria-labelledby="start-heading">
          <h2 id="start-heading" className="mb-3 text-base font-semibold text-ink-950">
            Start a new CV
          </h2>
          {atCvLimit ? (
            <Alert
              tone="warning"
              title={`You are using all ${usage.cvs.limit} CVs the ${viewer.plan.name} plan allows`}
              action={
                <ButtonLink href="/pricing" size="sm">
                  See plans
                </ButtonLink>
              }
            >
              Delete one from <Link href="/dashboard/cvs" className="underline">My CVs</Link> to
              make room, or upgrade to Pro for unlimited CVs.
            </Alert>
          ) : null}
          <StartCVPanel atCvLimit={atCvLimit} className={atCvLimit ? 'mt-3' : undefined} />
        </section>

        <UpgradeCard plan={viewer.plan} />
      </div>
    </DashboardShell>
  );
}
