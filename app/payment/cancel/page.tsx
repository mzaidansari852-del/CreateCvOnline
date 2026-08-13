import Link from 'next/link';
import type { Metadata } from 'next';

import { ButtonLink } from '@/components/ui/button';
import { PaymentCancelledTracker } from '@/components/payments/PaymentCancelledTracker';
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

export default async function PaymentCancelledPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const requested = firstValue((await props.searchParams).plan);
  const planId = requested && isPurchasablePlan(requested) ? requested : null;
  const plan = planId ? getPlan(planId) : null;

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
            Checkout cancelled
          </h1>

          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-pretty text-ink-600">
            <strong className="font-semibold text-ink-800">Nothing was charged.</strong> You
            left PayPal before approving the payment, so no order was completed
            {plan ? ` and ${plan.name} has not been added to your account` : ''}. Your account
            is exactly as it was a minute ago.
          </p>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-pretty text-ink-600">
            Every CV you have written is still there, still editable, and still downloadable
            within your current plan&apos;s allowance.
          </p>
        </div>

        <div className="mt-8 rounded-xl bg-ink-50 p-5">
          <h2 className="text-base font-bold text-ink-950">Picking up where you left off</h2>
          <ol className="mt-3 flex flex-col gap-2.5 text-sm leading-relaxed text-ink-700">
            <li className="flex gap-2.5">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-600 text-2xs font-bold text-white">
                1
              </span>
              <span>
                Open the <Link
                  href="/pricing"
                  className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
                >
                  pricing page
                </Link>{' '}
                and choose {plan ? `${plan.name} again, or the other plan` : 'a plan'}. Prices
                are in {publicEnv.paypalCurrency} and are shown in full before you are sent to
                PayPal.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-600 text-2xs font-bold text-white">
                2
              </span>
              <span>
                Approve the payment on PayPal. You can pay with a PayPal balance, a linked
                bank account, or a debit or credit card — a PayPal account is not required.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-600 text-2xs font-bold text-white">
                3
              </span>
              <span>
                You land back here and the plan is unlocked once our server has confirmed the
                order with PayPal. It takes a couple of seconds.
              </span>
            </li>
          </ol>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/pricing" size="lg">
            Back to pricing
          </ButtonLink>
          <ButtonLink href="/dashboard" size="lg" variant="outline">
            Go to my dashboard
          </ButtonLink>
        </div>

        <div className="mt-8 border-t border-ink-100 pt-5 text-center text-xs leading-relaxed text-ink-500">
          <p>
            Cancelled because something looked wrong, or because PayPal would not complete?
            Tell us at{' '}
            <a
              href={`mailto:${site.supportEmail}`}
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              {site.supportEmail}
            </a>{' '}
            or through the{' '}
            <Link
              href="/contact"
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              contact form
            </Link>
            . We would rather fix a broken checkout than lose the sale quietly.
          </p>
          <p className="mt-2">
            If money did leave your account despite this page, that is a mismatch we want to
            know about immediately — e-mail us with your PayPal transaction id and we will
            grant the plan or refund it the same day. Our{' '}
            <Link
              href="/refund-policy"
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              refund policy
            </Link>{' '}
            covers it either way.
          </p>
        </div>
      </div>

      <PaymentCancelledTracker planId={planId} />
    </>
  );
}
