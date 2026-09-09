import 'server-only';

import { createPolar, webhooks } from '@polar-sh/sdk/2026-04';

import { getPlan } from '@/lib/plans';
import { publicEnv, serverEnv } from '@/lib/env';
import type { CaptureResult, CheckoutOrder, PaymentGateway, PaymentStatus } from '@/types/payment';

/**
 * Polar, as a `PaymentGateway`.
 *
 * ## Why Polar, and what changed with it
 *
 * Paddle declined the seller account during review, which ends that integration before it
 * ever took a real payment. Polar is the replacement and, like Paddle, is a **merchant of
 * record**: it sells to the customer, it charges the card, and it is the party that owes
 * EU VAT. That is the property worth paying for here — the site sells to Germany, France
 * and the Netherlands, and the alternative (Stripe direct) would mean registering for VAT
 * OSS and filing it ourselves.
 *
 * ## How the flow differs from Paddle's, and why the interface still fits
 *
 * Paddle ran its checkout as an overlay inside our page, opened by Paddle.js against a
 * transaction the server had already created. Polar hosts its checkout on its own domain:
 * the server creates a checkout session, and the browser is *redirected* to
 * `checkout.url`.
 *
 * That collapses a surprising amount of machinery. There is no client-side token, no
 * third-party script to load, no CSP grant for a payment iframe, and no four-way agreement
 * to police between an API key, a client token and two environment variables. It also puts
 * `CheckoutOrder.approveUrl` back to work — the field has sat unused since PayPal, and a
 * hosted checkout URL is exactly what it was for.
 *
 * `createOrder` is a real server-side create. `captureOrder` captures nothing, because
 * Polar has already taken the money or it has not; it reads the session back and reports
 * what Polar says. The name is the interface's, and the behaviour is what the name
 * promises: decide, from the provider, whether this really completed.
 *
 * ## The browser is never believed
 *
 * Polar's own guidance is blunt about this — "do not treat the success redirect as proof
 * of payment or entitlement" — and it matches what this codebase already did. The success
 * URL carries a checkout id and nothing else. Every fact that decides whether to grant a
 * plan (the status, the amount, the currency, the product the money was for) is read from
 * Polar's API or from a signed webhook.
 *
 * ## Money never comes from the client
 *
 * The session is created against the product id configured for the plan, server-side. A
 * tampered client can ask to buy a different plan and will be charged that plan's real
 * price; it cannot invent an amount. `polarCaptureMatchesPlan` then re-checks the product
 * before any entitlement is written, so a price edited in the Polar dashboard to something
 * unexpected fails closed rather than granting access.
 */

export class PolarError extends Error {
  constructor(
    message: string,
    readonly status = 502,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = 'PolarError';
  }
}

function config() {
  const polar = serverEnv().polar;
  if (!polar) {
    throw new PolarError(
      'Polar is not configured. Set POLAR_ACCESS_TOKEN, POLAR_PRODUCT_PRO and ' +
        'POLAR_PRODUCT_LIFETIME.',
      503,
    );
  }
  return polar;
}

type PolarClient = ReturnType<typeof createPolar>;

let client: PolarClient | null = null;

/**
 * The SDK client, created once and reused.
 *
 * Polar's client wraps `fetch` and has no connection lifecycle to close, so a module-level
 * instance is the documented pattern rather than a leak.
 */
function polar(): PolarClient {
  if (client) return client;
  const { accessToken, environment } = config();
  client = createPolar({
    accessToken,
    environment: environment === 'production' ? 'production' : 'sandbox',
  });
  return client;
}

/** The Polar product id for a plan, or `null` for a plan that is not sold. */
export function productIdFor(planId: string): string | null {
  const products = config().products;
  if (planId === 'pro') return products.pro;
  if (planId === 'lifetime') return products.lifetime;
  return null;
}

/**
 * The plan a Polar product id belongs to.
 *
 * The inverse of `productIdFor`, and the reason a webhook can be trusted about *what* was
 * bought: an event names a product, and the plan is derived from our own configuration
 * rather than from anything in the payload. A product id this deployment does not
 * recognise grants nothing.
 */
export function planForProductId(productId: string | null | undefined): string | null {
  if (!productId) return null;
  const products = config().products;
  if (productId === products.pro) return 'pro';
  if (productId === products.lifetime) return 'lifetime';
  return null;
}

