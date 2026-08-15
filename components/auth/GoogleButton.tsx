'use client';

import { Spinner } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

/**
 * Google's four-colour "G", drawn inline.
 *
 * A hosted image would be a render-blocking request against a third-party origin (and one
 * more entry in the CSP `img-src` list) for a 20px mark that never changes.
 */
export function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className="shrink-0"
      aria-hidden
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.4-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.54 2.56 10.78l7.97-6.19Z"
      />
      <path
        fill="#EA4335"
        d="M24 9.49c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.97 6.19C12.43 13.72 17.74 9.49 24 9.49Z"
      />
    </svg>
  );
}

/**
 * The Google sign-in control.
 *
 * Presentational on purpose: the surrounding form owns the `signInWithGoogle()` call so
 * that a failure lands in the same error `Alert` as an e-mail/password failure, rather
 * than in a second error surface the user has to look for.
 *
 * `label` has no default: a default would be one English string that no caller passes
 * through the copy table, and it would be invisible until a fourth screen used it.
 */
export function GoogleButton({
  label,
  onClick,
  loading = false,
  disabled = false,
  className,
}: {
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'relative inline-flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-ink-200',
        'bg-white text-sm font-semibold text-ink-800 shadow-sm',
        'transition-[background-color,border-color] duration-150 hover:border-ink-300 hover:bg-ink-50',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
        'disabled:pointer-events-none disabled:opacity-55',
        className,
      )}
    >
      {loading ? (
        <span className="absolute inset-0 grid place-items-center" aria-hidden>
          <Spinner className="text-ink-600" />
        </span>
      ) : null}
      <span className={cn('contents', loading && 'invisible')}>
        <GoogleG />
        {label}
      </span>
    </button>
  );
}
