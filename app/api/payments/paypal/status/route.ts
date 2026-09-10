import { NextResponse, type NextRequest } from 'next/server';

import { availableGateways } from '@/lib/payments';
import { isPayPalConfigured, publicEnv, readOpaqueToken, serverEnv } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Whether this deployment can take a PayPal payment, and — with `?probe=1` — why not.
 *
 * The sibling of `/api/payments/polar/status`, and it exists for the same reason. "The
 * checkout says payments are unavailable" has several causes and the page can show none of
 * them: it degrades silently on purpose, because a customer must never be handed a payment
 * button that cannot work. The hosting dashboard shows whether a variable is *set*, not
 * whether the running build received it, and the checkout page needs a session so it
 * cannot be fetched from outside.
 *
 * ## Safe to leave public
 *
 * The default response is booleans and the *lengths* of the two credentials, plus the
 * first eight characters of the client id — which is not secret; it is sent to PayPal's
 * own JS SDK by every integration that uses one, and it appears in the checkout URL. No
 * part of the secret crosses the boundary, only how long it is. Whether a site has a
 * payment gateway configured is not a secret either: it is visible to anyone who reaches
 * the checkout.
 *
 * Lengths rather than values because the overwhelmingly common fault is a truncated paste
 * — a dashboard wraps an 80-character credential across two lines and select-and-copy
 * takes half of it. A length is enough to see that and reveals nothing.
 *
 * ## What `?probe=1` does
 *
 * Asks PayPal for an access token with the configured credentials, which is the only way
 * to distinguish the three failures that look identical from our side: credentials that
 * are wrong, credentials that are valid in the *other* environment, and a client id paired
 * with the wrong secret. It is a read that creates nothing and charges nothing, and it is
 * deliberately not the default so an ordinary request stays free.
 *
 * It runs whenever both credentials are present — deliberately *not* only when the gateway
 * resolved. A gateway that was refused is the case this endpoint exists for, and the first
 * version answered nothing at all in exactly that situation.
 *
 * ## Reading the two "ok"s
 *
 * `probe.ok` and `paypal.configured` answer different questions and can disagree, which is
 * the most useful thing this endpoint says. Sandbox credentials on a production deployment
 * authenticate perfectly — `probe.ok: true` — and are still refused, because a sandbox
 * order captures as COMPLETED for the real plan price. `probe.gatewayEnabled` restates the
 * second answer next to the first so the pair cannot be misread.
 *
 * ## What this cannot tell you
 *
 * A PayPal client id announces nothing about its environment, so this cannot verify that a
 * credential *is* what `PAYPAL_ENVIRONMENT` claims — `environment` is a statement of intent.
 * What it can do is catch the mistake that matters: `sandboxOnProduction` reports the
 * declared combination, and the probe catches the rest, since sandbox credentials do not
 * authenticate against the live API.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const paypal = serverEnv().paypal;

  /*
   * Read straight from `process.env`, not from `serverEnv().paypal` — half a credential
   * pair leaves `paypal` null, and the whole point of these fields is to say which half.
   */
  const rawClientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const rawClientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();

  const base = {
    gatewaysOffered: availableGateways(),
    paypal: {
      configured: isPayPalConfigured(),
      clientId: Boolean(rawClientId),
      clientSecret: Boolean(rawClientSecret),
      /*
       * PayPal's REST credentials are around 80 characters. A materially shorter value was
       * truncated on paste, which is the single likeliest reason for an unexplained 401.
       */
      credentialShape: {
        clientIdLength: rawClientId?.length ?? 0,
        clientIdStartsWith: rawClientId ? rawClientId.slice(0, 8) : null,
        clientSecretLength: rawClientSecret?.length ?? 0,
        looksTruncated:
          (rawClientId !== undefined && rawClientId.length < 60) ||
          (rawClientSecret !== undefined && rawClientSecret.length < 60),
      },
      webhookId: Boolean(paypal?.webhookId),
      environment: paypal?.environment ?? null,
      /*
       * The one way `configured` can be false while every credential above is present.
       * Sandbox credentials on a production deployment disable the gateway on purpose —
       * a sandbox order captures as COMPLETED for the plan price — and without this field
       * that reads as "my variables vanished". Note that an unset PAYPAL_ENVIRONMENT
       * counts, because it defaults to sandbox.
       */
      sandboxOnProduction:
        Boolean(rawClientId) &&
        (process.env.PAYPAL_ENVIRONMENT ?? '').trim().toLowerCase() !== 'live' &&
        process.env.VERCEL_ENV === 'production',
      /*
       * Stated rather than verified. See the note above: a client id looks the same in both
       * environments. Named explicitly so nobody reads a green field here as proof of a
       * correct go-live.
       */
      environmentIsDeclaredNotVerified: true,
      storeCurrency: publicEnv.storeCurrency,
      /*
       * The one fact about this gateway that is not a configuration question. It is
       * reported here because this endpoint is what somebody opens while setting PayPal up,
       * which is the moment the trade-off is being made rather than discovered later.
       */
      merchantOfRecord: false,
      note: 'PayPal is a payment processor, not a merchant of record: while it is taking payments this business is the seller of record and owes the EU VAT itself. It is here only until Polar is live.',
    },
    checkoutWillOfferPayPal: isPayPalConfigured(),
  };

  /*
   * The probe runs from the *raw* variables, not from `serverEnv().paypal`.
   *
   * It used to short-circuit when the gateway was null, which got the priority exactly
   * backwards: the moment you most need to know whether a credential authenticates is when
   * something has decided it cannot be used. Sandbox credentials on a production deployment
   * are the case that proved it — the gateway is deliberately absent, and the endpoint that
   * exists to explain a broken configuration answered nothing at all.
   *
   * Cleaned through the same `readOpaqueToken` the gateway uses, so this tests the value
   * that *would* have been sent rather than the one sitting in the dashboard.
   */
  const probeClientId = readOpaqueToken(rawClientId);
  const probeClientSecret = readOpaqueToken(rawClientSecret);

  if (
    request.nextUrl.searchParams.get('probe') !== '1' ||
    !probeClientId ||
    !probeClientSecret
  ) {
    return NextResponse.json(base);
  }

  /*
   * Which API to ask is a question about the *declared* environment, so it is read from the
   * variable rather than from `paypal.environment` — which is null exactly when the gateway
   * was refused. Same defaulting rule as `lib/env.ts`: anything but "live" means sandbox.
   */
  const declaredEnvironment =
    (readOpaqueToken(process.env.PAYPAL_ENVIRONMENT) || 'sandbox').toLowerCase() === 'live'
      ? 'live'
      : 'sandbox';

  /*
   * The token request, made directly rather than through the gateway's cached helper — the
   * cache would happily answer from a token minted before the credentials were last
   * changed, which is exactly the question being asked.
   */
  const apiBase =
    declaredEnvironment === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

  try {
    const credentials = Buffer.from(`${probeClientId}:${probeClientSecret}`).toString('base64');
    const response = await fetch(`${apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
    });

    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      error_description?: string;
      expires_in?: number;
    } | null;

    return NextResponse.json({
      ...base,
      probe: {
        environment: declaredEnvironment,
        /*
         * The probe can succeed while the gateway stays off — sandbox credentials on a
         * production deployment authenticate perfectly and are still refused. Saying so here
         * stops `ok: true` reading as "checkout works".
         */
        gatewayEnabled: isPayPalConfigured(),
        endpoint: apiBase,
        ok: response.ok,
        status: response.status,
        // PayPal's own words. They name the problem better than a generic message, and the
        // token itself is deliberately not returned.
        error: response.ok ? null : (payload?.error_description ?? payload?.error ?? null),
        tokenLifetimeSeconds: response.ok ? (payload?.expires_in ?? null) : null,
      },
    });
  } catch (cause) {
    return NextResponse.json({
      ...base,
      probe: {
        environment: declaredEnvironment,
        gatewayEnabled: isPayPalConfigured(),
        endpoint: apiBase,
        ok: false,
        status: null,
        // Reaching PayPal failed, which is a different fault from PayPal refusing us.
        error: cause instanceof Error ? cause.message : String(cause),
        tokenLifetimeSeconds: null,
      },
    });
  }
}
