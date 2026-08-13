'use client';

import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';

import { LogoMark } from '@/components/brand/Logo';
import { site } from '@/lib/site';

/**
 * The last-resort error boundary.
 *
 * This replaces the root layout, which means it renders its own `<html>` and `<body>` and
 * — crucially — **the stylesheet may never have loaded**, because the failure it is
 * catching can be the root layout itself. Every rule below is therefore an inline style,
 * with a system font stack, so the page is legible with no CSS at all.
 *
 * Metadata exports are not supported in an error boundary, so the document title is set
 * with React's `<title>` element instead.
 */

const styles = {
  body: {
    margin: 0,
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: '#f7f8fa',
    color: '#0a0e18',
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    lineHeight: 1.6,
    WebkitFontSmoothing: 'antialiased',
  },
  card: {
    width: '100%',
    maxWidth: '560px',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    border: '1px solid #dde1e9',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 16px -4px rgba(10, 14, 24, 0.08)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '28px',
  },
  wordmark: {
    fontSize: '17px',
    fontWeight: 800,
    letterSpacing: '-0.01em',
    color: '#0a0e18',
  },
  heading: {
    margin: '0 0 12px',
    fontSize: '26px',
    lineHeight: 1.2,
    fontWeight: 800,
    letterSpacing: '-0.02em',
  },
  paragraph: {
    margin: '0 0 12px',
    fontSize: '15px',
    color: '#515c74',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '24px',
  },
  button: {
    appearance: 'none',
    border: '1px solid transparent',
    borderRadius: '8px',
    padding: '11px 20px',
    fontSize: '15px',
    fontWeight: 600,
    fontFamily: 'inherit',
    lineHeight: 1,
    color: '#ffffff',
    backgroundColor: '#1f3af5',
    cursor: 'pointer',
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid #dde1e9',
    borderRadius: '8px',
    padding: '11px 20px',
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: 1,
    color: '#3f485c',
    backgroundColor: '#ffffff',
    textDecoration: 'none',
  },
  footnote: {
    margin: '28px 0 0',
    paddingTop: '20px',
    borderTop: '1px solid #eef0f4',
    fontSize: '12px',
    color: '#6b7791',
  },
  code: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: '12px',
    color: '#515c74',
  },
  mailto: {
    color: '#1a2de1',
    fontWeight: 500,
  },
} satisfies Record<string, CSSProperties>;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global]', error);
  }, [error]);

  return (
    <html lang="en" dir="ltr">
      <body style={styles.body}>
        <title>{`Something went wrong | ${site.name}`}</title>
        <main style={styles.card}>
          <div style={styles.brand}>
            <LogoMark size={32} />
            <span style={styles.wordmark}>{site.name}</span>
          </div>

          <h1 style={styles.heading}>Something went wrong</h1>

          <p style={styles.paragraph}>
            The application failed to start rendering this page. This is a fault at our end,
            not a problem with your account, and it is usually momentary.
          </p>
          <p style={styles.paragraph}>
            Nothing you have written has been lost. Your CVs are stored on your account and
            this failure did not change or delete any of them, so reloading is safe.
          </p>

          <div style={styles.actions}>
            <button type="button" onClick={reset} style={styles.button}>
              Try again
            </button>
            {/* Navigating away resets the boundary, so this genuinely escapes the error. */}
            <Link href="/" style={styles.link}>
              Back to the home page
            </Link>
          </div>

          <p style={styles.footnote}>
            If it happens again, e-mail{' '}
            <a href={`mailto:${site.supportEmail}`} style={styles.mailto}>
              {site.supportEmail}
            </a>{' '}
            and tell us what you were doing.
            {error.digest ? (
              <>
                {' '}
                Please quote reference <span style={styles.code}>{error.digest}</span> — it
                points us straight at the failure in our logs.
              </>
            ) : null}
          </p>
        </main>
      </body>
    </html>
  );
}
