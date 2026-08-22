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
import { DE } from '../de-copy';
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT, atsSafeTemplates } from '@/lib/cv/template-registry';
import { pageMetadata } from '@/lib/seo/metadata';
import { webPageSchema } from '@/lib/seo/schema';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Über uns',
  description: `${site.name}: Vorlagen, die Bewerbermanagementsysteme lesen können, ein Editor, der dem PDF entspricht, und ein kostenloser Tarif, mit dem man wirklich herunterladen kann.`,
  path: '/de/ueber-uns',
  locale: 'de',
  keywords: ['über createcvonline', 'lebenslauf generator anbieter', 'wer wir sind'],
});

const PRINCIPLES = [
  {
    title: 'Der Download ist kein Köder',
    body: 'Viele Werkzeuge lassen einen ganzen Lebenslauf setzen und verlangen dann Geld für den Export. Das ist wirksam und unlauter: Die Arbeit ist da schon getan. Hier lädt der kostenlose Tarif ein echtes PDF herunter.',
  },
  {
    title: 'ATS-Tauglichkeit ist keine Zahlfunktion',
    body: 'Alle mit 5 von 5 bewerteten Vorlagen sind kostenlos. Dafür Geld zu nehmen, dass die Software Sie lesen kann, die Bewerbungen vorsortiert, hieße das Recht zu verkaufen, gelesen zu werden.',
  },
  {
    title: 'Was Sie sehen, wird gedruckt',
    body: 'Vorschau, Druckansicht und PDF stammen aus derselben Render-Engine. Es gibt nichts zwischen ihnen zu synchronisieren, also auch nichts, was am Abend vor einer Bewerbung auseinanderlaufen kann.',
  },
  {
    title: 'Ihre Daten bleiben Ihre',
    body: 'Kein Weiterverkauf, keine Bewerberdatenbank für Personalvermittler, kein Lebenslauf, der ohne Ihre Entscheidung öffentlich wird. Und ein vollständiger JSON-Export, jederzeit.',
  },
  {
    title: 'Kein Text, der für Sie geschrieben wird',
    body: 'Ein maschinell verfasster Lebenslauf sagt dasselbe wie der des vorigen Bewerbers. Das Werkzeug setzt, strukturiert und prüft die Vollständigkeit; die Sätze bleiben Ihre.',
  },
  {
    title: 'Sagen, was nicht funktioniert',
    body: 'Der ATS-Wert ist eine Einschätzung, und die Seite schreibt das hin, statt ihn als Zertifikat auszugeben. Die genannten Grenzen sind die tatsächlichen Grenzen.',
  },
];

/**
 * The German about page.
 *
 * Not a translation. It answers the question a German visitor arriving from
 * `Lebenslauf Vorlage` actually has — who is behind this and where is the catch — because
 * that market is full of sites that let you build a document and then charge to download it.
 * Naming that directly is the most useful thing the page can do.
 */
