import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

import { LOCALE_COOKIE, parseLocale } from '@/lib/i18n/resolve';
import { z } from 'zod';

import { apiError, publicRoute, readJson, toErrorResponse } from '@/lib/api/handler';
import {
  SESSION_COOKIE,
  SessionError,
  createSessionCookieValue,
  sessionCookieOptions,
  verifySessionCookieValue,
} from '@/lib/auth/session';
import { ensureUserProfile } from '@/lib/db/users';
import { hasAdminCredentials } from '@/lib/firebase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  idToken: z.string().min(20).max(4096),
});

/**
 * Exchanges a freshly minted Firebase ID token for an httpOnly session cookie.
 *
 * Rate limited hard: this is the one endpoint that turns a token into a durable
 * credential, so it is the natural target for credential stuffing.
 */
export const POST = publicRoute(
  { scope: 'auth-session', rateLimit: { max: 12, windowSeconds: 60 } },
  async ({ request }) => {
    if (!hasAdminCredentials()) {
      return apiError(
        503,
        'not-configured',
        'Authentication is not configured on this deployment. Set the FIREBASE_* server variables.',
      );
    }

    const { idToken } = await readJson(request, bodySchema);

    try {
      const { value, maxAgeSeconds, user } = await createSessionCookieValue(idToken);
      const store = await cookies();
      store.set({ ...sessionCookieOptions(maxAgeSeconds), value });

      /*
       * First sign-in creates the profile document; later ones refresh it.
       *
       * The cookie is only consulted on creation, and only as the initial value: someone
       * who signed up from the French pages gets a French dashboard without having to
       * find the switcher, while a returning user's saved preference is never overwritten
       * by whichever page they happened to sign in from.
       */
      const signupLocale = parseLocale(store.get(LOCALE_COOKIE)?.value) ?? undefined;
      await ensureUserProfile(user, signupLocale);

      return NextResponse.json({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          role: user.role,
        },
      });
    } catch (error) {
      if (error instanceof SessionError) {
        return apiError(401, error.code, error.message);
      }
      // A bad or expired ID token is a client problem, not a server error.
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code: unknown }).code)
          : '';
      if (code.startsWith('auth/')) {
        return apiError(
          401,
          'invalid-token',
          'That sign-in attempt could not be verified. Please try again.',
        );
      }
      return toErrorResponse(error);
    }
  },
);

/** Signs the user out by clearing the cookie. */
export async function DELETE(): Promise<NextResponse> {
  const store = await cookies();
  store.set({ ...sessionCookieOptions(0), value: '' });
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}

/** Lets the client confirm whether the server still considers it signed in. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = await verifySessionCookieValue(request.cookies.get(SESSION_COOKIE)?.value);
  return NextResponse.json({ user });
}
