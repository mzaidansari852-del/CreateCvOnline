import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALES } from '@/lib/i18n/locales';

/**
 * The error a customer reads when a payment fails must be in the customer's language.
 *
 * A French buyer whose checkout failed to start was shown the heading « Le paiement n'a pas
 * pu démarrer » followed by an English sentence. Nothing was broken in the translation
 * files — the components were rendering `payload.error.message`, which is the API's own
 * English text, in preference to the translated string sitting right next to it as the
 * fallback. The English only appeared when something went wrong, so every screenshot taken
 * of a working checkout looked perfectly translated.
 *
 * Two things have to hold, and neither is visible to the type checker:
 *
 *   1. no payment component renders the API's `message` field, and
 *   2. every error code the payment API can actually emit has copy in all three locales.
 *
 * The second is asserted against the codes *read out of the route files*, not a list
 * maintained here — a hand-kept list would drift the first time someone adds a code, and
 * would drift silently, because a missing translation falls back to a generic sentence
 * rather than throwing.
 */

const root = process.cwd();

/**
 * Source with comments removed.
 *
 * Without this the first assertion below passes or fails on prose: the fix for this very
 * bug left the words `payload.error.message` in an explanatory comment, and the test that
 * was supposed to prove the fix reported the comment as the offence. A test that reads
 * documentation as code is worse than no test — it fails on the correct state of the file.
 */
const read = (path: string) =>
  readFileSync(join(root, path), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');

/** Every `.ts`/`.tsx` file under a directory, recursively. */
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(root, dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(root, rel)).isDirectory()) out.push(...walk(rel));
    else if (/\.tsx?$/.test(entry)) out.push(rel);
  }
  return out;
}

const paymentComponents = walk('components/payments');
const paymentRoutes = walk('app/api/payments');

describe('payment failures speak the customer’s language', () => {
  it('finds the payment components and routes it is meant to be checking', () => {
    // Without this the suite passes vacuously if either directory is ever renamed.
    expect(paymentComponents.length).toBeGreaterThanOrEqual(2);
    expect(paymentRoutes.length).toBeGreaterThanOrEqual(4);
  });

  it.each(paymentComponents)('%s never renders the API’s English message', (file) => {
    const source = read(file);
    /*
     * `error.message` / `error?.message` read off a parsed JSON payload. Narrow on purpose:
     * `cause.message` on a caught Error is fine — that one is logged, not rendered.
     */
    expect(source).not.toMatch(/payload\??\.error\??\.message/);
  });

  it('translates every error code the payment API can emit', () => {
    /*
     * `apiError(<status>, '<code>', …)` across the payment routes, plus the shared codes
     * from the route handler that any authed endpoint can return before its own body runs.
     */
    const emitted = new Set<string>();
    for (const file of [...paymentRoutes, 'lib/api/handler.ts']) {
      const source = read(file);
      for (const match of source.matchAll(/apiError\(\s*\w+\s*,\s*'([a-z-]+)'/g)) {
        if (match[1]) emitted.add(match[1]);
      }
      /*
       * The rate limiter builds its 429 body by hand rather than through `apiError`, so it
       * needs its own pattern — anchored on `error: { code:` rather than a bare `code:`,
       * because the latter also matches the `code` field of a Zod issue and would demand a
       * translation for the string `custom`.
       */
      for (const match of source.matchAll(/error:\s*\{\s*code:\s*'([a-z-]+)'/g)) {
        if (match[1]) emitted.add(match[1]);
      }
    }

    /*
     * `invalid-request` is the only code the handler produces from a value we do not choose
     * (a Zod failure), and it is covered; everything else here is ours. If this set ever
     * comes back empty the regex has stopped matching and the test is worthless.
     */
    expect(emitted.size).toBeGreaterThanOrEqual(8);

    const missing: string[] = [];
    for (const locale of LOCALES) {
      const { serverError } = appCopy(locale).checkout;
      for (const code of emitted) {
        if (!serverError(code)) missing.push(`${locale}: ${code}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('returns null for a code it has nothing specific to say about', () => {
    // The callers rely on this to fall back to their own translated wording.
    for (const locale of LOCALES) {
      expect(appCopy(locale).checkout.serverError('not-a-real-code')).toBeNull();
      expect(appCopy(locale).checkout.serverError(undefined)).toBeNull();
    }
  });

  it('gives each locale its own wording rather than copying English', () => {
    const codes = ['payment-provider-error', 'unauthenticated', 'amount-mismatch'];
    for (const code of codes) {
      const [en, fr, de] = LOCALES.map((locale) => appCopy(locale).checkout.serverError(code));
      expect(new Set([en, fr, de]).size).toBe(3);
    }
  });
});
