import Link from 'next/link';

import { Alert } from '@/components/ui/feedback';

/**
 * The small pieces every auth screen needs.
 *
 * Kept in one module so the redirect rule, the "not configured" explanation and the
 * e-mail check cannot drift apart between the four forms.
 */

/** Where a successful sign-in lands when nothing better is asked for. */
export const AFTER_AUTH_PATH = '/dashboard';

/**
 * Turns an untrusted `?next=` value into a path we are willing to navigate to.
 *
 * Only a same-origin *path* survives: it must begin with a single `/`, and must not
 * begin with `//` or `/\` — a browser resolves both of those as protocol-relative URLs,
 * which would let `?next=//evil.example` bounce a freshly signed-in user off-site.
 *
 * Mirrors the rule `proxy.ts` applies when it redirects an already-signed-in visitor.
 */
export function safeNextPath(
  value: string | string[] | null | undefined,
  fallback: string = AFTER_AUTH_PATH,
): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') return fallback;

  const candidate = raw.trim();
  if (!candidate.startsWith('/')) return fallback;
  if (candidate.startsWith('//') || candidate.startsWith('/\\')) return fallback;

  // A smuggled newline or tab can turn one URL into two once something re-parses it.
  for (const character of candidate) {
    const code = character.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) return fallback;
  }

  return candidate;
}

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
export function NotConfiguredAlert() {
  return (
    <Alert tone="warning" title="Sign-in is not configured on this deployment">
      <p>
        No Firebase credentials were found, so accounts cannot be created or used yet. Copy{' '}
        <code className="rounded bg-warning-100 px-1 py-0.5 font-mono text-2xs">.env.example</code>{' '}
        to{' '}
        <code className="rounded bg-warning-100 px-1 py-0.5 font-mono text-2xs">.env.local</code>,
        fill in the{' '}
        <code className="rounded bg-warning-100 px-1 py-0.5 font-mono text-2xs">
          NEXT_PUBLIC_FIREBASE_*
        </code>{' '}
        values and restart the server.
      </p>
      <p className="mt-1.5">
        Everything that does not need an account still works —{' '}
        <Link href="/templates" className="font-semibold underline underline-offset-2">
          browse the templates
        </Link>
        .
      </p>
    </Alert>
  );
}

/** The "or" rule between a provider button and an e-mail form. */
export function OrDivider({ label = 'or continue with e-mail' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-ink-200" aria-hidden />
      <span className="text-xs font-medium text-ink-500">{label}</span>
      <span className="h-px flex-1 bg-ink-200" aria-hidden />
    </div>
  );
}
