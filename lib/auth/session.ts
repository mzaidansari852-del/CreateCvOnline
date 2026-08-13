import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';

import { adminAuth, hasAdminCredentials } from '@/lib/firebase/admin';
import { serverEnv } from '@/lib/env';
import type { SessionUser, UserRole } from '@/types/user';

/**
 * Session handling.
 *
 * The browser never holds a long-lived credential we trust. The flow is:
 *
 *   1. Firebase JS SDK signs the user in and produces a short-lived ID token.
 *   2. The client POSTs that token, once, to `/api/auth/session`.
 *   3. The server verifies it with the Admin SDK and mints an httpOnly, Secure,
 *      SameSite=Lax session cookie.
 *   4. Every subsequent server render and API call re-verifies that cookie, including
 *      a revocation check, so signing out or disabling an account takes effect at once.
 *
 * Nothing in the app trusts a uid supplied by the client.
 */

/**
 * Firebase Hosting only forwards a cookie named `__session` to Cloud Functions, and the
 * name is harmless everywhere else, so it is the safe default across hosts.
 */
export const SESSION_COOKIE = '__session';

export function sessionCookieMaxAgeSeconds(): number {
  return serverEnv().sessionCookieDays * 24 * 60 * 60;
}

export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

/** Exchanges a Firebase ID token for a session cookie value. Throws if the token is bad. */
export async function createSessionCookieValue(idToken: string): Promise<{
  value: string;
  maxAgeSeconds: number;
  user: SessionUser;
}> {
  const auth = adminAuth();
  const decoded = await auth.verifyIdToken(idToken, true);

  // Refuse tokens that were minted long ago — the client should always send a fresh one.
  const authTimeMs = (decoded.auth_time ?? 0) * 1000;
  if (Date.now() - authTimeMs > 5 * 60 * 1000) {
    throw new SessionError('stale-token', 'Please sign in again to continue.');
  }

  const maxAgeSeconds = sessionCookieMaxAgeSeconds();
  const value = await auth.createSessionCookie(idToken, { expiresIn: maxAgeSeconds * 1000 });
  const record = await auth.getUser(decoded.uid);

  return {
    value,
    maxAgeSeconds,
    user: {
      uid: record.uid,
      email: record.email ?? '',
      displayName: record.displayName ?? '',
      photoURL: record.photoURL ?? '',
      emailVerified: record.emailVerified,
      role: roleFromClaims(record.customClaims),
    },
  };
}

export class SessionError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'SessionError';
    this.code = code;
  }
}

function roleFromClaims(claims: Record<string, unknown> | undefined): UserRole {
  return claims?.admin === true || claims?.role === 'admin' ? 'admin' : 'user';
}

/**
 * The signed-in user for the current request, or `null`.
 *
 * Memoised with React `cache` so a page that checks auth in the layout, the page and
 * three server components still performs exactly one token verification.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (!hasAdminCredentials()) return null;

  const store = await cookies();
  const cookieValue = store.get(SESSION_COOKIE)?.value;
  if (!cookieValue) return null;

  try {
    // `true` = also check whether the session has been revoked or the user disabled.
    const decoded = await adminAuth().verifySessionCookie(cookieValue, true);
    return {
      uid: decoded.uid,
      email: typeof decoded.email === 'string' ? decoded.email : '',
      displayName: typeof decoded.name === 'string' ? decoded.name : '',
      photoURL: typeof decoded.picture === 'string' ? decoded.picture : '',
      emailVerified: decoded.email_verified === true,
      role: roleFromClaims(decoded as unknown as Record<string, unknown>),
    };
  } catch {
    // Expired, revoked, tampered with, or signed by a different project — all mean
    // "not signed in". The stale cookie is cleared by the next sign-in or sign-out.
    return null;
  }
});

/** Verifies a session cookie value directly. Used by route handlers holding a NextRequest. */
export async function verifySessionCookieValue(
  cookieValue: string | undefined,
): Promise<SessionUser | null> {
  if (!cookieValue || !hasAdminCredentials()) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(cookieValue, true);
    return {
      uid: decoded.uid,
      email: typeof decoded.email === 'string' ? decoded.email : '',
      displayName: typeof decoded.name === 'string' ? decoded.name : '',
      photoURL: typeof decoded.picture === 'string' ? decoded.picture : '',
      emailVerified: decoded.email_verified === true,
      role: roleFromClaims(decoded as unknown as Record<string, unknown>),
    };
  } catch {
    return null;
  }
}

/** Revokes every refresh token for a user, invalidating all their sessions everywhere. */
export async function revokeAllSessions(uid: string): Promise<void> {
  await adminAuth().revokeRefreshTokens(uid);
}
