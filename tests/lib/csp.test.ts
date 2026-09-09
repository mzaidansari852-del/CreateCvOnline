import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The Content Security Policy must name every origin the checkout actually loads — and no
 * others.
 *
 * This test exists because of a real outage. Paddle shipped with a valid API key, valid
 * price ids and a matching client token — its status endpoint reported every field green —
 * and the overlay still refused to open, because `next.config.ts` listed PayPal's origins
 * and not Paddle's. The browser blocked `cdn.paddle.com` before a line of our code ran, so
 * nothing server-side could detect it and the customer saw only "the payment window could
 * not load".
 *
 * ## Why there are now no payment origins to assert
 *
 * Polar hosts its checkout on its own site. The customer is redirected there, so nothing
 * of Polar's is fetched, framed or called from this origin, and the policy needs no
 * payment grant at all. That is a stronger position than the one this test was written to
 * defend, not a weaker one — the class of failure above cannot happen to an origin that
 * loads nothing.
 *
 * So the assertions invert. The live requirement is that the *removed* gateways are gone:
 * a CSP that still names a gateway nobody uses is a standing permission for a third party
 * to run scripts on the checkout — quiet, harmless-looking, and exactly the kind of thing
 * that survives for years because nothing fails. PayPal was removed on that reasoning and
 * Paddle follows it.
 *
 * If a future change embeds a checkout in-page rather than redirecting, this file is where
 * the requirement to add its origins back belongs.
 *
 * Reading the config as text rather than importing it keeps the assertion on the literal
 * that actually ships.
 */

const config = readFileSync(resolve(process.cwd(), 'next.config.ts'), 'utf8');

function directive(name: string): string {
  const match = new RegExp('`' + name + ' ([^`]*)`').exec(config);
  const value = match?.[1];
  if (value === undefined) throw new Error(`CSP is missing the "${name}" directive entirely.`);
  return value;
}

describe('Content Security Policy', () => {
  /*
   * The directives a third-party payment widget would need if one were ever embedded.
   * `script-src` is the one that fails loudest and `frame-src` the one that fails most
   * quietly: without it an overlay opens as an empty rectangle, which reads as a broken
   * page rather than a blocked origin.
   */
  const overlayDirectives = ['script-src', 'frame-src', 'connect-src', 'img-src', 'style-src'];

  it.each(overlayDirectives)('no longer names the removed Paddle gateway in %s', (name) => {
    expect(directive(name)).not.toContain('paddle');
  });

  it.each(overlayDirectives)('no longer names the removed PayPal gateway in %s', (name) => {
    expect(directive(name)).not.toContain('paypal');
  });

  /*
   * The redirect to Polar is a top-level navigation, which no directive here restricts.
   * `form-action 'self'` governs form submissions and must stay `'self'`: widening it is
   * the change someone would make while debugging a checkout redirect that was never
   * blocked in the first place.
   */
  it('does not need — and does not grant — a Polar origin', () => {
    for (const name of overlayDirectives) {
      expect(directive(name)).not.toContain('polar');
    }
    expect(directive('form-action')).toBe("'self'");
  });

  it('keeps every remaining allowance scoped to a named domain', () => {
    // A wildcard subdomain is acceptable; a bare `https:` or `*` would not be.
    for (const name of overlayDirectives) {
      expect(directive(name)).not.toMatch(/(^|\s)https:(\s|$)/);
      expect(directive(name)).not.toMatch(/(^|\s)\*(\s|$)/);
    }
  });

  it('still refuses to be framed and still blocks plugins', () => {
    expect(directive('frame-ancestors')).toBe("'none'");
    expect(directive('object-src')).toBe("'none'");
    expect(directive('base-uri')).toBe("'self'");
  });
});
