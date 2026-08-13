'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { Button, ButtonLink } from '@/components/ui/button';
import { Logo } from '@/components/brand/Logo';
import { site } from '@/lib/site';

/**
 * The root error boundary.
 *
 * Catches anything thrown while rendering a page under the root layout — the public site,
 * the auth pages, the payment result pages. The root layout itself is *above* this
 * boundary; if that fails, `app/global-error.tsx` takes over instead.
 *
 * It shows `error.digest` rather than `error.message`: in production the message is
 * replaced with a generic string to avoid leaking internals, whereas the digest is the
 * exact token that finds the failure in the server logs.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Not a setState — logging in an effect is exactly what this hook is for.
    console.error('[app]', error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col bg-ink-50">
      <header className="container-page py-6">
        <Logo />
      </header>

      <main id="main" className="container-page flex flex-1 items-center py-10 sm:py-16">
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-ink-200 bg-white p-6 shadow-card sm:p-9">
          <span className="grid size-12 place-items-center rounded-full bg-warning-50 text-warning-600 ring-1 ring-warning-500/25">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              <path d="M12 9.5v4M12 16.7v.3" strokeLinecap="round" />
            </svg>
          </span>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-4xl">
            Something went wrong at our end
          </h1>

          <p className="mt-4 text-base leading-relaxed text-pretty text-ink-600">
            This page failed to load. It is our fault rather than yours, and it is very often
            temporary — a service we depend on hesitating for a second is the usual cause.
          </p>
          <p className="mt-3 text-base leading-relaxed text-pretty text-ink-600">
            <strong className="font-semibold text-ink-800">Nothing you have written is lost.</strong>{' '}
            Your CVs are stored on your account, not in this page, and this failure did not
            change or delete anything. Trying again is safe.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={reset}
              leadingIcon={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path
                    d="M20 11.5A8 8 0 1 1 17.6 6M20 4v5h-5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            >
              Try again
            </Button>
            <ButtonLink href="/" size="lg" variant="outline">
              Back to the home page
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="ghost">
              Report the problem
            </ButtonLink>
          </div>

          <div className="mt-8 border-t border-ink-100 pt-5 text-xs leading-relaxed text-ink-500">
            <p>
              If it keeps happening, e-mail{' '}
              <a
                href={`mailto:${site.supportEmail}`}
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                {site.supportEmail}
              </a>{' '}
              or use the{' '}
              <Link
                href="/contact"
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                contact form
              </Link>
              , and tell us what you were doing.
            </p>
            {error.digest ? (
              <p className="mt-2">
                Quote this reference and we can find the exact failure in our logs:{' '}
                <code className="font-mono text-ink-600">{error.digest}</code>
              </p>
            ) : (
              <p className="mt-2">
                This failure happened in your browser, so there is no server reference to
                quote — a description of what you clicked is the most useful thing you can
                send us.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
