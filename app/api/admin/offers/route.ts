import { NextResponse } from 'next/server';

import { apiError, authedRoute, readJson } from '@/lib/api/handler';
import { readLaunchOfferRecord, writeLaunchOffer } from '@/lib/db/offers';
import { PLANS, listPrice } from '@/lib/plans';
import { launchOfferInputSchema } from '@/types/offer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** The stored offer, active or not — the admin form edits the document, not the effect. */
export const GET = authedRoute(
  { scope: 'admin-offers-read', requireAdmin: true, rateLimit: { max: 60, windowSeconds: 60 } },
  async () => NextResponse.json({ offer: await readLaunchOfferRecord() }),
);

/**
 * Saves the offer.
 *
 * Two things are checked here that the schema cannot express, because both are questions
 * about the plan the offer names rather than about the shape of the input.
 */
export const POST = authedRoute(
  { scope: 'admin-offers-write', requireAdmin: true, rateLimit: { max: 20, windowSeconds: 60 } },
  async ({ request, profile }) => {
    const input = await readJson(request, launchOfferInputSchema);

    const plan = PLANS[input.planId];

    /*
     * An offer on the free plan is meaningless, and one on a plan nobody can buy would show
     * a discounted price beside a button that does not lead to a checkout.
     */
    if (!plan?.purchasable) {
      return apiError(
        400,
        'invalid-plan',
        `${plan?.name ?? input.planId} is not sold, so it cannot be discounted.`,
      );
    }

    /*
     * A price at or above the list price is refused rather than saved.
     *
     * Not a matter of taste: the plan card renders the list price struck through beside the
     * offer price and states a percentage saved. An offer priced level with or above the
     * list price would draw a line through a number and claim a saving of zero or less,
     * which reads as a bug to a customer and as a lie to a regulator. Raising a price is a
     * change to `lib/plans.ts`; this endpoint only ever discounts.
     */
    const full = Number.parseFloat(listPrice(input.planId));
    const offered = Number.parseFloat(input.price);
    if (Number.isFinite(full) && offered >= full) {
      return apiError(
        400,
        'price-not-a-discount',
        `${plan.name} lists at ${full.toFixed(2)}. An offer has to be below that — it is shown as a saving against the list price.`,
      );
    }

    const saved = await writeLaunchOffer(input, profile.email ?? profile.uid);

    /*
     * Logged because it changes what customers are charged, and the ledger records the
     * amount per order rather than a history of the price itself. Without this line, "why
     * did this order say 6.00" has no answer six months from now.
     */
    console.warn(
      '[offers] launch offer updated',
      JSON.stringify({
        by: saved.updatedBy,
        active: saved.active,
        planId: saved.planId,
        price: saved.price,
        seats: saved.seats,
      }),
    );

    return NextResponse.json({ offer: saved });
  },
);
