import Link from 'next/link';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';

import { ButtonLink } from '@/components/ui/button';
import { PaymentCancelledTracker } from '@/components/payments/PaymentCancelledTracker';
import { getViewer } from '@/lib/auth/guards';
import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { getPlan, isPurchasablePlan } from '@/lib/plans';
import { privateMetadata } from '@/lib/seo/metadata';
import { publicEnv } from '@/lib/env';
import { site } from '@/lib/site';

/**
 * Where PayPal sends the payer if they back out of checkout.
 *
 * Nothing has happened at this point: no order was captured, so no entitlement changed
 * and no money moved. The page says exactly that, then gets out of the way — the tracker
 * is the only client code, and it exists so an abandoned checkout is measurable.
 */

export const metadata: Metadata = privateMetadata(
  'Checkout cancelled',
  'Your PayPal checkout was cancelled. Nothing was charged.',
);

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  return trimmed.length > 0 && trimmed.length <= 64 ? trimmed : null;
}

export default async function PaymentCancelledPage(props: { searchParams: Promise<SearchParams> }) {
  const requested = firstValue((await props.searchParams).plan);
  const planId = requested && isPurchasablePlan(requested) ? requested : null;
  const plan = planId ? getPlan(planId) : null;

  /*
   * Resolved again rather than handed down: the layout's copy of it belongs to the layout,
   * and `getViewer()` is request-memoised, so this is a lookup and not a second read of the
   * session. A visitor whose session expired at PayPal still gets their cookie's language.
   */
  const viewer = await getViewer();
  const locale = resolveLocale({
    profileLocale: viewer?.profile.locale,
    cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
  });
  const copy = appCopy(locale);

  return (
    <>
      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card sm:p-9">
        <div className="flex flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-full bg-ink-100 text-ink-500">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M8.5 12h7" strokeLinecap="round" />
            </svg>
          </span>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-4xl">
            {copy.checkout.cancelledTitle}
          </h1>

          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-pretty text-ink-600">
            <strong className="font-semibold text-ink-800">
              {copy.checkout.cancelledNothingCharged}
            </strong>{' '}
            {copy.checkout.cancelledBody(plan?.name ?? null)}
          </p>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-pretty text-ink-600">
            {copy.checkout.cancelledCvsSafe}
          </p>
        </div>

        <div className="mt-8 rounded-xl bg-ink-50 p-5">
          <h2 className="text-base font-bold text-ink-950">{copy.checkout.cancelledNextHeading}</h2>
          <ol className="mt-3 flex flex-col gap-2.5 text-sm leading-relaxed text-ink-700">
            <li className="flex gap-2.5">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-600 text-2xs font-bold text-white">
                1
              </span>
              <span>
                {copy.checkout.cancelledStep1Lead}{' '}
                <Link
                  href="/pricing"
                  className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
                >
                  {copy.checkout.pricingPageLink}
                </Link>{' '}
                {copy.checkout.cancelledStep1Tail(plan?.name ?? null, publicEnv.paypalCurrency)}
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-600 text-2xs font-bold text-white">
                2
              </span>
              <span>{copy.checkout.cancelledStep2}</span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-600 text-2xs font-bold text-white">
                3
              </span>
              <span>{copy.checkout.cancelledStep3}</span>
            </li>
          </ol>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/pricing" size="lg">
            {copy.checkout.backToPricing}
          </ButtonLink>
          <ButtonLink href="/dashboard" size="lg" variant="outline">
            {copy.auth.goToDashboard}
          </ButtonLink>
        </div>

        <div className="mt-8 border-t border-ink-100 pt-5 text-center text-xs leading-relaxed text-ink-500">
          <p>
            {copy.checkout.cancelledHelpLead}{' '}
            <a
              href={`mailto:${site.supportEmail}`}
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              {site.supportEmail}
            </a>{' '}
            {copy.checkout.cancelledHelpOr}{' '}
            <Link
              href="/contact"
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              {copy.checkout.contactFormLink}
            </Link>
            . {copy.checkout.cancelledHelpTail}
          </p>
          <p className="mt-2">
            {copy.checkout.cancelledMismatchLead}{' '}
            <Link
              href="/refund-policy"
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              {copy.checkout.refundLink}
            </Link>{' '}
            {copy.checkout.cancelledMismatchTail}
          </p>
        </div>
      </div>

      <PaymentCancelledTracker planId={planId} />
    </>
  );
}
