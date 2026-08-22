import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalDocument, type LegalSection } from '@/components/marketing/LegalDocument';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Politique de confidentialité',
  description: `Comment ${site.name} collecte, conserve et supprime vos données de compte et le contenu de vos CV, quels sous-traitants interviennent, et comment exercer vos droits.`,
  path: '/fr/confidentialite',
  locale: 'fr',
});

/**
 * The French privacy policy.
 *
 * The section ids are identical to the English page's on purpose. They are anchor targets,
 * so `/privacy#your-rights` and `/fr/confidentialite#your-rights` land on the same clause —
 * which matters when support answers a question with a deep link and does not know which
 * language the person is reading. Translating the ids would break every such link across
 * the language boundary for no benefit, since nobody reads a fragment.
 *
 * The RGPD vocabulary is the one that matters here: `responsable de traitement`,
 * `sous-traitant`, `base légale`, `intérêt légitime` are the terms used in the regulation's
 * French text, and a French reader checking their rights is looking for those words.
 */
const SECTIONS: LegalSection[] = [
  {
    id: 'scope',
    title: 'Qui nous sommes et ce que ce document couvre',
    body: (
      <>
        <p>
          Cette politique explique ce qu’il advient de vos données personnelles lorsque vous
          utilisez {site.name} à l’adresse {site.domain} (« le service »). Elle couvre le site
          public, l’éditeur de CV, l’export PDF et l’espace de compte. Elle ne couvre pas les
          autres sites que vous atteindriez en suivant un lien depuis celui-ci.
        </p>
        <p>
          Au sens du RGPD, l’exploitant de {site.domain} est le responsable de traitement des
          données décrites ci-dessous. Les questions, demandes et réclamations se font toutes
          à <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
        </p>
        <p>
          Une remarque qui a son importance : un CV est un document exceptionnellement
          révélateur. Il contient généralement votre nom complet, vos coordonnées, votre
          parcours professionnel, votre formation, et parfois votre photographie ou votre
          nationalité. Nous traitons le contenu de vos documents comme l’élément le plus
          sensible du service, et les sections ci-dessous disent précisément qui peut y
          accéder.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'Ce que nous collectons',
    body: (
      <>
        <h3>Données de compte</h3>
        <p>
          Votre adresse e-mail, un nom d’affichage si vous en fournissez un, et la méthode
          d’authentification utilisée. Si vous vous connectez avec Google, nous recevons de
          Google votre adresse e-mail, votre nom et l’URL de votre photo de profil.{' '}
          <strong>Nous ne recevons ni ne conservons jamais votre mot de passe</strong> :
          l’authentification est assurée par Firebase Authentication, et les mots de passe
          n’atteignent jamais le code de notre application.
        </p>
        <h3>Contenu des CV</h3>
        <p>
          Tout ce que vous saisissez dans l’éditeur : coordonnées, parcours professionnel,
          formation, compétences, langues, projets et rubriques sur mesure, ainsi que les
          réglages de mise en forme attachés à chaque document. Ces éléments sont conservés
          pour que vous puissiez les retrouver, et pour aucune autre finalité.
        </p>
        <h3>Données de paiement</h3>
        <p>
          Si vous achetez une offre, nous conservons l’identifiant de transaction Paddle,
          l’offre achetée, le montant, la devise, le statut et l’horodatage.{' '}
          <strong>Nous ne voyons jamais votre numéro de carte.</strong> La fenêtre de paiement
          s’ouvre par-dessus notre page, mais le formulaire qu’elle contient est une iframe
          servie par Paddle : les coordonnées bancaires y sont saisies et traitées
          intégralement par Paddle.
        </p>
        <h3>Données techniques et d’usage</h3>
        <p>
          Les enregistrements côté serveur nécessaires au fonctionnement et à la sécurité d’un
          service web : le nombre de CV sur votre compte, votre compteur de téléchargements du
          mois en cours, des horodatages, et — pour la limitation de débit et la prévention
          des abus — une donnée éphémère dérivée des en-têtes de requête. Les messages envoyés
          via le formulaire de contact sont conservés avec l’adresse que vous y indiquez.
        </p>
      </>
    ),
  },
  {
    id: 'why',
    title: 'Pourquoi nous les traitons, et sur quelle base légale',
    body: (
      <>
        <p>
          Chaque traitement décrit ici repose sur l’une des bases légales prévues à
          l’article 6 du RGPD :
        </p>
        <ul>
          <li>
            <strong>Exécution du contrat</strong> — créer et tenir votre compte, enregistrer
            vos CV, produire vos PDF, appliquer les limites de votre offre et traiter votre
            paiement. Sans ces traitements, le service ne peut pas être fourni.
          </li>
          <li>
            <strong>Intérêt légitime</strong> — sécuriser le service, prévenir les abus et la
            fraude, et conserver des journaux techniques le temps nécessaire au diagnostic
            d’un incident. L’intérêt poursuivi est le fonctionnement fiable du service ;
            l’atteinte à votre vie privée est minimale parce que ces données sont techniques
            et de courte durée.
          </li>
          <li>
            <strong>Obligation légale</strong> — conserver les pièces comptables relatives aux
            paiements pendant la durée exigée par la réglementation applicable.
          </li>
          <li>
            <strong>Consentement</strong> — les e-mails de produit, auxquels vous vous inscrivez
            volontairement et dont vous vous désinscrivez d’un clic, et les cookies de mesure
            d’audience s’ils sont activés sur ce déploiement.
          </li>
        </ul>
        <p>
          Nous n’utilisons pas le contenu de vos CV pour de la publicité, nous ne le vendons
          pas, et nous ne le proposons à aucun recruteur. Il n’existe pas de base de candidats.
        </p>
      </>
    ),
  },
  {
    id: 'processors',
    title: 'Qui d’autre intervient',
    body: (
      <>
        <p>
          Nous faisons appel à un petit nombre de sous-traitants, chacun pour une fonction
          précise :
        </p>
        <ul>
          <li>
            <strong>Google Firebase</strong> (authentification, base de données Firestore,
            stockage de fichiers) — héberge votre compte, vos CV et vos photos de profil.
          </li>
          <li>
            <strong>Paddle</strong> — vendeur officiel pour les paiements. Paddle collecte vos
            coordonnées bancaires, calcule et déclare la TVA applicable, et nous transmet un
            identifiant de transaction et un statut. Paddle est responsable de traitement pour
            ses propres besoins de facturation.
          </li>
          <li>
            <strong>Vercel</strong> — hébergement de l’application et du réseau de diffusion.
          </li>
          <li>
            <strong>Google Analytics</strong> — uniquement si une clé de mesure est configurée
            sur ce déploiement. Voir la{' '}
            <Link href="/fr/cookies">politique relative aux cookies</Link>.
          </li>
        </ul>
        <p>
          Chacun de ces prestataires est lié par un contrat de sous-traitance et ne peut
          traiter les données que pour les finalités que nous définissons. Nous ne
          transmettons vos données à personne d’autre, sauf obligation légale à laquelle nous
          serions tenus de nous conformer.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies',
    body: (
      <>
        <p>
          Le service pose un cookie de session strictement nécessaire, sans lequel vous ne
          pouvez pas rester connecté, ainsi qu’un cookie de préférence de langue. Les cookies
          de mesure d’audience ne sont posés que si l’analytique est configurée, et ils sont
          facultatifs.
        </p>
        <p>
          Le détail complet — nom, finalité, durée de vie et moyen de les désactiver — figure
          dans la <Link href="/fr/cookies">politique relative aux cookies</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'Combien de temps nous conservons les données',
    body: (
      <>
        <ul>
          <li>
            <strong>Compte et CV</strong> — tant que le compte existe. Nous ne supprimons pas
            les documents d’un compte inactif sans vous prévenir au préalable.
          </li>
          <li>
            <strong>Historique de paiement</strong> — pendant la durée de conservation
            comptable exigée par la réglementation applicable, même après la suppression du
            compte, car il s’agit d’une obligation légale et non d’un choix.
          </li>
          <li>
            <strong>Messages de contact</strong> — vingt-quatre mois, puis suppression. Assez
            longtemps pour retrouver le contexte d’un échange antérieur, pas assez pour
            constituer une archive.
          </li>
          <li>
            <strong>Journaux techniques et données de limitation de débit</strong> — quelques
            jours au plus.
          </li>
        </ul>
        <p>
          Lorsque vous supprimez un CV, il est retiré de la base ; il peut subsister dans les
          sauvegardes de notre hébergeur pendant une courte période avant d’en disparaître par
          rotation.
        </p>
      </>
    ),
  },
  {
    id: 'transfers',
    title: 'Où vos données sont traitées',
    body: (
      <>
        <p>
          Nos sous-traitants opèrent des infrastructures situées notamment aux États-Unis. Les
          transferts hors de l’Espace économique européen s’appuient sur les mécanismes prévus
          au chapitre V du RGPD : le cadre de protection des données UE–États-Unis lorsque le
          prestataire y est certifié, et à défaut les clauses contractuelles types de la
          Commission européenne.
        </p>
        <p>
          Nous ne pouvons pas garantir qu’aucune autorité étrangère n’adressera jamais de
          demande à l’un de ces prestataires. C’est une limite réelle du recours à une
          infrastructure mondiale, et il nous paraît plus honnête de l’écrire que de la passer
          sous silence.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'Sécurité',
    body: (
      <>
        <p>
          Les échanges se font exclusivement en HTTPS. Les mots de passe sont gérés par
          Firebase Authentication et n’atteignent jamais notre code. L’accès à vos documents
          est contraint côté base de données par des règles de sécurité Firestore qui vérifient
          l’identité du demandeur, en plus des contrôles applicatifs — un défaut dans notre
          code ne suffit donc pas à exposer le CV d’un autre utilisateur.
        </p>
        <p>
          Un lien de partage public, quand vous en créez un, pointe vers une adresse aléatoire
          non devinable et non indexable par les moteurs. Il reste néanmoins accessible à
          quiconque le détient : ne le diffusez pas plus largement que nécessaire, et coupez-le
          quand il n’a plus lieu d’être.
        </p>
        <p>
          Aucun service n’est à l’abri d’une compromission. En cas de violation de données
          susceptible d’engendrer un risque pour vos droits et libertés, nous vous en
          informerons et notifierons l’autorité de contrôle compétente dans les délais prévus
          par le RGPD.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: 'Vos droits',
    body: (
      <>
        <p>Le RGPD vous ouvre les droits suivants, que vous pouvez exercer à tout moment :</p>
        <ul>
          <li>
            <strong>Accès</strong> — obtenir une copie des données que nous détenons sur vous.
            L’export JSON disponible dans les réglages y répond immédiatement, sans nous
            écrire.
          </li>
          <li>
            <strong>Rectification</strong> — corriger une donnée inexacte. Le contenu de vos CV
            est modifiable directement dans l’éditeur.
          </li>
          <li>
            <strong>Effacement</strong> — obtenir la suppression de votre compte et de son
            contenu, sous réserve des pièces comptables que la loi nous impose de conserver.
          </li>
          <li>
            <strong>Limitation</strong> et <strong>opposition</strong> — restreindre ou
            contester un traitement fondé sur notre intérêt légitime.
          </li>
          <li>
            <strong>Portabilité</strong> — recevoir vos données dans un format structuré et
            lisible par machine. C’est exactement ce que produit l’export JSON.
          </li>
          <li>
            <strong>Retrait du consentement</strong> — pour les e-mails de produit et les
            cookies facultatifs, sans que cela affecte la licéité du traitement antérieur.
          </li>
        </ul>
        <p>
          Écrivez à <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>. Nous
          répondons sous un mois, comme le prévoit le règlement, et en pratique bien plus vite.
          Si notre réponse ne vous satisfait pas, vous pouvez saisir l’autorité de contrôle de
          votre pays de résidence — en France, la CNIL.
        </p>
      </>
    ),
  },
  {
    id: 'export-delete',
    title: 'Exporter et supprimer vos données',
    body: (
      <>
        <p>
          <strong>Exporter.</strong> Depuis les réglages de votre compte, un bouton télécharge
          l’intégralité de vos CV en JSON — coordonnées, rubriques et réglages de mise en forme
          pour chaque document. Le fichier est assemblé dans votre navigateur à partir de votre
          propre compte : rien n’est envoyé ailleurs pour le produire.
        </p>
        <p>
          <strong>Supprimer.</strong> La suppression de compte se demande depuis les réglages.
          Elle n’est pas encore automatisée : la demande ouvre un message pré-rempli à notre
          équipe, qui la traite à la main et vous confirme la suppression par e-mail. Nous
          préférons l’écrire ainsi plutôt que d’afficher un bouton qui laisserait croire à un
          effacement instantané.
        </p>
        <p>
          Exportez avant de supprimer : la suppression retire votre profil, tous vos CV et
          l’historique associé, et elle est irréversible.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: 'Mineurs',
    body: (
      <p>
        Le service n’est pas destiné aux enfants de moins de seize ans et nous ne collectons pas
        sciemment leurs données. Un CV rédigé par un lycéen en recherche de stage relève d’un
        usage légitime ; si vous êtes le représentant légal d’un mineur et estimez qu’un compte
        a été créé sans base valable, écrivez-nous et nous le supprimerons.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Modifications de cette politique',
    body: (
      <p>
        Nous mettons ce document à jour lorsque le service change. La date de dernière mise à
        jour figure en haut de la page. Une modification substantielle — une nouvelle finalité
        de traitement, un nouveau sous-traitant ayant accès au contenu de vos CV — vous sera
        signalée par e-mail ou dans le produit avant son entrée en vigueur, et non annoncée
        rétroactivement.
      </p>
    ),
  },
];

export default function FrenchPrivacyPage() {
  return (
    <LegalDocument
      locale="fr"
      title="Politique de confidentialité"
      intro={`Ce que ${site.name} collecte, pourquoi, avec qui ces données sont partagées, combien de temps elles sont conservées, et comment exercer vos droits.`}
      summary={[
        <>
          Nous ne vendons pas vos données et ne proposons aucun CV à des recruteurs. Il
          n’existe pas de base de candidats.
        </>,
        <>
          Vos CV ne sont visibles par personne d’autre que vous tant que vous n’activez pas
          vous-même un lien de partage.
        </>,
        <>
          Nous ne voyons jamais votre mot de passe ni votre numéro de carte : Firebase et
          Paddle s’en chargent.
        </>,
        <>
          Vous exportez l’intégralité de vos CV en JSON quand vous voulez, depuis les réglages.
        </>,
        <>
          La suppression du compte retire tout, à l’exception des pièces comptables que la loi
          nous impose de conserver.
        </>,
      ]}
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Conditions générales', href: '/fr/conditions-generales' },
        { label: 'Politique relative aux cookies', href: '/fr/cookies' },
        { label: 'Politique de remboursement', href: '/fr/remboursement' },
      ]}
    />
  );
}
