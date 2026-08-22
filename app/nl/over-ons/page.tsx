import type { Metadata } from 'next';
import Link from 'next/link';

import {
  Breadcrumbs,
  CtaBanner,
  FeatureGrid,
  Prose,
  Section,
  SectionHeading,
  StatRow,
} from '@/components/marketing/primitives';
import { JsonLd } from '@/components/seo/JsonLd';
import { NL } from '../nl-copy';
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT, atsSafeTemplates } from '@/lib/cv/template-registry';
import { pageMetadata } from '@/lib/seo/metadata';
import { webPageSchema } from '@/lib/seo/schema';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Over ons',
  description: `${site.name}: sjablonen die recruitmentsoftware kan lezen, een editor die klopt met de pdf, en een gratis abonnement waarmee je echt kunt downloaden.`,
  path: '/nl/over-ons',
  locale: 'nl',
  keywords: ['over createcvonline', 'cv maker aanbieder', 'wie zijn wij'],
});

const PRINCIPLES = [
  {
    title: 'De download is geen lokaas',
    body: 'Veel tools laten je een heel cv opmaken en vragen dan geld bij het exporteren. Dat werkt en het is oneerlijk: het werk is dan al gedaan. Hier downloadt het gratis abonnement een echte pdf.',
  },
  {
    title: 'ATS-vriendelijk is geen betaalde functie',
    body: 'Alle sjablonen met een 5 op 5 zijn gratis. Geld vragen om leesbaar te zijn voor de software die sollicitaties voorsorteert, is het recht verkopen om gelezen te worden.',
  },
  {
    title: 'Wat je ziet is wat er wordt afgedrukt',
    body: 'Het voorbeeld, de afdrukpagina en de pdf komen uit dezelfde render-engine. Er valt niets tussen te synchroniseren, dus er kan ook niets uit elkaar lopen op de avond voor een sollicitatie.',
  },
  {
    title: 'Je gegevens blijven van jou',
    body: 'Geen doorverkoop, geen kandidatendatabank voor recruiters, geen cv dat openbaar wordt zonder dat jij dat besluit. En een volledige JSON-export, wanneer je maar wilt.',
  },
  {
    title: 'Geen tekst die voor je wordt geschreven',
    body: 'Een door een machine geschreven cv zegt hetzelfde als dat van de vorige kandidaat. Het gereedschap maakt op, structureert en controleert volledigheid; de zinnen blijven van jou.',
  },
  {
    title: 'Zeggen wat er niet werkt',
    body: 'De ATS-score is een beoordeling en de site schrijft dat er gewoon bij, in plaats van hem als keurmerk te presenteren. De genoemde grenzen zijn de echte grenzen.',
  },
];

/**
 * The Dutch about page.
 *
 * Not a translation. It answers the question a Dutch visitor arriving from `cv sjabloon`
 * actually has — wie zit hier achter en waar zit het addertje — because that market is full
 * of sites that let you build a document and then charge to download it. Naming that
 * directly is the most useful thing the page can do.
 */
