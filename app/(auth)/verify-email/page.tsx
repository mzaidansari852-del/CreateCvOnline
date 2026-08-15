import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { VerifyEmailPanel } from '@/components/auth/VerifyEmailPanel';
import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { privateMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

/** The account here may be brand new and unverified, so language still comes from the cookie. */
async function authCopy() {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  return appCopy(resolveLocale({ profileLocale: null, cookieLocale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const copy = await authCopy();
  return privateMetadata(copy.auth.verifyMetaTitle, copy.auth.verifyMetaDescription(site.name));
}

export default async function VerifyEmailPage() {
  const copy = await authCopy();

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="font-display text-3xl leading-tight font-extrabold tracking-tight text-ink-950">
          {copy.auth.verifyTitle}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">{copy.auth.verifySubtitle}</p>
      </div>

      <VerifyEmailPanel />
    </div>
  );
}
