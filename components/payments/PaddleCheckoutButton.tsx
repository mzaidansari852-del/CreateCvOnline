'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutEventNames, initializePaddle } from '@paddle/paddle-js';
import type { Paddle, PaddleEventData } from '@paddle/paddle-js';

import { useCopy, useLocale } from '@/components/i18n/LocaleProvider';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { trackEvent } from '@/lib/analytics/events';
import { publicEnv } from '@/lib/env';
import { site } from '@/lib/site';
import type { PlanId } from '@/types/user';

/**
 * Opens Paddle's checkout overlay and hands the outcome to our own server.
 *
 * ## What crosses the wire
 *
 * A plan id goes out, a transaction id comes back, and the overlay is opened against that
 * transaction — `Checkout.open({ transactionId })`, never `{ items: [...] }`. That is the
 * whole reason the server creates the transaction first: opening with a price id would put
 * the thing being sold in the browser's hands, and opening with an amount would put the
 * price there. Neither value exists in this file, and the only fact this component reports
 * back is the id it was given.
 *
 * ## Why it verifies and then leaves
 *
 * The webhook is what actually grants the plan, and it is already on its way. Verifying
 * here is for the person watching the screen: it turns "the overlay closed" into a
 * server-confirmed answer within a second, instead of a success page that has to guess.
 * Both paths land in the same idempotent fulfilment, so doing both is free.
 */

interface CreateTransactionResponse {
  transactionId?: string;
  error?: { code?: string; message?: string };
}

interface VerifyResponse {
  status?: string;
  planId?: string;
  alreadyFulfilled?: boolean;
  error?: { code?: string; message?: string };
}

interface Failure {
  title: string;
  message: string;
  /** What to do about it, when there is anything useful to say. */
  nextStep: string | null;
}

/** `idle` covers "never started" and "the customer closed the overlay", which are the same. */
type Phase = 'idle' | 'starting' | 'open' | 'verifying';

