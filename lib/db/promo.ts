import 'server-only';

import { adminDb, COLLECTIONS, toIso } from '@/lib/firebase/admin';
import { setEntitlement } from './users';
import { computePeriodEnd, PLANS } from '@/lib/plans';
import {
  normalisePromoCode,
  promoCodeSchema,
  PROMO_CODE_PATTERN,
  type PromoCode,
  type PromoFailure,
  type PromoRedemption,
} from '@/types/promo';
import type { UserEntitlement, UserProfile } from '@/types/user';

/**
 * Promo code repository.
 *
 * The interesting function here is `redeemPromoCode`, and the interesting property is that
 * it runs entirely inside a Firestore transaction. Everything else is bookkeeping.
 */

function promoCollection() {
  return adminDb().collection(COLLECTIONS.promoCodes);
}

function redemptionCollection(code: string) {
  return promoCollection().doc(code).collection(COLLECTIONS.promoRedemptions);
}

function hydrate(id: string, raw: Record<string, unknown> | undefined): PromoCode | null {
  const parsed = promoCodeSchema.safeParse({
    code: id,
    kind: raw?.kind ?? 'grant',
    plan: raw?.plan ?? 'pro',
    days: raw?.days ?? null,
    maxRedemptions: raw?.maxRedemptions ?? null,
    redemptionCount: raw?.redemptionCount ?? 0,
    startsAt: raw?.startsAt ? toIso(raw.startsAt) : null,
    expiresAt: raw?.expiresAt ? toIso(raw.expiresAt) : null,
    active: raw?.active ?? true,
    note: raw?.note ?? '',
    createdBy: raw?.createdBy ?? '',
    createdAt: toIso(raw?.createdAt),
    updatedAt: toIso(raw?.updatedAt),
  });
  // A code we cannot parse must not be redeemable. Returning null refuses it rather than
  // guessing a plan for it — the opposite of how user profiles are healed on read, because
  // the failure mode here is granting access nobody authorised.
  return parsed.success ? parsed.data : null;
}

export interface PromoRedeemResult {
  ok: boolean;
  failure?: PromoFailure;
  code?: PromoCode;
  entitlement?: UserEntitlement;
}

/**
 * Redeems a code for a user, or explains why it could not be.
 *
 * ## Why this is a transaction
 *
 * A code with ten redemptions has to stop at ten. Read-then-write cannot promise that:
 * two people submitting the same code at the same moment both read `redemptionCount: 9`,
 * both decide there is room, and both write `10`. The counter says ten, eleven people have
 * access, and nothing in the data shows what happened. A code posted publicly is exactly
 * the situation where simultaneous redemptions are likely rather than theoretical.
 *
 * Inside the transaction the counter and the redemption marker are read and written
 * together, so the second attempt sees the first one's write and is refused.
 *
 * ## Why the entitlement is written after, not inside
 *
 * The transaction covers the promo documents only. Writing the entitlement inside it would
 * pull the user document into the same contention window, so two unrelated people redeeming
 * two unrelated codes could conflict with each other.
 *
 * The trade-off is a gap: the redemption is recorded and the process could in principle die
 * before the entitlement is granted. That direction is the safe one — the user has a
 * recorded redemption and no access, which support can see and fix in one click. The
 * reverse ordering would grant access with no record of why, which is unauditable.
 */
