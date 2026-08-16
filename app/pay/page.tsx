import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { cookies } from 'next/headers';

import { Logo } from '@/components/brand/Logo';
import { LocaleProvider } from '@/components/i18n/LocaleProvider';
import { PaddleTransactionCheckout } from './PaddleTransactionCheckout';
import { getViewer } from '@/lib/auth/guards';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { privateMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

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
export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  /*
   * The transaction id is read here, on the server, and passed down.
   *
   * It used to be read in the client component with `useSearchParams()`, which meant the
   * server had no idea whether there was one and rendered the "this link is missing its
   * payment reference" branch every time — corrected a moment later by hydration. So every
   * customer arriving from a Paddle email was told their payment link was broken, for as
   * long as it took the JavaScript to load, and told it permanently if the JavaScript
   * never arrived. On a page about money that is the worst possible first paint.
   */
  const query = await searchParams;
  const raw = query._ptxn ?? query.transaction;
  const transactionId = (Array.isArray(raw) ? raw[0] : raw) ?? '';

  const viewer = await getViewer();
  const locale = resolveLocale({
    profileLocale: viewer?.profile.locale,
    cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
  });

  return (
    <LocaleProvider locale={locale}>
      <div lang={locale} className="flex min-h-dvh flex-col bg-ink-50">
        {/*
          Branded rather than bare. This page is reached from an email about money, often
          on a phone, sometimes days after the purchase — a white void containing one card
          is exactly what a phishing page looks like, and hesitating here costs a payment.
          The logo and the way back are the cheapest possible reassurance.
        */}
        <header className="container-page py-6">
          <Logo />
        </header>

        <main id="main" className="container-page flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            {/* The overlay needs the query string, which is only readable on the client. */}
            <Suspense fallback={null}>
              <PaddleTransactionCheckout transactionId={transactionId} />
            </Suspense>
          </div>
        </main>

        <footer className="container-page py-8 text-center text-[13px] text-ink-500">
          <Link href="/" className="underline-offset-2 hover:text-brand-700 hover:underline">
            {site.domain}
          </Link>
        </footer>
      </div>
    </LocaleProvider>
  );
}
