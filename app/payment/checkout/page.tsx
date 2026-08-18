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
import { planHighlights, planTagline } from '@/lib/i18n/copy/content';
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
 *
 * ## What this page deliberately no longer says
 *
 * It used to open with the plan's full description and a six-item feature grid. Both were
 * accurate and both were in the way: someone who has clicked "Get Pro" and signed in has
 * already been sold, and re-selling them only delays the thing they came here to do. The
 * highlights are one click away in a `<details>` for the minority who want to re-check;
 * everything else is cut to what a payer actually verifies — which account, which plan,
 * whether it renews, and how much leaves their card today.
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
  // Keyed by the plan's own cadence rather than switched on here, so a new interval cannot
  // reach the payer unlabelled in one language and labelled in another.
  const interval = copy.checkout.interval[plan.interval];
  const priceLabel = `${formatPrice(plan.price)} ${interval}`;
  const billing =
    plan.accessDays === null
      ? copy.checkout.billingOneOff
      : copy.checkout.billingRecurring(plan.accessDays);

  /*
   * Asked rather than assumed. A deployment with no gateway credentials must not render a
   * pay button — the payer would reach a 503 after committing to buy — so the page checks
   * and shows the "no payment provider" notice instead.
   */
  const gateways = availableGateways();

  // Someone who already owns Lifetime has nothing to buy; someone on Pro can still move
  // up to Lifetime, so only the strictly-pointless purchase is blocked.
  const ownsLifetime = viewer.plan.id === 'lifetime';
  const repeatPurchase = viewer.plan.id === planId && planId === 'pro';

  if (ownsLifetime) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card sm:p-9">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
          {copy.checkout.ownsLifetimeTitle(PLANS.lifetime.name)}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
          {copy.checkout.ownsLifetimeBody(PLANS.lifetime.name, plan.name)}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href="/dashboard" size="lg">
            {copy.auth.goToDashboard}
          </ButtonLink>
          <ButtonLink href="/dashboard/account" size="lg" variant="outline">
            {copy.checkout.viewAccount}
          </ButtonLink>
        </div>
      </div>
    );
  }

  /*
   * The four facts a payer checks before committing, and nothing else.
   *
   * The billing row earns its place: the other three are visible elsewhere on the site,
   * but whether money will be taken again is the question people actually hesitate on, and
   * leaving it to be inferred from "per month" is how a fixed-term purchase gets read as a
   * subscription. It is answered in words either way, not only when the answer is the
   * reassuring one.
   *
   * Built here and handed to the client component as a prop, so the figures never leave
   * the server.
   */
  const summary = (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
      <dl className="text-[13.5px]">
        <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-3">
          <dt className="text-ink-500">{copy.nav.account}</dt>
          <dd className="text-right font-medium break-all text-ink-900">{viewer.user.email}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-3">
          <dt className="text-ink-500">{copy.checkout.rowPlan}</dt>
          <dd className="text-right font-semibold text-ink-900">{plan.name}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <dt className="text-ink-500">{copy.checkout.rowBilling}</dt>
          <dd className="text-right font-medium text-ink-900">{billing}</dd>
        </div>
      </dl>

      <div className="flex items-end justify-between gap-3 bg-ink-50 px-4 py-4">
        <span className="text-sm font-extrabold text-ink-950">{copy.checkout.totalToday}</span>
        <span className="text-right">
          <span className="text-[27px] leading-none font-extrabold tracking-tight text-ink-950">
            {formatPrice(plan.price)}
          </span>
          <span className="ml-1.5 text-xs font-semibold text-ink-500">
            {publicEnv.storeCurrency}
          </span>
          <span className="mt-1 block text-[11.5px] text-ink-500">{interval}</span>
        </span>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card sm:p-8">
      <p className="text-xs font-bold tracking-[0.14em] text-brand-700 uppercase">
        {copy.checkout.stepReview}
      </p>
      <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-3xl">
        {copy.checkout.confirmPlanTitle(plan.name)}
      </h1>
      {/* The tagline, not the description: one localised line in place of a paragraph. */}
      <p className="mt-2 text-sm leading-relaxed text-pretty text-ink-500">
        {planTagline(plan, locale)}
      </p>

      {/*
        Closed by default. The customer chose this plan on the pricing page, where the same
        list was open and unavoidable; repeating it here charges every payer six lines of
        reading to serve the few who want to check.
      */}
      <details className="group mt-4">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-[12.5px] font-semibold text-brand-700 underline underline-offset-2 marker:content-none hover:text-brand-800">
          {copy.checkout.whatsIncluded}
          <svg
            className="size-3.5 transition-transform group-open:rotate-180"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="m6 9 6 6 6-6"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </summary>
        <ul className="mt-3 grid gap-2 rounded-xl border border-ink-200 bg-ink-50 p-4 sm:grid-cols-2">
          {planHighlights(plan, locale).map((highlight) => (
            <li key={highlight} className="flex gap-2 text-[13px] leading-snug text-ink-700">
              <svg
                className="mt-0.5 size-3.5 shrink-0 text-brand-600"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="m5 12.5 4.5 4.5L19 7.5"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {highlight}
            </li>
          ))}
        </ul>
      </details>

      {repeatPurchase ? (
        <Alert tone="info" title={copy.checkout.repeatTitle(plan.name)} className="mt-5">
          {/* Only Pro reaches this branch and Pro grants a fixed term, so the fallback is
              unreachable — it exists because `accessDays` is nullable for Lifetime. */}
          {copy.checkout.repeatBody(
            plan.accessDays ?? 0,
            entitlement.currentPeriodEnd
              ? copy.checkout.extendsFromDate(formatDateTime(entitlement.currentPeriodEnd, locale))
              : copy.checkout.extendsFromToday,
            site.name,
            PLANS.lifetime.name,
            formatPrice(PLANS.lifetime.price),
          )}{' '}
          <Link
            href="/payment/checkout?plan=lifetime"
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            {copy.checkout.repeatSwitch(PLANS.lifetime.name)}
          </Link>
          .
        </Alert>
      ) : null}

      <div className="mt-6">
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
            summary={summary}
          />
        ) : (
          /*
            One gateway: no picker, because a choice of one is a control that asks to be
            read and teaches nothing. The summary still sits directly above the button, so
            the total is the last thing seen either way.
          */
          <div className="flex flex-col gap-4">
            {summary}
            {gateways[0] === 'paypal' ? (
              <CheckoutButton planId={planId} planName={plan.name} priceLabel={priceLabel} />
            ) : (
              <PaddleCheckoutButton planId={planId} planName={plan.name} priceLabel={priceLabel} />
            )}
          </div>
        )}
      </div>

      <p className="mt-5 text-center text-[11.5px] leading-relaxed text-ink-500">
        {copy.checkout.termsIntro}{' '}
        <Link href="/terms" className="font-semibold text-brand-700 underline underline-offset-2">
          {copy.checkout.termsLink}
        </Link>{' '}
        {copy.checkout.termsAnd}{' '}
        <Link
          href="/refund-policy"
          className="font-semibold text-brand-700 underline underline-offset-2"
        >
          {copy.checkout.refundLink}
        </Link>
        . {copy.checkout.cardDetailsNote}
      </p>
    </div>
  );
}
