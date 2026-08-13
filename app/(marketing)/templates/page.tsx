import Link from 'next/link';
import type { Metadata } from 'next';

import {
  Breadcrumbs,
  CtaBanner,
  FaqSection,
  FeatureGrid,
  RelatedLinks,
  Section,
  SectionHeading,
} from '@/components/marketing/primitives';
import { ButtonLink, buttonClasses } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/feedback';
import { JsonLd } from '@/components/seo/JsonLd';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import {
  FREE_TEMPLATE_COUNT,
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  TEMPLATE_COUNT,
  searchTemplates,
} from '@/lib/cv/template-registry';
import { cn } from '@/lib/utils/cn';
import { itemListSchema } from '@/lib/seo/schema';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';
import type { TemplateCategory, TemplateDefinition } from '@/types/cv';

import { templateHeading } from './template-copy';

/**
 * The template gallery.
 *
 * Every filter is a `next/link` that writes to the query string, so the page stays a
 * server component, works with JavaScript disabled, and gives each combination a real
 * URL that can be crawled, bookmarked and shared. The search box is a plain `GET` form
 * for the same reason — no client bundle is needed to filter 56 templates.
 */

/* -------------------------------------------------------------------------- */
/* Filter state                                                                */
/* -------------------------------------------------------------------------- */

type PlanFilter = 'free' | 'pro';
type ColumnsFilter = 1 | 2;
type AtsFilter = 4 | 5;

interface Filters {
  category: TemplateCategory | null;
  plan: PlanFilter | null;
  columns: ColumnsFilter | null;
  ats: AtsFilter | null;
  q: string;
}

type SearchParams = Record<string, string | string[] | undefined>;

const EMPTY_FILTERS: Filters = { category: null, plan: null, columns: null, ats: null, q: '' };

function firstValue(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === 'string' ? raw.trim() : '';
}

function parseFilters(params: SearchParams): Filters {
  const category = firstValue(params.category);
  const plan = firstValue(params.plan);
  const columns = firstValue(params.columns);
  const ats = firstValue(params.ats);

  return {
    category: TEMPLATE_CATEGORIES.some((entry) => entry.id === category)
      ? (category as TemplateCategory)
      : null,
    plan: plan === 'free' || plan === 'pro' ? plan : null,
    columns: columns === '1' ? 1 : columns === '2' ? 2 : null,
    ats: ats === '5' ? 5 : ats === '4' ? 4 : null,
    q: firstValue(params.q).slice(0, 60),
  };
}

function isFiltered(filters: Filters): boolean {
  return Boolean(filters.category || filters.plan || filters.columns || filters.ats || filters.q);
}

/** Builds the URL for a filter change, preserving everything else. */
function hrefFor(filters: Filters, patch: Partial<Filters> = {}): string {
  const next = { ...filters, ...patch };
  const params = new URLSearchParams();
  if (next.category) params.set('category', next.category);
  if (next.plan) params.set('plan', next.plan);
  if (next.columns) params.set('columns', String(next.columns));
  if (next.ats) params.set('ats', String(next.ats));
  if (next.q) params.set('q', next.q);
  const query = params.toString();
  return query ? `/templates?${query}` : '/templates';
}

function applyFilters(filters: Filters): TemplateDefinition[] {
  let results = filters.q ? searchTemplates(filters.q) : TEMPLATES;
  if (filters.category) results = results.filter((t) => t.category === filters.category);
  if (filters.plan) results = results.filter((t) => (filters.plan === 'pro' ? t.premium : !t.premium));
  if (filters.columns) results = results.filter((t) => t.columns === filters.columns);
  if (filters.ats) results = results.filter((t) => t.atsScore >= (filters.ats ?? 0));
  return results;
}

