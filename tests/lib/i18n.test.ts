import { existsSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import sitemap from '@/app/sitemap';
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_META,
  TRANSLATED_PATHS,
  alternatesFor,
  localeOf,
  normalisePath,
  templatePath,
} from '@/lib/i18n/locales';
import { pageMetadata } from '@/lib/seo/metadata';
import { absoluteUrl } from '@/lib/site';
import { FR, FR_CATEGORY_SLUG, categoryFromFrenchSlug } from '@/app/fr/fr-copy';
import { DE, DE_CATEGORY_SLUG, categoryFromGermanSlug } from '@/app/de/de-copy';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '@/lib/cv/template-registry';
import { hasPreview } from '@/components/cv/TemplateImage';
import { createSampleCV } from '@/lib/cv/defaults';
import { localiseCv, sectionLabel } from '@/lib/i18n/cv-labels';
import { BUILT_IN_SECTION_IDS } from '@/types/cv';

/**
 * The French site.
 *
 * The failure mode being guarded against is not "the French pages are missing" — that is
 * obvious. It is that they are present and silently uncounted: `hreflang` annotations that
 * Google discards because they are not reciprocal, a French page pointing at an English
 * one that does not point back, or a translated path in the map that resolves to a 404.
 * Each of those looks like a working international site right up until it earns nothing.
 */

describe('locale model', () => {
  it('treats trailing slashes as the same page', () => {
    expect(normalisePath('/fr/')).toBe('/fr');
    expect(normalisePath('fr')).toBe('/fr');
    expect(normalisePath('/')).toBe('/');
    expect(normalisePath('')).toBe('/');
  });

  it('reads the locale off the prefix', () => {
    expect(localeOf('/fr')).toBe('fr');
    expect(localeOf('/fr/modeles-de-cv')).toBe('fr');
    expect(localeOf('/de')).toBe('de');
    expect(localeOf('/de/lebenslauf-vorlagen')).toBe('de');
    expect(localeOf('/templates')).toBe('en');
    // `/design-tips` starts with `de`; the prefix has to be a whole segment.
    expect(localeOf('/design-tips')).toBe('en');
    // `/french-cv-tips` starts with the same three letters and is an English page.
    expect(localeOf('/french-cv-tips')).toBe('en');
    expect(localeOf('/')).toBe(DEFAULT_LOCALE);
  });

  it('resolves alternates from either side', () => {
    for (const group of Object.values(TRANSLATED_PATHS)) {
      for (const locale of LOCALES) {
        expect(alternatesFor(group[locale]), group[locale]).toEqual(group);
      }
    }
  });

  it('returns nothing for a page with no translation', () => {
    // Deliberately not `/pricing`: that one is translated now. The point of the assertion
    // is that an untranslated page stays untranslated, so it has to name pages that are.
    expect(alternatesFor('/blog')).toBeNull();
    expect(alternatesFor('/about')).toBeNull();
    expect(alternatesFor('/cv-for/nurse')).toBeNull();
  });
});

describe('hreflang', () => {
  it('is reciprocal for every translated page', () => {
    // Google discards a cluster whose annotations disagree, which is indistinguishable
    // from having none — except that it looks like the work was done.
    for (const group of Object.values(TRANSLATED_PATHS)) {
      for (const locale of LOCALES) {
        const meta = pageMetadata({
          title: 'x',
          description: 'y',
          path: group[locale],
          locale,
        });
        const languages = meta.alternates?.languages as Record<string, string> | undefined;
        expect(languages, `${group[locale]} has no hreflang`).toBeTruthy();

        for (const other of LOCALES) {
          expect(languages![LOCALE_META[other].tag]).toBe(absoluteUrl(group[other]));
        }
        expect(languages!['x-default']).toBe(absoluteUrl(group[DEFAULT_LOCALE]));
      }
    }
  });

  it('is absent on pages that are only in English', () => {
    const meta = pageMetadata({ title: 'x', description: 'y', path: '/about' });
    expect(meta.alternates?.languages).toBeUndefined();
  });

  it('sets og:locale to match the page language', () => {
    const french = pageMetadata({ title: 'x', description: 'y', path: '/fr', locale: 'fr' });
    const english = pageMetadata({ title: 'x', description: 'y', path: '/' });
    expect(french.openGraph?.locale).toBe('fr_FR');
    expect(english.openGraph?.locale).toBe('en_US');
  });

  it('keeps the canonical pointing at the page itself, not at the English one', () => {
    // A French page canonicalising to its English twin is the classic way to build an
    // international site that never ranks: it tells Google the French page is a duplicate.
    const meta = pageMetadata({ title: 'x', description: 'y', path: '/fr', locale: 'fr' });
    expect(meta.alternates?.canonical).toBe(absoluteUrl('/fr'));
  });
});

