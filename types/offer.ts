import { z } from 'zod';
import { planIdSchema } from './user';

/**
 * A price offer on a plan.
 *
 * One document, edited from `/admin/offers`, read by every surface that quotes a price.
 * It exists because the alternative was a constant in `lib/plans.ts` and a deploy every
 * time the number moved — which makes a pricing decision into an engineering task, and
 * puts it out of reach of the person whose decision it is.
 *
 * ## Why the price is a string
 *
 * `6.00`, not `6`. Money is never a float here: two thirds of the amounts in this codebase
 * are compared against what a payment provider actually charged, and `0.1 + 0.2` is the
 * reason that comparison has to be done on decimal strings. The schema enforces at most two
 * decimal places for the same reason — a price of `6.005` is not a price anyone can be
 * charged, and PayPal would round it silently.
 */

export const offerPriceSchema = z
  .string()
  .trim()
  .regex(/^\d{1,6}(\.\d{1,2})?$/, 'A price looks like 6 or 6.00 — digits, and at most two decimals.')
  /*
   * Normalised on the way in so the stored value is directly comparable to the plan's own
   * price and to what a gateway reports. `6` and `6.00` are the same offer, and a string
   * comparison somewhere downstream should not be able to tell them apart.
   */
  .transform((value) => Number.parseFloat(value).toFixed(2));

export const launchOfferSchema = z.object({
  /** Off leaves every plan at its list price. The offer is kept, not deleted. */
  active: z.boolean().default(false),
  planId: planIdSchema,
  /** What the plan costs while the offer runs. Decimal string, store currency. */
  price: offerPriceSchema,
  /**
   * How many members the offer is promised to, or `null` for no stated limit.
   *
   * Displayed alongside a count of how many have actually bought, so the number is a
   * promise the page can be held to rather than decoration. `null` when the offer is not
   * pitched as limited — an open-ended sale is honest too, it just should not claim to be
   * scarce.
   */
  seats: z.number().int().min(1).max(1_000_000).nullable().default(null),
  /** The ribbon on the plan card. Short: it sits in a badge. */
  label: z.string().trim().min(2).max(32).default('Launch offer'),
  /** Free text for whoever finds this in six months wondering what it was for. */
  note: z.string().max(280).default(''),
  updatedAt: z.string(),
  updatedBy: z.string(),
});

export type LaunchOffer = z.infer<typeof launchOfferSchema>;

/** What the admin form may change. Everything else is written by the server. */
export const launchOfferInputSchema = launchOfferSchema
  .omit({ updatedAt: true, updatedBy: true })
  .extend({
    /*
     * Required rather than defaulted, unlike the stored schema. A form that omits a field
     * is a bug in the form; a *stored document* that omits one is an older document, and
     * those should still parse. The two schemas differ on purpose.
     */
    active: z.boolean(),
    seats: z.number().int().min(1).max(1_000_000).nullable(),
    label: z.string().trim().min(2).max(32),
    note: z.string().max(280),
  });

export type LaunchOfferInput = z.infer<typeof launchOfferInputSchema>;
