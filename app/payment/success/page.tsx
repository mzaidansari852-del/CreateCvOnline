import { cookies } from 'next/headers';
import type { Metadata } from 'next';

import { PaymentConfirmation } from '@/components/payments/PaymentConfirmation';
import { getViewer } from '@/lib/auth/guards';
import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { privateMetadata } from '@/lib/seo/metadata';

/**
 * Where the payer lands once the checkout overlay closes.
 *
 * This page grants nothing. Landing here only means a URL was opened, and it is a URL
 * anyone can type. `PaymentConfirmation` asks our own verify endpoint what happened, and
 * that endpoint re-reads the transaction, the amount and the currency from Paddle before a
 * single entitlement changes.
 *
 * The transaction id travels in `?transaction=`, read by the component straight from the
 * URL; `plan` is ours, added when the transaction was created, and is only ever a hint for
 * the heading before the server answers.
 */

export const metadata: Metadata = privateMetadata(
  'Payment confirmation',
  'Confirming your payment.',
);

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  // A plan id is short; anything longer did not come from a checkout of ours.
  return trimmed.length > 0 && trimmed.length <= 64 ? trimmed : null;
}

export default async function PaymentSuccessPage(props: { searchParams: Promise<SearchParams> }) {
  const params = await props.searchParams;
  const planHint = firstValue(params.plan);

  /*
   * The layout resolves the same language for `LocaleProvider`, but a server component
   * cannot read a parent layout's variables, and `getViewer()` is request-memoised — so
   * asking again here costs a table lookup rather than a second session read.
   */
  const viewer = await getViewer();
  const locale = resolveLocale({
    profileLocale: viewer?.profile.locale,
    cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
  });
  const copy = appCopy(locale);

  return (
    <>
      <div className="mb-8 text-center">
        <p className="text-xs font-bold tracking-[0.14em] text-brand-700 uppercase">
          {copy.checkout.stepConfirmation}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-4xl">
          {copy.checkout.confirmationTitle}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-pretty text-ink-600">
          {copy.checkout.confirmationLede}
        </p>
      </div>

      <PaymentConfirmation planHint={planHint} />

    </>
  );
}
