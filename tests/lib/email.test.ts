import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { __resetServerEnvCache } from '@/lib/env';
import { createUnsubscribeToken, verifyUnsubscribeToken } from '@/lib/email/unsubscribe';
import { createRenderToken } from '@/lib/pdf/token';
import { renderEmail } from '@/lib/email/render';
import { EMAIL_TEMPLATES, emailTemplate, type EmailContext } from '@/lib/email/templates';
import { LOCALES } from '@/lib/i18n/locales';

/**
 * Announcement e-mail.
 *
 * Two things here can cause real harm and are worth pinning: an unsubscribe link that does
 * not work, and prose that escapes into markup.
 *
 * The first because a reader who cannot get off the list reports the message as spam
 * instead, and enough of those cost the domain its ability to deliver password resets and
 * payment receipts. The unsubscribe path is the most safety-critical part of a marketing
 * e-mail, not the least.
 */

const ORIGINAL = { ...process.env };

beforeEach(() => {
  process.env.PDF_RENDER_SECRET = 'test-secret-for-signing-tokens-only';
  __resetServerEnvCache();
});

afterEach(() => {
  process.env = { ...ORIGINAL };
  __resetServerEnvCache();
});

describe('unsubscribe tokens', () => {
  it('round-trips the account it names', () => {
    const token = createUnsubscribeToken('user-abc');
    expect(verifyUnsubscribeToken(token)).toBe('user-abc');
  });

  it('refuses a token that has been tampered with', () => {
    const token = createUnsubscribeToken('user-abc');
    expect(verifyUnsubscribeToken(`${token}x`)).toBeNull();
    expect(verifyUnsubscribeToken(token.replace(/^./, 'A'))).toBeNull();
  });

  it('refuses nonsense without throwing', () => {
    for (const bad of [null, undefined, '', 'abc', '...', 'a.b.c']) {
      expect(verifyUnsubscribeToken(bad)).toBeNull();
    }
  });

  it('refuses a token signed with a different secret', () => {
    const token = createUnsubscribeToken('user-abc');
    process.env.PDF_RENDER_SECRET = 'a-completely-different-secret-value';
    __resetServerEnvCache();
    expect(verifyUnsubscribeToken(token)).toBeNull();
  });

  /*
   * The two token families share a signing key, so they must not share a token space. A
   * print token grants read access to a CV; if it were accepted here — or the reverse —
   * one capability would have been silently widened into another.
   */
  it('does not accept a print token', () => {
    expect(verifyUnsubscribeToken(createRenderToken('user-abc', 'cv-1'))).toBeNull();
  });

  it('does not expire, because an old e-mail must still work', () => {
    // No timestamp in the payload is the mechanism; asserting the shape keeps it that way.
    const token = createUnsubscribeToken('user-abc');
    const payload = Buffer.from(token.slice(0, token.lastIndexOf('.')), 'base64url').toString();
    expect(payload).toBe('unsubscribe.user-abc');
  });
});

/* -------------------------------------------------------------------------- */
/* Rendering                                                                   */
/* -------------------------------------------------------------------------- */

function render(overrides: Partial<Parameters<typeof renderEmail>[0]> = {}) {
  return renderEmail({
    body: {
      subject: 'Subject',
      heading: 'Heading',
      paragraphs: ['Hi Sara,', 'Something happened.'],
      cta: 'Open',
      footnote: 'A footnote.',
    },
    locale: 'en',
    siteName: 'CreateCVOnline',
    siteUrl: 'https://example.test',
    ctaUrl: 'https://example.test/pricing',
    unsubscribeUrl: 'https://example.test/unsubscribe?token=abc',
    ...overrides,
  });
}

