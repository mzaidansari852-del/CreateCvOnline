import Link from 'next/link';
import type { Metadata } from 'next';

import { FR, FR_CATEGORY_SLUG } from './fr-copy';
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
  title: FR.home.metaTitle,
  description: FR.home.metaDescription,
  path: '/fr',
  locale: 'fr',
  keywords: [
    'modèle de cv',
    'modèle de cv gratuit',
    'créer un cv en ligne',
    'cv gratuit à télécharger',
    'faire un cv',
  ],
});

/**
 * The French home page.
 *
 * It is not the English home page in French. The section on what a French CV expects —
 * the photograph, the one-page convention, CECRL language levels, Europass — has no
 * counterpart on the English site because none of it is true there, and it is the part of
 * this page that a French reader will recognise as written for them.
 */
export default function FrenchHomePage() {
  const showcase = TEMPLATES.filter((template) => !template.premium).slice(0, 8);
  const atsPerfect = atsSafeTemplates().length;

  return (
    <>
      <HomeHero
        copy={{
          headingBefore: FR.home.hero.headingBefore,
          headingHighlight: FR.home.hero.headingHighlight,
          headingAfter: FR.home.hero.headingAfter,
          lede: FR.home.lede,
          badge: (count) => `${count} ${FR.home.hero.badge}`,
          primaryCta: FR.home.hero.primaryCta,
          secondaryCta: FR.home.hero.secondaryCta,
          browseHref: '/fr/modeles-de-cv',
          atsHref: '/fr/modeles-de-cv/ats',
          trust: [...FR.home.trust],
          previewLabel: (name) => `Aperçu du modèle de CV ${name}`,
        }}
      />

      <Section tone="muted" size="sm">
        <SectionHeading align="left" title={FR.home.stepsTitle} />
        <div className="mt-8">
          <StepList
            steps={FR.home.steps.map((step) => ({ title: step.title, description: step.body }))}
          />
        </div>
      </Section>

      <Section size="sm">
        <SectionHeading
          align="left"
          title={FR.gallery.heading}
          description={`${TEMPLATE_COUNT} modèles, dont ${FREE_TEMPLATE_COUNT} ${FR.gallery.freeBadge}.`}
        />
        <TemplateGrid className="mt-8" templates={showcase} columns={4} locale="fr" />
        <p className="mt-8 text-sm text-ink-600">
          <Link
            href="/fr/modeles-de-cv"
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            Voir les {TEMPLATE_COUNT} modèles
          </Link>{' '}
          ou choisir un style :{' '}
          {TEMPLATE_CATEGORIES.map((category, index) => (
            <span key={category.id}>
              {index > 0 ? ', ' : ''}
              <Link
                href={`/fr/modeles-de-cv/${FR_CATEGORY_SLUG[category.id]}`}
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                {FR.categories[category.id].label.toLowerCase()}
              </Link>
            </span>
          ))}
          .
        </p>
      </Section>

      <Section tone="muted" size="sm">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink-950">{FR.home.atsTitle}</h2>
          <p className="mt-4 text-[15px] leading-[1.75] text-ink-700">{FR.home.atsBody}</p>
          <p className="mt-4 text-[15px] leading-[1.75] text-ink-700">
            {FR.home.atsCaveat} {atsPerfect} modèles sur {TEMPLATE_COUNT} obtiennent la note
            maximale.
          </p>
        </div>
      </Section>

      <Section size="sm">
        <SectionHeading align="left" title={FR.home.differencesTitle} />
        <div className="mt-8">
          <FeatureGrid
            columns={2}
            items={FR.home.differences.map((item) => ({
              title: item.title,
              description: item.body,
            }))}
          />
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <FaqSection entries={[...FR.home.faq]} title={FR.home.faqTitle} />
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
            path: '/fr',
            name: FR.home.metaTitle,
            description: FR.home.metaDescription,
            inLanguage: 'fr',
          }),
          faqSchema([...FR.home.faq], { inLanguage: 'fr' }),
        ]}
      />
    </>
  );
}
