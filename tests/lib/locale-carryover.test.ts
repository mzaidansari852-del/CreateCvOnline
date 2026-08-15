import { describe, expect, it } from 'vitest';

import {
  LOCALE_COOKIE,
  localeFromAcceptLanguage,
  parseLocale,
  resolveLocale,
} from '@/lib/i18n/resolve';
import { alternatesFor, localeOf, normalisePath } from '@/lib/i18n/locales';

/**
 * Carrying a language from the marketing site into the signed-in app.
 *
 * The marketing pages know their language from the URL; `/dashboard`, `/login` and
 * `/register` are one route each and cannot. This is the seam between the two, and it has
 * two failure modes that are easy to write and hard to notice:
 *
 *   1. Resetting a saved preference from a path that does not express a language.
 *   2. Letting a *prefetch* count as the user reading a page.
 *
 * Both were written and both were caught in a browser rather than here, so both now have
 * a test. The proxy logic itself is asserted through its inputs — `alternatesFor` and
 * `localeOf` — because the proxy needs a `NextRequest` and the interesting part is the
 * decision, not the plumbing.
 */

describe('resolving the app language', () => {
  it('prefers the saved account setting over the cookie', () => {
    // The account is the durable answer: it follows the user to a new device, where the
    // cookie does not exist at all.
    expect(resolveLocale({ profileLocale: 'de', cookieLocale: 'fr' })).toBe('de');
  });

  it('falls back to the cookie when there is no profile yet', () => {
    // This is the sign-up case, and the whole reason the cookie exists.
    expect(resolveLocale({ profileLocale: null, cookieLocale: 'fr' })).toBe('fr');
  });

  it('falls back to English rather than throwing on a bad value', () => {
    /*
     * The cookie is client-writable and a profile written before `locale` was an enum may
     * hold anything. An unrecognised value must degrade to English — the worst outcome of
     * a hand-edited cookie should be an English page, not a 500 on every signed-in route.
     */
    expect(resolveLocale({ profileLocale: 'klingon', cookieLocale: 'nonsense' })).toBe('en');
    expect(resolveLocale({})).toBe('en');
    expect(parseLocale('../../etc/passwd')).toBeNull();
    expect(parseLocale('')).toBeNull();
  });

  it('reads a browser language when nothing else is known', () => {
    expect(localeFromAcceptLanguage('de-AT,de;q=0.9,en;q=0.8')).toBe('de');
    expect(localeFromAcceptLanguage('fr-CA')).toBe('fr');
    expect(localeFromAcceptLanguage('es-ES,es;q=0.9')).toBeNull();
    expect(localeFromAcceptLanguage(null)).toBeNull();
  });
});

describe('which paths may set the language cookie', () => {
  it.each([
    ['/templates', 'en'],
    ['/pricing', 'en'],
    ['/fr/modeles-de-cv', 'fr'],
    ['/fr/tarifs', 'fr'],
    ['/de/lebenslauf-vorlagen', 'de'],
    ['/de/preise', 'de'],
  ])('%s expresses %s', (path, locale) => {
    expect(alternatesFor(normalisePath(path))).not.toBeNull();
    expect(localeOf(path)).toBe(locale);
  });

  it.each(['/dashboard', '/dashboard/cvs', '/login', '/register', '/dashboard/settings'])(
    '%s expresses no language and must not write the cookie',
    (path) => {
      /*
       * The bug this prevents: `localeOf('/dashboard')` is `'en'`, because the dashboard
       * carries no locale prefix. A proxy that wrote `localeOf(pathname)` unconditionally
       * would therefore reset a French user's preference to English every time they opened
       * their own dashboard — and the symptom would look like "the language setting does
       * not save", which is nearly impossible to diagnose from a bug report.
       */
      expect(alternatesFor(normalisePath(path))).toBeNull();
    },
  );

  it('names the cookie something that cannot collide with the session', () => {
    expect(LOCALE_COOKIE).toBe('cvo_locale');
  });
});

describe('the proxy only reacts to real navigations', () => {
  /*
   * Next.js prefetches every link in the viewport. Those prefetches reach the proxy like
   * any other request, so a French page linking to an English one rewrote the visitor's
   * language before they had clicked anything. `sec-fetch-dest` distinguishes them: the
   * browser sets it, page script cannot forge it, and it is `empty` for RSC fetches.
   *
   * Asserted against the proxy source, because reproducing it properly needs a browser —
   * `curl` never triggered it, which is exactly why it survived the first round of checks.
   */
  it('guards the cookie write on sec-fetch-dest', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const proxy = readFileSync(join(process.cwd(), 'proxy.ts'), 'utf8');

    expect(proxy).toContain('sec-fetch-dest');
    expect(proxy).toMatch(/isNavigation\s*&&/);
    // And the write itself is still conditional on the path expressing a language.
    expect(proxy).toContain('alternatesFor(normalisePath(pathname))');
  });
});
