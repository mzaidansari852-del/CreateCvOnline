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
import { JsonLd } from '@/components/seo/JsonLd';
import { TemplateFilterBar } from '@/components/marketing/TemplateFilterBar';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import {
  FREE_TEMPLATE_COUNT,
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  TEMPLATE_COUNT,
  categoryPath,
  templatesByCategory,
} from '@/lib/cv/template-registry';
import { itemListSchema } from '@/lib/seo/schema';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

import { templateHeading } from './template-copy';

/**
 * The template gallery.
 *
 * Statically rendered, which it was not. Every filter used to be a `next/link` writing to
 * the query string — a defensible design, and it read `searchParams` in both
 * `generateMetadata` and the body, which opts a route into dynamic rendering. So the most
 * linked page on the site was re-rendered per request while every other marketing page was
 * served as static HTML. Audit item 3.4.
 *
 * What replaces it splits the two jobs the query string was doing. Category becomes a row
 * of links to the six static category pages, which already have their own copy and were
 * being competed with by `?category=`; plan, columns, ATS and search are handled in the
 * browser by `TemplateFilterBar`, over cards the server has already rendered. With
 * JavaScript off the page is the full gallery, which is what a crawler should see anyway.
 */

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

/* -------------------------------------------------------------------------- */
/* Metadata                                                                    */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = pageMetadata({
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

export default function TemplatesPage() {
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
                Every template below is a real, working layout — not a picture of one. What you see
                in each preview is the document you get, rendered by the same code that produces
                your PDF, filled with a complete example CV so you can judge how a long job history
                actually sits on the page.
              </p>
              <p className="mt-3">
                They are grouped into six families and rated 1–5 for how reliably an applicant
                tracking system can read them. Each family has its own page, written for it; plan,
                column count and ATS score filter the list here.
              </p>
            </>
          }
        />

        <div className="mt-10">
          <FeatureGrid items={HOW_TO_CHOOSE} columns={4} />
        </div>
      </Section>

      <Section tone="muted" size="sm" id="browse">
        {/*
          Category is a row of links, not a filter.
          
          `?category=modern` and `/templates/modern` were two addresses for one list, and the
          second is the one with its own copy, its own title and its own place in the sitemap.
          Sending the category chips there instead of to a query view is what stops the two
          competing — `proxy.ts` redirects the old query URLs to match. It lives in the proxy
          rather than in `next.config.ts` because a `redirects()` rule forwards the query it
          matched on, landing on `/templates/modern?category=modern` — a third address.
        */}
        <nav aria-label="Template categories" className="mb-6 flex flex-wrap items-center gap-2">
          <span className="w-24 shrink-0 text-xs font-bold tracking-[0.08em] text-ink-500 uppercase">
            Category
          </span>
          {TEMPLATE_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={categoryPath(category.id)}
              className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[13px] font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
            >
              {category.label}
              <span className="ml-1.5 text-ink-400">{templatesByCategory(category.id).length}</span>
            </Link>
          ))}
        </nav>

        <TemplateFilterBar total={TEMPLATE_COUNT} freeCount={FREE_TEMPLATE_COUNT}>
          <div className="flex flex-col gap-14">
            {TEMPLATE_CATEGORIES.map((category) => {
              const group = templatesByCategory(category.id);
              if (group.length === 0) return null;
              return (
                <section
                  key={category.id}
                  id={category.slug}
                  data-template-group=""
                  className="scroll-mt-24"
                >
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
                      href={categoryPath(category.id)}
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
        </TemplateFilterBar>
      </Section>

      <Section size="sm">
        <RelatedLinks
          title="Keep looking"
          links={[
            {
              label: 'ATS CV templates',
              href: '/ats-cv',
              description:
                'The layouts built to be read by software first, and why they look plain.',
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
            TEMPLATES.map((template) => ({
              name: templateHeading(template),
              path: `/templates/${template.slug}`,
              description: template.tagline,
            })),
            'All CV templates',
          ),
        ]}
      />
    </>
  );
}
