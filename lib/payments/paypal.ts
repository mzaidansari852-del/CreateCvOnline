import 'server-only';

import { publicEnv, requirePayPalEnv } from '@/lib/env';
import { getPlan, isPurchasablePlan } from '@/lib/plans';
import type {
  CaptureResult,
  CheckoutOrder,
  PaymentGateway,
  PaymentStatus,
} from '@/types/payment';

/**
 * PayPal REST gateway.
 *
 * ## Why this is here again
 *
 * It was removed once, on the grounds that Paddle's overlay already offered PayPal as a
 * payment method. Paddle then declined the seller account, and Polar — its replacement —
 * is not live yet. So this is not a second way to pay alongside a working gateway; for the
 * moment it is the only one that can take money at all.
 *
 * ## What it does not do, and Polar would
 *
 * PayPal is a payment processor, not a merchant of record. It moves the money and stops
 * there: **we** are the seller of record, which means we owe the VAT on every sale to a
 * customer in Germany, France or the Netherlands, and are the party responsible for
 * registering under EU VAT OSS and filing it. Polar and Paddle would both have owed that
 * instead of us. Nothing in this file changes that liability or tracks it — the plan
 * price is charged as a flat amount with no tax component — so a deployment selling into
 * the EU through this gateway is accruing an obligation that has to be settled elsewhere.
 * That is the cost of the interim, and it is worth knowing rather than discovering.
 *
 * ## The two rules that govern the code
 *
 *  1. **The price is never taken from the browser.** `createOrder` receives a plan id and
 *     looks the amount up in `lib/plans.ts`. A tampered client can at worst order a
 *     different plan — it cannot change what that plan costs.
 *  2. **A payment is only real once PayPal says so.** The browser telling us "it worked"
 *     is a hint to go and check; `captureOrder` re-reads the order from PayPal's API and
 *     compares the captured amount and currency against the plan before anything is
 *     granted.
 */

const API_BASE = {
  sandbox: 'https://api-m.sandbox.paypal.com',
  live: 'https://api-m.paypal.com',
} as const;

interface CachedToken {
  value: string;
  expiresAt: number;
}

let tokenCache: CachedToken | null = null;

function baseUrl(): string {
  return API_BASE[requirePayPalEnv().environment];
}

async function accessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.value;

  const { clientId, clientSecret } = requirePayPalEnv();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${baseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!response.ok) {
    const { environment } = requirePayPalEnv();
    const detail = (await response.json().catch(() => null)) as
      | { error?: string; error_description?: string }
      | null;
    // A bare "401" sends you back to the PayPal console to re-read credentials that are
    // usually correct — the real fault is nearly always a mangled paste. The shape of the
    // values narrows it down without putting a secret in the log: the client id's prefix
    // is public, and only the *length* of the secret is reported.
    throw new PayPalError(
      response.status,
      `PayPal rejected the API credentials (${response.status}) in the "${environment}" environment. ` +
        `Client id: ${clientId.length} chars, starts "${clientId.slice(0, 8)}". ` +
        `Secret: ${clientSecret.length} chars. ` +
        'Sandbox ids are typically 80-82 chars and secrets 80. If a length looks short the ' +
        'value was truncated on paste; if this followed a key rotation, the deployment is ' +
        'still holding the old secret and needs a redeploy.' +
        (detail?.error_description ? ` PayPal said: ${detail.error_description}.` : ''),
      undefined,
      detail?.error ?? `oauth_${response.status}`,
    );
  }

  const body = (await response.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    value: body.access_token,
    expiresAt: Date.now() + body.expires_in * 1000,
  };
  return tokenCache.value;
}

export class PayPalError extends Error {
  readonly status: number;
  readonly debugId?: string;
  /**
   * PayPal's machine-readable cause — `invalid_client`, `CURRENCY_NOT_SUPPORTED`,
   * `PAYEE_ACCOUNT_RESTRICTED`, and so on.
   *
   * Worth carrying separately from the message because it is the one part of a payment
   * failure that is both safe to show a user and precise enough to act on. Without it
   * every provider fault collapses into "please try again", and diagnosing one means
   * reading server logs — which the person who hit the error cannot do.
   */
  readonly issue?: string;

  constructor(status: number, message: string, debugId?: string, issue?: string) {
    super(message);
    this.name = 'PayPalError';
    this.status = status;
    this.debugId = debugId;
    this.issue = issue;
  }
}

