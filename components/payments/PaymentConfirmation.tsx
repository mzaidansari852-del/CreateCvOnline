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
 * Each gateway names its reference differently, because each substitutes its own into the
 * return URL: PayPal's order id arrives as `token`, Polar's checkout id as `checkout_id`.
 * `?transaction=` is still read as a Polar fallback so that any link produced by the
 * previous Paddle integration still resolves to an answer rather than to "no reference".
 * Exactly one of them is meaningful, and which one picks the branch.
 *
 * ## Why the two branches are not the same shape
 *
 * PayPal's flow is sequential: the payer approves, comes back, and *this page* asks the
 * server to capture. There is one answer and it arrives once. Polar's is a race against its
 * own webhook, which is the authoritative grant — so that branch asks repeatedly until the
 * answer stops being "not yet", as described below. Collapsing them into one loop would
 * mean retrying a PayPal capture that has already given a final verdict.
 *
 * ## Why the Polar branch takes more than one attempt
 *
 * Confirmation is a race. The signed webhook is the authoritative grant and it may land
 * before this page does, after it, or — while a bank settles a card — a good few seconds
 * later. So this does not ask once and report a verdict; it asks until the answer stops
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
 * How long to keep asking before reporting what we last heard. Polar's webhook is normally
 * a second or two behind the redirect; card settlement occasionally takes longer than that.
 * Fifteen seconds is past the point where a person will keep reading a spinner.
 */
const POLAR_ATTEMPTS = 6;
const POLAR_RETRY_MS = 2500;

/**
 * Polar checkout ids are UUIDs, Paddle's were `txn_01j…`, and PayPal's are short
 * alphanumeric strings.
 *
 * The pattern stays deliberately loose enough for both, because this only decides whether
 * to *ask* the server about a reference. The server looks the id up in our own ledger and
 * checks it belongs to the caller, so a stricter regex here would buy no safety and would
 * turn a future id format into "no reference" for somebody who has already paid.
 */
