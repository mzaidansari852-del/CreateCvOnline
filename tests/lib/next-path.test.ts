import { describe, expect, it } from 'vitest';

import { AFTER_AUTH_PATH, resolveNextUrl, safeNextPath } from '@/lib/auth/next-path';

/**
 * The redirect that broke the purchase funnel.
 *
 * Signed out, click "Get Pro". `requireViewer` sends you to
 * `/login?next=%2Fpayment%2Fcheckout%3Fplan%3Dpro`. You sign in. Now you have a session, so
 * `proxy.ts` takes its "already signed in, no use for the sign-in form" branch, reads
 * `next`, and redirects you to it.
 *
 * It did that by assigning `next` to `URL.pathname`. `next` is a path *with a query*, and
 * `URL.pathname` percent-encodes a `?` — so the target became
 * `/payment/checkout%3Fplan=pro`: one path segment, matching no route, **404**.
 *
 * The shape of the bug is what makes it worth a test file of its own. It was unreachable for
 * anyone already signed in, which is everyone who tests a checkout. It only fired on the
 * first purchase attempt of a brand-new customer — the single most expensive request the
 * site serves — and it fired every time.
 *
 * `assert`ing on the string is deliberate: this is a test about URL *serialisation*, and any
 * assertion that parses the result before comparing would re-do the exact step the bug
 * skipped and pass.
 */

const ORIGIN = 'https://www.createcvonline.com';

describe('resolveNextUrl', () => {
  it('preserves a query string — the regression', () => {
    const url = resolveNextUrl('/payment/checkout?plan=pro', ORIGIN);
    expect(url.pathname).toBe('/payment/checkout');
    expect(url.search).toBe('?plan=pro');
    // The whole failure was visible only in the serialised form.
    expect(url.toString()).toBe(`${ORIGIN}/payment/checkout?plan=pro`);
    expect(url.toString()).not.toContain('%3F');
  });

  it('reproduces the old bug, so the fix is not a coincidence', () => {
    /*
     * What the previous implementation did, kept here as the counter-example. If this ever
     * stops producing `%3F`, the platform changed under us and the test above is no longer
     * testing anything.
     */
    const broken = new URL(`${ORIGIN}/login`);
    broken.pathname = '/payment/checkout?plan=pro';
    broken.search = '';
    expect(broken.toString()).toBe(`${ORIGIN}/payment/checkout%3Fplan=pro`);
  });

  it('handles both purchasable plans and a multi-parameter next', () => {
    expect(resolveNextUrl('/payment/checkout?plan=lifetime', ORIGIN).toString()).toBe(
      `${ORIGIN}/payment/checkout?plan=lifetime`,
    );
    expect(resolveNextUrl('/dashboard/cvs/abc123?tab=preview&page=2', ORIGIN).toString()).toBe(
      `${ORIGIN}/dashboard/cvs/abc123?tab=preview&page=2`,
    );
  });

  it('keeps a fragment, and a path with no query', () => {
    expect(resolveNextUrl('/dashboard/account#billing', ORIGIN).toString()).toBe(
      `${ORIGIN}/dashboard/account#billing`,
    );
    expect(resolveNextUrl('/dashboard', ORIGIN).toString()).toBe(`${ORIGIN}/dashboard`);
  });

  it('never leaves the origin', () => {
    /*
     * The reason the sanitiser cannot simply be dropped now that `new URL` does the parsing:
     * `new URL('//evil.example', origin)` resolves to `https://evil.example`, so an
     * unsanitised protocol-relative value would redirect a freshly signed-in user — session
     * cookie and all — to somebody else's site.
     */
    for (const hostile of [
      '//evil.example/steal',
      '/\\evil.example/steal',
      'https://evil.example',
      'http://evil.example',
      '//evil.example',
      'javascript:alert(1)',
      '\\\\evil.example',
      'evil.example',
      '',
      '   ',
    ]) {
      const url = resolveNextUrl(hostile, ORIGIN);
      expect(url.origin, `hostile next: ${JSON.stringify(hostile)}`).toBe(ORIGIN);
      expect(url.pathname).toBe(AFTER_AUTH_PATH);
    }
  });

  it('rejects control characters that could split a header', () => {
    for (const smuggled of ['/dashboard\nSet-Cookie: a=b', '/dashboard\r\nLocation: /x', '/a\tb']) {
      expect(safeNextPath(smuggled)).toBe(AFTER_AUTH_PATH);
    }
  });

  it('falls back for a missing or non-string value', () => {
    for (const empty of [undefined, null, [], {} as unknown as string]) {
      expect(safeNextPath(empty as never)).toBe(AFTER_AUTH_PATH);
    }
    // An array is what `searchParams` yields for a repeated key; take the first.
    expect(safeNextPath(['/payment/checkout?plan=pro', '/evil'])).toBe(
      '/payment/checkout?plan=pro',
    );
  });

  it('honours an explicit fallback', () => {
    expect(safeNextPath('//evil.example', '/pricing')).toBe('/pricing');
    expect(resolveNextUrl(null, ORIGIN, '/pricing').toString()).toBe(`${ORIGIN}/pricing`);
  });
});

describe('the proxy and the auth forms agree', () => {
  it('share one implementation rather than two copies of the rule', async () => {
    /*
     * The bug existed because there were two copies and one had drifted, while a comment in
     * each claimed it mirrored the other. Identity of function reference is the only
     * assertion that a comment cannot make true by accident.
     */
    const shared = await import('@/components/auth/shared');
    const canonical = await import('@/lib/auth/next-path');
    expect(shared.safeNextPath).toBe(canonical.safeNextPath);
    expect(shared.AFTER_AUTH_PATH).toBe(canonical.AFTER_AUTH_PATH);

    const proxySource = (await import('node:fs')).readFileSync('proxy.ts', 'utf8');
    expect(proxySource).toContain("from '@/lib/auth/next-path'");
    // The old hand-rolled version, in any form, must not come back.
    expect(proxySource).not.toMatch(/url\.pathname\s*=\s*next/);
  });
});