export function PaddleCheckoutButton({
  planId,
  planName,
  priceLabel,
}: {
  planId: PlanId;
  planName: string;
  /** e.g. `$9 per month` — used for the button label. Display only; never sent anywhere. */
  priceLabel: string;
}) {
  const router = useRouter();
  const copy = useCopy();
  const locale = useLocale();

  const [phase, setPhase] = useState<Phase>('idle');
  const [failure, setFailure] = useState<Failure | null>(null);
  /**
   * Set once the overlay has produced a transaction. Its presence is what makes the retry
   * button re-ask about *that* payment rather than start a second one — a customer whose
   * card was charged and whose confirmation failed must never be sold the plan twice.
   */
  const [pendingTransaction, setPendingTransaction] = useState<string | null>(null);

  const paddleRef = useRef<Paddle | null>(null);
  /**
   * The checkout currently on screen. `completed` matters because Paddle fires
   * `checkout.closed` when the customer dismisses the *success* screen too, and that must
   * not be read as an abandoned payment.
   */
  const attemptRef = useRef<{ transactionId: string; completed: boolean } | null>(null);

  const successHref = useCallback(
    (transactionId: string) =>
      `/payment/success?plan=${planId}&transaction=${encodeURIComponent(transactionId)}`,
    [planId],
  );

  /**
   * Asks our server what really happened, and decides where the customer goes next.
   *
   * The interesting branch is the middle one. "Paddle says this is not completed yet" and
   * "we could not reach Paddle" are both answers that the webhook turns into a granted plan
   * moments later, so they are not failures to report here — they are a reason to move to
   * the page built for waiting. Stopping on the checkout page to tell someone who has just
   * paid that nothing was charged would be the wrong answer nine times out of ten.
   */
  const confirm = useCallback(
    async (transactionId: string) => {
      setPhase('verifying');
      setFailure(null);

      try {
        const response = await fetch('/api/payments/paddle/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId }),
        });
        const payload = (await response.json().catch(() => null)) as VerifyResponse | null;

        if (response.ok) {
          router.replace(successHref(transactionId));
          return;
        }

        const code = payload?.error?.code ?? 'payment-failed';

        if (code === 'unauthenticated') {
          // The payment stands; only the session went. Signing back in returns them to the
          // confirmation page, and the webhook will have granted the plan by then anyway.
          router.push(`/login?next=${encodeURIComponent(successHref(transactionId))}`);
          return;
        }

        if (code === 'payment-not-completed' || code === 'payment-provider-error') {
          router.replace(successHref(transactionId));
          return;
        }

        setFailure({
          title: copy.checkout.confirmFailedTitle,
          /*
           * The code, never `payload.error.message`. Our API writes that message in English
           * for whoever reads the logs, and rendering it here put an English sentence under
           * a French heading on the one screen where a customer is deciding whether their
           * money is safe.
           */
          message: copy.checkout.serverError(code) ?? copy.checkout.startFailedBody,
          nextStep: copy.checkout.nextSupport(site.supportEmail),
        });
        setPhase('idle');
        trackEvent('payment_failed', { plan: planId, gateway: 'paddle', reason: code });
      } catch {
        setFailure({
          title: copy.checkout.confirmFailedTitle,
          message: copy.checkout.offline,
          nextStep: copy.checkout.nextWait,
        });
        setPhase('idle');
        trackEvent('payment_failed', { plan: planId, gateway: 'paddle', reason: 'network' });
      }
    },
    [copy, planId, router, successHref],
  );

  /**
   * Paddle takes one event callback, at initialisation, and keeps it for the life of the
   * page. Routing every event through a ref keeps that callback stable while the handler it
   * calls stays current — otherwise the first checkout's closure would still be answering
   * for the third.
   */
  const handleEvent = useCallback(
    (event: PaddleEventData) => {
      const attempt = attemptRef.current;
      if (!attempt) return;

      if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
        attempt.completed = true;
        void confirm(attempt.transactionId);
        return;
      }

      if (event.name === CheckoutEventNames.CHECKOUT_CLOSED) {
        if (attempt.completed) return;
        // Walking away from a payment form is ordinary behaviour, not an error. Everything
        // goes back to how it looked before the button was pressed.
        attemptRef.current = null;
        setPendingTransaction(null);
        setPhase('idle');
        trackEvent('payment_cancelled', { plan: planId, gateway: 'paddle' });
      }
    },
    [confirm, planId],
  );

  const handlerRef = useRef(handleEvent);
  useEffect(() => {
    handlerRef.current = handleEvent;
  }, [handleEvent]);

  const loadPaddle = useCallback(async (): Promise<Paddle | null> => {
    if (paddleRef.current) return paddleRef.current;
    const instance = await initializePaddle({
      token: publicEnv.paddleClientToken,
      environment: publicEnv.paddleEnvironment,
      eventCallback: (event) => handlerRef.current(event),
    });
    paddleRef.current = instance ?? null;
    return paddleRef.current;
  }, []);

  const start = useCallback(async () => {
    /*
     * The server half and the browser half of Paddle are configured independently, so a
     * deployment can have the API key and not the public client token. Checking first
     * costs nothing and avoids leaving a transaction in the ledger for a payment form that
     * was never going to open.
     */
    if (!publicEnv.paddleClientToken) {
      setFailure({
        title: copy.checkout.startFailedTitle,
        message: copy.checkout.scriptFailed,
        nextStep: null,
      });
      return;
    }

    setPhase('starting');
    setFailure(null);
    trackEvent('checkout_started', { plan: planId, gateway: 'paddle' });

    /*
     * The server call and Paddle's CDN script do not depend on each other, so they run
     * together. Doing them in sequence would add a whole round trip to a wait the customer
     * is already staring at. The `.catch` keeps a script failure from rejecting before the
     * response has been read — the HTTP error is the more useful one to report.
     */
    const script = loadPaddle().catch(() => null);

    try {
      const response = await fetch('/api/payments/paddle/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const payload = (await response.json().catch(() => null)) as CreateTransactionResponse | null;

      if (!response.ok) {
        if (payload?.error?.code === 'unauthenticated') {
          // The session expired between loading the page and pressing the button.
          router.push(`/login?next=${encodeURIComponent(`/payment/checkout?plan=${planId}`)}`);
          return;
        }
        setFailure({
          title: copy.checkout.startFailedTitle,
          // Localised from the code — see `confirm()` above for why the message is ignored.
          message: copy.checkout.serverError(payload?.error?.code) ?? copy.checkout.startFailedBody,
          nextStep: null,
        });
        setPhase('idle');
        return;
      }

      const transactionId = payload?.transactionId;
      if (!transactionId) {
        setFailure({
          title: copy.checkout.startFailedTitle,
          message: copy.checkout.startFailedBody,
          nextStep: null,
        });
        setPhase('idle');
        return;
      }

      const paddle = await script;
      if (!paddle) {
        setFailure({
          title: copy.checkout.startFailedTitle,
          message: copy.checkout.scriptFailed,
          nextStep: null,
        });
        setPhase('idle');
        return;
      }

      attemptRef.current = { transactionId, completed: false };
      setPendingTransaction(transactionId);
      setPhase('open');
      paddle.Checkout.open({
        transactionId,
        // No `successUrl`: letting Paddle redirect would skip our verification and land the
        // customer on a page that had been told nothing. The completed event is the hand-off.
        settings: { displayMode: 'overlay', theme: 'light', locale },
      });
    } catch {
      setFailure({
        title: copy.checkout.startFailedTitle,
        message: copy.checkout.offline,
        nextStep: null,
      });
      setPhase('idle');
    }
  }, [copy, loadPaddle, locale, planId, router]);

  const busy = phase !== 'idle';
  const label =
    phase === 'verifying'
      ? copy.checkout.confirming
      : busy
        ? copy.checkout.opening
        : copy.checkout.payNow(priceLabel);

  return (
    <div className="flex flex-col gap-3">
      <Button
        onClick={() => void (pendingTransaction ? confirm(pendingTransaction) : start())}
        loading={busy}
        size="lg"
        fullWidth
        data-testid="paddle-checkout-submit"
      >
        {pendingTransaction && !busy ? copy.common.retry : label}
      </Button>

      {failure ? (
        <Alert tone="danger" title={failure.title}>
          {failure.message}
          {failure.nextStep ? <span className="mt-2 block">{failure.nextStep}</span> : null}
        </Alert>
      ) : null}

      <p className="text-center text-xs leading-relaxed text-ink-500">
        {copy.checkout.paddleNote(planName)}
      </p>
    </div>
  );
}
