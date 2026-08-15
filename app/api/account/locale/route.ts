import { NextResponse } from 'next/server';
import { z } from 'zod';

import { authedRoute, readJson } from '@/lib/api/handler';
import { updateUserProfile } from '@/lib/db/users';
import { LOCALES } from '@/lib/i18n/locales';
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from '@/lib/i18n/resolve';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({ locale: z.enum(LOCALES) });

/**
 * Sets the interface language for the signed-in account.
 *
 * Writes in two places on purpose. The profile is the durable preference and is what the
 * server layout reads on the next request; the cookie is what the *unauthenticated* pages
 * read — `/login` after a sign-out, and the marketing site — so that changing the language
 * in the dashboard does not leave the rest of the site speaking a different one.
 *
 * The cookie is deliberately readable by the client: it holds a language tag, nothing that
 * identifies anybody, and the proxy needs to write it too. `sameSite: lax` so it survives
 * a click in from a search result, which is how most first visits arrive.
 */
export const PATCH = authedRoute(
  { scope: 'account-locale', rateLimit: { max: 30, windowSeconds: 60 } },
  async ({ request, profile }) => {
    const { locale } = await readJson(request, bodySchema);

    await updateUserProfile(profile.uid, { locale });

    const response = NextResponse.json({ locale });
    response.cookies.set(LOCALE_COOKIE, locale, {
      maxAge: LOCALE_COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
      // Not `httpOnly`: the language is not a secret, and keeping it readable means the
      // client can avoid a flash of the wrong language on a hard navigation.
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
    });
    return response;
  },
);
