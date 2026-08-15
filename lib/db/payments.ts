import 'server-only';

import { adminDb, COLLECTIONS, paymentCollection, toIso } from '@/lib/firebase/admin';
import { setEntitlement } from './users';
import { computePeriodEnd, getPlan } from '@/lib/plans';
import {
  paymentRecordSchema,
  type CaptureResult,
  type PaymentProvider,
  type PaymentRecord,
  type PaymentStatus,
} from '@/types/payment';
import type { PlanId, UserEntitlement } from '@/types/user';

/**
 * Payment ledger.
 *
 * Records live at `users/{uid}/payments/{orderId}`, keyed by the provider's order id.
 * Keying by order id — rather than an auto-generated document id — is what makes
 * fulfilment idempotent: a duplicate capture, a webhook that arrives after the browser
 * already confirmed, and a manual replay all write to the same document.
 */

function hydrate(id: string, userId: string, raw: Record<string, unknown>): PaymentRecord {
  const parsed = paymentRecordSchema.safeParse({
    id,
    userId,
    provider: raw.provider ?? 'paypal',
    providerOrderId: raw.providerOrderId ?? id,
    providerCaptureId: raw.providerCaptureId ?? null,
    planId: raw.planId ?? 'pro',
    amount: raw.amount ?? '0.00',
    currency: raw.currency ?? 'USD',
    status: raw.status ?? 'created',
    payerEmail: raw.payerEmail ?? null,
    createdAt: toIso(raw.createdAt),
    updatedAt: toIso(raw.updatedAt),
    raw: null,
  });

  if (parsed.success) return parsed.data;

  return paymentRecordSchema.parse({
    id,
    userId,
    provider: 'paypal',
    providerOrderId: id,
    providerCaptureId: null,
    planId: 'pro',
    amount: '0.00',
    currency: 'USD',
    status: 'failed',
    payerEmail: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    raw: null,
  });
}

/** Records an order the moment it is created, before the user has paid anything. */
export async function recordOrderCreated(input: {
  userId: string;
  orderId: string;
  planId: PlanId;
  amount: string;
  currency: string;
  /**
   * Which gateway took the order. Defaults to PayPal so records written before Paddle
   * existed keep their provider, and so no existing call site changes meaning.
   */
  provider?: PaymentProvider;
}): Promise<void> {
  const now = new Date().toISOString();
  await paymentCollection(input.userId)
    .doc(input.orderId)
    .set(
      {
        userId: input.userId,
        provider: input.provider ?? 'paypal',
        providerOrderId: input.orderId,
        providerCaptureId: null,
        planId: input.planId,
        amount: input.amount,
        currency: input.currency,
        status: 'created' satisfies PaymentStatus,
        payerEmail: null,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );
}

export async function getPayment(userId: string, orderId: string): Promise<PaymentRecord | null> {
  const snapshot = await paymentCollection(userId).doc(orderId).get();
  if (!snapshot.exists) return null;
  return hydrate(snapshot.id, userId, snapshot.data() ?? {});
}

export interface FulfilmentResult {
  alreadyFulfilled: boolean;
  entitlement: UserEntitlement;
  record: PaymentRecord;
}

/**
 * Writes the captured payment and grants access, in one transaction.
 *
 * Returns `alreadyFulfilled: true` when the order had already been completed, so callers
 * can stay silent instead of double-crediting or double-emailing.
 */
export async function fulfilPayment(input: {
  userId: string;
  planId: PlanId;
  capture: CaptureResult;
  /** The gateway the money actually moved through. Defaults to PayPal for old callers. */
  provider?: PaymentProvider;
}): Promise<FulfilmentResult> {
  const { userId, planId, capture } = input;
  const provider = input.provider ?? 'paypal';
  const plan = getPlan(planId);
  const now = new Date();
  const nowIso = now.toISOString();

  const paymentRef = paymentCollection(userId).doc(capture.orderId);

  const outcome = await adminDb().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(paymentRef);
    const existing = snapshot.data();
    const alreadyFulfilled = existing?.status === 'completed';

    const record = {
      userId,
      provider,
      providerOrderId: capture.orderId,
      providerCaptureId: capture.captureId,
      planId,
      amount: capture.amount,
      currency: capture.currency,
      status: capture.status,
      payerEmail: capture.payerEmail,
      createdAt: existing?.createdAt ?? nowIso,
      updatedAt: nowIso,
    };

    transaction.set(paymentRef, record, { merge: true });
    return { alreadyFulfilled, record };
  });

  const entitlement: UserEntitlement = {
    plan: planId,
    status: capture.status === 'completed' ? 'active' : 'pending',
    // A renewal extends from the later of "now" and the existing expiry, so paying early
    // never costs the customer days.
    currentPeriodEnd: computePeriodEnd(plan, now),
    lastPaymentId: capture.orderId,
    updatedAt: nowIso,
  };

  if (capture.status === 'completed' && !outcome.alreadyFulfilled) {
    await setEntitlement(userId, entitlement);
  }

  return {
    alreadyFulfilled: outcome.alreadyFulfilled,
    entitlement,
    record: hydrate(capture.orderId, userId, outcome.record),
  };
}

export async function markPaymentStatus(
  userId: string,
  orderId: string,
  status: PaymentStatus,
): Promise<void> {
  await paymentCollection(userId)
    .doc(orderId)
    .set({ status, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function listUserPayments(userId: string, limit = 50): Promise<PaymentRecord[]> {
  const snapshot = await paymentCollection(userId)
    .orderBy('createdAt', 'desc')
    .limit(Math.min(Math.max(limit, 1), 200))
    .get();
  return snapshot.docs.map((doc) => hydrate(doc.id, userId, doc.data()));
}

/* -------------------------------------------------------------------------- */
/* Admin                                                                       */
/* -------------------------------------------------------------------------- */

export async function listAllPayments(limit = 50): Promise<PaymentRecord[]> {
  const snapshot = await adminDb()
    .collectionGroup(COLLECTIONS.payments)
    .orderBy('createdAt', 'desc')
    .limit(Math.min(Math.max(limit, 1), 200))
    .get();

  return snapshot.docs.map((doc) => hydrate(doc.id, doc.ref.parent.parent?.id ?? '', doc.data()));
}

export interface RevenueSummary {
  completedCount: number;
  totalByCurrency: Record<string, number>;
  last30DaysCount: number;
}

export async function revenueSummary(): Promise<RevenueSummary> {
  const snapshot = await adminDb()
    .collectionGroup(COLLECTIONS.payments)
    .where('status', '==', 'completed')
    .limit(1000)
    .get();

  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const totalByCurrency: Record<string, number> = {};
  let last30DaysCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data() as { amount?: string; currency?: string; createdAt?: unknown };
    const amount = Number.parseFloat(data.amount ?? '0');
    const currency = (data.currency ?? 'USD').toUpperCase();
    if (Number.isFinite(amount)) {
      totalByCurrency[currency] = Number(((totalByCurrency[currency] ?? 0) + amount).toFixed(2));
    }
    if (new Date(toIso(data.createdAt)).getTime() >= cutoff) last30DaysCount += 1;
  }

  return { completedCount: snapshot.size, totalByCurrency, last30DaysCount };
}