async function call<T>(
  path: string,
  init: { method: 'GET' | 'POST'; body?: unknown; requestId?: string },
): Promise<T> {
  const token = await accessToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
  // PayPal deduplicates retries that carry the same request id — this is what makes a
  // double-clicked capture safe.
  if (init.requestId) headers['PayPal-Request-Id'] = init.requestId;

  const response = await fetch(`${baseUrl()}${path}`, {
    method: init.method,
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: 'no-store',
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as Record<string, unknown>) : {};

  if (!response.ok) {
    const details = Array.isArray(payload.details) ? payload.details : [];
    const first = details[0] as { description?: string; issue?: string } | undefined;
    throw new PayPalError(
      response.status,
      first?.description ??
        (typeof payload.message === 'string' ? payload.message : `PayPal request failed (${response.status})`),
      typeof payload.debug_id === 'string' ? payload.debug_id : undefined,
      // `details[0].issue` for Orders v2 faults, `name` for the envelope-level ones.
      first?.issue ?? (typeof payload.name === 'string' ? payload.name : undefined),
    );
  }

  return payload as T;
}

/* -------------------------------------------------------------------------- */
/* Response shapes (only the fields we rely on)                                */
/* -------------------------------------------------------------------------- */

interface PayPalAmount {
  currency_code?: string;
  value?: string;
}

interface PayPalCapture {
  id?: string;
  status?: string;
  amount?: PayPalAmount;
}

interface PayPalOrder {
  id: string;
  status?: string;
  links?: { rel?: string; href?: string }[];
  payer?: { email_address?: string };
  purchase_units?: {
    reference_id?: string;
    custom_id?: string;
    amount?: PayPalAmount;
    payments?: { captures?: PayPalCapture[] };
  }[];
}

function mapStatus(raw: string | undefined): PaymentStatus {
  switch ((raw ?? '').toUpperCase()) {
    case 'CREATED':
    case 'SAVED':
      return 'created';
    case 'APPROVED':
    case 'PAYER_ACTION_REQUIRED':
      return 'approved';
    case 'COMPLETED':
      return 'completed';
    case 'VOIDED':
      return 'cancelled';
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED':
      return 'refunded';
    default:
      return 'failed';
  }
}

function readOrder(order: PayPalOrder): CaptureResult {
  const unit = order.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  const amount = capture?.amount ?? unit?.amount;

  // An order is only "completed" when a capture inside it completed, whatever the
  // order-level status claims.
  const captureStatus = capture ? mapStatus(capture.status) : undefined;
  const status = captureStatus ?? mapStatus(order.status);

  return {
    orderId: order.id,
    captureId: capture?.id ?? null,
    status,
    amount: amount?.value ?? '0.00',
    currency: (amount?.currency_code ?? publicEnv.storeCurrency).toUpperCase(),
    payerEmail: order.payer?.email_address ?? null,
    raw: order as unknown as Record<string, unknown>,
  };
}

/* -------------------------------------------------------------------------- */
/* Gateway                                                                     */
/* -------------------------------------------------------------------------- */

export const paypalGateway: PaymentGateway = {
  id: 'paypal',

  async createOrder({ planId, userId, amount, returnUrl, cancelUrl }): Promise<CheckoutOrder> {
    if (!isPurchasablePlan(planId)) {
      throw new PayPalError(400, `Plan "${planId}" is not available for purchase.`);
    }

    const plan = getPlan(planId);
    const currency = publicEnv.storeCurrency;

    /*
     * The caller resolved this against the plan and the running offer. Refusing a
     * non-positive amount here rather than sending it: PayPal would reject it anyway, but a
     * zero-value order that somehow succeeded would be a free plan grant, and this is the
     * last place that can tell.
     */
    const charge = Number.parseFloat(amount);
    if (!Number.isFinite(charge) || charge <= 0) {
      throw new PayPalError(400, `Refusing to create an order for "${amount}".`);
    }

    const order = await call<PayPalOrder>('/v2/checkout/orders', {
      method: 'POST',
      requestId: `order-${userId}-${planId}-${Math.floor(Date.now() / 1000)}`,
      body: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: planId,
            // Carried through the whole payment lifecycle, including webhooks — this is
            // how an asynchronous notification is attributed to the right account.
            custom_id: `${userId}|${planId}`,
            description: `${publicEnv.siteName} ${plan.name}`.slice(0, 127),
            amount: { currency_code: currency, value: charge.toFixed(2) },
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: publicEnv.siteName,
              user_action: 'PAY_NOW',
              shipping_preference: 'NO_SHIPPING',
              landing_page: 'LOGIN',
              return_url: returnUrl,
              cancel_url: cancelUrl,
            },
          },
        },
      },
    });

    return {
      orderId: order.id,
      status: mapStatus(order.status),
      approveUrl:
        order.links?.find((link) => link.rel === 'payer-action' || link.rel === 'approve')?.href,
    };
  },

  async captureOrder(orderId: string): Promise<CaptureResult> {
    try {
      const order = await call<PayPalOrder>(`/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        requestId: `capture-${orderId}`,
        body: {},
      });
      return readOrder(order);
    } catch (error) {
      // `ORDER_ALREADY_CAPTURED` is the expected outcome of a retry or a double click.
      // Re-read the order so the caller still gets the real, completed result.
      if (error instanceof PayPalError && (error.status === 422 || error.status === 400)) {
        const existing = await call<PayPalOrder>(`/v2/checkout/orders/${orderId}`, {
          method: 'GET',
        });
        const result = readOrder(existing);
        if (result.status === 'completed') return result;
      }
      throw error;
    }
  },

  async getOrder(orderId: string): Promise<CaptureResult> {
    const order = await call<PayPalOrder>(`/v2/checkout/orders/${orderId}`, { method: 'GET' });
    return readOrder(order);
  },

  async verifyWebhook(headers, rawBody): Promise<boolean> {
    const { webhookId } = requirePayPalEnv();
    // Without a configured webhook id there is no way to verify authenticity, and an
    // unverifiable webhook must never be trusted.
    if (!webhookId) return false;

    const required = [
      'paypal-auth-algo',
      'paypal-cert-url',
      'paypal-transmission-id',
      'paypal-transmission-sig',
      'paypal-transmission-time',
    ];
    if (required.some((key) => !headers[key])) return false;

    try {
      const result = await call<{ verification_status?: string }>(
        '/v1/notifications/verify-webhook-signature',
        {
          method: 'POST',
          body: {
            auth_algo: headers['paypal-auth-algo'],
            cert_url: headers['paypal-cert-url'],
            transmission_id: headers['paypal-transmission-id'],
            transmission_sig: headers['paypal-transmission-sig'],
            transmission_time: headers['paypal-transmission-time'],
            webhook_id: webhookId,
            webhook_event: JSON.parse(rawBody) as unknown,
          },
        },
      );
      return result.verification_status === 'SUCCESS';
    } catch {
      return false;
    }
  },
};

/**
 * Confirms that a capture matches the amount the order was created for.
 *
 * ## Why this takes an amount rather than a plan id
 *
 * It used to look the plan's price up itself, which was correct only while the price was a
 * constant. Prices are now editable from `/admin/offers`, so "what this plan costs" is a
 * question with a different answer before and after somebody edits it — and a customer who
 * was shown $6, agreed to $6, and paid $6 must not have their payment refused because the
 * offer ended while they were typing their password.
 *
 * So the comparison is against `expectedAmount`: the figure written to our own ledger when
 * the order was created, which is also the figure sent to PayPal. The invariant becomes
 * "the capture matches its own order" rather than "the capture matches today's price list",
 * which is both stricter and the one that was actually meant. Nothing about it is
 * client-supplied — the ledger row is written server-side before the customer ever reaches
 * PayPal.
 */
export function paypalCaptureMatchesAmount(
  result: CaptureResult,
  expectedAmount: string,
): boolean {
  const expected = Number.parseFloat(expectedAmount);
  const actual = Number.parseFloat(result.amount);
  if (!Number.isFinite(expected) || !Number.isFinite(actual)) return false;
  /*
   * A zero or negative expectation is not a price. Guarded explicitly because the ledger's
   * amount defaults to "0.00" on a malformed row, and a free upgrade is exactly the sort of
   * thing this check exists to prevent.
   */
  if (expected <= 0) return false;
  // Tolerate sub-cent float noise only.
  if (Math.abs(expected - actual) > 0.005) return false;
  return result.currency.toUpperCase() === publicEnv.storeCurrency.toUpperCase();
}

/**
 * The same check, against a plan's list price.
 *
 * Kept for the webhook, which is attributed by `custom_id` and may arrive for an order this
 * deployment has no ledger row for — a payment completed after the row was lost, or one
 * replayed from PayPal's dashboard. There it is the only expectation available. Prefer
 * `paypalCaptureMatchesAmount` wherever the order is known.
 */
export function paypalCaptureMatchesPlan(result: CaptureResult, planId: string): boolean {
  return paypalCaptureMatchesAmount(result, getPlan(planId).price);
}

/** Extracts `userId` and `planId` from the `custom_id` we set at order creation. */
export function readPayPalCustomId(value: string | undefined): { userId: string; planId: string } | null {
  if (!value) return null;
  const [userId, planId] = value.split('|');
  if (!userId || !planId) return null;
  return { userId, planId };
}

/** Test seam — clears the memoised OAuth token. */
export function __resetPayPalTokenCache(): void {
  tokenCache = null;
}
