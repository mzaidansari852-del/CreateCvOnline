import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { NL, NL_CATEGORY_SLUG, categoryFromDutchSlug } from '../../nl-copy';
import { Badge } from '@/components/ui/feedback';
import { ButtonLink } from '@/components/ui/button';
import {
  Breadcrumbs,
  CtaBanner,
  RelatedLinks,
  Section,
  SectionHeading,
} from '@/components/marketing/primitives';
import { JsonLd } from '@/components/seo/JsonLd';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import { hasPreview, previewSrc } from '@/components/cv/TemplateImage';
import { templatePath } from '@/lib/i18n/locales';
import { DutchTemplatePage } from './DutchTemplatePage';
import { dutchTemplateCopy } from '../../nl-template-copy';
import {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  getTemplateBySlug,
  templatesByCategory,
} from '@/lib/cv/template-registry';
import { pageMetadata } from '@/lib/seo/metadata';
import { itemListSchema, webPageSchema } from '@/lib/seo/schema';
import { absoluteUrl } from '@/lib/site';

/**
 * A Dutch category page — `/nl/cv-sjablonen/modern` and its five siblings.
 *
 * The slug is Dutch, not the English category id with a prefix. `zakelijk` and `creatief`
 * are the words a Dutch searcher types; `corporate` and `creative` are what the registry
 * calls them, and putting the second in the URL would waste the one part of the address a
 * searcher reads. `categoryFromDutchSlug` is the single place the two vocabularies meet.
 *
 * Two of the six slugs are the same word in both languages — `modern` and `ats`. That is
 * fine and deliberate: the Dutch term genuinely is the English one, and inventing a
 * difference to make the table look symmetrical would cost the search signal it exists for.
 */

export function generateStaticParams() {
  return [
    ...TEMPLATE_CATEGORIES.map((category) => ({ slug: NL_CATEGORY_SLUG[category.id] })),
    ...TEMPLATES.map((template) => ({ slug: template.slug })),
  ];
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;

  const template = getTemplateBySlug(slug);
  if (template) {
    const templateCopy = dutchTemplateCopy(template);
    return pageMetadata({
      title: templateCopy.metaTitle,
      description: templateCopy.metaDescription,
      path: `/nl/cv-sjablonen/${slug}`,
      locale: 'nl',
      image: hasPreview(slug) ? absoluteUrl(`/previews/${slug}-og.jpg`) : undefined,
      keywords: [
        `cv sjabloon ${template.name.toLowerCase()}`,
        'cv sjabloon downloaden',
        'cv online invullen',
      ],
    });
  }

  const category = categoryFromDutchSlug(slug);
  if (!category) return { title: 'Niet gevonden' };

  const copy = NL.categories[category];
  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: `/nl/cv-sjablonen/${slug}`,
    locale: 'nl',
    keywords: [
      `cv sjabloon ${copy.label.toLowerCase()}`,
      `${copy.label.toLowerCase()} cv gratis`,
      'cv sjabloon downloaden',
    ],
  });
}

export default async function DutchTemplatesSlugPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  // A category slug and a template slug share one namespace here, exactly as they do on the
  // English, French and German sides. A test asserts the two sets never collide.
  const template = getTemplateBySlug(slug);
  if (template) return <DutchTemplatePage template={template} />;

  const category = categoryFromDutchSlug(slug);
  if (!category) notFound();

  const copy = NL.categories[category];
  const templates = templatesByCategory(category);
  const free = templates.filter((entry) => !entry.premium);
  const parserSafe = templates.filter((entry) => entry.atsScore === 5);

  const siblings = TEMPLATE_CATEGORIES.filter((entry) => entry.id !== category);

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/nl' },
            { name: NL.gallery.heading, path: '/nl/cv-sjablonen' },
            { name: copy.label, path: `/nl/cv-sjablonen/${slug}` },
          ]}
        />

        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl">
            {copy.heading}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-ink-600">{copy.lede}</p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge tone="brand">
              {templates.length} {NL.gallery.designsLabel}
            </Badge>
            {free.length > 0 ? (
              <Badge tone="success">
                {free.length} {NL.gallery.freeBadge}
              </Badge>
            ) : null}
            {parserSafe.length > 0 ? (
              <Badge tone="neutral">
                {parserSafe.length} {NL.gallery.atsLabel}
              </Badge>
            ) : null}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">
              {NL.gallery.ctaPrimary}
            </ButtonLink>
            <ButtonLink href="/nl/cv-sjablonen" size="lg" variant="outline">
              {NL.related.allTemplates}
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <SectionHeading align="left" title={copy.heading} />
        <TemplateGrid className="mt-8" templates={templates} columns={4} locale="nl" />
      </Section>

      <Section size="sm">
        <RelatedLinks
          title={NL.related.title}
          links={[
            ...siblings.map((entry) => ({
              label: NL.categories[entry.id].heading,
              href: `/nl/cv-sjablonen/${NL_CATEGORY_SLUG[entry.id]}`,
              description: NL.categories[entry.id].lede.split('.')[0] ?? undefined,
            })),
            {
              label: NL.related.allTemplates,
              href: '/nl/cv-sjablonen',
              description: NL.related.allTemplatesDescription,
            },
            {
              label: NL.related.englishSite,
              href: `/templates/${category}`,
              description: NL.related.englishSiteDescription,
            },
          ]}
        />
      </Section>

      <Section tone="muted" size="sm">
        <CtaBanner
          primaryLabel={NL.cta.primary}
          title={NL.cta.title}
          description={NL.cta.description}
          secondaryHref="/nl/prijzen"
          secondaryLabel={NL.cta.secondary}
          note={
            free.length > 0
              ? `${free.length} van deze ${templates.length} sjablonen zijn gratis.`
              : undefined
          }
        />
        <p className="mt-6 text-center text-sm text-ink-600">
          <Link href="/nl" className="font-medium text-brand-700 underline underline-offset-2">
            Terug naar de homepage
          </Link>
        </p>
      </Section>

      <JsonLd
        nodes={[
          webPageSchema({
            path: `/nl/cv-sjablonen/${slug}`,
            name: copy.metaTitle,
            description: copy.metaDescription,
            type: 'CollectionPage',
            hasBreadcrumb: true,
            inLanguage: 'nl',
            primaryImage: hasPreview(templates[0]?.slug ?? '')
              ? absoluteUrl(`/previews/${templates[0]!.slug}-card.webp`)
              : undefined,
          }),
          itemListSchema(
            templates.map((entry) => ({
              name: entry.name,
              path: templatePath(entry.slug, 'nl'),
              description: entry.tagline,
              image: hasPreview(entry.slug)
                ? absoluteUrl(previewSrc(entry.slug, 'card', 'nl'))
                : undefined,
            })),
            copy.heading,
          ),
        ]}
      />
    </>
  );
}
