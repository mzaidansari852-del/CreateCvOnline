import 'server-only';

import { Environment, Paddle } from '@paddle/paddle-node-sdk';

import { getPlan } from '@/lib/plans';
import { publicEnv, serverEnv } from '@/lib/env';
import type { CaptureResult, CheckoutOrder, PaymentGateway, PaymentStatus } from '@/types/payment';

/**
 * Paddle Billing, as a `PaymentGateway`.
 *
 * ## How this differs from PayPal, and why the interface still fits
 *
 * PayPal is server-driven: we create an order, the customer approves it, we capture it.
 * Paddle is not. The checkout runs in Paddle.js in the browser, and the server is told
 * what happened afterwards. There is no capture call to make.
 *
 * That could have meant a second interface. It does not, because of how the flow is built
 * here: rather than opening the overlay with a bare price id, the server creates the
 * transaction first (`transactions.create`) and hands the browser only its id. So
 * `createOrder` is a real server-side create, and `captureOrder` becomes "read the
 * transaction back from Paddle and decide whether it really completed" — which is exactly
 * the check the name promises, and exactly what the PayPal implementation does after its
 * capture call returns.
 *
 * The consequence worth stating plainly: **the browser is never believed.** It reports a
 * transaction id and nothing else. Everything that decides whether to grant a plan — the
 * status, the amount, the currency, the plan the money was for — is read from Paddle's
 * API or from a signed webhook, never from the client.
 *
 * ## Money never comes from the client
 *
 * The overlay is opened against a transaction the server built from the plan's own price
 * id. A tampered client can ask to buy a different plan, and it will be charged that
 * plan's real price; it cannot invent an amount. `captureMatchesPlan` then re-checks the
 * amount against the plan before any entitlement is written, so a price edited in the
 * Paddle dashboard to something unexpected fails closed rather than granting access.
 */

export class PaddleError extends Error {
  constructor(
    message: string,
    readonly status = 502,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = 'PaddleError';
  }
}

function config() {
  const paddle = serverEnv().paddle;
  if (!paddle) {
    throw new PaddleError(
      'Paddle is not configured. Set PADDLE_API_KEY, PADDLE_PRICE_PRO and PADDLE_PRICE_LIFETIME.',
      503,
    );
  }
  return paddle;
}

let client: Paddle | null = null;

function paddle(): Paddle {
  if (client) return client;
  const { apiKey, environment } = config();
  client = new Paddle(apiKey, {
    environment: environment === 'production' ? Environment.production : Environment.sandbox,
  });
  return client;
}

/** The Paddle price id for a plan, or `null` for a plan that is not sold. */
export function priceIdFor(planId: string): string | null {
  const prices = config().prices;
  if (planId === 'pro') return prices.pro;
  if (planId === 'lifetime') return prices.lifetime;
  return null;
}

/**
 * The plan a Paddle price id belongs to.
 *
 * The inverse of `priceIdFor`, and the reason the webhook can trust what it is told: an
 * event names a price, and the plan is derived from our own configuration rather than from
 * anything in the payload. A price id we do not recognise grants nothing.
 */
export function planForPriceId(priceId: string | null | undefined): string | null {
  if (!priceId) return null;
  const prices = config().prices;
  if (priceId === prices.pro) return 'pro';
  if (priceId === prices.lifetime) return 'lifetime';
  return null;
}

/**
 * Paddle's transaction statuses, mapped onto ours.
 *
 * `billed` and `ready` mean the transaction exists and is awaiting payment — the customer
 * has the overlay open. Only `completed` and `paid` mean money moved. Anything unknown is
 * treated as `failed`, so a status Paddle adds later cannot accidentally read as success.
 */
function mapStatus(status: string | undefined): PaymentStatus {
  switch (status) {
    case 'completed':
    case 'paid':
      return 'completed';
    case 'billed':
    case 'ready':
      return 'approved';
    case 'draft':
      return 'created';
    case 'canceled':
      return 'cancelled';
    case 'past_due':
      return 'failed';
    default:
      return 'failed';
  }
}

/**
 * Paddle reports money in minor units as a string: `"900"` is `"9.00"`.
 *
 * The zero-decimal list is exactly Paddle's, and getting it wrong is a hundred-fold error
 * in the ledger. A first draft here included HUF and TWD, which *look* like zero-decimal
 * currencies and are not — Paddle bills both with two decimals — so Ft 3,490 would have
 * been recorded as 349,000. `ISK` was in that draft too and Paddle does not support it at
 * all. Checked against Paddle's supported-currencies table rather than intuition:
 * https://developer.paddle.com/concepts/sell/supported-currencies
 */
const ZERO_DECIMAL_CURRENCIES = new Set(['CLP', 'JPY', 'KRW', 'VND']);

