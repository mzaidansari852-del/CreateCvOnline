import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { LoginForm } from '@/components/auth/LoginForm';
import { firstParam } from '@/components/auth/shared';
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
  return privateMetadata(copy.auth.signIn, copy.auth.signInMetaDescription(site.name));
}

/**
 * `?next=` is read here rather than with `useSearchParams` in the form: the value is
 * needed once, at submit time, and reading it on the server keeps the client component
 * out of a Suspense boundary. It is sanitised again inside the form before any navigation.
 */
export default async function LoginPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const next = firstParam(searchParams.next);
  const copy = await authCopy();

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="font-display text-3xl leading-tight font-extrabold tracking-tight text-ink-950">
          {copy.auth.signInHeading}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">{copy.auth.signInSubtitle}</p>
      </div>

      <LoginForm next={next} />
    </div>
  );
}
