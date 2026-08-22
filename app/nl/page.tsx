import Link from 'next/link';
import type { Metadata } from 'next';

import { NL, NL_CATEGORY_SLUG } from './nl-copy';
import {
  CtaBanner,
  FaqSection,
  FeatureGrid,
  Section,
  SectionHeading,
  StepList,
} from '@/components/marketing/primitives';
import { HomeHero } from '@/components/marketing/home/HomeHero';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  FREE_TEMPLATE_COUNT,
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  TEMPLATE_COUNT,
  atsSafeTemplates,
} from '@/lib/cv/template-registry';
import { pageMetadata } from '@/lib/seo/metadata';
import { faqSchema, webPageSchema } from '@/lib/seo/schema';

export const metadata: Metadata = pageMetadata({
  title: NL.home.metaTitle,
  description: NL.home.metaDescription,
  path: '/nl',
  locale: 'nl',
  keywords: [
    'cv sjabloon',
    'gratis cv maken',
    'cv maken online',
    'cv voorbeeld',
    'cv template gratis',
  ],
});

/**
 * The Dutch home page.
 *
 * It is not the English home page in Dutch. The section on what a Dutch cv expects — the
 * photo you should probably leave off, the birth date that no longer belongs on one, the
 * ERK language levels, the motivatiebrief — has no counterpart on the English site because
 * none of it is true there, and it is the part a Dutch reader will recognise as written for
 * them rather than translated at them.
 */
export default function DutchHomePage() {
  const showcase = TEMPLATES.filter((template) => !template.premium).slice(0, 8);
  const atsPerfect = atsSafeTemplates().length;

  return (
    <>
      <HomeHero
        copy={{
          headingBefore: NL.home.hero.headingBefore,
          headingHighlight: NL.home.hero.headingHighlight,
          headingAfter: NL.home.hero.headingAfter,
          lede: NL.home.lede,
          badge: (count) => `${count} ${NL.home.hero.badge}`,
          primaryCta: NL.home.hero.primaryCta,
          secondaryCta: NL.home.hero.secondaryCta,
          browseHref: '/nl/cv-sjablonen',
          atsHref: '/nl/cv-sjablonen/ats',
          trust: [...NL.home.trust],
          previewLabel: (name) => `Voorbeeld van cv-sjabloon ${name}`,
        }}
      />

      <Section tone="muted" size="sm">
        <SectionHeading align="left" title={NL.home.stepsTitle} />
        <div className="mt-8">
          <StepList
            steps={NL.home.steps.map((step) => ({ title: step.title, description: step.body }))}
          />
        </div>
      </Section>

      <Section size="sm">
        <SectionHeading
          align="left"
          title={NL.gallery.heading}
          description={`${TEMPLATE_COUNT} sjablonen, waarvan ${FREE_TEMPLATE_COUNT} ${NL.gallery.freeBadge}.`}
        />
        <TemplateGrid className="mt-8" templates={showcase} columns={4} locale="nl" />
        <p className="mt-8 text-sm text-ink-600">
          <Link
            href="/nl/cv-sjablonen"
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            Bekijk alle {TEMPLATE_COUNT} sjablonen
          </Link>{' '}
          of kies een stijl:{' '}
          {TEMPLATE_CATEGORIES.map((category, index) => (
            <span key={category.id}>
              {index > 0 ? ', ' : ''}
              <Link
                href={`/nl/cv-sjablonen/${NL_CATEGORY_SLUG[category.id]}`}
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                {NL.categories[category.id].label.toLowerCase()}
              </Link>
            </span>
          ))}
          .
        </p>
      </Section>

      <Section tone="muted" size="sm">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink-950">{NL.home.atsTitle}</h2>
          <p className="mt-4 text-[15px] leading-[1.75] text-ink-700">{NL.home.atsBody}</p>
          <p className="mt-4 text-[15px] leading-[1.75] text-ink-700">
            {NL.home.atsCaveat} {atsPerfect} van de {TEMPLATE_COUNT} sjablonen halen de
            maximale score.
          </p>
        </div>
      </Section>

      <Section size="sm">
        <SectionHeading align="left" title={NL.home.differencesTitle} />
        <div className="mt-8">
          <FeatureGrid
            columns={2}
            items={NL.home.differences.map((item) => ({
              title: item.title,
              description: item.body,
            }))}
          />
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <FaqSection entries={[...NL.home.faq]} title={NL.home.faqTitle} />
      </Section>

      <Section size="sm">
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
            path: '/nl',
            name: NL.home.metaTitle,
            description: NL.home.metaDescription,
            inLanguage: 'nl',
          }),
          faqSchema([...NL.home.faq], { inLanguage: 'nl' }),
        ]}
      />
    </>
  );
}