/**
 * Polar's checkout-session statuses, mapped onto ours.
 *
 * `open` is a session nobody has paid yet. `confirmed` means the customer submitted
 * payment and Polar is settling it — real, but not yet money in hand. Only `succeeded`
 * means paid. Anything unknown is `failed`, so a status Polar adds later cannot
 * accidentally read as success.
 */
export function mapCheckoutStatus(status: string | undefined): PaymentStatus {
  switch (status) {
    case 'succeeded':
      return 'completed';
    case 'confirmed':
      return 'approved';
    case 'open':
      return 'created';
    case 'expired':
      return 'cancelled';
    case 'failed':
      return 'failed';
    default:
      return 'failed';
  }
}

/**
 * Polar's *order* statuses, mapped onto ours.
 *
 * A separate mapping from the checkout one, because they are separate vocabularies over
 * separate objects and collapsing them would be a guess. `partially_refunded` maps to
 * `refunded` rather than to `completed`: our ledger has one refund state, and treating a
 * partial refund as a clean completion would hide it from the admin console.
 */
export function mapOrderStatus(status: string | undefined): PaymentStatus {
  switch (status) {
    case 'paid':
      return 'completed';
    case 'pending':
      return 'approved';
    case 'draft':
      return 'created';
    case 'refunded':
    case 'partially_refunded':
      return 'refunded';
    case 'void':
      return 'cancelled';
    default:
      return 'failed';
  }
}

/**
 * Polar reports money in minor units as an integer: `900` is `"9.00"`.
 *
 * The zero-decimal list is carried over from the Paddle integration, where getting it
 * wrong was a hundred-fold error in the ledger, and it was checked against a currency
 * table rather than intuition. HUF and TWD *look* zero-decimal and are not. The set is
 * kept deliberately small: a currency wrongly listed here under-reports by 100×, while one
 * wrongly omitted over-reports by 100×, and only the second is caught by the amount check
 * downstream.
 */
const ZERO_DECIMAL_CURRENCIES = new Set(['CLP', 'JPY', 'KRW', 'VND']);

export function fromMinorUnits(amount: number | string | null | undefined, currency: string): string {
  if (amount === null || amount === undefined || amount === '') return '0.00';

  const parsed = typeof amount === 'number' ? amount : Number.parseInt(String(amount), 10);
  // Guarding NaN matters because `PaymentRecord.amount` is only `z.string()`, so
  // `NaN.toFixed(2)` would serialise the literal text "NaN" straight into the ledger.
  if (!Number.isFinite(parsed)) return '0.00';

  if (ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase())) return String(Math.trunc(parsed));
  return (parsed / 100).toFixed(2);
}

/**
 * A loose view of a Polar entity.
 *
 * The SDK's generated types are exact and this deliberately is not, for one reason: the
 * same shape reaches us from `checkouts.create`, from `checkouts.get`, and from a webhook
 * payload, and reading it through an index signature is honest about handling all three
 * without claiming a type the parse cannot support.
 *
 * Note that Polar's v1 SDK keeps API-style `snake_case` on request and response fields
 * while its *methods* are camelCase, so — unlike the Paddle integration — there is no
 * second spelling to accept here.
 */
type LooseRecord = Record<string, unknown>;

function field(source: unknown, name: string): unknown {
  if (!source || typeof source !== 'object') return undefined;
  const value = (source as LooseRecord)[name];
  return value === null ? undefined : value;
}

/**
 * A checkout session, as a `CaptureResult`.
 *
 * `captureId` is null here and that is not an oversight: a Polar checkout carries no
 * reference to the order it produced, so there is no payment-side id to record until the
 * `order.paid` webhook arrives with one. Inventing one from `customer_id` would put a
 * value in the field support searches on that matches nothing in Polar's dashboard.
 */
export function checkoutToCaptureResult(checkout: LooseRecord): CaptureResult {
  const currency = String(field(checkout, 'currency') ?? publicEnv.storeCurrency);

  return {
    orderId: String(checkout.id ?? ''),
    captureId: null,
    status: mapCheckoutStatus(checkout.status as string | undefined),
    // `total_amount` is what the customer was actually charged — after any discount and
    // including tax. `amount` is the pre-discount, pre-tax figure and would overstate a
    // discounted purchase in the ledger.
    amount: fromMinorUnits(field(checkout, 'total_amount') as number | undefined, currency),
    currency: currency.toUpperCase(),
    payerEmail: (field(checkout, 'customer_email') as string) ?? null,
    raw: checkout as Record<string, unknown>,
  };
}

