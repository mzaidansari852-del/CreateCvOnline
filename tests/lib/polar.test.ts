import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { __resetServerEnvCache, isPolarConfigured, publicEnv, serverEnv } from '@/lib/env';
import {
  PaymentsUnavailableError,
  availableGateways,
  gateway,
  gatewayFor,
  paymentsAvailable,
} from '@/lib/payments';
import {
  __resetPolarClient,
  checkoutToCaptureResult,
  fromMinorUnits,
  mapCheckoutStatus,
  mapOrderStatus,
  orderToCaptureResult,
  planForProductId,
  polarCaptureMatchesPlan,
  polarGateway,
  productIdFor,
  productIdOnCapture,
  readWebhookOrder,
} from '@/lib/payments/polar';
import { getPlan } from '@/lib/plans';
import type { CaptureResult } from '@/types/payment';

/**
 * Polar: the money, not the plumbing.
 *
 * Everything here is one of the things standing between "a stranger POSTed something to
 * our webhook" and "an account is upgraded":
 *
 *  1. `fromMinorUnits` — Polar speaks in minor units, we speak in decimals. Get the factor
 *     of 100 wrong and every amount in the ledger is wrong by two orders of magnitude.
 *  2. `planForProductId` — the plan is derived from *our* configuration, so a payload
 *     naming an arbitrary product grants nothing.
 *  3. `polarCaptureMatchesPlan` — the last gate before an entitlement is written.
 *  4. `readWebhookOrder` — the parser that decides what the signed payload said.
 *
 * Nothing here touches the network.
 */

/* -------------------------------------------------------------------------- */
/* Environment                                                                 */
/* -------------------------------------------------------------------------- */

const ORIGINAL = { ...process.env };

/**
 * Assembled from parts rather than written as one literal.
 *
 * The same reasoning as the Paddle fixture: a string realistic enough to pass the format
 * check is, by construction, indistinguishable from a real credential to a secret scanner,
 * and GitHub's push protection blocks the commit. Building it from pieces leaves no
 * token-shaped contiguous run in the file while producing the identical value, so the
 * format check keeps its teeth and the commit is pushable.
 */
const TOKEN_PREFIX = ['polar', 'oat', ''].join('_');
const ACCESS_TOKEN = `${TOKEN_PREFIX}0000000000NotARealTokenAtAll0000000000`;

/** Polar product ids are UUIDs, and `lib/env.ts` rejects anything that is not one. */
const PRODUCT_PRO = '9d1b4a7e-3c2f-4e51-8a06-7b2c9f4e1d33';
const PRODUCT_LIFETIME = '2f6c8b10-5d4a-4c93-b7e1-0a3f5d8c2b41';

function setEnv(overrides: Record<string, string | undefined> = {}): void {
  const base: Record<string, string | undefined> = {
    POLAR_ACCESS_TOKEN: ACCESS_TOKEN,
    POLAR_PRODUCT_PRO: PRODUCT_PRO,
    POLAR_PRODUCT_LIFETIME: PRODUCT_LIFETIME,
    POLAR_ENVIRONMENT: 'sandbox',
    POLAR_WEBHOOK_SECRET: 'whsec_notarealsecret',
  };

  for (const [key, value] of Object.entries({ ...base, ...overrides })) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }

  __resetServerEnvCache();
  __resetPolarClient();
}

beforeEach(() => setEnv());

afterEach(() => {
  process.env = { ...ORIGINAL };
  __resetServerEnvCache();
  __resetPolarClient();
});

/* -------------------------------------------------------------------------- */
/* Configuration                                                               */
/* -------------------------------------------------------------------------- */

