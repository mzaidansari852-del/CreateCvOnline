import type { Metadata } from 'next';
import Link from 'next/link';

import { ContactForm } from '@/components/marketing/ContactForm';
import { Breadcrumbs, Section, SectionHeading } from '@/components/marketing/primitives';
import { Badge } from '@/components/ui/feedback';
import { JsonLd } from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';
import { webPageSchema } from '@/lib/seo/schema';
import { site } from '@/lib/site';

/*
 * `Neem contact op`, not `Contact`.
 *
 * The word is identical in Dutch and English, so the title was byte-for-byte the one on
 * `/contact` — which the SEO crawler flags as a duplicate, and rightly: two pages competing
 * on one title string is the weakest possible signal about which a Dutch searcher should
 * get. The French page hit exactly this and was fixed the same way.
 */
export const metadata: Metadata = pageMetadata({
  title: 'Neem contact op',
  description: `Mail het ${site.name}-team over een factuur, een terugbetaling, een storing of een verzoek voor een sjabloon. Elk bericht wordt door een mens beantwoord.`,
  path: '/nl/contact',
  locale: 'nl',
  keywords: ['contact createcvonline', 'hulp cv maken', 'support cv'],
});

const SELF_SERVICE = [
  {
    title: 'Veelgestelde vragen',
    body: 'Antwoorden over sjablonen, recruitmentsoftware, downloads, facturatie, terugbetaling en je gegevens. De meeste berichten die we krijgen zijn daar al beantwoord.',
    href: '/nl/veelgestelde-vragen',
    cta: 'Lees de vragen',
  },
  {
    title: 'Wat de abonnementen bevatten',
    body: 'Elke grens van elk abonnement naast elkaar, opgebouwd uit dezelfde definitie die de server toepast. Terugbetaling en valuta staan er ook bij.',
    href: '/nl/prijzen',
    cta: 'Bekijk de prijzen',
  },
  {
    title: 'Cv schrijven',
    body: 'Wat er in elke sectie hoort, hoe je een resultaat formuleert en hoe je op één pagina komt. Gaat je vraag over de inhoud in plaats van het gereedschap, begin dan hier.',
    href: '/nl/cv-schrijven',
    cta: 'Lees de aanpak',
  },
];

const TIMES = [
  {
    label: 'Eerste reactie',
    value: 'Binnen 2 werkdagen',
    note: 'Meestal dezelfde dag.',
  },
  {
    label: 'Verzoeken om terugbetaling',
    value: 'Binnen 2 werkdagen afgehandeld',
    note: 'Paddle en je bank hebben daarna nog een paar dagen nodig om het geld terug te zetten.',
  },
  {
    label: 'Foutmeldingen',
    value: 'Ontvangstbevestiging met vervolgstappen',
    note: 'We zeggen eerlijk of de oplossing kort of lang wordt.',
  },
];

/**
 * The Dutch contact page.
 *
 * The form is the shared component with `locale="nl"`. The subject values it submits stay
 * English so the support inbox does not split into four vocabularies; see the note in
 * `ContactForm`.
 */
export default function DutchContactPage() {
  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/nl' },
            { name: 'Contact', path: '/nl/contact' },
          ]}
        />
        <SectionHeading
          as="h1"
          eyebrow="Contact"
          title="Praat met een mens"
          description="Geen ticketnummers, geen chatbot, geen “uw bericht is belangrijk voor ons”. Stuur het formulier of mail rechtstreeks — hetzelfde kleine team leest allebei."
        />
      </Section>

      <Section size="sm" className="pt-0">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <h2 className="text-xl font-bold text-ink-950">Stuur ons een bericht</h2>
            <p className="mt-1.5 text-sm text-ink-600">
              De velden met een sterretje zijn verplicht. We antwoorden op het adres dat je
              opgeeft, en op geen ander.
            </p>
            <div className="mt-7">
              <ContactForm locale="nl" />
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-ink-200 bg-white p-6">
              <h2 className="text-base font-bold text-ink-950">Per e-mail</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                Voor support, facturatie en al het overige:{' '}
                <a
                  href={`mailto:${site.supportEmail}`}
                  className="font-medium text-brand-700 underline underline-offset-2"
                >
                  {site.supportEmail}
                </a>
                . Voor pers en samenwerking:{' '}
                <a
                  href={`mailto:${site.pressEmail}`}
                  className="font-medium text-brand-700 underline underline-offset-2"
                >
                  {site.pressEmail}
                </a>
                .
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">
                Gaat het over een betaling, noem dan het bestelnummer van de bon die Paddle je
                heeft gestuurd: dat scheelt ons allebei een heen-en-weer.
              </p>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-6">
              <h2 className="text-base font-bold text-ink-950">Reactietijden</h2>
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
              <h2 className="text-base font-bold text-ink-950">Waar we zitten</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {site.contactAddress.locality}, Marokko. We werken in Marokkaanse tijd, in de
                zomer een uur achter Nederland en de rest van het jaar twee.
              </p>
              <p className="mt-3">
                <Badge tone="neutral">Antwoord in het Nederlands of Engels</Badge>
              </p>
            </div>
          </aside>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <SectionHeading
          align="left"
          title="Voordat je mailt"
          description="Deze drie pagina’s beantwoorden de meeste vragen, meteen in plaats van over twee dagen."
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
            path: '/nl/contact',
            name: 'Contact',
            description: `Mail het ${site.name}-team. Antwoord van een mens binnen twee werkdagen.`,
            hasBreadcrumb: true,
            inLanguage: 'nl',
          }),
        ]}
      />
    </>
  );
}
