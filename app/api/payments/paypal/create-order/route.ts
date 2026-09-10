import { NextResponse } from 'next/server';
import { z } from 'zod';

import { apiError, authedRoute, readJson } from '@/lib/api/handler';
import { recordOrderCreated } from '@/lib/db/payments';
import { readLaunchOffer } from '@/lib/db/offers';
import { PayPalError, gatewayFor } from '@/lib/payments';
import { applyOffer, getPlan, isPurchasablePlan } from '@/lib/plans';
import { publicEnv } from '@/lib/env';
import { absoluteUrl } from '@/lib/site';
import { planIdSchema } from '@/types/user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({ planId: planIdSchema });

/**
 * Starts a PayPal order.
 *
 * The browser sends a plan id and nothing else. The amount is read from `lib/plans.ts`
 * server-side, so there is no field a client could tamper with to change the price.
 */
export const POST = authedRoute(
  { scope: 'paypal-create', rateLimit: { max: 12, windowSeconds: 60 } },
  async ({ request, profile }) => {
    const { planId } = await readJson(request, bodySchema);

    if (!isPurchasablePlan(planId)) {
      return apiError(400, 'invalid-plan', 'That plan cannot be purchased.');
    }

    /*
     * The price is resolved here, once, and then used for both the charge and the ledger.
     *
     * Reading it twice would be the bug: the offer is editable from `/admin/offers`, so two
     * reads a few milliseconds apart can disagree, and the ledger would then record a figure
     * different from the one PayPal was asked for. The capture is verified against the
     * ledger, so that disagreement would surface as a failed payment for a customer who did
     * nothing wrong.
     */
    const plan = applyOffer(getPlan(planId), await readLaunchOffer());
    const amount = plan.price;

    try {
      const order = await gatewayFor('paypal').createOrder({
        planId,
        userId: profile.uid,
        amount,
        returnUrl: absoluteUrl(`/payment/success?plan=${planId}`),
        cancelUrl: absoluteUrl(`/payment/cancel?plan=${planId}`),
      });

      await recordOrderCreated({
        userId: profile.uid,
        orderId: order.orderId,
        planId,
        amount,
        currency: publicEnv.storeCurrency,
        provider: 'paypal',
      });

      return NextResponse.json({
        orderId: order.orderId,
        approveUrl: order.approveUrl ?? null,
      });
    } catch (error) {
      if (error instanceof PayPalError) {
        console.error(
          '[paypal] create order failed',
          `status=${error.status}`,
          `issue=${error.issue ?? 'none'}`,
          `debugId=${error.debugId ?? 'none'}`,
          error.message,
        );
        // The issue code and debug id go back to the browser. Neither is a secret —
        // `debug_id` is the reference PayPal's own support asks for — and without them a
        // payment failure is unactionable for the person it happened to, who has no way
        // to read a server log. The prose message stays generic.
        return apiError(
          502,
          'payment-provider-error',
          'PayPal could not start this payment. Please try again.',
          { issue: error.issue ?? null, reference: error.debugId ?? null },
        );
      }
      throw error;
    }
  },
);
