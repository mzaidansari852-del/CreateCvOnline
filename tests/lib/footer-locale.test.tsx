import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FOOTER } from '@/lib/i18n/nav';
import { LOCALES } from '@/lib/i18n/locales';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { TEMPLATE_COUNT } from '@/lib/cv/template-registry';

/**
 * The footer, in the language of the page it sits under.
 *
 * This exists because of a specific and easily repeated mistake: the German footer copy was
 * written at the same time as the German pages, and then never rendered. `SiteFooter` asked
 * `locale === 'fr'` before using the translation, so every German page shipped an English
 * footer — including a "Free CV builder" link to a guide that only exists in English. The
 * translation was present and correct in `nav.ts` the whole time, which is what made it
 * invisible: reviewing the copy file showed nothing wrong.
 *
 * So these assertions deliberately go through the rendered component rather than reading
 * the copy table. A test that checks `FOOTER.de` is populated would have passed throughout.
 */

const PATHS: Record<string, string> = {
  en: '/templates',
  fr: '/fr/modeles-de-cv',
  de: '/de/lebenslauf-vorlagen',
};

const pathname = vi.hoisted(() => ({ current: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => pathname.current }));

function renderAt(locale: string) {
  pathname.current = PATHS[locale]!;
  return render(<SiteFooter />);
}

afterEach(cleanup);

describe('site footer', () => {
  it.each(LOCALES)('renders the %s blurb, not the English one', (locale) => {
    renderAt(locale);
    // `blurb` is a function of the template count, so this also catches a stale hardcoded
    // number surviving in the markup.
    const expected = FOOTER[locale].blurb(TEMPLATE_COUNT);
    expect(screen.getByText(new RegExp(escapeRegex(expected.slice(0, 60))))).toBeTruthy();
  });

  it.each(LOCALES)('uses the %s column labels', (locale) => {
    const { container } = renderAt(locale);
    const text = container.textContent ?? '';
    const columns = FOOTER[locale].columns;
    // English has no translated columns by design — it uses the full `footerNav`, which is
    // the long-form menu the guide pages hang off.
    if (columns.length === 0) {
      expect(locale).toBe('en');
      expect(text).toContain('Free CV builder');
      return;
    }
    for (const column of columns) {
      expect(text, `${locale}: column “${column.label}”`).toContain(column.label);
    }
  });

  it('keeps English-only guide links off the translated pages', () => {
    /*
     * The specific leak. These pages exist in English alone, so linking them from a German
     * footer sends a German visitor to an English page and dilutes the hreflang cluster.
     */
    const englishOnly = ['Free CV builder', 'CV advice by profession', 'Resume examples'];
    for (const locale of ['fr', 'de'] as const) {
      const { container } = renderAt(locale);
      for (const label of englishOnly) {
        expect(container.textContent ?? '', `${locale}: ${label}`).not.toContain(label);
      }
      cleanup();
    }
  });

  it('points category links at the pages for that language', () => {
    for (const [locale, root] of [
      ['fr', '/fr/modeles-de-cv/'],
      ['de', '/de/lebenslauf-vorlagen/'],
    ] as const) {
      const { container } = renderAt(locale);
      const hrefs = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href') ?? '');
      const categoryLinks = hrefs.filter(
        (h) => h.includes('modeles-de-cv/') || h.includes('lebenslauf-vorlagen/'),
      );
      expect(categoryLinks.length, `${locale}: category links`).toBeGreaterThan(0);
      for (const href of categoryLinks) {
        expect(href, `${locale}: ${href}`).toContain(root);
      }
      cleanup();
    }
  });
});

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
