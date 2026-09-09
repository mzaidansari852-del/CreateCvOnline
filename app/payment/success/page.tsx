import { cookies } from 'next/headers';
import type { Metadata } from 'next';

import { PaymentConfirmation } from '@/components/payments/PaymentConfirmation';
import { getViewer } from '@/lib/auth/guards';
import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { privateMetadata } from '@/lib/seo/metadata';

/**
 * Where the payer lands when the gateway sends them back.
 *
 * This page grants nothing. Landing here only means a URL was opened, and it is a URL
 * anyone can type. `PaymentConfirmation` asks our own server what happened, and that
 * endpoint re-reads the order, the amount and the currency from the gateway before a
 * single entitlement changes.
 *
 * The reference arrives under a different name per gateway, because each provider
 * substitutes its own into the return URL: PayPal appends `token` (its order id) and
 * `PayerID`, Polar appends `checkout_id`. `plan` is ours, added when the checkout was
 * created, and is only ever a hint for the heading before the server answers.
 *
 * Only PayPal's is read here; Polar's is read by the component straight from the URL. The
 * split is deliberate rather than untidy — see the note in `PaymentConfirmation` about why
 * at most one of the two may be treated as meaningful.
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
  const orderId = firstValue(params.token);
  const payerId = firstValue(params.PayerID);

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
          {/* PayPal's `token` is what says PayPal took it; Polar's `checkout_id` is read
              by the component below, so its absence here is the Polar case. */}
          {copy.checkout.confirmationLede(orderId ? 'PayPal' : 'Polar')}
        </p>
      </div>

      <PaymentConfirmation orderId={orderId} planHint={planHint} />

      {payerId ? (
        <p className="mt-6 text-center text-xs leading-relaxed text-ink-500">
          {copy.checkout.payerReference} <code className="font-mono">{payerId}</code>.{' '}
          {copy.checkout.payerReferenceNote}
        </p>
      ) : null}
    </>
  );
}
