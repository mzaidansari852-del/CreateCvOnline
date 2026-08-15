'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { setMarketingOptIn } from './actions';
import { GoogleButton } from './GoogleButton';
import { PasswordField } from './PasswordField';
import { PasswordStrength } from './PasswordStrength';
import { NotConfiguredAlert, OrDivider, isEmail, safeNextPath } from './shared';
import { authErrorMessage, useAuth } from '@/components/auth/AuthProvider';
import { useCopy } from '@/components/i18n/LocaleProvider';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { Checkbox, Field, FieldError, Input } from '@/components/ui/form';
import { trackEvent } from '@/lib/analytics/events';

const MIN_PASSWORD_LENGTH = 8;

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  accept?: string;
}

/**
 * Account creation.
 *
 * `AuthProvider.signUp` handles the Firebase call, the display name, the session cookie
 * and the `signup` analytics event, so none of that is repeated here. The one event this
 * component does fire is a Google *sign-up*: the shared popup helper can only report a
 * `login`, and this screen is the only place that knows the intent was to create an
 * account.
 */
export function RegisterForm({ templateId, next }: { templateId?: string; next?: string }) {
  const router = useRouter();
  const { signUp, signInWithGoogle, configured } = useAuth();
  const copy = useCopy();

  const formRef = useRef<HTMLFormElement>(null);
  const strengthId = useId();
  const acceptErrorId = useId();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState<'password' | 'google' | null>(null);
  const [invalidAt, setInvalidAt] = useState(0);

  useEffect(() => {
    if (!invalidAt) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [invalidAt]);

  const target = templateId
    ? `/dashboard/cvs/new?template=${encodeURIComponent(templateId)}`
    : safeNextPath(next);

  function report(found: Errors): boolean {
    setErrors(found);
    const count = Object.keys(found).length;
    if (count === 0) return true;
    // One problem announces itself when focus lands on the field; several need a summary.
    setFormError(count > 1 ? copy.auth.thingsToFix(count) : null);
    setInvalidAt(Date.now());
    return false;
  }

  function validate(): Errors {
    const found: Errors = {};
    if (name.trim().length < 2) found.name = copy.auth.nameRequired;
    if (!email.trim()) found.email = copy.auth.emailRequiredSignUp;
    else if (!isEmail(email)) found.email = copy.auth.emailInvalid;
    if (password.length < MIN_PASSWORD_LENGTH) {
      found.password = copy.auth.passwordTooShort(MIN_PASSWORD_LENGTH);
    }
    if (!confirm) found.confirm = copy.auth.confirmRequired;
    else if (confirm !== password) found.confirm = copy.auth.confirmMismatch;
    if (!accepted) found.accept = copy.auth.acceptRequired;
    return found;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setFormError(null);
    if (!report(validate())) return;

    setPending('password');
    try {
      await signUp({ email, password, displayName: name.trim() });
      if (marketing) await setMarketingOptIn(true);
      router.push(target);
      router.refresh();
    } catch (error) {
      setFormError(authErrorMessage(error, copy));
      setPending(null);
    }
  }

  async function handleGoogle() {
    if (pending) return;

    setFormError(null);
    // Terms have to be accepted whichever way the account is created.
    if (!report(accepted ? {} : { accept: copy.auth.acceptRequired })) {
      return;
    }

    setPending('google');
    try {
      await signInWithGoogle();
      trackEvent('signup', { method: 'google' });
      if (marketing) await setMarketingOptIn(true);
      router.push(target);
      router.refresh();
    } catch (error) {
      setFormError(authErrorMessage(error, copy));
      setPending(null);
    }
  }

  const disabled = !configured || pending !== null;
  const loginHref = next ? `/login?next=${encodeURIComponent(safeNextPath(next))}` : '/login';

  return (
    <div className="flex flex-col gap-5">
      {!configured ? <NotConfiguredAlert copy={copy} /> : null}

      {formError ? (
        <Alert tone="danger" title={copy.auth.signUpFailedTitle}>
          {formError}
        </Alert>
      ) : null}

      <GoogleButton
        onClick={() => void handleGoogle()}
        loading={pending === 'google'}
        disabled={!configured || pending === 'password'}
        label={copy.auth.signUpWithGoogle}
      />

      <OrDivider label={copy.auth.orSignUpWithEmail} />

      <form
        ref={formRef}
        onSubmit={(event) => void handleSubmit(event)}
        noValidate
        className="flex flex-col gap-4"
      >
        <Field label={copy.auth.nameLabel} error={errors.name} required>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              invalid={invalid}
              aria-describedby={describedBy}
              autoComplete="name"
              autoFocus
              disabled={disabled}
              required
              placeholder="Amina El Fassi"
            />
          )}
        </Field>

        <Field label={copy.auth.emailLabel} error={errors.email} required>
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
              autoCapitalize="off"
              spellCheck={false}
              disabled={disabled}
              required
              placeholder={copy.auth.emailPlaceholder}
            />
          )}
        </Field>

        <div className="flex flex-col gap-2">
          <PasswordField
            label={copy.auth.passwordLabel}
            name="password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            autoComplete="new-password"
            describedBy={strengthId}
            disabled={disabled}
          />
          <PasswordStrength password={password} copy={copy} id={strengthId} />
        </div>

        <PasswordField
          label={copy.auth.confirmPasswordLabel}
          name="confirmPassword"
          value={confirm}
          onChange={setConfirm}
          error={errors.confirm}
          autoComplete="new-password"
          disabled={disabled}
        />

        <div className="flex flex-col gap-3 rounded-xl bg-ink-50 p-3.5">
          <div className="flex flex-col gap-1">
            <Checkbox
              name="accept"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              disabled={disabled}
              required
              aria-invalid={errors.accept ? true : undefined}
              aria-describedby={errors.accept ? acceptErrorId : undefined}
              label={
                <>
                  {copy.auth.acceptIntro}{' '}
                  <Link
                    href="/terms"
                    className="font-semibold text-brand-700 underline underline-offset-2"
                  >
                    {copy.auth.termsOfService}
                  </Link>{' '}
                  {copy.auth.acceptAnd}{' '}
                  <Link
                    href="/privacy"
                    className="font-semibold text-brand-700 underline underline-offset-2"
                  >
                    {copy.auth.privacyPolicy}
                  </Link>
                  .
                </>
              }
            />
            {errors.accept ? (
              <span id={acceptErrorId} className="pl-6.5">
                <FieldError>{errors.accept}</FieldError>
              </span>
            ) : null}
          </div>

          <Checkbox
            name="marketing"
            checked={marketing}
            onChange={(event) => setMarketing(event.target.checked)}
            disabled={disabled}
            label={copy.auth.marketingLabel}
            hint={copy.auth.marketingHint}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={pending === 'password'}
          disabled={disabled}
        >
          {copy.auth.createMyFreeAccount}
        </Button>
      </form>

      <p className="text-center text-sm text-ink-600">
        {copy.auth.haveAccount}{' '}
        <Link
          href={loginHref}
          className="font-semibold text-brand-700 underline-offset-4 hover:underline"
        >
          {copy.auth.signIn}
        </Link>
      </p>
    </div>
  );
}
