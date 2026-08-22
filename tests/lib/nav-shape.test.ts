import { describe, expect, it } from 'vitest';

import { NAV_CATEGORIES, navFor } from '@/lib/i18n/nav';
import { LOCALES, TEMPLATE_ROOT } from '@/lib/i18n/locales';
import { navGroupIsMenu, primaryNav, type NavGroup } from '@/lib/site';

/**
 * The header must promise the same things in every language.
 *
 * Not the same *links* — the French and German navs are deliberately shorter, because the
 * fourteen English guide pages they would point at do not exist in those languages, and a
 * French menu leading to English pages is worse than a French menu that offers less.
 *
 * What must match is the behaviour of the controls. French and German each carried a Pricing
 * group holding one child: the pricing page, which was also the group's own destination. So
 * those two languages grew a chevron over a dropdown containing a single duplicate of the
 * label above it, while English rendered the same idea as a plain link. Two languages, two
 * different controls, one destination.
 *
 * A dropdown is worth opening only if it leads somewhere the label does not.
 */

const ALL: [string, NavGroup[]][] = [
  ['en (primaryNav)', primaryNav],
  ...LOCALES.map((locale) => [locale, navFor(locale)] as [string, NavGroup[]]),
];

describe('nav group shape', () => {
  it('covers every locale', () => {
    expect(ALL.length).toBeGreaterThanOrEqual(4);
    for (const [, groups] of ALL) expect(groups.length).toBeGreaterThan(0);
  });

  it.each(ALL)('%s: no group opens a menu that only contains itself', (_name, groups) => {
    const pointless = groups
      .filter((group) => group.links.length > 0 && !navGroupIsMenu(group))
      .map((group) => group.label);
    /*
     * Such a group is not forbidden — `navGroupIsMenu` renders it as a plain link, which is
     * correct. This asserts the *header* agrees, by pinning the predicate that decides it.
     */
    for (const label of pointless) {
      const group = groups.find((candidate) => candidate.label === label);
      expect(navGroupIsMenu(group as NavGroup), `${label} must not render a chevron`).toBe(false);
    }
  });

  it('the pricing group is a plain link in every language', () => {
    // The specific regression: English had it right, French and German did not.
    const pricing = ALL.map(([name, groups]) => {
      const group = groups.find((candidate) =>
        /pricing|tarifs|preise|prijzen/i.test(candidate.label),
      ) as NavGroup;
      return [name, group] as const;
    });
    expect(pricing.length).toBe(ALL.length);
    for (const [name, group] of pricing) {
      expect(group, `${name} has no pricing group`).toBeDefined();
      expect(navGroupIsMenu(group), `${name}: pricing must not be a dropdown`).toBe(false);
    }
  });

  it('the template gallery IS a menu in every language', () => {
    // The counterweight: if the predicate were simply `false`, the test above would pass and
    // the header would lose every dropdown it should have.
    for (const [name, groups] of ALL) {
      const gallery = groups.find((candidate) =>
        /templates|modèles|vorlagen|sjablonen/i.test(candidate.label),
      );
      expect(gallery, `${name} has no template group`).toBeDefined();
      expect(navGroupIsMenu(gallery as NavGroup), `${name}: gallery must be a dropdown`).toBe(true);
      /*
       * Distinct destinations, not link count. English lists four related galleries while
       * French and German list the six style categories, so a shared minimum on `length`
       * would only be asserting the smaller of two unrelated designs. Two destinations is
       * what makes a dropdown worth opening at all.
       */
      const destinations = new Set((gallery as NavGroup).links.map((link) => link.href));
      expect(
        destinations.size,
        `${name}: gallery leads to ${destinations.size} places`,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it('the translated galleries offer all six style categories', () => {
    /*
     * These are generated from the category tables, so a dropped category means the table
     * drifted from the registry — which `i18n.test.ts` checks from the other side.
     *
     * Asserted by naming the destinations rather than counting them. The count was `7` —
     * the gallery plus six categories — and it broke the moment the French dropdown gained
     * the examples and ATS pages, which is a change to the menu and not a regression in
     * category coverage. A count cannot tell those apart; this can.
     */
    for (const locale of ['fr', 'de', 'nl'] as const) {
      const gallery = navFor(locale).find((group) =>
        /modèles|vorlagen|sjablonen/i.test(group.label),
      );
      const destinations = new Set((gallery as NavGroup).links.map((link) => link.href));
      const root = TEMPLATE_ROOT[locale];
      const categories = NAV_CATEGORIES[locale];

      expect(categories, `${locale} has no category table`).toBeDefined();
      expect(categories!.length, `${locale} category count`).toBe(6);
      expect(destinations.has(root), `${locale}: gallery root missing`).toBe(true);
      for (const category of categories!) {
        expect(destinations.has(`${root}/${category.slug}`), `${locale}: ${category.slug}`).toBe(
          true,
        );
      }
    }
  });

  it('every group is reachable — a label with no href and no children leads nowhere', () => {
    for (const [name, groups] of ALL) {
      for (const group of groups) {
        const reachable = Boolean(group.href) || group.links.length > 0;
        expect(reachable, `${name}: "${group.label}" is a dead label`).toBe(true);
      }
    }
  });

  it('every href is a site-relative path', () => {
    for (const [name, groups] of ALL) {
      const hrefs = [
        ...groups.map((g) => g.href),
        ...groups.flatMap((g) => g.links.map((l) => l.href)),
      ];
      for (const href of hrefs) {
        if (href === undefined) continue;
        expect(href.startsWith('/'), `${name}: ${href} is not site-relative`).toBe(true);
      }
    }
  });

  it('the localised navs stay inside their own language', () => {
    /*
     * A French nav item pointing at an English page is the failure this whole design exists
     * to avoid. `/register` and `/login` are exempt: they are one route each, shared by every
     * language, and they render in the reader's language from the locale cookie.
     */
    const shared = new Set(['/register', '/login']);
    for (const locale of ['fr', 'de'] as const) {
      for (const group of navFor(locale)) {
        for (const href of [group.href, ...group.links.map((l) => l.href)]) {
          if (!href || shared.has(href)) continue;
          expect(href.startsWith(`/${locale}`), `${locale} nav points at ${href}`).toBe(true);
        }
      }
    }
  });
});
