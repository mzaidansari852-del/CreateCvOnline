import { NextResponse } from 'next/server';

import { availableGateways } from '@/lib/payments';
import { isPaddleConfigured, isPayPalConfigured, publicEnv, serverEnv } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Which payment gateways this deployment can actually offer, and why.
 *
 * ## Why this endpoint exists
 *
 * "The checkout still says Continue with PayPal" has four possible causes and the page
 * cannot show any of them: it falls back silently, on purpose, because a customer must
 * never be offered a payment button that cannot work. Every attempt to diagnose it from
 * outside failed — the hosting dashboard shows a variable is *set*, not whether the
 * running build *received* it, and the checkout page needs a session so it cannot even be
 * fetched. That left a loop of "check this, then tell me", which is a bad way to find a
 * missing environment variable.
 *
 * So the deployment reports on itself.
 *
 * ## Why it is safe to leave public
 *
 * It returns booleans and nothing else. No key, no token, no price id, not even a length
 * or a prefix — only whether each value is non-empty. Knowing that a site has Paddle
 * configured is not a secret; it is visible to anyone who reaches the checkout. The rule
 * this must never break is that no *value* crosses the boundary, and the shape of the
 * response is what enforces it: every field is typed `boolean`.
 */
export function GET(): NextResponse {
  const paddle = serverEnv().paddle;

  /*
   * The client token is read from `publicEnv`, which means this answer reflects the value
   * compiled into *this build* rather than whatever is in the dashboard now. That
   * distinction is the whole point: `NEXT_PUBLIC_*` is inlined at build time, so a
   * variable added after a deploy reads as missing here until the site is rebuilt — which
   * is exactly the failure this is meant to catch.
   */
  const clientTokenInBuild = publicEnv.paddleClientToken.length > 0;

  return NextResponse.json({
    gatewaysOffered: availableGateways(),
    paddle: {
      configured: isPaddleConfigured(),
      apiKey: Boolean(paddle?.apiKey),
      pricePro: Boolean(paddle?.prices.pro),
      priceLifetime: Boolean(paddle?.prices.lifetime),
      webhookSecret: Boolean(paddle?.webhookSecret),
      clientTokenInBuild,
      environment: paddle?.environment ?? null,
      publicEnvironment: publicEnv.paddleEnvironment,
    },
    paypal: { configured: isPayPalConfigured() },
    /*
     * The verdict, so nobody has to interpret the booleans. `availableGateways()` reports
     * what the server can reach; the checkout page additionally requires the client token,
     * because the overlay cannot open without it — so a deployment can be "configured" and
     * still correctly show PayPal only.
     */
    checkoutWillOfferPaddle: isPaddleConfigured() && clientTokenInBuild,
  });
}
