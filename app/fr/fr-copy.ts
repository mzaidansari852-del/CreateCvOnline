import type { TemplateCategory } from '@/types/cv';

/**
 * The French site's copy.
 *
 * Written in French rather than translated from the English, and the difference is not
 * stylistic. A French CV is a different document: photographs are normal where the UK and
 * US advise against them, the page is expected to fit on one side, `Prétentions salariales`
 * is a heading a French recruiter may look for, and the search term is `modèle de CV` —
 * `template` reads as an English word borrowed into a French sentence. Running the English
 * copy through a translator produces a page that is grammatically French and obviously not
 * written for anyone in France.
 *
 * The market case, from the audit: `modèle de CV gratuit` returns cvcrea.fr, aidecv.fr,
 * modeles-de-cv.com, cvexemple.com and cv-boost.app. No Canva, no Zety, no Resume.io —
 * competitors this site's size. That is the whole reason this exists.
 */

export const FR = {
  /** Nav and chrome. */
  chrome: {
    skipToContent: 'Aller au contenu principal',
    switchToEnglish: 'English',
    switchToFrench: 'Français',
    languageLabel: 'Langue',
  },

  home: {
    metaTitle: 'Créer un CV en ligne gratuit',
    metaDescription:
      'Créez un CV professionnel en ligne en quelques minutes. Modèles gratuits compatibles avec les logiciels de recrutement, éditeur en direct et téléchargement PDF immédiat.',
    eyebrow: 'Sans carte bancaire',
    heading: 'Créez votre CV en ligne, gratuitement',
    /** Fills the shared hero, so the French page is the same design and not a plainer one. */
    hero: {
      headingBefore: 'Créez votre ',
      headingHighlight: 'CV professionnel',
      headingAfter: ' en ligne',
      badge: 'modèles notés 5/5 pour les logiciels de tri',
      primaryCta: 'Créer mon CV — gratuit',
      secondaryCta: 'Voir les modèles',
    },
    lede: 'Choisissez un modèle, remplissez des champs structurés et regardez une vraie page A4 se construire à côté de vous. Quand le résultat vous convient, exportez un PDF dont le texte reste sélectionnable — par un recruteur comme par un logiciel de tri.',
    ctaPrimary: 'Créer mon CV',
    ctaSecondary: 'Voir les modèles',
    trust: ['Modèles gratuits', 'Compatible ATS', 'PDF immédiat', 'Sans carte bancaire'],

    stepsTitle: 'Trois étapes, pas davantage',
    steps: [
      {
        title: 'Choisissez un modèle',
        body: 'Chaque modèle indique sa note de lisibilité pour les logiciels de recrutement. Vous pouvez en changer à tout moment : votre contenu ne bouge pas.',
      },
      {
        title: 'Remplissez vos rubriques',
        body: 'Expérience, formation, compétences, langues. Les rubriques se réorganisent, se renomment et se masquent selon ce que vous voulez mettre en avant.',
      },
      {
        title: 'Téléchargez le PDF',
        body: 'Une page A4 ou US Letter, avec un texte réellement sélectionnable. Pas une image de CV déguisée en document.',
      },
    ],

    atsTitle: 'Pourquoi la compatibilité ATS compte',
    atsBody:
      'La plupart des grandes entreprises font passer les candidatures par un logiciel de suivi des candidatures avant qu’un humain ne les lise. Ces logiciels extraient le texte de votre PDF : un CV sur deux colonnes, avec des icônes à la place des intitulés ou du texte dans une image, en ressort mélangé ou amputé. Chaque modèle porte ici une note sur cinq, fondée sur les propriétés de mise en page qui affectent réellement cette extraction — le nombre de colonnes, les graphiques, la structure des titres.',
    atsCaveat:
      'Cette note est notre propre évaluation, pas une certification : aucun éditeur ne peut tester tous les logiciels du marché.',

    differencesTitle: 'Ce qu’un CV français attend',
    differences: [
      {
        title: 'La photo reste courante',
        body: 'Contrairement au Royaume-Uni ou aux États-Unis, la photo d’identité reste fréquente sur un CV français, sans être obligatoire. Tous les modèles avec photo peuvent s’en passer d’un clic.',
      },
      {
        title: 'Une page, sauf exception',
        body: 'Une page pour moins de dix ans d’expérience, deux au-delà. Au-delà de deux pages, vous n’écrivez plus un CV mais un dossier — ce qui se justifie dans la recherche et la fonction publique, rarement ailleurs.',
      },
      {
        title: 'Les langues se notent en CECRL',
        body: 'A1 à C2 plutôt que « bon niveau ». Les niveaux que vous saisissez alimentent directement le tableau du modèle Europass.',
      },
      {
        title: 'Le format Europass existe pour ça',
        body: 'Certains organismes publics et universités le demandent nommément. Il est inclus, avec sa grille d’autoévaluation.',
      },
    ],

    faqTitle: 'Questions fréquentes',
    faq: [
      {
        question: 'Le service est-il vraiment gratuit ?',
        answer:
          'Oui pour créer un CV, l’éditer et le télécharger en PDF avec les modèles gratuits. Un compte est nécessaire pour enregistrer votre document et le retrouver ensuite. L’offre payante débloque les modèles Pro et les réglages avancés de mise en forme.',
      },
      {
        question: 'Faut-il mettre une photo sur un CV français ?',
        answer:
          'C’est courant et accepté, mais ce n’est ni obligatoire ni toujours souhaitable : certaines entreprises retirent volontairement la photo pour limiter les biais à la présélection. Si vous en mettez une, une photo nette, cadrée sur le visage, sur fond neutre. Tous les modèles fonctionnent avec et sans.',
      },
      {
        question: 'Quelle est la différence entre un CV et un résumé américain ?',
        answer:
          'Le « resume » américain fait une page, ne comporte ni photo ni date de naissance ni situation familiale, et se concentre sur les résultats chiffrés. Le CV français accepte une photo, mentionne parfois le permis de conduire et reste plus factuel. Vous pouvez basculer entre A4 et US Letter dans l’éditeur.',
      },
      {
        question: 'Mon CV passera-t-il les logiciels de tri ?',
        answer:
          'Les modèles notés 5 sur 5 sont conçus pour cela : une seule colonne, pas de graphique, pas d’icône à la place d’un intitulé, un texte extractible. Aucun éditeur ne peut garantir le comportement de tous les logiciels du marché, mais ce sont précisément ces propriétés de mise en page qui posent problème.',
      },
      {
        question: 'Puis-je changer de modèle après avoir tout saisi ?',
        answer:
          'Oui, et c’est sans conséquence : le contenu et vos réglages sont conservés. Seule la typographie du nouveau modèle s’applique, et uniquement si vous n’aviez pas choisi la vôtre.',
      },
    ],
  },

  gallery: {
    metaTitle: 'Modèles de CV gratuits à télécharger',
    metaDescription:
      'Modèles de CV professionnels à remplir en ligne et à télécharger en PDF. Modernes, classiques, créatifs et compatibles ATS. Gratuits, sans carte bancaire.',
    heading: 'Modèles de CV',
    lede: 'Des modèles à remplir en ligne, pas des fichiers Word à réparer. Chaque modèle indique s’il est gratuit et comment il se comporte face à un logiciel de tri. Changez d’avis autant que vous voulez : votre contenu ne bouge pas.',
    ctaPrimary: 'Créer mon CV',
    freeBadge: 'gratuits',
    designsLabel: 'modèles',
    atsLabel: 'notés 5/5 pour les ATS',
    singleColumnLabel: 'sur une colonne',
    browseByCategory: 'Parcourir par style',
    allCategories: 'Toutes les catégories',
    whatMakesGood: 'Ce qui fait un bon modèle de CV',
    whatMakesGoodBody:
      'Un modèle utile est d’abord un modèle lisible : une hiérarchie claire, des marges qui laissent respirer le texte, et une mise en page qu’un logiciel de recrutement sait relire. Le reste — la couleur d’accentuation, la police, la présence d’une photo — relève de votre secteur et de votre goût, et se règle en quelques secondes dans l’éditeur.',
  },

  categories: {
    modern: {
      slug: 'moderne',
      label: 'Modernes',
      metaTitle: 'Modèles de CV modernes',
      metaDescription:
        'Modèles de CV modernes : mise en page aérée, une couleur d’accentuation, lecture immédiate. À remplir en ligne et à télécharger en PDF.',
      heading: 'Modèles de CV modernes',
      lede: 'Des mises en page contemporaines, beaucoup d’espace et une seule couleur d’accentuation. Le point de départ le plus sûr quand vous ne savez pas exactement ce que votre secteur attend.',
    },
    corporate: {
      slug: 'entreprise',
      label: 'Entreprise',
      metaTitle: 'Modèles de CV pour l’entreprise',
      metaDescription:
        'Modèles de CV sobres et structurés pour la finance, le conseil et le management. À remplir en ligne, téléchargement PDF immédiat.',
      heading: 'Modèles de CV pour l’entreprise',
      lede: 'Structurés et sobres, pour la finance, le conseil, le management — les environnements où un CV est jugé sur sa rigueur avant sa personnalité.',
    },
    creative: {
      slug: 'creatif',
      label: 'Créatifs',
      metaTitle: 'Modèles de CV créatifs',
      metaDescription:
        'Modèles de CV créatifs pour les métiers du design, de l’image et du contenu. Le document devient lui-même un échantillon de votre travail.',
      heading: 'Modèles de CV créatifs',
      lede: 'Pour le design, la direction artistique, la photographie et les métiers du contenu — là où le document est lui-même un échantillon de votre travail. Un modèle de cette famille est noté 5/5 pour les ATS, si vous candidatez via un portail.',
    },
    technology: {
      slug: 'informatique',
      label: 'Informatique',
      metaTitle: 'Modèles de CV informatique',
      metaDescription:
        'Modèles de CV pour les métiers techniques : place pour la stack, les projets et l’open source, sans transformer le CV en liste de mots-clés.',
      heading: 'Modèles de CV informatique',
      lede: 'Pensés pour les métiers techniques : de la place pour votre stack, vos projets et vos contributions open source, sans transformer le CV en liste de mots-clés.',
    },
    classic: {
      slug: 'classique',
      label: 'Classiques',
      metaTitle: 'Modèles de CV classiques',
      metaDescription:
        'Modèles de CV traditionnels pour la recherche, le droit et la fonction publique. Format Europass inclus, avec grille CECRL.',
      heading: 'Modèles de CV classiques',
      lede: 'Formats traditionnels, souvent en typographie à empattements, pour la recherche, le droit, la fonction publique et tout employeur qui attend encore un document conventionnel. C’est aussi ici que se trouve le modèle Europass.',
    },
    ats: {
      slug: 'ats',
      label: 'Compatibles ATS',
      metaTitle: 'Modèles de CV compatibles ATS',
      metaDescription:
        'Modèles de CV sur une seule colonne, sans graphique, conçus pour être relus correctement par les logiciels de suivi des candidatures.',
      heading: 'Modèles de CV compatibles ATS',
      lede: 'Une seule colonne, aucun graphique, aucune surprise : ces modèles sont conçus pour être relus correctement par les logiciels de suivi des candidatures. C’est le choix par défaut pour une candidature déposée sur un portail.',
    },
  } satisfies Record<
    TemplateCategory,
    {
      slug: string;
      label: string;
      metaTitle: string;
      metaDescription: string;
      heading: string;
      lede: string;
    }
  >,

  card: {
    free: 'Gratuit',
    pro: 'Pro',
    oneColumn: 'une colonne',
    twoColumns: 'deux colonnes',
    atsScore: 'ATS',
    withPhoto: 'avec photo',
  },

  related: {
    title: 'À voir aussi',
    allTemplates: 'Tous les modèles',
    allTemplatesDescription: 'La galerie complète, tous styles confondus.',
    englishSite: 'CV templates in English',
    englishSiteDescription: 'The same builder, with UK and US CV conventions.',
  },

  cta: {
    title: 'Prêt à créer votre CV ?',
    description:
      'Choisissez un modèle, saisissez votre parcours, changez d’avis autant que vous voulez. Changer de modèle ne touche jamais à votre contenu.',
    primary: 'Commencer gratuitement',
    secondary: 'Voir les tarifs',
  },
} as const;

/** English category id → French slug, and back. */
export const FR_CATEGORY_SLUG: Record<TemplateCategory, string> = {
  modern: FR.categories.modern.slug,
  corporate: FR.categories.corporate.slug,
  creative: FR.categories.creative.slug,
  technology: FR.categories.technology.slug,
  classic: FR.categories.classic.slug,
  ats: FR.categories.ats.slug,
};

export function categoryFromFrenchSlug(slug: string): TemplateCategory | undefined {
  return (Object.keys(FR_CATEGORY_SLUG) as TemplateCategory[]).find(
    (category) => FR_CATEGORY_SLUG[category] === slug,
  );
}
