import type { Metadata } from 'next';
import { Suspense } from 'react';
import { cookies } from 'next/headers';

import { LocaleProvider } from '@/components/i18n/LocaleProvider';
import { PaddleTransactionCheckout } from './PaddleTransactionCheckout';
import { getViewer } from '@/lib/auth/guards';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { privateMetadata } from '@/lib/seo/metadata';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * `noindex`, and not because it is private — it is deliberately public. It is a page that
 * only means anything with a one-time id attached, so there is nothing here for a crawler
 * to index and a stray indexed copy would be a dead end for anyone who found it.
 */
export const metadata: Metadata = privateMetadata('Complete your payment');

/**
 * The account's **default payment link**.
 *
 * Paddle refuses to create any transaction until an account has one set, and then uses it
 * as the landing page for every checkout link it generates itself, appending `?_ptxn=<id>`.
 * This is the page to give it: Paddle > Checkout > Checkout settings > Default payment
 * link, set to `https://<your-domain>/pay`.
 *
 * No sign-in guard. Someone opening a payment link from a Paddle email may not have a
 * session, and bouncing them to `/login` would strand a customer who was asked to pay.
 * Nothing is granted here — the webhook does that, attributing the payment through the
 * `customData` recorded when the transaction was created — so an unauthenticated visitor
 * with a valid transaction id can complete a payment and nothing else.
 */
export default async function PayPage() {
  const viewer = await getViewer();
  const locale = resolveLocale({
    profileLocale: viewer?.profile.locale,
    cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
  });

  return (
    <LocaleProvider locale={locale}>
      <main lang={locale} className="container-page flex min-h-dvh items-center justify-center py-16">
        <div className="w-full max-w-md">
          {/* The overlay needs the query string, which is only readable on the client. */}
          <Suspense fallback={null}>
            <PaddleTransactionCheckout />
          </Suspense>
        </div>
      </main>
    </LocaleProvider>
  );
}
