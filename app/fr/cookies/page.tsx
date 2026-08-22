import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalDocument, type LegalSection } from '@/components/marketing/LegalDocument';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Politique relative aux cookies',
  description: `Les cookies et le stockage local utilisés par ${site.name} : lesquels, pourquoi, combien de temps, et comment les désactiver.`,
  path: '/fr/cookies',
  locale: 'fr',
});

/** Rendered inside `Prose`, so the plain table below picks up its own styling. */
function CookieTable({
  caption,
  rows,
}: {
  caption: string;
  rows: { name: string; purpose: string; type: string; duration: string }[];
}) {
  return (
    /*
     * `overflow-x-auto` on the wrapper, not on the page.
     *
     * Four columns of prose cannot fit a 360px screen, and the alternative to a scrolling
     * table is a horizontally scrolling *document*, which breaks every other paragraph on
     * the page. The wrapper confines the scroll to the table itself.
     */
    <div className="my-6 overflow-x-auto rounded-xl border border-ink-200">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-ink-50">
          <tr>
            {['Nom', 'Finalité', 'Type', 'Durée'].map((heading) => (
              <th
                key={heading}
                scope="col"
                className="border-b border-ink-200 px-4 py-2.5 font-semibold text-ink-950"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-ink-100 last:border-0">
              <th scope="row" className="px-4 py-2.5 align-top font-mono text-[13px] text-ink-900">
                {row.name}
              </th>
              <td className="px-4 py-2.5 align-top text-ink-700">{row.purpose}</td>
              <td className="px-4 py-2.5 align-top text-ink-700">{row.type}</td>
              <td className="px-4 py-2.5 align-top text-ink-700">{row.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SECTIONS: LegalSection[] = [
  {
    id: 'summary',
    title: 'Ce que couvre cette page',
    body: (
      <>
        <p>
          Un inventaire de tout ce que {site.domain} peut déposer dans votre navigateur :
          cookies, mais aussi stockage local, qui n’est pas un cookie et que la plupart des
          politiques passent sous silence.
        </p>
        <p>
          Le principe est simple : un cookie strictement nécessaire à la connexion, un cookie
          de préférence de langue, et rien d’autre tant que vous n’ouvrez pas la fenêtre de
          paiement. La mesure d’audience est facultative et n’est active que si l’exploitant du
          site l’a configurée.
        </p>
        <p>
          Nous n’utilisons aucun cookie publicitaire, aucun pixel de réseau social et aucun
          traceur inter-sites. Il n’y a donc pas de bandeau de consentement à cliquer sur ce
          site : il n’y aurait rien à y refuser.
        </p>
      </>
    ),
  },
  {
    id: 'essential',
    title: 'Le cookie de session',
    body: (
      <>
        <p>
          <code>__session</code> est le seul cookie indispensable. Il contient un jeton de
          session Firebase et permet au serveur de savoir que la requête vient bien de vous.
          Sans lui, vous ne pouvez pas rester connecté : chaque page vous redemanderait vos
          identifiants.
        </p>
        <p>
          Il est marqué <code>httpOnly</code>, ce qui signifie qu’aucun script de la page ne
          peut le lire, et il est supprimé à la déconnexion. Il ne sert à aucune mesure et à
          aucun profilage.
        </p>
        <p>
          Étant strictement nécessaire à un service que vous avez explicitement demandé, il
          relève de l’exemption de consentement prévue par la directive « vie privée et
          communications électroniques » et rappelée par la CNIL.
        </p>
      </>
    ),
  },
  {
    id: 'analytics',
    title: 'Cookies de mesure d’audience (facultatifs)',
    body: (
      <>
        <p>
          Si l’exploitant de ce déploiement a configuré un identifiant de mesure Google
          Analytics, les cookies <code>_ga</code> et <code>_ga_&lt;id&gt;</code> sont déposés.
          Ils servent à compter les visites et à distinguer un navigateur d’un autre.
        </p>
        <p>
          Ils ne sont pas nécessaires au fonctionnement du service. Vous pouvez les refuser
          via les réglages de votre navigateur, une extension de blocage, ou le signal « Do Not
          Track » lorsque votre navigateur l’envoie.
        </p>
        <p>
          Le contenu de vos CV n’est jamais transmis à un outil de mesure d’audience. Ce qui
          est mesuré, ce sont des pages consultées, pas des documents.
        </p>
      </>
    ),
  },
  {
    id: 'paddle',
    title: 'Cookies Paddle pendant le paiement',
    body: (
      <>
        <p>
          Rien de Paddle ne s’exécute tant que vous n’ouvrez pas la fenêtre de paiement. À ce
          moment-là, le script de Paddle est chargé sur notre page et son formulaire de carte
          s’affiche dans une iframe servie par le domaine de Paddle.
        </p>
        <p>
          Paddle dépose alors ses propres cookies, pour le suivi de la transaction et ses
          contrôles antifraude. Nous ne pouvons ni les lire ni les contrôler ; leur durée et
          leur finalité relèvent de la politique de Paddle, qui agit ici comme responsable de
          traitement pour ses besoins de facturation.
        </p>
      </>
    ),
  },
  {
    id: 'local-storage',
    title: 'Le stockage local, qui n’est pas un cookie',
    body: (
      <>
        <p>
          Deux choses sont conservées dans le <code>localStorage</code> de votre navigateur
          plutôt que dans un cookie. La différence est importante : le contenu du{' '}
          <code>localStorage</code> n’est jamais envoyé au serveur, il reste sur votre machine.
        </p>
        <ul>
          <li>
            Vos réglages par défaut de création de CV — format de papier et modèle
            présélectionné.
          </li>
          <li>
            Une copie de secours du CV en cours d’édition, écrite lorsqu’un enregistrement
            échoue, afin que vous ne perdiez pas votre travail si la connexion se coupe. Elle
            vous est proposée à la réouverture, puis effacée.
          </li>
        </ul>
        <p>
          Vider les données de site dans votre navigateur supprime les deux. Votre CV
          enregistré côté serveur n’en est pas affecté.
        </p>
      </>
    ),
  },
  {
    id: 'table',
    title: 'La liste complète',
    body: (
      <>
        <p>
          Tout ce que le site peut stocker dans votre navigateur, en un tableau. {site.domain}{' '}
          ne dépose rien d’autre.
        </p>
        <CookieTable
          caption="Chaque cookie et élément de stockage utilisé par ce site, avec sa finalité, son type et sa durée"
          rows={[
            {
              name: '__session',
              purpose:
                'Vous maintient connecté. Contient un jeton de session Firebase, vérifié à chaque rendu serveur et à chaque appel d’API.',
              type: 'Cookie interne · strictement nécessaire · httpOnly',
              duration:
                'SESSION_COOKIE_DAYS, 5 jours par défaut (14 jours au maximum). Supprimé à la déconnexion.',
            },
            {
              name: 'cvo_locale',
              purpose:
                'Retient la langue dans laquelle vous lisez le site, pour qu’une inscription depuis une page française ne vous fasse pas atterrir sur un tableau de bord en anglais. Écrit uniquement lors d’une navigation vers une page traduite, et seulement si la valeur change. Ne contient qu’un code de langue.',
              type: 'Cookie interne · fonctionnel · lisible par les scripts de la page',
              duration: '1 an',
            },
            {
              name: '_ga',
              purpose:
                'Google Analytics : distingue un navigateur d’un autre. Présent uniquement si l’exploitant a configuré un identifiant de mesure.',
              type: 'Cookie interne · mesure d’audience · facultatif',
              duration: 'Valeur par défaut de Google, environ 2 ans',
            },
            {
              name: '_ga_<identifiant>',
              purpose:
                'Google Analytics : conserve l’état de la session de mesure. Présent uniquement si l’exploitant a configuré un identifiant de mesure.',
              type: 'Cookie interne · mesure d’audience · facultatif',
              duration: 'Valeur par défaut de Google, environ 2 ans',
            },
            {
              name: 'Cookies Paddle',
              purpose:
                'Déposés par Paddle dès l’ouverture de la fenêtre de paiement : suivi de la transaction, contrôles antifraude. Le script de Paddle s’exécute sur nos pages et son formulaire est une iframe sur son domaine ; ces cookies peuvent donc apparaître sous l’un ou l’autre. Nous ne pouvons ni les lire ni les contrôler.',
              type: 'Cookies tiers, déposés par Paddle · uniquement après ouverture du paiement',
              duration: 'Déterminée par Paddle',
            },
            {
              name: 'createcvonline:preferences',
              purpose:
                'Ce n’est pas un cookie. Une entrée de localStorage contenant votre format de papier par défaut et votre modèle présélectionné. Jamais envoyée dans une requête réseau.',
              type: 'localStorage · interne · fonctionnel',
              duration: 'Jusqu’à effacement des données de site pour ce domaine',
            },
          ]}
        />
        <p>
          Une précision connexe, qui n’est pas un cookie : l’interface et les modèles de CV
          chargent leurs polices depuis Google Fonts, ce qui fait que votre navigateur contacte
          Google au chargement d’une page. Cette requête ne dépose aucun cookie sur notre
          domaine, mais c’est une connexion vers un tiers et elle figure à ce titre dans la{' '}
          <Link href="/fr/confidentialite">politique de confidentialité</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'managing',
    title: 'Comment les contrôler',
    body: (
      <>
        <p>
          Tous les navigateurs permettent de consulter, de bloquer et de supprimer les cookies
          d’un site donné, généralement depuis l’icône affichée à gauche de l’adresse, ou dans
          les réglages de confidentialité.
        </p>
        <p>
          Une mise en garde utile : bloquer <code>__session</code> vous déconnecte et empêche
          toute reconnexion, puisque c’est ce cookie qui porte votre session. Bloquer les
          cookies de mesure d’audience n’a en revanche aucun effet sur le fonctionnement du
          service.
        </p>
        <p>
          Pour la mesure d’audience spécifiquement, Google propose un module complémentaire de
          désactivation, et la plupart des bloqueurs de contenu courants s’en chargent
          également.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Modifications de cette politique',
    body: (
      <p>
        Si nous ajoutons ou retirons quelque chose de la liste ci-dessus, ce document est mis à
        jour en même temps que le changement, et non après. La date de dernière mise à jour
        figure en haut de la page.
      </p>
    ),
  },
];

export default function FrenchCookiePolicyPage() {
  return (
    <LegalDocument
      locale="fr"
      title="Politique relative aux cookies"
      intro={`Tout ce que ${site.domain} peut déposer dans votre navigateur, pourquoi, et pendant combien de temps.`}
      summary={[
        <>
          Un cookie strictement nécessaire pour la connexion, un cookie de langue, et rien
          d’autre par défaut.
        </>,
        <>
          Aucun cookie publicitaire, aucun pixel de réseau social, aucun traceur inter-sites —
          d’où l’absence de bandeau de consentement.
        </>,
        <>
          Les cookies de Paddle n’apparaissent qu’à partir du moment où vous ouvrez la fenêtre
          de paiement.
        </>,
        <>
          Le contenu de vos CV n’est transmis à aucun outil de mesure d’audience.
        </>,
      ]}
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Politique de confidentialité', href: '/fr/confidentialite' },
        { label: 'Conditions générales', href: '/fr/conditions-generales' },
        { label: 'Politique de remboursement', href: '/fr/remboursement' },
      ]}
    />
  );
}