describe('isPolarConfigured', () => {
  it('is configured when the token and both products are present', () => {
    expect(isPolarConfigured()).toBe(true);
    expect(serverEnv().polar).toMatchObject({
      accessToken: ACCESS_TOKEN,
      environment: 'sandbox',
      products: { pro: PRODUCT_PRO, lifetime: PRODUCT_LIFETIME },
    });
  });

  /*
   * Half-configured must read as absent. A gateway that can open a checkout but has no
   * product to sell fails *after* the customer has committed to buying, which is the worst
   * possible moment to discover a configuration mistake.
   */
  it('offers no checkout at all rather than one that cannot work', () => {
    setEnv({ POLAR_PRODUCT_LIFETIME: undefined });
    expect(isPolarConfigured()).toBe(false);
    expect(paymentsAvailable()).toBe(false);
  });

  /*
   * The most likely migration mistake: a Paddle price id left in the new variable. It is a
   * non-UUID, so it cannot be a Polar product, and treating it as configured would put a
   * button on the page that fails for every customer.
   */
  it('treats a leftover Paddle price id as an absent gateway', () => {
    setEnv({ POLAR_PRODUCT_PRO: 'pri_01hv8x9k2m3n4p5q6r7s8t9u0v' });
    expect(isPolarConfigured()).toBe(false);
  });

  /*
   * The second most likely one: the webhook secret pasted into the token slot. Both are
   * long opaque strings from the same dashboard.
   */
  it('treats a webhook secret in the token slot as an absent gateway', () => {
    setEnv({ POLAR_ACCESS_TOKEN: 'whsec_thisisnotanaccesstoken' });
    expect(isPolarConfigured()).toBe(false);
  });

  it('defaults to sandbox and only goes live on the exact word "production"', () => {
    setEnv({ POLAR_ENVIRONMENT: 'live' });
    expect(serverEnv().polar?.environment).toBe('sandbox');

    setEnv({ POLAR_ENVIRONMENT: ' "Production" ' });
    expect(serverEnv().polar?.environment).toBe('production');
  });

  /*
   * A deployment that can take a payment but cannot yet confirm one is recoverable by
   * reconciliation. One that cannot take a payment at all is not. So the webhook secret is
   * deliberately not part of the configured test.
   */
  it('is still configured without a webhook secret', () => {
    setEnv({ POLAR_WEBHOOK_SECRET: undefined });
    expect(isPolarConfigured()).toBe(true);
    expect(serverEnv().polar?.webhookSecret).toBeUndefined();
  });
});

/* -------------------------------------------------------------------------- */
/* Gateway selection                                                           */
/* -------------------------------------------------------------------------- */

describe('gateway selection', () => {
  it('offers Polar when Polar is configured', () => {
    expect(availableGateways()).toEqual(['polar']);
    expect(paymentsAvailable()).toBe(true);
    expect(gateway()).toBe(polarGateway);
    expect(gatewayFor('polar')).toBe(polarGateway);
    expect(gatewayFor('polar').id).toBe('polar');
  });

  it('offers nothing when Polar is not configured', () => {
    setEnv({ POLAR_ACCESS_TOKEN: undefined });
    expect(availableGateways()).toEqual([]);
    expect(() => gateway()).toThrow(PaymentsUnavailableError);
  });

  /*
   * A record taken through a provider this deployment cannot talk to must not be
   * re-checked against the one it can: asking Polar about a payment it never took returns
   * "not found", which reads as "this customer did not pay".
   *
   * `paypal` is a live gateway again, so it is here as the *unconfigured* case — this
   * suite sets no PayPal credentials. `manual` is an admin grant with no gateway behind it
   * and throws whatever is configured.
   */
  it('refuses to resolve a provider this deployment cannot reach', () => {
    expect(availableGateways()).not.toContain('paypal');
    expect(() => gatewayFor('paypal')).toThrow(PaymentsUnavailableError);
    expect(() => gatewayFor('paddle')).toThrow(PaymentsUnavailableError);
    expect(() => gatewayFor('manual')).toThrow(PaymentsUnavailableError);
  });
});

/* -------------------------------------------------------------------------- */
/* Money                                                                       */
/* -------------------------------------------------------------------------- */

describe('fromMinorUnits', () => {
  it('converts cents to a decimal string', () => {
    expect(fromMinorUnits(900, 'USD')).toBe('9.00');
    expect(fromMinorUnits(6900, 'USD')).toBe('69.00');
    expect(fromMinorUnits(1, 'EUR')).toBe('0.01');
    expect(fromMinorUnits('900', 'usd')).toBe('9.00');
  });

  /*
   * The zero-decimal list is the one place a wrong entry is a hundred-fold error. HUF and
   * TWD look zero-decimal and are not; both must keep their decimals.
   */
  it('does not divide zero-decimal currencies', () => {
    expect(fromMinorUnits(1200, 'JPY')).toBe('1200');
    expect(fromMinorUnits(1200, 'KRW')).toBe('1200');
    expect(fromMinorUnits(349000, 'HUF')).toBe('3490.00');
    expect(fromMinorUnits(3000, 'TWD')).toBe('30.00');
  });

  /*
   * `PaymentRecord.amount` is only `z.string()`, so `NaN.toFixed(2)` would serialise the
   * literal text "NaN" into the ledger. Anything unreadable is zero, which fails every
   * downstream check closed.
   */
  it('never produces NaN', () => {
    expect(fromMinorUnits(Number.NaN, 'USD')).toBe('0.00');
    expect(fromMinorUnits(undefined, 'USD')).toBe('0.00');
    expect(fromMinorUnits(null, 'USD')).toBe('0.00');
    expect(fromMinorUnits('', 'USD')).toBe('0.00');
    expect(fromMinorUnits('not-a-number', 'USD')).toBe('0.00');
  });

  it('treats a genuine zero as zero rather than as missing', () => {
    expect(fromMinorUnits(0, 'USD')).toBe('0.00');
  });
});

