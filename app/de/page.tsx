import Link from 'next/link';
import type { Metadata } from 'next';

import { DE, DE_CATEGORY_SLUG } from './de-copy';
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
  title: DE.home.metaTitle,
  description: DE.home.metaDescription,
  path: '/de',
  locale: 'de',
  keywords: [
    'lebenslauf vorlage',
    'lebenslauf muster',
    'lebenslauf vorlage kostenlos',
    'lebenslauf online erstellen',
    'bewerbung vorlage',
  ],
});

/**
 * The German home page.
 *
 * Like the French one, it carries a section with no English counterpart — the tabellarisch
 * convention, the photo question, Ort/Datum/Unterschrift, GER language levels. That section
 * is the part a German reader will recognise as written for them rather than translated.
 */
export default function GermanHomePage() {
  const showcase = TEMPLATES.filter((template) => !template.premium).slice(0, 8);
  const atsPerfect = atsSafeTemplates().length;

  return (
    <>
      <HomeHero
        copy={{
          headingBefore: DE.home.hero.headingBefore,
          headingHighlight: DE.home.hero.headingHighlight,
          headingAfter: DE.home.hero.headingAfter,
          lede: DE.home.lede,
          badge: (count) => `${count} ${DE.home.hero.badge}`,
          primaryCta: DE.home.hero.primaryCta,
          secondaryCta: DE.home.hero.secondaryCta,
          browseHref: '/de/lebenslauf-vorlagen',
          atsHref: '/de/lebenslauf-vorlagen/ats',
          trust: [...DE.home.trust],
          previewLabel: (name) => `Vorschau der Lebenslauf-Vorlage ${name}`,
        }}
      />

      <Section tone="muted" size="sm">
        <SectionHeading align="left" title={DE.home.stepsTitle} />
        <div className="mt-8">
          <StepList
            steps={DE.home.steps.map((step) => ({ title: step.title, description: step.body }))}
          />
        </div>
      </Section>

      <Section size="sm">
        <SectionHeading
          align="left"
          title={DE.gallery.heading}
          description={`${TEMPLATE_COUNT} ${DE.gallery.designsLabel}, davon ${FREE_TEMPLATE_COUNT} ${DE.gallery.freeBadge}.`}
        />
        <TemplateGrid className="mt-8" templates={showcase} columns={4} locale="de" />
        <p className="mt-8 text-sm text-ink-600">
          <Link
            href="/de/lebenslauf-vorlagen"
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            Alle {TEMPLATE_COUNT} Vorlagen ansehen
          </Link>{' '}
          oder einen Stil wählen:{' '}
          {TEMPLATE_CATEGORIES.map((category, index) => (
            <span key={category.id}>
              {index > 0 ? ', ' : ''}
              <Link
                href={`/de/lebenslauf-vorlagen/${DE_CATEGORY_SLUG[category.id]}`}
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                {DE.categories[category.id].label}
              </Link>
            </span>
          ))}
          .
        </p>
      </Section>

      <Section tone="muted" size="sm">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink-950">{DE.home.atsTitle}</h2>
          <p className="mt-4 text-[15px] leading-[1.75] text-ink-700">{DE.home.atsBody}</p>
          <p className="mt-4 text-[15px] leading-[1.75] text-ink-700">
            {DE.home.atsCaveat} {atsPerfect} von {TEMPLATE_COUNT} Vorlagen erreichen die
            Höchstwertung.
          </p>
        </div>
      </Section>

      <Section size="sm">
        <SectionHeading align="left" title={DE.home.differencesTitle} />
        <div className="mt-8">
          <FeatureGrid
            columns={2}
            items={DE.home.differences.map((item) => ({
              title: item.title,
              description: item.body,
            }))}
          />
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <FaqSection entries={[...DE.home.faq]} title={DE.home.faqTitle} />
      </Section>

      <Section size="sm">
        <CtaBanner
          primaryLabel={DE.cta.primary}
          title={DE.cta.title}
          description={DE.cta.description}
          secondaryHref="/de/preise"
          secondaryLabel={DE.cta.secondary}
        />
      </Section>

      <JsonLd
        nodes={[
          webPageSchema({
            path: '/de',
            name: DE.home.metaTitle,
            description: DE.home.metaDescription,
            inLanguage: 'de',
          }),
          faqSchema([...DE.home.faq], { inLanguage: 'de' }),
        ]}
      />
    </>
  );
}
