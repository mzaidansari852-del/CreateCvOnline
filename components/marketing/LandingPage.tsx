import Link from 'next/link';

import {
  Breadcrumbs,
  CtaBanner,
  FaqSection,
  FeatureGrid,
  Prose,
  RelatedLinks,
  Section,
  SectionHeading,
  StatRow,
  StepList,
} from '@/components/marketing/primitives';
import { Badge } from '@/components/ui/feedback';
import { ButtonLink } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/JsonLd';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import { TEMPLATES } from '@/lib/cv/template-registry';
import type { Landing, LandingShell } from '@/lib/i18n/landing';
import { faqSchema, howToSchema, webPageSchema } from '@/lib/seo/schema';

/**
 * One shell for every commercial landing page, in every language.
 *
 * The English equivalents are separate 400-to-550-line files that differ mostly in their
 * words, and each repeats the same hero, badge row, FAQ block and JSON-LD assembly. Writing
 * that shape out again per page — and then again per language — would mean dozens of places
 * for a schema field or an `hreflang`-relevant path to be got wrong individually, on exactly
 * the set of pages nobody reviewing the English site will look at again.
 *
 * So the pages are data: `Landing` holds what the page says, `LandingShell` holds the words
 * and destinations that surround it, and this renders them. A structural fix lands on all of
 * them at once.
 *
 * The trade-off is real and worth naming: a page cannot have a one-off section this shape
 * does not allow. When one needs to, it stops being data and becomes its own file — which is
 * what `/fr/tarifs` and the four legal documents already are.
 */
export function LandingPage({ page, shell }: { page: Landing; shell: LandingShell }) {
  const showcase = TEMPLATES.filter((template) => !template.premium).slice(0, 8);

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: shell.homeLabel, path: shell.homePath },
            { name: page.breadcrumb, path: page.path },
          ]}
        />

        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl">
            {page.heading}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-ink-600">{page.lede}</p>

          {page.badges && page.badges.length > 0 ? (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {page.badges.map((badge) => (
                <Badge key={badge} tone="neutral">
                  {badge}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">
              {page.ctaPrimary ?? shell.browseCta}
            </ButtonLink>
            <ButtonLink href={shell.galleryPath} size="lg" variant="outline">
              {shell.allTemplates}
            </ButtonLink>
          </div>
        </div>
      </Section>

      {page.stats && page.stats.length > 0 ? (
        <Section tone="muted" size="sm">
          <StatRow stats={[...page.stats]} />
        </Section>
      ) : null}

      {page.steps ? (
        <Section size="sm">
          <SectionHeading align="left" title={page.steps.title} />
          <div className="mt-8">
            <StepList
              steps={page.steps.items.map((step) => ({
                title: step.title,
                description: step.body,
              }))}
            />
          </div>
        </Section>
      ) : null}

      {page.features ? (
        <Section tone="muted" size="sm">
          <SectionHeading
            align="left"
            title={page.features.title}
            description={page.features.description}
          />
          <div className="mt-8">
            <FeatureGrid
              columns={page.features.columns ?? 3}
              items={page.features.items.map((item) => ({
                title: item.title,
                description: item.body,
              }))}
            />
          </div>
        </Section>
      ) : null}

      {page.prose && page.prose.length > 0 ? (
        <Section size="sm">
          <div className="mx-auto max-w-3xl">
            {page.prose.map((block) => (
              <div key={block.heading} className="mt-10 first:mt-0">
                <h2 className="text-2xl font-bold text-ink-950">{block.heading}</h2>
                <Prose className="mt-4 max-w-none">
                  {block.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </Prose>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {page.showTemplates ? (
        <Section tone="muted" size="sm">
          <SectionHeading align="left" title={shell.galleryHeading} description={shell.galleryLede} />
          <TemplateGrid className="mt-8" templates={showcase} columns={4} locale={shell.locale} />
          <p className="mt-8 text-sm">
            <Link
              href={shell.galleryPath}
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              {shell.allTemplates}
            </Link>
          </p>
        </Section>
      ) : null}

      {page.faq.length > 0 ? (
        <Section size="sm">
          <FaqSection entries={[...page.faq]} title={page.faqTitle ?? shell.faqTitle} />
        </Section>
      ) : null}

      <Section tone="muted" size="sm">
        <RelatedLinks title={shell.relatedTitle} links={[...page.related]} />
      </Section>

      <Section size="sm">
        <CtaBanner
          primaryLabel={shell.cta.primary}
          title={shell.cta.title}
          description={shell.cta.description}
          secondaryHref={shell.pricingPath}
          secondaryLabel={shell.cta.secondary}
        />
      </Section>

      <JsonLd
        nodes={[
          webPageSchema({
            path: page.path,
            name: page.metaTitle,
            description: page.metaDescription,
            hasBreadcrumb: true,
            inLanguage: shell.locale,
          }),
          /*
           * `HowTo` only where the page really is a procedure.
           *
           * Every one of these pages has a `steps` block, because "three steps" is a good way
           * to lay out a landing page — but a page whose steps describe how the product is
           * organised is not a set of instructions, and marking it up as one is the kind of
           * overreach that gets structured data ignored across a whole site. The flag is per
           * page and set by hand.
           */
          page.steps && page.howTo
            ? howToSchema({
                name: page.metaTitle,
                description: page.metaDescription,
                steps: page.steps.items.map((step) => ({ name: step.title, text: step.body })),
              })
            : null,
          page.faq.length > 0 ? faqSchema([...page.faq], { inLanguage: shell.locale }) : null,
        ]}
      />
    </>
  );
}