export default function GermanAboutPage() {
  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Startseite', path: '/de' },
            { name: 'Über uns', path: '/de/ueber-uns' },
          ]}
        />
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl">
            Über {site.name}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-ink-600">
            Ein Werkzeug, um ein Dokument herzustellen, keine Vermittlungsplattform. Sie
            schreiben einen Lebenslauf, laden ihn herunter und gehen damit. Es gibt keinen
            zweiten Schritt, in dem wir Ihre Bewerbung zu Geld machen.
          </p>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <StatRow
          stats={[
            { value: String(TEMPLATE_COUNT), label: 'Vorlagen' },
            { value: String(FREE_TEMPLATE_COUNT), label: 'kostenlos' },
            { value: String(atsSafeTemplates().length), label: 'mit 5/5 für ATS' },
            { value: site.founded, label: 'seit' },
          ]}
        />
      </Section>

      <Section size="sm">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink-950">Warum es diese Seite gibt</h2>
          <Prose className="mt-4 max-w-none">
            <p>
              Der Markt für Lebenslauf-Werkzeuge hat einen Konstruktionsfehler, der so
              verbreitet ist, dass er als normal gilt: Man lässt Sie Ihren gesamten Werdegang
              eintragen, Sie sehen das Dokument entstehen, und die Schaltfläche zum
              Herunterladen verlangt eine Kreditkarte. In diesem Moment sind die Kosten des
              Abbruchs am höchsten — Sie haben bereits alles geschrieben — und genau deshalb
              steht die Mauer dort.
            </p>
            <p>
              Die Folge sieht man in den Suchergebnissen: Bei Anfragen wie{' '}
              <em>Lebenslauf Vorlage kostenlos</em> benutzt ein erheblicher Teil der Treffer
              „kostenlos“ für das Setzen, nicht für das Ergebnis. Wer innerhalb einer Stunde
              eine Bewerbung abschicken will, verliert Zeit.
            </p>
            <p>
              Wir haben das Problem von der anderen Seite angefasst: Der kostenlose Tarif
              erzeugt ein echtes PDF, und bezahlt wird, was man braucht, wenn man sich
              regelmäßig bewirbt — mehrere Fassungen, alle Vorlagen, die feine Gestaltung. Wer
              einen Lebenslauf für eine Bewerbung schreibt, hat keinen Grund zu zahlen, und es
              ihm abzuverlangen wäre für alle ein schlechtes Geschäft.
            </p>
          </Prose>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <SectionHeading
          align="left"
          title="Unsere Entwurfsprinzipien"
          description="Sechs Entscheidungen, einmal getroffen und überall angewendet. Sie erklären die meisten Eigenheiten, die Ihnen im Produkt begegnen."
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
          <h2 className="text-2xl font-bold text-ink-950">Womit die Seite Geld verdient</h2>
          <Prose className="mt-4 max-w-none">
            <p>
              Ausschließlich mit den Abonnements und dem einmaligen Kauf, die auf der Seite{' '}
              <Link
                href="/de/preise"
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                Preise
              </Link>{' '}
              stehen. Es gibt keine Werbung, keine ins Produkt geschobenen Partnerangebote,
              keinen Datenverkauf und keine Provision auf Bewerbungen.
            </p>
            <p>
              Zahlungen laufen über Paddle, das Verkäufer im Rechtssinne ist und die
              Umsatzsteuer abführt. Ihre Zahlungsdaten sehen wir nie. Die Rückerstattung
              beträgt vierzehn Tage und ist in unserer{' '}
              <Link
                href="/de/rueckerstattung"
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                Rückerstattungsrichtlinie
              </Link>{' '}
              beschrieben.
            </p>
          </Prose>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink-950">Wo wir sind</h2>
          <Prose className="mt-4 max-w-none">
            <p>
              Das Team sitzt in {site.contactAddress.locality} in Marokko, und das Produkt
              erscheint auf Englisch, Französisch, Deutsch und Niederländisch. Die deutschen
              Seiten sind keine Übersetzung der englischen: Was ein deutscher Lebenslauf
              erwartet — der tabellarische Aufbau, Ort, Datum und Unterschrift, die
              Bewerbungsmappe mit Anschreiben und Arbeitszeugnissen — hat auf den englischen
              Seiten keine Entsprechung, und genau deshalb bestehen sie getrennt.
            </p>
            <p>
              Eine Frage, ein Hinweis, ein Fehler? Schreiben Sie an{' '}
              <a
                href={`mailto:${site.supportEmail}`}
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                {site.supportEmail}
              </a>{' '}
              oder nutzen Sie das{' '}
              <Link
                href="/de/kontakt"
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                Kontaktformular
              </Link>
              . Wir antworten innerhalb von zwei Werktagen.
            </p>
          </Prose>
        </div>
      </Section>

      <Section size="sm">
        <CtaBanner
          primaryLabel={DE.cta.primary}
          title={DE.cta.title}
          description={DE.cta.description}
          secondaryHref="/de/lebenslauf-vorlagen"
          secondaryLabel={DE.related.allTemplates}
        />
      </Section>

      <JsonLd
        nodes={[
          webPageSchema({
            path: '/de/ueber-uns',
            name: `Über ${site.name}`,
            description: `Was ${site.name} macht, womit die Seite Geld verdient, und die Prinzipien hinter den meisten Entwurfsentscheidungen.`,
            hasBreadcrumb: true,
            inLanguage: 'de',
          }),
        ]}
      />
    </>
  );
}