/** Human summary of the active filters — used in the heading, the count line and metadata. */
function describeFilters(filters: Filters): string[] {
  const parts: string[] = [];
  if (filters.category) {
    parts.push(TEMPLATE_CATEGORIES.find((entry) => entry.id === filters.category)?.label ?? '');
  }
  if (filters.plan) parts.push(filters.plan === 'free' ? 'free' : 'Pro');
  if (filters.columns) parts.push(filters.columns === 1 ? 'one column' : 'two columns');
  if (filters.ats) parts.push(filters.ats === 5 ? 'ATS score 5/5' : 'ATS score 4 or better');
  if (filters.q) parts.push(`matching “${filters.q}”`);
  return parts.filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                    */
/* -------------------------------------------------------------------------- */

export async function generateMetadata(props: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const filters = parseFilters(await props.searchParams);
  const matches = applyFilters(filters);
  const description = describeFilters(filters);

  if (description.length === 0) {
    return pageMetadata({
      title: `CV Templates — ${TEMPLATE_COUNT} Professional Designs`,
      description: `Browse all ${TEMPLATE_COUNT} professional CV templates: modern, corporate, creative, technology, classic and ATS-friendly designs. Filter by ATS score, column count and plan — ${FREE_TEMPLATE_COUNT} are free.`,
      path: '/templates',
      keywords: [
        'cv templates',
        'professional cv templates',
        'free cv templates',
        'ats cv templates',
        'resume templates',
        'cv template download',
      ],
    });
  }

  const label = description.join(', ');
  return pageMetadata({
    title: `${label.charAt(0).toUpperCase()}${label.slice(1)} CV templates (${matches.length})`,
    description: `${matches.length} of our ${TEMPLATE_COUNT} CV templates match: ${label}. Preview each design at full size, then edit it online and download a PDF.`,
    path: hrefFor(filters),
    // Search-result URLs are unbounded and thin; facet URLs are finite and worth indexing.
    noindex: Boolean(filters.q),
  });
}

/* -------------------------------------------------------------------------- */
/* Filter UI                                                                   */
/* -------------------------------------------------------------------------- */

function chipClass(active: boolean): string {
  return cn(
    'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
    active
      ? 'border-brand-600 bg-brand-600 text-white hover:bg-brand-700'
      : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700',
  );
}

function FilterRow({
  label,
  options,
  filters,
}: {
  label: string;
  options: { label: string; patch: Partial<Filters>; active: boolean }[];
  filters: Filters;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-full text-2xs font-bold tracking-[0.12em] text-ink-500 uppercase sm:w-24">
        {label}
      </span>
      {options.map((option) => (
        <Link
          key={option.label}
          href={hrefFor(filters, option.patch)}
          className={chipClass(option.active)}
          aria-current={option.active ? 'true' : undefined}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page copy                                                                   */
/* -------------------------------------------------------------------------- */

const HOW_TO_CHOOSE = [
  {
    title: 'Start with the ATS score',
    description:
      'If your application goes through an online portal, a machine reads it before a person does. A 5/5 layout is plain on purpose; a 2/5 layout is a designed object that a parser will flatten. Filter by score and the decision makes itself.',
  },
  {
    title: 'One column or two',
    description:
      'One column parses more reliably and reads faster. Two columns buy you room for a long list of skills, licences or languages without pushing your experience onto a third page. Density is the only real argument for a split page.',
  },
  {
    title: 'Photo or no photo',
    description:
      'A portrait is conventional in much of Europe, North Africa, the Middle East and Asia, and discouraged in the UK, US, Canada and Ireland. Every template with a photo slot can also run without one.',
  },
  {
    title: 'Match the industry, not your taste',
    description:
      'A design studio and a ministry are reading for different signals. Corporate and classic layouts reward restraint; creative layouts treat the CV as a work sample; technology layouts make room for a stack and side projects.',
  },
];

const GALLERY_FAQ = [
  {
    question: 'Which CV template should I choose?',
    answer:
      'Work backwards from who reads it first. If you are uploading to a large employer’s careers portal, pick a template with an ATS score of 5 and a single column. If a named person opens the file — a founder, a studio lead, a hiring manager you have spoken to — you can afford a designed layout. Then match the category to the sector: corporate and classic for finance, law and government; technology for engineering; creative for design and media.',
  },
  {
    question: 'What does the ATS score mean?',
    answer:
      'It is our rating, from 1 to 5, of how reliably an applicant tracking system can extract the content from that layout. A 5 means one column, real headings, no tables, no text inside images and no icon fonts, so the file reads back the way you wrote it. Lower scores indicate layouts where columns, panels or decorative elements can cause a parser to re-order or flatten the text. Every score is stated on the template’s own page, along with what specifically costs it points.',
  },
  {
    question: `How many of the ${TEMPLATE_COUNT} templates are free?`,
    answer: `${FREE_TEMPLATE_COUNT} templates are available on the free plan, including the highest-scoring ATS layouts, and the free plan lets you build a CV and download it as a PDF. The remaining designs are part of Pro, which also adds unlimited CVs, unlimited downloads, custom sections and full control over fonts and spacing. Use the Free filter to see exactly what is included before you create an account.`,
  },
  {
    question: 'Can I switch template after I have written my CV?',
    answer:
      'Yes, at any point, and you will not lose anything. Every template consumes the same normalised data, so switching is a single click in the editor and your sections, dates and bullet points move across untouched. Most people write in a plain layout and try three or four designs at the end.',
  },
  {
    question: 'Should my CV include a photo?',
    answer:
      'It depends on the market. In France, Germany, Spain, Morocco, the Gulf and much of Asia a photograph is normal and its absence can look like an omission. In the UK, US, Canada and Ireland it is discouraged, and some employers strip photos before review to keep hiring defensible. Filter for templates with photo support if you need one — and remember the photo can always be switched off for a specific application.',
  },
  {
    question: 'Are these templates suitable for a resume as well as a CV?',
    answer:
      'Yes. The difference is mostly length and paper size: a US resume is typically one page on US Letter, while a CV can run to two or three pages on A4. Every template here supports both paper sizes and re-flows rather than scaling, so the same design works for either. The ATS category in particular includes layouts drawn to the North American convention.',
  },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default async function TemplatesPage(props: { searchParams: Promise<SearchParams> }) {
  const filters = parseFilters(await props.searchParams);
  const matches = applyFilters(filters);
  const filtered = isFiltered(filters);
  const summary = describeFilters(filters);
  const grouped = filters.category === null;

  const categoryOptions = TEMPLATE_CATEGORIES.map((entry) => ({
    label: entry.label,
    patch: { category: filters.category === entry.id ? null : entry.id },
    active: filters.category === entry.id,
  }));

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'CV templates', path: '/templates' },
          ]}
        />
        <SectionHeading
          as="h1"
          align="left"
          eyebrow={`${TEMPLATE_COUNT} designs · ${FREE_TEMPLATE_COUNT} free`}
          title="Professional CV templates"
          description={
            <>
              <p>
                Every template below is a real, working layout — not a picture of one. What you
                see in each preview is the document you get, rendered by the same code that
                produces your PDF, filled with a complete example CV so you can judge how a long
                job history actually sits on the page.
              </p>
              <p className="mt-3">
                They are grouped into six families and rated 1–5 for how reliably an applicant
                tracking system can read them. Filter by category, plan, column count or ATS
                score; each filtered view has its own address, so you can bookmark or share the
                shortlist you end up with.
              </p>
            </>
          }
        />

        <div className="mt-10">
          <FeatureGrid items={HOW_TO_CHOOSE} columns={4} />
        </div>
      </Section>

      <Section tone="muted" size="sm" id="browse">
        <div className="rounded-2xl border border-ink-200 bg-white p-5 sm:p-6">
          <form action="/templates" method="get" role="search" className="flex flex-wrap gap-2">
            <label htmlFor="template-search" className="sr-only">
              Search templates by name, style or role
            </label>
            <input
              id="template-search"
              type="search"
              name="q"
              defaultValue={filters.q}
              maxLength={60}
              placeholder="Search templates — “banking”, “student”, “minimal”, “two column”…"
              className="h-10 min-w-0 flex-1 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 focus:outline-none"
            />
            {/* Keep the active facets when the form submits — no JavaScript involved. */}
            {filters.category ? <input type="hidden" name="category" value={filters.category} /> : null}
            {filters.plan ? <input type="hidden" name="plan" value={filters.plan} /> : null}
            {filters.columns ? <input type="hidden" name="columns" value={String(filters.columns)} /> : null}
            {filters.ats ? <input type="hidden" name="ats" value={String(filters.ats)} /> : null}
            <button type="submit" className={buttonClasses({ variant: 'primary', size: 'md' })}>
              Search
            </button>
          </form>

          <div className="mt-5 flex flex-col gap-3 border-t border-ink-100 pt-5">
            <FilterRow label="Category" filters={filters} options={categoryOptions} />
            <FilterRow
              label="Plan"
              filters={filters}
              options={[
                {
                  label: 'Free',
                  patch: { plan: filters.plan === 'free' ? null : 'free' },
                  active: filters.plan === 'free',
                },
                {
                  label: 'Pro',
                  patch: { plan: filters.plan === 'pro' ? null : 'pro' },
                  active: filters.plan === 'pro',
                },
              ]}
            />
            <FilterRow
              label="Layout"
              filters={filters}
              options={[
                {
                  label: 'One column',
                  patch: { columns: filters.columns === 1 ? null : 1 },
                  active: filters.columns === 1,
                },
                {
                  label: 'Two columns',
                  patch: { columns: filters.columns === 2 ? null : 2 },
                  active: filters.columns === 2,
                },
              ]}
            />
            <FilterRow
              label="ATS score"
              filters={filters}
              options={[
                {
                  label: '5/5 only',
                  patch: { ats: filters.ats === 5 ? null : 5 },
                  active: filters.ats === 5,
                },
                {
                  label: '4 and above',
                  patch: { ats: filters.ats === 4 ? null : 4 },
                  active: filters.ats === 4,
                },
              ]}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3 border-t border-ink-100 pt-4">
            <p className="text-sm text-ink-700">
              <strong className="font-semibold text-ink-950">
                Showing {matches.length} of {TEMPLATE_COUNT} templates
              </strong>
              {summary.length > 0 ? (
                <span className="text-ink-600"> · {summary.join(' · ')}</span>
              ) : null}
            </p>
            {filtered ? (
              <Link
                href="/templates"
                className="text-sm font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
              >
                Clear all filters
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-10">
          {matches.length === 0 ? (
            <EmptyState
              title="No templates match those filters"
              description={
                filters.q
                  ? `Nothing matches “${filters.q}” with the filters you have applied. Try a broader term — a category, a role or a style — or clear the filters and browse all ${TEMPLATE_COUNT} designs.`
                  : `That combination does not exist yet. Loosening one filter — usually the ATS score or the column count — will bring results back.`
              }
              action={
                <ButtonLink href="/templates" size="md">
                  Show all {TEMPLATE_COUNT} templates
                </ButtonLink>
              }
              secondaryAction={
                filters.category ? (
                  <ButtonLink
                    href={hrefFor(EMPTY_FILTERS, { category: filters.category })}
                    size="md"
                    variant="outline"
                  >
                    Keep the category only
                  </ButtonLink>
                ) : (
                  <ButtonLink href={hrefFor(EMPTY_FILTERS, { ats: 5 })} size="md" variant="outline">
                    Browse ATS-safe templates
                  </ButtonLink>
                )
              }
            />
          ) : grouped ? (
            <div className="flex flex-col gap-14">
              {TEMPLATE_CATEGORIES.map((category) => {
                const group = matches.filter((template) => template.category === category.id);
                if (group.length === 0) return null;
                return (
                  <section key={category.id} id={category.slug} className="scroll-mt-24">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div className="max-w-2xl">
                        <h2 className="text-2xl font-bold tracking-tight text-ink-950">
                          {category.label} CV templates
                        </h2>
                        <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
                          {category.blurb}
                        </p>
                      </div>
                      <Link
                        href={hrefFor(filters, { category: category.id })}
                        className="text-sm font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
                      >
                        See all {group.length} {category.label.toLowerCase()} templates
                      </Link>
                    </div>
                    <TemplateGrid templates={group} className="mt-6" />
                  </section>
                );
              })}
            </div>
          ) : (
            <TemplateGrid templates={matches} />
          )}
        </div>
      </Section>

      <Section size="sm">
        <RelatedLinks
          title="Keep looking"
          links={[
            {
              label: 'ATS CV templates',
              href: '/ats-cv',
              description: 'The layouts built to be read by software first, and why they look plain.',
            },
            {
              label: 'CV templates by format',
              href: '/cv-templates',
              description: 'International CV conventions, page counts and what to include.',
            },
            {
              label: 'Resume templates',
              href: '/resume-templates',
              description: 'One-page, US Letter layouts drawn to North American conventions.',
            },
            {
              label: 'CV examples',
              href: '/cv-examples',
              description: 'Worked examples by role and career stage, with the wording explained.',
            },
            {
              label: 'The CV builder',
              href: '/cv-builder',
              description: 'How the editor, live preview and PDF export actually work.',
            },
            {
              label: 'Pricing',
              href: '/pricing',
              description: `What the free plan includes, and what the ${TEMPLATE_COUNT}-template Pro plan adds.`,
            },
          ]}
        />
      </Section>

      <Section tone="muted">
        <FaqSection
          entries={GALLERY_FAQ}
          title="Choosing a CV template"
          description="The questions people ask before they commit to a design."
        />
      </Section>

      <Section size="sm">
        <CtaBanner
          title="Pick a template, fill it in, download the PDF"
          description={`Start with any of the ${FREE_TEMPLATE_COUNT} free designs and switch template whenever you like — your content moves with you, so trying a different layout costs you nothing but a click.`}
          primaryLabel="Start building — free"
          secondaryHref="/cv-builder"
          secondaryLabel="See how the builder works"
          note={`No credit card. ${site.name} keeps your CV in your account so you can tailor it for the next application.`}
        />
      </Section>

      <JsonLd
        nodes={[
          itemListSchema(
            matches.map((template) => ({
              name: templateHeading(template),
              path: `/templates/${template.slug}`,
              description: template.tagline,
            })),
            summary.length > 0 ? `CV templates: ${summary.join(', ')}` : 'All CV templates',
          ),
        ]}
      />
    </>
  );
}
