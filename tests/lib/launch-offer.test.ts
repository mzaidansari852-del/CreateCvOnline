import { describe, expect, it } from 'vitest';

import {
  PLANS,
  applyOffer,
  getPlan,
  listPrice,
  offerApplies,
  offerSavingAmount,
  offerSavingPercent,
  purchasablePlansWithOffer,
  type PlanOffer,
} from '@/lib/plans';
import { paypalCaptureMatchesAmount, paypalCaptureMatchesPlan } from '@/lib/payments/paypal';
import { launchOfferInputSchema, offerPriceSchema } from '@/types/offer';
import type { CaptureResult } from '@/types/payment';

/**
 * Offers, and the invariant that makes an editable price safe.
 *
 * The price is set from `/admin/offers` and stored in Firestore, which means it can change
 * between an order being created and that order being captured. Everything below exists to
 * pin the consequence of that:
 *
 *   **a capture is verified against the amount its own order recorded, never against
 *   whatever the price happens to be when the customer comes back.**
 *
 * Get that wrong and a customer who was quoted $6, agreed to $6 and paid $6 has their
 * payment refused because somebody edited a price while they were typing their PayPal
 * password. Their money has moved by then.
 */

const OFFER: PlanOffer = {
  active: true,
  planId: 'lifetime',
  price: '6.00',
  seats: 1000,
  label: 'Launch offer',
};

function capture(amount: string): CaptureResult {
  return {
    orderId: 'ORDER-1',
    captureId: 'CAPTURE-1',
    status: 'completed',
    amount,
    currency: 'USD',
    payerEmail: 'payer@example.com',
    raw: {},
  };
}

describe('applyOffer', () => {
  it('discounts the plan it names and nothing else', () => {
    expect(applyOffer(getPlan('lifetime'), OFFER).price).toBe('6.00');
    // Pro is untouched. An offer that quietly moved another plan's price would be found by
    // a customer, not by us.
    expect(applyOffer(getPlan('pro'), OFFER).price).toBe(PLANS.pro.price);
  });

  it('does nothing when the offer is switched off', () => {
    expect(applyOffer(getPlan('lifetime'), { ...OFFER, active: false }).price).toBe('69.00');
    expect(applyOffer(getPlan('lifetime'), null).price).toBe('69.00');
    expect(applyOffer(getPlan('lifetime'), undefined).price).toBe('69.00');
  });

  it('leaves everything except the price identical', () => {
    const offered: Record<string, unknown> = { ...applyOffer(getPlan('lifetime'), OFFER) };
    const listed: Record<string, unknown> = { ...PLANS.lifetime };
    delete offered.price;
    delete listed.price;
    // Limits especially: a cheaper Lifetime is still Lifetime.
    expect(offered).toEqual(listed);
  });

  it('never mutates the plan it is given', () => {
    applyOffer(getPlan('lifetime'), OFFER);
    // `PLANS` is shared, module-level and read by the entitlement system. Returning a copy
    // rather than editing in place is the difference between a discount and a data race.
    expect(PLANS.lifetime.price).toBe('69.00');
    expect(getPlan('lifetime').price).toBe('69.00');
  });

  it('keeps the list price reachable for the struck-through comparison', () => {
    expect(listPrice('lifetime')).toBe('69.00');
  });

  it('carries into the pricing table', () => {
    const plans = purchasablePlansWithOffer(OFFER);
    expect(plans.find((p) => p.id === 'lifetime')?.price).toBe('6.00');
    expect(plans.find((p) => p.id === 'pro')?.price).toBe(PLANS.pro.price);
  });
});

describe('the saving shown on the card', () => {
  it('is computed against the list price', () => {
    expect(offerSavingPercent(OFFER, 'lifetime')).toBe(91);
    expect(offerSavingAmount(OFFER, 'lifetime')).toBe('63.00');
  });

  it('is zero for a plan the offer does not name', () => {
    expect(offerSavingPercent(OFFER, 'pro')).toBe(0);
    expect(offerSavingAmount(OFFER, 'pro')).toBe('0.00');
    expect(offerApplies(OFFER, 'pro')).toBe(false);
  });

  it('never reports a negative saving', () => {
    const above: PlanOffer = { ...OFFER, price: '99.00' };
    expect(offerSavingAmount(above, 'lifetime')).toBe('0.00');
  });
});

