import { NextResponse, type NextRequest } from 'next/server';

import { fulfilPayment, markPaymentStatus } from '@/lib/db/payments';
import { captureMatchesPlan, gateway, readCustomId } from '@/lib/payments';
import { isPayPalConfigured } from '@/lib/env';
import { isPurchasablePlan } from '@/lib/plans';
import type { PlanId } from '@/types/user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * PayPal webhook receiver.
 *
 * The browser-driven capture flow is the happy path; this endpoint is the safety net for
 * the cases it cannot cover — the user closing the tab mid-redirect, a payment that
 * settles asynchronously, or a refund issued later from the PayPal dashboard.
 *
 * Every event is signature-verified against PayPal's API before it is acted on. When
 * `PAYPAL_WEBHOOK_ID` is not configured, verification is impossible, so events are
 * rejected rather than trusted — an unauthenticated endpoint that grants paid access
 * would be the single worst bug in this codebase.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isPayPalConfigured()) {
    return NextResponse.json({ error: 'not-configured' }, { status: 503 });
  }

  const rawBody = await request.text();

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const verified = await gateway().verifyWebhook(headers, rawBody);
  if (!verified) {
    console.warn('[paypal] rejected an unverified webhook');
    return NextResponse.json({ error: 'signature-verification-failed' }, { status: 401 });
  }

  let event: {
    event_type?: string;
    resource?: {
      id?: string;
      status?: string;
      custom_id?: string;
      supplementary_data?: { related_ids?: { order_id?: string } };
      amount?: { value?: string; currency_code?: string };
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }

  const type = event.event_type ?? '';
  const resource = event.resource ?? {};
  const identity = readCustomId(resource.custom_id);

  // Without a custom_id we cannot attribute the event to an account. Acknowledge it so
  // PayPal stops retrying, and log it for manual reconciliation.
  if (!identity || !isPurchasablePlan(identity.planId)) {
    console.warn('[paypal] webhook without a resolvable custom_id', type, resource.id);
    return NextResponse.json({ received: true, handled: false });
  }

  const orderId =
    resource.supplementary_data?.related_ids?.order_id ?? resource.id ?? '';
  if (!orderId) {
    return NextResponse.json({ received: true, handled: false });
  }

  const planId = identity.planId as PlanId;

  try {
    switch (type) {
      case 'CHECKOUT.ORDER.APPROVED':
        await markPaymentStatus(identity.userId, orderId, 'approved');
        break;

      case 'PAYMENT.CAPTURE.COMPLETED': {
        // Re-read from PayPal rather than trusting the event body, then apply the same
        // amount check the interactive path uses.
        const capture = await gateway().getOrder(orderId);
        if (capture.status === 'completed' && captureMatchesPlan(capture, planId)) {
          await fulfilPayment({ userId: identity.userId, planId, capture });
        } else {
          console.error('[paypal] webhook capture failed verification', orderId);
          await markPaymentStatus(identity.userId, orderId, 'failed');
        }
        break;
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED':
        await markPaymentStatus(identity.userId, orderId, 'failed');
        break;

      case 'PAYMENT.CAPTURE.REFUNDED':
      case 'PAYMENT.CAPTURE.REVERSED':
        await markPaymentStatus(identity.userId, orderId, 'refunded');
        break;

      case 'CHECKOUT.ORDER.VOIDED':
        await markPaymentStatus(identity.userId, orderId, 'cancelled');
        break;

      default:
        return NextResponse.json({ received: true, handled: false, type });
    }
  } catch (error) {
    console.error('[paypal] webhook handling failed', type, error);
    // A 500 makes PayPal retry with backoff, which is what we want for a transient fault.
    return NextResponse.json({ error: 'handler-failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true, handled: true, type });
}
