import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  PADDLE_API_KEY_LENGTH,
  describePaddleApiKey,
  explainPaddleKeyProblem,
} from '@/lib/payments/paddle-key';

/**
 * The failure this guards against took two days to find and had no symptom worth the name.
 *
 * Everything reported green — the key was set, the price ids were set, the client token was
 * in the build, the checkout offered a card button — and every customer who pressed it got
 * "we could not start the checkout, nothing has been charged". Paddle's actual answer,
 * which our code was discarding, was *"Authentication header included, but incorrectly
 * formatted"*: it had rejected the key on its shape, before ever looking it up.
 *
 * So shape is now checked here, where it costs nothing, instead of once per customer.
 */

/**
 * A syntactically valid key: 26 lowercase-alphanumeric, 22 mixed, 3 mixed.
 *
 * Interpolated rather than written out, for the reason the final test in this file
 * enforces: a literal of this shape is what a secret scanner is built to catch, and it
 * cannot tell an invented one from a live credential.
 */
const validSandbox = `pdl_sdbx_apikey_${'01abcdefghijklmnopqrstuvwx'}_${'AbCdEfGhIjKlMnOpQrStUv'}_xY9`;
const validLive = `pdl_live_apikey_${'01abcdefghijklmnopqrstuvwx'}_${'AbCdEfGhIjKlMnOpQrStUv'}_xY9`;

