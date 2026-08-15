import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { CheckoutButton } from '@/components/payments/CheckoutButton';
import { CheckoutMethodChoice } from '@/components/payments/CheckoutMethodChoice';
import { PaddleCheckoutButton } from '@/components/payments/PaddleCheckoutButton';
import { ButtonLink } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { requireViewer } from '@/lib/auth/guards';
import { appCopy } from '@/lib/i18n/app-copy';
import { planHighlights } from '@/lib/i18n/copy/content';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { availableGateways } from '@/lib/payments';
import { publicEnv } from '@/lib/env';
import { formatDateTime } from '@/lib/cv/format';
import { getPlan, isPurchasablePlan, PLANS } from '@/lib/plans';
import { privateMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';
import type { PlanId } from '@/types/user';

/**
 * The order summary shown before the payer commits.
 *
 * This page is the missing half of the checkout: `/payment/success` handles the outcome,
 * and this handles getting there. It is deliberately server-rendered and authenticated —
 * `requireViewer` bounces a signed-out visitor to `/login?next=…` and brings them straight
 * back here afterwards, which is why the pricing page can stay fully static and still have
 * a working "Get Pro" button.
 *
 * Nothing here decides a price. The figures are read from `lib/plans.ts` purely to show
 * the payer what they are about to agree to; what the gateway actually charges is looked
 * up again, server-side, when the order or transaction is created.
 *
 * Which gateway is offered is also decided here rather than in the browser. The client is
 * told what it may use; it does not get to nominate one.
 */

export const metadata: Metadata = privateMetadata('Checkout', 'Review your plan before you pay.');

const currencySymbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', MAD: 'MAD ' };

/**
 * Prices are quoted in the store's currency, not a gateway's. `paypalCurrency` used to
 * stand in for both, which stopped being true the moment a second gateway read it.
 */
function formatPrice(value: string): string {
  const symbol = currencySymbols[publicEnv.storeCurrency] ?? `${publicEnv.storeCurrency} `;
  const amount = Number.parseFloat(value);
  return `${symbol}${Number.isInteger(amount) ? String(amount) : amount.toFixed(2)}`;
}

function intervalLabel(interval: string): string {
  switch (interval) {
    case 'month':
      return 'per month';
    case 'year':
      return 'per year';
    case 'one-time':
      return 'one-time payment';
    default:
      return interval;
  }
}

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  return trimmed.length > 0 && trimmed.length <= 32 ? trimmed : null;
}

