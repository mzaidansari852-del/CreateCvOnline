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
import { FR } from '../fr-copy';
import {
  FREE_TEMPLATE_COUNT,
  TEMPLATE_COUNT,
  atsSafeTemplates,
} from '@/lib/cv/template-registry';
import { pageMetadata } from '@/lib/seo/metadata';
import { webPageSchema } from '@/lib/seo/schema';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'À propos',
  // Kept under 160 characters: past that, Google truncates and the last clause is lost.
  description: `${site.name} : des modèles lisibles par les logiciels de recrutement, un éditeur fidèle au PDF, et une offre gratuite qui télécharge vraiment.`,
  path: '/fr/a-propos',
  locale: 'fr',
  keywords: ['à propos createcvonline', 'créateur de cv en ligne', 'qui sommes-nous'],
});

const PRINCIPLES = [
  {
    title: 'Le téléchargement n’est pas l’appât',
    body: 'Beaucoup d’outils laissent composer un CV entier puis demandent un paiement au moment de l’export. C’est efficace et c’est déloyal : la personne a déjà fait le travail. Ici, l’offre gratuite télécharge un vrai PDF.',
  },
  {
    title: 'La compatibilité ATS n’est pas une option payante',
    body: 'Tous les modèles notés 5 sur 5 pour les logiciels de tri sont gratuits. Faire payer le fait d’être lisible par le logiciel qui filtre les candidatures reviendrait à vendre le droit d’être lu.',
  },
  {
    title: 'Ce que vous voyez est ce qui s’imprime',
    body: 'L’aperçu, la page d’impression et le PDF sortent du même moteur de rendu. Il n’y a rien à synchroniser entre eux, donc rien qui puisse diverger la veille d’une candidature.',
  },
  {
    title: 'Vos données restent les vôtres',
    body: 'Aucune revente, aucune base de candidats proposée à des recruteurs, aucun CV rendu public sans que vous l’ayez décidé. Et un export complet en JSON, disponible à tout moment.',
  },
  {
    title: 'Pas de texte généré à votre place',
    body: 'Un CV écrit par une machine dit la même chose que celui du candidat précédent. L’outil met en forme, structure et vérifie la complétude ; les phrases restent les vôtres.',
  },
  {
    title: 'Dire ce qui ne marche pas',
    body: 'La note ATS est une évaluation et le site l’écrit noir sur blanc, plutôt que de la présenter comme une certification. Les limites annoncées sont les limites réelles.',
  },
];

/**
 * The French about page.
 *
 * Not a translation of the English one. The English page tells the story of the product to a
 * UK/US reader; this one answers the question a French visitor arriving from `modèle de CV`
 * actually has, which is "qui est derrière ce site et où est le piège" — the market it
 * competes in is full of sites that let you build a CV and then charge you to download it.
 * Naming that directly is the most useful thing the page can do.
 */
