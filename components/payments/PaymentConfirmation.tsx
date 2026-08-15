'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import { useLocale } from '@/components/i18n/LocaleProvider';
import { Button, ButtonLink, Spinner } from '@/components/ui/button';
import { planHighlights } from '@/lib/i18n/copy/content';
import { Alert } from '@/components/ui/feedback';
import { trackEvent } from '@/lib/analytics/events';
import { publicEnv } from '@/lib/env';
import { getPlan, isPurchasablePlan } from '@/lib/plans';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils/cn';

/**
 * Confirms a PayPal payment.
 *
 * The page this lives on grants nothing. Coming back from PayPal only means the payer
 * pressed a button on PayPal's site, so the single thing this component does is ask our
 * own server to capture the order — and the server re-checks the order, the amount and
 * the currency against PayPal before it changes any entitlement.
 *
 * PayPal returns the order id in the `token` query parameter.
 */

type Phase = 'verifying' | 'success' | 'already' | 'failed';

interface CaptureResponse {
  status?: string;
  planId?: string;
  alreadyFulfilled?: boolean;
}

interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

interface Failure {
  message: string;
  /** What the user should do next, in one sentence. */
  nextStep: string;
  retryable: boolean;
}

export function PaymentConfirmation({
  orderId,
  planHint,
}: {
  /** From `?token=` — PayPal's order id. `null` when the link was opened by hand. */
  orderId: string | null;
  /** From `?plan=` — used only for the heading before the server confirms. */
  planHint: string | null;
}) {
  const locale = useLocale();
  const [phase, setPhase] = useState<Phase>(orderId ? 'verifying' : 'failed');
  const [planId, setPlanId] = useState<string | null>(
    planHint && isPurchasablePlan(planHint) ? planHint : null,
  );
  const [failure, setFailure] = useState<Failure | null>(
    orderId
      ? null
      : {
          message: 'This confirmation link is missing its payment reference.',
          nextStep:
            'Open your PayPal receipt and follow the link in it, or start the purchase again from the pricing page.',
          retryable: false,
        },
  );
  const [attempt, setAttempt] = useState(0);
  /** Guards against React's double-invoked effects in development. */
  const lastCapturedKey = useRef<string | null>(null);

  const capture = useCallback(async (id: string) => {
    setPhase('verifying');
    setFailure(null);

    try {
      const response = await fetch('/api/payments/paypal/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id }),
      });

      const payload = (await response.json().catch(() => null)) as
        (CaptureResponse & ApiErrorBody) | null;

      if (!response.ok) {
        const code = payload?.error?.code ?? 'payment-failed';
        setFailure({
          message: payload?.error?.message ?? 'We could not confirm this payment with PayPal.',
          nextStep:
            code === 'unauthenticated'
              ? 'Sign in with the account you used to buy, then open this page again — nothing is lost.'
              : code === 'unknown-order'
                ? `Send us your PayPal transaction id at ${site.supportEmail} and we will sort it out the same day.`
                : `If money left your account, e-mail ${site.supportEmail} with your PayPal transaction id and we will fix it or refund it.`,
          retryable: code !== 'amount-mismatch' && code !== 'unknown-order',
        });
        setPhase('failed');
        trackEvent('payment_failed', { reason: code });
        return;
      }

      const resolvedPlan = payload?.planId ?? null;
      if (resolvedPlan) setPlanId(resolvedPlan);

      if (payload?.alreadyFulfilled) {
        setPhase('already');
        return;
      }

      setPhase('success');
      const plan = getPlan(resolvedPlan ?? 'free');
      trackEvent('payment_completed', {
        plan: plan.id,
        value: Number.parseFloat(plan.price),
        currency: publicEnv.paypalCurrency,
      });
    } catch {
      setFailure({
        message: 'We could not reach our server to confirm the payment.',
        nextStep:
          'Check your connection and press “Try again”. Your payment is safe either way — nothing is granted or charged twice.',
        retryable: true,
      });
      setPhase('failed');
      trackEvent('payment_failed', { reason: 'network' });
    }
  }, []);

  useEffect(() => {
    if (!orderId) return;
    // React runs effects twice in development. Capturing twice is harmless on the server
    // (fulfilment is idempotent) but it would show a first-time buyer the "already
    // confirmed" state, which reads as a bug.
    const key = `${orderId}:${attempt}`;
    if (lastCapturedKey.current === key) return;
    lastCapturedKey.current = key;
    void capture(orderId);
  }, [orderId, attempt, capture]);

  if (phase === 'verifying') {
    return (
      <Panel>
        <div className="flex flex-col items-center gap-4 text-center">
          <Spinner size={32} className="text-brand-600" />
          <h2 className="text-xl font-bold text-ink-950">Confirming your payment…</h2>
          <p className="max-w-md text-sm leading-relaxed text-ink-600">
            We are checking the order with PayPal before we unlock anything. This normally takes a
            couple of seconds — please do not close this tab.
          </p>
        </div>
      </Panel>
    );
  }

  if (phase === 'failed') {
    return (
      <Panel tone="danger">
        <h2 className="text-xl font-bold text-ink-950">We could not confirm that payment</h2>
        <Alert tone="danger" className="mt-4">
          {failure?.message}
        </Alert>
        <p className="mt-4 text-sm leading-relaxed text-ink-700">{failure?.nextStep}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {failure?.retryable && orderId ? (
            <Button onClick={() => setAttempt((value) => value + 1)}>Try again</Button>
          ) : null}
          <ButtonLink href="/pricing" variant="outline">
            Back to pricing
          </ButtonLink>
          <ButtonLink href={`mailto:${site.supportEmail}`} variant="ghost">
            E-mail {site.supportEmail}
          </ButtonLink>
        </div>
        {orderId ? (
          <p className="mt-6 text-xs text-ink-500">
            Quote this reference if you contact us: <code className="font-mono">{orderId}</code>
          </p>
        ) : null}
      </Panel>
    );
  }

  const plan = getPlan(planId ?? 'pro');
  const alreadyHad = phase === 'already';

  return (
    <Panel tone="success">
      <div className="flex flex-col items-center text-center">
        <span className="grid size-14 place-items-center rounded-full bg-success-50 text-success-600 ring-1 ring-success-500/25">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-ink-950">
          {alreadyHad ? `${plan.name} is already active` : `You are on ${plan.name}`}
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-600">
          {alreadyHad
            ? 'This order was already confirmed, so we have not charged or granted anything twice. Everything below is available on your account right now.'
            : plan.description}
        </p>
      </div>

      <ul className="mx-auto mt-7 flex max-w-md flex-col gap-2.5">
        {planHighlights(plan, locale).map((highlight) => (
          <li key={highlight} className="flex gap-2.5 text-sm text-ink-700">
            <svg
              className="mt-0.5 size-4 shrink-0 text-success-600"
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

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="/dashboard/cvs/new" size="lg">
          Start a new CV
        </ButtonLink>
        <ButtonLink href="/dashboard" size="lg" variant="outline">
          Go to my dashboard
        </ButtonLink>
      </div>

      <div className="mt-8 border-t border-ink-100 pt-5 text-center text-xs leading-relaxed text-ink-500">
        <p>
          PayPal has e-mailed you a receipt.{' '}
          {plan.accessDays === null
            ? 'This plan does not expire and there is nothing to renew or cancel.'
            : `This payment covers ${plan.accessDays} days of access and does not renew by itself — you will never be charged automatically.`}
        </p>
        <p className="mt-1.5">
          Changed your mind? Our{' '}
          <Link
            href="/refund-policy"
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            refund policy
          </Link>{' '}
          gives you 14 days.
        </p>
        {orderId ? (
          <p className="mt-3 font-mono text-[11px] text-ink-400">Order {orderId}</p>
        ) : null}
      </div>
    </Panel>
  );
}

function Panel({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'success' | 'danger';
}) {
  const ring =
    tone === 'success'
      ? 'border-success-500/25'
      : tone === 'danger'
        ? 'border-danger-500/25'
        : 'border-ink-200';

  return (
    <div className={cn('rounded-2xl border bg-white p-6 shadow-card sm:p-9', ring)}>{children}</div>
  );
}
