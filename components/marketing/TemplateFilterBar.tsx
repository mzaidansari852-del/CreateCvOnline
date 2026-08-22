'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import type { Locale } from '@/lib/i18n/locales';
import { expandQuery } from '@/lib/i18n/search-terms';
import { cn } from '@/lib/utils/cn';

/**
 * Filtering for the template gallery, done in the browser over server-rendered cards.
 *
 * ## Why not `?plan=free` on the server
 *
 * That is what this replaces, and it cost the gallery its static rendering. Reading
 * `searchParams` in a page — in `generateMetadata` *or* in the body — opts the whole route
 * into dynamic rendering, so `/templates`, one of the most-linked pages on the site, was
 * re-rendered from scratch on every request while every other marketing page was served
 * from the edge as static HTML. Audit item 3.4.
 *
 * ## Why the filtering reads the DOM
 *
 * The obvious client-side version passes the template list to the browser as props. That
 * ships the registry — sixty-one entries with their descriptions, features and keywords —
 * as serialised RSC payload, which is a large fraction of what the images already cost.
 *
 * Instead the server renders every card once, with its facets in `data-` attributes, and
 * this component hides the ones that do not match. The browser learns nothing it was not
 * already sent as HTML, and with JavaScript off the page is simply the full unfiltered
 * gallery — which is exactly what a crawler should see anyway.
 *
 * Category is deliberately *not* a facet here. Each category has its own static page with
 * its own copy, and a `?category=` view competing with it was the specific duplication the
 * audit flagged. `proxy.ts` redirects the query form to the real page — it has to be the
 * proxy rather than `next.config.ts`, because a `redirects()` rule forwards the query it
 * matched on to the destination and would land on `/templates/modern?category=modern`,
 * inventing a third address instead of removing one.
 */

type Plan = 'free' | 'pro' | null;
type Columns = 1 | 2 | null;
type Ats = 4 | 5 | null;

/**
 * The filter chrome, per language.
 *
 * The counts and the empty state are functions rather than templates with placeholders
 * because the three languages put the numbers in different places: French says
 * "Affichage de 20 modèles sur 61", German "20 von 61 Vorlagen". Interpolating into a
 * single English-shaped sentence is how you get word order that reads as translated.
 */
const COPY = {
  en: {
    searchLabel: 'Search templates by name, style or role',
    searchPlaceholder: 'Search templates — “banking”, “student”, “minimal”, “two column”…',
    plan: 'Plan',
    free: 'Free',
    pro: 'Pro',
    layout: 'Layout',
    oneColumn: 'One column',
    twoColumns: 'Two columns',
    ats: 'ATS score',
    atsFive: '5/5 only',
    atsFour: '4 and above',
    showing: (shown: number, total: number) => `Showing ${shown} of ${total} templates`,
    freeSuffix: (n: number) => `${n} are free`,
    clear: 'Clear all filters',
    emptyTitle: 'No templates match those filters',
    emptyBody:
      'Loosening one filter — usually the ATS score or the column count — will bring results back.',
    showAll: (total: number) => `Show all ${total} templates`,
  },
  fr: {
    searchLabel: 'Rechercher un modèle par nom, style ou métier',
    searchPlaceholder: 'Rechercher un modèle — « banque », « étudiant », « minimaliste »…',
    plan: 'Formule',
    free: 'Gratuit',
    pro: 'Pro',
    layout: 'Mise en page',
    oneColumn: 'Une colonne',
    twoColumns: 'Deux colonnes',
    ats: 'Score ATS',
    atsFive: '5/5 uniquement',
    atsFour: '4 et plus',
    showing: (shown: number, total: number) => `Affichage de ${shown} modèles sur ${total}`,
    freeSuffix: (n: number) => `${n} sont gratuits`,
    clear: 'Réinitialiser les filtres',
    emptyTitle: 'Aucun modèle ne correspond à ces filtres',
    emptyBody:
      'Assouplir un filtre — en général le score ATS ou le nombre de colonnes — fera réapparaître des résultats.',
    showAll: (total: number) => `Afficher les ${total} modèles`,
  },
  de: {
    searchLabel: 'Vorlagen nach Name, Stil oder Beruf durchsuchen',
    searchPlaceholder: 'Vorlagen durchsuchen — „Bank“, „Studium“, „minimalistisch“…',
    plan: 'Tarif',
    free: 'Kostenlos',
    pro: 'Pro',
    layout: 'Layout',
    oneColumn: 'Einspaltig',
    twoColumns: 'Zweispaltig',
    ats: 'ATS-Score',
    atsFive: 'Nur 5/5',
    atsFour: '4 und mehr',
    showing: (shown: number, total: number) => `${shown} von ${total} Vorlagen`,
    freeSuffix: (n: number) => `${n} davon kostenlos`,
    clear: 'Alle Filter zurücksetzen',
    emptyTitle: 'Keine Vorlage passt zu diesen Filtern',
    emptyBody:
      'Wenn Sie einen Filter lockern — meist den ATS-Score oder die Spaltenzahl — erscheinen wieder Ergebnisse.',
    showAll: (total: number) => `Alle ${total} Vorlagen anzeigen`,
  },
  nl: {
    searchLabel: 'Zoek een sjabloon op naam, stijl of beroep',
    searchPlaceholder: 'Zoek een sjabloon — ‘bank’, ‘student’, ‘minimalistisch’…',
    plan: 'Abonnement',
    free: 'Gratis',
    pro: 'Pro',
    layout: 'Opmaak',
    oneColumn: 'Één kolom',
    twoColumns: 'Twee kolommen',
    ats: 'ATS-score',
    atsFive: 'Alleen 5/5',
    atsFour: '4 en hoger',
    showing: (shown: number, total: number) => `${shown} van ${total} sjablonen`,
    freeSuffix: (n: number) => `waarvan ${n} gratis`,
    clear: 'Alle filters wissen',
    emptyTitle: 'Geen sjabloon voldoet aan deze filters',
    emptyBody:
      'Eén filter versoepelen — meestal de ATS-score of het aantal kolommen — levert weer resultaten op.',
    showAll: (total: number) => `Alle ${total} sjablonen tonen`,
  },
} satisfies Record<Locale, unknown>;

