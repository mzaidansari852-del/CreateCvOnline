import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { privateMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

/** No profile exists yet on this screen, so the cookie is the only source of language. */
async function authCopy() {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  return appCopy(resolveLocale({ profileLocale: null, cookieLocale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const copy = await authCopy();
  return privateMetadata(
    copy.auth.forgotPasswordTitle,
    copy.auth.forgotPasswordMetaDescription(site.name),
  );
}

export default async function ForgotPasswordPage() {
  const copy = await authCopy();

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="font-display text-3xl leading-tight font-extrabold tracking-tight text-ink-950">
          {copy.auth.forgotPasswordTitle}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          {copy.auth.forgotPasswordSubtitle}
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
