import type { Metadata } from 'next';

import { VerifyEmailPanel } from '@/components/auth/VerifyEmailPanel';
import { privateMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = privateMetadata(
  'Confirm your e-mail address',
  `Confirm the e-mail address on your ${site.name} account.`,
);

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="font-display text-3xl leading-tight font-extrabold tracking-tight text-ink-950">
          Confirm your e-mail
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          We sent you a one-time link. Opening it proves the address is yours and secures your
          account.
        </p>
      </div>

      <VerifyEmailPanel />
    </div>
  );
}