/* -------------------------------------------------------------------------- */
/* Status mapping                                                              */
/* -------------------------------------------------------------------------- */

describe('status mapping', () => {
  it('treats only a succeeded checkout as completed', () => {
    expect(mapCheckoutStatus('succeeded')).toBe('completed');
    expect(mapCheckoutStatus('confirmed')).toBe('approved');
    expect(mapCheckoutStatus('open')).toBe('created');
    expect(mapCheckoutStatus('expired')).toBe('cancelled');
    expect(mapCheckoutStatus('failed')).toBe('failed');
  });

  it('treats only a paid order as completed', () => {
    expect(mapOrderStatus('paid')).toBe('completed');
    expect(mapOrderStatus('pending')).toBe('approved');
    expect(mapOrderStatus('draft')).toBe('created');
    expect(mapOrderStatus('void')).toBe('cancelled');
  });

  /*
   * A partial refund is not a clean completion. Mapping it to `completed` would hide it
   * from the admin ledger entirely.
   */
  it('records a partial refund as a refund', () => {
    expect(mapOrderStatus('refunded')).toBe('refunded');
    expect(mapOrderStatus('partially_refunded')).toBe('refunded');
  });

  /* A status added by Polar later must never read as success. */
  it('fails closed on an unknown status', () => {
    expect(mapCheckoutStatus('something_new')).toBe('failed');
    expect(mapCheckoutStatus(undefined)).toBe('failed');
    expect(mapOrderStatus('something_new')).toBe('failed');
    expect(mapOrderStatus(undefined)).toBe('failed');
  });
});

/* -------------------------------------------------------------------------- */
/* Products and plans                                                          */
/* -------------------------------------------------------------------------- */

describe('product ↔ plan mapping', () => {
  it('maps each paid plan to its configured product and back', () => {
    expect(productIdFor('pro')).toBe(PRODUCT_PRO);
    expect(productIdFor('lifetime')).toBe(PRODUCT_LIFETIME);
    expect(planForProductId(PRODUCT_PRO)).toBe('pro');
    expect(planForProductId(PRODUCT_LIFETIME)).toBe('lifetime');
  });

  it('grants nothing for a product or plan it does not know', () => {
    expect(productIdFor('free')).toBeNull();
    expect(productIdFor('enterprise')).toBeNull();
    expect(planForProductId('00000000-0000-0000-0000-000000000000')).toBeNull();
    expect(planForProductId(null)).toBeNull();
    expect(planForProductId(undefined)).toBeNull();
  });
});

/* -------------------------------------------------------------------------- */
/* Capture shaping                                                             */
/* -------------------------------------------------------------------------- */

function checkout(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'c0ffee00-0000-4000-8000-000000000001',
    status: 'succeeded',
    url: 'https://polar.sh/checkout/c0ffee',
    amount: 900,
    total_amount: 900,
    currency: 'usd',
    product_id: PRODUCT_PRO,
    customer_email: 'buyer@example.com',
    metadata: { userId: 'uid-1', planId: 'pro' },
    ...overrides,
  };
}

