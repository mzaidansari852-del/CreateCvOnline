import { NextResponse, type NextRequest } from 'next/server';

import { fulfilPayment, getPayment, markPaymentStatus } from '@/lib/db/payments';
import { gatewayFor, paddleCaptureMatchesPlan, readWebhookTransaction } from '@/lib/payments';
import { isPaddleConfigured } from '@/lib/env';
import { isPurchasablePlan } from '@/lib/plans';
import type { PlanId } from '@/types/user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Paddle's webhook — the authoritative path for granting a plan.
 *
 * The verify route exists so the customer sees their plan immediately; this is the one
 * that is actually relied upon. It runs with no session, no cookies and no user in
 * context, so every fact it acts on has to come from the signed payload or from Paddle's
 * own API.
 *
 * ## The order of operations is the security property
 *
 * The body is read as raw text *before* anything parses it, because the signature is over
 * the exact bytes Paddle sent. Parsing first and re-serialising would change key order and
 * whitespace, and the signature would never match — or worse, would match a document
 * different from the one that was signed.
 *
 * Nothing is trusted until `verifyWebhook` returns true. After that, the *user* comes from
 * `customData` (which we set at creation and Paddle echoes back untouched) and the *plan*
 * comes from the price id, mapped through our own configuration. An event naming a price
 * this deployment does not know about grants nothing.
 *
 * ## Why it answers 200 to things it ignores
 *
 * Paddle retries non-2xx responses with backoff. An event we do not handle, or one for a
 * user who no longer exists, is not a failure Paddle can fix by sending it again — so it
 * is acknowledged and dropped. Only a genuinely retryable fault returns 5xx. A bad
 * signature returns 401, because that one should be visible in their dashboard.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isPaddleConfigured()) {
    return NextResponse.json({ error: 'paddle-not-configured' }, { status: 503 });
  }

  const rawBody = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const verified = await gatewayFor('paddle').verifyWebhook(headers, rawBody);
  if (!verified) {
    console.error('[paddle] webhook signature rejected');
    return NextResponse.json({ error: 'invalid-signature' }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    // Signed but unparseable should never happen; retrying will not fix it.
    console.error('[paddle] webhook body was not JSON');
    return NextResponse.json({ received: true, ignored: 'unparseable' });
  }

  const parsed = readWebhookTransaction(event);
  if (!parsed) return NextResponse.json({ received: true, ignored: 'unreadable' });

  const { eventType, transactionId, userId, planId, status } = parsed;

  /*
   * Only completion moves money. `transaction.paid` and `transaction.completed` both mean
   * the customer has been charged; Paddle sends `paid` first for some payment methods and
   * `completed` once the transaction is finalised, so both are honoured and the second is
   * absorbed by the idempotent fulfilment.
   */
  const grants = eventType === 'transaction.completed' || eventType === 'transaction.paid';
  if (!grants) {
    return NextResponse.json({ received: true, ignored: eventType });
  }

  if (!transactionId || !userId || !planId || !isPurchasablePlan(planId)) {
    console.error(
      '[paddle] webhook missing attribution',
      JSON.stringify({ eventType, transactionId, hasUser: Boolean(userId), planId }),
    );
    return NextResponse.json({ received: true, ignored: 'unattributable' });
  }

  const existing = await getPayment(userId, transactionId);
  if (existing?.status === 'completed') {
    return NextResponse.json({ received: true, alreadyFulfilled: true });
  }

  try {
    /*
     * Read the transaction back rather than trusting the payload's totals.
     *
     * The signature already proves Paddle sent this, so this is not about forgery — it is
     * about the payload being a snapshot. Re-reading gives the final amount after any
     * adjustment, and it is the same code path the verify route uses, so the two cannot
     * drift into disagreeing about what counts as paid.
     */
    const capture = await gatewayFor('paddle').getOrder(transactionId);

    if (capture.status !== 'completed') {
      await markPaymentStatus(userId, transactionId, capture.status);
      return NextResponse.json({ received: true, ignored: `status:${status}` });
    }

    if (!paddleCaptureMatchesPlan(capture, planId)) {
      await markPaymentStatus(userId, transactionId, 'failed');
      console.error(
        '[paddle] webhook amount mismatch',
        JSON.stringify({ transactionId, planId, amount: capture.amount, currency: capture.currency }),
      );
      return NextResponse.json({ received: true, ignored: 'amount-mismatch' });
    }

    await fulfilPayment({
      userId,
      planId: planId as PlanId,
      capture,
      provider: 'paddle',
    });

    return NextResponse.json({ received: true, fulfilled: true });
  } catch (error) {
    // A 5xx asks Paddle to try again, which is right for a transient fault on our side.
    console.error('[paddle] webhook fulfilment failed', error);
    return NextResponse.json({ error: 'fulfilment-failed' }, { status: 500 });
  }
}
