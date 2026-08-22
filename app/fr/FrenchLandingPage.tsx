import Link from 'next/link';

import { FR } from './fr-copy';
import type { FrLanding } from './fr-landing-copy';
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
import { faqSchema, howToSchema, webPageSchema } from '@/lib/seo/schema';

/**
 * One shell for the eight French commercial landing pages.
 *
 * The English equivalents are eight separate 400-to-550-line files that differ mostly in
 * their words, and each one repeats the same hero, the same badge row, the same FAQ block
 * and the same JSON-LD assembly. Copying that shape eight more times in French would mean
 * eight more places for a schema field or an `hreflang`-relevant path to be got wrong
 * individually — and the French set is the one nobody reviewing the English site will look
 * at again.
 *
 * So the French pages are data. `fr-landing-copy.ts` holds the words, this renders them,
 * and a structural fix lands on all eight at once. The trade-off is that a French page
 * cannot have a one-off section the shape does not allow; when one needs to, it stops being
 * data and becomes its own file, exactly as `/fr/tarifs` already is.
 */
export function FrenchLandingPage({ page }: { page: FrLanding }) {
  const showcase = TEMPLATES.filter((template) => !template.premium).slice(0, 8);

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Accueil', path: '/fr' },
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
              {page.ctaPrimary ?? FR.gallery.ctaPrimary}
            </ButtonLink>
            <ButtonLink href="/fr/modeles-de-cv" size="lg" variant="outline">
              {FR.related.allTemplates}
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
          <SectionHeading
            align="left"
            title={FR.gallery.heading}
            description={FR.gallery.lede}
          />
          <TemplateGrid className="mt-8" templates={showcase} columns={4} locale="fr" />
          <p className="mt-8 text-sm">
            <Link
              href="/fr/modeles-de-cv"
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              {FR.related.allTemplates}
            </Link>
          </p>
        </Section>
      ) : null}

      {page.faq.length > 0 ? (
        <Section size="sm">
          <FaqSection entries={[...page.faq]} title={page.faqTitle ?? FR.home.faqTitle} />
        </Section>
      ) : null}

      <Section tone="muted" size="sm">
        <RelatedLinks title={FR.related.title} links={[...page.related]} />
      </Section>

      <Section size="sm">
        <CtaBanner
          primaryLabel={FR.cta.primary}
          title={FR.cta.title}
          description={FR.cta.description}
          secondaryHref="/fr/tarifs"
          secondaryLabel={FR.cta.secondary}
        />
      </Section>

      <JsonLd
        nodes={[
          webPageSchema({
            path: page.path,
            name: page.metaTitle,
            description: page.metaDescription,
            hasBreadcrumb: true,
            inLanguage: 'fr',
          }),
          /*
           * `HowTo` only where the page really is a procedure.
           *
           * Every one of these pages has a `steps` block, because "three steps" is a good
           * way to lay out a landing page — but a page whose steps describe how the product
           * is organised is not a set of instructions, and marking it up as one is the kind
           * of overreach that gets structured data ignored across a whole site. The flag is
           * per page and set by hand.
           */
          page.steps && page.howTo
            ? howToSchema({
                name: page.metaTitle,
                description: page.metaDescription,
                steps: page.steps.items.map((step) => ({
                  name: step.title,
                  text: step.body,
                })),
              })
            : null,
          page.faq.length > 0 ? faqSchema([...page.faq], { inLanguage: 'fr' }) : null,
        ]}
      />
    </>
  );
}
