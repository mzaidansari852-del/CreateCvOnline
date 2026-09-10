import Link from 'next/link';
import type { Metadata } from 'next';

import { optOut } from '@/lib/db/audience';
import { verifyUnsubscribeToken } from '@/lib/email/unsubscribe';
import { isFirebaseAdminConfigured } from '@/lib/env';
import { privateMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

/**
 * The page behind the unsubscribe link in the footer of every announcement.
 *
 * ## It acts on load, and does not ask
 *
 * No "are you sure?", no sign-in, no form. Somebody who clicked unsubscribe has already
 * decided, and every step between them and being off the list is a step at which they give
 * up and press the spam button instead — which costs the sending domain far more than the
 * subscriber was worth.
 *
 * Acting on a GET is normally wrong, and it is right here for the same reason: the action
 * is trivially reversible, it is confined to one account, and the alternative fails the
 * person it exists to serve. A mail client pre-fetching the link merely unsubscribes
 * somebody who was going to anyway — the honest cost of this design, and smaller than the
 * cost of a form.
 */

export const metadata: Metadata = privateMetadata(
  'Unsubscribe',
  'Stop receiving product e-mail.',
);

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

export default async function UnsubscribePage(props: { searchParams: Promise<SearchParams> }) {
  const raw = (await props.searchParams).token;
  const token = Array.isArray(raw) ? raw[0] : raw;
  const uid = verifyUnsubscribeToken(token);

  let done = false;
  let email: string | null = null;

  if (uid && isFirebaseAdminConfigured()) {
    try {
      const result = await optOut(uid);
      done = result.found;
      email = result.email;
    } catch (error) {
      console.error('[email] unsubscribe failed', error);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-5 py-16">
      <div className="rounded-2xl border border-ink-200 bg-white p-7 text-center shadow-card sm:p-10">
        {done ? (
          <>
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-success-50 text-success-600 ring-1 ring-success-500/25">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="m5 12.5 4.5 4.5L19 7.5"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink-950">
              You are unsubscribed
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">
              {email ? (
                <>
                  We will not send product e-mail to{' '}
                  <span className="font-medium text-ink-900">{email}</span> again.
                </>
              ) : (
                'We will not send you product e-mail again.'
              )}{' '}
              {/*
                Said plainly because it is the question somebody actually has at this moment,
                and because an unsubscribe that silently stopped a payment receipt would be a
                genuine problem rather than a reassurance.
              */}
              Your account is untouched, and e-mail about a payment, a password or your
              account still reaches you.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink-950">
              This link has expired or is not ours
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">
              Nothing has changed. You can turn product e-mail off yourself under Settings,
              or write to{' '}
              <a
                href={`mailto:${site.supportEmail}`}
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                {site.supportEmail}
              </a>{' '}
              and we will do it for you.
            </p>
          </>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard/settings"
            className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-800 hover:bg-ink-50"
          >
            E-mail settings
          </Link>
          <Link
            href="/"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-50"
          >
            {site.name}
          </Link>
        </div>
      </div>
    </div>
  );
}
