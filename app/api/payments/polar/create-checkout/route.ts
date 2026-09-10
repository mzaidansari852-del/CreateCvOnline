import { NextResponse } from 'next/server';
import { z } from 'zod';

import { apiError, authedRoute, readJson } from '@/lib/api/handler';
import { recordOrderCreated } from '@/lib/db/payments';
import { readLaunchOffer } from '@/lib/db/offers';
import { PolarError, gatewayFor } from '@/lib/payments';
import { applyOffer, getPlan, isPurchasablePlan } from '@/lib/plans';
import { publicEnv } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({ planId: z.string().trim().min(2).max(32) });

/**
 * Creates the Polar checkout session and returns the URL to send the customer to.
 *
 * The browser sends a plan id and nothing else. The price is Polar's own, looked up from
 * the product id this deployment is configured with — there is no amount field anywhere in
 * the request, so there is nothing for a client to tamper with. A caller who asks for
 * `lifetime` is charged the real lifetime price or the request fails; it cannot ask to pay
 * less.
 *
 * The order is written to our ledger *before* the URL goes back to the browser. That
 * ordering matters: if the write fails we would rather the customer never reach a payment
 * form than pay for something we have no record of.
 *
 * ## What changed from the Paddle version
 *
 * Paddle returned a transaction id for its overlay to open against, in place. Polar hosts
 * the checkout, so this returns a URL and the browser navigates away. The ledger row is
 * still keyed by the id — the Polar checkout id — so the rest of the pipeline, including
 * `fulfilPayment`'s idempotency, is unchanged.
 */
export const POST = authedRoute(
  { scope: 'polar-create', rateLimit: { max: 12, windowSeconds: 60 } },
  async ({ request, profile }) => {
    const { planId } = await readJson(request, bodySchema);

    if (!isPurchasablePlan(planId)) {
      return apiError(400, 'invalid-plan', 'That plan cannot be purchased.');
    }

    // Resolved once and used for the ledger. Polar charges from its own product; the
    // figure recorded here is what the customer was quoted and what a capture is checked
    // against, so it must be the same read.
    const plan = applyOffer(getPlan(planId), await readLaunchOffer());

    try {
      const order = await gatewayFor('polar').createOrder({
        planId,
        userId: profile.uid,
        amount: plan.price,
        returnUrl: `/payment/success?plan=${planId}`,
        cancelUrl: `/payment/cancel?plan=${planId}`,
      });

      /*
       * Polar always returns a URL for a hosted checkout, but the interface types it as
       * optional because a provider need not have one. Treated as a provider fault rather
       * than asserted away: without it the browser has nowhere to go, and a ledger row for
       * a checkout nobody can reach is worse than a clean failure.
       */
      if (!order.approveUrl) {
        console.error('[polar] checkout session created without a URL', order.orderId);
        return apiError(
          502,
          'payment-provider-error',
          'We could not start the checkout. Nothing has been charged — please try again in a moment.',
        );
      }

      await recordOrderCreated({
        userId: profile.uid,
        orderId: order.orderId,
        planId,
        amount: plan.price,
        currency: publicEnv.storeCurrency,
        provider: 'polar',
      });

      return NextResponse.json({ checkoutId: order.orderId, url: order.approveUrl });
    } catch (error) {
      if (error instanceof PolarError) {
        console.error(
          '[polar] create checkout failed',
          JSON.stringify({
            status: error.status,
            wrapper: error.message,
            // Polar's own error, which otherwise sits unread in `detail` while the log
            // repeats the sentence this file just wrote.
            cause:
              error.detail instanceof Error
                ? error.detail.message
                : typeof error.detail === 'string'
                  ? error.detail
                  : JSON.stringify(error.detail),
          }),
        );
        return apiError(
          error.status === 503 ? 503 : 502,
          'payment-provider-error',
          'We could not start the checkout. Nothing has been charged — please try again in a moment.',
        );
      }
      throw error;
    }
  },
);
