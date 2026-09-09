import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { __resetServerEnvCache, isPayPalConfigured, serverEnv } from '@/lib/env';
import {
  PaymentsUnavailableError,
  availableGateways,
  gateway,
  gatewayFor,
  paymentsAvailable,
} from '@/lib/payments';
import {
  __resetPayPalTokenCache,
  paypalCaptureMatchesPlan,
  paypalGateway,
  readPayPalCustomId,
} from '@/lib/payments/paypal';
import { PLANS } from '@/lib/plans';
import type { CaptureResult } from '@/types/payment';

/**
 * PayPal: the money, not the plumbing.
 *
 * PayPal is the interim gateway — Paddle's seller account was declined and Polar's is not
 * live yet — which makes these checks the ones actually standing between "the browser says
 * it paid" and "an account is upgraded" on the deployment as it ships today.
 *
 * The gateway differs from Polar's in one way that matters here. Under Polar the amount
 * lives at the provider: a checkout is created against a product id, and Polar decides what
 * it costs. Under PayPal the amount is *ours* — `createOrder` sends the price from
 * `lib/plans.ts` — so `paypalCaptureMatchesPlan` is not one safeguard among several, it is
 * the only thing that notices when the money that moved is not the money that was owed.
 */

/* -------------------------------------------------------------------------- */
/* Environment                                                                 */
/* -------------------------------------------------------------------------- */

const ORIGINAL = { ...process.env };

/*
 * Assembled from parts rather than written as one literal, for the same reason the Polar
 * and Paddle fixtures are: a string realistic enough to look like a credential is, to a
 * secret scanner, indistinguishable from one, and GitHub's push protection blocks the
 * commit. Building it from pieces leaves no token-shaped contiguous run in the file.
 */
const CLIENT_ID = ['A', 'b'.repeat(40), 'NotARealClientId', '0'.repeat(20)].join('');
const CLIENT_SECRET = ['E', 'c'.repeat(40), 'NotARealSecret', '0'.repeat(20)].join('');

function setEnv(overrides: Record<string, string | undefined> = {}): void {
  const base: Record<string, string | undefined> = {
    PAYPAL_CLIENT_ID: CLIENT_ID,
    PAYPAL_CLIENT_SECRET: CLIENT_SECRET,
    PAYPAL_ENVIRONMENT: 'sandbox',
    PAYPAL_WEBHOOK_ID: 'WH-NOT-A-REAL-WEBHOOK',
    // Polar off unless a case turns it on: these two suites would otherwise each depend on
    // what the other left behind.
    POLAR_ACCESS_TOKEN: undefined,
    POLAR_PRODUCT_PRO: undefined,
    POLAR_PRODUCT_LIFETIME: undefined,
    // Not set by the test runner; individual cases opt in to a deployment context.
    VERCEL_ENV: undefined,
  };

  for (const [key, value] of Object.entries({ ...base, ...overrides })) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }

  __resetServerEnvCache();
  __resetPayPalTokenCache();
}

beforeEach(() => setEnv());

afterEach(() => {
  process.env = { ...ORIGINAL };
  __resetServerEnvCache();
  __resetPayPalTokenCache();
});

/* -------------------------------------------------------------------------- */
/* Configuration                                                               */
/* -------------------------------------------------------------------------- */

