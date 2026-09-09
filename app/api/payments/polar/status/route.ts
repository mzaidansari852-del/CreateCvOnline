import { NextResponse, type NextRequest } from 'next/server';
import { createPolar } from '@polar-sh/sdk/2026-04';

import { availableGateways } from '@/lib/payments';
import {
  describePolarAccessToken,
  explainPolarProductIdProblem,
  explainPolarTokenProblem,
  isPolarProductId,
} from '@/lib/payments/polar-token';
import { isPolarConfigured, publicEnv, serverEnv } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Whether this deployment can take a payment, and — with `?probe=1` — why not.
 *
 * ## Why this exists
 *
 * "The checkout says payments are unavailable" has several causes and the page can show
 * none of them: it degrades silently on purpose, because a customer must never be handed a
 * payment button that cannot work. The hosting dashboard shows whether a variable is *set*,
 * not whether the running build *received* it, and the checkout page needs a session so it
 * cannot be fetched from outside. Without this the only way forward is a loop of "check
 * this, then tell me", which is a poor way to find a configuration fault.
 *
 * ## Safe to leave public
 *
 * The default response is booleans and the *shape* of the access token — whether it starts
 * with the fixed `polar_oat_` or `polar_pat_` prefix that every token of that kind shares.
 * No part of the random portion crosses the boundary. Whether a site has a payment gateway
 * configured is not a secret either: it is visible to anyone who reaches the checkout.
 *
 * Product ids are reported as booleans rather than values. They are not secret — the
 * customer sees them at checkout — but there is no reason for this endpoint to be the thing
 * that publishes them.
 *
 * `?probe=1` additionally asks Polar whether the configured products exist, and returns
 * Polar's own error text when they do not. That text describes *our* configuration, never a
 * customer, and the call is a read: `products.get`, which creates nothing and charges
 * nothing. It is deliberately not the default, so an ordinary request stays free.
 *
 * ## What this cannot tell you, and Paddle's version could
 *
 * The Paddle equivalent could detect a half-finished go-live by comparing four switches
 * against each other, because a Paddle key announced its own environment in its prefix.
 * Polar's tokens use the same prefix in sandbox and production, so **nothing here can tell
 * you that a sandbox token has been deployed to production**. `environment` below reports
 * what `POLAR_ENVIRONMENT` says, which is a statement of intent rather than a verified
 * fact. The `?probe=1` result is the closest thing to a real answer: a token pointed at the
 * wrong environment cannot see the products configured for the other one, so the probe
 * fails where the booleans all look green.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const polar = serverEnv().polar;

  /*
   * Read straight from `process.env`, not from `serverEnv().polar` — a token that fails the
   * format check leaves `polar` null, and the whole point of this field is to explain why.
   */
  const rawToken = process.env.POLAR_ACCESS_TOKEN?.trim();
  const tokenReport = describePolarAccessToken(rawToken);

  const rawProductPro = process.env.POLAR_PRODUCT_PRO?.trim();
  const rawProductLifetime = process.env.POLAR_PRODUCT_LIFETIME?.trim();

  const base = {
    gatewaysOffered: availableGateways(),
    polar: {
      configured: isPolarConfigured(),
      accessToken: Boolean(rawToken),
      accessTokenShape: {
        usable: tokenReport.usable,
        kind: tokenReport.kind,
        explanation: explainPolarTokenProblem(tokenReport),
      },
      productPro: Boolean(rawProductPro),
      productLifetime: Boolean(rawProductLifetime),
      productIdShape: {
        proIsUuid: isPolarProductId(rawProductPro),
        lifetimeIsUuid: isPolarProductId(rawProductLifetime),
        problems: [
          explainPolarProductIdProblem('POLAR_PRODUCT_PRO', rawProductPro),
          explainPolarProductIdProblem('POLAR_PRODUCT_LIFETIME', rawProductLifetime),
        ].filter((problem): problem is string => problem !== null),
      },
      webhookSecret: Boolean(polar?.webhookSecret),
      environment: polar?.environment ?? null,
      /*
       * Stated rather than verified. See the note above: Polar gives no way to confirm that
       * the token belongs to the environment this claims. Named explicitly so nobody reads
       * a green field here as proof of a correct go-live.
       */
      environmentIsDeclaredNotVerified: true,
      storeCurrency: publicEnv.storeCurrency,
    },
    /*
     * No client-token equivalent to check. Polar hosts its checkout, so the browser needs
     * nothing beyond the URL our server hands it, and `configured` is the whole answer to
     * "will the checkout work".
     */
    checkoutWillOfferPolar: isPolarConfigured(),
  };

  if (request.nextUrl.searchParams.get('probe') !== '1' || !polar) {
    return NextResponse.json(base);
  }

  /*
   * Read each configured product back from Polar.
   *
   * This distinguishes the failure modes that are indistinguishable from our side: a token
   * that is not valid at all, a token that is valid in the *other* environment, and a
   * product id belonging to a different organisation. All three produce the same "we could
   * not start the checkout" for the customer.
   */
  const client = createPolar({
    accessToken: polar.accessToken,
    environment: polar.environment === 'production' ? 'production' : 'sandbox',
  });

  const check = async (label: string, productId: string) => {
    try {
      const product = await client.products.get(productId);
      return {
        label,
        ok: true,
        name: product.name ?? null,
        archived: product.is_archived ?? null,
        recurring: product.recurring_interval ?? null,
      };
    } catch (cause) {
      return {
        label,
        ok: false,
        // Polar's own words. They name the problem far better than a generic message.
        error: cause instanceof Error ? cause.message : String(cause),
      };
    }
  };

  const products = await Promise.all([
    check('pro', polar.products.pro),
    check('lifetime', polar.products.lifetime),
  ]);

  return NextResponse.json({ ...base, probe: { environment: polar.environment, products } });
}
