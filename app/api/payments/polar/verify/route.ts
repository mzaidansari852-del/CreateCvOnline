import { NextResponse } from 'next/server';
import { z } from 'zod';

import { apiError, authedRoute, readJson } from '@/lib/api/handler';
import { fulfilPayment, getPayment, markPaymentStatus } from '@/lib/db/payments';
import { PolarError, gatewayFor, polarCaptureMatchesPlan } from '@/lib/payments';
import { getPlan } from '@/lib/plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
 * Polar checkout ids are UUIDs. Bounded rather than pattern-matched: a stricter schema
 * here would turn a future id format into a 400 for a customer who has already paid, and
 * the id is looked up in our own ledger on the next line anyway.
 */
const bodySchema = z.object({ checkoutId: z.string().trim().min(8).max(64) });

/**
 * Confirms a Polar checkout and grants access.
 *
 * ## Why this exists when there is also a webhook
 *
 * The webhook is authoritative and will grant the plan on its own. This route exists for
 * the customer standing in front of the screen: Polar redirects them back the moment
 * payment succeeds, and the webhook may be seconds behind it. Without this, the success
 * page would have to poll or lie. Both paths converge on `fulfilPayment`, which is keyed by
 * checkout id inside a Firestore transaction, so whichever arrives second is a no-op.
 *
 * ## What is actually trusted
 *
 * Only the checkout id comes from the browser, and it is treated as a *question*, not an
 * answer — which is exactly what Polar's own documentation asks for when it says not to
 * treat the success redirect as proof of payment. Everything else is read back from Polar:
 *
 *   1. the checkout is in our ledger and belongs to the caller,
 *   2. Polar itself reports it as succeeded,
 *   3. it was billed against the product configured for that plan,
 *   4. fulfilment is idempotent.
 *
 * Step 1 is what stops a signed-in user pasting somebody else's checkout id and collecting
 * a plan for a payment they did not make.
 */
export const POST = authedRoute(
  { scope: 'polar-verify', rateLimit: { max: 12, windowSeconds: 60 } },
  async ({ request, profile }) => {
    const { checkoutId } = await readJson(request, bodySchema);

    const existing = await getPayment(profile.uid, checkoutId);
    if (!existing) {
      return apiError(
        404,
        'unknown-order',
        'We have no record of that checkout. If money left your account, contact support and quote the Polar checkout id.',
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
      const capture = await gatewayFor('polar').captureOrder(checkoutId);

      if (capture.status !== 'completed') {
        await markPaymentStatus(profile.uid, checkoutId, capture.status);
        return apiError(
          402,
          'payment-not-completed',
          `Polar reported this payment as "${capture.status}". Nothing has been charged to your account for it.`,
        );
      }

      if (!polarCaptureMatchesPlan(capture, existing.planId)) {
        await markPaymentStatus(profile.uid, checkoutId, 'failed');
        console.error(
          '[polar] product mismatch',
          JSON.stringify({
            checkoutId,
            expected: getPlan(existing.planId).price,
            received: capture.amount,
            currency: capture.currency,
          }),
        );
        return apiError(
          409,
          'amount-mismatch',
          'The payment does not match the plan it was for. Your access has not been changed — please contact support.',
        );
      }

      const result = await fulfilPayment({
        userId: profile.uid,
        planId: existing.planId,
        capture,
        provider: 'polar',
      });

      return NextResponse.json({
        status: 'completed',
        planId: existing.planId,
        alreadyFulfilled: result.alreadyFulfilled,
        entitlement: result.entitlement,
      });
    } catch (error) {
      if (error instanceof PolarError) {
        console.error('[polar] verify failed', error.message, error.status);
        /*
         * Deliberately not marked failed. Polar being unreachable says nothing about
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
