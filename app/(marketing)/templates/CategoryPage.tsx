import Link from 'next/link';
import type { Metadata } from 'next';

import { CATEGORY_COPY, categoryTemplates } from './category-copy';
import {
  Breadcrumbs,
  CtaBanner,
  FaqSection,
  FeatureGrid,
  RelatedLinks,
  Section,
  SectionHeading,
} from '@/components/marketing/primitives';
import { Badge } from '@/components/ui/feedback';
import { ButtonLink } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/JsonLd';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import { TEMPLATE_CATEGORIES } from '@/lib/cv/template-registry';
import { pageMetadata } from '@/lib/seo/metadata';
import { itemListSchema, webPageSchema } from '@/lib/seo/schema';
import { absoluteUrl } from '@/lib/site';
import { hasPreview } from '@/components/cv/TemplateImage';
import type { TemplateCategory, TemplateDefinition } from '@/types/cv';

/** The first template in the grid that actually has a picture — the page's own image. */
function firstPreview(templates: TemplateDefinition[]): string | undefined {
  const withPreview = templates.find((template) => hasPreview(template.slug));
  return withPreview ? absoluteUrl(`/previews/${withPreview.slug}-card.webp`) : undefined;
}

/**
 * A template category page.
 *
 * Served from the `/templates/[slug]` route, which resolves a category slug before it
 * tries a template slug — so `/templates/modern` is a real, statically generated,
 * indexable path rather than a `?category=` query view. A test asserts the two
 * namespaces never collide.
 */

export function categoryMetadata(category: TemplateCategory): Metadata {
  const copy = CATEGORY_COPY[category];
  const count = categoryTemplates(category).length;

  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: `/templates/${TEMPLATE_CATEGORIES.find((entry) => entry.id === category)?.slug ?? category}`,
    keywords: [
      `${category} cv templates`,
      `${category} resume templates`,
      `${count} ${category} cv designs`,
      'professional cv templates',
    ],
  });
}

export function CategoryPage({ category }: { category: TemplateCategory }) {
  const copy = CATEGORY_COPY[category];
  const meta = TEMPLATE_CATEGORIES.find((entry) => entry.id === category);
  const templates = categoryTemplates(category);
  const slug = meta?.slug ?? category;

  const free = templates.filter((template) => !template.premium);
  const parserSafe = templates.filter((template) => template.atsScore === 5);
  const singleColumn = templates.filter((template) => template.columns === 1);

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Templates', path: '/templates' },
            { name: meta?.label ?? category, path: `/templates/${slug}` },
          ]}
        />

        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl">
            {copy.heading}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-ink-600">{copy.lede}</p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge tone="brand">{templates.length} designs</Badge>
            {free.length > 0 ? <Badge tone="success">{free.length} free</Badge> : null}
            {parserSafe.length > 0 ? (
              <Badge tone="neutral">{parserSafe.length} rated 5/5 for ATS</Badge>
            ) : null}
            <Badge tone="neutral">{singleColumn.length} single-column</Badge>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">
              Start with a {meta?.label.toLowerCase() ?? category} template
            </ButtonLink>
            <ButtonLink href="/templates" size="lg" variant="outline">
              Browse every category
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <SectionHeading
          align="left"
          title={`Every ${meta?.label.toLowerCase() ?? category} template`}
          description={meta?.blurb}
        />
        <TemplateGrid className="mt-8" templates={templates} columns={4} />
      </Section>

      <Section size="sm">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-ink-950">Who these are for</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {copy.audience.forYou.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink-700">
                  <svg
                    className="mt-1 size-4 shrink-0 text-success-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="m5 12.5 4.5 4.5L19 7.5"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 rounded-xl border border-ink-200 bg-ink-50 p-4 text-sm leading-relaxed text-ink-700">
              <strong className="font-semibold text-ink-950">When to pick something else. </strong>
              {copy.audience.notForYou}
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-ink-950">What they have in common</h2>
            <div className="mt-4">
              <FeatureGrid columns={2} items={copy.characteristics} />
            </div>
          </div>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink-950">
            How {meta?.label.toLowerCase() ?? category} templates behave in an ATS
          </h2>
          <p className="mt-4 text-[15px] leading-[1.75] text-ink-700">{copy.ats}</p>
          <p className="mt-4 text-[15px] leading-[1.75] text-ink-700">
            The score shown on each template is our own heuristic, based on layout
            properties known to affect text extraction — column count, graphics, heading
            structure. It is not a certification, and no builder can test against every
            system in use. There is a full technical explanation on{' '}
            <Link
              href="/ats-cv"
              className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
            >
              our ATS guide
            </Link>
            .
          </p>
        </div>
      </Section>

      <Section size="sm">
        <FaqSection
          entries={copy.faq}
          title={`${meta?.label ?? category} template questions`}
        />
      </Section>

      <Section tone="muted" size="sm">
        <RelatedLinks
          title="Related categories and guides"
          links={[
            ...copy.related.map((related) => {
              const relatedMeta = TEMPLATE_CATEGORIES.find((entry) => entry.id === related);
              return {
                label: `${relatedMeta?.label ?? related} templates`,
                href: `/templates/${relatedMeta?.slug ?? related}`,
                description: relatedMeta?.blurb.split('.')[0] ?? undefined,
              };
            }),
            {
              label: 'All templates',
              href: '/templates',
              description: 'Every design in one filterable gallery.',
            },
            {
              label: 'CV advice by profession',
              href: '/cv-for',
              description: 'What your field expects, role by role.',
            },
            {
              label: 'ATS CV guide',
              href: '/ats-cv',
              description: 'How applicant tracking systems actually read a CV.',
            },
            {
              label: 'Online CV builder',
              href: '/cv-builder',
              description: 'The editor, live preview and PDF export.',
            },
          ]}
        />
      </Section>

      <Section size="sm">
        <CtaBanner
          title={`Start from a ${meta?.label.toLowerCase() ?? category} template`}
          description="Pick a design, fill in your history, and change your mind as often as you like — switching template never touches your content."
          secondaryHref="/pricing"
          secondaryLabel="See pricing"
          note={
            free.length > 0
              ? `${free.length} of these ${templates.length} designs are free on every plan.`
              : undefined
          }
        />
      </Section>

      <JsonLd
        nodes={[
          webPageSchema({
            path: `/templates/${slug}`,
            name: copy.metaTitle,
            description: copy.metaDescription,
            primaryImage: firstPreview(templates),
            hasBreadcrumb: true,
            type: 'CollectionPage',
          }),
          itemListSchema(
            templates.map((template) => ({
              name: template.name,
              path: `/templates/${template.slug}`,
              description: template.tagline,
              // The same file the grid renders, so the list describes what is on the page.
              image: hasPreview(template.slug)
                ? absoluteUrl(`/previews/${template.slug}-card.webp`)
                : undefined,
            })),
            `${meta?.label ?? category} CV templates`,
          ),
        ]}
      />
    </>
  );
}
