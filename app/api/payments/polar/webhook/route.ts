import { NextResponse, type NextRequest } from 'next/server';

import {
  fulfilPayment,
  getPayment,
  markPaymentStatus,
  recordOrderCreated,
  refundPayment,
} from '@/lib/db/payments';
import {
  orderToCaptureResult,
  polarCaptureMatchesPlan,
  readPolarWebhookEvent,
  readWebhookOrder,
} from '@/lib/payments';
import { isPolarConfigured, publicEnv } from '@/lib/env';
import { getPlan, isPurchasablePlan } from '@/lib/plans';
import type { PlanId } from '@/types/user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Polar's webhook — the authoritative path for granting a plan.
 *
 * The verify route exists so the customer sees their plan immediately; this is the one
 * that is actually relied upon. It runs with no session, no cookies and no user in
 * context, so every fact it acts on comes from the signed payload or from our own
 * configuration.
 *
 * ## The order of operations is the security property
 *
 * The body is read as raw text *before* anything parses it, because the signature is over
 * the exact bytes Polar sent. Parsing first and re-serialising would change key order and
 * whitespace, and the signature would never match — or worse, would match a document
 * different from the one that was signed. `readPolarWebhookEvent` verifies and parses in
 * one call precisely so that ordering cannot be got wrong here.
 *
 * ## Why it answers 200 to things it ignores
 *
 * Polar retries non-2xx responses with backoff. An event we do not handle, or one for a
 * user who no longer exists, is not a failure Polar can fix by sending it again — so it is
 * acknowledged and dropped. Only a genuinely retryable fault returns 5xx. A bad signature
 * returns 403, because that one should be visible in their dashboard.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isPolarConfigured()) {
    return NextResponse.json({ error: 'polar-not-configured' }, { status: 503 });
  }

  const rawBody = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const outcome = await readPolarWebhookEvent(headers, rawBody);

  if (!outcome.ok) {
    if (outcome.reason === 'unverified') {
      console.error('[polar] webhook signature rejected');
      return NextResponse.json({ error: 'invalid-signature' }, { status: 403 });
    }
    /*
     * Signed correctly, but this SDK version has no schema for the type. Polar's guidance
     * is to acknowledge it: redelivery cannot fix a type we do not know, and a non-2xx
     * would have Polar retrying for hours over an event we would ignore anyway.
     */
    if (outcome.reason === 'unknown-type') {
      console.warn('[polar] ignoring signed webhook of unknown type', outcome.eventType);
      return NextResponse.json({ received: true, ignored: 'unknown-type' });
    }
    console.error('[polar] webhook body was signed but unreadable');
    return NextResponse.json({ received: true, ignored: 'malformed' });
  }

  const parsed = readWebhookOrder(outcome.event);
  if (!parsed) return NextResponse.json({ received: true, ignored: 'unreadable' });

  const { eventType, orderId, checkoutId, userId, planId, order } = parsed;

  /*
   * The ledger is keyed by the id we wrote when the session was created — the checkout id.
   * A first payment carries it. A subscription **renewal** does not: Polar bills the
   * subscription and creates an order with no checkout behind it, so the order id becomes
   * the key and a fresh ledger row is opened below. Without this branch every monthly
   * renewal would land on the first purchase's row, be seen as already fulfilled, and
   * silently never extend the customer's access.
   */
  const ledgerKey = checkoutId ?? orderId;

  if (eventType === 'order.refunded') {
    if (!userId || !ledgerKey) {
      return NextResponse.json({ received: true, ignored: 'unattributable-refund' });
    }
    const { revoked } = await refundPayment(userId, ledgerKey);
    console.warn(
      '[polar] refund processed',
      JSON.stringify({ userId, ledgerKey, entitlementRevoked: revoked }),
    );
    return NextResponse.json({ received: true, refunded: true, revoked });
  }

  /*
   * `order.paid` is the only event that grants. `order.created` fires before money has
   * moved and `checkout.updated` reports a session changing state, neither of which is a
   * payment. Acknowledged and dropped.
   */
  if (eventType !== 'order.paid') {
    return NextResponse.json({ received: true, ignored: eventType });
  }

  if (!ledgerKey || !userId || !planId || !isPurchasablePlan(planId)) {
    console.error(
      '[polar] webhook missing attribution',
      JSON.stringify({ eventType, orderId, checkoutId, hasUser: Boolean(userId), planId }),
    );
    return NextResponse.json({ received: true, ignored: 'unattributable' });
  }

  const existing = await getPayment(userId, ledgerKey);
  if (existing?.status === 'completed') {
    return NextResponse.json({ received: true, alreadyFulfilled: true });
  }

  try {
    /*
     * The capture is built from the signed payload rather than re-read from the API.
     *
     * This is the one place the Polar flow deliberately differs from the Paddle one, which
     * re-read the transaction. Polar's `order.paid` already carries the final, settled
     * totals — that is what "paid" means — whereas a Paddle transaction could still be
     * adjusted after the event fired. Re-reading here would buy nothing and add a network
     * call that can fail on the path that matters most.
     *
     * The signature is what makes this safe: the payload is proven to have come from Polar
     * unmodified. It is still not trusted about *what plan it bought* — that comes from the
     * product id mapped through our own configuration, checked below.
     */
    const capture = orderToCaptureResult(order, ledgerKey);

    if (capture.status !== 'completed') {
      if (existing) await markPaymentStatus(userId, ledgerKey, capture.status);
      return NextResponse.json({ received: true, ignored: `status:${capture.status}` });
    }

    if (!polarCaptureMatchesPlan(capture, planId)) {
      if (existing) await markPaymentStatus(userId, ledgerKey, 'failed');
      console.error(
        '[polar] webhook product mismatch',
        JSON.stringify({ ledgerKey, planId, amount: capture.amount, currency: capture.currency }),
      );
      return NextResponse.json({ received: true, ignored: 'product-mismatch' });
    }

    /*
     * A renewal has no ledger row yet, because nobody visited a checkout to create one.
     * Opening it here keeps the invariant the rest of the system relies on — every
     * fulfilled payment has a row that predates its fulfilment — and gives support a
     * record of the renewal rather than a silent entitlement extension.
     */
    if (!existing) {
      await recordOrderCreated({
        userId,
        orderId: ledgerKey,
        planId: planId as PlanId,
        amount: capture.amount || getPlan(planId).price,
        currency: capture.currency || publicEnv.storeCurrency,
        provider: 'polar',
      });
    }

    await fulfilPayment({
      userId,
      planId: planId as PlanId,
      capture,
      provider: 'polar',
    });

    return NextResponse.json({ received: true, fulfilled: true });
  } catch (error) {
    // A 5xx asks Polar to try again, which is right for a transient fault on our side.
    console.error('[polar] webhook fulfilment failed', error);
    return NextResponse.json({ error: 'fulfilment-failed' }, { status: 500 });
  }
}