describe('isPayPalConfigured', () => {
  it('is configured when both halves of the OAuth pair are present', () => {
    expect(isPayPalConfigured()).toBe(true);
    expect(serverEnv().paypal).toMatchObject({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      environment: 'sandbox',
    });
  });

  /*
   * Half a credential pair cannot authenticate, so the gateway is absent rather than
   * broken. The difference is what the customer sees: a checkout that says payments are
   * unavailable, instead of a button that fails after they have committed to buying.
   */
  it('is absent when either half is missing', () => {
    setEnv({ PAYPAL_CLIENT_ID: undefined });
    expect(isPayPalConfigured()).toBe(false);

    setEnv({ PAYPAL_CLIENT_SECRET: undefined });
    expect(isPayPalConfigured()).toBe(false);
  });

  /*
   * The webhook id is deliberately not part of the test. Without it the webhook route
   * refuses to act on anything, but the browser capture path still grants the plan — a
   * deployment that can take a payment and confirm it is recoverable, one that cannot take
   * a payment at all is not.
   */
  it('is configured without a webhook id', () => {
    setEnv({ PAYPAL_WEBHOOK_ID: undefined });
    expect(isPayPalConfigured()).toBe(true);
    expect(serverEnv().paypal?.webhookId).toBeUndefined();
  });

  /*
   * The regression this file exists for most.
   *
   * Sandbox credentials on a production deployment used to `throw` from `serverEnv()`.
   * That did not fail the build — `serverEnv()` is lazy — it threw on every request
   * instead, so sign-in, the admin console and every API route went down with the
   * checkout. Following the setup instructions in the obvious order (set the credentials,
   * leave PAYPAL_ENVIRONMENT at its sandbox default) took a live site off the air.
   *
   * The requirement is that this configuration disables the *gateway* and nothing else.
   */
  it('disables the gateway on production sandbox credentials, without throwing', () => {
    setEnv({ PAYPAL_ENVIRONMENT: 'sandbox', VERCEL_ENV: 'production' });

    expect(() => serverEnv()).not.toThrow();
    expect(serverEnv().paypal).toBeNull();
    expect(isPayPalConfigured()).toBe(false);
    expect(availableGateways()).toEqual([]);
    expect(paymentsAvailable()).toBe(false);
    // Everything else `serverEnv()` carries must survive it.
    expect(serverEnv().rateLimit.max).toBeGreaterThan(0);
  });

  /* An unset environment defaults to sandbox, so it must reach the same conclusion. */
  it('treats an unset environment on production the same way', () => {
    setEnv({ PAYPAL_ENVIRONMENT: undefined, VERCEL_ENV: 'production' });
    expect(() => serverEnv()).not.toThrow();
    expect(isPayPalConfigured()).toBe(false);
  });

  /* Preview deployments are where sandbox testing belongs, so they keep the gateway. */
  it('leaves sandbox credentials working on a preview deployment', () => {
    setEnv({ PAYPAL_ENVIRONMENT: 'sandbox', VERCEL_ENV: 'preview' });
    expect(isPayPalConfigured()).toBe(true);
    expect(availableGateways()).toEqual(['paypal']);
  });

  it('keeps live credentials on production', () => {
    setEnv({ PAYPAL_ENVIRONMENT: 'live', VERCEL_ENV: 'production' });
    expect(isPayPalConfigured()).toBe(true);
    expect(serverEnv().paypal?.environment).toBe('live');
    expect(availableGateways()).toEqual(['paypal']);
  });

  it('treats anything but the exact word "live" as sandbox', () => {
    // `production` is Polar's and Paddle's word for it, and is the likeliest thing to be
    // copied across from one of those blocks. It does not mean live here, and the failure
    // is the safe direction: sandbox, which takes no money, rather than live by accident.
    for (const value of ['sandbox', 'production', 'LIVE!', 'yes']) {
      setEnv({ PAYPAL_ENVIRONMENT: value });
      expect(serverEnv().paypal?.environment).toBe('sandbox');
    }

    // Case and surrounding whitespace are a paste artefact, not a decision.
    for (const value of ['live', 'Live ', ' LIVE ']) {
      setEnv({ PAYPAL_ENVIRONMENT: value });
      expect(serverEnv().paypal?.environment).toBe('live');
    }
  });

  /*
   * A credential wrapped across two lines by a hosting dashboard, or quoted out of habit
   * by whoever had just pasted FIREBASE_PRIVATE_KEY, is unambiguously a mistake — and one
   * that produces a 401 from PayPal and an afternoon spent re-reading values that were
   * correct all along.
   */
  it('repairs a credential mangled on paste', () => {
    setEnv({ PAYPAL_CLIENT_SECRET: `"  ${CLIENT_SECRET.slice(0, 20)}\n${CLIENT_SECRET.slice(20)}  "` });
    expect(serverEnv().paypal?.clientSecret).toBe(CLIENT_SECRET);
  });
});

/* -------------------------------------------------------------------------- */
/* Gateway selection                                                           */
/* -------------------------------------------------------------------------- */