/**
 * An order, as a `CaptureResult`.
 *
 * Keyed back to the *checkout* id rather than the order id, because that is what our
 * ledger is keyed by — the row was written when the session was created, long before an
 * order existed. Returning the order id as `orderId` would write a second, orphaned
 * document and break the idempotency that `fulfilPayment` depends on.
 */
export function orderToCaptureResult(order: LooseRecord, checkoutId: string): CaptureResult {
  const currency = String(field(order, 'currency') ?? publicEnv.storeCurrency);
  const customer = field(order, 'customer');

  return {
    orderId: checkoutId,
    captureId: order.id ? String(order.id) : null,
    status: mapOrderStatus(order.status as string | undefined),
    amount: fromMinorUnits(
      (field(order, 'total_amount') ?? field(order, 'net_amount')) as number | undefined,
      currency,
    ),
    currency: currency.toUpperCase(),
    payerEmail:
      (field(customer, 'email') as string) ?? (field(order, 'customer_email') as string) ?? null,
    raw: order as Record<string, unknown>,
  };
}

export const polarGateway: PaymentGateway = {
  id: 'polar',

  /**
   * Creates the hosted checkout session and returns the URL to send the customer to.
   *
   * Three things are attached so a webhook arriving minutes later — with no session and no
   * cookies — can be attributed to the right account:
   *
   *   - `external_customer_id` is our Firebase uid. Polar treats it as the durable link to
   *     a customer, which is what makes a renewal months later still resolve to this user.
   *   - `metadata` carries the uid and plan through Polar and back, the same trick as
   *     Paddle's `customData` and PayPal's `custom_id` before it.
   *   - `success_url` carries the checkout id, so the page the customer lands on can ask
   *     us to confirm the payment without guessing which one it was.
   *
   * `{CHECKOUT_ID}` is a placeholder Polar substitutes on redirect. It is left unencoded
   * on purpose — encoding the braces would hand the customer a literal `%7BCHECKOUT_ID%7D`
   * in their address bar and a success page that could confirm nothing.
   */
  async createOrder({ planId, userId, returnUrl, cancelUrl }) {
    const productId = productIdFor(planId);
    if (!productId) throw new PolarError(`No Polar product is configured for plan "${planId}".`, 400);

    const successUrl = absoluteUrl(returnUrl);
    const separator = successUrl.includes('?') ? '&' : '?';

    try {
      const checkout = await polar().checkouts.create({
        products: [productId],
        external_customer_id: userId,
        metadata: { userId, planId },
        success_url: `${successUrl}${separator}checkout_id={CHECKOUT_ID}`,
        return_url: absoluteUrl(cancelUrl),
      });

      return {
        orderId: checkout.id,
        status: mapCheckoutStatus(checkout.status),
        approveUrl: checkout.url,
      } satisfies CheckoutOrder;
    } catch (cause) {
      throw new PolarError('Polar refused to create the checkout session.', 502, cause);
    }
  },

  async captureOrder(orderId) {
    return this.getOrder(orderId);
  },

  async getOrder(orderId) {
    try {
      const checkout = await polar().checkouts.get(orderId);
      return checkoutToCaptureResult(checkout as unknown as LooseRecord);
    } catch (cause) {
      throw new PolarError('Polar could not read that checkout session.', 502, cause);
    }
  },

  /**
   * Verifies a webhook signature.
   *
   * Returns `false` rather than throwing on every failure path, including a missing
   * secret. An unverifiable webhook and a forged one are the same thing from here: neither
   * may grant a plan.
   *
   * In practice the route calls `readPolarWebhookEvent` instead, which verifies and parses
   * in one pass. This exists to satisfy the `PaymentGateway` contract and to keep the two
   * from ever disagreeing about what counts as verified.
   */
  async verifyWebhook(headers, rawBody) {
    return (await readPolarWebhookEvent(headers, rawBody)).ok;
  },
};

/**
 * Turns a relative path into an absolute URL on this site.
 *
 * Polar requires absolute URLs, and the routes pass paths like `/payment/success?plan=pro`
 * because that is what they passed Paddle. Rejecting a value that is already absolute
 * would break nothing today and surprise somebody later, so both are accepted.
 */
function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${publicEnv.siteUrl}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/* -------------------------------------------------------------------------- */
/* Webhooks                                                                    */
/* -------------------------------------------------------------------------- */