export default async function CheckoutPage(props: { searchParams: Promise<SearchParams> }) {
  const requested = firstValue((await props.searchParams).plan);

  // An unknown or missing plan is a broken link, not an error worth a page of prose.
  if (!requested || !isPurchasablePlan(requested)) redirect('/pricing');

  const planId = requested as PlanId;
  const plan = getPlan(planId);
  const viewer = await requireViewer(`/payment/checkout?plan=${planId}`);
  const locale = resolveLocale({
    profileLocale: viewer.profile.locale,
    cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
  });

  const copy = appCopy(locale);
  const { entitlement } = viewer.profile;
  const priceLabel = `${formatPrice(plan.price)} ${intervalLabel(plan.interval)}`;

  /*
   * `availableGateways()` reports what the *server* can talk to. Paddle needs a second
   * thing the server never uses — its public client token in the browser — and the two are
   * configured independently, so a deployment with the API key and no
   * `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` would render a button whose overlay can never open.
   * Dropping it here means the payer sees the gateway that works rather than the one that
   * is half-installed.
   */
  const gateways = availableGateways().filter(
    (id) => id !== 'paddle' || publicEnv.paddleClientToken.length > 0,
  );

  // Someone who already owns Lifetime has nothing to buy; someone on Pro can still move
  // up to Lifetime, so only the strictly-pointless purchase is blocked.
  const ownsLifetime = viewer.plan.id === 'lifetime';
  const repeatPurchase = viewer.plan.id === planId && planId === 'pro';

  if (ownsLifetime) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card sm:p-9">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
          You already have Lifetime
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
          Lifetime access never expires and already includes everything in {plan.name}, so there is
          nothing here for you to pay for. We would rather say that than take the money.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href="/dashboard" size="lg">
            Go to my dashboard
          </ButtonLink>
          <ButtonLink href="/dashboard/account" size="lg" variant="outline">
            View my account
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card sm:p-9">
      <p className="text-xs font-bold tracking-[0.14em] text-brand-700 uppercase">
        Step 1 of 3 · Review
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-4xl">
        Confirm your {plan.name} plan
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-pretty text-ink-600">
        {plan.description}
      </p>

      {repeatPurchase ? (
        <Alert tone="info" title="You are already on Pro" className="mt-6">
          Paying again extends your access by another {plan.accessDays} days from{' '}
          {entitlement.currentPeriodEnd ? formatDateTime(entitlement.currentPeriodEnd) : 'today'}.
          If you expect to keep using CreateCVOnline, {PLANS.lifetime.name} at{' '}
          {formatPrice(PLANS.lifetime.price)} works out cheaper after eight months —{' '}
          <Link
            href="/payment/checkout?plan=lifetime"
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            switch to Lifetime
          </Link>
          .
        </Alert>
      ) : null}

      <div className="mt-7 rounded-xl border border-ink-200 bg-ink-50 p-5">
        <h2 className="text-sm font-bold tracking-wide text-ink-500 uppercase">Order summary</h2>

        <dl className="mt-4 flex flex-col divide-y divide-ink-200">
          <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3">
            <dt className="text-sm text-ink-600">Plan</dt>
            <dd className="text-sm font-semibold text-ink-950">{plan.name}</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 py-3">
            <dt className="text-sm text-ink-600">Billing</dt>
            <dd className="text-sm font-medium text-ink-900">
              {plan.accessDays === null
                ? 'One payment, no renewal'
                : `Every ${plan.accessDays} days, cancel any time`}
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 py-3">
            <dt className="text-sm text-ink-600">Account</dt>
            <dd className="text-sm font-medium break-all text-ink-900">{viewer.user.email}</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 pt-3">
            <dt className="text-base font-semibold text-ink-950">Total today</dt>
            <dd className="text-right">
              <span className="text-2xl font-extrabold tracking-tight text-ink-950">
                {formatPrice(plan.price)}
              </span>
              <span className="ml-1.5 text-sm text-ink-500">{publicEnv.storeCurrency}</span>
              <span className="block text-xs text-ink-500">{intervalLabel(plan.interval)}</span>
            </dd>
          </div>
        </dl>
      </div>

      <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
        {planHighlights(plan, locale).map((highlight) => (
          <li key={highlight} className="flex gap-2.5 text-sm leading-snug text-ink-700">
            <svg
              className="mt-0.5 size-4 shrink-0 text-brand-600"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="m5 12.5 4.5 4.5L19 7.5"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {highlight}
          </li>
        ))}
      </ul>

      <div className="mt-8">
        {gateways.length === 0 ? (
          <Alert tone="danger" title={copy.checkout.unavailableTitle}>
            {copy.checkout.unavailableBody(site.supportEmail)}
          </Alert>
        ) : gateways.length > 1 ? (
          <CheckoutMethodChoice
            planId={planId}
            planName={plan.name}
            priceLabel={priceLabel}
            defaultMethod={gateways[0] === 'paypal' ? 'paypal' : 'paddle'}
          />
        ) : gateways[0] === 'paypal' ? (
          <CheckoutButton planId={planId} planName={plan.name} priceLabel={priceLabel} />
        ) : (
          <PaddleCheckoutButton planId={planId} planName={plan.name} priceLabel={priceLabel} />
        )}
      </div>

      <div className="mt-7 border-t border-ink-100 pt-5 text-center text-xs leading-relaxed text-ink-500">
        <p>
          By continuing you agree to our{' '}
          <Link href="/terms" className="font-medium text-brand-700 underline underline-offset-2">
            terms
          </Link>{' '}
          and{' '}
          <Link
            href="/refund-policy"
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            refund policy
          </Link>
          . We never see or store your card details — the payment provider handles that entirely.
        </p>
        <p className="mt-2">
          Changed your mind?{' '}
          <Link href="/pricing" className="font-medium text-brand-700 underline underline-offset-2">
            Compare the plans again
          </Link>{' '}
          or write to{' '}
          <a
            href={`mailto:${site.supportEmail}`}
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            {site.supportEmail}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
