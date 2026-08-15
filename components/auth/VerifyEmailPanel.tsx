'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { NotConfiguredAlert } from './shared';
import { authErrorMessage, useAuth } from '@/components/auth/AuthProvider';
import { useCopy } from '@/components/i18n/LocaleProvider';
import { Button, ButtonLink } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { site } from '@/lib/site';

/** Long enough that a user cannot hammer the mail sender, short enough not to feel punitive. */
const COOLDOWN_SECONDS = 60;

/**
 * The "confirm your e-mail" screen.
 *
 * Not a dead end: every state has a way forward. Signed out, it points at sign-in;
 * already verified, it points at the dashboard; unverified, it can resend (rate limited
 * client-side with a visible countdown) or re-check the session without a page reload.
 */
export function VerifyEmailPanel() {
  const router = useRouter();
  const { sessionUser, configured, resendVerificationEmail, refreshSession, signOut } = useAuth();
  const copy = useCopy();

  const [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<'resend' | 'continue' | 'signout' | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => stopTimer, [stopTimer]);

  const startCooldown = useCallback(() => {
    stopTimer();
    setCooldown(COOLDOWN_SECONDS);
    timer.current = setInterval(() => {
      setCooldown((current) => {
        if (current <= 1) {
          stopTimer();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }, [stopTimer]);

  if (!configured) {
    return (
      <div className="flex flex-col gap-5">
        <NotConfiguredAlert copy={copy} />
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <div className="flex flex-col gap-5">
        <Alert tone="info" title={copy.auth.notSignedInTitle}>
          {copy.auth.notSignedInBody}
        </Alert>
        <div className="flex flex-col gap-3">
          <ButtonLink href="/login?next=%2Fverify-email" size="lg" fullWidth>
            {copy.auth.signIn}
          </ButtonLink>
          <ButtonLink href="/register" variant="outline" size="lg" fullWidth>
            {copy.auth.createAnAccount}
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (sessionUser.emailVerified) {
    return (
      <div className="flex flex-col gap-5">
        <Alert tone="success" title={copy.auth.verifiedTitle}>
          <span className="font-semibold">{sessionUser.email}</span> {copy.auth.verifiedSuffix}
        </Alert>
        <ButtonLink href="/dashboard" size="lg" fullWidth>
          {copy.auth.goToDashboard}
        </ButtonLink>
      </div>
    );
  }

  async function handleResend() {
    if (pending || cooldown > 0) return;
    setNotice(null);
    setError(null);
    setPending('resend');
    try {
      await resendVerificationEmail();
      setNotice(copy.auth.resendSentTo(sessionUser?.email ?? copy.auth.yourInbox));
      startCooldown();
    } catch (caught) {
      setError(authErrorMessage(caught, copy));
    } finally {
      setPending(null);
    }
  }

  async function handleContinue() {
    if (pending) return;
    setNotice(null);
    setError(null);
    setPending('continue');
    try {
      await refreshSession();
      router.push('/dashboard');
      router.refresh();
    } catch (caught) {
      setError(authErrorMessage(caught, copy));
      setPending(null);
    }
  }

  async function handleSignOut() {
    if (pending) return;
    setPending('signout');
    try {
      await signOut();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {error ? (
        <Alert tone="danger" title={copy.auth.resendFailedTitle}>
          {error}
        </Alert>
      ) : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
        <p className="text-xs font-semibold tracking-wide text-ink-500 uppercase">
          {copy.auth.waitingForConfirmation}
        </p>
        <p className="mt-1 text-sm font-semibold break-all text-ink-950">{sessionUser.email}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">{copy.auth.verifyOpenLink}</p>
      </div>

      <div className="text-sm leading-relaxed text-ink-700">
        <p className="font-semibold text-ink-950">{copy.auth.whatThisChanges}</p>
        <ul className="mt-2 flex flex-col gap-2">
          <li className="flex gap-2">
            <Bullet />
            <span>{copy.auth.verifyPointEditor}</span>
          </li>
          <li className="flex gap-2">
            <Bullet />
            <span>{copy.auth.verifyPointReset}</span>
          </li>
          <li className="flex gap-2">
            <Bullet />
            <span>{copy.auth.verifyPointContact(site.name)}</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          fullWidth
          onClick={() => void handleContinue()}
          loading={pending === 'continue'}
          disabled={pending !== null}
        >
          {copy.auth.verifiedContinue}
        </Button>

        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={() => void handleResend()}
          loading={pending === 'resend'}
          disabled={pending !== null || cooldown > 0}
        >
          {cooldown > 0 ? copy.auth.resendIn(cooldown) : copy.auth.resendVerification}
        </Button>

        {/*
          Announced once, when the wait is over. Mirroring the per-second countdown here
          would make a screen reader talk over everything else for a minute.
        */}
        <p className="sr-only" aria-live="polite">
          {notice && cooldown === 0 ? copy.auth.resendAvailable : ''}
        </p>
      </div>

      <p className="text-center text-sm text-ink-600">
        {copy.auth.wrongAddress}{' '}
        <Button
          variant="link"
          onClick={() => void handleSignOut()}
          disabled={pending !== null}
          className="text-sm"
        >
          {copy.nav.signOut}
        </Button>
      </p>
    </div>
  );
}

function Bullet() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      className="mt-0.5 shrink-0 text-brand-600"
      aria-hidden
    >
      <path d="m5 12.5 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
