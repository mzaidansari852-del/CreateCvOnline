import type { Metadata } from 'next';
import Link from 'next/link';

import { ContactForm } from '@/components/marketing/ContactForm';
import { Breadcrumbs, Section, SectionHeading } from '@/components/marketing/primitives';
import { Badge } from '@/components/ui/feedback';
import { JsonLd } from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';
import { webPageSchema } from '@/lib/seo/schema';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Kontakt',
  description: `Schreiben Sie dem ${site.name}-Team zu einer Rechnung, einer Rückerstattung, einem Fehler oder einem Vorlagenwunsch. Jede Nachricht wird von einem Menschen beantwortet.`,
  path: '/de/kontakt',
  locale: 'de',
  keywords: ['kontakt createcvonline', 'hilfe lebenslauf', 'support lebenslauf'],
});

const SELF_SERVICE = [
  {
    title: 'Häufige Fragen',
    body: 'Antworten zu Vorlagen, Bewerbermanagementsystemen, Downloads, Abrechnung, Rückerstattung und Ihren Daten. Die meisten Nachrichten, die uns erreichen, sind dort schon beantwortet.',
    href: '/de/faq',
    cta: 'Zu den Fragen',
  },
  {
    title: 'Was die Tarife enthalten',
    body: 'Jede Grenze jedes Tarifs nebeneinander, erzeugt aus derselben Definition, die der Server durchsetzt. Rückerstattung und Währung stehen dort ebenfalls.',
    href: '/de/preise',
    cta: 'Preise ansehen',
  },
  {
    title: 'Lebenslauf schreiben',
    body: 'Was in jeden Abschnitt gehört, wie man einen Erfolg formuliert und wie man auf eine Seite kommt. Geht Ihre Frage um den Inhalt statt um das Werkzeug, fangen Sie hier an.',
    href: '/de/lebenslauf-schreiben',
    cta: 'Anleitung lesen',
  },
];

const TIMES = [
  {
    label: 'Erste Antwort',
    value: 'Innerhalb von 2 Werktagen',
    note: 'Meist noch am selben Tag.',
  },
  {
    label: 'Rückerstattungen',
    value: 'Innerhalb von 2 Werktagen bearbeitet',
    note: 'Paddle und Ihre Bank brauchen danach einige Tage für die Gutschrift.',
  },
  {
    label: 'Fehlermeldungen',
    value: 'Eingangsbestätigung mit nächsten Schritten',
    note: 'Wir sagen Ihnen ehrlich, ob die Behebung kurz oder lang wird.',
  },
];

/**
 * The German contact page.
 *
 * The form is the shared component with `locale="de"`. The subject values it submits stay
 * English so the support inbox does not split into four vocabularies; see the note in
 * `ContactForm`.
 */
export default function GermanContactPage() {
  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Startseite', path: '/de' },
            { name: 'Kontakt', path: '/de/kontakt' },
          ]}
        />
        <SectionHeading
          as="h1"
          eyebrow="Kontakt"
          title="Mit einem Menschen sprechen"
          description="Keine Ticketnummern, kein Chatbot, kein „Ihr Anruf ist uns wichtig“. Schicken Sie das Formular oder schreiben Sie direkt — dasselbe kleine Team liest beides."
        />
      </Section>

      <Section size="sm" className="pt-0">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <h2 className="text-xl font-bold text-ink-950">Nachricht schreiben</h2>
            <p className="mt-1.5 text-sm text-ink-600">
              Die mit einem Sternchen markierten Felder sind Pflicht. Wir antworten an die
              Adresse, die Sie angeben, und an keine andere.
            </p>
            <div className="mt-7">
              <ContactForm locale="de" />
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-ink-200 bg-white p-6">
              <h2 className="text-base font-bold text-ink-950">Per E-Mail</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                Für Support, Abrechnung und alles Übrige:{' '}
                <a
                  href={`mailto:${site.supportEmail}`}
                  className="font-medium text-brand-700 underline underline-offset-2"
                >
                  {site.supportEmail}
                </a>
                . Für Presse und Partnerschaften:{' '}
                <a
                  href={`mailto:${site.pressEmail}`}
                  className="font-medium text-brand-700 underline underline-offset-2"
                >
                  {site.pressEmail}
                </a>
                .
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">
                Geht es um eine Zahlung, nennen Sie bitte die Bestellnummer aus dem Beleg von
                Paddle: Das erspart uns beiden eine Rückfrage.
              </p>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-6">
              <h2 className="text-base font-bold text-ink-950">Antwortzeiten</h2>
              <dl className="mt-4 flex flex-col gap-4">
                {TIMES.map((entry) => (
                  <div key={entry.label}>
                    <dt className="text-xs font-bold tracking-[0.08em] text-ink-500 uppercase">
                      {entry.label}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-ink-900">{entry.value}</dd>
                    <dd className="mt-0.5 text-[13px] leading-relaxed text-ink-600">
                      {entry.note}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-6">
              <h2 className="text-base font-bold text-ink-950">Wo wir sitzen</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {site.contactAddress.locality}, Marokko. Wir arbeiten in marokkanischer
                Ortszeit, im Sommer eine Stunde hinter Deutschland und sonst zwei.
              </p>
              <p className="mt-3">
                <Badge tone="neutral">Antwort auf Deutsch oder Englisch</Badge>
              </p>
            </div>
          </aside>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <SectionHeading
          align="left"
          title="Bevor Sie schreiben"
          description="Diese drei Seiten beantworten die meisten Fragen — sofort statt in zwei Tagen."
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SELF_SERVICE.map((entry) => (
            <div
              key={entry.href}
              className="flex flex-col rounded-xl border border-ink-200 bg-white p-5"
            >
              <h3 className="text-base font-semibold text-ink-950">{entry.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-600">{entry.body}</p>
              <p className="mt-4 text-sm">
                <Link
                  href={entry.href}
                  className="font-medium text-brand-700 underline underline-offset-2"
                >
                  {entry.cta}
                </Link>
              </p>
            </div>
          ))}
        </div>
      </Section>

      <JsonLd
        nodes={[
          webPageSchema({
            path: '/de/kontakt',
            name: 'Kontakt',
            description: `Schreiben Sie dem ${site.name}-Team. Antwort von einem Menschen innerhalb von zwei Werktagen.`,
            hasBreadcrumb: true,
            inLanguage: 'de',
          }),
        ]}
      />
    </>
  );
}
