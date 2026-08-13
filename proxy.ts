import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE } from '@/lib/auth/session';

/**
 * Edge-of-app routing rules.
 *
 * In Next.js 16 this file replaces `middleware.ts` (the `middleware` export is
 * deprecated) and always runs on the Node.js runtime.
 *
 * It performs a *cheap* check only: is a session cookie present? Cryptographic
 * verification happens in the page or route handler that actually reads user data, via
 * `getSessionUser()`. That split matters — verifying a Firebase session cookie costs a
 * network round trip on cache miss, and paying it here would add latency to every
 * navigation, including ones that then verify again anyway.
 *
 * The security property this relies on: a forged cookie gets a user *past this file* and
 * no further. Every protected page re-verifies, and every Firestore read is additionally
 * constrained by Security Rules.
 */

const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/account'];
const AUTH_PAGES = ['/login', '/register', '/forgot-password'];

export function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  // Someone already signed in has no use for the sign-in form.
  if (hasSession && AUTH_PAGES.includes(pathname)) {
    const url = request.nextUrl.clone();
    const next = request.nextUrl.searchParams.get('next');
    url.pathname = next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  // Lets server components render canonical/redirect URLs without re-deriving the path.
  response.headers.set('x-pathname', pathname);
  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and the files that must be served verbatim.
     * Keeping `sitemap.xml` and `robots.txt` out avoids any chance of a redirect
     * confusing a crawler.
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|manifest.webmanifest|robots.txt|sitemap.xml|template-previews|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff2?)$).*)',
  ],
};
