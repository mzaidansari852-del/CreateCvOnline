import {
  FREE_ATS_TEMPLATE_COUNT,
  FREE_TEMPLATE_COUNT,
  TEMPLATE_COUNT,
} from '@/lib/cv/template-registry';
import type { PlanId, UserEntitlement } from '@/types/user';

/**
 * Plans and entitlements.
 *
 * This file is the *only* definition of what a plan may do. The UI reads it to decide
 * what to show; the server reads the same object to decide what to allow. Feature gating
 * is never "hide the button" — every limit below is enforced in `lib/entitlements.ts`
 * before the mutation runs.
 */

export interface PlanLimits {
  /** `null` means unlimited. */
  maxCvs: number | null;
  /** PDF downloads per calendar month. `null` means unlimited. */
  maxDownloadsPerMonth: number | null;
  /** Access to templates flagged `premium`. */
  premiumTemplates: boolean;
  /** Colour, font, spacing and paper controls. */
  advancedCustomization: boolean;
  /** Public share links. */
  shareLinks: boolean;
  /** Export without the footer credit line. */
  removeBranding: boolean;
  /** Custom (user-defined) CV sections. */
  customSections: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  /** Decimal string in the store currency. `"0.00"` for the free plan. */
  price: string;
  /** Human billing cadence, used in the UI and the gateway's line-item description. */
  interval: 'forever' | 'month' | 'year' | 'one-time';
  /** Days of access granted by one successful payment. `null` = never expires. */
  accessDays: number | null;
  tagline: string;
  description: string;
  highlights: string[];
  limits: PlanLimits;
  /** Shown with a "Most popular" ribbon on the pricing page. */
  featured: boolean;
  /** Offered for purchase. The free plan is not purchasable. */
  purchasable: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: '0.00',
    interval: 'forever',
    accessDays: null,
    tagline: 'Everything you need to write one solid CV.',
    description:
      'Build a complete CV with the full editor, keep it in your account and download it as a PDF. No trial timer and no credit card.',
    highlights: [
      `${FREE_TEMPLATE_COUNT} free templates, ${FREE_ATS_TEMPLATE_COUNT} of them rated 5/5 for applicant tracking systems`,
      'Up to 2 saved CVs',
      '5 PDF downloads per month',
      'Real-time preview and autosave',
      'Accent colour and paper size',
    ],
    limits: {
      maxCvs: 2,
      maxDownloadsPerMonth: 5,
      premiumTemplates: false,
      advancedCustomization: false,
      shareLinks: false,
      removeBranding: false,
      customSections: false,
    },
    featured: false,
    purchasable: false,
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    price: '9.00',
    interval: 'month',
    accessDays: 31,
    tagline: 'For an active job search.',
    description: `All ${TEMPLATE_COUNT} templates, unlimited CVs and unlimited downloads, so you can tailor a version of your CV to every application instead of sending the same document everywhere.`,
    highlights: [
      `All ${TEMPLATE_COUNT} templates`,
      'Unlimited CVs and unlimited PDF downloads',
      'Full customisation: fonts, colours, spacing, sections',
      'Custom sections and section reordering',
      'Shareable public CV link',
      'No CreateCVOnline credit on your PDF',
    ],
    limits: {
      maxCvs: null,
      maxDownloadsPerMonth: null,
      premiumTemplates: true,
      advancedCustomization: true,
      shareLinks: true,
      removeBranding: true,
      customSections: true,
    },
    featured: true,
    purchasable: true,
  },

  lifetime: {
    id: 'lifetime',
    name: 'Lifetime',
    price: '69.00',
    interval: 'one-time',
    accessDays: null,
    tagline: 'Pay once. Keep it for every job you ever apply for.',
    description:
      'The same as Pro, bought once. A CV is not a one-off purchase — most people come back every two or three years, and this costs less than eight months of Pro.',
    highlights: [
      'Everything in Pro, permanently',
      'One payment, no renewal',
      'All future templates included',
      'Priority email support',
    ],
    limits: {
      maxCvs: null,
      maxDownloadsPerMonth: null,
      premiumTemplates: true,
      advancedCustomization: true,
      shareLinks: true,
      removeBranding: true,
      customSections: true,
    },
    featured: false,
    purchasable: true,
  },
};

export const PLAN_ORDER: PlanId[] = ['free', 'pro', 'lifetime'];

export const FREE_PLAN = PLANS.free;

export function getPlan(id: string): Plan {
  return PLANS[id as PlanId] ?? FREE_PLAN;
}

export function isPurchasablePlan(id: string): id is PlanId {
  const plan = PLANS[id as PlanId];
  return Boolean(plan?.purchasable);
}

export function purchasablePlans(): Plan[] {
  return PLAN_ORDER.map((id) => PLANS[id]).filter((plan) => plan.purchasable);
}

/** The entitlement a brand-new user starts with. */
export function defaultEntitlement(): UserEntitlement {
  return {
    plan: 'free',
    status: 'none',
    currentPeriodEnd: null,
    lastPaymentId: null,
    updatedAt: null,
  };
}

/**
 * The plan a user is *effectively* on right now.
 * An expired paid plan silently degrades to free rather than locking the account.
 */
export function effectivePlan(entitlement: UserEntitlement | undefined | null): Plan {
  if (!entitlement || entitlement.plan === 'free') return FREE_PLAN;
  if (entitlement.status !== 'active') return FREE_PLAN;
  if (entitlement.currentPeriodEnd) {
    const expiresAt = new Date(entitlement.currentPeriodEnd).getTime();
    if (Number.isFinite(expiresAt) && expiresAt < Date.now()) return FREE_PLAN;
  }
  return getPlan(entitlement.plan);
}

export function limitsFor(entitlement: UserEntitlement | undefined | null): PlanLimits {
  return effectivePlan(entitlement).limits;
}

export function isPremiumUser(entitlement: UserEntitlement | undefined | null): boolean {
  return effectivePlan(entitlement).id !== 'free';
}

/** ISO date at which access granted now would lapse, or `null` for lifetime. */
export function computePeriodEnd(plan: Plan, from: Date = new Date()): string | null {
  if (plan.accessDays === null) return null;
  const end = new Date(from);
  end.setUTCDate(end.getUTCDate() + plan.accessDays);
  return end.toISOString();
}

/** `2026-08` — the bucket key used for monthly download quotas. */
export function downloadPeriodKey(date: Date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}