export type PolarWebhookOutcome =
  | { ok: true; event: LooseRecord; eventType: string }
  /** Signature did not verify, or the secret is missing. The route answers 403. */
  | { ok: false; reason: 'unverified' }
  /** Correctly signed, but a type this SDK version does not know. Acknowledge and drop. */
  | { ok: false; reason: 'unknown-type'; eventType: string | null }
  /** Correctly signed but unparseable. Retrying will not fix it. */
  | { ok: false; reason: 'malformed' };

/**
 * Verifies and parses a webhook in one pass.
 *
 * ## Why this is one function and not two
 *
 * The signature is over the exact bytes Polar sent. Parsing first and re-serialising
 * changes key order and whitespace, so the signature would never match — or, worse, would
 * match a document different from the one that was signed. Polar's `validateEvent` takes
 * the raw body and returns the parsed event only if the signature holds, which makes the
 * safe ordering the only ordering available. Splitting it into "verify" then "parse" would
 * reintroduce exactly the gap it closes.
 *
 * ## The signing-scheme change of 8 September 2026
 *
 * Polar moved webhook signing from its own HMAC scheme to Standard Webhooks on that date.
 * The two derive different signing keys from the same `whsec_…` secret: the old scheme
 * uses the UTF-8 bytes of the whole string, the new one base64-decodes the part after the
 * prefix. Secrets generated before the cutover still use the old scheme.
 *
 * This is why the SDK is pinned to `1.0.0-alpha.20` rather than the `0.49.x` release that
 * npm calls `latest`. `0.49.x` unconditionally applies the *old* derivation, so a secret
 * generated after the cutover fails every signature check — silently taking down the
 * authoritative fulfilment path while checkout still appears to work. `1.0.0-alpha.20`
 * derives both keys and accepts either. Do not "upgrade" to 0.49.x.
 */
export async function readPolarWebhookEvent(
  headers: Record<string, string>,
  rawBody: string,
): Promise<PolarWebhookOutcome> {
  const secret = config().webhookSecret;
  if (!secret) return { ok: false, reason: 'unverified' };

  try {
    const event = (await webhooks.validateEvent(rawBody, headers, secret)) as unknown as LooseRecord;
    return { ok: true, event, eventType: String(event.type ?? '') };
  } catch (error) {
    if (error instanceof webhooks.PolarWebhookVerificationError) {
      return { ok: false, reason: 'unverified' };
    }
    /*
     * A correctly signed event of a type this SDK version has no schema for. Polar's own
     * guidance is to acknowledge it: it is not a fault the sender can fix by retrying, and
     * answering non-2xx would have Polar redelivering it for hours.
     */
    if (error instanceof webhooks.PolarWebhookUnknownTypeError) {
      const eventType = (error as { eventType?: string }).eventType ?? null;
      return { ok: false, reason: 'unknown-type', eventType };
    }
    if (error instanceof webhooks.PolarWebhookError) {
      return { ok: false, reason: 'malformed' };
    }
    /*
     * Anything else is a fault on our side rather than a verdict on the payload — and
     * `verifyWebhook` funnels through here, where a thrown error would escape into the
     * route and become a 500 that Polar retries for hours. Treated as unverifiable, which
     * grants nothing and is logged by the caller.
     */
    return { ok: false, reason: 'malformed' };
  }
}

/**
 * Parses a verified `order.*` event into the fields the grant path needs.
 *
 * Call this only on the output of `readPolarWebhookEvent`.
 *
 * ## Where each fact comes from
 *
 * The **user** comes from `metadata.userId`, which we set when creating the session and
 * Polar echoes back untouched, falling back to `external_customer_id` on the customer —
 * the same uid, attached to the Polar customer record, which survives a renewal that has
 * no checkout metadata of its own.
 *
 * The **plan** is derived from the *product id*, never from `metadata.planId`. Both are
 * ours, but the product is what the customer was actually billed against. If the two ever
 * disagree, the money is the truth.
 *
 * The **checkout id** is what our ledger is keyed by. A first payment carries it directly.
 * A subscription renewal does not — Polar creates a new order against the subscription
 * with no checkout — which is why `checkoutId` is nullable and the route treats its
 * absence as a renewal rather than as a broken payload.
 */
