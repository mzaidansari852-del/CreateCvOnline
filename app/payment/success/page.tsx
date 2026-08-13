import type { Metadata } from 'next';

import { PaymentConfirmation } from '@/components/payments/PaymentConfirmation';
import { privateMetadata } from '@/lib/seo/metadata';

/**
 * Where PayPal sends the payer after they approve.
 *
 * This page grants nothing. Landing here only means a button was pressed on PayPal's
 * site — it is a URL anyone can type. `PaymentConfirmation` asks our own capture endpoint
 * to confirm the order, and that endpoint re-checks the order, the amount and the currency
 * with PayPal before a single entitlement changes.
 *
 * PayPal appends `token` (the order id) and `PayerID` to the return URL; `plan` is ours,
 * added when the order was created, and is only ever a hint for the heading.
 */

export const metadata: Metadata = privateMetadata(
  'Payment confirmation',
  'Confirming your payment with PayPal.',
);

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  // PayPal ids are short and alphanumeric; anything else did not come from PayPal.
  return trimmed.length > 0 && trimmed.length <= 64 ? trimmed : null;
}

export default async function PaymentSuccessPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await props.searchParams;
  const orderId = firstValue(params.token);
  const planHint = firstValue(params.plan);
  const payerId = firstValue(params.PayerID);

  return (
    <>
      <div className="mb-8 text-center">
        <p className="text-xs font-bold tracking-[0.14em] text-brand-700 uppercase">
          Step 3 of 3 · Confirmation
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-4xl">
          Payment confirmation
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-pretty text-ink-600">
          You have come back from PayPal. Before anything is unlocked, our server checks the
          order with PayPal directly — so what you see below is the real outcome, not a
          message triggered by the redirect.
        </p>
      </div>

      <PaymentConfirmation orderId={orderId} planHint={planHint} />

      {payerId ? (
        <p className="mt-6 text-center text-xs leading-relaxed text-ink-500">
          PayPal payer reference <code className="font-mono">{payerId}</code>. Keep it with
          your receipt — quoting it alongside the order id lets us find a payment instantly.
        </p>
      ) : null}
    </>
  );
}
