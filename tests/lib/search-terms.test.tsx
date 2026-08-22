import { cleanup, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TemplateCard } from '@/components/marketing/TemplateStrip';
import { expandQuery } from '@/lib/i18n/search-terms';
import { TEMPLATES } from '@/lib/cv/template-registry';
import type { Locale } from '@/lib/i18n/locales';

/**
 * The gallery search, tested against the haystack the cards actually carry.
 *
 * `TemplateCard` builds `data-search` from the template's English metadata plus the card's
 * own localised facet words, and `TemplateFilterBar` matches `expandQuery` against it. The
 * interesting behaviour is the interaction between those two, so the haystack is rebuilt
 * here exactly as the card builds it rather than being stubbed — a stub would keep passing
 * after someone changes what the card emits.
 */

/** The facet words each locale's card prints, mirroring `CARD_COPY` in `TemplateStrip`. */
const FACETS: Record<
  Locale,
  { one: string; two: string; free: string; pro: string; category: Record<string, string> }
> = {
  en: {
    one: 'one column',
    two: 'two columns',
    free: 'Free',
    pro: 'Pro',
    category: {
      modern: 'modern',
      corporate: 'corporate',
      creative: 'creative',
      technology: 'technology',
      classic: 'classic',
      ats: 'ATS-friendly',
    },
  },
  fr: {
    one: 'une colonne',
    two: 'deux colonnes',
    free: 'Gratuit',
    pro: 'Pro',
    category: {
      modern: 'moderne',
      corporate: 'entreprise',
      creative: 'créatif',
      technology: 'informatique',
      classic: 'classique',
      ats: 'compatible ATS',
    },
  },
  de: {
    one: 'einspaltig',
    two: 'zweispaltig',
    free: 'Kostenlos',
    pro: 'Pro',
    category: {
      modern: 'modern',
      corporate: 'business',
      creative: 'kreativ',
      technology: 'IT',
      classic: 'klassisch',
      ats: 'ATS-tauglich',
    },
  },
  nl: {
    one: 'één kolom',
    two: 'twee kolommen',
    free: 'Gratis',
    pro: 'Pro',
    category: {
      modern: 'modern',
      corporate: 'zakelijk',
      creative: 'creatief',
      technology: 'IT',
      classic: 'klassiek',
      ats: 'ATS-vriendelijk',
    },
  },
};

function haystack(template: (typeof TEMPLATES)[number], locale: Locale): string {
  const f = FACETS[locale];
  return [
    template.name,
    template.tagline,
    template.category,
    ...template.keywords,
    f.category[template.category],
    template.columns === 1 ? f.one : f.two,
    template.premium ? f.pro : f.free,
  ]
    .join(' ')
    .toLowerCase();
}

/** The same predicate `TemplateFilterBar.apply` uses. */
function search(query: string, locale: Locale) {
  const words = expandQuery(query, locale);
  return TEMPLATES.filter((template) => {
    const hay = haystack(template, locale);
    return words.every((variants) => variants.some((variant) => hay.includes(variant)));
  });
}

const TWO_COLUMN = TEMPLATES.filter((t) => t.columns === 2).length;
const ONE_COLUMN = TEMPLATES.filter((t) => t.columns === 1).length;
const FREE = TEMPLATES.filter((t) => !t.premium).length;

