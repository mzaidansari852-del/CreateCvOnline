import 'server-only';

import { downloadsUsed } from '@/lib/db/users';
import { countCVs } from '@/lib/db/cvs';
import { effectivePlan, type PlanLimits } from '@/lib/plans';
import { createDefaultCustomization } from '@/lib/cv/defaults';
import {
  DEFAULT_TEMPLATE_ID,
  TEMPLATE_COUNT,
  findTemplate,
  freeTemplates,
} from '@/lib/cv/template-registry';
import { cvCustomizationSchema, type CVCustomization, type CVData } from '@/types/cv';
import type { UserProfile } from '@/types/user';

/**
 * Server-side feature gating.
 *
 * Hiding a button is a courtesy to the user; this file is the actual enforcement. Every
 * mutation path — server action, route handler, PDF export — calls into here *before* it
 * touches the database, and every function throws `EntitlementError` with a message the
 * UI can show verbatim.
 */

export class EntitlementError extends Error {
  readonly status = 402;
  readonly code: EntitlementCode;
  /** Where to send the user to resolve it. */
  readonly upgradeUrl: string;

  constructor(code: EntitlementCode, message: string) {
    super(message);
    this.name = 'EntitlementError';
    this.code = code;
    this.upgradeUrl = '/pricing';
  }
}

export type EntitlementCode =
  | 'cv-limit'
  | 'download-limit'
  | 'premium-template'
  | 'advanced-customization'
  | 'share-links'
  | 'custom-sections';

/* -------------------------------------------------------------------------- */
/* Assertions                                                                  */
/* -------------------------------------------------------------------------- */

export async function assertCanCreateCV(profile: UserProfile): Promise<void> {
  const limits = effectivePlan(profile.entitlement).limits;
  if (limits.maxCvs === null) return;

  // Read the real count rather than the denormalised counter: the counter is a UI
  // convenience and could drift, and a quota must not be enforceable by drifting.
  const current = await countCVs(profile.uid);
  if (current >= limits.maxCvs) {
    throw new EntitlementError(
      'cv-limit',
      `The Free plan keeps up to ${limits.maxCvs} CVs. Upgrade to Pro for unlimited CVs, or delete one to make room.`,
    );
  }
}

export function assertCanUseTemplate(profile: UserProfile, templateId: string): void {
  const template = findTemplate(templateId);
  if (!template) {
    throw new EntitlementError('premium-template', 'That template does not exist.');
  }
  if (!template.premium) return;

  const limits = effectivePlan(profile.entitlement).limits;
  if (!limits.premiumTemplates) {
    throw new EntitlementError(
      'premium-template',
      `“${template.name}” is a Pro template. Upgrade to unlock all ${TEMPLATE_COUNT} designs, or pick one of the ${freeTemplates().length} free templates.`,
    );
  }
}

export function assertCanDownload(profile: UserProfile): void {
  const limits = effectivePlan(profile.entitlement).limits;
  if (limits.maxDownloadsPerMonth === null) return;

  const used = downloadsUsed(profile);
  if (used >= limits.maxDownloadsPerMonth) {
    throw new EntitlementError(
      'download-limit',
      `You have used all ${limits.maxDownloadsPerMonth} free downloads this month. Upgrade to Pro for unlimited PDF exports — the counter resets on the 1st.`,
    );
  }
}

export function assertCanShare(profile: UserProfile): void {
  if (effectivePlan(profile.entitlement).limits.shareLinks) return;
  throw new EntitlementError(
    'share-links',
    'Public share links are a Pro feature. Upgrade to publish your CV at a link you can put in an email.',
  );
}

export function assertCanUseCustomSections(profile: UserProfile, data: CVData): void {
  if (data.customSections.length === 0) return;
  if (effectivePlan(profile.entitlement).limits.customSections) return;
  throw new EntitlementError(
    'custom-sections',
    'Custom sections are a Pro feature. Upgrade to add sections beyond the twelve built-in ones.',
  );
}

/* -------------------------------------------------------------------------- */
/* Sanitisation                                                                */
/* -------------------------------------------------------------------------- */

/** The customization a free user is allowed to change. Everything else is pinned. */
const FREE_DEFAULTS = createDefaultCustomization();

/**
 * Coerces a customization object into what the user's plan permits.
 *
 * Used on the save path so that a free user who crafts a request by hand — or who was
 * mid-edit when their subscription lapsed — simply gets the allowed subset saved, rather
 * than a hard error on every keystroke.
 */
export function sanitizeCustomization(
  profile: UserProfile,
  input: CVCustomization,
): CVCustomization {
  const parsed = cvCustomizationSchema.parse(input);
  const limits: PlanLimits = effectivePlan(profile.entitlement).limits;

  const template = findTemplate(parsed.templateId);
  const templateAllowed = template && (!template.premium || limits.premiumTemplates);

  const templateId = templateAllowed ? parsed.templateId : DEFAULT_TEMPLATE_ID;

  if (limits.advancedCustomization) {
    return { ...parsed, templateId };
  }

  // Free plan: accent colour and paper size only. Everything else is reset so a
  // downgraded document still renders exactly as the template intends.
  return cvCustomizationSchema.parse({
    ...FREE_DEFAULTS,
    templateId,
    accentColor: parsed.accentColor,
    paperSize: parsed.paperSize,
    showPhoto: parsed.showPhoto,
    dateFormat: parsed.dateFormat,
  });
}

/** Strips custom sections a downgraded user may no longer keep. */
export function sanitizeData(profile: UserProfile, data: CVData): CVData {
  if (effectivePlan(profile.entitlement).limits.customSections) return data;
  if (data.customSections.length === 0) return data;

  const removedIds = new Set(data.customSections.map((section) => `custom:${section.id}`));
  return {
    ...data,
    customSections: [],
    sections: data.sections.filter((section) => !removedIds.has(section.id)),
  };
}

/* -------------------------------------------------------------------------- */
/* Reporting                                                                   */
/* -------------------------------------------------------------------------- */

export interface UsageSnapshot {
  cvs: { used: number; limit: number | null };
  downloads: { used: number; limit: number | null; resetsOn: string };
  planId: string;
  planName: string;
}

/** Everything the dashboard needs to render quota meters, in one round trip. */
export async function usageSnapshot(profile: UserProfile): Promise<UsageSnapshot> {
  const plan = effectivePlan(profile.entitlement);
  const [cvCount] = await Promise.all([countCVs(profile.uid).catch(() => profile.cvCount)]);

  const now = new Date();
  const resets = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  return {
    cvs: { used: cvCount, limit: plan.limits.maxCvs },
    downloads: {
      used: downloadsUsed(profile),
      limit: plan.limits.maxDownloadsPerMonth,
      resetsOn: resets.toISOString(),
    },
    planId: plan.id,
    planName: plan.name,
  };
}