function readReference(value: string | null): string | null {
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
 * `pending` is the distinction that makes this work: an answer that is still allowed to
 * change. Separating it from `refused` is what stops the page reporting "not paid" one
 * second before the webhook says otherwise.
 */
type VerifyOutcome =
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
async function askPolar(checkoutId: string, copy: AppCopy): Promise<VerifyOutcome> {
  const offlineMessage = copy.checkout.offline;
  try {
    const response = await fetch('/api/payments/polar/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutId }),
    });
    const payload = (await response.json().catch(() => null)) as
      (CaptureResponse & ApiErrorBody) | null;

    if (response.ok) return { kind: 'granted', planId: payload?.planId ?? null };

    const code = payload?.error?.code ?? 'payment-failed';
    const message = copy.checkout.serverError(code) ?? offlineMessage;

    /*
     * Two answers are worth asking about again. `payment-not-completed` is what Polar says
     * while a card is still settling, and `payment-provider-error` is us failing to reach
     * Polar at all — neither says the customer was not charged, and the webhook turns both
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
  /** From `?token=` — PayPal's order id. `null` unless PayPal took the payment. */
  orderId: string | null;
  /** From `?plan=` — used only for the heading before the server confirms. */
  planHint: string | null;
}) {
  const locale = useLocale();
  const copy = useCopy();
  const searchParams = useSearchParams();

  /*
   * The reference is read straight from the URL rather than passed down, so a customer who
   * reopens this page from their history an hour later gets the same answer as the tab the
   * overlay closed in. Nothing here assumes the checkout ran in *this* tab.
   */
  const polarReference = orderId
    ? null
    : readReference(searchParams.get('checkout_id') ?? searchParams.get('transaction'));

  /*
   * At most one of the two can be meaningful. The page above only forwards PayPal's
   * parameters, so a Polar checkout id is read here — but if PayPal's `token` is present it
   * takes precedence and the Polar branch is switched off entirely. Posting a Polar id to
   * PayPal's capture endpoint would be a confusing 404 for the customer and a misleading
   * line in the support log.
   */
  const reference = orderId ?? polarReference;

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

  /**
   * PayPal: capture, once.
   *
   * Unlike the Polar branch below there is no waiting: the payer has already approved on
   * PayPal's site, so `captureOrder` either moves the money now or gives a reason it did
   * not. The server re-reads the order from PayPal and re-checks the amount and currency
   * against the plan before granting anything — the `token` in this URL is treated as a
   * question, never as proof.
   */
  const capturePayPal = useCallback(
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
          | (CaptureResponse & ApiErrorBody)
          | null;

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
          trackEvent('payment_failed', { gateway: 'paypal', reason: code });
          return;
        }

        const resolvedPlan = payload?.planId ?? null;
        if (resolvedPlan) setPlanId(resolvedPlan);

        /*
         * `alreadyFulfilled` *is* turned into the "already active" panel here, where the
         * Polar branch deliberately does not. On this path it is genuinely unusual: nothing
         * else captures a PayPal order, so the only way to see it is to reload a
         * confirmation link for an order that completed earlier — which is exactly what the
         * panel says. Under Polar the webhook normally wins the race, so the same flag is
         * the expected answer for a first-time buyer and would be a lie.
         */
        if (payload?.alreadyFulfilled) {
          setPhase('already');
          return;
        }

        setPhase('success');
        const plan = getPlan(resolvedPlan ?? 'free');
        trackEvent('payment_completed', {
          plan: plan.id,
          gateway: 'paypal',
          value: Number.parseFloat(plan.price),
          currency: publicEnv.storeCurrency,
        });
      } catch {
        setFailure({
          message: copy.checkout.confirmOffline,
          nextStep: copy.checkout.nextRetryConnection,
          retryable: true,
        });
        setPhase('failed');
        trackEvent('payment_failed', { gateway: 'paypal', reason: 'network' });
      }
    },
    [copy],
  );

  useEffect(() => {
    if (!orderId) return;
    /*
     * React runs effects twice in development. Capturing twice is harmless on the server —
     * fulfilment is idempotent — but it would show a first-time buyer the "already
     * confirmed" state, which reads as a bug.
     */
    const key = `paypal:${orderId}:${attempt}`;
    if (lastCapturedKey.current === key) return;
    lastCapturedKey.current = key;
    void capturePayPal(orderId);
  }, [orderId, attempt, capturePayPal]);

  const verifyPolar = useCallback(
    async (id: string) => {
      setPhase('verifying');
      setFailure(null);

      for (let round = 0; ; round += 1) {
        const outcome = await askPolar(id, copy);

        if (outcome.kind === 'granted') {
          const resolvedPlan = outcome.planId;
          if (resolvedPlan) setPlanId(resolvedPlan);
          /*
           * `alreadyFulfilled` is deliberately not turned into an "already active" panel.
           * On this path it is the *expected* answer: Polar's webhook usually lands before
           * the customer's browser finishes following the redirect, so by the time this
           * page asks, the order is nearly always fulfilled already. Reading that as "you
           * owned this before" would tell every single first-time buyer they had bought the
           * plan twice.
           */
          setPhase('success');
          const plan = getPlan(resolvedPlan ?? 'free');
          trackEvent('payment_completed', {
            plan: plan.id,
            gateway: 'polar',
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
          trackEvent('payment_failed', { gateway: 'polar', reason: outcome.code });
          return;
        }

        if (round + 1 >= POLAR_ATTEMPTS) {
          setFailure({
            message: outcome.message,
            nextStep: copy.checkout.nextWait,
            retryable: true,
          });
          setPhase('failed');
          trackEvent('payment_failed', { gateway: 'polar', reason: 'pending' });
          return;
        }

        setPhase('settling');
        await sleep(POLAR_RETRY_MS);
      }
    },
    [copy],
  );

  useEffect(() => {
    // `polarReference` rather than `reference`: the latter is PayPal's id on a PayPal
    // return, and the effect above already owns that case.
    if (!polarReference) return;
    /*
     * React runs effects twice in development. Verifying twice is harmless on the server —
     * fulfilment is idempotent — but the guard keeps the analytics event honest. The key is
     * prefixed because both effects share the ref and only one of them ever has a reference.
     */
    const key = `polar:${polarReference}:${attempt}`;
    if (lastCapturedKey.current === key) return;
    lastCapturedKey.current = key;
    void verifyPolar(polarReference);
  }, [polarReference, attempt, verifyPolar]);

  if (phase === 'verifying' || phase === 'settling') {
    return (
      <Panel>
        <div className="flex flex-col items-center gap-4 text-center">
          <Spinner size={32} className="text-brand-600" />
          <h2 className="text-xl font-bold text-ink-950">{copy.checkout.confirmTitle}</h2>
          <p className="max-w-md text-sm leading-relaxed text-ink-600">
            {orderId
              ? copy.checkout.paypalConfirmBody
              : phase === 'settling'
                ? copy.checkout.stillConfirmingBody
                : copy.checkout.confirmBody}
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
          {orderId ? copy.checkout.paypalReceiptNote : copy.checkout.receiptNote}{' '}
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
            {copy.checkout.transactionRef} {reference}
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
