import Link from 'next/link';
import { cookies } from 'next/headers';

import { Logo } from '@/components/brand/Logo';
import { LocaleProvider } from '@/components/i18n/LocaleProvider';
import { getViewer } from '@/lib/auth/guards';
import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { site } from '@/lib/site';

/**
 * The shell for the pages a payer lands on after checkout.
 *
 * `/payment/*` sits outside the `(marketing)` group on purpose: someone returning from a
 * checkout should be looking at the outcome of their payment, not at a navigation bar
 * inviting them to browse templates. This layout gives both pages the same centred card,
 * the same way back to the site, and the same footer of the documents that matter at the
 * moment money has changed hands.
 */
export default async function PaymentLayout({ children }: { children: React.ReactNode }) {
  /*
   * These pages need `LocaleProvider` mounted even though they render no dashboard chrome:
   * `PaymentConfirmation` lists the plan's features, and without a provider above it
   * `useLocale()` returns English silently — the page would look correct in review and be
   * wrong for every French and German buyer.
   *
   * `getViewer()` rather than `requireViewer()`: a visitor can land here from a gateway
   * redirect with an expired session, and the right response to that is the page
   * explaining what happened, not a bounce to the sign-in form.
   */
  const viewer = await getViewer();
  const locale = resolveLocale({
    profileLocale: viewer?.profile.locale,
    cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
  });
  const copy = appCopy(locale);

  return (
    <LocaleProvider locale={locale}>
      <div lang={locale} className="flex min-h-dvh flex-col bg-ink-50">
        <header className="container-page flex flex-wrap items-center justify-between gap-3 py-6">
          <Logo />
          <Link
            href="/"
            className="text-[13px] font-medium text-ink-600 underline-offset-2 transition-colors hover:text-brand-700 hover:underline"
          >
            {copy.checkout.backToDomain(site.domain)}
          </Link>
        </header>

        <main
          id="main"
          className="container-page flex flex-1 items-start justify-center py-8 sm:py-14"
        >
          <div className="w-full max-w-2xl">{children}</div>
        </main>

        <footer className="container-page py-8">
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] text-ink-500">
            <li>
              <Link
                href="/pricing"
                className="underline-offset-2 hover:text-brand-700 hover:underline"
              >
                {copy.checkout.footerPricing}
              </Link>
            </li>
            <li>
              <Link
                href="/refund-policy"
                className="underline-offset-2 hover:text-brand-700 hover:underline"
              >
                {copy.checkout.footerRefund}
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="underline-offset-2 hover:text-brand-700 hover:underline"
              >
                {copy.checkout.footerTerms}
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="underline-offset-2 hover:text-brand-700 hover:underline"
              >
                {copy.checkout.footerPrivacy}
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="underline-offset-2 hover:text-brand-700 hover:underline"
              >
                {copy.checkout.footerContact}
              </Link>
            </li>
          </ul>
        </footer>
      </div>
    </LocaleProvider>
  );
}
