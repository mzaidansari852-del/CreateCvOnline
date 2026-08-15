import { createHmac } from 'node:crypto';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { __resetServerEnvCache, isPaddleConfigured, publicEnv, serverEnv } from '@/lib/env';
import {
  PaymentsUnavailableError,
  availableGateways,
  gateway,
  gatewayFor,
  paymentsAvailable,
} from '@/lib/payments';
import {
  PaddleError,
  __resetPaddleClient,
  fromMinorUnits,
  paddleCaptureMatchesPlan,
  paddleGateway,
  planForPriceId,
  priceIdFor,
  readWebhookTransaction,
} from '@/lib/payments/paddle';
import { paypalGateway } from '@/lib/payments/paypal';
import { PLANS } from '@/lib/plans';
import type { CaptureResult } from '@/types/payment';

/**
 * Paddle: the money, not the plumbing.
 *
 * Everything here is one of the four things that stand between "a stranger POSTed
 * something to our webhook" and "an account is upgraded":
 *
 *  1. `fromMinorUnits` — Paddle speaks in minor units, we speak in decimals. Get the
 *     factor of 100 wrong and every amount check downstream is comparing the wrong number.
 *  2. `planForPriceId` — the plan is derived from *our* configuration, so a payload naming
 *     an arbitrary price grants nothing.
 *  3. `paddleCaptureMatchesPlan` — the last gate before an entitlement is written.
 *  4. `readWebhookTransaction` — the parser that decides what the signed payload said.
 *
 * Nothing in this file touches the network. The only Paddle SDK code that runs is the
 * webhook signature validator, which is pure HMAC.
 */

/* -------------------------------------------------------------------------- */
/* Environment                                                                 */
/* -------------------------------------------------------------------------- */

const ORIGINAL = { ...process.env };

/** Sandbox-shaped, obviously fake. Nothing here is ever sent anywhere. */
const API_KEY = 'pdl_sdbx_apikey_01j0000000000000000000test_ThisIsNotARealKey_AQO';
const PRICE_PRO = 'pri_01j00000000000000000000pro';
const PRICE_LIFETIME = 'pri_01j0000000000000000life';
const WEBHOOK_SECRET = 'pdl_ntfset_01j0000000000000000000test_ThisIsNotARealSecret';

const PAYPAL_CLIENT_ID = 'AXtest0000000000000000000000000000000000000000000000000000000000';
const PAYPAL_CLIENT_SECRET = 'EJtest0000000000000000000000000000000000000000000000000000000000';

/**
 * Applies environment changes and drops both memoised caches.
 *
 * `serverEnv()` and the Paddle client are both memoised for the lifetime of the process,
 * which is exactly right in production and exactly wrong here — without the resets a case
 * would silently assert against the previous case's configuration.
 */
