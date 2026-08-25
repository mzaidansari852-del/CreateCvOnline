import { describe, expect, it } from 'vitest';

import {
  normalisePromoCode,
  promoCodeSchema,
  PROMO_CODE_PATTERN,
} from '@/types/promo';

/**
 * Promo code parsing and normalisation.
 *
 * `redeemPromoCode` itself runs inside a Firestore transaction and is covered by the
 * emulator suite rather than here. What these assertions protect is the layer either side of
 * it: the string a person types becoming the document id we look up, and the shape of a code
 * document being refused rather than guessed at when it is wrong.
 */

describe('normalisePromoCode', () => {
  it('upper-cases, so a code read off a slide works however it is typed', () => {
    expect(normalisePromoCode('linkedin-2026')).toBe('LINKEDIN-2026');
    expect(normalisePromoCode('LinkedIn-2026')).toBe('LINKEDIN-2026');
  });

  it('trims the whitespace a paste brings with it', () => {
    expect(normalisePromoCode('  FRIENDS  ')).toBe('FRIENDS');
  });

  it('accepts the separators people type instead of a hyphen', () => {
    /*
     * A phone keyboard offers an en dash before a hyphen, and someone reading a code aloud
     * types a space where the printed version has a hyphen. Refusing those refuses the right
     * code for being typed by a human.
     */
    expect(normalisePromoCode('LINKEDIN 2026')).toBe('LINKEDIN-2026');
    expect(normalisePromoCode('LINKEDIN_2026')).toBe('LINKEDIN-2026');
    expect(normalisePromoCode('LINKEDIN‐2026')).toBe('LINKEDIN-2026');
  });

  it('collapses repeated separators rather than producing an empty segment', () => {
    expect(normalisePromoCode('LINKEDIN -- 2026')).toBe('LINKEDIN-2026');
  });

  it('strips leading and trailing separators', () => {
    expect(normalisePromoCode('-FRIENDS-')).toBe('FRIENDS');
  });

  it('leaves a genuinely different string different', () => {
    // Normalising is for typing noise, not for guessing at near-misses. `FRIEND` must never
    // resolve to `FRIENDS` — that would hand out access nobody was given.
    expect(normalisePromoCode('FRIEND')).not.toBe('FRIENDS');
  });
});

describe('PROMO_CODE_PATTERN', () => {
  it.each(['FRIENDS', 'LINKEDIN-2026', 'A1B', 'X'.repeat(32)])('accepts %s', (code) => {
    expect(PROMO_CODE_PATTERN.test(code)).toBe(true);
  });

  it.each([
    ['', 'empty'],
    ['AB', 'under three characters'],
    ['X'.repeat(33), 'over thirty-two characters'],
    ['-LEADING', 'starts with a hyphen'],
    ['lower', 'lower case'],
    ['HAS SPACE', 'contains a space'],
    ['HAS.DOT', 'contains punctuation'],
  ])('rejects %s (%s)', (code) => {
    expect(PROMO_CODE_PATTERN.test(code)).toBe(false);
  });
});

describe('promoCodeSchema', () => {
  const base = {
    code: 'FRIENDS',
    plan: 'pro' as const,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  };

  it('defaults an open-ended, unlimited, active code', () => {
    const parsed = promoCodeSchema.parse(base);
    expect(parsed).toMatchObject({
      kind: 'grant',
      days: null,
      maxRedemptions: null,
      redemptionCount: 0,
      startsAt: null,
      expiresAt: null,
      active: true,
    });
  });

  it('keeps a date window as given', () => {
    const parsed = promoCodeSchema.parse({
      ...base,
      startsAt: '2026-09-01T00:00:00.000Z',
      expiresAt: '2026-09-30T23:59:59.999Z',
    });
    expect(parsed.startsAt).toBe('2026-09-01T00:00:00.000Z');
    expect(parsed.expiresAt).toBe('2026-09-30T23:59:59.999Z');
  });

  it('refuses a code that grants the free plan', () => {
    /*
     * `free` is what everyone already has, so a code granting it would report success and
     * change nothing — the worst kind of failure, because the person redeeming it believes
     * they now have something.
     */
    expect(() => promoCodeSchema.parse({ ...base, plan: 'free' })).toThrow();
  });

  it('refuses a negative redemption count', () => {
    expect(() => promoCodeSchema.parse({ ...base, redemptionCount: -1 })).toThrow();
  });

  it('refuses a max of zero, which would be a code that can never work', () => {
    expect(() => promoCodeSchema.parse({ ...base, maxRedemptions: 0 })).toThrow();
  });

  it('refuses a code whose id is not a valid code', () => {
    expect(() => promoCodeSchema.parse({ ...base, code: 'has space' })).toThrow();
  });
});
