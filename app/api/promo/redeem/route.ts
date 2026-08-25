import { NextResponse } from 'next/server';
import { z } from 'zod';

import { apiError, authedRoute, readJson } from '@/lib/api/handler';
import { redeemPromoCode } from '@/lib/db/promo';
import { getPlan } from '@/lib/plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  code: z.string().trim().min(1).max(64),
});

/**
 * Redeems a promo code for the signed-in user.
 *
 * ## Why every refusal says the same thing
 *
 * `redeemPromoCode` distinguishes not-found, inactive, not-started, expired and exhausted.
 * This route collapses the first five into one message. That is deliberate, and it is the
 * only defence a short human-typed code has.
 *
 * A code is a secret with very little entropy — `FRIENDS2026` is guessable, and a campaign
 * code is published to an audience that can forward it anywhere. If the response
 * distinguished "no such code" from "that code has expired", the endpoint would answer
 * *"does this code exist?"* for anything anyone typed, and a script could enumerate live
 * codes from a wordlist in minutes. Identical refusals mean a guess learns nothing.
 *
 * `already-redeemed` is the one exception, and it is safe: reaching it requires having
 * already redeemed the code, so the person asking knows it exists. Telling them plainly
 * stops the support message that otherwise follows — someone re-entering their own code and
 * being told it is invalid reasonably concludes they have been cheated.
 *
 * The rate limit is the second half of the defence: five attempts a minute makes a wordlist
 * uneconomic even without the flattened errors.
 */
export const POST = authedRoute(
  {
    scope: 'promo-redeem',
    rateLimit: { max: 5, windowSeconds: 60 },
  },
  async ({ request, profile }) => {
    const body = await readJson(request, bodySchema);
    const result = await redeemPromoCode(profile, body.code);

    if (!result.ok) {
      if (result.failure === 'already-redeemed') {
        return apiError(
          409,
          'already-redeemed',
          'You have already used this code. Your access is on your account already.',
        );
      }

      return apiError(
        422,
        'invalid-code',
        'That code is not valid. Check it for typos, or ask whoever sent it whether it is still open.',
      );
    }

    const plan = getPlan(result.entitlement!.plan);

    return NextResponse.json({
      ok: true,
      plan: { id: plan.id, name: plan.name },
      currentPeriodEnd: result.entitlement!.currentPeriodEnd,
    });
  },
);
