import type { Metadata } from 'next';

import { AdminDataAlert, AdminPageHeader } from '@/components/admin/primitives';
import { loadAdmin } from '@/components/admin/data';
import { OfferManager } from './OfferManager';
import { claimedLaunchOfferSeats } from '@/lib/db/payments';
import { readLaunchOfferRecord } from '@/lib/db/offers';
import { publicEnv } from '@/lib/env';
import { privateMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';
import { Alert } from '@/components/ui/feedback';

export const metadata: Metadata = privateMetadata('Offers', `Plan pricing for ${site.name}.`);

export const dynamic = 'force-dynamic';

export default async function AdminOffersPage() {
  const offer = await loadAdmin(() => readLaunchOfferRecord());

  /*
   * How many have actually bought at the offer price, counted from the ledger.
   *
   * Only fetched when the offer states a number of seats, because that is the only case
   * where the count means anything — an open-ended offer has nothing to be measured against.
   */
  const seats =
    offer.data?.seats != null
      ? await loadAdmin(() => claimedLaunchOfferSeats(offer.data!.planId, offer.data!.seats!))
      : null;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Offers"
        description="A discounted price on one plan. What is set here is what the pricing page shows, what the checkout quotes, and the amount PayPal is asked to charge — there is no second place a price is written."
      />

      {seats?.data && seats.data.claimed !== null ? (
        <Alert tone={seats.data.metPromise ? 'warning' : 'info'}>
          <strong className="font-semibold">
            {seats.data.claimed.toLocaleString('en')} of {seats.data.seats.toLocaleString('en')}{' '}
            claimed.
          </strong>{' '}
          {seats.data.metPromise ? (
            <>
              The number advertised has been reached. The offer does not stop by itself — the
              price a customer is quoted has to stay knowable while their order is in flight —
              so switch it off, or raise the seat count only if the larger number was never
              advertised as the limit.
            </>
          ) : (
            <>
              Counted from completed payments on {offer.data?.planId}. Refunded and abandoned
              orders are not included.
            </>
          )}
        </Alert>
      ) : null}

      {offer.configured ? (
        <OfferManager initialOffer={offer.data ?? null} storeCurrency={publicEnv.storeCurrency} />
      ) : (
        <AdminDataAlert configured={offer.configured} error={offer.error} what="Offers" />
      )}
    </div>
  );
}
