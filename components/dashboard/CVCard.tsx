import Link from 'next/link';
import { Globe } from 'lucide-react';

import { CVThumbnail } from '@/components/cv/CVThumbnail';
import { Badge, ProgressBar } from '@/components/ui/feedback';
import { CVActions } from './CVActions';
import { completenessScore } from '@/lib/cv/sections';
import { formatRelativeTime } from '@/lib/cv/format';
import { getTemplate } from '@/lib/cv/template-registry';
import { cn } from '@/lib/utils/cn';
import type { CVDocument } from '@/types/cv';

/**
 * A saved CV, rendered as a card or as a row.
 *
 * The preview is a real render of the user's own document at true page pixels, scaled
 * down — not a stored screenshot — so it can never show yesterday's content. Both
 * layouts are server components; only the action menu inside them ships JavaScript.
 */

export function CVGridCard({
  cv,
  canShare,
  className,
}: {
  cv: CVDocument;
  canShare: boolean;
  className?: string;
}) {
  const template = getTemplate(cv.customization.templateId);
  const completeness = completenessScore(cv.data);

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card transition-shadow hover:shadow-card-hover',
        className,
      )}
    >
      <Link
        href={`/dashboard/cvs/${cv.id}`}
        className="relative block overflow-hidden bg-ink-100"
        aria-label={`Open ${cv.title}`}
      >
        <CVThumbnail
          cv={cv.data}
          customization={cv.customization}
          width={260}
          crop={1.3}
          rounded={false}
          shadow={false}
          className="mx-auto"
        />
        {cv.isPublic ? (
          <span className="absolute top-2 right-2">
            <Badge tone="success">
              <Globe size={11} aria-hidden />
              Public
            </Badge>
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold text-ink-950">
              <Link href={`/dashboard/cvs/${cv.id}`} className="hover:text-brand-700">
                {cv.title}
              </Link>
            </h3>
            <p className="mt-0.5 truncate text-xs text-ink-500">
              {template.name} · edited {formatRelativeTime(cv.updatedAt)}
            </p>
          </div>
          <CVActions
            cv={{ id: cv.id, title: cv.title, isPublic: cv.isPublic, shareId: cv.shareId }}
            canShare={canShare}
            className="shrink-0"
          />
        </div>

        <ProgressBar
          value={completeness}
          label="Complete"
          tone={completeness >= 80 ? 'success' : completeness >= 45 ? 'brand' : 'warning'}
          className="mt-auto"
        />
      </div>
    </article>
  );
}

export function CVListRow({
  cv,
  canShare,
  className,
}: {
  cv: CVDocument;
  canShare: boolean;
  className?: string;
}) {
  const template = getTemplate(cv.customization.templateId);
  const completeness = completenessScore(cv.data);

  return (
    <article
      className={cn(
        'flex items-center gap-4 rounded-xl border border-ink-200 bg-white p-3 shadow-card transition-shadow hover:shadow-card-hover',
        className,
      )}
    >
      <Link
        href={`/dashboard/cvs/${cv.id}`}
        className="hidden shrink-0 overflow-hidden rounded-lg bg-ink-100 sm:block"
        aria-label={`Open ${cv.title}`}
      >
        <CVThumbnail
          cv={cv.data}
          customization={cv.customization}
          width={64}
          crop={0.78}
          rounded={false}
          shadow={false}
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-[15px] font-semibold text-ink-950">
            <Link href={`/dashboard/cvs/${cv.id}`} className="hover:text-brand-700">
              {cv.title}
            </Link>
          </h3>
          {cv.isPublic ? (
            <Badge tone="success">
              <Globe size={11} aria-hidden />
              Public
            </Badge>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-ink-500">
          {template.name} · edited {formatRelativeTime(cv.updatedAt)} · {completeness}% complete
        </p>
        <ProgressBar
          value={completeness}
          tone={completeness >= 80 ? 'success' : completeness >= 45 ? 'brand' : 'warning'}
          showValue={false}
          className="mt-2 max-w-64"
        />
      </div>

      <CVActions
        cv={{ id: cv.id, title: cv.title, isPublic: cv.isPublic, shareId: cv.shareId }}
        canShare={canShare}
        className="shrink-0"
      />
    </article>
  );
}
