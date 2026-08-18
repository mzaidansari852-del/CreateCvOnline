'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { useCopy, useLocale } from '@/components/i18n/LocaleProvider';
import type { AppCopy } from '@/lib/i18n/app-copy';
import { Button, ButtonLink, Spinner } from '@/components/ui/button';
import { planDescription, planHighlights } from '@/lib/i18n/copy/content';
import { Alert } from '@/components/ui/feedback';
import { trackEvent } from '@/lib/analytics/events';
import { publicEnv } from '@/lib/env';
import { getPlan, isPurchasablePlan } from '@/lib/plans';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils/cn';

/**
 * Confirms a payment, whichever gateway took it.
 *
 * The page this lives on grants nothing. Arriving here only means a URL was opened, so the
 * single thing this component does is ask our own server what happened — and the server
 * re-checks the order, the amount and the currency with the gateway before it changes any
 * entitlement.
 *
 * PayPal returns its order id in `token`; Paddle's transaction id arrives in `transaction`,
 * put there by the checkout button. Exactly one of them is present, and that is what picks
 * the branch.
 *
 * ## Why Paddle needs more than one attempt
 *
 * PayPal's flow is sequential: the payer approves, comes back, we capture. Paddle's is a
 * race. The signed webhook is the authoritative grant and it may land before this page
 * does, after it, or — while a bank settles a card — a good few seconds later. So the
 * Paddle branch does not ask once and report a verdict; it asks until the answer stops
 * being "not yet". The three states that matters for:
 *
 *   1. the webhook got there first — verify returns immediately and this page agrees,
 *   2. this browser's own verify got there first — same answer, arrived by another road,
 *   3. neither has finished — the page waits and says so, rather than telling someone who
 *      has just paid that nothing was charged.
 *
 * Nothing here assumes the checkout overlay ran in *this* tab. A customer who closed the
 * tab mid-verify and opened their history an hour later gets the same answer, because the
 * answer is read from the server rather than remembered from the overlay.
 */

type Phase = 'verifying' | 'settling' | 'success' | 'already' | 'failed';

/**
 * How long to keep asking before reporting what we last heard. Paddle's webhook is normally
 * a second or two behind the overlay; card settlement occasionally takes longer than that.
 * Fifteen seconds is past the point where a person will keep reading a spinner.
 */
const PADDLE_ATTEMPTS = 6;
const PADDLE_RETRY_MS = 2500;

