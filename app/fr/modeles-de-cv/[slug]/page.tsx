import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { FR, FR_CATEGORY_SLUG, categoryFromFrenchSlug } from '../../fr-copy';
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
import { FrenchTemplatePage } from './FrenchTemplatePage';
import { frenchTemplateCopy } from '../../fr-template-copy';
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
 * A French category page — `/fr/modeles-de-cv/moderne` and its five siblings.
 *
 * The slug is French, not the English category id with a prefix. `moderne` and `creatif`
 * are the words in the query; `modern` and `creative` are what the database calls them,
 * and putting the second in the URL would waste the only part of the address a searcher
 * reads. `categoryFromFrenchSlug` is the one place the two vocabularies meet.
 */

export function generateStaticParams() {
  return [
    ...TEMPLATE_CATEGORIES.map((category) => ({ slug: FR_CATEGORY_SLUG[category.id] })),
    ...TEMPLATES.map((template) => ({ slug: template.slug })),
  ];
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;

  const template = getTemplateBySlug(slug);
  if (template) {
    const templateCopy = frenchTemplateCopy(template);
    return pageMetadata({
      title: templateCopy.metaTitle,
      description: templateCopy.metaDescription,
      path: `/fr/modeles-de-cv/${slug}`,
      locale: 'fr',
      image: hasPreview(slug) ? absoluteUrl(`/previews/${slug}-og.jpg`) : undefined,
      keywords: [
        `modèle de cv ${template.name.toLowerCase()}`,
        'modèle de cv à télécharger',
        'cv à remplir en ligne',
      ],
    });
  }

  const category = categoryFromFrenchSlug(slug);
  if (!category) return { title: 'Introuvable' };

  const copy = FR.categories[category];
  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: `/fr/modeles-de-cv/${slug}`,
    locale: 'fr',
    keywords: [
      `modèle de cv ${copy.label.toLowerCase()}`,
      `cv ${copy.label.toLowerCase()} gratuit`,
      'modèle de cv à télécharger',
    ],
  });
}

export default async function FrenchTemplatesSlugPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  // A category slug and a template slug share one namespace here, exactly as they do on the
  // English side. A test asserts the two sets never collide.
  const template = getTemplateBySlug(slug);
  if (template) return <FrenchTemplatePage template={template} />;

  const category = categoryFromFrenchSlug(slug);
  if (!category) notFound();

  const copy = FR.categories[category];
  const templates = templatesByCategory(category);
  const free = templates.filter((template) => !template.premium);
  const parserSafe = templates.filter((template) => template.atsScore === 5);

  const siblings = TEMPLATE_CATEGORIES.filter((entry) => entry.id !== category);

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Accueil', path: '/fr' },
            { name: FR.gallery.heading, path: '/fr/modeles-de-cv' },
            { name: copy.label, path: `/fr/modeles-de-cv/${slug}` },
          ]}
        />

        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl">
            {copy.heading}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-ink-600">{copy.lede}</p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge tone="brand">
              {templates.length} {FR.gallery.designsLabel}
            </Badge>
            {free.length > 0 ? (
              <Badge tone="success">
                {free.length} {FR.gallery.freeBadge}
              </Badge>
            ) : null}
            {parserSafe.length > 0 ? (
              <Badge tone="neutral">
                {parserSafe.length} {FR.gallery.atsLabel}
              </Badge>
            ) : null}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">
              {FR.gallery.ctaPrimary}
            </ButtonLink>
            <ButtonLink href="/fr/modeles-de-cv" size="lg" variant="outline">
              {FR.related.allTemplates}
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <SectionHeading align="left" title={copy.heading} />
        <TemplateGrid className="mt-8" templates={templates} columns={4} locale="fr" />
      </Section>

      <Section size="sm">
        <RelatedLinks
          title={FR.related.title}
          links={[
            ...siblings.map((entry) => ({
              label: FR.categories[entry.id].heading,
              href: `/fr/modeles-de-cv/${FR_CATEGORY_SLUG[entry.id]}`,
              description: FR.categories[entry.id].lede.split('.')[0] ?? undefined,
            })),
            {
              label: FR.related.allTemplates,
              href: '/fr/modeles-de-cv',
              description: FR.related.allTemplatesDescription,
            },
            {
              label: FR.related.englishSite,
              href: `/templates/${category}`,
              description: FR.related.englishSiteDescription,
            },
          ]}
        />
      </Section>

      <Section tone="muted" size="sm">
        <CtaBanner
          primaryLabel={FR.cta.primary}
          title={FR.cta.title}
          description={FR.cta.description}
          secondaryHref="/fr/tarifs"
          secondaryLabel={FR.cta.secondary}
          note={
            free.length > 0
              ? `${free.length} de ces ${templates.length} modèles sont gratuits.`
              : undefined
          }
        />
        <p className="mt-6 text-center text-sm text-ink-600">
          <Link
            href="/fr"
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            Retour à l’accueil
          </Link>
        </p>
      </Section>

      <JsonLd
        nodes={[
          webPageSchema({
            path: `/fr/modeles-de-cv/${slug}`,
            name: copy.metaTitle,
            description: copy.metaDescription,
            type: 'CollectionPage',
            hasBreadcrumb: true,
            inLanguage: 'fr',
            primaryImage: hasPreview(templates[0]?.slug ?? '')
              ? absoluteUrl(`/previews/${templates[0]!.slug}-card.webp`)
              : undefined,
          }),
          /*
           * The members are the French pages, not the English ones.
           *
           * This listed `/templates/{slug}` — the same defect the gallery page's own
           * comment describes and fixed there, left behind on the category pages. A French
           * `CollectionPage` whose every member is an English URL contradicts the hreflang
           * cluster it sits inside, and invites Google to read the French page as a thin
           * wrapper around English content.
           */
          itemListSchema(
            templates.map((template) => ({
              name: template.name,
              path: templatePath(template.slug, 'fr'),
              description: template.tagline,
              image: hasPreview(template.slug)
                ? absoluteUrl(previewSrc(template.slug, 'card', 'fr'))
                : undefined,
            })),
            copy.heading,
          ),
        ]}
      />
    </>
  );
}