describe('describePaddleApiKey', () => {
  it('agrees with the documented length', () => {
    // If this drifts, every "truncated" verdict below is measuring against the wrong ruler.
    expect(validSandbox).toHaveLength(PADDLE_API_KEY_LENGTH);
    expect(validLive).toHaveLength(PADDLE_API_KEY_LENGTH);
  });

  it('accepts a well-formed sandbox key and reads its environment', () => {
    const report = describePaddleApiKey(validSandbox);
    expect(report.usable).toBe(true);
    expect(report.problem).toBeNull();
    expect(report.environment).toBe('sandbox');
    expect(report.prefix).toBe('pdl_sdbx_apikey_');
  });

  it('accepts a well-formed live key', () => {
    const report = describePaddleApiKey(validLive);
    expect(report.usable).toBe(true);
    expect(report.environment).toBe('production');
  });

  it('never returns any part of the random portion', () => {
    /*
     * The whole value of a public diagnostic is that it is safe to leave public. A field
     * that happened to carry four characters of the secret would be a worse bug than the
     * one this module was written to find, so the assertion is on the serialised result:
     * no substring of the random part may appear anywhere in it.
     */
    const report = describePaddleApiKey(validSandbox);
    const serialised = JSON.stringify(report) + explainPaddleKeyProblem(report);
    const random = validSandbox.slice('pdl_sdbx_apikey_'.length);
    for (let size = 4; size <= random.length; size += 1) {
      expect(serialised).not.toContain(random.slice(0, size));
    }
  });

  it('reports a truncated key as truncated, with both lengths', () => {
    const report = describePaddleApiKey(validSandbox.slice(0, 40));
    expect(report.usable).toBe(false);
    expect(report.problem).toBe('truncated');
    expect(report.length).toBe(40);
    expect(explainPaddleKeyProblem(report)).toContain('40');
    expect(explainPaddleKeyProblem(report)).toContain(String(PADDLE_API_KEY_LENGTH));
  });

  it('reports a key with something pasted onto it as too long', () => {
    expect(describePaddleApiKey(`${validSandbox}extra`).problem).toBe('too-long');
  });

  it('names the client-token mix-up specifically', () => {
    /*
     * The dangerous direction of this swap is the other one — an API key in
     * `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` publishes a server secret to every browser — but
     * this direction is the one that produces the malformed-header error, and saying
     * "wrong shape" about it would send someone hunting for a typo in the right value.
     */
    const report = describePaddleApiKey('test_a1b2c3d4e5f6a7b8c9d0e1f2');
    expect(report.problem).toBe('client-token-in-api-key-slot');
    expect(explainPaddleKeyProblem(report)).toContain('pdl_sdbx_apikey_');
  });

  it('catches invisible characters that survive trimming', () => {
    // A zero-width space is not matched by JavaScript's \s, so nothing upstream strips it
    // and nothing on screen shows it. Right length, right prefix, does not work.
    const withZeroWidth = `${validSandbox.slice(0, 30)}​${validSandbox.slice(31)}`;
    expect(describePaddleApiKey(withZeroWidth).problem).toBe('invisible-characters');
    expect(describePaddleApiKey(`${validSandbox}­`).problem).toBe('invisible-characters');
  });

  it('rejects the right-length-but-wrong-alphabet key', () => {
    // Same length, uppercase in the segment Paddle documents as lowercase-only.
    const wrongAlphabet = `pdl_sdbx_apikey_${'01ABCDEFGHIJKLMNOPQRSTUVWX'}_${'AbCdEfGhIjKlMnOpQrStUv'}_xY9`;
    expect(wrongAlphabet).toHaveLength(PADDLE_API_KEY_LENGTH);
    expect(describePaddleApiKey(wrongAlphabet).usable).toBe(false);
  });

  it('catches a key that lost its prefix, and does not mistake it for a legacy key', () => {
    /*
     * The real value, from the deployment that was broken for two days: it began at
     * `apikey_01m03…`, with `pdl_sdbx_` missing from the front.
     *
     * The first version of this function accepted it. No `pdl_` prefix and over forty
     * characters looked exactly like a pre-2025 legacy key, so it reported the gateway as
     * configured — the checkout offered a card button and Paddle refused every request. The
     * module written to prevent that produced it. Hence both assertions: the verdict, and
     * that the verdict is not `looksLegacy`.
     */
    const withoutPrefix = validSandbox.slice('pdl_sdbx_'.length);
    expect(withoutPrefix.length).toBeGreaterThan(40);
    const report = describePaddleApiKey(withoutPrefix);
    expect(report.usable).toBe(false);
    expect(report.problem).toBe('missing-prefix');
    expect(report.looksLegacy).toBe(false);
    expect(explainPaddleKeyProblem(report)).toContain('pdl_sdbx_apikey_');

    // Prepending the missing segment is the whole fix.
    expect(describePaddleApiKey(`pdl_sdbx_${withoutPrefix}`).usable).toBe(true);
  });

  it('does not reject a legacy key it cannot validate', () => {
    /*
     * Keys issued before 6 May 2025 are 50-character random strings with no prefix. They
     * still authenticate. Refusing to start a checkout because a *working* credential
     * predates a format change would make this module cause the outage it prevents.
     */
    const legacy = 'a'.repeat(50);
    const report = describePaddleApiKey(legacy);
    expect(report.usable).toBe(true);
    expect(report.looksLegacy).toBe(true);
    expect(explainPaddleKeyProblem(report)).toBeNull();
  });

  it('treats absent as missing rather than malformed', () => {
    for (const value of [undefined, null, '']) {
      expect(describePaddleApiKey(value).problem).toBe('missing');
    }
  });

  it('is not itself the reason a push gets blocked', () => {
    /*
     * A fixture realistic enough to exercise the validator is, by construction, realistic
     * enough for GitHub's push protection to read as a live Paddle key — which is exactly
     * what happened the first time this file's sibling was written out as one literal, and
     * the push was refused. Push protection was right; the fixture was wrong.
     *
     * So no source file may contain a contiguous run of characters matching the format.
     * Fixtures interpolate or join instead, which produces the same value at run time and
     * nothing scannable at rest. This is checked here rather than left to the remote,
     * because the remote finds out after the commit exists and the fix is a rebase.
     */
    const CONTIGUOUS = /pdl_(live|sdbx)_apikey_[a-z\d]{26}_[a-zA-Z\d]{22}_[a-zA-Z\d]{3}/;
    const roots = ['app', 'components', 'lib', 'scripts', 'tests'];
    const offenders: string[] = [];

    const scan = (dir: string): void => {
      for (const entry of readdirSync(join(process.cwd(), dir))) {
        const rel = `${dir}/${entry}`;
        if (statSync(join(process.cwd(), rel)).isDirectory()) scan(rel);
        else if (/\.(ts|tsx|mjs|js|json|md)$/.test(entry)) {
          if (CONTIGUOUS.test(readFileSync(join(process.cwd(), rel), 'utf8'))) offenders.push(rel);
        }
      }
    };
    roots.forEach(scan);

    expect(offenders).toEqual([]);
    // And the pattern must actually be capable of matching, or the sweep proves nothing.
    expect(CONTIGUOUS.test(validSandbox)).toBe(true);
  });

  it('explains every problem it can report', () => {
    const cases = [
      undefined,
      'test_a1b2c3d4e5f6a7b8c9d0e1f2',
      validSandbox.slice(0, 40),
      `${validSandbox}extra`,
      `${validSandbox}​`,
      'pdl_',
      'nonsense',
    ];
    for (const value of cases) {
      const report = describePaddleApiKey(value);
      expect(report.usable).toBe(false);
      // An unexplained failure is a dead end for whoever is reading the status endpoint.
      expect(explainPaddleKeyProblem(report)).toBeTruthy();
    }
  });
});
