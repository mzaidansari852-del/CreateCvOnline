import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The Content Security Policy must name every gateway the checkout can offer.
 *
 * This test exists because of a real outage. Paddle shipped with a valid API key, valid
 * price ids and a matching client token — `/api/payments/paddle/status` reported every
 * field green — and the overlay still refused to open, because `next.config.ts` listed
 * PayPal's origins and not Paddle's. The browser blocked `cdn.paddle.com` before a line of
 * our code ran, so nothing server-side could detect it and the customer saw only "the
 * payment window could not load".
 *
 * A gateway is not integrated until its origins are in this header. Reading the config as
 * text rather than importing it keeps the assertion on the literal that actually ships.
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
   * `script-src` is the one that fails loudest and `frame-src` the one that fails most
   * quietly: without it the overlay opens as an empty rectangle, which reads as a broken
   * page rather than a blocked origin.
   */
  const overlayDirectives = ['script-src', 'frame-src', 'connect-src', 'img-src', 'style-src'];

  it.each(overlayDirectives)('allows Paddle in %s', (name) => {
    expect(directive(name)).toContain('paddle.com');
  });

  // PayPal needs no `style-src`: its flow is a full-page redirect, not a styled overlay.
  it.each(['script-src', 'frame-src', 'connect-src', 'img-src'])(
    'allows PayPal in %s',
    (name) => {
      expect(directive(name)).toContain('paypal');
    },
  );

  it('keeps the Paddle allowance scoped to a domain Paddle controls', () => {
    // A wildcard is acceptable here; a bare `https:` or `*` would not be.
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