export function TemplateFilterBar({
  total,
  freeCount,
  locale = 'en',
  children,
}: {
  total: number;
  freeCount: number;
  locale?: Locale;
  /** The server-rendered gallery. Cards carry `data-template-card` and their facets. */
  children: React.ReactNode;
}) {
  const copy = COPY[locale];
  const searchId = useId();
  const region = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [plan, setPlan] = useState<Plan>(null);
  const [columns, setColumns] = useState<Columns>(null);
  const [ats, setAts] = useState<Ats>(null);
  const [shown, setShown] = useState(total);

  const filtered = Boolean(query.trim() || plan || columns || ats);

  const apply = useCallback(() => {
    const root = region.current;
    if (!root) return;

    /*
     * The typed words, each already expanded to the English tokens it can satisfy — see
     * `search-terms.ts`. The haystack on each card is English because the registry is;
     * translating the query is what makes `banque` find the banking template.
     */
    const words = expandQuery(query, locale);
    let visible = 0;

    for (const card of root.querySelectorAll<HTMLElement>('[data-template-card]')) {
      const haystack = card.dataset.search ?? '';
      const matches =
        (!plan || card.dataset.plan === plan) &&
        (!columns || card.dataset.columns === String(columns)) &&
        (!ats || Number(card.dataset.ats ?? 0) >= ats) &&
        // Every word must be satisfied by one of its variants, so a second word narrows.
        words.every((variants) => variants.some((variant) => haystack.includes(variant)));

      card.hidden = !matches;
      if (matches) visible += 1;
    }

    // A category heading with nothing under it is worse than no heading: it reads as a
    // category that has been emptied rather than one that never matched.
    for (const group of root.querySelectorAll<HTMLElement>('[data-template-group]')) {
      const any = group.querySelector('[data-template-card]:not([hidden])');
      group.hidden = !any;
    }

    setShown(visible);
  }, [ats, columns, locale, plan, query]);

  useEffect(apply, [apply]);

  const clear = () => {
    setQuery('');
    setPlan(null);
    setColumns(null);
    setAts(null);
  };

  const rows = useMemo(
    () => [
      {
        label: copy.plan,
        options: [
          {
            label: copy.free,
            active: plan === 'free',
            toggle: () => setPlan(plan === 'free' ? null : 'free'),
          },
          {
            label: copy.pro,
            active: plan === 'pro',
            toggle: () => setPlan(plan === 'pro' ? null : 'pro'),
          },
        ],
      },
      {
        label: copy.layout,
        options: [
          {
            label: copy.oneColumn,
            active: columns === 1,
            toggle: () => setColumns(columns === 1 ? null : 1),
          },
          {
            label: copy.twoColumns,
            active: columns === 2,
            toggle: () => setColumns(columns === 2 ? null : 2),
          },
        ],
      },
      {
        label: copy.ats,
        options: [
          { label: copy.atsFive, active: ats === 5, toggle: () => setAts(ats === 5 ? null : 5) },
          { label: copy.atsFour, active: ats === 4, toggle: () => setAts(ats === 4 ? null : 4) },
        ],
      },
    ],
    [ats, columns, copy, plan],
  );

  return (
    <>
      <div className="rounded-2xl border border-ink-200 bg-white p-5 sm:p-6">
        <div role="search" className="flex flex-wrap gap-2">
          <label htmlFor={searchId} className="sr-only">
            {copy.searchLabel}
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={60}
            placeholder={copy.searchPlaceholder}
            className="h-10 min-w-0 flex-1 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 placeholder:text-ink-400 pointer-coarse:text-base focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 focus:outline-none"
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-ink-100 pt-5">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-wrap items-center gap-2">
              <span className="w-24 shrink-0 text-xs font-bold tracking-[0.08em] text-ink-500 uppercase">
                {row.label}
              </span>
              {row.options.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={option.active}
                  onClick={option.toggle}
                  className={cn(
                    'cursor-pointer rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors',
                    option.active
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3 border-t border-ink-100 pt-4">
          {/*
            Announced politely rather than assertively: a count that interrupts on every
            keystroke is worse for a screen-reader user than one they can check when they
            stop typing.
          */}
          <p aria-live="polite" className="text-sm text-ink-700">
            <strong className="font-semibold text-ink-950">{copy.showing(shown, total)}</strong>
            {!filtered ? (
              <span className="text-ink-600"> · {copy.freeSuffix(freeCount)}</span>
            ) : null}
          </p>
          {filtered ? (
            <button
              type="button"
              onClick={clear}
              className="cursor-pointer text-sm font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
            >
              {copy.clear}
            </button>
          ) : null}
        </div>
      </div>

      <div ref={region} className="mt-10">
        {children}
        {shown === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-300 bg-white p-10 text-center">
            <p className="text-base font-semibold text-ink-950">{copy.emptyTitle}</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-600">
              {copy.emptyBody}
            </p>
            <button
              type="button"
              onClick={clear}
              className="mt-5 cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {copy.showAll(total)}
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
