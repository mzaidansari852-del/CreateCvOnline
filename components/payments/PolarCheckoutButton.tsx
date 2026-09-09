'use client';

import { useCallback, useRef, useState } from 'react';

import { useCopy } from '@/components/i18n/LocaleProvider';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { trackEvent } from '@/lib/analytics/events';
import { site } from '@/lib/site';
import type { PlanId } from '@/types/user';

/**
 * Starts a Polar checkout and sends the customer to it.
 *
 * ## Why this is so much smaller than the Paddle version it replaces
 *
 * Paddle ran its checkout as an overlay inside this page. That meant loading a third-party
 * script, holding a `Paddle` instance in a ref, subscribing to overlay events, telling a
 * closed-in-success apart from a closed-in-abandonment, and verifying the payment from the
 * browser before navigating — roughly three hundred lines, most of it about the overlay's
 * lifecycle rather than about buying anything.
 *
 * Polar hosts its checkout. So this asks our server for a session, and navigates. There is
 * no script to load, no instance to keep, no event stream to interpret, and no window in
 * which the customer is mid-payment inside our page. The confirmation that used to happen
 * here now happens on the success page the customer is redirected back to, which is where
 * it belonged: that page works whether or not the checkout ran in this tab.
 *
 * ## What crosses the wire
 *
 * A plan id goes out; a URL comes back. No price and no product id exists in this file, so
 * there is nothing here for a tampered client to change — the server derives both from the
 * plan, and re-checks them against the payment before granting anything.
 */

interface CreateCheckoutResponse {
  checkoutId?: string;
  url?: string;
  error?: { code?: string; message?: string };
}

interface Failure {
  title: string;
  message: string;
  /** What to do about it, when there is anything useful to say. */
  nextStep: string | null;
}

export function PolarCheckoutButton({
  planId,
  planName,
  priceLabel,
}: {
  planId: PlanId;
  planName: string;
  /** e.g. `$9 per month` — used for the button label. Display only; never sent anywhere. */
  priceLabel: string;
}) {
  const copy = useCopy();

  const [starting, setStarting] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);

  /**
   * Guards the window between "navigation started" and "the browser actually left".
   *
   * `location.assign` does not stop React, and on a slow connection the page stays
   * interactive for a noticeable moment afterwards. Without this, an impatient second click
   * opens a second checkout session — two ledger rows, and a customer who can pay twice for
   * one plan. `starting` alone does not cover it, because the failure paths clear that.
   */
  const leaving = useRef(false);

  const start = useCallback(async () => {
    if (leaving.current) return;

    setStarting(true);
    setFailure(null);

    try {
      const response = await fetch('/api/payments/polar/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const payload = (await response.json().catch(() => null)) as CreateCheckoutResponse | null;

      if (!response.ok || !payload?.url) {
        const code = payload?.error?.code;
        setFailure({
          title: copy.checkout.startFailedTitle,
          /*
           * The server's English `message` is deliberately not rendered. It is written for
           * whoever reads the logs; this is read by whoever is holding the card, under a
           * translated heading. `serverError` returns null for a code with nothing specific
           * to say, so the fallback is our own translated sentence rather than the API's.
           */
          message: copy.checkout.serverError(code) ?? copy.checkout.startFailedBody,
          nextStep:
            code === 'unauthenticated'
              ? copy.checkout.nextSignIn
              : copy.checkout.nextSupport(site.supportEmail),
        });
        setStarting(false);
        trackEvent('payment_failed', { gateway: 'polar', reason: code ?? 'create-failed' });
        return;
      }

      trackEvent('checkout_started', { gateway: 'polar', plan: planId });

      /*
       * `location.assign`, not `router.push`. The destination is Polar's domain, so this is
       * a full navigation out of the app and not a route change — handing it to Next's
       * router would ask the client router to resolve a URL it has no route for.
       */
      leaving.current = true;
      window.location.assign(payload.url);
    } catch {
      /*
       * A network fault before the session exists. Nothing was created and nothing was
       * charged, so this is straightforwardly retryable — unlike a failure *after* the
       * redirect, which the success page handles and which must never be presented as
       * "nothing happened".
       */
      setFailure({
        title: copy.checkout.startFailedTitle,
        message: copy.checkout.offline,
        nextStep: null,
      });
      setStarting(false);
      trackEvent('payment_failed', { gateway: 'polar', reason: 'network' });
    }
  }, [copy, planId]);

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={() => void start()} disabled={starting} className="w-full">
        {starting ? copy.checkout.opening : copy.checkout.payNow(priceLabel)}
      </Button>

      <p className="text-center text-xs leading-relaxed text-ink-500">
        {copy.checkout.gatewayNote(planName)}
      </p>

      {failure ? (
        <Alert tone="danger">
          <span className="font-semibold">{failure.title}</span>
          <span className="mt-1 block">{failure.message}</span>
          {failure.nextStep ? <span className="mt-2 block">{failure.nextStep}</span> : null}
        </Alert>
      ) : null}
    </div>
  );
}