/* -------------------------------------------------------------------------- */
/* The invariant                                                               */
/* -------------------------------------------------------------------------- */

describe('a capture is verified against its own order', () => {
  it('accepts the amount the order was created for', () => {
    expect(paypalCaptureMatchesAmount(capture('6.00'), '6.00')).toBe(true);
  });

  /*
   * The case the whole design exists for. An order was created at 6.00; by the time the
   * customer returns from PayPal the offer has ended and Lifetime lists at 69.00 again.
   * Their payment must still be accepted — they paid exactly what they agreed to.
   */
  it('accepts a payment made at a price that has since been withdrawn', () => {
    const paid = capture('6.00');
    // Verified against the ledger: correct.
    expect(paypalCaptureMatchesAmount(paid, '6.00')).toBe(true);
    // Verified against today's price list: this is the bug, written down.
    expect(paypalCaptureMatchesPlan(paid, 'lifetime')).toBe(false);
  });

  it('still refuses an underpayment', () => {
    expect(paypalCaptureMatchesAmount(capture('1.00'), '6.00')).toBe(false);
    expect(paypalCaptureMatchesAmount(capture('0.00'), '6.00')).toBe(false);
  });

  it('refuses an overpayment too, because it does not match the order', () => {
    expect(paypalCaptureMatchesAmount(capture('69.00'), '6.00')).toBe(false);
  });

  /*
   * A ledger row that failed to parse defaults its amount to "0.00". Treating that as an
   * expectation would accept a zero-value capture and grant the plan for nothing.
   */
  it('refuses a non-positive expectation outright', () => {
    expect(paypalCaptureMatchesAmount(capture('0.00'), '0.00')).toBe(false);
    expect(paypalCaptureMatchesAmount(capture('6.00'), '-6.00')).toBe(false);
    expect(paypalCaptureMatchesAmount(capture('6.00'), 'free')).toBe(false);
    expect(paypalCaptureMatchesAmount(capture('6.00'), '')).toBe(false);
  });

  it('refuses a currency substitution', () => {
    expect(paypalCaptureMatchesAmount({ ...capture('6.00'), currency: 'MAD' }, '6.00')).toBe(false);
    expect(paypalCaptureMatchesAmount({ ...capture('6.00'), currency: 'usd' }, '6.00')).toBe(true);
  });

  it('tolerates sub-cent float noise but nothing larger', () => {
    expect(paypalCaptureMatchesAmount(capture('6.001'), '6.00')).toBe(true);
    expect(paypalCaptureMatchesAmount(capture('5.98'), '6.00')).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* What the admin form may save                                                */
/* -------------------------------------------------------------------------- */

describe('offer price parsing', () => {
  it('normalises to two decimals so stored prices compare as strings', () => {
    expect(offerPriceSchema.parse('6')).toBe('6.00');
    expect(offerPriceSchema.parse('6.5')).toBe('6.50');
    expect(offerPriceSchema.parse(' 6.00 ')).toBe('6.00');
  });

  it('refuses anything that is not a price', () => {
    for (const bad of ['', 'free', '-6', '6.005', '6,00', '1e3', '£6']) {
      expect(offerPriceSchema.safeParse(bad).success).toBe(false);
    }
  });
});

describe('offer input', () => {
  const base = {
    active: true,
    planId: 'lifetime' as const,
    price: '6.00',
    seats: 1000,
    label: 'Launch offer',
    note: '',
  };

  it('accepts a well-formed offer', () => {
    expect(launchOfferInputSchema.safeParse(base).success).toBe(true);
  });

  it('accepts no seat limit, which makes no scarcity claim', () => {
    const parsed = launchOfferInputSchema.safeParse({ ...base, seats: null });
    expect(parsed.success).toBe(true);
  });

  it('refuses a seat count of zero or a fractional one', () => {
    expect(launchOfferInputSchema.safeParse({ ...base, seats: 0 }).success).toBe(false);
    expect(launchOfferInputSchema.safeParse({ ...base, seats: 10.5 }).success).toBe(false);
  });

  it('refuses an empty badge, which would render a blank ribbon', () => {
    expect(launchOfferInputSchema.safeParse({ ...base, label: '' }).success).toBe(false);
  });
});