export function readWebhookOrder(event: LooseRecord): {
  eventType: string;
  orderId: string | null;
  checkoutId: string | null;
  subscriptionId: string | null;
  userId: string | null;
  planId: string | null;
  status: PaymentStatus;
  order: LooseRecord;
} | null {
  const eventType = String(field(event, 'type') ?? '');
  const data = field(event, 'data') as LooseRecord | undefined;
  if (!eventType || !data) return null;

  const metadata = (field(data, 'metadata') ?? {}) as LooseRecord;
  const customer = field(data, 'customer');

  const productId =
    (field(data, 'product_id') as string | undefined) ??
    (field(field(data, 'product'), 'id') as string | undefined) ??
    null;

  const metadataUserId = typeof metadata.userId === 'string' ? metadata.userId : null;
  const externalId = field(customer, 'external_id');

  return {
    eventType,
    orderId: data.id ? String(data.id) : null,
    checkoutId: data.checkout_id ? String(data.checkout_id) : null,
    subscriptionId: data.subscription_id ? String(data.subscription_id) : null,
    userId: metadataUserId ?? (typeof externalId === 'string' ? externalId : null),
    planId: planForProductId(productId),
    status: mapOrderStatus(data.status as string | undefined),
    order: data,
  };
}

/**
 * The product id a capture was actually billed against.
 *
 * Reads the product out of whatever `raw` holds — a checkout session or an order — because
 * both carry `product_id` and the verification below should not care which one it was
 * handed.
 */
export function productIdOnCapture(result: CaptureResult): string | null {
  const raw = result.raw as LooseRecord | null;
  if (!raw) return null;

  const direct = field(raw, 'product_id');
  if (typeof direct === 'string') return direct;

  const nested = field(field(raw, 'product'), 'id');
  if (typeof nested === 'string') return nested;

  /*
   * A session created with several products is a "pick one" checkout, not a plan purchase
   * we know how to grant. It resolves to nothing rather than to whichever came first.
   */
  const products = raw.products;
  if (Array.isArray(products) && products.length === 1) {
    const only = field(products[0], 'id');
    if (typeof only === 'string') return only;
  }

  return null;
}

/**
 * Whether a completed Polar payment really matches the plan it claims to buy.
 *
 * ## Why this checks the product id rather than the amount
 *
 * This is the same argument the Paddle integration arrived at the hard way, and it is
 * worth restating because the temptation to "just compare the price" is strong.
 *
 * Polar is a merchant of record and localises prices, so a German customer legitimately
 * pays in EUR for a plan listed in USD. Demanding an exact amount match would decline real
 * purchases. The tolerant version of that check — accept anything above some fraction of
 * the expected number — compares raw numbers across currencies, and against a $9 plan a
 * 50% floor is a floor of the *number* 4.5. ¥5, about three US cents, clears it. For JPY,
 * KRW and VND the floor is effectively zero, precisely where a mis-typed localised price
 * is easiest to make.
 *
 * Shipping an FX table to fix that would answer a question we do not need to ask. The real
 * question is not "is this the right amount" but "did Polar bill this against the product
 * we configured for this plan", and the payload says so directly. Polar owns the amount
 * for its own product in every currency it sells in, so matching the id delegates the
 * arithmetic to the party that performed it.
 *
 * The amount comparison is kept as a second gate in the store currency, where it is
 * meaningful, and skipped where it is not.
 */
export function polarCaptureMatchesPlan(result: CaptureResult, planId: string): boolean {
  if (result.status !== 'completed') return false;

  /*
   * An unknown plan is rejected rather than resolved. `getPlan()` falls back to the free
   * plan for an unrecognised id, which would price this check at `0.00` and make every
   * amount acceptable — the last gate in the chain wide open for exactly the input that
   * should never reach it.
   */
  const expectedProductId = productIdFor(planId);
  if (!expectedProductId) return false;

  const billedProductId = productIdOnCapture(result);
  if (billedProductId) return billedProductId === expectedProductId;

  /*
   * No readable product — a payload shape we do not recognise. Fall back to the amount,
   * but only in the store currency: without the product id there is no honest way to judge
   * a foreign amount, and guessing is what produced the hole described above.
   */
  if (result.currency.toUpperCase() !== publicEnv.storeCurrency.toUpperCase()) return false;

  const expected = Number.parseFloat(getPlan(planId).price);
  const actual = Number.parseFloat(result.amount);
  if (!Number.isFinite(expected) || !Number.isFinite(actual)) return false;
  return Math.abs(expected - actual) <= 0.005;
}

/** Test seam — drops the memoised client so a new environment takes effect. */
export function __resetPolarClient(): void {
  client = null;
}
