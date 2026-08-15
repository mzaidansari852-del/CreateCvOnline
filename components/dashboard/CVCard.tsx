import Link from 'next/link';
import { cookies } from 'next/headers';
import { Globe } from 'lucide-react';

import { CVThumbnail } from '@/components/cv/CVThumbnail';
import { Badge, ProgressBar } from '@/components/ui/feedback';
import { CVActions } from './CVActions';
import { getViewer } from '@/lib/auth/guards';
import { completenessScore } from '@/lib/cv/sections';
import { formatRelativeTime } from '@/lib/cv/format';
import { getTemplate } from '@/lib/cv/template-registry';
import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { cn } from '@/lib/utils/cn';
import type { Locale } from '@/lib/i18n/locales';
import type { CVDocument } from '@/types/cv';

/**
 * A saved CV, rendered as a card or as a row.
 *
 * The preview is a real render of the user's own document at true page pixels, scaled
 * down — not a stored screenshot — so it can never show yesterday's content. Both
 * layouts are server components; only the action menu inside them ships JavaScript.
 */

/**
 * The language for a card.
 *
 * `useCopy()` is not available: `CVThumbnail` renders the document through
 * `react-dom/server`, so this file cannot be a client module, and a server component
 * cannot read the client context the provider sets up. It resolves the language itself
 * instead — profile first, cookie second, exactly as `app/dashboard/layout.tsx` does, so
 * a card can never end up in a different language from the page around it. Reading the
 * cookie alone would be shorter and would disagree with the page whenever the account
 * setting and the last-browsed language differ.
 *
 * `getViewer` is request-cached, so this costs one lookup per request, not one per card.
 */
async function cardLocale(): Promise<Locale> {
  const viewer = await getViewer();
  return resolveLocale({
    profileLocale: viewer?.profile.locale,
    cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
  });
}

export async function CVGridCard({
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
  const locale = await cardLocale();
  const copy = appCopy(locale);

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
        aria-label={copy.cvs.openAria(cv.title)}
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
              {copy.cvs.publicBadge}
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
              {template.name} ·{' '}
              {copy.dashboard.lastEdited(formatRelativeTime(cv.updatedAt, locale))}
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
          label={copy.dashboard.completeness}
          tone={completeness >= 80 ? 'success' : completeness >= 45 ? 'brand' : 'warning'}
          className="mt-auto"
        />
      </div>
    </article>
  );
}

export async function CVListRow({
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
  const locale = await cardLocale();
  const copy = appCopy(locale);

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
        aria-label={copy.cvs.openAria(cv.title)}
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
              {copy.cvs.publicBadge}
            </Badge>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-ink-500">
          {copy.cvs.detailLede(
            template.name,
            completeness,
            formatRelativeTime(cv.updatedAt, locale),
          )}
        </p>
        <ProgressBar
          value={completeness}
          tone={completeness >= 80 ? 'success' : completeness >= 45 ? 'brand' : 'warning'}
          showValue={false}
          ariaLabel={copy.dashboard.completeness}
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
