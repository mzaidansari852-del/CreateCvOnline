import { NextResponse, type NextRequest } from 'next/server';

import { optOut } from '@/lib/db/audience';
import { verifyUnsubscribeToken } from '@/lib/email/unsubscribe';
import { isFirebaseAdminConfigured } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * One-click unsubscribe, for the `List-Unsubscribe-Post` header.
 *
 * Gmail and Outlook render an Unsubscribe control beside the sender name and, when the
 * header advertises one-click, they POST here directly. No page is shown, no session
 * exists, and no confirmation is possible — that is the entire point of the standard, and
 * an endpoint that asked for either would simply not work with it.
 *
 * ## Why this is safe without authentication
 *
 * The token is an HMAC naming one account and one purpose. It can do nothing but stop
 * marketing to its owner, which is not an action anybody needs protecting from — the
 * failure mode of a leaked token is that somebody receives fewer e-mails than they wanted,
 * and they can turn them back on in Settings.
 *
 * ## Why it answers 200 to a bad token
 *
 * A mail client that gets an error will retry, and a reader who sees one will conclude the
 * unsubscribe is broken and report the message as spam instead. Neither outcome is improved
 * by being accurate about a token we do not recognise. The response is deliberately
 * uninformative for the same reason it is uniform: this endpoint is unauthenticated and
 * must not become a way to test whether an account exists.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const token =
    request.nextUrl.searchParams.get('token') ??
    // Some clients POST the header's URL with the parameters in the body instead.
    new URLSearchParams(await request.text().catch(() => '')).get('token');

  const uid = verifyUnsubscribeToken(token);

  if (uid && isFirebaseAdminConfigured()) {
    try {
      await optOut(uid);
    } catch (error) {
      // Logged, not surfaced. A retry from the mail client would not fix a database fault,
      // and the reader is not waiting on this response.
      console.error('[email] one-click unsubscribe failed', error);
    }
  }

  return NextResponse.json({ ok: true });
}

/** Some clients probe with GET first. Same answer, same reasoning. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return POST(request);
}
