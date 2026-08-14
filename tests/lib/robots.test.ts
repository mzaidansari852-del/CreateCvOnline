import { describe, expect, it } from 'vitest';

import robots from '@/app/robots';
import { PRIVATE_PATH_PREFIXES } from '@/lib/site';

/**
 * robots.txt, and the group-precedence trap.
 *
 * A crawler obeys the single most specific group that names it and ignores every other
 * group in the file — it does not merge them. So a path listed only under `User-agent: *`
 * is not blocked for Googlebot when the file also contains a `User-agent: Googlebot`
 * group. Two hand-maintained lists drift, and the drift is invisible: the file reads as if
 * everything is covered, and the one crawler that matters quietly gets the weaker rules.
 *
 * That is exactly what shipped. `/template-preview/` — 56 bare copies of the sample CV
 * with no heading and no prose — was disallowed for every crawler except Google and Bing.
 */

function groups() {
  const rules = robots().rules;
  return Array.isArray(rules) ? rules : [rules];
}

const asList = (value: string | string[] | undefined): string[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

describe('robots.txt', () => {
  it('gives every named group the same disallow list as the wildcard', () => {
    const all = groups();
    const wildcard = all.find((rule) => asList(rule.userAgent).includes('*'));
    expect(wildcard, 'there must be a User-agent: * group').toBeDefined();

    const expected = [...asList(wildcard?.disallow)].sort();
    for (const rule of all) {
      if (rule === wildcard) continue;
      expect(
        [...asList(rule.disallow)].sort(),
        `${asList(rule.userAgent).join(', ')} must not receive weaker rules than *`,
      ).toEqual(expected);
    }
  });

  it('blocks every private prefix', () => {
    const wildcard = groups().find((rule) => asList(rule.userAgent).includes('*'));
    for (const prefix of PRIVATE_PATH_PREFIXES) {
      expect(asList(wildcard?.disallow)).toContain(`${prefix}/`);
    }
  });

  it('blocks the paths that are public but not worth indexing', () => {
    for (const rule of groups()) {
      const disallow = asList(rule.disallow);
      // Personal, unguessable share links.
      expect(disallow).toContain('/cv/');
      // The internal render target for the preview images.
      expect(disallow).toContain('/template-preview/');
    }
  });

  it('still allows the site itself', () => {
    for (const rule of groups()) {
      expect(asList(rule.allow)).toContain('/');
    }
    const disallow = asList(groups()[0]?.disallow);
    // A trailing-slash mistake here would take the whole site out of the index.
    expect(disallow).not.toContain('/');
  });

  it('gives every named group the same allow list as the wildcard', () => {
    const all = groups();
    const wildcard = all.find((rule) => asList(rule.userAgent).includes('*'));
    const expected = [...asList(wildcard?.allow)].sort();
    for (const rule of all) {
      if (rule === wildcard) continue;
      expect(
        [...asList(rule.allow)].sort(),
        `${asList(rule.userAgent).join(', ')} must not receive different rules than *`,
      ).toEqual(expected);
    }
  });

  it('lets crawlers fetch the Open Graph card without opening the rest of /api', () => {
    for (const rule of groups()) {
      // `/api/` is a private prefix, so the share card of every page without a
      // committed preview image was unfetchable. Google and Bing resolve
      // Allow/Disallow conflicts by specificity, so the longer rule wins here only.
      expect(asList(rule.allow)).toContain('/api/og');
      expect(asList(rule.disallow)).toContain('/api/');
      // Nothing else under /api may be opened up by a broader allow.
      expect(asList(rule.allow)).not.toContain('/api/');
      expect(asList(rule.allow)).not.toContain('/api');
    }
  });

  it('names Googlebot and Bingbot explicitly', () => {
    const named = groups().flatMap((rule) => asList(rule.userAgent));
    expect(named).toContain('Googlebot');
    expect(named).toContain('Bingbot');
  });

  it('advertises the sitemap and a bare host', () => {
    const output = robots();
    expect(output.sitemap).toMatch(/^https?:\/\/.+\/sitemap\.xml$/);
    // The Host directive takes a hostname, not a URL.
    expect(output.host).not.toMatch(/^https?:\/\//);
  });
});