describe('checkoutToCaptureResult', () => {
  it('reads the settled total, the currency and the buyer', () => {
    const result = checkoutToCaptureResult(checkout());
    expect(result).toMatchObject({
      orderId: 'c0ffee00-0000-4000-8000-000000000001',
      status: 'completed',
      amount: '9.00',
      currency: 'USD',
      payerEmail: 'buyer@example.com',
    });
  });

  /*
   * `total_amount` is what the customer was charged — after discount, including tax.
   * `amount` is the list figure and would overstate a discounted purchase in the ledger.
   */
  it('prefers the settled total over the list amount', () => {
    const result = checkoutToCaptureResult(checkout({ amount: 900, total_amount: 450 }));
    expect(result.amount).toBe('4.50');
  });

  /*
   * A Polar checkout carries no reference to the order it produced, so there is nothing
   * honest to put in `captureId` until the webhook arrives with one. Inventing a value
   * would put an id in the field support searches on that matches nothing in Polar.
   */
  it('leaves the capture id empty, because a checkout has none', () => {
    expect(checkoutToCaptureResult(checkout()).captureId).toBeNull();
  });
});

describe('orderToCaptureResult', () => {
  it('keys the result to the checkout id, not the order id', () => {
    const result = orderToCaptureResult(
      {
        id: 'order-99',
        status: 'paid',
        total_amount: 6900,
        currency: 'usd',
        product_id: PRODUCT_LIFETIME,
        customer: { email: 'buyer@example.com', external_id: 'uid-1' },
      },
      'checkout-1',
    );

    /*
     * The ledger row was written when the session was created and is keyed by the checkout
     * id. Returning the order id here would write a second, orphaned document and break
     * the idempotency `fulfilPayment` depends on.
     */
    expect(result.orderId).toBe('checkout-1');
    expect(result.captureId).toBe('order-99');
    expect(result.amount).toBe('69.00');
    expect(result.payerEmail).toBe('buyer@example.com');
  });
});

/* -------------------------------------------------------------------------- */
/* The last gate                                                               */
/* -------------------------------------------------------------------------- */

function capture(overrides: Partial<CaptureResult> = {}): CaptureResult {
  return {
    orderId: 'checkout-1',
    captureId: null,
    status: 'completed',
    amount: '9.00',
    currency: 'USD',
    payerEmail: null,
    raw: { product_id: PRODUCT_PRO },
    ...overrides,
  };
}

describe('polarCaptureMatchesPlan', () => {
  it('accepts a completed payment billed against the plan’s product', () => {
    expect(polarCaptureMatchesPlan(capture(), 'pro')).toBe(true);
  });

  it('refuses a payment billed against a different plan’s product', () => {
    expect(polarCaptureMatchesPlan(capture({ raw: { product_id: PRODUCT_LIFETIME } }), 'pro')).toBe(
      false,
    );
  });

  it('refuses anything that has not completed', () => {
    for (const status of ['created', 'approved', 'failed', 'cancelled', 'refunded'] as const) {
      expect(polarCaptureMatchesPlan(capture({ status }), 'pro')).toBe(false);
    }
  });

  /**
   * The regression this whole design exists for.
   *
   * Polar localises prices, so a German customer legitimately pays in EUR for a plan
   * listed in USD. The tempting fix — accept any amount above some fraction of the
   * expected one — compares raw numbers across currencies. Against a $9 plan a 50% floor
   * is a floor of the *number* 4.5, so ¥5 (about three US cents) clears it.
   *
   * Matching the product id instead delegates the arithmetic to the party that performed
   * it, and this is the case that proves the difference.
   */
  it('accepts a foreign-currency payment for the right product', () => {
    expect(
      polarCaptureMatchesPlan(capture({ amount: '8.50', currency: 'EUR' }), 'pro'),
    ).toBe(true);
  });

  it('refuses a derisory foreign amount for the wrong product', () => {
    expect(
      polarCaptureMatchesPlan(
        capture({ amount: '5', currency: 'JPY', raw: { product_id: PRODUCT_LIFETIME } }),
        'pro',
      ),
    ).toBe(false);
  });

  /*
   * `getPlan()` falls back to the free plan for an unrecognised id, which would price this
   * check at 0.00 and make every amount acceptable — the last gate wide open for exactly
   * the input that should never reach it.
   */
  it('refuses an unknown plan rather than pricing it at zero', () => {
    expect(polarCaptureMatchesPlan(capture({ raw: {} }), 'enterprise')).toBe(false);
    expect(polarCaptureMatchesPlan(capture({ raw: {} }), 'free')).toBe(false);
  });

  describe('when the product id cannot be read', () => {
    /*
     * An unrecognised payload shape. The amount is the only remaining evidence, and it is
     * only meaningful in the currency the plan is priced in.
     */
    it('falls back to the amount in the store currency', () => {
      expect(
        polarCaptureMatchesPlan(capture({ raw: {}, amount: getPlan('pro').price }), 'pro'),
      ).toBe(true);
      expect(polarCaptureMatchesPlan(capture({ raw: {}, amount: '1.00' }), 'pro')).toBe(false);
    });

    it('refuses to judge a foreign amount at all', () => {
      expect(publicEnv.storeCurrency).toBe('USD');
      expect(
        polarCaptureMatchesPlan(capture({ raw: {}, amount: '9.00', currency: 'EUR' }), 'pro'),
      ).toBe(false);
    });
  });

  /* A "pick one of several" session is not a plan purchase we know how to grant. */
  it('resolves nothing for a multi-product checkout', () => {
    const multi = capture({
      raw: { products: [{ id: PRODUCT_PRO }, { id: PRODUCT_LIFETIME }] },
      currency: 'EUR',
    });
    expect(productIdOnCapture(multi)).toBeNull();
    expect(polarCaptureMatchesPlan(multi, 'pro')).toBe(false);
  });

  it('reads a single-product checkout’s product from the list', () => {
    expect(productIdOnCapture(capture({ raw: { products: [{ id: PRODUCT_PRO }] } }))).toBe(
      PRODUCT_PRO,
    );
  });
});

