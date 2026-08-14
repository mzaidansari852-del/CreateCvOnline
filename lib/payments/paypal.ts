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
 * Two rules govern everything here:
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
        'still holding the old secret and needs a redeploy.',
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

  constructor(status: number, message: string, debugId?: string) {
    super(message);
    this.name = 'PayPalError';
    this.status = status;
    this.debugId = debugId;
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
    currency: (amount?.currency_code ?? publicEnv.paypalCurrency).toUpperCase(),
    payerEmail: order.payer?.email_address ?? null,
    raw: order as unknown as Record<string, unknown>,
  };
}

/* -------------------------------------------------------------------------- */
/* Gateway                                                                     */
/* -------------------------------------------------------------------------- */

export const paypalGateway: PaymentGateway = {
  id: 'paypal',

  async createOrder({ planId, userId, returnUrl, cancelUrl }): Promise<CheckoutOrder> {
    if (!isPurchasablePlan(planId)) {
      throw new PayPalError(400, `Plan "${planId}" is not available for purchase.`);
    }

    const plan = getPlan(planId);
    const currency = publicEnv.paypalCurrency;

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
            amount: { currency_code: currency, value: plan.price },
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
 * Confirms that a capture matches what the plan actually costs.
 * Guards against a client that starts an order for one plan and tries to redeem it
 * against another, and against currency substitution.
 */
export function captureMatchesPlan(result: CaptureResult, planId: string): boolean {
  const plan = getPlan(planId);
  const expected = Number.parseFloat(plan.price);
  const actual = Number.parseFloat(result.amount);
  if (!Number.isFinite(expected) || !Number.isFinite(actual)) return false;
  // Tolerate sub-cent float noise only.
  if (Math.abs(expected - actual) > 0.005) return false;
  return result.currency.toUpperCase() === publicEnv.paypalCurrency.toUpperCase();
}

/** Extracts `userId` and `planId` from the `custom_id` we set at order creation. */
export function readCustomId(value: string | undefined): { userId: string; planId: string } | null {
  if (!value) return null;
  const [userId, planId] = value.split('|');
  if (!userId || !planId) return null;
  return { userId, planId };
}

/** Test seam — clears the memoised OAuth token. */
export function __resetPayPalTokenCache(): void {
  tokenCache = null;
}
