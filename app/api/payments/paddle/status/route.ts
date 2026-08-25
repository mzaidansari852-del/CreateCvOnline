import { NextResponse, type NextRequest } from 'next/server';
import { Environment, Paddle } from '@paddle/paddle-node-sdk';

import { availableGateways } from '@/lib/payments';
import {
  PADDLE_API_KEY_LENGTH,
  describePaddleApiKey,
  explainPaddleKeyProblem,
} from '@/lib/payments/paddle-key';
import { isPaddleConfigured, paddleEnvironmentProblem, publicEnv, serverEnv } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Which payment gateways this deployment can offer, and — with `?probe=1` — why not.
 *
 * ## Why this exists
 *
 * "The checkout says payments are unavailable" has several causes and the page can show
 * none of them: it degrades silently on purpose, because a customer must never be handed
 * a payment button that cannot work. The hosting dashboard shows whether a variable is
 * *set*, not whether the running build *received* it, and the checkout page needs a session
 * so it cannot be fetched from outside. Without this the only way forward was a loop of
 * "check this, then tell me", which is a poor way to find a configuration fault.
 *
 * ## Safe to leave public
 *
 * The default response is booleans and the *shape* of the API key — its length, and the
 * fixed `pdl_sdbx_apikey_` prefix that every sandbox key in existence shares. No part of
 * the random portion crosses the boundary, in any form; a test asserts that by searching
 * the serialised response for every substring of it. Whether a site has Paddle configured
 * is not a secret either — it is visible to anyone who reaches the checkout.
 *
 * `?probe=1` additionally asks Paddle whether the configured price ids exist, and returns
 * Paddle's own error text when they do not. That text describes *our* configuration, never
 * a customer, and the call is a read: `prices.get`, which creates nothing and charges
 * nothing. It is deliberately not the default, so an ordinary request stays free.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const paddle = serverEnv().paddle;
  const clientTokenInBuild = publicEnv.paddleClientToken.length > 0;

  /*
   * Read straight from `process.env`, not from `serverEnv().paddle` — a key that fails the
   * format check leaves `paddle` null, and the whole point of this field is to explain why.
   * `describePaddleApiKey` returns counts and fixed prefixes only, never any part of the
   * random portion, so this stays as publishable as the rest of the response.
   */
  const keyReport = describePaddleApiKey(process.env.PADDLE_API_KEY?.trim());

  const base = {
    gatewaysOffered: availableGateways(),
    paddle: {
      configured: isPaddleConfigured(),
      apiKey: Boolean(paddle?.apiKey),
      apiKeyShape: {
        usable: keyReport.usable,
        problem: keyReport.problem,
        explanation: explainPaddleKeyProblem(keyReport),
        length: keyReport.length,
        expectedLength: PADDLE_API_KEY_LENGTH,
        prefix: keyReport.prefix,
        legacyFormat: keyReport.looksLegacy,
      },
      pricePro: Boolean(paddle?.prices.pro),
      priceLifetime: Boolean(paddle?.prices.lifetime),
      webhookSecret: Boolean(paddle?.webhookSecret),
      clientTokenInBuild,
      environment: paddle?.environment ?? null,
      publicEnvironment: publicEnv.paddleEnvironment,
      /*
       * Why the gateway is off when the key itself is fine.
       *
       * Recomputed from `process.env` rather than read off `serverEnv().paddle`, for the
       * same reason `apiKeyShape` is: a mismatch leaves `paddle` null, and this field
       * exists to explain that null. Naming which two switches disagree is the whole
       * value — the symptom is identical for all three pairs.
       */
      environmentMismatch: paddleEnvironmentProblem({
        keyEnvironment: keyReport.environment,
        serverEnvironment:
          (process.env.PADDLE_ENVIRONMENT ?? '').trim().toLowerCase() === 'production'
            ? 'production'
            : 'sandbox',
        clientToken: publicEnv.paddleClientToken,
        publicEnvironment: publicEnv.paddleEnvironment,
      }),
    },
    checkoutWillOfferPaddle: isPaddleConfigured() && clientTokenInBuild,
  };

  if (request.nextUrl.searchParams.get('probe') !== '1' || !paddle) {
    return NextResponse.json(base);
  }

  /*
   * Read each configured price back from Paddle.
   *
   * This is the check that distinguishes the three remaining failure modes, which are
   * indistinguishable from our side: a key that is not valid at all, a key that is valid
   * in the *other* environment, and a price id that belongs to a different account. All
   * three produce the same "we could not start the checkout" for the customer.
   */
  const client = new Paddle(paddle.apiKey, {
    environment: paddle.environment === 'production' ? Environment.production : Environment.sandbox,
  });

  const check = async (label: string, priceId: string) => {
    try {
      const price = await client.prices.get(priceId);
      return { label, priceId, ok: true, name: price.name ?? null, status: price.status ?? null };
    } catch (cause) {
      return {
        label,
        priceId,
        ok: false,
        // Paddle's own words. They name the problem far better than a generic message.
        error: cause instanceof Error ? cause.message : String(cause),
      };
    }
  };

  const prices = await Promise.all([
    check('pro', paddle.prices.pro),
    check('lifetime', paddle.prices.lifetime),
  ]);

  return NextResponse.json({ ...base, probe: { environment: paddle.environment, prices } });
}
