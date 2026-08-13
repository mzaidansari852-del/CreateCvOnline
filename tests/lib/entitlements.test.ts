import { beforeEach, describe, expect, it, vi } from 'vitest';

import { computePeriodEnd, downloadPeriodKey, effectivePlan, getPlan, PLANS } from '@/lib/plans';
import { createDefaultCustomization, createEmptyCV } from '@/lib/cv/defaults';
import { DEFAULT_TEMPLATE_ID, freeTemplates, premiumTemplates } from '@/lib/cv/template-registry';
import { userProfileSchema, type UserProfile } from '@/types/user';

// `lib/db/*` reaches for firebase-admin the moment a repository function runs. The
// entitlement checks under test are pure except for `assertCanCreateCV`, which is given a
// stubbed count so the suite never needs a live project.
vi.mock('@/lib/db/cvs', () => ({ countCVs: vi.fn(async () => 0) }));

const { countCVs } = await import('@/lib/db/cvs');
const {
  EntitlementError,
  assertCanCreateCV,
  assertCanDownload,
  assertCanShare,
  assertCanUseCustomSections,
  assertCanUseTemplate,
  sanitizeCustomization,
  sanitizeData,
} = await import('@/lib/entitlements');

function profile(overrides: Partial<UserProfile> = {}): UserProfile {
  const now = new Date().toISOString();
  return userProfileSchema.parse({
    uid: 'user-1',
    email: 'user@example.com',
    displayName: 'Test User',
    photoURL: '',
    role: 'user',
    emailVerified: true,
    entitlement: { plan: 'free', status: 'none', currentPeriodEnd: null, lastPaymentId: null, updatedAt: null },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  });
}

function proProfile(): UserProfile {
  return profile({
    entitlement: {
      plan: 'pro',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 86_400_000).toISOString(),
      lastPaymentId: 'ORDER-1',
      updatedAt: new Date().toISOString(),
    },
  });
}

describe('plan resolution', () => {
  it('treats a missing entitlement as free', () => {
    expect(effectivePlan(null).id).toBe('free');
    expect(effectivePlan(undefined).id).toBe('free');
  });

  it('honours an active subscription', () => {
    expect(effectivePlan(proProfile().entitlement).id).toBe('pro');
  });

  it('degrades an expired subscription to free rather than locking the account', () => {
    const expired = profile({
      entitlement: {
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() - 1000).toISOString(),
        lastPaymentId: 'ORDER-1',
        updatedAt: null,
      },
    });
    expect(effectivePlan(expired.entitlement).id).toBe('free');
  });

  it('ignores a paid plan that was never activated', () => {
    const pending = profile({
      entitlement: {
        plan: 'pro',
        status: 'pending',
        currentPeriodEnd: null,
        lastPaymentId: null,
        updatedAt: null,
      },
    });
    expect(effectivePlan(pending.entitlement).id).toBe('free');
  });

  it('never expires a lifetime purchase', () => {
    const lifetime = profile({
      entitlement: {
        plan: 'lifetime',
        status: 'active',
        currentPeriodEnd: null,
        lastPaymentId: 'ORDER-2',
        updatedAt: null,
      },
    });
    expect(effectivePlan(lifetime.entitlement).id).toBe('lifetime');
    expect(computePeriodEnd(PLANS.lifetime)).toBeNull();
  });

  it('computes a monthly period end from the purchase date', () => {
    const from = new Date('2026-01-15T00:00:00.000Z');
    const end = computePeriodEnd(PLANS.pro, from);
    expect(end).toBe('2026-02-15T00:00:00.000Z');
  });

  it('buckets downloads by calendar month in UTC', () => {
    expect(downloadPeriodKey(new Date('2026-08-31T23:59:59.000Z'))).toBe('2026-08');
    expect(downloadPeriodKey(new Date('2026-09-01T00:00:00.000Z'))).toBe('2026-09');
  });
});

describe('CV quota', () => {
  beforeEach(() => {
    vi.mocked(countCVs).mockReset();
  });

  it('allows a free user under the limit', async () => {
    vi.mocked(countCVs).mockResolvedValue(1);
    await expect(assertCanCreateCV(profile())).resolves.toBeUndefined();
  });

  it('refuses a free user at the limit', async () => {
    vi.mocked(countCVs).mockResolvedValue(PLANS.free.limits.maxCvs ?? 2);
    await expect(assertCanCreateCV(profile())).rejects.toBeInstanceOf(EntitlementError);
  });

  it('reads the real count rather than the denormalised counter', async () => {
    // The stored counter says zero, but the database says the user is at the limit.
    vi.mocked(countCVs).mockResolvedValue(9);
    await expect(assertCanCreateCV(profile({ cvCount: 0 }))).rejects.toThrow(/Free plan/);
  });

  it('never limits a Pro user', async () => {
    vi.mocked(countCVs).mockResolvedValue(500);
    await expect(assertCanCreateCV(proProfile())).resolves.toBeUndefined();
  });
});

describe('template access', () => {
  it('lets anyone use a free template', () => {
    const free = freeTemplates()[0];
    expect(free).toBeDefined();
    expect(() => assertCanUseTemplate(profile(), free!.id)).not.toThrow();
  });

  it('blocks a free user from a Pro template', () => {
    const premium = premiumTemplates()[0];
    expect(premium).toBeDefined();
    expect(() => assertCanUseTemplate(profile(), premium!.id)).toThrow(EntitlementError);
  });

  it('lets a Pro user use a Pro template', () => {
    const premium = premiumTemplates()[0];
    expect(() => assertCanUseTemplate(proProfile(), premium!.id)).not.toThrow();
  });

  it('rejects a template that does not exist', () => {
    expect(() => assertCanUseTemplate(proProfile(), 'not-a-template')).toThrow(EntitlementError);
  });
});

