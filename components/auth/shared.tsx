import Link from 'next/link';

import { Alert } from '@/components/ui/feedback';
import type { AppCopy } from '@/lib/i18n/app-copy';

/**
 * The small pieces every auth screen needs.
 *
 * Kept in one module so the redirect rule, the "not configured" explanation and the
 * e-mail check cannot drift apart between the four forms.
 *
 * The two components take their strings as a prop rather than calling `useCopy()`. This
 * module has no `'use client'` — `safeNextPath` and `firstParam` are called by the auth
 * *pages*, which are server components, and marking the file would turn those helpers
 * into client references that throw when the server calls them. Every caller of the
 * components is a client component that already has the copy in hand.
 */

/*
 * `safeNextPath` used to be defined here. It now lives in `lib/auth/next-path.ts` and is
 * re-exported so that the four forms importing it from this module keep working — the move
 * was so that `proxy.ts` could import the *same function* instead of keeping its own copy
 * of the rule. Its copy had drifted, and the drift sent every new customer who clicked
 * "Get Pro" while signed out to a 404 after signing in. See that file for the details.
 */
export { AFTER_AUTH_PATH, safeNextPath } from '@/lib/auth/next-path';

/** First value of a `searchParams` entry, trimmed, or `undefined` when empty. */
export function firstParam(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Deliberately forgiving. The authoritative check is Firebase's, and a regex that tries
 * to be clever rejects addresses that are perfectly valid.
 */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/**
 * Shown in place of a working form when the Firebase environment variables are missing.
 * Without it a submit would fail with an opaque SDK error, or nothing at all.
 */
export function NotConfiguredAlert({ copy }: { copy: AppCopy }) {
  return (
    <Alert tone="warning" title={copy.auth.notConfiguredTitle}>
      <p>
        {copy.auth.notConfiguredIntro}{' '}
        <code className="rounded bg-warning-100 px-1 py-0.5 font-mono text-2xs">.env.example</code>{' '}
        {copy.auth.notConfiguredTo}{' '}
        <code className="rounded bg-warning-100 px-1 py-0.5 font-mono text-2xs">.env.local</code>
        {copy.auth.notConfiguredFill}{' '}
        <code className="rounded bg-warning-100 px-1 py-0.5 font-mono text-2xs">
          NEXT_PUBLIC_FIREBASE_*
        </code>{' '}
        {copy.auth.notConfiguredRestart}
      </p>
      <p className="mt-1.5">
        {copy.auth.notConfiguredStillWorks}{' '}
        <Link href="/templates" className="font-semibold underline underline-offset-2">
          {copy.auth.notConfiguredBrowseLink}
        </Link>
        .
      </p>
    </Alert>
  );
}

/** The "or" rule between a provider button and an e-mail form. */
export function OrDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-ink-200" aria-hidden />
      <span className="text-xs font-medium text-ink-500">{label}</span>
      <span className="h-px flex-1 bg-ink-200" aria-hidden />
    </div>
  );
}
