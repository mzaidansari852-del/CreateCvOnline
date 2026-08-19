import { NextResponse } from 'next/server';
import { z } from 'zod';

import { apiError, authedRoute, readJson } from '@/lib/api/handler';
import { fulfilPayment, getPayment, markPaymentStatus } from '@/lib/db/payments';
import { captureMatchesPlan, gateway } from '@/lib/payments';
import { PayPalError } from '@/lib/payments/paypal';
import { getPlan } from '@/lib/plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({ orderId: z.string().trim().min(4).max(64) });

/**
 * Captures an approved PayPal order and grants access.
 *
 * The browser's claim that a payment succeeded is treated as a *prompt to check*, never
 * as evidence. Four things are verified before anything is granted:
 *
 *   1. the order exists in our ledger and belongs to the caller,
 *   2. PayPal itself reports the capture as COMPLETED,
 *   3. the captured amount and currency match the plan's real price,
 *   4. the order has not already been fulfilled (idempotency).
 */
export const POST = authedRoute(
  { scope: 'paypal-capture', rateLimit: { max: 12, windowSeconds: 60 } },
  async ({ request, profile }) => {
    const { orderId } = await readJson(request, bodySchema);

    // (1) The order must have been created by this user, through us.
    const existing = await getPayment(profile.uid, orderId);
    if (!existing) {
      return apiError(
        404,
        'unknown-order',
        'We have no record of that order. If money left your account, contact support and quote the PayPal transaction id.',
      );
    }

    if (existing.status === 'completed') {
      return NextResponse.json({
        status: 'completed',
        planId: existing.planId,
        alreadyFulfilled: true,
      });
    }

    try {
      const capture = await gateway().captureOrder(orderId);

      // (2) PayPal's own verdict.
      if (capture.status !== 'completed') {
        await markPaymentStatus(profile.uid, orderId, capture.status);
        return apiError(
          402,
          'payment-not-completed',
          `PayPal reported this payment as "${capture.status}". Nothing has been charged to your account for it.`,
        );
      }

      // (3) The money that moved must match the plan that was ordered.
      if (!captureMatchesPlan(capture, existing.planId)) {
        await markPaymentStatus(profile.uid, orderId, 'failed');
        console.error(
          '[paypal] amount mismatch',
          JSON.stringify({
            orderId,
            expected: getPlan(existing.planId).price,
            received: capture.amount,
            currency: capture.currency,
          }),
        );
        return apiError(
          409,
          'amount-mismatch',
          'The captured amount does not match the plan price. Your access has not been changed — please contact support.',
        );
      }

      // (4) Fulfilment is a transaction keyed by order id, so a retry is a no-op.
      const result = await fulfilPayment({
        userId: profile.uid,
        planId: existing.planId,
        capture,
      });

      return NextResponse.json({
        status: 'completed',
        planId: existing.planId,
        alreadyFulfilled: result.alreadyFulfilled,
        entitlement: result.entitlement,
      });
    } catch (error) {
      if (error instanceof PayPalError) {
        console.error('[paypal] capture failed', error.message, error.debugId);
        await markPaymentStatus(profile.uid, orderId, 'failed');
        return apiError(
          502,
          'payment-provider-error',
          'PayPal could not complete this payment. If you were charged, it will be refunded automatically within a few days.',
        );
      }
      throw error;
    }
  },
);
