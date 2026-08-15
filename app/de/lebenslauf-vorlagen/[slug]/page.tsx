import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { DE, DE_CATEGORY_SLUG, categoryFromGermanSlug } from '../../de-copy';
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
import { hasPreview } from '@/components/cv/TemplateImage';
import { GermanTemplatePage } from './GermanTemplatePage';
import { germanTemplateCopy } from '../../de-template-copy';
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
 * A French category page — `/de/lebenslauf-vorlagen/moderne` and its five siblings.
 *
 * The slug is French, not the English category id with a prefix. `moderne` and `creatif`
 * are the words in the query; `modern` and `creative` are what the database calls them,
 * and putting the second in the URL would waste the only part of the address a searcher
 * reads. `categoryFromGermanSlug` is the one place the two vocabularies meet.
 */

export function generateStaticParams() {
  return [
    ...TEMPLATE_CATEGORIES.map((category) => ({ slug: DE_CATEGORY_SLUG[category.id] })),
    ...TEMPLATES.map((template) => ({ slug: template.slug })),
  ];
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;

  const template = getTemplateBySlug(slug);
  if (template) {
    const templateCopy = germanTemplateCopy(template);
    return pageMetadata({
      title: templateCopy.metaTitle,
      description: templateCopy.metaDescription,
      path: `/de/lebenslauf-vorlagen/${slug}`,
      locale: 'de',
      image: hasPreview(slug) ? absoluteUrl(`/previews/${slug}-og.jpg`) : undefined,
      keywords: [
        `lebenslauf vorlage ${template.name.toLowerCase()}`,
        'lebenslauf vorlage kostenlos',
        'lebenslauf online ausfüllen',
      ],
    });
  }

  const category = categoryFromGermanSlug(slug);
  if (!category) return { title: 'Nicht gefunden' };

  const copy = DE.categories[category];
  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: `/de/lebenslauf-vorlagen/${slug}`,
    locale: 'de',
    keywords: [
      `lebenslauf vorlage ${copy.label.toLowerCase()}`,
      `${copy.label.toLowerCase()} lebenslauf muster`,
      'lebenslauf vorlage kostenlos',
    ],
  });
}

export default async function GermanTemplatesSlugPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  // A category slug and a template slug share one namespace here, exactly as they do on the
  // English side. A test asserts the two sets never collide.
  const template = getTemplateBySlug(slug);
  if (template) return <GermanTemplatePage template={template} />;

  const category = categoryFromGermanSlug(slug);
  if (!category) notFound();

  const copy = DE.categories[category];
  const templates = templatesByCategory(category);
  const free = templates.filter((template) => !template.premium);
  const parserSafe = templates.filter((template) => template.atsScore === 5);

  const siblings = TEMPLATE_CATEGORIES.filter((entry) => entry.id !== category);

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Startseite', path: '/de' },
            { name: DE.gallery.heading, path: '/de/lebenslauf-vorlagen' },
            { name: copy.label, path: `/de/lebenslauf-vorlagen/${slug}` },
          ]}
        />

        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl">
            {copy.heading}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-ink-600">{copy.lede}</p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge tone="brand">
              {templates.length} {DE.gallery.designsLabel}
            </Badge>
            {free.length > 0 ? (
              <Badge tone="success">
                {free.length} {DE.gallery.freeBadge}
              </Badge>
            ) : null}
            {parserSafe.length > 0 ? (
              <Badge tone="neutral">
                {parserSafe.length} {DE.gallery.atsLabel}
              </Badge>
            ) : null}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">
              {DE.gallery.ctaPrimary}
            </ButtonLink>
            <ButtonLink href="/de/lebenslauf-vorlagen" size="lg" variant="outline">
              {DE.related.allTemplates}
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <SectionHeading align="left" title={copy.heading} />
        <TemplateGrid className="mt-8" templates={templates} columns={4} locale="de" />
      </Section>

      <Section size="sm">
        <RelatedLinks
          title={DE.related.title}
          links={[
            ...siblings.map((entry) => ({
              label: DE.categories[entry.id].heading,
              href: `/de/lebenslauf-vorlagen/${DE_CATEGORY_SLUG[entry.id]}`,
              description: DE.categories[entry.id].lede.split('.')[0] ?? undefined,
            })),
            {
              label: DE.related.allTemplates,
              href: '/de/lebenslauf-vorlagen',
              description: DE.related.allTemplatesDescription,
            },
            {
              label: DE.related.englishSite,
              href: `/templates/${category}`,
              description: DE.related.englishSiteDescription,
            },
          ]}
        />
      </Section>

      <Section tone="muted" size="sm">
        <CtaBanner
          title={DE.cta.title}
          description={DE.cta.description}
          secondaryHref="/de/preise"
          secondaryLabel={DE.cta.secondary}
          note={
            free.length > 0
              ? `${free.length} dieser ${templates.length} Vorlagen sind kostenlos.`
              : undefined
          }
        />
        <p className="mt-6 text-center text-sm text-ink-600">
          <Link
            href="/de"
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            {DE.related.home}
          </Link>
        </p>
      </Section>

      <JsonLd
        nodes={[
          webPageSchema({
            path: `/de/lebenslauf-vorlagen/${slug}`,
            name: copy.metaTitle,
            description: copy.metaDescription,
            type: 'CollectionPage',
            hasBreadcrumb: true,
            inLanguage: 'de',
            primaryImage: hasPreview(templates[0]?.slug ?? '')
              ? absoluteUrl(`/previews/${templates[0]!.slug}-card.webp`)
              : undefined,
          }),
          itemListSchema(
            templates.map((template) => ({
              name: template.name,
              path: `/templates/${template.slug}`,
              description: template.tagline,
              image: hasPreview(template.slug)
                ? absoluteUrl(`/previews/${template.slug}-card.webp`)
                : undefined,
            })),
            copy.heading,
          ),
        ]}
      />
    </>
  );
}
