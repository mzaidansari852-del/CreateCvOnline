import Link from 'next/link';
import type { Metadata } from 'next';

import { DE, DE_CATEGORY_SLUG } from '../de-copy';
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
  title: DE.gallery.metaTitle,
  description: DE.gallery.metaDescription,
  path: '/de/lebenslauf-vorlagen',
  locale: 'de',
  keywords: [
    'lebenslauf vorlage',
    'lebenslauf vorlagen kostenlos',
    'lebenslauf muster',
    'lebenslauf vorlage word',
  ],
});

/**
 * The German gallery — the page the whole German subtree exists to rank.
 *
 * Statically rendered, like its French counterpart and unlike the English one, because it
 * has no `searchParams` filter: the filtering is done by linking to six real indexable
 * category URLs, which is what a German searcher is querying for anyway.
 */
export default function GermanTemplatesPage() {
  const singleColumn = TEMPLATES.filter((template) => template.columns === 1).length;

  return (
    <>
      <Section size="sm">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl">
            {DE.gallery.heading}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-ink-600">
            {DE.gallery.lede}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge tone="brand">
              {TEMPLATE_COUNT} {DE.gallery.designsLabel}
            </Badge>
            <Badge tone="success">
              {FREE_TEMPLATE_COUNT} {DE.gallery.freeBadge}
            </Badge>
            <Badge tone="neutral">
              {atsSafeTemplates().length} {DE.gallery.atsLabel}
            </Badge>
            <Badge tone="neutral">
              {singleColumn} {DE.gallery.singleColumnLabel}
            </Badge>
          </div>

          <div className="mt-7">
            <ButtonLink href="/register" size="lg">
              {DE.gallery.ctaPrimary}
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <h2 className="text-xs font-bold tracking-[0.12em] text-ink-950 uppercase">
          {DE.gallery.browseByCategory}
        </h2>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {TEMPLATE_CATEGORIES.map((category) => (
            <li key={category.id}>
              <Link
                href={`/de/lebenslauf-vorlagen/${DE_CATEGORY_SLUG[category.id]}`}
                className="text-sm font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
              >
                {DE.categories[category.id].label}
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
              title={DE.categories[category.id].heading}
              description={DE.categories[category.id].lede}
            />
            <TemplateGrid className="mt-8" templates={templates} columns={4} locale="de" />
            <p className="mt-6 text-sm">
              <Link
                href={`/de/lebenslauf-vorlagen/${DE_CATEGORY_SLUG[category.id]}`}
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                {DE.categories[category.id].heading} — alle ansehen
              </Link>
            </p>
          </Section>
        );
      })}

      <Section tone="muted" size="sm">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink-950">{DE.gallery.whatMakesGood}</h2>
          <p className="mt-4 text-[15px] leading-[1.75] text-ink-700">
            {DE.gallery.whatMakesGoodBody}
          </p>
        </div>
      </Section>

      <Section size="sm">
        <CtaBanner
          title={DE.cta.title}
          description={DE.cta.description}
          secondaryHref="/de/preise"
          secondaryLabel={DE.cta.secondary}
        />
      </Section>

      <JsonLd
        nodes={[
          webPageSchema({
            path: '/de/lebenslauf-vorlagen',
            name: DE.gallery.metaTitle,
            description: DE.gallery.metaDescription,
            type: 'CollectionPage',
            inLanguage: 'de',
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
            DE.gallery.heading,
          ),
        ]}
      />
    </>
  );
}
