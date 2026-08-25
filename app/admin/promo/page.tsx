import type { Metadata } from 'next';

import { AdminDataAlert, AdminPageHeader } from '@/components/admin/primitives';
import { loadAdmin } from '@/components/admin/data';
import { PromoManager } from './PromoManager';
import { listPromoCodes } from '@/lib/db/promo';
import { privateMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = privateMetadata('Promo codes', `Grant codes for ${site.name}.`);

export const dynamic = 'force-dynamic';

export default async function AdminPromoPage() {
  const codes = await loadAdmin(() => listPromoCodes());

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Promo codes"
        description="Codes that grant a plan outright. Someone redeeming one never reaches a checkout and never enters a card, so these work with no payment provider connected."
      />

      {codes.data ? (
        <PromoManager initialCodes={codes.data} />
      ) : (
        <AdminDataAlert configured={codes.configured} error={codes.error} what="Promo codes" />
      )}
    </div>
  );
}
