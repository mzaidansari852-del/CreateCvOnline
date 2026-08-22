import Link from 'next/link';

import { NL, NL_CATEGORY_SLUG } from '../../nl-copy';
import { dutchTemplateCopy } from '../../nl-template-copy';
import {
  Breadcrumbs,
  CtaBanner,
  FaqSection,
  RelatedLinks,
  Section,
  SectionHeading,
} from '@/components/marketing/primitives';
import { Badge } from '@/components/ui/feedback';
import { ButtonLink } from '@/components/ui/button';
import { CVDocument } from '@/components/cv/CVDocument';
import { JsonLd } from '@/components/seo/JsonLd';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import { TemplateImage, hasPreview } from '@/components/cv/TemplateImage';
import { createDefaultCustomization } from '@/lib/cv/defaults';
import { localiseCv } from '@/lib/i18n/cv-labels';
import { sampleCvFor } from '@/lib/cv/samples';
import { relatedTemplates, templateDefaults } from '@/lib/cv/template-registry';
import { faqSchema, templateSchema, webPageSchema } from '@/lib/seo/schema';
import { absoluteUrl } from '@/lib/site';
import type { TemplateDefinition } from '@/types/cv';

/**
 * A template's page, in Dutch.
 *
 * The sample CV goes through `localiseCv`, so the document on a Dutch page prints
 * `Werkervaring` and `Opleiding` rather than `Work Experience` and `Education`. A page
 * written in Dutch, selling Dutch cv templates, showing an English document is the most
 * visible thing that can be wrong with a translated gallery.
 *
 * The written copy comes from `dutchTemplateCopy`, which builds sentences out of the
 * template's structured facts rather than translating its English prose — see that file for
 * why, and for what it costs.
 */
export function DutchTemplatePage({ template }: { template: TemplateDefinition }) {
  const copy = dutchTemplateCopy(template);
  const category = NL.categories[template.category];
  const cv = localiseCv(sampleCvFor(template.id), 'nl');
  const customization = createDefaultCustomization({ ...templateDefaults(template) });
  const related = relatedTemplates(template.id, 4);
  const path = `/nl/cv-sjablonen/${template.slug}`;

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/nl' },
            { name: NL.gallery.heading, path: '/nl/cv-sjablonen' },
            {
              name: category.label,
              path: `/nl/cv-sjablonen/${NL_CATEGORY_SLUG[template.category]}`,
            },
            { name: template.name, path },
          ]}
        />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl">
              {copy.heading}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-pretty text-ink-600">{copy.lede}</p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {template.premium ? (
                <Badge tone="accent">Pro</Badge>
              ) : (
                <Badge tone="success">Gratis</Badge>
              )}
              <Badge tone="brand">{category.label}</Badge>
              <Badge tone="neutral">ATS {template.atsScore}/5</Badge>
              <Badge tone="neutral">
                {template.columns === 1 ? 'Eén kolom' : 'Twee kolommen'}
              </Badge>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href={`/register?template=${template.slug}`} size="lg">
                Dit sjabloon gebruiken
              </ButtonLink>
              <ButtonLink href="/nl/cv-sjablonen" size="lg" variant="outline">
                {NL.related.allTemplates}
              </ButtonLink>
            </div>

            <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              {copy.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-xs font-bold tracking-[0.08em] text-ink-500 uppercase">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-ink-900">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:sticky lg:top-24">
            {hasPreview(template.slug) ? (
              <TemplateImage
                template={template}
                width={360}
                locale="nl"
                sizes="(max-width: 1024px) 90vw, 360px"
                className="rounded-xl border border-ink-200 shadow-card"
              />
            ) : (
              <>
                <p className="sr-only">
                  Voorbeeld van het sjabloon {template.name}, weergegeven als volledige
                  pagina met een voorbeeld-cv. Het voorbeeld wordt gemaakt door dezelfde code
                  als je pdf.
                </p>
                {/* The sample document has headings of its own; hide it from assistive tech. */}
                <div aria-hidden className="flex justify-center">
                  <CVDocument
                    cv={cv}
                    customization={customization}
                    className="origin-top scale-[0.45] shadow-card"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <div className="grid gap-8 lg:grid-cols-3">
          {[
            { heading: copy.atsHeading, body: copy.atsBody },
            { heading: copy.layoutHeading, body: copy.layoutBody },
            { heading: copy.typeHeading, body: copy.typeBody },
          ].map((block) => (
            <div key={block.heading}>
              <h2 className="text-lg font-bold text-ink-950">{block.heading}</h2>
              <p className="mt-3 text-[15px] leading-[1.75] text-ink-700">{block.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section size="sm">
        <FaqSection entries={[...copy.faq]} title={copy.faqHeading} />
      </Section>

      <Section tone="muted" size="sm">
        <SectionHeading align="left" title="Vergelijkbare sjablonen" />
        <TemplateGrid className="mt-8" templates={related} columns={4} locale="nl" />
      </Section>

      <Section size="sm">
        <RelatedLinks
          title={NL.related.title}
          links={[
            {
              label: category.heading,
              href: `/nl/cv-sjablonen/${NL_CATEGORY_SLUG[template.category]}`,
              description: category.lede.split('.')[0] ?? undefined,
            },
            {
              label: NL.related.allTemplates,
              href: '/nl/cv-sjablonen',
              description: NL.related.allTemplatesDescription,
            },
            {
              label: `${template.name} in English`,
              href: `/templates/${template.slug}`,
              description: NL.related.englishSiteDescription,
            },
          ]}
        />
        <p className="mt-8 text-center text-sm text-ink-600">
          <Link href="/nl" className="font-medium text-brand-700 underline underline-offset-2">
            Terug naar de homepage
          </Link>
        </p>
      </Section>

      <Section tone="muted" size="sm">
        <CtaBanner
          primaryLabel={NL.cta.primary}
          title={NL.cta.title}
          description={NL.cta.description}
          secondaryHref="/nl/prijzen"
          secondaryLabel={NL.cta.secondary}
        />
      </Section>

      <JsonLd
        nodes={[
          webPageSchema({
            path,
            name: copy.metaTitle,
            description: copy.metaDescription,
            type: 'ItemPage',
            hasBreadcrumb: true,
            inLanguage: 'nl',
            primaryImage: hasPreview(template.slug)
              ? absoluteUrl(`/previews/${template.slug}.webp`)
              : undefined,
          }),
          templateSchema(template, {
            image: hasPreview(template.slug)
              ? absoluteUrl(`/previews/${template.slug}.webp`)
              : undefined,
            thumbnail: hasPreview(template.slug)
              ? absoluteUrl(`/previews/${template.slug}-card.webp`)
              : undefined,
          }),
          faqSchema([...copy.faq], { inLanguage: 'nl' }),
        ]}
      />
    </>
  );
}
