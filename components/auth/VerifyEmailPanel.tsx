'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { NotConfiguredAlert } from './shared';
import { authErrorMessage, useAuth } from '@/components/auth/AuthProvider';
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
        <NotConfiguredAlert />
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <div className="flex flex-col gap-5">
        <Alert tone="info" title="You are not signed in">
          Verification links belong to an account, so sign in first and we will pick up where you
          left off.
        </Alert>
        <div className="flex flex-col gap-3">
          <ButtonLink href="/login?next=%2Fverify-email" size="lg" fullWidth>
            Sign in
          </ButtonLink>
          <ButtonLink href="/register" variant="outline" size="lg" fullWidth>
            Create an account
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (sessionUser.emailVerified) {
    return (
      <div className="flex flex-col gap-5">
        <Alert tone="success" title="Your e-mail address is confirmed">
          <span className="font-semibold">{sessionUser.email}</span> is verified — there is nothing
          left to do here.
        </Alert>
        <ButtonLink href="/dashboard" size="lg" fullWidth>
          Go to your dashboard
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
      setNotice(`A new link is on its way to ${sessionUser?.email ?? 'your inbox'}.`);
      startCooldown();
    } catch (caught) {
      setError(authErrorMessage(caught));
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
      setError(authErrorMessage(caught));
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
        <Alert tone="danger" title="That did not work">
          {error}
        </Alert>
      ) : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
        <p className="text-xs font-semibold tracking-wide text-ink-500 uppercase">
          Waiting for confirmation
        </p>
        <p className="mt-1 text-sm font-semibold break-all text-ink-950">{sessionUser.email}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Open the link in that message to confirm the address is yours. It can take a minute to
          arrive, and it is often filed as spam or promotions.
        </p>
      </div>

      <div className="text-sm leading-relaxed text-ink-700">
        <p className="font-semibold text-ink-950">What this changes</p>
        <ul className="mt-2 flex flex-col gap-2">
          <li className="flex gap-2">
            <Bullet />
            <span>
              Nothing in the editor is locked: you can keep building, customising and downloading
              CVs while the address is unconfirmed.
            </span>
          </li>
          <li className="flex gap-2">
            <Bullet />
            <span>
              A confirmed address is the only way back in if you forget your password — a reset
              link sent to a mistyped address lands in a stranger&rsquo;s inbox.
            </span>
          </li>
          <li className="flex gap-2">
            <Bullet />
            <span>
              It is also how {site.name} reaches you about a receipt or a sign-in from a new
              device.
            </span>
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
          I&rsquo;ve verified — continue
        </Button>

        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={() => void handleResend()}
          loading={pending === 'resend'}
          disabled={pending !== null || cooldown > 0}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification e-mail'}
        </Button>

        {/*
          Announced once, when the wait is over. Mirroring the per-second countdown here
          would make a screen reader talk over everything else for a minute.
        */}
        <p className="sr-only" aria-live="polite">
          {notice && cooldown === 0 ? 'You can request another verification e-mail now.' : ''}
        </p>
      </div>

      <p className="text-center text-sm text-ink-600">
        Wrong address, or not your account?{' '}
        <Button
          variant="link"
          onClick={() => void handleSignOut()}
          disabled={pending !== null}
          className="text-sm"
        >
          Sign out
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