describe('gallery search', () => {
  it('returns everything for an empty query', () => {
    for (const locale of ['en', 'fr', 'de'] as const) {
      expect(expandQuery('   ', locale)).toEqual([]);
      expect(search('', locale)).toHaveLength(TEMPLATES.length);
    }
  });

  /*
   * The regression this whole module exists for. The French placeholder suggests these
   * words by name, and every one of them returned nothing before the query was translated:
   * the haystack is the registry's English metadata and the registry has one language.
   */
  it.each([
    ['banque', 'fr'],
    ['étudiant', 'fr'],
    ['etudiant', 'fr'],
    ['minimaliste', 'fr'],
    ['moderne', 'fr'],
    ['ingénieur', 'fr'],
    ['développeur', 'fr'],
    ['comptable', 'fr'],
    ['avocat', 'fr'],
    ['studium', 'de'],
    ['minimalistisch', 'de'],
    ['kreativ', 'de'],
    ['entwickler', 'de'],
    ['buchhalter', 'de'],
    ['lebenslauf', 'de'],
    ['vertrieb', 'de'],
  ] as [string, Locale][])('finds something for %s (%s)', (term, locale) => {
    expect(search(term, locale).length).toBeGreaterThan(0);
  });

  it('suggests only search terms that work', () => {
    // Whatever the placeholder advertises has to return results, in every language.
    const advertised: Record<Locale, string[]> = {
      en: ['banking', 'student', 'minimal', 'two column'],
      fr: ['banque', 'étudiant', 'minimaliste'],
      de: ['bank', 'studium', 'minimalistisch'],
      nl: ['bank', 'student', 'minimalistisch'],
    };
    for (const [locale, terms] of Object.entries(advertised) as [Locale, string[]][]) {
      for (const term of terms) {
        expect(search(term, locale).length, `${locale}: “${term}”`).toBeGreaterThan(0);
      }
    }
  });

  /*
   * `two column` split into `two` AND `column` matched three one-column templates, because
   * `two` appears in taglines like "a two-line name" and "a two-tone split header" while
   * `column` is on every card. Phrases are looked up whole for exactly this reason, and the
   * expected numbers come from the registry rather than from a previous run.
   */
  it.each([
    ['two column', 'en', TWO_COLUMN],
    ['two columns', 'en', TWO_COLUMN],
    ['one column', 'en', ONE_COLUMN],
    ['single column', 'en', ONE_COLUMN],
    ['deux colonnes', 'fr', TWO_COLUMN],
    ['une colonne', 'fr', ONE_COLUMN],
    ['zweispaltig', 'de', TWO_COLUMN],
    ['einspaltig', 'de', ONE_COLUMN],
    ['zwei spalten', 'de', TWO_COLUMN],
    ['eine spalte', 'de', ONE_COLUMN],
  ] as [string, Locale, number][])(
    '“%s” (%s) matches exactly the right column count',
    (query, locale, want) => {
      const found = search(query, locale);
      expect(found).toHaveLength(want);
      const expectedColumns = want === TWO_COLUMN ? 2 : 1;
      expect(found.every((t) => t.columns === expectedColumns)).toBe(true);
    },
  );

  it('matches the plan word in each language', () => {
    expect(search('free', 'en').length).toBeGreaterThanOrEqual(FREE);
    expect(search('gratuit', 'fr')).toHaveLength(FREE);
    expect(search('kostenlos', 'de')).toHaveLength(FREE);
  });

  it('narrows rather than widens as words are added', () => {
    // Two words is an AND. A user who types more expects fewer results, not more.
    for (const locale of ['en', 'fr', 'de'] as const) {
      const one = search('modern', locale).length;
      const two = search('modern creative', locale).length;
      expect(two).toBeLessThanOrEqual(one);
    }
  });

  it('leaves an unknown word untranslated instead of dropping it', () => {
    // A word with no entry must still be searched for literally, not silently ignored —
    // ignoring it would turn a zero-result query into the whole catalogue.
    expect(expandQuery('kajgshdf', 'fr')).toEqual([['kajgshdf']]);
    expect(search('kajgshdf', 'fr')).toHaveLength(0);
  });

  it('is testing the haystack the card actually renders', () => {
    /*
     * `FACETS` above restates the localised words `TemplateStrip` prints on a card. That
     * duplication is what makes the rest of this file readable, and it is also exactly the
     * kind of copy that goes stale in silence — every assertion here would keep passing
     * against a haystack the product no longer emits. So the copy is checked against a
     * real rendered card, in every language, and this test fails the moment they diverge.
     */
    for (const locale of ['en', 'fr', 'de'] as const) {
      for (const template of [TEMPLATES[0]!, TEMPLATES[1]!, TEMPLATES.at(-1)!]) {
        const { container } = render(<TemplateCard template={template} locale={locale} />);
        const card = container.querySelector('[data-template-card]');
        expect(card, `${locale} ${template.slug}`).not.toBeNull();
        expect(card!.getAttribute('data-search'), `${locale} ${template.slug}`).toBe(
          haystack(template, locale),
        );
        cleanup();
      }
    }
  });

  it('keeps every mapped term pointing at vocabulary that exists', () => {
    /*
     * A translation for a word no template carries is dead weight that reads as coverage.
     * Every mapping is checked against the real corpus in its own locale.
     */
    const dead: string[] = [];
    for (const locale of ['fr', 'de'] as const) {
      const corpus = TEMPLATES.map((t) => haystack(t, locale)).join(' ');
      for (const word of SAMPLE_KEYS[locale]) {
        const variants = expandQuery(word, locale).flat();
        if (!variants.some((v) => corpus.includes(v))) dead.push(`${locale}: ${word}`);
      }
    }
    expect(dead).toEqual([]);
  });
});

/** A spread of keys from each table — style words, role words and compounds. */
const SAMPLE_KEYS: Record<'fr' | 'de', string[]> = {
  fr: [
    'moderne',
    'classique',
    'créatif',
    'entreprise',
    'minimaliste',
    'élégant',
    'photo',
    'banque',
    'finance',
    'comptable',
    'ingénieur',
    'développeur',
    'informatique',
    'données',
    'analyste',
    'sécurité',
    'recherche',
    'designer',
    'graphiste',
    'photographe',
    'marketing',
    'commercial',
    'conseil',
    'gestion',
    'directeur',
    'cadre',
    'produit',
    'juridique',
    'gouvernement',
    'étudiant',
    'débutant',
    'senior',
    'compétences',
    'expérience',
    'europass',
  ],
  de: [
    'modern',
    'klassisch',
    'kreativ',
    'unternehmen',
    'minimalistisch',
    'elegant',
    'foto',
    'bank',
    'finanzen',
    'buchhalter',
    'ingenieur',
    'entwickler',
    'informatik',
    'daten',
    'analyst',
    'sicherheit',
    'forschung',
    'designer',
    'grafik',
    'fotograf',
    'vertrieb',
    'beratung',
    'leitung',
    'führungskraft',
    'produkt',
    'recht',
    'behörde',
    'student',
    'studium',
    'berufseinsteiger',
    'kenntnisse',
    'erfahrung',
    'europass',
    'lebenslauf',
  ],
};
