import 'server-only';

import { adminDb, COLLECTIONS, hasAdminCredentials } from '@/lib/firebase/admin';
import { PLAN_ORDER } from '@/lib/plans';
import type { PaymentRecord } from '@/types/payment';
import type { PlanId } from '@/types/user';

/**
 * Server-side data plumbing for the admin console.
 *
 * Every page loads through `loadAdmin`, which turns the two failure modes an operator
 * actually hits — "no service-account credentials" and "the query blew up" — into a
 * value the page can render as an explanation, instead of an exception that replaces the
 * whole console with an error boundary.
 */

export interface AdminResult<T> {
  data: T | null;
  /** False when the Admin SDK has no credentials; nothing was attempted. */
  configured: boolean;
  /** Populated when the query itself failed. Safe to show: this page is admin-only. */
  error: string | null;
}

export async function loadAdmin<T>(load: () => Promise<T>): Promise<AdminResult<T>> {
  if (!hasAdminCredentials()) {
    return { data: null, configured: false, error: null };
  }
  try {
    return { data: await load(), configured: true, error: null };
  } catch (error) {
    console.error('[admin] data load failed:', error);
    return {
      data: null,
      configured: true,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Plan split                                                                  */
/* -------------------------------------------------------------------------- */

export interface PlanSplit {
  counts: Record<PlanId, number>;
  /** Accounts whose profile carries no recognised plan — usually pre-dating the field. */
  unassigned: number;
  total: number;
}

/**
 * Exact plan distribution, using Firestore count aggregations rather than reading every
 * document. Counts the *stored* plan: an expired paid entitlement still counts as paid
 * here until it is renewed or reset, which is what an operator chasing renewals wants.
 */
export async function planSplit(total: number): Promise<PlanSplit> {
  const db = adminDb();

  const entries = await Promise.all(
    PLAN_ORDER.map(async (planId) => {
      const snapshot = await db
        .collection(COLLECTIONS.users)
        .where('entitlement.plan', '==', planId)
        .count()
        .get();
      return [planId, snapshot.data().count] as const;
    }),
  );

  const counts = Object.fromEntries(entries) as Record<PlanId, number>;
  const assigned = entries.reduce((sum, [, count]) => sum + count, 0);

  return { counts, unassigned: Math.max(total - assigned, 0), total };
}

/* -------------------------------------------------------------------------- */
/* Trend buckets                                                               */
/* -------------------------------------------------------------------------- */

export interface DayBucket {
  /** `2026-08-12` — also the tooltip label. */
  label: string;
  value: number;
}

/**
 * Buckets payments into one point per day for the trailing `days` window.
 * Pure, so the overview page can reuse the payment list it already fetched.
 */
export function paymentsPerDay(payments: PaymentRecord[], days = 30): DayBucket[] {
  const buckets = new Map<string, number>();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - offset);
    buckets.set(date.toISOString().slice(0, 10), 0);
  }

  for (const payment of payments) {
    const key = payment.createdAt.slice(0, 10);
    const current = buckets.get(key);
    if (current !== undefined) buckets.set(key, current + 1);
  }

  return Array.from(buckets, ([label, value]) => ({ label, value }));
}
