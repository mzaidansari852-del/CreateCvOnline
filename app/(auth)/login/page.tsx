import type { Metadata } from 'next';

import { LoginForm } from '@/components/auth/LoginForm';
import { firstParam } from '@/components/auth/shared';
import { privateMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = privateMetadata(
  'Sign in',
  `Sign in to your ${site.name} account to edit your CVs and download them as PDF.`,
);

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

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="font-display text-3xl leading-tight font-extrabold tracking-tight text-ink-950">
          Welcome back
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Sign in to pick up your CV where you left off.
        </p>
      </div>

      <LoginForm next={next} />
    </div>
  );
}