export default function DutchAboutPage() {
  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/nl' },
            { name: 'Over ons', path: '/nl/over-ons' },
          ]}
        />
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl">
            Over {site.name}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-ink-600">
            Gereedschap om een document te maken, geen wervingsplatform. Je schrijft een cv,
            je downloadt het, je gaat ermee weg. Er is geen tweede stap waarin wij jouw
            sollicitatie te gelde maken.
          </p>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <StatRow
          stats={[
            { value: String(TEMPLATE_COUNT), label: 'sjablonen' },
            { value: String(FREE_TEMPLATE_COUNT), label: 'gratis' },
            { value: String(atsSafeTemplates().length), label: 'met een 5/5 voor ATS' },
            { value: site.founded, label: 'sinds' },
          ]}
        />
      </Section>

      <Section size="sm">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink-950">Waarom deze site bestaat</h2>
          <Prose className="mt-4 max-w-none">
            <p>
              De markt voor cv-tools heeft een ontwerpfout die zo wijdverbreid is dat hij als
              normaal geldt: je mag je hele loopbaan invoeren, je ziet je document ontstaan, en
              de downloadknop vraagt om een creditcard. Op dat moment zijn de kosten van
              afhaken het hoogst — je hebt alles al geschreven — en precies daarom staat de muur
              daar.
            </p>
            <p>
              Het gevolg zie je in de zoekresultaten: bij zoekopdrachten als{' '}
              <em>gratis cv sjabloon</em> gebruikt een flink deel van de treffers “gratis” voor
              het opmaken, niet voor het resultaat. Wie binnen een uur wil solliciteren, is tijd
              kwijt.
            </p>
            <p>
              Wij hebben het van de andere kant aangepakt: het gratis abonnement levert een
              echte pdf, en wat geld kost is wat je nodig hebt als je regelmatig solliciteert —
              meerdere versies, alle sjablonen, de fijne opmaak. Wie één cv maakt voor één
              sollicitatie heeft geen reden om te betalen, en het hem laten betalen zou voor
              iedereen een slechte deal zijn.
            </p>
          </Prose>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <SectionHeading
          align="left"
          title="Onze ontwerpprincipes"
          description="Zes besluiten, één keer genomen en overal toegepast. Ze verklaren de meeste keuzes die je in het product tegenkomt."
        />
        <div className="mt-8">
          <FeatureGrid
            columns={3}
            items={PRINCIPLES.map((item) => ({ title: item.title, description: item.body }))}
          />
        </div>
      </Section>

      <Section size="sm">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink-950">Hoe de site geld verdient</h2>
          <Prose className="mt-4 max-w-none">
            <p>
              Uitsluitend met de abonnementen en de eenmalige aankoop die op de pagina{' '}
              <Link
                href="/nl/prijzen"
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                prijzen
              </Link>{' '}
              staan. Er is geen reclame, geen partneraanbod dat in het product wordt geschoven,
              geen doorverkoop van gegevens en geen commissie op sollicitaties.
            </p>
            <p>
              Betalingen lopen via Paddle, dat de verkoper in juridische zin is en de btw
              afdraagt. Je betaalgegevens zien we nooit. De terugbetaling is veertien dagen en
              staat beschreven in ons{' '}
              <Link
                href="/nl/terugbetaling"
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                terugbetalingsbeleid
              </Link>
              .
            </p>
          </Prose>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink-950">Waar we zitten</h2>
          <Prose className="mt-4 max-w-none">
            <p>
              Het team zit in {site.contactAddress.locality}, Marokko, en het product verschijnt
              in het Engels, Frans, Duits en Nederlands. De Nederlandse pagina’s zijn geen
              vertaling van de Engelse: wat een Nederlands cv verwacht — de foto die je beter
              weglaat, geen geboortedatum, ERK-niveaus, de motivatiebrief ernaast — heeft op de
              Engelse pagina’s geen tegenhanger, en juist daarom bestaan ze apart.
            </p>
            <p>
              Een vraag, een opmerking, iets dat niet werkt? Mail{' '}
              <a
                href={`mailto:${site.supportEmail}`}
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                {site.supportEmail}
              </a>{' '}
              of gebruik het{' '}
              <Link
                href="/nl/contact"
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                contactformulier
              </Link>
              . We antwoorden binnen twee werkdagen.
            </p>
          </Prose>
        </div>
      </Section>

      <Section size="sm">
        <CtaBanner
          primaryLabel={NL.cta.primary}
          title={NL.cta.title}
          description={NL.cta.description}
          secondaryHref="/nl/cv-sjablonen"
          secondaryLabel={NL.related.allTemplates}
        />
      </Section>

      <JsonLd
        nodes={[
          webPageSchema({
            path: '/nl/over-ons',
            name: `Over ${site.name}`,
            description: `Wat ${site.name} doet, hoe de site geld verdient, en de principes achter de meeste ontwerpkeuzes.`,
            hasBreadcrumb: true,
            inLanguage: 'nl',
          }),
        ]}
      />
    </>
  );
}
