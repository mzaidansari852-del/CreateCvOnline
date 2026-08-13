import { NextResponse } from 'next/server';
import { z } from 'zod';

import { apiError, authedRoute, readJson } from '@/lib/api/handler';
import { getPayment, markPaymentStatus } from '@/lib/db/payments';
import { paymentStatusSchema } from '@/types/payment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { orderId: string };

const bodySchema = z.object({
  /** Payments are stored per user, so the owner is needed to find the document. */
  userId: z.string().trim().min(1).max(128),
  status: paymentStatusSchema,
});

/**
 * Corrects the status recorded against an order — in practice, marking a refund.
 *
 * This is *bookkeeping only*. It rewrites our own ledger document and nothing else: PayPal
 * is not called, no money moves, the customer is not notified, and the account's
 * entitlement is untouched. The console says the same thing in the confirmation dialog,
 * because an operator who assumes otherwise leaves a customer unrefunded.
 *
 * The order must already exist. Without that check a typo in the order id would create a
 * brand-new payment document via the merge write.
 */
export const POST = authedRoute<Params>(
  {
    scope: 'admin-payment-status',
    requireAdmin: true,
    rateLimit: { max: 30, windowSeconds: 60 },
  },
  async ({ request, params }) => {
    const body = await readJson(request, bodySchema);

    const existing = await getPayment(body.userId, params.orderId);
    if (!existing) {
      return apiError(
        404,
        'not-found',
        'No order with that id exists for that account. Check the order id and the owner.',
      );
    }

    await markPaymentStatus(body.userId, params.orderId, body.status);

    return NextResponse.json({ ok: true, orderId: params.orderId, status: body.status });
  },
);