export default function FrenchAboutPage() {
  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Accueil', path: '/fr' },
            { name: 'À propos', path: '/fr/a-propos' },
          ]}
        />
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl">
            À propos de {site.name}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-ink-600">
            Un outil pour produire un document, pas une plateforme de recrutement. Vous
            écrivez un CV, vous le téléchargez, vous partez avec. Il n’y a pas de deuxième
            étape où nous monétisons votre candidature.
          </p>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <StatRow
          stats={[
            { value: String(TEMPLATE_COUNT), label: 'modèles' },
            { value: String(FREE_TEMPLATE_COUNT), label: 'gratuits' },
            { value: String(atsSafeTemplates().length), label: 'notés 5/5 pour les ATS' },
            { value: site.founded, label: 'depuis' },
          ]}
        />
      </Section>

      <Section size="sm">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink-950">Pourquoi ce site existe</h2>
          <Prose className="mt-4 max-w-none">
            <p>
              Le marché du CV en ligne a un défaut de conception si répandu qu’il est devenu la
              norme : on vous laisse saisir votre parcours entier, vous voyez votre document
              prendre forme, et le bouton de téléchargement demande une carte bancaire. À ce
              moment-là, le coût d’abandon est maximal — vous avez déjà tout écrit — et c’est
              précisément pour cela que le mur est placé là.
            </p>
            <p>
              La conséquence est visible dans les résultats de recherche : sur des requêtes
              comme <em>modèle de CV gratuit</em>, une part importante des pages proposées
              utilisent « gratuit » pour désigner la composition, pas le résultat. Une
              personne qui cherche à envoyer une candidature dans l’heure perd son temps.
            </p>
            <p>
              Nous avons donc pris le problème par l’autre bout : l’offre gratuite produit un
              vrai PDF, et ce qui se paie est ce dont on a besoin quand on postule
              régulièrement — plusieurs versions du CV, tous les modèles, la mise en forme
              fine. Quelqu’un qui fait un CV pour une candidature n’a aucune raison de payer,
              et le lui faire payer serait une mauvaise affaire pour tout le monde.
            </p>
          </Prose>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <SectionHeading
          align="left"
          title="Nos principes de conception"
          description="Six décisions prises une fois et appliquées partout. Elles expliquent la plupart des choix que vous verrez dans le produit."
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
          <h2 className="text-2xl font-bold text-ink-950">Comment le site gagne de l’argent</h2>
          <Prose className="mt-4 max-w-none">
            <p>
              Uniquement par les abonnements et l’achat à vie décrits sur la page{' '}
              <Link
                href="/fr/tarifs"
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                tarifs
              </Link>
              . Il n’y a pas de publicité, pas d’offres partenaires glissées dans le produit,
              pas de revente de données et pas de commission sur des candidatures.
            </p>
            <p>
              Les paiements passent par Paddle, qui est le vendeur officiel et se charge de la
              TVA applicable dans votre pays. Nous ne voyons jamais vos coordonnées bancaires.
              Le remboursement est de quatorze jours et il est décrit dans notre{' '}
              <Link
                href="/fr/remboursement"
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                politique de remboursement
              </Link>
              .
            </p>
          </Prose>
        </div>
      </Section>

      <Section tone="muted" size="sm">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink-950">Où nous sommes</h2>
          <Prose className="mt-4 max-w-none">
            <p>
              L’équipe est basée à {site.contactAddress.locality}, au Maroc, et le produit est
              publié en anglais, en français, en allemand et en néerlandais. Le site français
              n’est pas une traduction du site anglais : les conventions d’un CV français —
              la photo, la page unique, les niveaux CECRL, le format Europass — n’ont pas
              d’équivalent sur les pages anglaises, et c’est ce qui justifie qu’elles
              existent séparément.
            </p>
            <p>
              Une question, une remarque, un dysfonctionnement ? Écrivez à{' '}
              <a
                href={`mailto:${site.supportEmail}`}
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                {site.supportEmail}
              </a>{' '}
              ou passez par le{' '}
              <Link
                href="/fr/contact"
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                formulaire de contact
              </Link>
              . Nous répondons sous deux jours ouvrés.
            </p>
          </Prose>
        </div>
      </Section>

      <Section size="sm">
        <CtaBanner
          primaryLabel={FR.cta.primary}
          title={FR.cta.title}
          description={FR.cta.description}
          secondaryHref="/fr/modeles-de-cv"
          secondaryLabel={FR.home.ctaSecondary}
        />
      </Section>

      <JsonLd
        nodes={[
          webPageSchema({
            path: '/fr/a-propos',
            name: `À propos de ${site.name}`,
            description: `Ce que fait ${site.name}, comment le site gagne de l’argent, et les principes qui expliquent la plupart de ses choix de conception.`,
            hasBreadcrumb: true,
            inLanguage: 'fr',
          }),
        ]}
      />
    </>
  );
}
