import Link from 'next/link';
import { ArrowRight, Check, Crown } from 'lucide-react';

import { ButtonLink } from '@/components/ui/button';
import { PLANS } from '@/lib/plans';
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-registry';
import { cn } from '@/lib/utils/cn';
import type { Plan } from '@/lib/plans';

/**
 * The free-plan upsell.
 *
 * Every number in it is read from `lib/plans.ts` and the template registry rather than
 * typed into the copy, so the card cannot drift away from what the plans actually grant.
 * Renders nothing for a paying customer — there is no upsell to make.
 */
export function UpgradeCard({
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

  const pro = PLANS.pro;
  const free = PLANS.free;

  const gains = [
    `Unlimited CVs instead of ${free.limits.maxCvs}`,
    `Unlimited PDF downloads instead of ${free.limits.maxDownloadsPerMonth} a month`,
    `All ${TEMPLATE_COUNT} templates instead of ${FREE_TEMPLATE_COUNT}`,
    'Fonts, spacing, custom sections and a public share link',
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
            Upgrade to {pro.name} — ${pro.price}/{pro.interval}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-600">{pro.tagline}</p>
        </div>
      </div>

      <ul
        className={cn(
          'mt-4 grid gap-2',
          variant === 'panel' ? 'sm:grid-cols-2' : 'grid-cols-1',
        )}
      >
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
          Get {pro.name}
        </ButtonLink>
        <p className="text-xs text-ink-500">
          Or{' '}
          <Link
            href={`/payment/checkout?plan=${PLANS.lifetime.id}`}
            className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
          >
            {PLANS.lifetime.name.toLowerCase()} access once for ${PLANS.lifetime.price}
          </Link>
          , or{' '}
          <Link
            href="/pricing"
            className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
          >
            compare the plans
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