export function fromMinorUnits(amount: string | null | undefined, currency: string): string {
  if (!amount) return '0.00';
  const digits = amount.replace(/[^\d-]/g, '');
  if (!digits) return '0.00';

  const parsed = Number.parseInt(digits, 10);
  // `"-"` survives the filter above and parses to NaN, which `toFixed` renders as the
  // string "NaN" — and the payment record's `amount` is only `z.string()`, so it would be
  // stored. Anything unparseable is zero, which fails every downstream check closed.
  if (!Number.isFinite(parsed)) return '0.00';

  if (ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase())) return String(parsed);
  return (parsed / 100).toFixed(2);
}

/**
 * A loose view of a Paddle entity.
 *
 * The SDK's own types are exact, and that exactness is the problem here: the same shape
 * arrives from three places — `transactions.create`, `transactions.get` and a webhook body
 * parsed from raw JSON — and the last of those is camelCase in the SDK's world but
 * snake_case on the wire. Reading through an index signature and accepting both spellings
 * is honest about that, where casting to the SDK type would be a claim the parse cannot
 * support.
 */
type LooseRecord = Record<string, unknown>;

function field(source: unknown, ...names: string[]): unknown {
  if (!source || typeof source !== 'object') return undefined;
  const record = source as LooseRecord;
  for (const name of names) {
    if (record[name] !== undefined && record[name] !== null) return record[name];
  }
  return undefined;
}

function toCaptureResult(transaction: LooseRecord): CaptureResult {
  const currency = String(field(transaction, 'currencyCode', 'currency_code') ?? 'USD');
  const details = field(transaction, 'details') ?? {};
  const totals = (field(details, 'totals', 'total') ?? {}) as LooseRecord;
  const payments = (
    Array.isArray(transaction.payments) ? transaction.payments : []
  ) as LooseRecord[];
  const captured =
    payments.find((payment) => field(payment, 'status') === 'captured') ?? payments[0];
  const customer = field(transaction, 'customer');

  return {
    orderId: String(transaction.id ?? ''),
    // Paddle's payment attempt id is the closest thing to a capture id — it is what a
    // support agent searches for when a customer says the money left their account.
    captureId: (field(captured, 'paymentAttemptId', 'payment_attempt_id') as string) ?? null,
    status: mapStatus(transaction.status as string | undefined),
    amount: fromMinorUnits(
      field(totals, 'grandTotal', 'grand_total', 'total') as string | undefined,
      currency,
    ),
    currency: currency.toUpperCase(),
    payerEmail: (field(customer, 'email') as string) ?? null,
    raw: transaction as Record<string, unknown>,
  };
}

export const paddleGateway: PaymentGateway = {
  id: 'paddle',

  /**
   * Builds the transaction the overlay will open against.
   *
   * `customData` carries the user and plan through Paddle and back in the webhook, which
   * is how an event arriving minutes later — with no session and no cookies — is attributed
   * to the right account. It is the same trick as PayPal's `custom_id`.
   */
  async createOrder({ planId, userId }) {
    const priceId = priceIdFor(planId);
    if (!priceId) throw new PaddleError(`No Paddle price is configured for plan "${planId}".`, 400);

    try {
      const transaction = await paddle().transactions.create({
        items: [{ priceId, quantity: 1 }],
        customData: { userId, planId },
      });

      return {
        orderId: transaction.id,
        status: mapStatus(transaction.status),
      } satisfies CheckoutOrder;
    } catch (cause) {
      throw new PaddleError('Paddle refused to create the transaction.', 502, cause);
    }
  },

  /**
   * Reads the transaction back and reports what Paddle says about it.
   *
   * Named `captureOrder` to satisfy the interface, but it captures nothing — Paddle has
   * already taken the money or it has not. The caller compares the result against the plan
   * before granting anything.
   */
  async captureOrder(orderId) {
    return this.getOrder(orderId);
  },

  async getOrder(orderId) {
    try {
      const transaction = await paddle().transactions.get(orderId, {
        include: ['customer'],
      } as never);
      return toCaptureResult(transaction as unknown as LooseRecord);
    } catch (cause) {
      throw new PaddleError('Paddle could not read that transaction.', 502, cause);
    }
  },

  /**
   * Verifies a webhook signature.
   *
   * Returns `false` rather than throwing on every failure path, including a missing
   * secret. An unverifiable webhook and a forged one are the same thing from here: neither
   * may grant a plan. The route logs the distinction; this function does not need to.
   */
  async verifyWebhook(headers, rawBody) {
    const secret = config().webhookSecret;
    if (!secret) return false;

    const signature = headers['paddle-signature'] ?? headers['Paddle-Signature'];
    if (!signature) return false;

    try {
      /*
       * `return await`, not `return`. Without the await the promise escapes this try
       * block and the rejection lands in the route instead, which answered 500 to a
       * malformed `Paddle-Signature` header — turning "reject this" into an unhandled
       * error anyone could trigger, and one that Paddle would then retry for hours
       * because non-2xx means "try again".
       */
      return await paddle().webhooks.isSignatureValid(rawBody, secret, signature);
    } catch {
      return false;
    }
  },
};

