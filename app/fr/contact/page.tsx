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
 * `Nous contacter`, not `Contact`.
 *
 * The two words are identical in French and English, so `Contact | CreateCVOnline` was
 * byte-for-byte the title of `/contact` — which the SEO crawler flags as a duplicate, and
 * rightly: two pages competing on one title string is the weakest possible signal about
 * which one a French searcher should get. The description is also kept under 160 characters
 * so Google renders the whole of it rather than cutting it mid-clause.
 */
export const metadata: Metadata = pageMetadata({
  title: 'Nous contacter',
  description: `Une question sur une facture, un remboursement ou un dysfonctionnement ? Écrivez à l’équipe ${site.name} : une personne vous répond sous deux jours ouvrés.`,
  path: '/fr/contact',
  locale: 'fr',
  keywords: ['contact createcvonline', 'aide cv en ligne', 'support cv'],
});

const SELF_SERVICE = [
  {
    title: 'Questions fréquentes',
    body: 'Les réponses sur les modèles, les logiciels de tri, les téléchargements, la facturation, le remboursement et vos données. La majorité des messages que nous recevons y trouvent déjà leur réponse.',
    href: '/fr/faq',
    cta: 'Lire la FAQ',
  },
  {
    title: 'Ce que contiennent les offres',
    body: 'Chaque limite de chaque offre, côte à côte, produite à partir de la même définition que celle appliquée par le serveur. Le remboursement et la devise y sont traités aussi.',
    href: '/fr/tarifs',
    cta: 'Voir les tarifs',
  },
  {
    title: 'Faire un CV',
    body: 'Ce qu’on met dans chaque rubrique, comment tourner une réalisation, et comment tenir sur une page. Si votre question porte sur le contenu plutôt que sur l’outil, commencez par là.',
    href: '/fr/faire-un-cv',
    cta: 'Lire le guide',
  },
];

const TIMES = [
  {
    label: 'Première réponse',
    value: 'Sous 2 jours ouvrés',
    note: 'Le plus souvent le jour même.',
  },
  {
    label: 'Demandes de remboursement',
    value: 'Traitées sous 2 jours ouvrés',
    note: 'Paddle et votre banque prennent ensuite quelques jours pour restituer les fonds.',
  },
  {
    label: 'Signalements de bug',
    value: 'Accusé de réception avec la suite',
    note: 'Nous vous dirons honnêtement si la correction est rapide ou non.',
  },
];

/**
 * The French contact page.
 *
 * The form is the same component as the English page's, given `locale="fr"` — which is new:
 * it was hardcoded English throughout, and a French contact page whose only interactive
 * element answered in English would have been worse than not having one. The subject values
 * it submits stay English so the support inbox does not split into two vocabularies; see
 * the note in `ContactForm`.
 */
export default function FrenchContactPage() {
  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Accueil', path: '/fr' },
            { name: 'Contact', path: '/fr/contact' },
          ]}
        />
        <SectionHeading
          as="h1"
          eyebrow="Contact"
          title="Parler à quelqu’un"
          description="Pas de numéro de ticket, pas de robot conversationnel, pas de « votre appel est important pour nous ». Envoyez le formulaire ou écrivez-nous directement — c’est la même petite équipe qui lit les deux."
        />
      </Section>

      <Section size="sm" className="pt-0">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <h2 className="text-xl font-bold text-ink-950">Nous envoyer un message</h2>
            <p className="mt-1.5 text-sm text-ink-600">
              Les champs marqués d’un astérisque sont obligatoires. Nous répondons à l’adresse
              que vous indiquez, et à rien d’autre.
            </p>
            <div className="mt-7">
              <ContactForm locale="fr" />
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-ink-200 bg-white p-6">
              <h2 className="text-base font-bold text-ink-950">Par e-mail</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                Pour le support, la facturation et tout le reste :{' '}
                <a
                  href={`mailto:${site.supportEmail}`}
                  className="font-medium text-brand-700 underline underline-offset-2"
                >
                  {site.supportEmail}
                </a>
                . Pour la presse et les partenariats :{' '}
                <a
                  href={`mailto:${site.pressEmail}`}
                  className="font-medium text-brand-700 underline underline-offset-2"
                >
                  {site.pressEmail}
                </a>
                .
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">
                Si votre message concerne un paiement, indiquez le numéro de commande figurant
                sur le reçu envoyé par Paddle : cela nous évite un aller-retour.
              </p>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-6">
              <h2 className="text-base font-bold text-ink-950">Délais de réponse</h2>
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
              <h2 className="text-base font-bold text-ink-950">Où nous sommes</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {site.contactAddress.locality}, Maroc. Nous travaillons en heure locale
                marocaine, une heure derrière la France en été et à la même heure le reste de
                l’année.
              </p>
              <p className="mt-3">
                <Badge tone="neutral">Réponse en français ou en anglais</Badge>
              </p>
            </div>
          </aside>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <SectionHeading
          align="left"
          title="Avant d’écrire"
          description="Ces trois pages répondent à la plupart des questions, tout de suite plutôt que dans deux jours."
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
            path: '/fr/contact',
            name: 'Contact',
            description: `Écrivez à l’équipe ${site.name}. Réponse d’une personne sous deux jours ouvrés.`,
            type: 'WebPage',
            hasBreadcrumb: true,
            inLanguage: 'fr',
          }),
        ]}
      />
    </>
  );
}