describe('translated paths resolve to real pages', () => {
  const APP = path.join(process.cwd(), 'app');

  /** Every path in the map must be served by a route file that exists on disk. */
  function routeExists(urlPath: string): boolean {
    const clean = normalisePath(urlPath);
    if (clean === '/') return existsSync(path.join(APP, '(marketing)', 'page.tsx'));

    const segments = clean.slice(1).split('/');
    // Try the literal directory first, then a dynamic segment at the last position.
    const literal = path.join(APP, ...segments, 'page.tsx');
    if (existsSync(literal)) return true;

    const groupLiteral = path.join(APP, '(marketing)', ...segments, 'page.tsx');
    if (existsSync(groupLiteral)) return true;

    const parent = segments.slice(0, -1);
    for (const base of [path.join(APP, ...parent), path.join(APP, '(marketing)', ...parent)]) {
      if (!existsSync(base)) continue;
      const dynamic = ['[slug]', '[profession]', '[role]'].map((token) =>
        path.join(base, token, 'page.tsx'),
      );
      if (dynamic.some(existsSync)) return true;
    }
    return false;
  }

  it('has a route file behind every entry', () => {
    const missing: string[] = [];
    for (const group of Object.values(TRANSLATED_PATHS)) {
      for (const locale of LOCALES) {
        if (!routeExists(group[locale])) missing.push(group[locale]);
      }
    }
    // An hreflang pointing at a 404 is worse than no annotation at all.
    expect(missing).toEqual([]);
  });
});

describe('French copy', () => {
  it('covers every template category', () => {
    for (const category of TEMPLATE_CATEGORIES) {
      expect(FR.categories[category.id], category.id).toBeTruthy();
      expect(FR_CATEGORY_SLUG[category.id]).toBeTruthy();
      expect(categoryFromFrenchSlug(FR_CATEGORY_SLUG[category.id])).toBe(category.id);
    }
  });

  it('uses French slugs, not the English ids with a prefix', () => {
    // `moderne`, not `modern`. The slug is the part of the URL a searcher reads, and the
    // whole reason for a French site is that the French word is the query.
    const englishIds = TEMPLATE_CATEGORIES.map((category) => category.id as string);
    const overlap = Object.values(FR_CATEGORY_SLUG).filter(
      (slug) => englishIds.includes(slug) && slug !== 'ats',
    );
    expect(overlap).toEqual([]);
  });

  it('is actually in German', () => {
    const headlines = [
      DE.home.lede,
      DE.gallery.heading,
      DE.gallery.lede,
      ...TEMPLATE_CATEGORIES.map((category) => DE.categories[category.id].heading),
      ...TEMPLATE_CATEGORIES.map((category) => DE.categories[category.id].lede),
    ];
    /*
     * German-only orthography, a function word English marketing copy would not use, or a
     * noun that is unambiguously German. The third case is needed because a headline like
     * "Lebenslauf-Vorlagen" is plainly German and contains neither an umlaut nor a
     * function word — the risk being guarded against is a section left in English, not a
     * headline that happens to be short.
     */
    const germanMarker =
      /[äöüß]|\b(der|die|das|und|für|mit|Ihre|Ihren|eine|einen|nicht)\b|Lebenslauf|Vorlage|Bewerbung/i;
    for (const line of headlines) {
      expect(germanMarker.test(line), `not German: ${line}`).toBe(true);
    }
  });

  it('says "Lebenslauf" rather than "CV" in the terms it is targeting', () => {
    // `Lebenslauf` is the query. `CV` is understood in Germany and is not what is typed.
    expect(DE.gallery.metaTitle.toLowerCase()).toContain('lebenslauf');
    expect(DE.gallery.heading.toLowerCase()).toContain('lebenslauf');
    expect(DE.home.metaTitle.toLowerCase()).toContain('lebenslauf');
  });

  it('covers every category in German too', () => {
    for (const category of TEMPLATE_CATEGORIES) {
      expect(DE.categories[category.id], category.id).toBeTruthy();
      expect(categoryFromGermanSlug(DE_CATEGORY_SLUG[category.id])).toBe(category.id);
    }
  });

  it('is actually in French', () => {
    /*
     * A cheap smoke test for the real risk, which is not a mistranslation but a section
     * quietly left in English when the copy was assembled. Every French headline should
     * contain at least one character or word that English marketing copy would not.
     */
    const headlines = [
      FR.home.heading,
      FR.home.lede,
      FR.gallery.heading,
      FR.gallery.lede,
      ...TEMPLATE_CATEGORIES.map((category) => FR.categories[category.id].heading),
      ...TEMPLATE_CATEGORIES.map((category) => FR.categories[category.id].lede),
    ];
    const frenchMarker = /[àâçéèêëîïôûùüœ’]|\b(de|des|du|le|la|les|un|une|vos|votre|pour)\b/i;
    for (const line of headlines) {
      expect(frenchMarker.test(line), `not French: ${line}`).toBe(true);
    }
  });

  it('says "modèle" rather than "template" in the terms it is targeting', () => {
    // `template` is the English word; `modèle de CV` is the query with the demand behind
    // it. If the headline drifts back to "template" the page is competing for nothing.
    expect(FR.gallery.metaTitle.toLowerCase()).toContain('modèle');
    expect(FR.gallery.heading.toLowerCase()).toContain('modèle');
    expect(FR.home.metaTitle.toLowerCase()).toContain('cv');
  });
});

