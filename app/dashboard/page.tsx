import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  ArrowRight,
  CircleGauge,
  Download,
  FileText,
  Sparkles,
  Upload,
  Wallet,
} from 'lucide-react';

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
import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { privateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = privateMetadata(
  'Dashboard',
  'Your CVs, your plan usage and everything you have not finished yet.',
);

/**
 * Empty when neither the profile nor the address yields anything usable — the greeting
 * then drops the name rather than substituting a placeholder, because "Welcome back,
 * there" has no natural equivalent in French or German.
 */
function firstNameOf(displayName: string, email: string): string {
  const fromName = displayName.trim().split(/\s+/)[0];
  if (fromName) return fromName;
  const localPart = email.split('@')[0] ?? '';
  const candidate = localPart.split(/[._-]/)[0] ?? '';
  return candidate ? candidate.charAt(0).toUpperCase() + candidate.slice(1) : '';
}

export default async function DashboardOverviewPage() {
  const viewer = await requireViewer('/dashboard');
  const locale = resolveLocale({
    profileLocale: viewer.profile.locale,
    cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
  });
  const copy = appCopy(locale);

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
      : Math.round(summaries.reduce((total, cv) => total + cv.completeness, 0) / summaries.length);

  const weakestDocument =
    weakest && weakest.completeness < 100 ? documents.get(weakest.id) : undefined;
  const gaps = weakestDocument ? topGaps(weakestDocument.data, 4, copy) : [];

  const atCvLimit = usage.cvs.limit !== null && usage.cvs.used >= usage.cvs.limit;
  const atDownloadLimit =
    usage.downloads.limit !== null && usage.downloads.used >= usage.downloads.limit;

  const firstName = firstNameOf(
    viewer.profile.displayName || viewer.user.displayName,
    viewer.user.email,
  );

  return (
    <DashboardShell
      viewer={viewer}
      title={
        summaries.length === 0
          ? copy.dashboard.greetingNew(firstName)
          : copy.dashboard.greeting(firstName)
      }
      description={
        summaries.length === 0
          ? copy.dashboard.overviewLedeEmpty
          : copy.dashboard.overviewLede(summaries.length)
      }
      /*
        Import shows on an empty account too, where "View all CVs" does not.
        An account with nothing in it is the likeliest place for someone holding a finished
        CV they want to bring over, so hiding every action until they have made one first is
        exactly backwards.
      */
      actions={
        <>
          <ButtonLink
            href="/dashboard/cvs/import"
            variant="outline"
            size="sm"
            leadingIcon={<Upload size={15} aria-hidden />}
          >
            {copy.importCv.title}
          </ButtonLink>
          {summaries.length > 0 ? (
            <ButtonLink href="/dashboard/cvs" variant="outline" size="sm">
              {copy.dashboard.viewAllCvs}
            </ButtonLink>
          ) : null}
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <section
          aria-label={copy.dashboard.planUsage}
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          <StatTile
            label={copy.dashboard.statCvsSaved}
            icon={<FileText size={14} aria-hidden />}
            value={
              usage.cvs.limit === null ? usage.cvs.used : `${usage.cvs.used} / ${usage.cvs.limit}`
            }
            meter={usage.cvs}
            hint={
              usage.cvs.limit === null
                ? copy.dashboard.unlimitedOnPlan
                : atCvLimit
                  ? copy.dashboard.atCvLimitHint
                  : copy.dashboard.cvsLeftOnPlan(usage.cvs.limit - usage.cvs.used, viewer.plan.name)
            }
          />
          <StatTile
            label={copy.dashboard.statDownloads}
            icon={<Download size={14} aria-hidden />}
            value={
              usage.downloads.limit === null
                ? usage.downloads.used
                : `${usage.downloads.used} / ${usage.downloads.limit}`
            }
            meter={usage.downloads}
            hint={
              usage.downloads.limit === null
                ? copy.dashboard.unlimitedExports
                : copy.dashboard.resetsOn(formatDateTime(usage.downloads.resetsOn, locale))
            }
          />
          <StatTile
            label={copy.dashboard.statPlan}
            icon={<Wallet size={14} aria-hidden />}
            value={usage.planName}
            hint={
              viewer.isPremium
                ? viewer.profile.entitlement.currentPeriodEnd
                  ? copy.dashboard.renewsOn(
                      formatDateTime(viewer.profile.entitlement.currentPeriodEnd, locale),
                    )
                  : copy.dashboard.permanentAccess
                : copy.dashboard.freeForever
            }
          />
          <StatTile
            label={copy.dashboard.statCompleteness}
            icon={<CircleGauge size={14} aria-hidden />}
            value={summaries.length === 0 ? '—' : `${averageCompleteness}%`}
            meter={summaries.length === 0 ? undefined : { used: averageCompleteness, limit: 100 }}
            hint={
              summaries.length === 0
                ? copy.dashboard.completenessNoData
                : copy.dashboard.completenessAcrossCvs
            }
          />
        </section>

        {atDownloadLimit ? (
          <Alert
            tone="warning"
            title={copy.dashboard.downloadLimitTitle}
            action={
              <ButtonLink href="/pricing" size="sm">
                {copy.dashboard.seePlans}
              </ButtonLink>
            }
          >
            {copy.dashboard.downloadLimitBody(formatDateTime(usage.downloads.resetsOn, locale))}
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
                  {copy.dashboard.finishHeading(weakestDocument.title)}
                </h2>
                <p className="mt-1 text-sm text-ink-600">
                  {copy.dashboard.finishLede(weakest?.completeness ?? 0)}
                </p>
              </div>
              <ButtonLink
                href={`/dashboard/cvs/${weakestDocument.id}/edit`}
                size="sm"
                trailingIcon={<ArrowRight size={15} aria-hidden />}
              >
                {copy.dashboard.continueEditing}
              </ButtonLink>
            </div>

            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {gaps.map((gap) => (
                <li
                  key={gap.id}
                  className="flex items-start gap-2.5 rounded-lg bg-ink-50 px-3 py-2.5 text-[13px] leading-snug text-ink-700"
                >
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning-500"
                    aria-hidden
                  />
                  {gap.todo}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="recent-heading">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="recent-heading" className="text-base font-semibold text-ink-950">
              {copy.dashboard.recentlyEdited}
            </h2>
            {summaries.length > 3 ? (
              <Link
                href="/dashboard/cvs"
                className="text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                {copy.dashboard.allCvsCount(summaries.length)}
              </Link>
            ) : null}
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon={<Sparkles size={20} aria-hidden />}
              title={copy.dashboard.noCvsYet}
              description={copy.dashboard.noCvsBody}
              action={
                <ButtonLink href="/dashboard/cvs/new">{copy.dashboard.createFirst}</ButtonLink>
              }
              secondaryAction={
                <ButtonLink href="/dashboard/templates" variant="outline">
                  {copy.dashboard.browseTemplates}
                </ButtonLink>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recent.map((summary) => {
                const document = documents.get(summary.id);
                if (!document) return null;
                return (
                  <CVGridCard key={document.id} cv={document} canShare={viewer.limits.shareLinks} />
                );
              })}
            </div>
          )}
        </section>

        <section aria-labelledby="start-heading">
          <h2 id="start-heading" className="mb-3 text-base font-semibold text-ink-950">
            {copy.dashboard.startNewCv}
          </h2>
          {atCvLimit ? (
            <Alert
              tone="warning"
              title={copy.dashboard.cvLimitTitle(usage.cvs.limit ?? 0, viewer.plan.name)}
              action={
                <ButtonLink href="/pricing" size="sm">
                  {copy.dashboard.seePlans}
                </ButtonLink>
              }
            >
              {copy.dashboard.cvLimitBodyLead}{' '}
              <Link href="/dashboard/cvs" className="underline">
                {copy.nav.myCvs}
              </Link>
              {copy.dashboard.cvLimitBodyTail}
            </Alert>
          ) : null}
          <StartCVPanel atCvLimit={atCvLimit} className={atCvLimit ? 'mt-3' : undefined} />
        </section>

        <UpgradeCard plan={viewer.plan} />
      </div>
    </DashboardShell>
  );
}