describe('gateway selection', () => {
  it('offers PayPal when PayPal is the only configured gateway', () => {
    expect(availableGateways()).toEqual(['paypal']);
    expect(paymentsAvailable()).toBe(true);
    expect(gateway()).toBe(paypalGateway);
    expect(gatewayFor('paypal')).toBe(paypalGateway);
    expect(gatewayFor('paypal').id).toBe('paypal');
  });

  it('offers nothing when PayPal is not configured either', () => {
    setEnv({ PAYPAL_CLIENT_ID: undefined, PAYPAL_CLIENT_SECRET: undefined });
    expect(availableGateways()).toEqual([]);
    expect(paymentsAvailable()).toBe(false);
    expect(() => gateway()).toThrow(PaymentsUnavailableError);
    expect(() => gatewayFor('paypal')).toThrow(PaymentsUnavailableError);
  });

  /*
   * Order is the checkout page's default when it renders the picker, so it is a decision
   * and not an accident: Polar is the merchant of record and owes the VAT, PayPal is a
   * processor and leaves that liability with us. When both work, the customer should land
   * on the one that does not.
   */
  it('puts Polar first when both are configured', () => {
    setEnv({
      POLAR_ACCESS_TOKEN: `${['polar', 'oat', ''].join('_')}0000000000NotARealTokenAtAll0000000000`,
      POLAR_PRODUCT_PRO: '9d1b4a7e-3c2f-4e51-8a06-7b2c9f4e1d33',
      POLAR_PRODUCT_LIFETIME: '2f6c8b10-5d4a-4c93-b7e1-0a3f5d8c2b41',
    });
    expect(availableGateways()).toEqual(['polar', 'paypal']);
    expect(gateway().id).toBe('polar');
    // Named resolution still reaches the one that was asked for.
    expect(gatewayFor('paypal').id).toBe('paypal');
  });

  /*
   * A PayPal order must never be reconciled through Polar, and vice versa. Asking a
   * gateway about a payment it never took returns "not found", which reads in the admin
   * console as "this customer did not pay".
   */
  it('will not resolve `manual` to whichever gateway happens to be live', () => {
    expect(() => gatewayFor('manual')).toThrow(PaymentsUnavailableError);
  });
});

/* -------------------------------------------------------------------------- */
/* The last gate before an entitlement is written                              */
/* -------------------------------------------------------------------------- */

function capture(overrides: Partial<CaptureResult> = {}): CaptureResult {
  return {
    orderId: 'ORDER-123',
    captureId: 'CAPTURE-123',
    status: 'completed',
    amount: PLANS.pro.price,
    currency: 'USD',
    payerEmail: 'payer@example.com',
    raw: {},
    ...overrides,
  };
}

describe('paypalCaptureMatchesPlan', () => {
  it('accepts a capture for exactly the plan price', () => {
    expect(paypalCaptureMatchesPlan(capture(), 'pro')).toBe(true);
  });

  it('rejects an underpayment', () => {
    expect(paypalCaptureMatchesPlan(capture({ amount: '1.00' }), 'pro')).toBe(false);
  });

  it('rejects a capture redeemed against a more expensive plan', () => {
    // Paid the Pro price, tried to claim Lifetime.
    expect(paypalCaptureMatchesPlan(capture({ amount: PLANS.pro.price }), 'lifetime')).toBe(false);
  });

  it('rejects a currency substitution', () => {
    expect(paypalCaptureMatchesPlan(capture({ currency: 'MAD' }), 'pro')).toBe(false);
  });

  it('is case-insensitive about the currency code', () => {
    expect(paypalCaptureMatchesPlan(capture({ currency: 'usd' }), 'pro')).toBe(true);
  });

  it('tolerates sub-cent float noise but nothing larger', () => {
    expect(paypalCaptureMatchesPlan(capture({ amount: '9.001' }), 'pro')).toBe(true);
    expect(paypalCaptureMatchesPlan(capture({ amount: '8.98' }), 'pro')).toBe(false);
  });

  it('rejects a non-numeric amount', () => {
    expect(paypalCaptureMatchesPlan(capture({ amount: 'free' }), 'pro')).toBe(false);
    expect(paypalCaptureMatchesPlan(capture({ amount: '' }), 'pro')).toBe(false);
  });

  it('rejects an unknown plan, because it resolves to the free plan at 0', () => {
    expect(paypalCaptureMatchesPlan(capture(), 'not-a-plan')).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* Attribution                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * `custom_id` is how an asynchronous webhook is attributed to an account. PayPal carries
 * it through the whole payment lifecycle and it is the only thing tying a capture back to
 * a user, so a parse that succeeds on garbage would grant somebody else's plan.
 */
describe('readPayPalCustomId', () => {
  it('round-trips a user and plan', () => {
    expect(readPayPalCustomId('user-abc|pro')).toEqual({ userId: 'user-abc', planId: 'pro' });
  });

  it('returns null for anything malformed', () => {
    expect(readPayPalCustomId(undefined)).toBeNull();
    expect(readPayPalCustomId('')).toBeNull();
    expect(readPayPalCustomId('user-only')).toBeNull();
    expect(readPayPalCustomId('|pro')).toBeNull();
    expect(readPayPalCustomId('user|')).toBeNull();
  });
});