describe('the French pages show a French document', () => {
  const previewDir = (locale: string) => path.join(process.cwd(), 'public', 'previews', locale);

  it.each(['fr', 'de'] as const)('has a %s image for every template', (locale) => {
    /*
     * The gallery shows pictures, not live DOM. So a French page without a French image set
     * is sixty-one photographs of a CV headed `WORK EXPERIENCE` sitting underneath French
     * copy — the copy can be perfect and the product still looks English, because the
     * picture *is* the product. This is the assertion that was missing when the first
     * French release shipped.
     */
    const missing = TEMPLATES.filter(
      (template) =>
        hasPreview(template.slug) &&
        !existsSync(path.join(previewDir(locale), `${template.slug}-card.webp`)),
    ).map((template) => template.slug);
    expect(missing, `run \`npm run previews\` to regenerate the ${locale} set`).toEqual([]);
  });

  it('translates the section headings a template prints', () => {
    const english = createSampleCV();
    const french = localiseCv(english, 'fr');

    // `createSampleCV` renames it to "Experience"; what matters is that it is English
    // before and French after, not the exact wording of the default.
    expect(english.sections.find((section) => section.id === 'experience')?.label).toBe(
      'Experience',
    );
    expect(french.sections.find((section) => section.id === 'experience')?.label).toBe(
      'Expérience professionnelle',
    );
    // The content itself is a separate question and must be left alone.
    expect(french.summary).toBe(english.summary);
    expect(french.experience).toBe(english.experience);
  });

  it.each(['fr', 'de'] as const)('has a %s label for every built-in section', (locale) => {
    // A section with no translation prints its English heading in the middle of a
    // translated document, which is exactly the defect this file exists to prevent.
    const missing = BUILT_IN_SECTION_IDS.filter((id) => !sectionLabel(id, locale));
    expect(missing).toEqual([]);
  });

  it('leaves English pages untouched', () => {
    const cv = createSampleCV();
    expect(localiseCv(cv, 'en')).toBe(cv);
  });
});

describe('sitemap', () => {
  const entries = sitemap();
  const byUrl = new Map(entries.map((entry) => [entry.url, entry]));

  it('lists every translated landing page, with its alternates', () => {
    for (const group of Object.values(TRANSLATED_PATHS)) {
      for (const locale of LOCALES) {
        if (locale === DEFAULT_LOCALE) continue;
        const entry = byUrl.get(absoluteUrl(group[locale]));
        expect(entry, group[locale]).toBeTruthy();
        const languages = entry!.alternates?.languages as Record<string, string> | undefined;
        for (const code of LOCALES) expect(languages?.[code]).toBe(absoluteUrl(group[code]));
      }
    }
  });

  it.each(['fr', 'de'] as const)('lists a %s page for every template, each paired', (locale) => {
    /*
     * The eight landing pages were held back from the detail pages at first, on the
     * launch-velocity reasoning in audit 3.5. What makes publishing the rest a different
     * bet is that they are not new content: each is the second language of a page Google
     * has already been crawling, arriving `hreflang`-paired rather than unattached.
     *
     * The pairing is the part worth asserting. An unpaired French page is a duplicate of
     * an English one in Google's eyes, which is the outcome the whole exercise avoids.
     */
    for (const template of TEMPLATES) {
      const entry = byUrl.get(absoluteUrl(templatePath(template.slug, locale)));
      expect(entry, `${locale}/${template.slug}`).toBeTruthy();
      const languages = entry!.alternates?.languages as Record<string, string> | undefined;
      for (const code of LOCALES) {
        expect(languages?.[code]).toBe(absoluteUrl(templatePath(template.slug, code)));
      }
    }
  });

  it('never lets a translated page go out unpaired', () => {
    const prefixes = LOCALES.filter((code) => code !== DEFAULT_LOCALE).map(
      (code) => `${LOCALE_META[code].prefix}/`,
    );
    const translated = entries.filter((entry) =>
      prefixes.some((prefix) => new URL(entry.url).pathname.startsWith(prefix)),
    );
    expect(translated.length).toBeGreaterThan(100);
    for (const entry of translated) {
      expect(entry.alternates?.languages, entry.url).toBeTruthy();
    }
  });

  it('has no duplicate URLs', () => {
    const urls = entries.map((entry) => entry.url);
    expect(urls.length).toBe(new Set(urls).size);
  });
});
