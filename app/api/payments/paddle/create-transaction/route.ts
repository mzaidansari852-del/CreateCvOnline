import { NextResponse } from 'next/server';
import { z } from 'zod';

import { apiError, authedRoute, readJson } from '@/lib/api/handler';
import { recordOrderCreated } from '@/lib/db/payments';
import { PaddleError, gatewayFor } from '@/lib/payments';
import { getPlan, isPurchasablePlan } from '@/lib/plans';
import { publicEnv } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({ planId: z.string().trim().min(2).max(32) });

/**
 * Creates the Paddle transaction the checkout overlay will open against.
 *
 * The browser sends a plan id and nothing else. The price is Paddle's own, looked up from
 * the price id this deployment is configured with — there is no amount field anywhere in
 * the request, so there is nothing for a client to tamper with. A caller who asks for
 * `lifetime` is charged the real lifetime price or the request fails; it cannot ask to pay
 * less.
 *
 * The order is written to our ledger *before* the id goes back to the browser. That
 * ordering matters: if the write fails we would rather the customer never reach a payment
 * form than pay for something we have no record of.
 */
export const POST = authedRoute(
  { scope: 'paddle-create', rateLimit: { max: 12, windowSeconds: 60 } },
  async ({ request, profile }) => {
    const { planId } = await readJson(request, bodySchema);

    if (!isPurchasablePlan(planId)) {
      return apiError(400, 'invalid-plan', 'That plan cannot be purchased.');
    }

    const plan = getPlan(planId);

    try {
      const order = await gatewayFor('paddle').createOrder({
        planId,
        userId: profile.uid,
        // Paddle keeps the customer on our page and reports back through the overlay and
        // the webhook, so these are only used for the redirect fallback in Paddle.js.
        returnUrl: `/payment/success?plan=${planId}`,
        cancelUrl: `/payment/cancel?plan=${planId}`,
      });

      await recordOrderCreated({
        userId: profile.uid,
        orderId: order.orderId,
        planId,
        amount: plan.price,
        currency: publicEnv.storeCurrency,
        provider: 'paddle',
      });

      return NextResponse.json({ transactionId: order.orderId });
    } catch (error) {
      if (error instanceof PaddleError) {
        console.error(
          '[paddle] create transaction failed',
          JSON.stringify({
            status: error.status,
            wrapper: error.message,
            // Paddle's own error. It used to sit unread in `detail` while the log
            // repeated the sentence this file had just written.
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
