import { NextResponse } from 'next/server';
import { z } from 'zod';

import { apiError, authedRoute, readJson } from '@/lib/api/handler';
import { fulfilPayment, getPayment, markPaymentStatus } from '@/lib/db/payments';
import { PaddleError, gatewayFor, paddleCaptureMatchesPlan } from '@/lib/payments';
import { getPlan } from '@/lib/plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({ transactionId: z.string().trim().min(4).max(64) });

/**
 * Confirms a Paddle transaction and grants access.
 *
 * ## Why this exists when there is also a webhook
 *
 * The webhook is authoritative and will grant the plan on its own. This route exists for
 * the customer standing in front of the screen: Paddle's overlay closes the moment payment
 * succeeds, and the webhook may be seconds behind it. Without this, the success page would
 * have to poll or lie. Both paths converge on `fulfilPayment`, which is keyed by
 * transaction id inside a Firestore transaction, so whichever arrives second is a no-op.
 *
 * ## What is actually trusted
 *
 * Only the transaction id comes from the browser, and it is treated as a *question*, not
 * an answer. Everything else is read back from Paddle:
 *
 *   1. the transaction is in our ledger and belongs to the caller,
 *   2. Paddle itself reports it as completed,
 *   3. the amount matches the plan's real price,
 *   4. fulfilment is idempotent.
 *
 * Step 1 is what stops a signed-in user pasting somebody else's transaction id and
 * collecting a plan for a payment they did not make.
 */
export const POST = authedRoute(
  { scope: 'paddle-verify', rateLimit: { max: 12, windowSeconds: 60 } },
  async ({ request, profile }) => {
    const { transactionId } = await readJson(request, bodySchema);

    const existing = await getPayment(profile.uid, transactionId);
    if (!existing) {
      return apiError(
        404,
        'unknown-order',
        'We have no record of that transaction. If money left your account, contact support and quote the Paddle transaction id.',
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
      const capture = await gatewayFor('paddle').captureOrder(transactionId);

      if (capture.status !== 'completed') {
        await markPaymentStatus(profile.uid, transactionId, capture.status);
        return apiError(
          402,
          'payment-not-completed',
          `Paddle reported this payment as "${capture.status}". Nothing has been charged to your account for it.`,
        );
      }

      if (!paddleCaptureMatchesPlan(capture, existing.planId)) {
        await markPaymentStatus(profile.uid, transactionId, 'failed');
        console.error(
          '[paddle] amount mismatch',
          JSON.stringify({
            transactionId,
            expected: getPlan(existing.planId).price,
            received: capture.amount,
            currency: capture.currency,
          }),
        );
        return apiError(
          409,
          'amount-mismatch',
          'The amount paid does not match the plan price. Your access has not been changed — please contact support.',
        );
      }

      const result = await fulfilPayment({
        userId: profile.uid,
        planId: existing.planId,
        capture,
        provider: 'paddle',
      });

      return NextResponse.json({
        status: 'completed',
        planId: existing.planId,
        alreadyFulfilled: result.alreadyFulfilled,
        entitlement: result.entitlement,
      });
    } catch (error) {
      if (error instanceof PaddleError) {
        console.error('[paddle] verify failed', error.message, error.status);
        /*
         * Deliberately not marked failed. Paddle being unreachable says nothing about
         * whether the customer was charged, and writing `failed` here would make the
         * webhook's later success look like a contradiction in the support log.
         */
        return apiError(
          502,
          'payment-provider-error',
          'We could not confirm this payment yet. If you completed the checkout, your access will be granted automatically within a minute.',
        );
      }
      throw error;
    }
  },
);
