import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE } from '@/lib/auth/session';
import { alternatesFor, localeOf, normalisePath } from '@/lib/i18n/locales';
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from '@/lib/i18n/resolve';

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

/**
 * The six category slugs, for consolidating the gallery's old query-string views.
 *
 * `/templates?category=modern` and `/templates/modern` were two addresses for one list,
 * and only the second has its own copy, title and sitemap entry. Those query URLs exist in
 * the wild and in Google's index, so they get a permanent redirect rather than being left
 * to compete — audit item 3.4.
 *
 * This lives here rather than in `next.config.ts` because a `redirects()` rule forwards
 * the query it matched on to the destination: the result is `/templates/modern?category=
 * modern`, a third address, which is the opposite of the point. Clearing `url.search` is
 * only possible with the URL in hand.
 */
const CATEGORY_SLUGS = new Set(['modern', 'corporate', 'creative', 'technology', 'classic', 'ats']);

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

  if (pathname === '/templates') {
    const category = request.nextUrl.searchParams.get('category');
    if (category && CATEGORY_SLUGS.has(category)) {
      const url = request.nextUrl.clone();
      url.pathname = `/templates/${category}`;
      url.search = '';
      return NextResponse.redirect(url, 308);
    }
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

  /*
   * Remember the language the *site* is being read in, so it survives into the app.
   *
   * The marketing pages get their language from the URL. `/register`, `/login` and the
   * dashboard cannot: they are one route each, shared by everybody. Without this, a
   * visitor who read every French page and clicked "Créer mon CV" would land on an English
   * sign-up form and then an English dashboard, having given no indication whatsoever that
   * they wanted English.
   *
   * Only paths that *express* a language may write it, which is narrower than it first
   * looks and has to be. The obvious version — write `localeOf(pathname)` on every request
   * — is wrong in a way that would have been maddening to debug: `localeOf('/dashboard')`
   * is `'en'`, because the dashboard has no locale prefix, so every visit to the dashboard
   * would silently reset a French user's preference to English. A path counts as
   * expressing a language only when it belongs to a translated cluster, which `/dashboard`
   * and `/login` do not.
   *
   * Written only on change, so the great majority of requests carry no `Set-Cookie`.
   */
  /*
   * ...and only on a real navigation.
   *
   * Next.js prefetches every link in the viewport, and those prefetches go through this
   * proxy like any other request. Without this guard a French page that links to an
   * English one — the pricing page, a blog post — silently rewrote the visitor's language
   * to English before they clicked anything, and the dashboard's own prefetches undid a
   * preference the moment it was set. Caught in a browser; `curl` never reproduced it,
   * because `curl` does not prefetch.
   *
   * `sec-fetch-dest: document` is the precise test: it is set by the browser, cannot be
   * spoofed by page script, and is `empty` for the RSC fetches that caused this.
   */
  const isNavigation = request.headers.get('sec-fetch-dest') === 'document';
  const localised = isNavigation && alternatesFor(normalisePath(pathname));
  if (localised) {
    const pathLocale = localeOf(pathname);
    if (request.cookies.get(LOCALE_COOKIE)?.value !== pathLocale) {
      response.cookies.set(LOCALE_COOKIE, pathLocale, {
        maxAge: LOCALE_COOKIE_MAX_AGE,
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
      });
    }
  }

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