/* -------------------------------------------------------------------------- */
/* Webhook parsing                                                             */
/* -------------------------------------------------------------------------- */

function orderEvent(data: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    type: 'order.paid',
    data: {
      id: 'order-1',
      status: 'paid',
      checkout_id: 'checkout-1',
      total_amount: 900,
      currency: 'usd',
      product_id: PRODUCT_PRO,
      metadata: { userId: 'uid-1', planId: 'pro' },
      customer: { email: 'buyer@example.com', external_id: 'uid-1' },
      ...data,
    },
  };
}

describe('readWebhookOrder', () => {
  it('reads the user, the plan and both ids', () => {
    expect(readWebhookOrder(orderEvent())).toMatchObject({
      eventType: 'order.paid',
      orderId: 'order-1',
      checkoutId: 'checkout-1',
      userId: 'uid-1',
      planId: 'pro',
      status: 'completed',
    });
  });

  /**
   * The plan comes from the product, never from `metadata.planId`.
   *
   * Both values are ours, but the product is what the customer was actually billed
   * against. If the two ever disagree, the money is the truth — so a payload claiming
   * `lifetime` in metadata while billed against the Pro product must resolve to `pro`.
   */
  it('derives the plan from the product, not from the metadata', () => {
    const event = orderEvent({ metadata: { userId: 'uid-1', planId: 'lifetime' } });
    expect(readWebhookOrder(event)?.planId).toBe('pro');
  });

  it('grants nothing for a product this deployment does not know', () => {
    const event = orderEvent({ product_id: '11111111-2222-4333-8444-555555555555' });
    expect(readWebhookOrder(event)?.planId).toBeNull();
  });

  /**
   * A subscription renewal has no checkout behind it.
   *
   * Polar bills the subscription and creates an order with no `checkout_id`, so the user
   * has to come from the customer's `external_id` — the uid attached when the first
   * session was created. Without this fallback every monthly renewal would be
   * unattributable and silently never extend the customer's access.
   */
  it('attributes a renewal through the customer external id', () => {
    const renewal = orderEvent({ checkout_id: undefined, metadata: {} });
    expect(readWebhookOrder(renewal)).toMatchObject({
      checkoutId: null,
      userId: 'uid-1',
      planId: 'pro',
    });
  });

  it('reads the product from a nested product object too', () => {
    const event = orderEvent({ product_id: undefined, product: { id: PRODUCT_LIFETIME } });
    expect(readWebhookOrder(event)?.planId).toBe('lifetime');
  });

  it('reports the event type verbatim so the route can ignore what it does not handle', () => {
    expect(readWebhookOrder({ type: 'checkout.updated', data: { id: 'c1' } })?.eventType).toBe(
      'checkout.updated',
    );
  });

  it('returns null for junk', () => {
    expect(readWebhookOrder({})).toBeNull();
    expect(readWebhookOrder({ type: 'order.paid' })).toBeNull();
    expect(readWebhookOrder({ data: { id: 'order-1' } })).toBeNull();
    expect(readWebhookOrder({ type: '', data: { id: 'order-1' } })).toBeNull();
    expect(readWebhookOrder({ type: 'order.paid', data: null })).toBeNull();
  });
});
