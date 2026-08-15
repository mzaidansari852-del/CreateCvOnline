import Link from 'next/link';

import { templateDefaults } from '@/lib/cv/template-registry';
import { localiseCv } from '@/lib/i18n/cv-labels';
import { templatePath } from '@/lib/i18n/locales';
import type { Locale } from '@/lib/i18n/locales';
import { CVThumbnail } from '@/components/cv/CVThumbnail';
import { TemplateImage, hasPreview } from '@/components/cv/TemplateImage';
import { Badge } from '@/components/ui/feedback';
import { createDefaultCustomization, createSampleCV } from '@/lib/cv/defaults';
import { cn } from '@/lib/utils/cn';
import type { TemplateDefinition } from '@/types/cv';

/**
 * A grid of template previews.
 *
 * Shared by the homepage, the gallery, the SEO landing pages and every template detail
 * page's "related templates" block, so a design change to a template card lands in one
 * place. Server component — zero client JavaScript.
 *
 * Cards show the pre-rendered preview image rather than a live CV. A grid of twenty live
 * previews is twenty full CV documents of inline DOM — several hundred kilobytes that an
 * image crawler cannot read anyway. The live path stays as the fallback for a template
 * whose image has not been generated yet, so adding one never leaves a hole in the grid.
 */
/**
 * The words on a card, per language.
 *
 * The card is the unit the gallery is made of, so an English "Free" badge and an English
 * "two columns" line appear sixty-one times on a French page. Small strings, but they are
 * most of the text a shopper actually reads while scrolling.
 */
const CARD_COPY = {
  en: {
    view: 'View template',
    free: 'Free',
    pro: 'Pro',
    oneColumn: 'one column',
    twoColumns: 'two columns',
    ats: 'ATS-friendly',
    category: {
      modern: 'modern',
      corporate: 'corporate',
      creative: 'creative',
      technology: 'technology',
      classic: 'classic',
      ats: 'ATS-friendly',
    },
  },
  de: {
    view: 'Vorlage ansehen',
    free: 'Kostenlos',
    pro: 'Pro',
    oneColumn: 'einspaltig',
    twoColumns: 'zweispaltig',
    ats: 'ATS-tauglich',
    category: {
      modern: 'modern',
      corporate: 'business',
      creative: 'kreativ',
      technology: 'IT',
      classic: 'klassisch',
      ats: 'ATS-tauglich',
    },
  },
  fr: {
    view: 'Voir le modèle',
    free: 'Gratuit',
    pro: 'Pro',
    oneColumn: 'une colonne',
    twoColumns: 'deux colonnes',
    ats: 'compatible ATS',
    category: {
      modern: 'moderne',
      corporate: 'entreprise',
      creative: 'créatif',
      technology: 'informatique',
      classic: 'classique',
      ats: 'compatible ATS',
    },
  },
} satisfies Record<Locale, unknown>;

export function TemplateCard({
  template,
  width = 260,
  crop,
  className,
  locale = 'en',
}: {
  template: TemplateDefinition;
  width?: number;
  crop?: number;
  className?: string;
  /** Localises the card chrome, the href and the section headings in the live preview. */
  locale?: Locale;
}) {
  const copy = CARD_COPY[locale];
  const cv = localiseCv(createSampleCV(), locale);
  const customization = createDefaultCustomization({
    ...templateDefaults(template),
  });

  return (
    <Link
      href={templatePath(template.slug, locale)}
      /*
       * The card's facets, in the DOM.
       *
       * `TemplateFilterBar` filters by reading these rather than by being handed the
       * registry, which keeps sixty-one template records out of the client bundle. The
       * search haystack is built here, on the server, for the same reason.
       */
      data-template-card=""
      data-plan={template.premium ? 'pro' : 'free'}
      data-columns={template.columns}
      data-ats={template.atsScore}
      /*
       * The haystack carries the card's own words in *this* page's language as well as the
       * registry's English ones. The registry has a single language, so a French visitor
       * typing `entreprise`, `gratuit` or `deux colonnes` is searching text that does not
       * exist on the page they are looking at. `search-terms.ts` translates the rest of the
       * query vocabulary; these four are free to add here and exact rather than mapped.
       */
      data-search={[
        template.name,
        template.tagline,
        template.category,
        ...template.keywords,
        copy.category[template.category],
        template.columns === 1 ? copy.oneColumn : copy.twoColumns,
        template.premium ? copy.pro : copy.free,
      ]
        .join(' ')
        .toLowerCase()}
      className={cn(
        'group flex flex-col rounded-xl border border-ink-200 bg-white p-3 transition-all duration-200',
        'hover:-translate-y-1 hover:border-brand-300 hover:shadow-card-hover',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-lg bg-ink-100">
        {hasPreview(template.slug) ? (
          <TemplateImage
            template={template}
            width={width}
            locale={locale}
            sizes={`(max-width: 640px) 45vw, ${width}px`}
            className={crop ? 'object-cover' : undefined}
          />
        ) : (
          <CVThumbnail
            cv={cv}
            customization={customization}
            width={width}
            crop={crop}
            rounded={false}
            shadow={false}
            className="w-full"
          />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/55 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-3 text-center text-[13px] font-semibold text-white opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
        >
          {copy.view}
        </span>
      </div>

      <div className="flex flex-1 items-start justify-between gap-2 px-1 pt-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink-950 group-hover:text-brand-700">
            {template.name}
          </h3>
          <p className="mt-0.5 text-xs text-ink-500 first-letter:uppercase">
            {copy.category[template.category]} ·{' '}
            {template.columns === 1 ? copy.oneColumn : copy.twoColumns}
          </p>
        </div>
        {template.premium ? (
          <Badge tone="accent">{copy.pro}</Badge>
        ) : (
          <Badge tone="success">{copy.free}</Badge>
        )}
      </div>
    </Link>
  );
}

export function TemplateGrid({
  templates,
  columns = 4,
  width = 260,
  className,
  locale = 'en',
}: {
  templates: TemplateDefinition[];
  columns?: 3 | 4 | 5;
  width?: number;
  className?: string;
  locale?: Locale;
}) {
  const cols = {
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  } as const;

  if (templates.length === 0) return null;

  return (
    <div className={cn('grid gap-4 sm:gap-5', cols[columns], className)}>
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} width={width} locale={locale} />
      ))}
    </div>
  );
}