describe('rendering', () => {
  it('always carries the unsubscribe link in both parts', () => {
    const email = render();
    expect(email.html).toContain('https://example.test/unsubscribe?token=abc');
    // The text part is what some clients and most filters read. A link only in the HTML is
    // an unsubscribe half the recipients cannot find.
    expect(email.text).toContain('https://example.test/unsubscribe?token=abc');
  });

  it('produces a real text alternative, not a stripped copy of the HTML', () => {
    const email = render();
    expect(email.text).not.toContain('<');
    expect(email.text).toContain('Heading');
    expect(email.text).toContain('Something happened.');
    expect(email.text).toContain('Open: https://example.test/pricing');
  });

  /*
   * The body of a plain announcement is typed by an admin into a textarea. It is not
   * trusted input in the security sense — an admin can already do worse — but an ampersand
   * in an ordinary sentence must not break the document, and a stray angle bracket must not
   * silently swallow the rest of the e-mail.
   */
  it('escapes prose rather than letting it become markup', () => {
    const email = render({
      body: {
        subject: 'S',
        heading: 'Tom & Jerry <b>',
        paragraphs: ['5 < 6 & "quoted"'],
        cta: 'Go',
        footnote: null,
      },
    });
    expect(email.html).toContain('Tom &amp; Jerry &lt;b&gt;');
    expect(email.html).toContain('5 &lt; 6 &amp; &quot;quoted&quot;');
    expect(email.html).not.toContain('<b>');
  });

  it('turns newlines in a paragraph into line breaks', () => {
    const email = render({
      body: { subject: 'S', heading: 'H', paragraphs: ['one\ntwo'], cta: 'Go', footnote: null },
    });
    expect(email.html).toContain('one<br />two');
  });

  it('omits the footnote block entirely when there is none', () => {
    const email = render({
      body: { subject: 'S', heading: 'H', paragraphs: ['p'], cta: 'Go', footnote: null },
    });
    expect(email.text).not.toContain('undefined');
    expect(email.text.endsWith('\n')).toBe(false);
  });

  it('sets the document language so screen readers pronounce it correctly', () => {
    expect(render({ locale: 'de' }).html).toContain('<html lang="de">');
  });
});

/* -------------------------------------------------------------------------- */
/* Templates                                                                   */
/* -------------------------------------------------------------------------- */

const context: EmailContext = {
  name: 'Sara',
  siteName: 'CreateCVOnline',
  siteUrl: 'https://example.test',
  ctaUrl: 'https://example.test/pricing',
  offer: {
    planName: 'Lifetime',
    price: '6.00',
    listPrice: '69.00',
    saving: '63.00',
    percent: 91,
    currency: 'USD',
    seats: 1000,
  },
  custom: { subject: 'Custom subject', heading: 'Custom heading', body: 'Custom body.' },
};

describe('templates', () => {
  /*
   * Every template in every language. The failure this catches is a template added later
   * with three languages filled in and the fourth left undefined — which typechecks if the
   * record is built loosely, and reaches a recipient as a blank e-mail.
   */
  it('renders in all four languages with a subject, heading and call to action', () => {
    for (const template of EMAIL_TEMPLATES) {
      for (const locale of LOCALES) {
        const body = template.render[locale](context);
        expect(body.subject.trim(), `${template.id}/${locale} subject`).not.toBe('');
        expect(body.heading.trim(), `${template.id}/${locale} heading`).not.toBe('');
        expect(body.cta.trim(), `${template.id}/${locale} cta`).not.toBe('');
        expect(body.paragraphs.length, `${template.id}/${locale} paragraphs`).toBeGreaterThan(0);
        expect(template.path[locale], `${template.id}/${locale} path`).toMatch(/^\//);
      }
    }
  });

  it('never leaves an empty paragraph where a value was missing', () => {
    for (const template of EMAIL_TEMPLATES) {
      for (const locale of LOCALES) {
        const body = template.render[locale]({ ...context, offer: null });
        for (const paragraph of body.paragraphs) {
          expect(paragraph.trim(), `${template.id}/${locale}`).not.toBe('');
        }
      }
    }
  });

  /* `Hi Sara,` with a name; `Hi,` without. Never `Hi ,`. */
  it('greets correctly with and without a name', () => {
    const withName = emailTemplate('offer')!.render.en(context);
    expect(withName.paragraphs[0]).toBe('Hi Sara,');

    const without = emailTemplate('offer')!.render.en({ ...context, name: '' });
    expect(without.paragraphs[0]).toBe('Hi,');
    expect(without.paragraphs[0]).not.toContain(' ,');
  });

  it('quotes the offer price, the list price and the saving', () => {
    const body = emailTemplate('offer')!.render.en(context);
    const all = [body.subject, body.heading, ...body.paragraphs, body.cta].join(' ');
    expect(all).toContain('$6.00');
    expect(all).toContain('$69.00');
    expect(all).toContain('91%');
    expect(all).toContain('1,000');
  });

  it('marks the price-quoting templates as needing an offer', () => {
    expect(emailTemplate('offer')?.requiresOffer).toBe(true);
    expect(emailTemplate('offer-ending')?.requiresOffer).toBe(true);
    // These two write their own copy and are sendable at any time.
    expect(emailTemplate('plain')?.requiresOffer).toBe(false);
    expect(emailTemplate('product-update')?.requiresOffer).toBe(false);
  });

  it('has no duplicate ids', () => {
    const ids = EMAIL_TEMPLATES.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