/** Paddle ids look like `txn_01j…`. Anything else did not come from a checkout of ours. */
function readTransactionId(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return /^[A-Za-z0-9_-]{4,64}$/.test(trimmed) ? trimmed : null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

/**
 * `pending` is the distinction that makes the Paddle branch work: an answer that is still
 * allowed to change. Separating it from `refused` is what stops the page reporting "not
 * paid" one second before the webhook says otherwise.
 */
type PaddleOutcome =
  | { kind: 'granted'; planId: string | null }
  | { kind: 'pending'; message: string }
  | { kind: 'refused'; code: string; message: string };

/**
 * `copy` rather than a single fallback string, because what a customer should read here
 * depends on which code came back — and the alternative the first version reached for was
 * the API's own `error.message`, which is English in every locale. Under a translated
 * heading that reads as a half-broken page at the exact moment someone is wondering whether
 * their card was charged.
 */
async function askPaddle(transactionId: string, copy: AppCopy): Promise<PaddleOutcome> {
  const offlineMessage = copy.checkout.offline;
  try {
    const response = await fetch('/api/payments/paddle/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId }),
    });
    const payload = (await response.json().catch(() => null)) as
      (CaptureResponse & ApiErrorBody) | null;

    if (response.ok) return { kind: 'granted', planId: payload?.planId ?? null };

    const code = payload?.error?.code ?? 'payment-failed';
    const message = copy.checkout.serverError(code) ?? offlineMessage;

    /*
     * Two answers are worth asking about again. `payment-not-completed` is what Paddle says
     * while a card is still settling, and `payment-provider-error` is us failing to reach
     * Paddle at all — neither says the customer was not charged, and the webhook turns both
     * into a granted plan when it lands. Everything else is settled: a mismatched amount or
     * an unknown transaction will read the same in ten seconds.
     */
    if (code === 'payment-not-completed' || code === 'payment-provider-error') {
      return { kind: 'pending', message };
    }
    return { kind: 'refused', code, message };
  } catch {
    // A network fault says nothing about the payment, so it is worth retrying too.
    return { kind: 'pending', message: offlineMessage };
  }
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
  const copy = useCopy();
  const searchParams = useSearchParams();

  /*
   * The page above only forwards PayPal's parameters, so Paddle's reference is read
   * straight from the URL. At most one of the two can be meaningful: a Paddle transaction
   * id posted to PayPal's capture endpoint would be a confusing 404 for the customer and a
   * misleading line in the support log.
   */
  const transactionId = orderId ? null : readTransactionId(searchParams.get('transaction'));
  const reference = orderId ?? transactionId;

  const [phase, setPhase] = useState<Phase>(reference ? 'verifying' : 'failed');
  const [planId, setPlanId] = useState<string | null>(
    planHint && isPurchasablePlan(planHint) ? planHint : null,
  );
  const [failure, setFailure] = useState<Failure | null>(
    reference
      ? null
      : {
          message: copy.checkout.missingReference,
          nextStep: copy.checkout.missingReferenceNext,
          retryable: false,
        },
  );
  const [attempt, setAttempt] = useState(0);
  /** Guards against React's double-invoked effects in development. */
  const lastCapturedKey = useRef<string | null>(null);

  const capture = useCallback(
    async (id: string) => {
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
            message: copy.checkout.serverError(code) ?? copy.checkout.paypalFailedBody,
            nextStep:
              code === 'unauthenticated'
                ? copy.checkout.nextSignIn
                : code === 'unknown-order'
                  ? copy.checkout.paypalNextUnknownOrder(site.supportEmail)
                  : copy.checkout.paypalNextSupport(site.supportEmail),
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
          message: copy.checkout.confirmOffline,
          nextStep: copy.checkout.nextRetryConnection,
          retryable: true,
        });
        setPhase('failed');
        trackEvent('payment_failed', { reason: 'network' });
      }
    },
    [copy],
  );

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

  const verifyPaddle = useCallback(
    async (id: string) => {
      setPhase('verifying');
      setFailure(null);

      for (let round = 0; ; round += 1) {
        const outcome = await askPaddle(id, copy);

        if (outcome.kind === 'granted') {
          const resolvedPlan = outcome.planId;
          if (resolvedPlan) setPlanId(resolvedPlan);
          /*
           * `alreadyFulfilled` is deliberately not turned into the "already active" panel
           * the way the PayPal branch does. On this path it is the *expected* answer: the
           * checkout button verifies the moment the overlay closes, so by the time this
           * page asks, the transaction is nearly always fulfilled already. Reading that as
           * "you owned this before" would tell every single first-time buyer they had
           * bought the plan twice.
           */
          setPhase('success');
          const plan = getPlan(resolvedPlan ?? 'free');
          trackEvent('payment_completed', {
            plan: plan.id,
            gateway: 'paddle',
            value: Number.parseFloat(plan.price),
            currency: publicEnv.storeCurrency,
          });
          return;
        }

        if (outcome.kind === 'refused') {
          setFailure({
            // The server's own wording, not ours. Its messages are the ones that say
            // whether money moved, and a generic sentence in their place would be the
            // difference between a customer waiting and a customer paying twice.
            message: outcome.message,
            nextStep:
              outcome.code === 'unauthenticated'
                ? copy.checkout.nextSignIn
                : copy.checkout.nextSupport(site.supportEmail),
            retryable: outcome.code !== 'amount-mismatch' && outcome.code !== 'unknown-order',
          });
          setPhase('failed');
          trackEvent('payment_failed', { gateway: 'paddle', reason: outcome.code });
          return;
        }

        if (round + 1 >= PADDLE_ATTEMPTS) {
          setFailure({
            message: outcome.message,
            nextStep: copy.checkout.nextWait,
            retryable: true,
          });
          setPhase('failed');
          trackEvent('payment_failed', { gateway: 'paddle', reason: 'pending' });
          return;
        }

        setPhase('settling');
        await sleep(PADDLE_RETRY_MS);
      }
    },
    [copy],
  );

  useEffect(() => {
    if (!transactionId) return;
    // Same double-invoke guard as the PayPal branch, and the same reason to keep the key
    // prefixed: the two effects share it and only one of them ever has a reference.
    const key = `paddle:${transactionId}:${attempt}`;
    if (lastCapturedKey.current === key) return;
    lastCapturedKey.current = key;
    void verifyPaddle(transactionId);
  }, [transactionId, attempt, verifyPaddle]);

  if (phase === 'verifying' || phase === 'settling') {
    return (
      <Panel>
        <div className="flex flex-col items-center gap-4 text-center">
          <Spinner size={32} className="text-brand-600" />
          <h2 className="text-xl font-bold text-ink-950">{copy.checkout.confirmTitle}</h2>
          <p className="max-w-md text-sm leading-relaxed text-ink-600">
            {transactionId
              ? phase === 'settling'
                ? copy.checkout.stillConfirmingBody
                : copy.checkout.confirmBody
              : copy.checkout.paypalConfirmBody}
          </p>
        </div>
      </Panel>
    );
  }

  if (phase === 'failed') {
    return (
      <Panel tone="danger">
        <h2 className="text-xl font-bold text-ink-950">{copy.checkout.confirmFailedTitle}</h2>
        <Alert tone="danger" className="mt-4">
          {failure?.message}
        </Alert>
        <p className="mt-4 text-sm leading-relaxed text-ink-700">{failure?.nextStep}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {failure?.retryable && reference ? (
            <Button onClick={() => setAttempt((value) => value + 1)}>{copy.common.retry}</Button>
          ) : null}
          <ButtonLink href="/pricing" variant="outline">
            {copy.checkout.backToPricing}
          </ButtonLink>
          <ButtonLink href={`mailto:${site.supportEmail}`} variant="ghost">
            {copy.checkout.emailSupport(site.supportEmail)}
          </ButtonLink>
        </div>
        {reference ? (
          <p className="mt-6 text-xs text-ink-500">
            {copy.checkout.quoteReference} <code className="font-mono">{reference}</code>
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
          {alreadyHad
            ? copy.checkout.planAlreadyActive(plan.name)
            : copy.checkout.planActive(plan.name)}
        </h2>
        {/* `planDescription(plan, locale)` is the English source in `lib/plans.ts`; only the tagline and
            the highlights have localised counterparts in `lib/i18n/copy/content.ts`. */}
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-600">
          {alreadyHad ? copy.checkout.alreadyConfirmedBody : planDescription(plan, locale)}
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
          {copy.dashboard.startNewCv}
        </ButtonLink>
        <ButtonLink href="/dashboard" size="lg" variant="outline">
          {copy.auth.goToDashboard}
        </ButtonLink>
      </div>

      <div className="mt-8 border-t border-ink-100 pt-5 text-center text-xs leading-relaxed text-ink-500">
        <p>
          {transactionId ? copy.checkout.receiptNote : copy.checkout.paypalReceiptNote}{' '}
          {plan.accessDays === null
            ? copy.checkout.noRenewalNote
            : copy.checkout.accessDaysNote(plan.accessDays)}
        </p>
        <p className="mt-1.5">
          {copy.checkout.refundLead}{' '}
          <Link
            href="/refund-policy"
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            {copy.checkout.refundLink}
          </Link>{' '}
          {copy.checkout.refundTail}
        </p>
        {reference ? (
          <p className="mt-3 font-mono text-[11px] text-ink-400">
            {transactionId
              ? `${copy.checkout.transactionRef} ${transactionId}`
              : `${copy.checkout.orderRef} ${orderId}`}
          </p>
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
