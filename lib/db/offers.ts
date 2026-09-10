import 'server-only';

import { adminDb, COLLECTIONS, toIso } from '@/lib/firebase/admin';
import { isFirebaseAdminConfigured } from '@/lib/env';
import { launchOfferSchema, type LaunchOffer, type LaunchOfferInput } from '@/types/offer';

/**
 * The launch offer, stored rather than compiled in.
 *
 * One document at `settings/launchOffer`. It is read on every page that quotes a price, so
 * it is cached — and the cache is the interesting part of this file.
 *
 * ## Why reading it is async and the price is not held in `getPlan()`
 *
 * The first version of this put the price in `lib/plans.ts` as a constant, which let
 * `getPlan()` stay synchronous and let every caller keep its shape. That was convenient and
 * wrong for the thing it was for: changing a price meant changing code and deploying, which
 * turns a pricing decision into an engineering task.
 *
 * Moving it into Firestore makes reads asynchronous, and that has a consequence worth
 * stating plainly: **the price can now change between an order being created and that order
 * being captured.** A verification that compared the capture against "the current price"
 * would therefore reject a payment the customer made in good faith, minutes earlier, at the
 * price they were shown. So verification compares against the amount recorded in the ledger
 * when the order was created — see `app/api/payments/paypal/capture/route.ts`. That is a
 * better invariant regardless ("the capture matches its order" rather than "the capture
 * matches today's price list") and it is what makes an editable price safe.
 */

const DOC_ID = 'launchOffer';

/**
 * How long a cached offer is served before Firestore is asked again.
 *
 * Short, because the person editing it in `/admin/offers` will reload the pricing page to
 * check their change and should not have to wonder. Non-zero, because the pricing page,
 * the localised pricing pages and the checkout all read it, and a document read per render
 * for a value that changes a few times a year is a poor trade.
 *
 * This is per server instance, so a deployment with several will converge within the
 * window rather than all at once. That is acceptable for a price *display*; it is not
 * relied upon for what anybody is charged, because the order records its own amount.
 */
const CACHE_MS = 30_000;

interface Cached {
  value: LaunchOffer | null;
  readAt: number;
}

let cache: Cached | null = null;

function offerDoc() {
  return adminDb().collection(COLLECTIONS.settings).doc(DOC_ID);
}

/**
 * The current offer, or `null` when there is none, none active, or no database.
 *
 * Never throws. Everything that calls this is rendering a price, and the correct behaviour
 * when the offer cannot be read is to quote the list price — the plan's own, undiscounted
 * figure. That is the safe direction: a customer might miss a discount they were entitled
 * to, which support can fix, rather than being charged less than intended or shown a price
 * that no longer exists.
 */
export async function readLaunchOffer(): Promise<LaunchOffer | null> {
  if (cache && Date.now() - cache.readAt < CACHE_MS) return cache.value;

  // No Firebase configured — local development, or a preview with no credentials. There is
  // no offer rather than an error, and the pricing page renders list prices.
  if (!isFirebaseAdminConfigured()) {
    cache = { value: null, readAt: Date.now() };
    return null;
  }

  let value: LaunchOffer | null = null;
  try {
    const snapshot = await offerDoc().get();
    if (snapshot.exists) {
      const raw = snapshot.data() ?? {};
      const parsed = launchOfferSchema.safeParse({
        active: raw.active ?? false,
        planId: raw.planId ?? 'lifetime',
        price: raw.price ?? '0.00',
        seats: raw.seats ?? null,
        label: raw.label ?? 'Launch offer',
        note: raw.note ?? '',
        updatedAt: toIso(raw.updatedAt),
        updatedBy: raw.updatedBy ?? '',
      });
      /*
       * A document that does not parse is treated as no offer, not as a partial one. The
       * value decides what a customer is charged, so guessing at a malformed price is the
       * one thing this must not do.
       */
      if (parsed.success && parsed.data.active) value = parsed.data;
      else if (!parsed.success) {
        console.error('[offers] launch offer document is malformed', parsed.error.issues);
      }
    }
  } catch (error) {
    console.error('[offers] could not read the launch offer', error);
  }

  cache = { value, readAt: Date.now() };
  return value;
}

/**
 * The stored offer regardless of whether it is active — what the admin form edits.
 *
 * Separate from `readLaunchOffer` because that one answers "what should a customer be
 * charged", and an inactive offer is not an answer to it. This one answers "what is in the
 * document", which is a different question and only the admin page asks it.
 */
export async function readLaunchOfferRecord(): Promise<LaunchOffer | null> {
  if (!isFirebaseAdminConfigured()) return null;
  try {
    const snapshot = await offerDoc().get();
    if (!snapshot.exists) return null;
    const raw = snapshot.data() ?? {};
    const parsed = launchOfferSchema.safeParse({
      active: raw.active ?? false,
      planId: raw.planId ?? 'lifetime',
      price: raw.price ?? '0.00',
      seats: raw.seats ?? null,
      label: raw.label ?? 'Launch offer',
      note: raw.note ?? '',
      updatedAt: toIso(raw.updatedAt),
      updatedBy: raw.updatedBy ?? '',
    });
    return parsed.success ? parsed.data : null;
  } catch (error) {
    console.error('[offers] could not read the launch offer record', error);
    return null;
  }
}

/** Writes the offer and clears the cache so the next read is the new value. */
export async function writeLaunchOffer(
  input: LaunchOfferInput,
  updatedBy: string,
): Promise<LaunchOffer> {
  const record: LaunchOffer = {
    ...input,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  await offerDoc().set(record, { merge: false });

  /*
   * Local cache only. Other instances keep their copy for up to `CACHE_MS`, which is why
   * that window is short and why nothing about what a customer is *charged* depends on it:
   * the order records its own amount at creation and the capture is checked against that.
   */
  cache = { value: record.active ? record : null, readAt: Date.now() };
  return record;
}

/** Test seam — drops the memoised offer. */
export function __resetLaunchOfferCache(): void {
  cache = null;
}
