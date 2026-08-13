import { NextResponse } from 'next/server';
import { z } from 'zod';

import { apiError, authedRoute, readJson } from '@/lib/api/handler';
import { getUserProfile, setEntitlement } from '@/lib/db/users';
import { computePeriodEnd, PLANS } from '@/lib/plans';
import { planIdSchema, type UserEntitlement } from '@/types/user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { uid: string };

const bodySchema = z.object({
  planId: planIdSchema,
  /** Overrides the plan's own access window. Omit to use the plan default. */
  days: z.number().int().min(1).max(3650).optional(),
});

function addDays(from: Date, days: number): string {
  const end = new Date(from);
  end.setUTCDate(end.getUTCDate() + days);
  return end.toISOString();
}

/**
 * Sets an account's entitlement by hand — comped accounts, support fixes, and undoing a
 * failed fulfilment.
 *
 * The plan is validated against `lib/plans.ts`, the single definition of what a plan may
 * do, so this route can never grant access to a plan the rest of the app does not know
 * about. No payment record is created: this is a grant, not a sale, and the ledger should
 * keep saying that no money changed hands.
 */
export const POST = authedRoute<Params>(
  {
    scope: 'admin-user-plan',
    requireAdmin: true,
    rateLimit: { max: 30, windowSeconds: 60 },
  },
  async ({ request, params }) => {
    const body = await readJson(request, bodySchema);

    const plan = PLANS[body.planId];
    if (!plan) {
      return apiError(422, 'unknown-plan', 'That plan does not exist.');
    }

    const target = await getUserProfile(params.uid);
    if (!target) {
      return apiError(404, 'not-found', 'There is no account with that identifier.');
    }

    const now = new Date();
    const entitlement: UserEntitlement = {
      plan: plan.id,
      // A manual downgrade to free is not a lapsed subscription — it is "never bought".
      status: plan.id === 'free' ? 'none' : 'active',
      currentPeriodEnd:
        plan.id === 'free'
          ? null
          : body.days !== undefined
            ? addDays(now, body.days)
            : computePeriodEnd(plan, now),
      // Kept so support can still trace the last real payment after a manual change.
      lastPaymentId: target.entitlement.lastPaymentId,
      updatedAt: now.toISOString(),
    };

    await setEntitlement(params.uid, entitlement);

    return NextResponse.json({ ok: true, uid: params.uid, entitlement });
  },
);
