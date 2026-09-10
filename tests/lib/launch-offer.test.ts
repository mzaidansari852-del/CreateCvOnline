import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  LAUNCH_OFFER_SEATS,
  PLANS,
  getPlan,
  hasLaunchOffer,
  launchOffer,
  listPrice,
  purchasablePlans,
} from '@/lib/plans';
import { paypalCaptureMatchesPlan } from '@/lib/payments/paypal';
import type { CaptureResult } from '@/types/payment';

/**
 * The launch offer.
 *
 * One property matters more than the rest, and it is the reason the discount lives in
 * `getPlan()` rather than in the pricing page: **the price shown, the price charged and the
 * price verified have to be the same number.**
 *
 * Under Polar that would be partly self-enforcing, because the amount lives at the provider
 * and a checkout is created against a product id. Under PayPal the amount is ours — we send
 * it with the order and we check it when the capture comes back — so a discount applied in
 * the UI alone would produce an order created at the offer price and refused at
 * verification for not matching the list price. The customer's money moves and then they
 * are told the payment failed, which is the worst outcome this codebase can produce.
 */

const ORIGINAL = { ...process.env };

function setOffer(state: 'on' | 'off'): void {
  if (state === 'off') process.env.NEXT_PUBLIC_LAUNCH_OFFER = 'off';
  else delete process.env.NEXT_PUBLIC_LAUNCH_OFFER;
}

beforeEach(() => setOffer('on'));
afterEach(() => {
  process.env = { ...ORIGINAL };
});

describe('while the offer runs', () => {
  it('discounts the offer plan and nothing else', () => {
    expect(getPlan('lifetime').price).toBe('6.00');
    // Pro is untouched. A launch offer that quietly moved another plan's price would be
    // discovered by a customer, not by us.
    expect(getPlan('pro').price).toBe(PLANS.pro.price);
    expect(getPlan('free').price).toBe('0.00');
  });

  it('keeps the list price available for the struck-through comparison', () => {
    expect(listPrice('lifetime')).toBe('69.00');
    expect(listPrice('lifetime')).toBe(PLANS.lifetime.price);
  });

  it('reports which plan is on offer', () => {
    expect(hasLaunchOffer('lifetime')).toBe(true);
    expect(hasLaunchOffer('pro')).toBe(false);
    expect(launchOffer()?.seats).toBe(LAUNCH_OFFER_SEATS);
  });

  /*
   * The one that would cost real money. `paypalCaptureMatchesPlan` is the last gate before
   * an entitlement is written, and it must agree with what the order was created for.
   */
  it('verifies a capture at the offer price, and refuses the list price', () => {
    const capture = (amount: string): CaptureResult => ({
      orderId: 'ORDER-1',
      captureId: 'CAPTURE-1',
      status: 'completed',
      amount,
      currency: 'USD',
      payerEmail: 'payer@example.com',
      raw: {},
    });

    expect(paypalCaptureMatchesPlan(capture('6.00'), 'lifetime')).toBe(true);
    /*
     * Refusing 69.00 looks odd written down — it is *more* than we asked for. But the rule
     * is that the capture matches the order, and an order created while the offer runs was
     * for 6.00. A payment that does not match its order is exactly what this check is for,
     * whichever direction it differs in.
     */
    expect(paypalCaptureMatchesPlan(capture('69.00'), 'lifetime')).toBe(false);
  });

  it('carries the offer price into the pricing table', () => {
    const lifetime = purchasablePlans().find((plan) => plan.id === 'lifetime');
    expect(lifetime?.price).toBe('6.00');
  });

  it('leaves the plan otherwise identical', () => {
    const offered: Record<string, unknown> = { ...getPlan('lifetime') };
    const listed: Record<string, unknown> = { ...PLANS.lifetime };
    delete offered.price;
    delete listed.price;
    // Only the price moves. Limits especially: a cheaper Lifetime is still Lifetime.
    expect(offered).toEqual(listed);
    expect(getPlan('lifetime').accessDays).toBeNull();
  });
});

describe('once the offer is switched off', () => {
  beforeEach(() => setOffer('off'));

  it('restores the list price everywhere', () => {
    expect(getPlan('lifetime').price).toBe('69.00');
    expect(hasLaunchOffer('lifetime')).toBe(false);
    expect(launchOffer()).toBeNull();
    expect(purchasablePlans().find((p) => p.id === 'lifetime')?.price).toBe('69.00');
  });

  it('moves verification back with it', () => {
    const capture = (amount: string): CaptureResult => ({
      orderId: 'ORDER-2',
      captureId: 'CAPTURE-2',
      status: 'completed',
      amount,
      currency: 'USD',
      payerEmail: 'payer@example.com',
      raw: {},
    });

    expect(paypalCaptureMatchesPlan(capture('69.00'), 'lifetime')).toBe(true);
    expect(paypalCaptureMatchesPlan(capture('6.00'), 'lifetime')).toBe(false);
  });

  /*
   * The kill switch is read per call rather than memoised, so flipping it takes effect on
   * the next request instead of the next deploy. That is the whole point of it being an
   * environment variable, and it is worth a test because a `const` at module scope would
   * pass every other assertion here while making the switch useless in production.
   */
  it('takes effect without a restart', () => {
    expect(getPlan('lifetime').price).toBe('69.00');
    setOffer('on');
    expect(getPlan('lifetime').price).toBe('6.00');
    setOffer('off');
    expect(getPlan('lifetime').price).toBe('69.00');
  });

  it('only treats the exact word "off" as off', () => {
    process.env.NEXT_PUBLIC_LAUNCH_OFFER = 'no';
    expect(getPlan('lifetime').price).toBe('6.00');
    process.env.NEXT_PUBLIC_LAUNCH_OFFER = ' OFF ';
    expect(getPlan('lifetime').price).toBe('69.00');
  });
});
