'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import { NotConfiguredAlert, isEmail } from './shared';
import { authErrorMessage, useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { Field, Input } from '@/components/ui/form';
import { site } from '@/lib/site';

/** The one sentence shown after every submit, whether or not the address is registered. */
const NEUTRAL_CONFIRMATION = 'If an account exists for that address, a reset link is on its way.';

/**
 * Password reset request.
 *
 * The response is deliberately identical for a registered and an unregistered address:
 * a form that says "no account with that e-mail" is a free account-enumeration oracle,
 * which is exactly what a credential-stuffing run needs. Firebase's own
 * `auth/user-not-found` is therefore swallowed, and everything else (rate limiting,
 * network trouble) is reported honestly because none of it reveals whether the address
 * exists.
 */
export function ForgotPasswordForm() {
  const { resetPassword, configured } = useAuth();

  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [invalidAt, setInvalidAt] = useState(0);

  useEffect(() => {
    if (!invalidAt) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [invalidAt]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const trimmed = email.trim();
    if (!trimmed) {
      setFieldError('Enter the e-mail address you signed up with.');
      setInvalidAt(Date.now());
      return;
    }
    if (!isEmail(trimmed)) {
      setFieldError('That does not look like a valid e-mail address.');
      setInvalidAt(Date.now());
      return;
    }

    setFieldError(undefined);
    setFormError(null);
    setPending(true);

    try {
      await resetPassword(trimmed);
    } catch (error) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code: unknown }).code)
          : '';
      // "No such user" must look exactly like success.
      if (code !== 'auth/user-not-found') {
        setFormError(authErrorMessage(error));
        setPending(false);
        return;
      }
    }

    setPending(false);
    setSentTo(trimmed);
  }

  if (sentTo) {
    return (
      <div className="flex flex-col gap-5">
        <Alert tone="success" title="Check your inbox">
          {NEUTRAL_CONFIRMATION}
        </Alert>

        <div className="rounded-xl border border-ink-200 bg-ink-50 p-4 text-sm leading-relaxed text-ink-700">
          <p>
            We used <span className="font-semibold text-ink-950">{sentTo}</span>. The link is valid
            for one hour and can only be used once.
          </p>
          <p className="mt-2">
            Nothing after a few minutes? Look in your spam or promotions folder — automated mail
            often lands there — and check the address above for a typo.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => {
              setSentTo(null);
              setPending(false);
            }}
          >
            Use a different address
          </Button>
          <Link
            href="/login"
            className="text-center text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {!configured ? <NotConfiguredAlert /> : null}

      {formError ? (
        <Alert tone="danger" title="Could not send the reset link">
          {formError}
        </Alert>
      ) : null}

      <form ref={formRef} onSubmit={(event) => void handleSubmit(event)} noValidate className="flex flex-col gap-4">
        <Field
          label="E-mail address"
          error={fieldError}
          hint={`The address on your ${site.name} account.`}
          required
        >
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              name="email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              invalid={invalid}
              aria-describedby={describedBy}
              autoComplete="email"
              autoFocus
              autoCapitalize="off"
              spellCheck={false}
              disabled={!configured || pending}
              required
              placeholder="you@example.com"
            />
          )}
        </Field>

        <Button type="submit" size="lg" fullWidth loading={pending} disabled={!configured || pending}>
          Send reset link
        </Button>
      </form>

      <p className="text-center text-sm text-ink-600">
        Remembered it?{' '}
        <Link href="/login" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
