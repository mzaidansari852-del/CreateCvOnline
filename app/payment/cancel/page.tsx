import { cookies } from 'next/headers';
import type { Metadata } from 'next';

import { ButtonLink } from '@/components/ui/button';
import { getViewer } from '@/lib/auth/guards';
import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { privateMetadata } from '@/lib/seo/metadata';

/**
 * Where a payer lands when they close the checkout without paying.
 *
 * This route is referenced by `app/api/payments/paddle/create-transaction/route.ts`, which
 * passes it to Paddle as the `cancelUrl`, and it did not exist — so backing out of the
 * overlay answered 404. The audience for that 404 is precisely the person who hesitated
 * over a payment, and a page-not-found is the worst possible thing to show them: it reads
 * as "something went wrong with your money" at the exact moment they are wondering whether
 * this site can be trusted with a card.
 *
 * The page therefore says the one thing that matters — nothing was charged — before it says
 * anything else, and offers the way back rather than pressing for the sale.
 *
 * It grants nothing and changes nothing, so it needs no verification step. Unlike
 * `/payment/success`, which asks the server what really happened before showing an outcome,
 * a cancellation has no state to confirm: not paying leaves the account exactly as it was.
 */

export const metadata: Metadata = privateMetadata(
  'Payment cancelled',
  'The payment window was closed before finishing. Nothing has been charged.',
);

export default async function PaymentCancelPage() {
  /*
   * Same locale resolution as the sibling page. `getViewer()` rather than
   * `requireViewer()`: someone can arrive here from a gateway redirect with an expired
   * session, and the right answer to that is this explanation, not a bounce to sign-in.
   */
  const viewer = await getViewer();
  const locale = resolveLocale({
    profileLocale: viewer?.profile.locale,
    cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
  });
  const copy = appCopy(locale);

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6 text-center sm:p-10">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-ink-100">
        <svg
          className="size-6 text-ink-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M9 9h6v6H9z" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-3xl">
        {copy.checkout.cancelledTitle}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-pretty text-ink-600">
        {copy.checkout.cancelledBody}
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/pricing" size="lg">
          {copy.checkout.cancelledResume}
        </ButtonLink>
        <ButtonLink href="/dashboard" size="lg" variant="outline">
          {copy.dashboard.backToDashboard}
        </ButtonLink>
      </div>
    </div>
  );
}
