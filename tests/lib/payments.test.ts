import { describe, expect, it } from 'vitest';

import { captureMatchesPlan, readCustomId } from '@/lib/payments/paypal';
import { PLANS } from '@/lib/plans';
import type { CaptureResult } from '@/types/payment';

/**
 * Payment verification.
 *
 * These cover the checks that stand between "the browser says it paid" and "access is
 * granted". Each one is a rule that, if it were missing, would let somebody upgrade
 * without paying the advertised price.
 */

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

describe('captureMatchesPlan', () => {
  it('accepts a capture for exactly the plan price', () => {
    expect(captureMatchesPlan(capture(), 'pro')).toBe(true);
  });

  it('rejects an underpayment', () => {
    expect(captureMatchesPlan(capture({ amount: '1.00' }), 'pro')).toBe(false);
  });

  it('rejects a capture redeemed against a more expensive plan', () => {
    // Paid the Pro price, tried to claim Lifetime.
    expect(captureMatchesPlan(capture({ amount: PLANS.pro.price }), 'lifetime')).toBe(false);
  });

  it('rejects a currency substitution', () => {
    expect(captureMatchesPlan(capture({ currency: 'MAD' }), 'pro')).toBe(false);
  });

  it('is case-insensitive about the currency code', () => {
    expect(captureMatchesPlan(capture({ currency: 'usd' }), 'pro')).toBe(true);
  });

  it('tolerates sub-cent float noise but nothing larger', () => {
    expect(captureMatchesPlan(capture({ amount: '9.001' }), 'pro')).toBe(true);
    expect(captureMatchesPlan(capture({ amount: '8.98' }), 'pro')).toBe(false);
  });

  it('rejects a non-numeric amount', () => {
    expect(captureMatchesPlan(capture({ amount: 'free' }), 'pro')).toBe(false);
    expect(captureMatchesPlan(capture({ amount: '' }), 'pro')).toBe(false);
  });

  it('rejects an unknown plan, because it resolves to the free plan at £0', () => {
    expect(captureMatchesPlan(capture(), 'not-a-plan')).toBe(false);
  });
});

describe('readCustomId', () => {
  it('round-trips a user and plan', () => {
    expect(readCustomId('user-abc|pro')).toEqual({ userId: 'user-abc', planId: 'pro' });
  });

  it('returns null for anything malformed', () => {
    expect(readCustomId(undefined)).toBeNull();
    expect(readCustomId('')).toBeNull();
    expect(readCustomId('user-only')).toBeNull();
    expect(readCustomId('|pro')).toBeNull();
    expect(readCustomId('user|')).toBeNull();
  });
});
