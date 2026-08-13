'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { GoogleButton } from './GoogleButton';
import { PasswordField } from './PasswordField';
import { NotConfiguredAlert, OrDivider, isEmail, safeNextPath } from './shared';
import { authErrorMessage, useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { Field, Input } from '@/components/ui/form';

interface Errors {
  email?: string;
  password?: string;
}

/**
 * Sign-in.
 *
 * `AuthProvider.signIn` / `signInWithGoogle` already exchange the ID token for the
 * session cookie, call `router.refresh()` and fire the `login` analytics event, so this
 * component does none of those a second time — it validates, surfaces failures in one
 * place, and decides where the user lands.
 */
export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const { signIn, signInWithGoogle, configured } = useAuth();

  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState<'password' | 'google' | null>(null);
  const [invalidAt, setInvalidAt] = useState(0);

  // Move focus to the first field the user has to fix, once the errors are in the DOM.
  useEffect(() => {
    if (!invalidAt) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [invalidAt]);

  const target = safeNextPath(next);

  function validate(): Errors {
    const found: Errors = {};
    if (!email.trim()) found.email = 'Enter the e-mail address you signed up with.';
    else if (!isEmail(email)) found.email = 'That does not look like a valid e-mail address.';
    if (!password) found.password = 'Enter your password.';
    return found;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const found = validate();
    setErrors(found);
    const count = Object.keys(found).length;
    if (count > 0) {
      // A single problem announces itself when focus lands on the field it belongs to;
      // several need a summary at the top of the form.
      setFormError(count > 1 ? `There are ${count} things to fix below.` : null);
      setInvalidAt(Date.now());
      return;
    }

    setFormError(null);
    setPending('password');
    try {
      await signIn(email, password);
      router.push(target);
      router.refresh();
    } catch (error) {
      setFormError(authErrorMessage(error));
      setPending(null);
    }
  }

  async function handleGoogle() {
    if (pending) return;
    setErrors({});
    setFormError(null);
    setPending('google');
    try {
      await signInWithGoogle();
      router.push(target);
      router.refresh();
    } catch (error) {
      setFormError(authErrorMessage(error));
      setPending(null);
    }
  }

  const disabled = !configured || pending !== null;
  const registerHref = next ? `/register?next=${encodeURIComponent(target)}` : '/register';

  return (
    <div className="flex flex-col gap-5">
      {!configured ? <NotConfiguredAlert /> : null}

      {formError ? (
        <Alert tone="danger" title="Could not sign you in">
          {formError}
        </Alert>
      ) : null}

      <GoogleButton
        onClick={() => void handleGoogle()}
        loading={pending === 'google'}
        disabled={!configured || pending === 'password'}
        label="Sign in with Google"
      />

      <OrDivider />

      <form ref={formRef} onSubmit={(event) => void handleSubmit(event)} noValidate className="flex flex-col gap-4">
        <Field label="E-mail address" error={errors.email} required>
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
              disabled={disabled}
              required
              placeholder="you@example.com"
            />
          )}
        </Field>

        <div className="flex flex-col gap-1.5">
          <PasswordField
            label="Password"
            name="password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            autoComplete="current-password"
            disabled={disabled}
          />
          <Link
            href="/forgot-password"
            className="self-end text-xs font-semibold text-brand-700 underline-offset-4 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth loading={pending === 'password'} disabled={disabled}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-ink-600">
        New here?{' '}
        <Link href={registerHref} className="font-semibold text-brand-700 underline-offset-4 hover:underline">
          Create a free account
        </Link>
      </p>
    </div>
  );
}
