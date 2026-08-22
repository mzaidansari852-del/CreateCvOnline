import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalDocument, type LegalSection } from '@/components/marketing/LegalDocument';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Politique de remboursement',
  description: `Quatorze jours pour être remboursé chez ${site.name}, ce qui est concerné, comment le demander et en combien de temps l’argent revient.`,
  path: '/fr/remboursement',
  locale: 'fr',
});

/** Section ids match the English page so a deep link works across both languages. */
const SECTIONS: LegalSection[] = [
  {
    id: 'the-promise',
    title: 'Le délai de quatorze jours',
    body: (
      <>
        <p>
          Vous disposez de <strong>quatorze jours</strong> à compter de l’achat pour demander un
          remboursement intégral, sans avoir à vous justifier. Écrivez-nous, indiquez le numéro
          de commande, c’est tout.
        </p>
        <p>
          Nous ne demandons pas ce qui n’a pas convenu, nous ne proposons pas trois offres
          alternatives avant d’accepter, et il n’y a pas de formulaire à remplir. Un service qui
          rend le remboursement pénible ne mérite pas la confiance qu’il demande au moment du
          paiement.
        </p>
        <p>
          Si vous êtes consommateur dans l’Union européenne, votre droit de rétractation légal
          s’applique en plus de cette politique et n’est en rien restreint par elle.
        </p>
      </>
    ),
  },
  {
    id: 'what-is-refundable',
    title: 'Ce qui est remboursable',
    body: (
      <>
        <ul>
          <li>
            <strong>Un premier achat d’abonnement</strong>, dans les quatorze jours, quel que
            soit l’usage que vous en avez fait entre-temps.
          </li>
          <li>
            <strong>L’accès à vie</strong>, dans les quatorze jours suivant l’achat.
          </li>
          <li>
            <strong>Un renouvellement d’abonnement que vous n’attendiez pas</strong>, si vous
            nous écrivez rapidement après le prélèvement. Un renouvellement oublié n’est pas un
            piège que nous cherchons à refermer sur vous.
          </li>
          <li>
            <strong>Un double paiement</strong>, une erreur de montant ou une transaction que
            vous ne reconnaissez pas : intégralement remboursés, sans condition de délai.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'what-is-not',
    title: 'Ce qui ne l’est pas',
    body: (
      <>
        <ul>
          <li>
            <strong>Les périodes déjà écoulées d’un abonnement au-delà des quatorze jours.</strong>{' '}
            Si vous résiliez au huitième mois, nous ne remboursons pas les sept mois utilisés.
            La résiliation empêche le prélèvement suivant.
          </li>
          <li>
            <strong>Les achats répétés du même remboursement.</strong> Si vous avez déjà été
            remboursé d’une offre, la racheter puis en redemander le remboursement sort du cadre
            de cette politique.
          </li>
        </ul>
        <p>
          Cette liste est courte et c’est volontaire. Nous n’excluons pas le remboursement au
          motif que vous avez téléchargé un PDF ou utilisé un modèle Pro : c’est précisément ce
          que vous aviez payé pour faire, et vous le reprocher reviendrait à vendre un droit que
          l’on n’a pas le droit d’exercer.
        </p>
      </>
    ),
  },
  {
    id: 'how-to-ask',
    title: 'Comment demander un remboursement',
    body: (
      <>
        <p>
          Écrivez à <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> ou utilisez
          le <Link href="/fr/contact">formulaire de contact</Link> en choisissant le sujet
          « Demande de remboursement ».
        </p>
        <p>Indiquez :</p>
        <ul>
          <li>
            le <strong>numéro de transaction Paddle</strong>, qui figure sur le reçu envoyé par
            e-mail au moment de l’achat ;
          </li>
          <li>
            l’<strong>adresse e-mail du compte</strong>, si elle diffère de celle depuis
            laquelle vous écrivez.
          </li>
        </ul>
        <p>
          Le motif est facultatif. Il nous est utile pour améliorer le produit, il ne
          conditionne rien.
        </p>
        <p>
          Paddle étant le vendeur officiel, vous pouvez également passer par le lien figurant sur
          votre reçu. Les deux voies aboutissent au même résultat ; nous écrire est en général
          plus rapide.
        </p>
      </>
    ),
  },
  {
    id: 'how-long',
    title: 'Les délais',
    body: (
      <>
        <ul>
          <li>
            <strong>Notre décision</strong> — sous deux jours ouvrés, le plus souvent le jour
            même.
          </li>
          <li>
            <strong>Le traitement par Paddle</strong> — l’ordre de remboursement part
            immédiatement après notre accord.
          </li>
          <li>
            <strong>Le retour des fonds sur votre compte</strong> — de trois à dix jours ouvrés
            selon votre banque ou votre émetteur de carte. Cette dernière étape ne dépend ni de
            nous ni de Paddle.
          </li>
        </ul>
        <p>
          Si rien n’est arrivé au bout de dix jours ouvrés après notre confirmation, écrivez-nous
          : nous vous transmettrons la référence du remboursement à présenter à votre banque.
        </p>
      </>
    ),
  },
  {
    id: 'after-a-refund',
    title: 'Ce que deviennent vos CV et vos téléchargements',
    body: (
      <>
        <p>
          Votre compte repasse à l’offre gratuite. <strong>Aucun CV n’est supprimé.</strong> Ils
          restent consultables, modifiables et exportables avec les modèles gratuits.
        </p>
        <p>
          Ce que vous perdez : les modèles Pro, les CV multiples au-delà de la limite gratuite,
          la personnalisation avancée, les rubriques sur mesure, le lien public et le PDF sans
          mention en pied de page. Un CV composé avec un modèle Pro reste visible dans votre
          espace ; son export bascule sur un modèle gratuit.
        </p>
        <p>
          Les PDF que vous aviez déjà téléchargés sont à vous et le restent. Nous ne les
          révoquons pas et nous n’avons aucun moyen de le faire — ce sont des fichiers sur votre
          disque.
        </p>
      </>
    ),
  },
  {
    id: 'cancelling',
    title: 'Comment éviter un nouveau prélèvement',
    body: (
      <>
        <p>
          Un remboursement et une résiliation sont deux choses différentes. Le remboursement
          rend l’argent d’un paiement déjà effectué ; la résiliation empêche le suivant.
        </p>
        <p>
          La résiliation se fait depuis la page « Compte » de votre espace, ou via le lien de
          gestion figurant sur le reçu Paddle. Elle prend effet à la fin de la période déjà
          payée : vous conservez l’accès jusque-là, ce qui est normal puisque cette période
          vous a été facturée.
        </p>
        <p>
          L’accès à vie ne se résilie pas, parce qu’il ne se renouvelle pas. Il n’y aura jamais
          de second prélèvement.
        </p>
      </>
    ),
  },
  {
    id: 'chargebacks',
    title: 'Litiges et oppositions bancaires',
    body: (
      <>
        <p>
          Si vous ne reconnaissez pas un paiement, écrivez-nous avant de faire opposition auprès
          de votre banque. Une opposition déclenche une procédure formelle chez Paddle, qui
          prend plusieurs semaines et gèle le dossier — alors qu’un remboursement direct prend
          deux jours.
        </p>
        <p>
          Une opposition ouverte suspend l’accès payant le temps de son instruction. C’est une
          contrainte du prestataire de paiement, pas une sanction de notre part.
        </p>
      </>
    ),
  },
  {
    id: 'statutory-rights',
    title: 'Vos droits légaux',
    body: (
      <>
        <p>
          Cette politique s’ajoute à vos droits légaux et ne les remplace pas. Elle est en
          pratique plus favorable que le minimum légal sur plusieurs points, et là où elle ne le
          serait pas, c’est la loi qui prévaut.
        </p>
        <p>
          Dans l’Union européenne, l’achat d’un contenu numérique ouvre un droit de rétractation
          de quatorze jours. Un professionnel peut demander au consommateur de renoncer à ce
          droit pour obtenir un accès immédiat ; nous ne le faisons pas, et le délai de
          quatorze jours décrit ici s’applique dans tous les cas.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Modifications de cette politique',
    body: (
      <p>
        Une modification n’a jamais d’effet rétroactif : un achat est régi par la politique en
        vigueur au jour où il a été effectué. La date de dernière mise à jour figure en haut de
        la page.
      </p>
    ),
  },
];

export default function FrenchRefundPolicyPage() {
  return (
    <LegalDocument
      locale="fr"
      title="Politique de remboursement"
      intro="Quatorze jours, sans justification à fournir. Voici précisément ce qui est concerné, comment le demander, et en combien de temps l’argent revient."
      summary={[
        <>Quatorze jours pour être intégralement remboursé, sans avoir à vous expliquer.</>,
        <>
          Avoir téléchargé un PDF ou utilisé un modèle Pro ne vous en prive pas : c’est ce que
          vous aviez payé pour faire.
        </>,
        <>Un renouvellement que vous n’attendiez pas est remboursé si vous nous écrivez vite.</>,
        <>
          Aucun CV n’est supprimé après un remboursement ; le compte repasse simplement à
          l’offre gratuite.
        </>,
        <>
          Écrivez-nous avant de faire opposition : deux jours par e-mail contre plusieurs
          semaines de procédure.
        </>,
      ]}
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Tarifs', href: '/fr/tarifs' },
        { label: 'Conditions générales', href: '/fr/conditions-generales' },
        { label: 'Nous contacter', href: '/fr/contact' },
      ]}
    />
  );
}
