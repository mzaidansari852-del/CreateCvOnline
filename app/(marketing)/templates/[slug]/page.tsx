import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  Breadcrumbs,
  CtaBanner,
  Eyebrow,
  FaqSection,
  FeatureGrid,
  RelatedLinks,
  Section,
  SectionHeading,
} from '@/components/marketing/primitives';
import { Badge } from '@/components/ui/feedback';
import { ButtonLink } from '@/components/ui/button';
import { CVPagePreview } from '@/components/cv/CVThumbnail';
import { TemplateImage, hasPreview } from '@/components/cv/TemplateImage';
import { JsonLd } from '@/components/seo/JsonLd';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  categoryPath,
  getTemplateBySlug,
  relatedTemplates,
} from '@/lib/cv/template-registry';
import { CategoryPage, categoryMetadata } from '../CategoryPage';
import { categoryBySlug } from '../category-copy';
import { createDefaultCustomization } from '@/lib/cv/defaults';
import { sampleCvFor } from '@/lib/cv/samples';
import { cn } from '@/lib/utils/cn';
import { ogImageUrl, pageMetadata } from '@/lib/seo/metadata';
import { absoluteUrl } from '@/lib/site';
import { itemListSchema, templateSchema, webPageSchema } from '@/lib/seo/schema';
import type { TemplateMeta } from '@/types/cv';

import {
  atsBandLabel,
  atsNarrative,
  categoryLabel,
  columnsLabel,
  customisationItems,
  ledeSentence,
  planLabel,
  templateFaq,
  templateHeading,
  templateMetaDescription,
  templateMetaTitle,
  exampleUseCases,
} from '../template-copy';

/**
 * One page per template.
 *
 * All 56 are statically generated. The copy is assembled in `../template-copy` from the
 * template's own hand-written metadata plus sentences selected on the axes that change
 * the advice — category, columns, photo support and ATS score — so a two-column creative
 * layout and a one-column ATS layout do not end up describing themselves in the same
 * words.
 */

/**
 * This route serves two things from one segment: the six category pages
 * (`/templates/modern`) and the 56 template pages (`/templates/modern-professional`).
 *
 * Category slugs are resolved first. The two namespaces are disjoint — no template slug
 * is a bare category name — and a test in `tests/content/integrity.test.ts` fails the
 * build if that ever stops being true.
 */
export function generateStaticParams(): { slug: string }[] {
  return [
    ...TEMPLATE_CATEGORIES.map((category) => ({ slug: category.slug })),
    ...TEMPLATES.map((template) => ({ slug: template.slug })),
  ];
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;

  const category = categoryBySlug(slug);
  if (category) return categoryMetadata(category);

  const template = getTemplateBySlug(slug);

  if (!template) {
    return pageMetadata({
      title: 'Template not found',
      description: 'This CV template does not exist. Browse the full gallery instead.',
      path: `/templates/${slug}`,
      noindex: true,
    });
  }

  return pageMetadata({
    title: templateMetaTitle(template),
    description: templateMetaDescription(template),
    path: `/templates/${template.slug}`,
    keywords: template.keywords,
    /*
     * The generated card, not `/api/og`. `robots.txt` disallows `/api/`, so the previous
     * value was unfetchable by any crawler that respects it — the pages had no social
     * image at all. This one is a static file under `/previews/`.
     */
    image: hasPreview(template.slug)
      ? absoluteUrl(`/previews/${template.slug}-og.jpg`)
      : ogImageUrl(templateHeading(template), template.tagline),
  });
}

/* -------------------------------------------------------------------------- */
/* Small presentational pieces                                                 */
/* -------------------------------------------------------------------------- */

/** The ATS score as a five-dot meter. Text alternative first, dots second. */
function AtsMeter({ score, className }: { score: number; className?: string }) {
  const filled = Math.max(0, Math.min(5, Math.round(score)));
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="sr-only">ATS score {filled} out of 5</span>
      <span aria-hidden className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((dot) => (
          <span
            key={dot}
            className={cn(
              'size-2.5 rounded-full',
              dot <= filled
                ? filled >= 5
                  ? 'bg-success-500'
                  : filled === 4
                    ? 'bg-brand-600'
                    : filled === 3
                      ? 'bg-warning-500'
                      : 'bg-danger-500'
                : 'bg-ink-200',
            )}
          />
        ))}
      </span>
      <span aria-hidden className="text-sm font-semibold text-ink-950">
        {filled}/5
      </span>
    </span>
  );
}

function SpecRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink-100 py-2.5 last:border-b-0">
      <dt className="text-[13px] font-medium text-ink-600">{label}</dt>
      <dd className="text-right text-[13px] font-semibold text-ink-950">{children}</dd>
    </div>
  );
}

function TickList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink-700">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className="mt-0.5 shrink-0 text-brand-600"
          >
            <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" opacity="0.35" />
            <path
              d="m8.2 12.3 2.5 2.5 5.1-5.4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function photoLabel(template: TemplateMeta): string {
  return template.hasPhoto ? 'Supported (optional)' : 'Not included';
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default async function TemplateDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  const categoryView = categoryBySlug(slug);
  if (categoryView) return <CategoryPage category={categoryView} />;

  const template = getTemplateBySlug(slug);
  if (!template) notFound();

  const cv = sampleCvFor(template.id);
  const customization = createDefaultCustomization({
    templateId: template.id,
    accentColor: template.accentDefault,
  });

  const category = categoryLabel(template.category);
  const ats = atsNarrative(template);
  const scenarios = exampleUseCases(template);
  const related = relatedTemplates(template.id, 6);
  const faq = templateFaq(template);
  const previewImage = hasPreview(template.slug)
    ? absoluteUrl(`/previews/${template.slug}.webp`)
    : null;

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'CV templates', path: '/templates' },
            { name: template.name, path: `/templates/${template.slug}` },
          ]}
        />

        <div className="max-w-3xl">
          <Eyebrow>
            {category} · {columnsLabel(template.columns)} · ATS {template.atsScore}/5
          </Eyebrow>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl">
            {templateHeading(template)}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-ink-700">
            {template.tagline}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-pretty text-ink-600">
            {ledeSentence(template)}
          </p>
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
          <div className="rounded-2xl border border-ink-200 bg-ink-50 p-4 sm:p-8">
            {hasPreview(template.slug) ? (
              /*
               * A picture, not a live document. It is the same render — the file is a
               * screenshot of this very page — but as an image it can be indexed by Google
               * Images, weighs 114KB instead of ~80KB of inline DOM repeated in the RSC
               * payload, and needs no `aria-hidden` gymnastics to keep the sample CV's
               * headings out of the page outline.
               */
              <div className="flex justify-center">
                <TemplateImage
                  template={template}
                  variant="full"
                  width={560}
                  priority
                  sizes="(max-width: 640px) 280px, 560px"
                  className="max-w-[280px] rounded-xl shadow-page sm:max-w-[560px]"
                />
              </div>
            ) : (
              <>
                <p className="sr-only">
                  Live preview of the {template.name} template, rendered at full page size with
                  an example CV. The preview is the same code that generates your PDF.
                </p>
                {/* The sample document has its own headings; hide it from assistive tech. */}
                <div aria-hidden className="flex justify-center">
                  <CVPagePreview
                    cv={cv}
                    customization={customization}
                    maxWidth={280}
                    className="sm:hidden"
                  />
                  <CVPagePreview
                    cv={cv}
                    customization={customization}
                    maxWidth={560}
                    className="hidden sm:block"
                  />
                </div>
              </>
            )}
          </div>

          <aside className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-ink-950">At a glance</h2>
              {template.premium ? <Badge tone="accent">Pro</Badge> : <Badge tone="success">Free</Badge>}
            </div>

            <dl className="mt-4">
              <SpecRow label="Category">{category}</SpecRow>
              <SpecRow label="Layout">{columnsLabel(template.columns)}</SpecRow>
              <SpecRow label="Photo">{photoLabel(template)}</SpecRow>
              <SpecRow label="Plan">{planLabel(template.premium)}</SpecRow>
              <SpecRow label="Paper">A4 or US Letter</SpecRow>
            </dl>

            <div className="mt-4 rounded-xl bg-ink-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-medium text-ink-600">ATS compatibility</span>
                <AtsMeter score={template.atsScore} />
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">
                {atsBandLabel(template.atsScore)} —{' '}
                <Link
                  href="#ats"
                  className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
                >
                  what this score means
                </Link>
                .
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <ButtonLink href={`/register?template=${template.id}`} size="lg" fullWidth>
                Use this template
              </ButtonLink>
              <ButtonLink href="/templates" size="lg" variant="outline" fullWidth>
                Browse all templates
              </ButtonLink>
            </div>
            <p className="mt-3 text-center text-[13px] leading-relaxed text-ink-500">
              {template.premium
                ? 'Included with Pro and Lifetime. Free accounts can start here and upgrade before downloading.'
                : 'Free to use — no credit card, and the PDF download is included.'}
            </p>
          </aside>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          as="h2"
          eyebrow="The design"
          title={`About the ${template.name} layout`}
          description={template.description}
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-ink-200 bg-white p-6">
            <h3 className="text-lg font-bold text-ink-950">Who it’s for</h3>
            <p className="mt-1.5 mb-5 text-sm text-ink-600">
              The readers and situations this layout was drawn for.
            </p>
            <TickList items={template.bestFor} />
          </div>
          <div className="rounded-2xl border border-ink-200 bg-white p-6">
            <h3 className="text-lg font-bold text-ink-950">Key features</h3>
            <p className="mt-1.5 mb-5 text-sm text-ink-600">
              What is actually different about this template on the page.
            </p>
            <TickList items={template.features} />
          </div>
        </div>
      </Section>

      <Section id="ats">
        <SectionHeading
          align="left"
          as="h2"
          eyebrow={`ATS score ${template.atsScore}/5 · ${atsBandLabel(template.atsScore)}`}
          title="How this layout behaves in an applicant tracking system"
        />

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
          <div className="max-w-3xl text-[15px] leading-[1.75] text-ink-700">
            <p>{ats.verdict}</p>
            <p className="mt-4">{ats.mechanics}</p>
            {ats.caveat ? <p className="mt-4">{ats.caveat}</p> : null}
            <p className="mt-4">
              {ats.advice.before}
              <Link
                href="/ats-cv"
                className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
              >
                {ats.advice.linkLabel}
              </Link>
              {ats.advice.after}
            </p>
          </div>

          <div className="rounded-2xl border border-ink-200 bg-ink-50 p-6">
            <span className="text-2xs font-bold tracking-[0.12em] text-ink-500 uppercase">
              Parsing checklist
            </span>
            <AtsMeter score={template.atsScore} className="mt-3" />
            <dl className="mt-4 flex flex-col gap-2.5 text-[13px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-600">Reading order</dt>
                <dd className="font-semibold text-ink-950">
                  {template.columns === 1 ? 'Single flow' : 'Two blocks'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-600">Headings</dt>
                <dd className="font-semibold text-ink-950">Real text</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-600">Tables</dt>
                <dd className="font-semibold text-ink-950">None</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-600">Images</dt>
                <dd className="font-semibold text-ink-950">
                  {template.hasPhoto ? 'Photo only, optional' : 'None'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-600">Selectable text</dt>
                <dd className="font-semibold text-ink-950">Yes</dd>
              </div>
            </dl>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-600">
              Scores are our own assessment of how a parser handles the layout — never a
              guarantee about one specific employer’s system.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          as="h2"
          eyebrow="In practice"
          title={`Three situations ${template.name} is the right answer to`}
          description="Templates are chosen badly when they are chosen in the abstract. Here is what sending this one actually looks like."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {scenarios.map((scenario, index) => (
            <div key={scenario.title} className="rounded-2xl border border-ink-200 bg-white p-6">
              <span className="text-2xs font-bold tracking-[0.12em] text-brand-700 uppercase">
                Case {index + 1}
              </span>
              <h3 className="mt-2 text-base font-bold text-ink-950">{scenario.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-600">{scenario.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          as="h2"
          eyebrow="Make it yours"
          title={`Customising ${template.name}`}
          /*
            Renaming sections, switching paper size, reordering — those are true of all 56
            templates, and spelling them out on each one is how a page ends up sharing four
            fifths of its phrasing with its neighbours. They live on the pages that own them
            and are linked from here; what stays below is only what changes with this design.
          */
          description={
            <>
              Every control — colours, fonts, spacing, section order, paper size — is in the{' '}
              <Link
                href="/cv-builder"
                className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
              >
                CV builder
              </Link>
              , with the preview updating as you change them. Three of them behave differently
              in this layout than in the others.
            </>
          }
        />
        <div className="mt-10">
          <FeatureGrid items={customisationItems(template)} columns={3} />
        </div>
      </Section>

      <Section tone="muted">
        <FaqSection entries={faq} title={`${template.name}: common questions`} />
      </Section>

      <Section>
        <SectionHeading
          align="left"
          as="h2"
          eyebrow="Alternatives"
          title="Related templates"
          description={`Other layouts worth comparing before you commit — the closest matches from ${category} first, then designs with a similar ATS score from other families.`}
        />
        <TemplateGrid templates={related} className="mt-8" columns={3} />

        <div className="mt-14">
          <RelatedLinks
            title="Keep exploring"
            links={[
              {
                label: `All ${category.toLowerCase()} templates`,
                href: categoryPath(template.category),
                description: `Every design in the ${category} family, side by side.`,
              },
              {
                label: template.columns === 1 ? 'One-column templates' : 'Two-column templates',
                href: `/templates?columns=${template.columns}`,
                description:
                  template.columns === 1
                    ? 'The full single-column range, across all six categories.'
                    : 'Every split-page layout, for CVs with a lot to fit in.',
              },
              {
                label: 'CV templates',
                href: '/cv-templates',
                description: 'Formats, page counts and conventions by country and career stage.',
              },
              {
                label: 'ATS CV templates',
                href: '/ats-cv',
                description: 'What a parser does with your file, and the layouts built to survive it.',
              },
              {
                label: 'CV examples',
                href: '/cv-examples',
                description: 'Worked examples by role, with the wording and structure explained.',
              },
              {
                label: template.premium ? 'Pricing and plans' : 'Free CV templates',
                href: template.premium ? '/pricing' : '/templates?plan=free',
                description: template.premium
                  ? 'What Pro unlocks, and how the one-off Lifetime plan compares.'
                  : 'Every template you can use and download without paying.',
              },
            ]}
          />
        </div>
      </Section>

      <Section size="sm">
        <CtaBanner
          title={`Start your CV with ${template.name}`}
          description={`Open it with the example content already in place, replace it with your own, and download a PDF when it reads the way you want. Switching to another template later keeps every word you have written.`}
          primaryHref={`/register?template=${template.id}`}
          primaryLabel="Use this template"
          secondaryHref="/templates"
          secondaryLabel="Compare other designs"
          note={
            template.premium
              ? 'Free to start. A Pro or Lifetime plan unlocks this design and every other one.'
              : 'Free plan, free download, no credit card.'
          }
        />
      </Section>

      {/*
        Three nodes, one page.

        `WebPage` is the anchor: its `@id` is the canonical URL, so the CreativeWork's
        `mainEntityOfPage` and the BreadcrumbList emitted by `<Breadcrumbs>` above both
        resolve to the same thing instead of floating unattached. The `ItemList` describes
        the related grid — six real links, in the order they appear, each with its own
        picture — which is what turns "six thumbnails" into six understood entities rather
        than decoration.
      */}
      <JsonLd
        nodes={[
          webPageSchema({
            path: `/templates/${template.slug}`,
            name: templateMetaTitle(template),
            description: templateMetaDescription(template),
            primaryImage: previewImage ?? undefined,
            hasBreadcrumb: true,
            type: 'ItemPage',
          }),
          templateSchema(template, {
            image: previewImage ?? undefined,
            thumbnail: hasPreview(template.slug)
              ? absoluteUrl(`/previews/${template.slug}-card.webp`)
              : undefined,
          }),
          itemListSchema(
            related.map((item) => ({
              name: `${item.name} CV template`,
              path: `/templates/${item.slug}`,
              description: item.tagline,
              image: hasPreview(item.slug)
                ? absoluteUrl(`/previews/${item.slug}-card.webp`)
                : undefined,
            })),
            `Templates related to ${template.name}`,
          ),
        ]}
      />
    </>
  );
}
