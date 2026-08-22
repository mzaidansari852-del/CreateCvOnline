import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalDocument, type LegalSection } from '@/components/marketing/LegalDocument';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Conditions générales',
  description: `Les conditions d’utilisation de ${site.name} : ce que le service fournit, les offres et le paiement, la propriété de vos contenus et nos responsabilités.`,
  path: '/fr/conditions-generales',
  locale: 'fr',
});

/** Section ids match the English page so a deep link works across both languages. */
const SECTIONS: LegalSection[] = [
  {
    id: 'agreement',
    title: 'Le présent contrat',
    body: (
      <>
        <p>
          En créant un compte ou en utilisant {site.name} à l’adresse {site.domain}, vous
          acceptez les présentes conditions. Si vous ne les acceptez pas, n’utilisez pas le
          service — c’est la seule conséquence, et il n’y en a pas d’autre.
        </p>
        <p>
          Elles forment, avec la{' '}
          <Link href="/fr/confidentialite">politique de confidentialité</Link>, la{' '}
          <Link href="/fr/cookies">politique relative aux cookies</Link> et la{' '}
          <Link href="/fr/remboursement">politique de remboursement</Link>, l’intégralité de
          l’accord entre vous et l’exploitant du service.
        </p>
      </>
    ),
  },
  {
    id: 'service',
    title: 'Ce qu’est le service',
    body: (
      <>
        <p>
          {site.name} est un outil de composition de documents. Il vous permet de saisir un
          parcours professionnel dans des champs structurés, de le mettre en forme au moyen de
          modèles, et d’exporter le résultat en PDF.
        </p>
        <p>
          Ce n’est pas un service de placement, un cabinet de recrutement, ni une plateforme de
          mise en relation. Nous ne transmettons votre CV à aucun employeur, nous ne le
          proposons à aucun recruteur, et nous ne garantissons évidemment aucun résultat quant
          à vos candidatures.
        </p>
        <p>
          Les indications éditoriales du site — la note de compatibilité ATS, les conseils de
          rédaction, les observations sur les usages d’un CV français — sont des avis
          documentés, pas des conseils professionnels personnalisés en matière d’emploi.
        </p>
      </>
    ),
  },
  {
    id: 'accounts',
    title: 'Votre compte',
    body: (
      <>
        <p>
          Vous devez avoir au moins seize ans pour créer un compte. Vous êtes responsable de
          l’exactitude de l’adresse e-mail que vous fournissez et de la confidentialité de vos
          identifiants ; prévenez-nous sans délai si vous soupçonnez un accès non autorisé.
        </p>
        <p>
          Un compte est personnel. Le partage d’un compte payant entre plusieurs personnes est
          contraire aux présentes conditions, notamment parce que les limites d’usage sont
          calculées par compte.
        </p>
        <p>
          Confirmer votre adresse e-mail est vivement recommandé et ne bloque rien dans
          l’éditeur : c’est la seule voie de retour si vous oubliez votre mot de passe.
        </p>
      </>
    ),
  },
  {
    id: 'plans',
    title: 'Offres, prix et paiement',
    body: (
      <>
        <p>
          Le détail des offres figure sur la page <Link href="/fr/tarifs">tarifs</Link>. L’offre
          gratuite permet de créer un CV, de le mettre en forme et d’en télécharger le PDF avec
          les modèles gratuits, sans carte bancaire et sans période d’essai limitée dans le
          temps.
        </p>
        <p>
          Les paiements sont traités par Paddle, qui agit en qualité de vendeur officiel :
          Paddle facture, collecte et reverse la TVA applicable dans votre pays, et vous adresse
          le reçu et la facture. Nous ne voyons ni ne conservons vos coordonnées bancaires.
        </p>
        <p>
          Les montants sont libellés en dollars américains ; votre banque applique son propre
          taux de change et peut prélever des frais qui ne relèvent pas de nous. Un abonnement
          se renouvelle automatiquement jusqu’à résiliation ; l’accès à vie est un paiement
          unique sans renouvellement.
        </p>
        <p>
          Nous pouvons faire évoluer nos tarifs. Un changement de prix ne s’applique jamais
          rétroactivement à une période déjà réglée, et un abonnement en cours vous est notifié
          avant l’échéance concernée.
        </p>
      </>
    ),
  },
  {
    id: 'refunds',
    title: 'Remboursements',
    body: (
      <p>
        Quatorze jours à compter de l’achat, dans les conditions décrites dans notre{' '}
        <Link href="/fr/remboursement">politique de remboursement</Link>, qui fait partie
        intégrante des présentes conditions. Si vous résidez dans l’Union européenne, vos droits
        légaux de rétractation s’appliquent en tout état de cause et ne sont pas restreints par
        ce document.
      </p>
    ),
  },
  {
    id: 'your-content',
    title: 'Vos contenus',
    body: (
      <>
        <p>
          <strong>Ce que vous écrivez vous appartient.</strong> Nous ne revendiquons aucun droit
          de propriété sur le contenu de vos CV, et le PDF que vous exportez est le vôtre, sans
          restriction d’usage.
        </p>
        <p>
          Vous nous accordez uniquement la licence technique strictement nécessaire à
          l’exploitation du service : stocker votre contenu, l’afficher dans votre navigateur,
          le composer en PDF, et — si et seulement si vous activez un lien de partage — le
          rendre accessible à l’adresse correspondante.
        </p>
        <p>
          Vous garantissez que le contenu que vous saisissez est exact vous concernant et que
          vous êtes en droit de l’utiliser. Les coordonnées d’un référent ne doivent y figurer
          qu’avec son accord, et ne devraient jamais être publiées via un lien de partage.
        </p>
      </>
    ),
  },
  {
    id: 'our-content',
    title: 'Nos modèles et le site',
    body: (
      <>
        <p>
          Les modèles, le code, les textes et les visuels du site nous appartiennent ou nous
          sont concédés. Votre offre vous donne le droit d’utiliser les modèles pour composer
          vos propres documents, y compris à des fins professionnelles : un CV produit ici peut
          être envoyé à un employeur, publié sur votre site, ou imprimé, sans redevance.
        </p>
        <p>
          Ce que ce droit ne couvre pas : redistribuer ou revendre les modèles en tant que
          modèles, les intégrer à un produit concurrent, ou extraire massivement le contenu du
          site pour le republier.
        </p>
        <p>
          Les polices proposées dans l’éditeur sont fournies sous leurs propres licences
          ouvertes, qui autorisent l’usage documentaire décrit ci-dessus.
        </p>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Usage acceptable',
    body: (
      <>
        <p>Vous vous engagez à ne pas utiliser le service pour :</p>
        <ul>
          <li>
            produire un document destiné à tromper — fausse identité, diplôme non obtenu,
            expérience inventée dans le but d’obtenir un poste par fraude ;
          </li>
          <li>
            stocker ou diffuser des contenus illicites, diffamatoires ou portant atteinte aux
            droits d’un tiers ;
          </li>
          <li>
            tenter d’accéder au compte ou aux documents d’un autre utilisateur, contourner les
            limites d’usage ou les contrôles d’authentification ;
          </li>
          <li>
            soumettre le service à une charge automatisée disproportionnée, ou en extraire le
            contenu par moissonnage systématique ;
          </li>
          <li>
            revendre l’accès au service ou le mettre à disposition de tiers en tant que service.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'availability',
    title: 'Disponibilité et évolutions',
    body: (
      <>
        <p>
          Nous visons une disponibilité continue sans nous y engager contractuellement : il n’y
          a pas de garantie de niveau de service, et une interruption pour maintenance ou une
          panne d’un prestataire reste possible.
        </p>
        <p>
          Le produit évolue. Des modèles et des fonctionnalités seront ajoutés ; certains
          pourront être retirés. Si une fonctionnalité disparaît alors qu’elle était incluse
          dans une offre payante que vous avez réglée, nous vous en informerons et, si le
          changement est substantiel, nous vous proposerons une solution — remboursement au
          prorata ou équivalent.
        </p>
      </>
    ),
  },
  {
    id: 'suspension',
    title: 'Suspension et résiliation',
    body: (
      <>
        <p>
          Vous pouvez cesser d’utiliser le service et demander la suppression de votre compte à
          tout moment, depuis les réglages.
        </p>
        <p>
          Nous pouvons suspendre ou fermer un compte en cas de manquement caractérisé à la
          section « Usage acceptable », de fraude au paiement, ou d’usage compromettant la
          sécurité du service. Sauf lorsque la loi ou une enquête en cours l’interdit, nous
          expliquons le motif et laissons la possibilité d’exporter les documents concernés.
        </p>
      </>
    ),
  },
  {
    id: 'disclaimers',
    title: 'Exclusions de garantie',
    body: (
      <>
        <p>
          Le service est fourni « en l’état ». Nous ne garantissons pas qu’il sera exempt
          d’erreurs ni disponible sans interruption.
        </p>
        <p>
          En particulier, et parce que c’est la garantie que l’on nous prête le plus volontiers
          : la note de compatibilité ATS est notre propre évaluation des propriétés de mise en
          page d’un modèle. Il existe de nombreux logiciels de suivi des candidatures, ils se
          comportent différemment, et nous ne pouvons pas garantir qu’un CV donné sera
          correctement analysé par l’un d’eux en particulier.
        </p>
        <p>
          Ces exclusions ne restreignent pas les garanties légales impératives dont vous
          bénéficiez en tant que consommateur.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation de responsabilité',
    body: (
      <>
        <p>
          Dans la mesure permise par la loi applicable, notre responsabilité totale au titre du
          service est limitée au montant que vous nous avez effectivement versé au cours des
          douze mois précédant le fait générateur.
        </p>
        <p>
          Nous ne saurions être tenus responsables des pertes indirectes, notamment d’une
          opportunité d’emploi non obtenue, d’une candidature écartée ou d’un manque à gagner.
        </p>
        <p>
          Rien dans cette section n’exclut notre responsabilité en cas de dol, de faute lourde,
          d’atteinte à l’intégrité physique, ni dans les autres cas où la loi interdit une telle
          exclusion.
        </p>
      </>
    ),
  },
  {
    id: 'indemnity',
    title: 'Votre responsabilité envers nous',
    body: (
      <p>
        Si un tiers engage une action contre nous en raison d’un contenu que vous avez saisi ou
        publié via un lien de partage, ou d’un usage du service contraire aux présentes
        conditions, vous nous garantissez contre les conséquences raisonnables de cette action.
      </p>
    ),
  },
  {
    id: 'law',
    title: 'Droit applicable et litiges',
    body: (
      <>
        <p>
          Les présentes conditions sont régies par le droit du Royaume du Maroc, où l’exploitant
          du service est établi, et les tribunaux de {site.contactAddress.locality} sont
          compétents.
        </p>
        <p>
          Cette clause ne vous prive pas des protections impératives du droit de la
          consommation de votre pays de résidence : si vous êtes consommateur dans l’Union
          européenne, vous conservez le droit de saisir les juridictions de votre domicile.
        </p>
        <p>
          Avant toute procédure, écrivez-nous à{' '}
          <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>. La très grande
          majorité des différends se règle par un message.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Modifications des présentes conditions',
    body: (
      <p>
        Nous pouvons modifier ces conditions lorsque le service évolue. La date de dernière mise
        à jour figure en haut de la page. Une modification substantielle vous sera signalée par
        e-mail ou dans le produit avant son entrée en vigueur ; poursuivre l’utilisation du
        service après cette date vaut acceptation.
      </p>
    ),
  },
];

export default function FrenchTermsPage() {
  return (
    <LegalDocument
      locale="fr"
      title="Conditions générales"
      intro={`Ce que ${site.name} fournit, ce que vous acceptez en l’utilisant, et ce qui se passe lorsque quelque chose ne fonctionne pas.`}
      summary={[
        <>Le contenu de vos CV vous appartient. Nous n’en revendiquons aucun droit.</>,
        <>
          Les modèles s’utilisent pour vos propres documents, y compris professionnels — mais
          ne se redistribuent pas en tant que modèles.
        </>,
        <>
          Les paiements passent par Paddle, vendeur officiel, qui gère la TVA. Nous ne voyons
          jamais votre carte.
        </>,
        <>
          Quatorze jours pour être remboursé, et vos droits légaux de consommateur s’ajoutent à
          cela.
        </>,
        <>
          Nous ne garantissons pas qu’un logiciel de recrutement donné analysera correctement
          votre CV. Personne ne le peut honnêtement.
        </>,
      ]}
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Politique de confidentialité', href: '/fr/confidentialite' },
        { label: 'Politique relative aux cookies', href: '/fr/cookies' },
        { label: 'Politique de remboursement', href: '/fr/remboursement' },
      ]}
    />
  );
}