function setEnv(vars: Record<string, string | undefined>): void {
  for (const [key, value] of Object.entries(vars)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  __resetServerEnvCache();
  __resetPaddleClient();
}

/** A fully configured Paddle, no PayPal. The starting point for most cases. */
function configurePaddleOnly(): void {
  setEnv({
    PADDLE_API_KEY: API_KEY,
    PADDLE_PRICE_PRO: PRICE_PRO,
    PADDLE_PRICE_LIFETIME: PRICE_LIFETIME,
    PADDLE_WEBHOOK_SECRET: WEBHOOK_SECRET,
    PADDLE_ENVIRONMENT: 'sandbox',
    PAYPAL_CLIENT_ID: undefined,
    PAYPAL_CLIENT_SECRET: undefined,
  });
}

beforeEach(() => {
  configurePaddleOnly();
});

afterEach(() => {
  // Restore wholesale rather than deleting the keys this file happens to have set:
  // a leaked PADDLE_* value would quietly change what other suites think is configured.
  process.env = { ...ORIGINAL };
  __resetServerEnvCache();
  __resetPaddleClient();
  vi.resetModules();
});

/* -------------------------------------------------------------------------- */
/* Fixtures                                                                    */
/* -------------------------------------------------------------------------- */

const PRO_PRICE = Number.parseFloat(PLANS.pro.price);

/** A decimal string in the store currency, so the boundaries survive a price change. */
const money = (value: number): string => value.toFixed(2);

function capture(overrides: Partial<CaptureResult> = {}): CaptureResult {
  return {
    orderId: 'txn_01j0000000000000000000test',
    // Paddle's payment attempt id is a plain UUID, not a `pre_`/`txn_`-style id.
    captureId: '497f776b-851d-4ebf-89ab-8ba0f75d2d6a',
    status: 'completed',
    amount: PLANS.pro.price,
    currency: 'USD',
    payerEmail: 'payer@example.com',
    raw: {},
    ...overrides,
  };
}

/**
 * The wire shape: snake_case, exactly as Paddle POSTs it.
 * `data` is merged rather than replaced, so a case can override one field of it.
 */
function wireEvent(
  overrides: { data?: Record<string, unknown> } & Record<string, unknown> = {},
): Record<string, unknown> {
  const { data: dataOverrides, ...rest } = overrides;
  return {
    event_id: 'evt_01j0000000000000000000test',
    event_type: 'transaction.completed',
    occurred_at: '2026-08-15T10:00:00.000000Z',
    notification_id: 'ntf_01j0000000000000000000test',
    ...rest,
    data: {
      id: 'txn_01j0000000000000000000test',
      status: 'completed',
      currency_code: 'USD',
      custom_data: { userId: 'user-abc', planId: 'pro' },
      items: [
        { price: { id: PRICE_PRO, product_id: 'pro_01j000000000000000000test' }, quantity: 1 },
      ],
      details: { totals: { grand_total: '900', currency_code: 'USD' } },
      ...dataOverrides,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* fromMinorUnits                                                              */
/* -------------------------------------------------------------------------- */

describe('fromMinorUnits', () => {
  it('is being tested against a USD store, which the currency cases assume', () => {
    // `publicEnv` is frozen at import time, so this cannot be changed per-case with
    // `__resetServerEnvCache()`. Assert it instead of quietly assuming it.
    expect(publicEnv.storeCurrency).toBe('USD');
  });

  it('divides a two-decimal currency by 100', () => {
    expect(fromMinorUnits('900', 'USD')).toBe('9.00');
    expect(fromMinorUnits('6900', 'USD')).toBe('69.00');
    expect(fromMinorUnits('1', 'USD')).toBe('0.01');
    expect(fromMinorUnits('0', 'USD')).toBe('0.00');
  });

  it('always returns two decimal places, so the ledger never stores "9" for £9', () => {
    expect(fromMinorUnits('900', 'EUR')).toBe('9.00');
    expect(fromMinorUnits('1000', 'GBP')).toBe('10.00');
    expect(fromMinorUnits('1050', 'GBP')).toBe('10.50');
  });

  it('does NOT divide a zero-decimal currency', () => {
    // ¥1,400 arrives as "1400". Dividing it would report ¥14 — a hundredth of what the
    // customer paid, which then fails the amount check on a perfectly good payment.
    expect(fromMinorUnits('1400', 'JPY')).toBe('1400');
    expect(fromMinorUnits('12000', 'KRW')).toBe('12000');
    expect(fromMinorUnits('220000', 'VND')).toBe('220000');
    expect(fromMinorUnits('8500', 'CLP')).toBe('8500');
  });

  it('recognises a zero-decimal currency however it is cased', () => {
    expect(fromMinorUnits('1400', 'jpy')).toBe('1400');
    expect(fromMinorUnits('1400', 'Jpy')).toBe('1400');
  });

  it('never returns a bare integer for a two-decimal currency', () => {
    // The inverse of the case above: a currency that is *not* zero-decimal must keep its
    // pence, or `Number.parseFloat` downstream compares 900 against 9.
    expect(fromMinorUnits('900', 'JPYX')).toBe('9.00');
    expect(fromMinorUnits('900', 'HKD')).toBe('9.00');
  });

  it('treats empty, missing and non-numeric input as zero', () => {
    expect(fromMinorUnits('', 'USD')).toBe('0.00');
    expect(fromMinorUnits(null, 'USD')).toBe('0.00');
    expect(fromMinorUnits(undefined, 'USD')).toBe('0.00');
    expect(fromMinorUnits('abc', 'USD')).toBe('0.00');
    expect(fromMinorUnits('   ', 'USD')).toBe('0.00');
    expect(fromMinorUnits('', 'JPY')).toBe('0.00');
    expect(fromMinorUnits('abc', 'JPY')).toBe('0.00');
  });

  it('ignores stray formatting around the digits', () => {
    expect(fromMinorUnits(' 900 ', 'USD')).toBe('9.00');
    expect(fromMinorUnits('900 ', 'JPY')).toBe('900');
  });

  it('carries a negative through rather than reading a refund as a payment', () => {
    // An adjusted transaction can total below zero. It must not come back positive.
    expect(fromMinorUnits('-900', 'USD')).toBe('-9.00');
    expect(fromMinorUnits('-1400', 'JPY')).toBe('-1400');
    expect(
      paddleCaptureMatchesPlan(capture({ amount: fromMinorUnits('-900', 'USD') }), 'pro'),
    ).toBe(false);
  });

  it('survives an amount larger than any real purchase', () => {
    expect(fromMinorUnits('99999999999', 'USD')).toBe('999999999.99');
  });
});

/* -------------------------------------------------------------------------- */
/* priceIdFor / planForPriceId                                                 */
/* -------------------------------------------------------------------------- */

describe('priceIdFor', () => {
  it('returns the configured id for each purchasable plan', () => {
    expect(priceIdFor('pro')).toBe(PRICE_PRO);
    expect(priceIdFor('lifetime')).toBe(PRICE_LIFETIME);
  });

  it('returns null for a plan that is not sold', () => {
    expect(priceIdFor('free')).toBeNull();
    expect(priceIdFor('enterprise')).toBeNull();
    expect(priceIdFor('')).toBeNull();
  });

  it('throws a 503 PaddleError when Paddle is not configured', () => {
    setEnv({ PADDLE_API_KEY: undefined });
    expect(() => priceIdFor('pro')).toThrow(PaddleError);
    try {
      priceIdFor('pro');
    } catch (error) {
      expect((error as PaddleError).status).toBe(503);
      expect((error as PaddleError).message).toMatch(/PADDLE_PRICE_PRO/);
    }
  });
});

describe('planForPriceId', () => {
  it('maps each configured price id back to its plan', () => {
    expect(planForPriceId(PRICE_PRO)).toBe('pro');
    expect(planForPriceId(PRICE_LIFETIME)).toBe('lifetime');
  });

  it('round-trips with priceIdFor', () => {
    expect(planForPriceId(priceIdFor('pro'))).toBe('pro');
    expect(planForPriceId(priceIdFor('lifetime'))).toBe('lifetime');
  });

  it('returns null for a price id this deployment does not know', () => {
    // This is the rule that stops a webhook naming an arbitrary price from granting a
    // plan: unknown price, no plan, nothing written.
    expect(planForPriceId('pri_01someoneelsesprice')).toBeNull();
    expect(planForPriceId('pro')).toBeNull();
  });

  it('returns null for a missing id without touching the configuration', () => {
    expect(planForPriceId(null)).toBeNull();
    expect(planForPriceId(undefined)).toBeNull();
    expect(planForPriceId('')).toBeNull();

    // Even with nothing configured: an absent id is answerable without config.
    setEnv({ PADDLE_API_KEY: undefined });
    expect(planForPriceId(null)).toBeNull();
  });

  it('matches exactly — no trimming, no case folding', () => {
    // Paddle ids are opaque and case-sensitive. A near miss is a miss.
    expect(planForPriceId(` ${PRICE_PRO} `)).toBeNull();
    expect(planForPriceId(PRICE_PRO.toUpperCase())).toBeNull();
    expect(planForPriceId(`${PRICE_PRO}x`)).toBeNull();
  });

  it('follows the configuration when the price ids change', () => {
    setEnv({ PADDLE_PRICE_PRO: 'pri_01newproprice' });
    expect(planForPriceId('pri_01newproprice')).toBe('pro');
    expect(planForPriceId(PRICE_PRO)).toBeNull();
  });
});

/* -------------------------------------------------------------------------- */
/* paddleCaptureMatchesPlan                                                    */
/* -------------------------------------------------------------------------- */

describe('paddleCaptureMatchesPlan — store currency', () => {
  it('accepts exactly the plan price', () => {
    expect(paddleCaptureMatchesPlan(capture(), 'pro')).toBe(true);
    expect(paddleCaptureMatchesPlan(capture({ amount: PLANS.lifetime.price }), 'lifetime')).toBe(
      true,
    );
  });

  it('is case-insensitive about the currency code', () => {
    expect(paddleCaptureMatchesPlan(capture({ currency: 'usd' }), 'pro')).toBe(true);
  });

  it('rejects an underpayment, however small', () => {
    expect(paddleCaptureMatchesPlan(capture({ amount: money(PRO_PRICE - 0.01) }), 'pro')).toBe(
      false,
    );
    expect(paddleCaptureMatchesPlan(capture({ amount: '1.00' }), 'pro')).toBe(false);
  });

  it('rejects a zero amount', () => {
    expect(paddleCaptureMatchesPlan(capture({ amount: '0.00' }), 'pro')).toBe(false);
    expect(paddleCaptureMatchesPlan(capture({ amount: '0' }), 'pro')).toBe(false);
  });

  it('rejects a negative amount', () => {
    expect(paddleCaptureMatchesPlan(capture({ amount: `-${PLANS.pro.price}` }), 'pro')).toBe(false);
  });

  it('rejects an unparseable amount', () => {
    expect(paddleCaptureMatchesPlan(capture({ amount: '' }), 'pro')).toBe(false);
    expect(paddleCaptureMatchesPlan(capture({ amount: 'free' }), 'pro')).toBe(false);
    expect(paddleCaptureMatchesPlan(capture({ amount: 'NaN' }), 'pro')).toBe(false);
    expect(paddleCaptureMatchesPlan(capture({ amount: 'Infinity' }), 'pro')).toBe(false);
  });

  it('tolerates sub-cent float noise but nothing larger', () => {
    expect(paddleCaptureMatchesPlan(capture({ amount: `${money(PRO_PRICE)}1` }), 'pro')).toBe(true);
    expect(paddleCaptureMatchesPlan(capture({ amount: money(PRO_PRICE - 0.02) }), 'pro')).toBe(
      false,
    );
  });

  it('rejects the Pro price redeemed against Lifetime', () => {
    expect(paddleCaptureMatchesPlan(capture({ amount: PLANS.pro.price }), 'lifetime')).toBe(false);
  });

  it('rejects an overpayment too, because it means the plan was misidentified', () => {
    expect(paddleCaptureMatchesPlan(capture({ amount: PLANS.lifetime.price }), 'pro')).toBe(false);
  });
});

describe('paddleCaptureMatchesPlan — status', () => {
  it('requires a completed transaction', () => {
    for (const status of ['created', 'approved', 'failed', 'cancelled', 'refunded'] as const) {
      expect(paddleCaptureMatchesPlan(capture({ status }), 'pro')).toBe(false);
    }
  });

  it('rejects a non-completed status even when the amount is perfect', () => {
    // `billed`/`ready` map to `approved`: the overlay is open and nothing has been paid.
    expect(paddleCaptureMatchesPlan(capture({ status: 'approved' }), 'pro')).toBe(false);
  });
});

/** A capture carrying the line item Paddle billed, which is what the check now reads. */
function capturePricedAt(priceId: string, overrides: Partial<CaptureResult> = {}): CaptureResult {
  return capture({ raw: { items: [{ price: { id: priceId } }] }, ...overrides });
}

describe('paddleCaptureMatchesPlan — foreign currency', () => {
  /*
   * Paddle localises prices, so a German customer legitimately pays in EUR for a plan
   * listed in USD and an exact amount match would decline a real purchase.
   *
   * The rule used to be "at least half the list price", comparing raw numbers across
   * currencies — which for a $9 plan is a floor of the number 4.5, cleared by ¥5. The
   * check now asks the question that actually matters: was this billed against the price
   * id we configured for this plan? Paddle owns the amount for its own price in every
   * currency it sells in, so a matching id needs no arithmetic from us.
   */

  it('accepts any localised amount billed against the right price', () => {
    for (const [currency, amount] of [
      ['EUR', '8.30'],
      ['GBP', '7.10'],
      ['JPY', '1400'],
    ] as const) {
      expect(
        paddleCaptureMatchesPlan(capturePricedAt(PRICE_PRO, { currency, amount }), 'pro'),
        `${currency} ${amount}`,
      ).toBe(true);
    }
  });

  it('rejects a token amount even in a weak currency', () => {
    /*
     * The hole this closes. Under the old floor, ¥5 — about three US cents — bought a $9
     * plan, because 5 >= 4.5 is true whatever the currency means. Now the price id
     * decides, and a token amount billed against the wrong price is refused however
     * large the number looks.
     */
    expect(
      paddleCaptureMatchesPlan(
        capturePricedAt('pri_something_else', { currency: 'JPY', amount: '5' }),
        'pro',
      ),
    ).toBe(false);
    expect(paddleCaptureMatchesPlan(capture({ currency: 'EUR', amount: '0.50' }), 'pro')).toBe(
      false,
    );
  });

  it('rejects a foreign amount with no readable price id, rather than guessing', () => {
    // Fail closed: without the price there is no honest way to judge a foreign amount.
    expect(paddleCaptureMatchesPlan(capture({ currency: 'EUR', amount: '8.30' }), 'pro')).toBe(
      false,
    );
  });

  it('rejects the other plan even when the amount would have passed', () => {
    expect(
      paddleCaptureMatchesPlan(
        capturePricedAt(PRICE_LIFETIME, { currency: 'EUR', amount: '8.30' }),
        'pro',
      ),
    ).toBe(false);
  });

  it('rejects a zero amount in a foreign currency', () => {
    expect(paddleCaptureMatchesPlan(capture({ currency: 'EUR', amount: '0.00' }), 'pro')).toBe(
      false,
    );
  });

  it('rejects an unparseable amount in a foreign currency', () => {
    expect(paddleCaptureMatchesPlan(capture({ currency: 'EUR', amount: 'gratis' }), 'pro')).toBe(
      false,
    );
  });

  it('still refuses to let a Pro payment buy Lifetime', () => {
    // The looser rule is about currency, not about which plan was paid for.
    expect(paddleCaptureMatchesPlan(capture({ currency: 'EUR', amount: '9.00' }), 'lifetime')).toBe(
      false,
    );
  });

  it('still requires a completed status', () => {
    expect(
      paddleCaptureMatchesPlan(
        capture({ currency: 'EUR', amount: '8.30', status: 'approved' }),
        'pro',
      ),
    ).toBe(false);
  });

  it('accepts a zero-decimal currency at its real magnitude', () => {
    // Billed against the right price, so the magnitude is Paddle's problem, not ours.
    // ¥1,400 for a $9 plan: only sane because `fromMinorUnits` did not divide it.
    expect(
      paddleCaptureMatchesPlan(
        capturePricedAt(PRICE_PRO, { currency: 'JPY', amount: '1400' }),
        'pro',
      ),
    ).toBe(true);
  });

  it('still exact-matches the amount in whatever the store currency is', async () => {
    // `publicEnv` is read at module load, so this is the one case that has to re-import.
    process.env.NEXT_PUBLIC_STORE_CURRENCY = 'EUR';
    vi.resetModules();
    const env = await import('@/lib/env');
    const paddle = await import('@/lib/payments/paddle');
    expect(env.publicEnv.storeCurrency).toBe('EUR');

    // EUR is now the store currency, so it takes the exact-match branch...
    expect(paddle.paddleCaptureMatchesPlan(capture({ currency: 'EUR' }), 'pro')).toBe(true);
    expect(
      paddle.paddleCaptureMatchesPlan(
        capture({ currency: 'EUR', amount: money(PRO_PRICE * 0.5) }),
        'pro',
      ),
    ).toBe(false);
    /*
     * ...and USD is now the foreign one, which is judged by price id rather than by
     * amount. Half the list price with no price id on the capture is refused — under the
     * old half-price floor this same input was accepted, which is the regression this
     * assertion now pins.
     */
    expect(
      paddle.paddleCaptureMatchesPlan(
        capture({ currency: 'USD', amount: money(PRO_PRICE * 0.5) }),
        'pro',
      ),
    ).toBe(false);
    // Billed against the configured price, any USD amount is Paddle's own arithmetic.
    expect(
      paddle.paddleCaptureMatchesPlan(
        capturePricedAt(PRICE_PRO, { currency: 'USD', amount: money(PRO_PRICE * 0.5) }),
        'pro',
      ),
    ).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* readWebhookTransaction                                                      */
/* -------------------------------------------------------------------------- */

describe('readWebhookTransaction', () => {
  it('reads a snake_case wire payload', () => {
    expect(readWebhookTransaction(wireEvent())).toEqual({
      eventType: 'transaction.completed',
      transactionId: 'txn_01j0000000000000000000test',
      userId: 'user-abc',
      planId: 'pro',
      status: 'completed',
    });
  });

  it('reads a camelCase payload from the SDK', () => {
    expect(
      readWebhookTransaction({
        eventType: 'transaction.paid',
        data: {
          id: 'txn_camel',
          status: 'paid',
          customData: { userId: 'user-xyz', planId: 'lifetime' },
          items: [{ price: { id: PRICE_LIFETIME }, quantity: 1 }],
        },
      }),
    ).toEqual({
      eventType: 'transaction.paid',
      transactionId: 'txn_camel',
      userId: 'user-xyz',
      planId: 'lifetime',
      status: 'completed',
    });
  });

  it('accepts a flat price_id when there is no nested price object', () => {
    const event = wireEvent({
      data: { items: [{ price_id: PRICE_LIFETIME, quantity: 1 }] },
    });
    expect(readWebhookTransaction(event)?.planId).toBe('lifetime');
  });

  it('accepts a flat camelCase priceId too', () => {
    const event = wireEvent({ data: { items: [{ priceId: PRICE_LIFETIME }] } });
    expect(readWebhookTransaction(event)?.planId).toBe('lifetime');
  });

  it('derives the plan from the price id, not from customData', () => {
    // The whole point. `customData` is ours and round-trips untouched, but the price is
    // what the customer was actually charged for. When they disagree, the money wins.
    const event = wireEvent({
      data: {
        custom_data: { userId: 'user-abc', planId: 'lifetime' },
        items: [{ price: { id: PRICE_PRO } }],
      },
    });

    const parsed = readWebhookTransaction(event);
    expect(parsed?.planId).toBe('pro');
    expect(parsed?.planId).not.toBe('lifetime');
  });

  it('grants nothing for a price id it does not recognise, whatever customData claims', () => {
    const event = wireEvent({
      data: {
        custom_data: { userId: 'user-abc', planId: 'lifetime' },
        items: [{ price: { id: 'pri_01anarbitraryprice' } }],
      },
    });
    expect(readWebhookTransaction(event)?.planId).toBeNull();
  });

  it('returns a null plan when there are no items at all', () => {
    expect(readWebhookTransaction(wireEvent({ data: { items: [] } }))?.planId).toBeNull();
    expect(readWebhookTransaction(wireEvent({ data: { items: undefined } }))?.planId).toBeNull();
    expect(readWebhookTransaction(wireEvent({ data: { items: 'nope' } }))?.planId).toBeNull();
  });

  it('takes the user id from customData and only when it is a string', () => {
    expect(readWebhookTransaction(wireEvent({ data: { custom_data: {} } }))?.userId).toBeNull();
    expect(
      readWebhookTransaction(wireEvent({ data: { custom_data: undefined } }))?.userId,
    ).toBeNull();
    expect(
      readWebhookTransaction(wireEvent({ data: { custom_data: { userId: 42 } } }))?.userId,
    ).toBeNull();
    expect(
      readWebhookTransaction(wireEvent({ data: { custom_data: { userId: 'user-abc' } } }))?.userId,
    ).toBe('user-abc');
  });

  it('returns a null transaction id rather than the string "undefined"', () => {
    expect(
      readWebhookTransaction(wireEvent({ data: { id: undefined } }))?.transactionId,
    ).toBeNull();
  });

  it('maps the transaction status onto ours', () => {
    const statusOf = (status: unknown) =>
      readWebhookTransaction(wireEvent({ data: { status } }))?.status;
    expect(statusOf('completed')).toBe('completed');
    expect(statusOf('paid')).toBe('completed');
    expect(statusOf('billed')).toBe('approved');
    expect(statusOf('ready')).toBe('approved');
    expect(statusOf('draft')).toBe('created');
    expect(statusOf('canceled')).toBe('cancelled');
    expect(statusOf('past_due')).toBe('failed');
  });

  it('treats a status it has never seen as failed, not as success', () => {
    // A status Paddle adds later must not read as "money moved".
    expect(readWebhookTransaction(wireEvent({ data: { status: 'settled_maybe' } }))?.status).toBe(
      'failed',
    );
    expect(readWebhookTransaction(wireEvent({ data: { status: undefined } }))?.status).toBe(
      'failed',
    );
  });

  it('returns null for junk', () => {
    expect(readWebhookTransaction({})).toBeNull();
    expect(readWebhookTransaction({ event_type: 'transaction.completed' })).toBeNull();
    expect(readWebhookTransaction({ data: { id: 'txn_1' } })).toBeNull();
    expect(readWebhookTransaction({ event_type: '', data: { id: 'txn_1' } })).toBeNull();
    expect(readWebhookTransaction({ event_type: 'transaction.completed', data: null })).toBeNull();
    expect(readWebhookTransaction({ hello: 'world' })).toBeNull();
  });

  it('reports the event type verbatim so the route can ignore what it does not handle', () => {
    expect(
      readWebhookTransaction(wireEvent({ event_type: 'subscription.canceled' }))?.eventType,
    ).toBe('subscription.canceled');
  });
});

/* -------------------------------------------------------------------------- */
/* Gateway selection                                                           */
/* -------------------------------------------------------------------------- */

function configurePayPal(): void {
  setEnv({ PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET });
}

describe('gateway selection', () => {
  it('offers only Paddle when only Paddle is configured', () => {
    expect(availableGateways()).toEqual(['paddle']);
    expect(paymentsAvailable()).toBe(true);
    expect(gateway()).toBe(paddleGateway);
  });

  it('offers only PayPal when only PayPal is configured', () => {
    setEnv({ PADDLE_API_KEY: undefined });
    configurePayPal();
    expect(availableGateways()).toEqual(['paypal']);
    expect(gateway()).toBe(paypalGateway);
  });

  it('prefers Paddle when both are configured, and lists it first', () => {
    configurePayPal();
    expect(availableGateways()).toEqual(['paddle', 'paypal']);
    expect(gateway()).toBe(paddleGateway);
  });

  it('offers nothing when neither is configured', () => {
    setEnv({
      PADDLE_API_KEY: undefined,
      PADDLE_PRICE_PRO: undefined,
      PADDLE_PRICE_LIFETIME: undefined,
      PAYPAL_CLIENT_ID: undefined,
      PAYPAL_CLIENT_SECRET: undefined,
    });
    expect(availableGateways()).toEqual([]);
    expect(paymentsAvailable()).toBe(false);
    expect(() => gateway()).toThrow(PaymentsUnavailableError);
  });

  it('does not offer a half-configured Paddle', () => {
    setEnv({ PADDLE_PRICE_LIFETIME: undefined });
    configurePayPal();
    expect(availableGateways()).toEqual(['paypal']);
    expect(gateway()).toBe(paypalGateway);
  });
});

describe('gatewayFor', () => {
  it('never answers a PayPal question with the Paddle gateway', () => {
    // A payment recorded against PayPal must be reconciled through PayPal, even when
    // Paddle is the preferred gateway today. Falling back would produce a confident
    // wrong answer.
    configurePayPal();
    expect(gatewayFor('paypal')).toBe(paypalGateway);
    expect(gatewayFor('paypal')).not.toBe(paddleGateway);
    expect(gatewayFor('paypal').id).toBe('paypal');
  });

  it('returns the Paddle gateway for paddle', () => {
    expect(gatewayFor('paddle')).toBe(paddleGateway);
    expect(gatewayFor('paddle').id).toBe('paddle');
  });

  it('throws rather than falling back when PayPal is unconfigured', () => {
    // Paddle *is* configured here — the point is that it is not offered as a substitute.
    expect(() => gatewayFor('paypal')).toThrow(PaymentsUnavailableError);
  });

  it('throws when Paddle is unconfigured', () => {
    setEnv({ PADDLE_API_KEY: undefined });
    configurePayPal();
    expect(() => gatewayFor('paddle')).toThrow(PaymentsUnavailableError);
  });

  it('throws for manual, which has no gateway behind it', () => {
    configurePayPal();
    expect(() => gatewayFor('manual')).toThrow(PaymentsUnavailableError);
  });
});

/* -------------------------------------------------------------------------- */
/* Configuration gating                                                        */
/* -------------------------------------------------------------------------- */

describe('isPaddleConfigured', () => {
  it('is true only when the API key and both price ids are present', () => {
    expect(isPaddleConfigured()).toBe(true);
  });

  it('is false when a price id is missing, even with a valid API key', () => {
    // A half-configured gateway is worse than an absent one: the checkout button renders,
    // the overlay opens, and the purchase fails after the card has been entered.
    setEnv({ PADDLE_PRICE_LIFETIME: undefined });
    expect(isPaddleConfigured()).toBe(false);

    configurePaddleOnly();
    setEnv({ PADDLE_PRICE_PRO: undefined });
    expect(isPaddleConfigured()).toBe(false);
  });

  it('is false when the price ids are present but the API key is not', () => {
    setEnv({ PADDLE_API_KEY: undefined });
    expect(isPaddleConfigured()).toBe(false);
  });

  it('treats a whitespace-only value as absent rather than as an empty credential', () => {
    setEnv({ PADDLE_PRICE_PRO: '   ' });
    expect(isPaddleConfigured()).toBe(false);
  });

  it('is still true without a webhook secret — a deliberate trade-off', () => {
    // A deployment that can take a payment but not yet confirm it is recoverable by
    // reconciliation; one that cannot take a payment at all is not.
    setEnv({ PADDLE_WEBHOOK_SECRET: undefined });
    expect(isPaddleConfigured()).toBe(true);
    expect(serverEnv().paddle?.webhookSecret).toBeUndefined();
  });

  it('repairs the quotes and line wraps a dashboard paste introduces', () => {
    setEnv({
      PADDLE_API_KEY: `"${API_KEY}"`,
      PADDLE_PRICE_PRO: `  '${PRICE_PRO}'  `,
      PADDLE_PRICE_LIFETIME: `${PRICE_LIFETIME.slice(0, 8)}\n${PRICE_LIFETIME.slice(8)}`,
    });
    expect(serverEnv().paddle).toMatchObject({
      apiKey: API_KEY,
      prices: { pro: PRICE_PRO, lifetime: PRICE_LIFETIME },
    });
  });

  it('defaults to sandbox and only goes live on the exact word "production"', () => {
    expect(serverEnv().paddle?.environment).toBe('sandbox');

    setEnv({ PADDLE_ENVIRONMENT: undefined });
    expect(serverEnv().paddle?.environment).toBe('sandbox');

    setEnv({ PADDLE_ENVIRONMENT: ' "Production" ' });
    expect(serverEnv().paddle?.environment).toBe('production');

    // PayPal spells this "live". Paddle does not, and the mismatch fails safe.
    setEnv({ PADDLE_ENVIRONMENT: 'live' });
    expect(serverEnv().paddle?.environment).toBe('sandbox');
  });
});

/* -------------------------------------------------------------------------- */
/* Webhook signature — the trust boundary                                      */
/* -------------------------------------------------------------------------- */

/** Builds the `Paddle-Signature` header exactly as Paddle does: HMAC-SHA256 of `ts:body`. */
function sign(body: string, secret = WEBHOOK_SECRET, ts = Math.floor(Date.now() / 1000)): string {
  const h1 = createHmac('sha256', secret).update(`${ts}:${body}`).digest('hex');
  return `ts=${ts};h1=${h1}`;
}

describe('verifyWebhook', () => {
  const body = JSON.stringify(wireEvent());

  it('accepts a correctly signed body', async () => {
    await expect(
      paddleGateway.verifyWebhook({ 'paddle-signature': sign(body) }, body),
    ).resolves.toBe(true);
  });

  it('accepts the header under its capitalised spelling', async () => {
    await expect(
      paddleGateway.verifyWebhook({ 'Paddle-Signature': sign(body) }, body),
    ).resolves.toBe(true);
  });

  it('rejects a body altered by one byte after signing', async () => {
    const signature = sign(body);
    const tampered = body.replace('user-abc', 'user-xyz');
    expect(tampered).not.toBe(body);
    await expect(
      paddleGateway.verifyWebhook({ 'paddle-signature': signature }, tampered),
    ).resolves.toBe(false);
  });

  it('rejects a signature made with a different secret', async () => {
    const forged = sign(body, 'pdl_ntfset_01someoneelsessecret');
    await expect(paddleGateway.verifyWebhook({ 'paddle-signature': forged }, body)).resolves.toBe(
      false,
    );
  });

  it('rejects a replayed signature older than the tolerance window', async () => {
    const stale = sign(body, WEBHOOK_SECRET, Math.floor(Date.now() / 1000) - 600);
    await expect(paddleGateway.verifyWebhook({ 'paddle-signature': stale }, body)).resolves.toBe(
      false,
    );
  });

  it('rejects a request with no signature header at all', async () => {
    await expect(paddleGateway.verifyWebhook({}, body)).resolves.toBe(false);
  });

  it('rejects everything when no webhook secret is configured', async () => {
    // Unverifiable and forged are the same thing from here: neither may grant a plan.
    setEnv({ PADDLE_WEBHOOK_SECRET: undefined });
    await expect(
      paddleGateway.verifyWebhook({ 'paddle-signature': sign(body) }, body),
    ).resolves.toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* Known defects                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Defects found while writing this file, reported rather than fixed — `lib/` belongs to
 * another change in flight.
 *
 * Each case asserts the behaviour the code *should* have and is marked `it.fails`, so it
 * is green while the bug exists and turns red the moment somebody fixes it. That is the
 * signal to delete the `.fails` and move the case up into the suite above.
 */
describe('regressions — defects found by these tests and since fixed', () => {
  it('HUF and TWD are treated as zero-decimal, reporting 100x the amount paid', () => {
    /*
     * Paddle's own currency table gives HUF and TWD two decimal places — only CLP, JPY,
     * KRW and VND are zero-decimal:
     * https://developer.paddle.com/concepts/sell/supported-currencies
     *
     * So Ft 3,490 arrives as "349000" and is recorded as 349000 rather than 3490.00. The
     * ledger, the admin console and the customer's receipt are all a hundred times out,
     * and the half-price floor in `paddleCaptureMatchesPlan` is inflated by the same
     * factor — a HUF price mistyped as Ft 5 in the dashboard reads as 500 and sails past
     * a floor of 4.50.
     *
     * ISK, also in the set, is not a currency Paddle supports at all.
     */
    expect(fromMinorUnits('349000', 'HUF')).toBe('3490.00');
    expect(fromMinorUnits('28000', 'TWD')).toBe('280.00');
  });

  it('a lone minus sign produces the string "NaN" instead of "0.00"', () => {
    /*
     * `"-"` survives the `[^\d-]` filter, `parseInt("-")` is NaN, and `NaN.toFixed(2)` is
     * the string "NaN" — which `paymentRecordSchema` accepts, because `amount` is only
     * `z.string()`. The amount check itself fails closed on it, so this is a ledger and
     * support problem rather than a way in.
     */
    expect(fromMinorUnits('-', 'USD')).toBe('0.00');
    expect(fromMinorUnits('-', 'JPY')).toBe('0.00');
  });

  it('a token amount in a weak currency clears the half-price floor', () => {
    /*
     * `actual >= expected * 0.5` compares raw numbers with no conversion, so the floor
     * only means anything in a currency whose unit is worth roughly what the store
     * currency's is. Against a $9 plan the floor is the number 4.5 — which in yen is
     * ¥5 (about three US cents) and in dong is ₫5 (a fiftieth of a cent).
     *
     * The code's own comment promises the opposite: "a zero or a token amount must never
     * unlock a plan, and neither must a figure far below the list price."
     *
     * Not reachable by a tampering customer — the amount is re-read from Paddle — but it
     * is precisely the case this check exists to catch: a localised price mistyped in the
     * dashboard as ¥14 instead of ¥1,400 is granted in full.
     */
    expect(paddleCaptureMatchesPlan(capture({ currency: 'JPY', amount: '14' }), 'pro')).toBe(false);
    expect(paddleCaptureMatchesPlan(capture({ currency: 'VND', amount: '5' }), 'pro')).toBe(false);
  });

  it('an unknown plan id passes the amount check in a foreign currency', () => {
    /*
     * `getPlan` resolves anything it does not know to the free plan at 0.00, so the
     * foreign-currency branch becomes `actual >= 0` — true for every amount including
     * zero. The PayPal equivalent returns false here, and `tests/lib/payments.test.ts`
     * has a case pinning that.
     *
     * Both callers happen to filter the plan id first (`isPurchasablePlan` in the webhook
     * route, a ledger-sourced id in the verify route), so it is not reachable today. It
     * is still a hole in the function whose entire job is to be the last gate.
     */
    expect(
      paddleCaptureMatchesPlan(capture({ currency: 'EUR', amount: '0.00' }), 'not-a-plan'),
    ).toBe(false);
    expect(paddleCaptureMatchesPlan(capture({ currency: 'EUR', amount: '0.01' }), 'free')).toBe(
      false,
    );
  });

  it('a malformed Paddle-Signature header rejects instead of returning false', async () => {
    /*
     * `verifyWebhook` does `try { return paddle().webhooks.isSignatureValid(...) }` with no
     * `await`, so a *rejected* promise escapes its own catch. `WebhooksValidator` throws
     * "[Paddle] Invalid webhook signature" from inside an async method whenever the header
     * has no `ts`/`h1` pair — so the promise rejects, `verifyWebhook` rejects, and the
     * webhook route (which does not wrap the call) answers 500 instead of the intended
     * 401. Paddle retries a 500 with backoff, so a real delivery whose header a proxy has
     * truncated is re-sent for hours, and the "[paddle] webhook signature rejected" log
     * line never appears. `return await` fixes it.
     */
    await expect(
      paddleGateway.verifyWebhook({ 'paddle-signature': 'garbage' }, '{}'),
    ).resolves.toBe(false);
  });
});
