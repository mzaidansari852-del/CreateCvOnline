import { FR } from './fr-copy';
import { fontLabel } from '@/lib/cv/format';
import type { TemplateDefinition } from '@/types/cv';

/**
 * French copy for a template's detail page, generated from its metadata.
 *
 * Not a translation of the English page. Each template's `description`, `tagline`,
 * `bestFor` and `features` are English prose written per template — sixty-one templates
 * times four fields is roughly six hundred sentences, and machine-translating them would
 * produce six hundred sentences nobody has read, on the pages meant to sell the product.
 *
 * So the French page is written from the *structured* facts instead: category, column
 * count, ATS score, photo, plan, and the typeface pairing. Those are the things a shopper
 * is actually comparing, they are true by construction, and the sentences below were
 * written once in French by someone who could read them.
 *
 * The trade-off is real and worth naming: the English page says something specific about
 * each design that this cannot. What it buys is sixty-one pages that are accurate and
 * readable rather than sixty-one that are neither.
 */

const ATS_NOTE: Record<number, string> = {
  5: 'Lisibilité maximale pour les logiciels de tri : une seule colonne, aucun graphique dans le flux du texte, des intitulés de rubrique en toutes lettres. C’est le choix à faire pour une candidature déposée sur un portail.',
  4: 'Bonne lisibilité pour les logiciels de tri. Quelques éléments graphiques restent présents, sans jamais porter d’information que le texte ne donne pas déjà.',
  3: 'Lisibilité correcte, avec des réserves : la mise en page comporte des éléments qu’un logiciel de tri peut mal interpréter. À privilégier pour une candidature envoyée directement à une personne.',
  2: 'Ce modèle est conçu pour l’œil humain avant le logiciel. À réserver aux candidatures spontanées, aux réseaux et aux métiers où la présentation fait partie du dossier.',
  1: 'Mise en page très graphique, peu adaptée à une lecture automatisée. À utiliser en complément d’un CV compatible ATS, pas à sa place.',
};

const COLUMN_NOTE: Record<1 | 2, string> = {
  1: 'Une seule colonne, de haut en bas : la structure qu’un logiciel de recrutement relit sans se tromper, et celle qui laisse le plus de place aux descriptions de poste.',
  2: 'Deux colonnes : une bande latérale pour les compétences, les langues et les coordonnées, la largeur restante pour le parcours. Le texte y est plus court par ligne, ce qui se lit vite à l’écran.',
};

export interface FrenchTemplateCopy {
  metaTitle: string;
  metaDescription: string;
  heading: string;
  lede: string;
  atsHeading: string;
  atsBody: string;
  layoutHeading: string;
  layoutBody: string;
  typeHeading: string;
  typeBody: string;
  factsHeading: string;
  facts: { label: string; value: string }[];
  faqHeading: string;
  faq: { question: string; answer: string }[];
}

export function frenchTemplateCopy(template: TemplateDefinition): FrenchTemplateCopy {
  const category = FR.categories[template.category];
  const styleWord = category.label.toLowerCase().replace(/s$/, '');
  const plan = template.premium ? 'Pro' : 'gratuit';
  const columns = template.columns === 1 ? 'une colonne' : 'deux colonnes';

  return {
    metaTitle: `Modèle de CV ${template.name}`,
    metaDescription: `Modèle de CV ${template.name} : ${columns}, style ${styleWord}, note ${template.atsScore}/5 pour les logiciels de tri. À remplir en ligne et à télécharger en PDF.`,
    heading: `Modèle de CV ${template.name}`,
    lede: `Un modèle ${styleWord} sur ${columns}, ${plan}, noté ${template.atsScore} sur 5 pour la lecture automatisée. Remplissez-le en ligne et exportez un PDF dont le texte reste sélectionnable.`,

    atsHeading: 'Face aux logiciels de tri',
    atsBody: ATS_NOTE[template.atsScore] ?? ATS_NOTE[3]!,

    layoutHeading: 'La mise en page',
    layoutBody: COLUMN_NOTE[template.columns],

    typeHeading: 'La typographie',
    typeBody: `Titres en ${fontLabel(template.fonts.heading)}, texte courant en ${fontLabel(
      template.fonts.body,
    )}. C’est le réglage d’origine du modèle : vous pouvez le changer dans l’éditeur, et tant que vous n’y touchez pas, chaque modèle garde la sienne.`,

    factsHeading: 'En bref',
    facts: [
      { label: 'Style', value: category.label },
      { label: 'Colonnes', value: template.columns === 1 ? 'Une' : 'Deux' },
      { label: 'Compatibilité ATS', value: `${template.atsScore}/5` },
      { label: 'Photo', value: template.hasPhoto ? 'Prévue, désactivable' : 'Sans photo' },
      { label: 'Accès', value: template.premium ? 'Pro' : 'Gratuit' },
      { label: 'Format', value: 'A4 ou US Letter' },
    ],

    faqHeading: 'Questions sur ce modèle',
    faq: [
      {
        question: `Le modèle ${template.name} est-il gratuit ?`,
        answer: template.premium
          ? `Ce modèle fait partie de l’offre Pro. La création du CV, l’éditeur et l’export PDF sont gratuits avec les modèles gratuits ; l’abonnement débloque celui-ci et les autres modèles Pro.`
          : `Oui. Vous pouvez le remplir et télécharger le PDF sans payer. Un compte est nécessaire pour enregistrer votre document et le retrouver ensuite.`,
      },
      {
        question: 'Puis-je changer de modèle après avoir saisi mon contenu ?',
        answer:
          'Oui, et sans rien perdre : le contenu et vos réglages sont conservés. Seule la typographie du nouveau modèle s’applique, et uniquement si vous n’aviez pas choisi la vôtre.',
      },
      {
        question: template.hasPhoto
          ? 'Puis-je retirer la photo ?'
          : 'Puis-je ajouter une photo à ce modèle ?',
        answer: template.hasPhoto
          ? 'Oui, en un clic dans l’éditeur. La mise en page se referme proprement sur l’espace libéré.'
          : 'Ce modèle est conçu sans photo. Si vous en voulez une, choisissez un modèle qui en prévoit l’emplacement plutôt que d’en ajouter une là où la mise en page ne l’attend pas.',
      },
      {
        question: 'Le PDF est-il lisible par un logiciel de recrutement ?',
        answer: `${ATS_NOTE[template.atsScore] ?? ATS_NOTE[3]!} Le texte du PDF est toujours du vrai texte, jamais une image.`,
      },
    ],
  };
}
