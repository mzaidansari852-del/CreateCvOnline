import { cache } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, ExternalLink, Minus } from 'lucide-react';

import { CVPagePreview } from '@/components/cv/CVThumbnail';
import { CVActions } from '@/components/dashboard/CVActions';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { completenessChecklist } from '@/components/dashboard/completeness';
import { ButtonLink } from '@/components/ui/button';
import { Badge, ProgressBar } from '@/components/ui/feedback';
import { getViewer, requireViewer } from '@/lib/auth/guards';
import { findCV } from '@/lib/db/cvs';
import { completenessScore } from '@/lib/cv/sections';
import { formatDateTime, formatRelativeTime, PAPER } from '@/lib/cv/format';
import { getTemplate } from '@/lib/cv/template-registry';
import { privateMetadata } from '@/lib/seo/metadata';
import { absoluteUrl } from '@/lib/site';
import { cn } from '@/lib/utils/cn';

/** Memoised for the request so `generateMetadata` and the page share one read. */
const loadCV = cache(async (uid: string, cvId: string) => findCV(uid, cvId));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const viewer = await getViewer();
  if (!viewer) return privateMetadata('CV');

  const { id } = await params;
  const cv = await loadCV(viewer.user.uid, id);
  return privateMetadata(cv ? cv.title : 'CV not found', 'A read-only preview of your CV.');
}

export default async function CVDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireViewer('/dashboard/cvs');
  const { id } = await params;

  const cv = await loadCV(viewer.user.uid, id);
  if (!cv) notFound();

  const template = getTemplate(cv.customization.templateId);
  const checklist = completenessChecklist(cv.data);
  const score = completenessScore(cv.data);
  const shareUrl = cv.isPublic && cv.shareId ? absoluteUrl(`/cv/${cv.shareId}`) : null;

  const facts: { label: string; value: React.ReactNode }[] = [
    {
      label: 'Template',
      value: (
        <span className="flex flex-wrap items-center gap-1.5">
          {template.name}
          {template.premium ? <Badge tone="accent">Pro</Badge> : <Badge tone="success">Free</Badge>}
        </span>
      ),
    },
    { label: 'Paper', value: PAPER[cv.customization.paperSize].label },
    { label: 'Created', value: formatDateTime(cv.createdAt) },
    {
      label: 'Last edited',
      value: `${formatRelativeTime(cv.updatedAt)} · ${formatDateTime(cv.updatedAt)}`,
    },
    {
      label: 'PDF downloads',
      value:
        cv.downloadCount === 0
          ? 'Never downloaded'
          : `${cv.downloadCount} · last ${cv.lastDownloadedAt ? formatRelativeTime(cv.lastDownloadedAt) : 'unknown'}`,
    },
    {
      label: 'Visibility',
      value: cv.isPublic ? <Badge tone="success">Public link on</Badge> : 'Private',
    },
  ];

  return (
    <DashboardShell
      viewer={viewer}
      title={cv.title}
      description={`${template.name} · ${score}% complete · edited ${formatRelativeTime(cv.updatedAt)}`}
      actions={
        <CVActions
          cv={{ id: cv.id, title: cv.title, isPublic: cv.isPublic, shareId: cv.shareId }}
          canShare={viewer.limits.shareLinks}
          layout="bar"
          afterDelete="redirect"
        />
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-label="CV preview" className="flex justify-center lg:justify-start">
          <div className="sm:hidden">
            <CVPagePreview cv={cv.data} customization={cv.customization} maxWidth={300} />
          </div>
          <div className="hidden sm:block">
            <CVPagePreview cv={cv.data} customization={cv.customization} maxWidth={520} />
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <section
            aria-labelledby="details-heading"
            className="rounded-xl border border-ink-200 bg-white p-5 shadow-card"
          >
            <h2 id="details-heading" className="text-base font-semibold text-ink-950">
              Details
            </h2>
            <dl className="mt-3 flex flex-col gap-2.5 text-sm">
              {facts.map((fact) => (
                <div key={fact.label} className="flex flex-wrap items-baseline justify-between gap-2">
                  <dt className="text-ink-500">{fact.label}</dt>
                  <dd className="text-right font-medium text-ink-900">{fact.value}</dd>
                </div>
              ))}
            </dl>

            {shareUrl ? (
              <div className="mt-4 rounded-lg bg-ink-50 p-3">
                <p className="text-xs font-semibold text-ink-700">Public link</p>
                <Link
                  href={`/cv/${cv.shareId}`}
                  className="mt-1 flex items-start gap-1.5 font-mono text-[11px] break-all text-brand-700 hover:text-brand-800"
                >
                  {shareUrl}
                  <ExternalLink size={12} aria-hidden className="mt-0.5 shrink-0" />
                </Link>
                <p className="mt-1.5 text-[11px] text-ink-500">
                  Use the Share action to copy or switch it off.
                </p>
              </div>
            ) : null}
          </section>

          <section
            aria-labelledby="completeness-heading"
            className="rounded-xl border border-ink-200 bg-white p-5 shadow-card"
          >
            <h2 id="completeness-heading" className="text-base font-semibold text-ink-950">
              Completeness
            </h2>
            <ProgressBar
              value={score}
              tone={score >= 80 ? 'success' : score >= 45 ? 'brand' : 'warning'}
              label="Overall"
              className="mt-3"
            />

            <ul className="mt-4 flex flex-col gap-1.5">
              {checklist.map((check) => (
                <li
                  key={check.id}
                  className={cn(
                    'flex items-start gap-2 text-[13px] leading-snug',
                    check.satisfied ? 'text-ink-500' : 'text-ink-800',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 grid size-4 shrink-0 place-items-center rounded-full',
                      check.satisfied
                        ? 'bg-success-100 text-success-700'
                        : 'bg-warning-100 text-warning-700',
                    )}
                    aria-hidden
                  >
                    {check.satisfied ? <Check size={11} /> : <Minus size={11} />}
                  </span>
                  <span>
                    {check.satisfied ? check.done : check.todo}
                    <span className="sr-only">{check.satisfied ? ' — done' : ' — missing'}</span>
                  </span>
                </li>
              ))}
            </ul>

            {score < 100 ? (
              <ButtonLink
                href={`/dashboard/cvs/${cv.id}/edit`}
                size="sm"
                variant="outline"
                fullWidth
                className="mt-4"
              >
                Fix these in the editor
              </ButtonLink>
            ) : null}
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
