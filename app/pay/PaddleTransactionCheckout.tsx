'use client';

import { CheckoutEventNames, initializePaddle } from '@paddle/paddle-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useCopy } from '@/components/i18n/LocaleProvider';
import { ButtonLink } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { Spinner } from '@/components/ui/button';
import { publicEnv } from '@/lib/env';

/**
 * Opens a checkout Paddle sent the customer here to complete.
 *
 * ## Why this page exists at all
 *
 * Paddle requires a **default payment link** on the account, and refuses to create any
 * transaction until one is set. It is not merely a setting: Paddle appends `?_ptxn=<id>`
 * to it and uses it as the landing page for checkout links it generates itself — the
 * "update your payment method" link in its emails, dunning notices, and any transaction
 * link created outside our own checkout flow.
 *
 * Pointing that at `/payment/checkout` would half-work and fail in the cases that matter:
 * that page needs a session and a `?plan=` parameter, and someone arriving from an email
 * days later has neither. They would be bounced to the sign-in form with no explanation
 * for a payment they were asked to complete.
 *
 * So this is a page whose only job is `_ptxn`. It is deliberately public, because the
 * recipient of a Paddle email may not be signed in and the transaction id is itself the
 * credential — it is unguessable, it is scoped to one purchase, and completing it grants
 * nothing on its own. Access is still granted only by the webhook, which attributes the
 * payment through `customData` written when the transaction was created.
 */
export function PaddleTransactionCheckout() {
  const params = useSearchParams();
  const router = useRouter();
  const copy = useCopy();

  // Paddle's own parameter name. `transaction` is accepted too, for links we write.
  const transactionId = params.get('_ptxn') ?? params.get('transaction') ?? '';

  /*
   * Seeded from the query rather than set in an effect. The overlay opens on mount
   * whenever there is a transaction, so "opening" is the truthful first paint — and
   * calling `setState` synchronously inside the effect to say so would just be a second
   * render announcing what the first already knew.
   */
  const [state, setState] = useState<'idle' | 'opening' | 'open' | 'done' | 'error'>(
    transactionId ? 'opening' : 'idle',
  );

  /*
   * Why the overlay did not open, when it did not.
   *
   * The first version of this page showed one message for two unrelated failures — "the
   * site has no Paddle client token" and "Paddle.js was loaded and refused" — which are
   * fixed in completely different places. Telling someone to refresh when the real problem
   * is an unset environment variable wastes their time and mine.
   */
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    if (!transactionId || !publicEnv.paddleClientToken) return;

    let cancelled = false;

    /*
     * The handler lives inside the effect rather than behind a ref. Paddle keeps whichever
     * function it is given at initialisation for the lifetime of the page, which is what
     * the ref indirection is normally for — but everything this handler needs is either
     * the effect's own dependency or a stable router, so there is nothing stale to guard
     * against and the ref would only be a way to read it during render.
     */
    const onEvent = (event: { name?: string }) => {
      if (cancelled) return;
      if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
        setState('done');
        /*
         * Verification is the success page's job, not this one's. It re-checks the
         * transaction server-side and reports what the server says — which is also what
         * makes this correct for a customer who closes the tab, since the webhook grants
         * the plan either way.
         */
        router.replace(`/payment/success?transaction=${encodeURIComponent(transactionId)}`);
      }
      if (event.name === CheckoutEventNames.CHECKOUT_CLOSED) {
        setState((current) => (current === 'done' ? current : 'idle'));
      }
    };

    void (async () => {
      try {
        const paddle = await initializePaddle({
          token: publicEnv.paddleClientToken,
          environment: publicEnv.paddleEnvironment,
          eventCallback: onEvent,
        });
        if (cancelled || !paddle) return;
        paddle.Checkout.open({ transactionId });
        setState('open');
      } catch (cause) {
        if (cancelled) return;
        /*
         * Always logged, never shown verbatim. The message is Paddle's and can name
         * internals; the console is where whoever is configuring the site will look, and
         * a customer should not be reading a stack trace on a payment page.
         */
        console.error('[paddle] could not open the checkout overlay', cause);
        setReason(cause instanceof Error ? cause.message : String(cause));
        setState('error');
      }
    })();

    return () => {
      cancelled = true;
    };
    // Only the transaction id should ever re-open the overlay.
  }, [transactionId, router]);

  if (!transactionId) {
    return (
      <Alert tone="warning" title={copy.checkout.noTransactionTitle}>
        <p>{copy.checkout.noTransactionBody}</p>
        <ButtonLink href="/pricing" size="sm" className="mt-3">
          {copy.dashboard.seePlans}
        </ButtonLink>
      </Alert>
    );
  }

  /*
   * Missing configuration is not a payment failure, and saying "refresh to try again"
   * about it is actively misleading — no amount of refreshing sets an environment
   * variable. This branch is what a misconfigured deployment looks like; the one below is
   * what a genuine runtime failure looks like.
   */
  if (!publicEnv.paddleClientToken) {
    if (typeof window !== 'undefined') {
      console.error(
        '[paddle] NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is empty in this build. It is inlined at ' +
          'build time, so setting it after a deploy has no effect until the site is rebuilt.',
      );
    }
    return (
      <Alert tone="danger" title={copy.checkout.unconfiguredTitle}>
        <p>{copy.checkout.unconfiguredBody}</p>
      </Alert>
    );
  }

  if (state === 'error') {
    return (
      <Alert tone="danger" title={copy.checkout.openFailedTitle}>
        <p>{copy.checkout.openFailedBody}</p>
        {reason ? (
          // Shown small and last: useless to a customer, decisive for whoever is debugging,
          // and far better than making them open the console to learn anything at all.
          <p className="mt-2 font-mono text-xs break-words text-ink-500">{reason}</p>
        ) : null}
      </Alert>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <Spinner />
      <p className="text-sm text-ink-600">
        {state === 'done' ? copy.checkout.completing : copy.checkout.openingCheckout}
      </p>
      {state === 'idle' ? (
        // The overlay was dismissed. Re-opening is a reload, which is honest about what
        // is happening and avoids a second Paddle.js instance.
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="cursor-pointer text-sm font-semibold text-brand-700 underline underline-offset-2"
        >
          {copy.checkout.reopen}
        </button>
      ) : null}
    </div>
  );
}
