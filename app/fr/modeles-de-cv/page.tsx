import Link from 'next/link';
import type { Metadata } from 'next';

import { FR, FR_CATEGORY_SLUG } from '../fr-copy';
import { Badge } from '@/components/ui/feedback';
import { ButtonLink } from '@/components/ui/button';
import { CtaBanner, Section, SectionHeading } from '@/components/marketing/primitives';
import { JsonLd } from '@/components/seo/JsonLd';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import { hasPreview } from '@/components/cv/TemplateImage';
import {
  FREE_TEMPLATE_COUNT,
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  TEMPLATE_COUNT,
  atsSafeTemplates,
  templatesByCategory,
} from '@/lib/cv/template-registry';
import { pageMetadata } from '@/lib/seo/metadata';
import { itemListSchema, webPageSchema } from '@/lib/seo/schema';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: FR.gallery.metaTitle,
  description: FR.gallery.metaDescription,
  path: '/fr/modeles-de-cv',
  locale: 'fr',
  keywords: [
    'modèle de cv',
    'modèle de cv gratuit',
    'modèles de cv à télécharger',
    'exemple de cv',
  ],
});

/**
 * The French gallery — the page the whole French subtree exists to rank.
 *
 * Statically rendered, unlike its English counterpart, because it has no `searchParams`
 * filter. The English `/templates` reads `?category=` in both `generateMetadata` and the
 * page body, which forces it dynamic; audit item 3.4 is still open on that. Here the
 * filtering is done by linking to the six category pages, which are real indexable URLs
 * and are what a French searcher is actually querying for.
 */
export default function FrenchTemplatesPage() {
  const singleColumn = TEMPLATES.filter((template) => template.columns === 1).length;

  return (
    <>
      <Section size="sm">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl">
            {FR.gallery.heading}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-ink-600">
            {FR.gallery.lede}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge tone="brand">
              {TEMPLATE_COUNT} {FR.gallery.designsLabel}
            </Badge>
            <Badge tone="success">
              {FREE_TEMPLATE_COUNT} {FR.gallery.freeBadge}
            </Badge>
            <Badge tone="neutral">
              {atsSafeTemplates().length} {FR.gallery.atsLabel}
            </Badge>
            <Badge tone="neutral">
              {singleColumn} {FR.gallery.singleColumnLabel}
            </Badge>
          </div>

          <div className="mt-7">
            <ButtonLink href="/register" size="lg">
              {FR.gallery.ctaPrimary}
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <h2 className="text-xs font-bold tracking-[0.12em] text-ink-950 uppercase">
          {FR.gallery.browseByCategory}
        </h2>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {TEMPLATE_CATEGORIES.map((category) => (
            <li key={category.id}>
              <Link
                href={`/fr/modeles-de-cv/${FR_CATEGORY_SLUG[category.id]}`}
                className="text-sm font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
              >
                {FR.categories[category.id].label}
                <span className="ml-1.5 font-normal text-ink-500">
                  ({templatesByCategory(category.id).length})
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {TEMPLATE_CATEGORIES.map((category) => {
        const templates = templatesByCategory(category.id);
        return (
          <Section key={category.id} size="sm">
            <SectionHeading
              align="left"
              title={FR.categories[category.id].heading}
              description={FR.categories[category.id].lede}
            />
            <TemplateGrid className="mt-8" templates={templates} columns={4} locale="fr" />
            <p className="mt-6 text-sm">
              <Link
                href={`/fr/modeles-de-cv/${FR_CATEGORY_SLUG[category.id]}`}
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                {FR.categories[category.id].heading} — tout voir
              </Link>
            </p>
          </Section>
        );
      })}

      <Section tone="muted" size="sm">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink-950">{FR.gallery.whatMakesGood}</h2>
          <p className="mt-4 text-[15px] leading-[1.75] text-ink-700">
            {FR.gallery.whatMakesGoodBody}
          </p>
        </div>
      </Section>

      <Section size="sm">
        <CtaBanner
          title={FR.cta.title}
          description={FR.cta.description}
          secondaryHref="/fr/tarifs"
          secondaryLabel={FR.cta.secondary}
        />
      </Section>

      <JsonLd
        nodes={[
          webPageSchema({
            path: '/fr/modeles-de-cv',
            name: FR.gallery.metaTitle,
            description: FR.gallery.metaDescription,
            type: 'CollectionPage',
            inLanguage: 'fr',
          }),
          itemListSchema(
            TEMPLATES.map((template) => ({
              name: template.name,
              path: `/templates/${template.slug}`,
              description: template.tagline,
              image: hasPreview(template.slug)
                ? absoluteUrl(`/previews/${template.slug}-card.webp`)
                : undefined,
            })),
            FR.gallery.heading,
          ),
        ]}
      />
    </>
  );
}