describe('download quota', () => {
  it('allows a free user with downloads left', () => {
    const user = profile({ downloadsThisMonth: 2, downloadsPeriod: downloadPeriodKey() });
    expect(() => assertCanDownload(user)).not.toThrow();
  });

  it('blocks a free user who has used the monthly allowance', () => {
    const user = profile({
      downloadsThisMonth: PLANS.free.limits.maxDownloadsPerMonth ?? 5,
      downloadsPeriod: downloadPeriodKey(),
    });
    expect(() => assertCanDownload(user)).toThrow(EntitlementError);
  });

  it('resets the allowance when the month rolls over', () => {
    const user = profile({ downloadsThisMonth: 99, downloadsPeriod: '2020-01' });
    expect(() => assertCanDownload(user)).not.toThrow();
  });

  it('never limits a Pro user', () => {
    const user = proProfile();
    user.downloadsThisMonth = 10_000;
    user.downloadsPeriod = downloadPeriodKey();
    expect(() => assertCanDownload(user)).not.toThrow();
  });
});

describe('sharing and custom sections', () => {
  it('is Pro-only', () => {
    expect(() => assertCanShare(profile())).toThrow(EntitlementError);
    expect(() => assertCanShare(proProfile())).not.toThrow();
  });

  it('allows a CV with no custom sections on any plan', () => {
    expect(() => assertCanUseCustomSections(profile(), createEmptyCV())).not.toThrow();
  });

  it('blocks custom sections on the free plan', () => {
    const cv = createEmptyCV();
    cv.customSections = [{ id: 'a', title: 'Patents', items: [] }];
    expect(() => assertCanUseCustomSections(profile(), cv)).toThrow(EntitlementError);
    expect(() => assertCanUseCustomSections(proProfile(), cv)).not.toThrow();
  });
});

describe('sanitisation', () => {
  it('pins a free user to the default template when they ask for a Pro one', () => {
    const premium = premiumTemplates()[0]!;
    const result = sanitizeCustomization(
      profile(),
      createDefaultCustomization({ templateId: premium.id }),
    );
    expect(result.templateId).toBe(DEFAULT_TEMPLATE_ID);
  });

  it('keeps a free user’s accent colour and paper size', () => {
    const result = sanitizeCustomization(
      profile(),
      createDefaultCustomization({ accentColor: '#aa3311', paperSize: 'letter' }),
    );
    expect(result.accentColor).toBe('#aa3311');
    expect(result.paperSize).toBe('letter');
  });

  it('resets Pro-only design controls for a free user', () => {
    const defaults = createDefaultCustomization();
    const result = sanitizeCustomization(
      profile(),
      createDefaultCustomization({
        fontSize: 13,
        bodyFont: 'playfair',
        sectionSpacing: 40,
        pageMargin: 80,
      }),
    );
    expect(result.fontSize).toBe(defaults.fontSize);
    expect(result.bodyFont).toBe(defaults.bodyFont);
    expect(result.sectionSpacing).toBe(defaults.sectionSpacing);
    expect(result.pageMargin).toBe(defaults.pageMargin);
  });

  it('leaves a Pro user’s customization untouched', () => {
    const input = createDefaultCustomization({
      templateId: premiumTemplates()[0]!.id,
      fontSize: 12,
      bodyFont: 'lora',
      pageMargin: 60,
    });
    const result = sanitizeCustomization(proProfile(), input);
    expect(result).toEqual(input);
  });

  it('strips custom sections and their ordering entries on downgrade', () => {
    const cv = createEmptyCV();
    cv.customSections = [{ id: 'x1', title: 'Patents', items: [] }];
    cv.sections = [...cv.sections, { id: 'custom:x1', label: 'Patents', enabled: true }];

    const result = sanitizeData(profile(), cv);
    expect(result.customSections).toHaveLength(0);
    expect(result.sections.some((section) => section.id === 'custom:x1')).toBe(false);
    // Built-in sections are untouched.
    expect(result.sections.some((section) => section.id === 'experience')).toBe(true);
  });

  it('keeps custom sections for a Pro user', () => {
    const cv = createEmptyCV();
    cv.customSections = [{ id: 'x1', title: 'Patents', items: [] }];
    expect(sanitizeData(proProfile(), cv).customSections).toHaveLength(1);
  });
});

describe('plan catalogue', () => {
  it('never advertises a limit the free plan does not enforce', () => {
    expect(PLANS.free.limits.maxCvs).not.toBeNull();
    expect(PLANS.free.limits.maxDownloadsPerMonth).not.toBeNull();
    expect(PLANS.free.limits.premiumTemplates).toBe(false);
    expect(PLANS.free.purchasable).toBe(false);
  });

  it('prices every purchasable plan as a decimal string', () => {
    for (const plan of Object.values(PLANS)) {
      expect(plan.price).toMatch(/^\d+\.\d{2}$/);
    }
  });

  it('falls back to the free plan for an unknown id', () => {
    expect(getPlan('enterprise-unicorn').id).toBe('free');
  });
});
