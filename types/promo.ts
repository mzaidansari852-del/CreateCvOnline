import { z } from 'zod';

import { planIdSchema } from './user';

/**
 * Promo codes.
 *
 * ## What a code does here, and what it deliberately does not
 *
 * A code **grants an entitlement**. It does not reduce a price.
 *
 * That is not a simplification — it is the only kind of code this application can honour on
 * its own. A percentage-off coupon has to be applied by whoever collects the money, which
 * means it lives in the payment provider's catalogue and is redeemed inside their checkout;
 * the app never sees the discount and could not enforce it if it did. Building a
 * "20% off" code here would produce a control that looks like it works and silently charges
 * full price.
 *
 * Granting access needs no provider at all, which is why it works today: comped accounts for
 * early users, a fix for someone whose payment failed, a code handed to a writer or a
 * university careers service. When a gateway is live, discount codes are a *second* type
 * that carries the provider's own coupon id — this schema leaves room for that by keeping
 * `kind` explicit rather than assuming.
 *
 * ## Why the code is the document id
 *
 * Redeeming has to answer "is this code real" in one lookup, from a string a user typed,
 * under a rate limit. A query on a `code` field needs an index and returns a set; a document
 * id is a direct get and is unique by construction — two admins cannot create the same code
 * twice, which a `where` clause cannot promise.
 *
 * Codes are normalised to upper case for that reason: `SUMMER25` and `summer25` must not be
 * two different documents, and case is not information anyone intends to carry in a code
 * read off a slide or a postcard.
 */

/** Uppercase A–Z, 0–9 and hyphens. Deliberately narrow — see `normalisePromoCode`. */
export const PROMO_CODE_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,31}$/;

export const promoKindSchema = z.enum(['grant']);

export const promoCodeSchema = z.object({
  /** The code itself, uppercase. Also the document id. */
  code: z.string().regex(PROMO_CODE_PATTERN),
  kind: promoKindSchema.default('grant'),
  /** The plan a successful redemption grants. Never `free` — that grants nothing. */
  plan: planIdSchema.exclude(['free']),
  /**
   * How long the grant lasts, in days. `null` means the plan's own window applies, which
   * for lifetime means forever.
   */
  days: z.number().int().min(1).max(3650).nullable().default(null),
  /** Total redemptions allowed across all users. `null` is unlimited. */
  maxRedemptions: z.number().int().min(1).max(1_000_000).nullable().default(null),
  redemptionCount: z.number().int().min(0).default(0),
  /**
   * The window the code works in. Both ISO-8601, both optional, both inclusive of the
   * instant they name at the start and exclusive at the end.
   *
   * `startsAt` exists so a campaign can be created and *shared* before it opens. Announcing
   * a code on a Monday for a Friday launch is the normal way to run one, and without a start
   * date the only way to do it is to create the code on the day — which means remembering,
   * at the right hour, or the offer leaks early to whoever tries it first.
   */
  startsAt: z.string().nullable().default(null),
  /** After this instant the code is refused. `null` never expires. */
  expiresAt: z.string().nullable().default(null),
  /**
   * Switched off by hand. Separate from expiry and from exhaustion because it is the only
   * one that can be undone — a code leaked on a forum needs stopping now, not editing.
   */
  active: z.boolean().default(true),
  /** Free-text, admin-only. What this code is for, so a stale one can be judged later. */
  note: z.string().max(280).default(''),
  createdBy: z.string().default(''),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PromoCode = z.infer<typeof promoCodeSchema>;

/** One per user per code. The document id is the uid, which is what makes it one. */
export const promoRedemptionSchema = z.object({
  uid: z.string(),
  email: z.string().default(''),
  plan: planIdSchema,
  redeemedAt: z.string(),
});

export type PromoRedemption = z.infer<typeof promoRedemptionSchema>;

/**
 * Why a code was refused.
 *
 * `not-found`, `inactive`, `expired` and `exhausted` are deliberately *not* distinguished
 * to the person redeeming — see the note in the redeem route. They are distinguished here
 * because support and the admin console need to know which it was.
 */
export type PromoFailure =
  'not-found' | 'inactive' | 'not-started' | 'expired' | 'exhausted' | 'already-redeemed';

/**
 * Trims, upper-cases, and collapses the separators people type instead of the ones we use.
 *
 * Someone reading a code off a screen types spaces where the printed version has hyphens,
 * and a phone keyboard offers an en dash before a hyphen. Refusing those is refusing the
 * right code for being typed by a human. Anything still outside the pattern after this is a
 * genuinely different string and is rejected.
 */
export function normalisePromoCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[\s_‐-―]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}
