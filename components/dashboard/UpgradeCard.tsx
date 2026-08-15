import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowRight, Check, Crown } from 'lucide-react';

import { ButtonLink } from '@/components/ui/button';
import { getViewer } from '@/lib/auth/guards';
import { PLANS } from '@/lib/plans';
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-registry';
import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { cn } from '@/lib/utils/cn';
import type { Plan } from '@/lib/plans';

/**
 * The free-plan upsell.
 *
 * Every number in it is read from `lib/plans.ts` and the template registry rather than
 * typed into the copy, so the card cannot drift away from what the plans actually grant.
 * Renders nothing for a paying customer — there is no upsell to make.
 *
 * A server component, and it has to stay one: the template registry it counts pulls all
 * 56 template components with it, none of which belong in a client bundle. So it cannot
 * reach the provider's `useCopy()` and resolves the language the way the pages do —
 * profile first, cookie second — which keeps it in step with the page it sits on.
 * `getViewer` is request-cached, so this is not a second lookup.
 */
export async function UpgradeCard({
  plan,
  className,
  variant = 'panel',
}: {
  plan: Plan;
  className?: string;
  /** `inline` is the narrower version used inside a sidebar column. */
  variant?: 'panel' | 'inline';
}) {
  if (plan.id !== 'free') return null;

  const viewer = await getViewer();
  const copy = appCopy(
    resolveLocale({
      profileLocale: viewer?.profile.locale,
      cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
    }),
  );

  const pro = PLANS.pro;
  const free = PLANS.free;

  const gains = [
    copy.dashboard.gainUnlimitedCvs(free.limits.maxCvs ?? 0),
    copy.dashboard.gainUnlimitedDownloads(free.limits.maxDownloadsPerMonth ?? 0),
    copy.dashboard.gainAllTemplates(TEMPLATE_COUNT, FREE_TEMPLATE_COUNT),
    copy.dashboard.gainCustomisation,
  ];

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-5',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-600 text-white">
          <Crown size={18} aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-ink-950">
            {copy.dashboard.upgradeHeading(
              pro.name,
              pro.price,
              copy.dashboard.billingInterval[pro.interval],
            )}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-600">{pro.tagline}</p>
        </div>
      </div>

      <ul className={cn('mt-4 grid gap-2', variant === 'panel' ? 'sm:grid-cols-2' : 'grid-cols-1')}>
        {gains.map((gain) => (
          <li key={gain} className="flex items-start gap-2 text-[13px] leading-snug text-ink-700">
            <Check size={15} className="mt-0.5 shrink-0 text-brand-600" aria-hidden />
            {gain}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <ButtonLink
          href={`/payment/checkout?plan=${pro.id}`}
          size="sm"
          trailingIcon={<ArrowRight size={15} aria-hidden />}
        >
          {copy.dashboard.getPlan(pro.name)}
        </ButtonLink>
        <p className="text-xs text-ink-500">
          {copy.dashboard.upgradeAltLead}{' '}
          <Link
            href={`/payment/checkout?plan=${PLANS.lifetime.id}`}
            className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
          >
            {copy.dashboard.upgradeLifetime(PLANS.lifetime.name, PLANS.lifetime.price)}
          </Link>
          {copy.dashboard.upgradeAltJoin}{' '}
          <Link
            href="/pricing"
            className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
          >
            {copy.dashboard.comparePlansLink}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