/**
 * Parses a verified webhook body into the fields the grant path needs.
 *
 * Call this only after `verifyWebhook` has returned true. It reads `customData` for the
 * user, but derives the plan from the *price id* rather than trusting the plan recorded
 * there — `customData` is set by us and round-trips through Paddle unmodified, while the
 * price is what the customer was actually charged for. If the two ever disagree, the money
 * is the truth.
 */
export function readWebhookTransaction(event: LooseRecord): {
  eventType: string;
  transactionId: string | null;
  userId: string | null;
  planId: string | null;
  status: PaymentStatus;
} | null {
  const eventType = String(field(event, 'eventType', 'event_type') ?? '');
  const data = field(event, 'data') as LooseRecord | undefined;
  if (!eventType || !data) return null;

  const custom = (field(data, 'customData', 'custom_data') ?? {}) as LooseRecord;
  const items = (Array.isArray(data.items) ? data.items : []) as LooseRecord[];
  const first = items[0];
  const priceId =
    (field(field(first, 'price'), 'id') as string | undefined) ??
    (field(first, 'priceId', 'price_id') as string | undefined) ??
    null;

  return {
    eventType,
    transactionId: data.id ? String(data.id) : null,
    userId: typeof custom.userId === 'string' ? custom.userId : null,
    planId: planForPriceId(priceId),
    status: mapStatus(data.status as string | undefined),
  };
}

/**
 * The price id a transaction was actually billed against.
 *
 * Read from the line items we stored in `raw`, accepting either spelling because the same
 * shape reaches us from the SDK (camelCase) and from a webhook body (snake_case).
 */
export function priceIdOnCapture(result: CaptureResult): string | null {
  const items = (result.raw as LooseRecord | null)?.items;
  if (!Array.isArray(items) || items.length === 0) return null;

  const ids = items
    .map((item) => {
      const record = item as LooseRecord;
      return (
        (field(field(record, 'price'), 'id') as string | undefined) ??
        (field(record, 'priceId', 'price_id') as string | undefined) ??
        null
      );
    })
    .filter((id): id is string => Boolean(id));

  // A transaction with several different prices on it is not a plan purchase we know how
  // to grant, so it resolves to nothing rather than to whichever line came first.
  const unique = new Set(ids);
  return unique.size === 1 ? (ids[0] ?? null) : null;
}

/**
 * Whether a completed Paddle transaction really matches the plan it claims to buy.
 *
 * ## Why this checks the price id and not just the amount
 *
 * The first version of this compared the amount to the plan price, with a tolerant branch
 * for foreign currencies: Paddle localises prices, so a German customer legitimately pays
 * in EUR for a plan listed in USD, and demanding an exact match would decline real
 * purchases. The tolerant branch was `actual >= expected * 0.5`, comparing raw numbers
 * across currencies — which against a $9 plan is a floor of the *number* 4.5. ¥5, about
 * three US cents, cleared it. For JPY, KRW, VND and COP the floor was effectively zero,
 * so the one check standing between a mis-typed localised price and a free plan did
 * nothing for exactly the currencies where a typo is easiest to make.
 *
 * Converting currencies to fix that would mean shipping an FX table and keeping it
 * current, to answer a question we do not actually need to ask. The real question is not
 * "is this the right amount" but "did Paddle bill this against the price we configured
 * for this plan" — and the transaction says so directly. Paddle owns the amount for its
 * own price id in every currency it sells in, so matching the id delegates the arithmetic
 * to the party that performed it.
 *
 * The amount comparison is kept as a second gate in the store currency, where it is
 * meaningful, and skipped where it is not.
 */
export function paddleCaptureMatchesPlan(result: CaptureResult, planId: string): boolean {
  if (result.status !== 'completed') return false;

  /*
   * An unknown plan is rejected here rather than resolved. `getPlan()` falls back to the
   * free plan for an unrecognised id, which priced this check at `0.00` and made every
   * amount acceptable — the last gate in the chain was open for precisely the input that
   * should never reach it.
   */
  const expectedPriceId = priceIdFor(planId);
  if (!expectedPriceId) return false;

  const billedPriceId = priceIdOnCapture(result);
  if (billedPriceId) return billedPriceId === expectedPriceId;

  /*
   * No readable line item — an older record, or a payload shape we do not recognise. Fall
   * back to the amount, but only in the store currency: without the price id there is no
   * honest way to judge a foreign amount, and guessing is what produced the hole above.
   */
  if (result.currency.toUpperCase() !== publicEnv.storeCurrency.toUpperCase()) return false;

  const expected = Number.parseFloat(getPlan(planId).price);
  const actual = Number.parseFloat(result.amount);
  if (!Number.isFinite(expected) || !Number.isFinite(actual)) return false;
  return Math.abs(expected - actual) <= 0.005;
}

/** Test seam — drops the memoised client so a new environment takes effect. */
export function __resetPaddleClient(): void {
  client = null;
}
