import type { Metadata } from 'next';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { privateMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = privateMetadata(
  'Reset your password',
  `Request a password reset link for your ${site.name} account.`,
);

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="font-display text-3xl leading-tight font-extrabold tracking-tight text-ink-950">
          Reset your password
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Give us the address on your account and we will e-mail you a link to choose a new
          password. Your CVs are untouched.
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