export async function redeemPromoCode(
  profile: UserProfile,
  rawCode: string,
): Promise<PromoRedeemResult> {
  const code = normalisePromoCode(rawCode);
  if (!PROMO_CODE_PATTERN.test(code)) return { ok: false, failure: 'not-found' };

  const now = new Date();
  const codeRef = promoCollection().doc(code);
  const redemptionRef = redemptionCollection(code).doc(profile.uid);

  const outcome = await adminDb().runTransaction<PromoRedeemResult>(async (transaction) => {
    const [codeSnapshot, redemptionSnapshot] = await Promise.all([
      transaction.get(codeRef),
      transaction.get(redemptionRef),
    ]);

    if (!codeSnapshot.exists) return { ok: false, failure: 'not-found' };

    const promo = hydrate(codeSnapshot.id, codeSnapshot.data());
    if (!promo) return { ok: false, failure: 'not-found' };

    // Checked before the limits, so someone re-entering their own code is told they already
    // have it rather than that the code is exhausted.
    if (redemptionSnapshot.exists) return { ok: false, failure: 'already-redeemed', code: promo };

    if (!promo.active) return { ok: false, failure: 'inactive', code: promo };
    if (promo.startsAt && now.getTime() < new Date(promo.startsAt).getTime()) {
      return { ok: false, failure: 'not-started', code: promo };
    }
    if (promo.expiresAt && new Date(promo.expiresAt).getTime() <= now.getTime()) {
      return { ok: false, failure: 'expired', code: promo };
    }
    if (promo.maxRedemptions !== null && promo.redemptionCount >= promo.maxRedemptions) {
      return { ok: false, failure: 'exhausted', code: promo };
    }

    const redemption: PromoRedemption = {
      uid: profile.uid,
      email: profile.email,
      plan: promo.plan,
      redeemedAt: now.toISOString(),
    };

    transaction.set(redemptionRef, redemption);
    transaction.update(codeRef, {
      redemptionCount: promo.redemptionCount + 1,
      updatedAt: now.toISOString(),
    });

    return { ok: true, code: promo };
  });

  if (!outcome.ok || !outcome.code) return outcome;

  const plan = PLANS[outcome.code.plan];
  const entitlement: UserEntitlement = {
    plan: outcome.code.plan,
    status: 'active',
    currentPeriodEnd: outcome.code.days
      ? addDays(now, outcome.code.days)
      : computePeriodEnd(plan, now),
    /*
     * Recorded where a payment id would go, prefixed so it can never be mistaken for one.
     * The billing history reads this field, and a bare code there would look like an order
     * reference that no provider has ever heard of.
     */
    lastPaymentId: `promo:${outcome.code.code}`,
    updatedAt: now.toISOString(),
  };

  await setEntitlement(profile.uid, entitlement);
  return { ...outcome, entitlement };
}

function addDays(from: Date, days: number): string {
  const end = new Date(from);
  end.setUTCDate(end.getUTCDate() + days);
  return end.toISOString();
}

/* -------------------------------------------------------------------------- */
/* Admin                                                                       */
/* -------------------------------------------------------------------------- */

export async function createPromoCode(input: {
  code: string;
  plan: PromoCode['plan'];
  days: number | null;
  maxRedemptions: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  note: string;
  createdBy: string;
}): Promise<{ ok: true; code: PromoCode } | { ok: false; reason: 'exists' | 'invalid' }> {
  const code = normalisePromoCode(input.code);
  if (!PROMO_CODE_PATTERN.test(code)) return { ok: false, reason: 'invalid' };

  const now = new Date().toISOString();
  const document: PromoCode = promoCodeSchema.parse({
    code,
    kind: 'grant',
    plan: input.plan,
    days: input.days,
    maxRedemptions: input.maxRedemptions,
    redemptionCount: 0,
    startsAt: input.startsAt,
    expiresAt: input.expiresAt,
    active: true,
    note: input.note,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  });

  const ref = promoCollection().doc(code);

  /*
   * `create()` rather than `set()`: it fails if the document exists, which is what stops a
   * second admin silently resetting a live code's redemption count to zero. `set()` would
   * have overwritten it and looked like success.
   */
  try {
    await ref.create({ ...document, code: undefined });
  } catch {
    return { ok: false, reason: 'exists' };
  }

  return { ok: true, code: document };
}

export async function listPromoCodes(limit = 100): Promise<PromoCode[]> {
  const snapshot = await promoCollection().orderBy('createdAt', 'desc').limit(limit).get();
  return snapshot.docs
    .map((doc) => hydrate(doc.id, doc.data()))
    .filter((code): code is PromoCode => code !== null);
}

export async function setPromoCodeActive(code: string, active: boolean): Promise<boolean> {
  const normalised = normalisePromoCode(code);
  const ref = promoCollection().doc(normalised);
  const snapshot = await ref.get();
  if (!snapshot.exists) return false;

  await ref.update({ active, updatedAt: new Date().toISOString() });
  return true;
}

/** Who redeemed a code, newest first. The audit trail behind `redemptionCount`. */
export async function listPromoRedemptions(code: string, limit = 100): Promise<PromoRedemption[]> {
  const snapshot = await redemptionCollection(normalisePromoCode(code))
    .orderBy('redeemedAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({
    uid: doc.id,
    email: typeof doc.data().email === 'string' ? doc.data().email : '',
    plan: doc.data().plan,
    redeemedAt: toIso(doc.data().redeemedAt),
  }));
}
