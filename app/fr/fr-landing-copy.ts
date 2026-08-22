import type { Landing } from '@/lib/i18n/landing';

/**
 * The eight French commercial landing pages, as data.
 *
 * ## Why these eight
 *
 * They are the pages that carry buying intent. `créer un CV`, `faire un CV`,
 * `CV en ligne`, `CV gratuit` and `CV ATS` are queries typed by someone who intends to
 * produce a document today, not by someone reading about the labour market — and the audit
 * that started the French work found the same thing here as on `modèle de CV`: the results
 * are dominated by sites of roughly this one's size. The blog, the role examples and the
 * profession guides are deliberately *not* here. They are read-and-leave traffic, they are
 * the largest body of prose on the site, and translating them buys the least.
 *
 * ## Why each page says something different
 *
 * `créer un CV`, `faire un CV` and `CV en ligne` are close enough in meaning that the lazy
 * version of this file is three pages of the same paragraphs with the verb swapped. That is
 * doorway-page behaviour, Google names it as such, and the penalty falls on the domain
 * rather than the page. So each one is written to answer a different question: the builder
 * page is about the editor, the `faire un CV` page is about getting from a blank page to a
 * finished document, and `CV en ligne` is about what "online" actually buys you over Word.
 * If two of them ever collapse into the same page, the right fix is to delete one and
 * redirect it, not to reword it.
 */

/** The links every one of these pages offers back into the French subtree. */
const CORE_LINKS = [
  {
    label: 'Modèles de CV',
    href: '/fr/modeles-de-cv',
    description: 'La galerie complète, tous styles confondus.',
  },
  {
    label: 'Tarifs',
    href: '/fr/tarifs',
    description: 'Gratuit, Pro et accès à vie.',
  },
];

export const FR_LANDING: Record<string, Landing> = {
  'importer-un-cv': {
    path: '/fr/importer-un-cv',
    breadcrumb: 'Importer un CV',
    metaTitle: 'Importer un CV — reprenez un PDF ou un Word et modifiez-le',
    metaDescription:
      'Importez un CV existant et récupérez un document modifiable : postes, dates, puces, formation et compétences. La lecture se fait sur la mise en page, donc un CV en deux colonnes ne revient pas mélangé.',
    keywords: [
      'importer un cv',
      'convertir un cv pdf',
      'cv pdf modifiable',
      'changer le modèle de mon cv',
      'convertisseur de cv',
    ],
    heading: 'Vous avez déjà un CV ? Importez-le et continuez à l’éditer',
    lede: 'Un PDF ou un fichier Word entre ; postes, dates, puces, formation, compétences et langues en ressortent, dans un éditeur où vous pouvez changer de modèle sans retaper un mot. La lecture part de la mise en page plutôt que de l’ordre brut du texte — c’est pour cela qu’un CV en deux colonnes ne revient pas mélangé.',
    badges: ['PDF et Word', 'Gratuit sur toutes les formules', 'Le fichier n’est pas conservé'],
    steps: {
      title: 'Importer, vérifier, garder',
      items: [
        {
          title: 'Déposez le fichier',
          body: 'Un PDF ou un .docx, jusqu’à 8 Mo. Rien n’est encore enregistré : le fichier est lu puis jeté dans la même requête.',
        },
        {
          title: 'Lisez ce qui a été trouvé',
          body: 'Chaque rubrique lue est listée avec son contenu : chaque poste avec son employeur et ses dates, chaque diplôme avec son établissement. Pas un décompte — les entrées elles-mêmes, parce que « 3 postes trouvés » ne dit rien sur le fait que ce soient les bons.',
        },
        {
          title: 'Corrigez le bloc de contact',
          body: 'Nom, intitulé, e-mail et téléphone sont modifiables sur place. C’est ce qu’un recruteur lit en premier, et le nom est la déduction la plus fragile de tout le processus.',
        },
        {
          title: 'Gardez-le et continuez',
          body: 'Le CV devient un document ordinaire dans l’éditeur. Changez de modèle, réordonnez les rubriques, réécrivez une puce, exportez le PDF. Rien n’est verrouillé parce qu’il est arrivé par import.',
        },
      ],
    },
    howTo: true,
    features: {
      title: 'Pourquoi celui-ci ne mélange pas vos colonnes',
      description:
        'La plupart des importeurs extraient le texte et espèrent. Voici les raisons précises pour lesquelles celui-ci se comporte autrement — chacune vient d’un vrai CV qui l’avait mis en échec.',
      columns: 2,
      items: [
        {
          title: 'Il lit la mise en page, pas le texte brut',
          body: 'Un PDF stocke le texte dans l’ordre où le fichier le liste, qui n’est pas l’ordre de lecture. Celui-ci reconstruit les lignes à partir de leur position sur la page, repère la gouttière entre les colonnes et lit chaque colonne de haut en bas, comme vous le feriez.',
        },
        {
          title: 'Les titres sont mesurés, pas devinés',
          body: 'Les intitulés de rubrique sont identifiés par leur corps de texte, puis confirmés avec la façon dont ces rubriques s’appellent en quatre langues. Les modèles ne s’accordent pas : certains grossissent leurs titres, d’autres les réduisent en capitales.',
        },
        {
          title: 'Les puces restent des puces',
          body: 'Chaque puce devient une réalisation distincte, mot pour mot — y compris celles que Word écrit avec son propre symbole privé, cause habituelle d’un poste qui revient en un seul paragraphe.',
        },
        {
          title: 'Les rubriques sans champ dédié sont conservées',
          body: 'Certifications, centres d’intérêt, bénévolat, publications : tout intitulé sans champ standard arrive en rubrique personnalisée, sous votre propre titre. Reconnaître une rubrique puis la jeter serait le pire des deux résultats.',
        },
      ],
    },
    prose: [
      {
        heading: 'Trois raisons d’importer un ancien CV',
        paragraphs: [
          'Changer l’apparence sans retaper : importez, changez de modèle, exportez. Le contenu et le design sont deux choses distinctes, donc essayer six mises en page avec votre vrai parcours prend deux minutes plutôt qu’une soirée.',
          'Rendre un vieux CV lisible par les ATS : un CV en deux colonnes avec une barre latérale graphique peut être invisible pour un logiciel de recrutement. Importez-le, passez sur une mise en page en une colonne notée pour sa lisibilité machine, et les mêmes mots deviennent exploitables.',
          'Sortir un fichier d’un format que vous ne pouvez plus modifier : un .docx dont la police a disparu, ou un PDF dont le fichier source est perdu depuis longtemps.',
        ],
      },
      {
        heading: 'Et si le CV n’existe pas encore ?',
        paragraphs: [
          'L’import n’a alors rien à lire. Commencez plutôt par le rédacteur IA : il vous pose une dizaine de questions et écrit le premier jet à partir de vos réponses — sans inventer le moindre chiffre que vous ne lui auriez pas donné.',
        ],
      },
    ],
    faq: [
      {
        question: 'Quels fichiers puis-je importer ?',
        answer:
          'PDF et Word (.docx), jusqu’à 8 Mo, ainsi qu’un export JSON CreateCVOnline si vous restaurez une sauvegarde ou changez de compte. Le chemin JSON est exact plutôt que déduit, puisque le fichier porte notre propre format.',
      },
      {
        question: 'Un CV en deux colonnes revient-il mélangé ?',
        answer:
          'C’est précisément l’échec autour duquel l’import a été conçu. Il part de l’emplacement du texte sur la page, repère la gouttière vide entre les colonnes et lit chaque colonne à son tour. Lorsque les colonnes se chevauchent au point qu’aucune gouttière nette n’existe, l’écran de vérification vous prévient que l’ordre peut être faux.',
      },
      {
        question: 'Peut-il lire un CV scanné ou photographié ?',
        answer:
          'Non, et rien d’autre ne le peut. Un PDF scanné ou exporté en image ne contient aucune couche de texte : il n’y a rien à extraire. C’est utile à savoir au-delà de notre import — c’est exactement pour cette raison qu’un CV en image est invisible pour tous les logiciels de recrutement auxquels vous l’envoyez.',
      },
      {
        question: 'Mes formulations sont-elles modifiées ?',
        answer:
          'Non. L’import copie. Vos puces arrivent telles que vous les avez écrites, fautes comprises. Le rédacteur IA est une fonction distincte, pour ceux qui partent de zéro : si vous avez déjà un CV, il n’y a rien à rédiger.',
      },
      {
        question: 'Et s’il se trompe ?',
        answer:
          'Vous le verrez avant l’enregistrement, c’est tout l’objet de l’écran de vérification. Il liste chaque entrée lue plutôt qu’un décompte, donc un poste fusionné ou un employeur erroné saute aux yeux.',
      },
      {
        question: 'Mon CV est-il stocké quand je l’importe ?',
        answer:
          'Le fichier lui-même n’est jamais stocké. Il est lu dans la requête puis jeté ; seul le CV que vous choisissez de créer est enregistré dans votre compte, exactement comme si vous l’aviez saisi.',
      },
      {
        question: 'L’import est-il payant ?',
        answer:
          'Non. L’import est disponible sur la formule gratuite, dans la limite du nombre de CV que peut contenir un compte. Les comptes payants bénéficient d’une lecture assistée par IA qui gère mieux les mises en page inhabituelles, avec la lecture standard en secours.',
      },
    ],
    related: [
      {
        label: 'CV avec l’IA',
        href: '/fr/cv-avec-ia',
        description: 'Pour partir de zéro : dix questions, rien d’inventé.',
      },
      {
        label: 'Créer un CV en ligne',
        href: '/fr/creer-un-cv',
        description: 'L’éditeur, écran par écran.',
      },
      ...CORE_LINKS,
    ],
  },
  'cv-avec-ia': {
    path: '/fr/cv-avec-ia',
    breadcrumb: 'CV avec l’IA',
    metaTitle: 'CV avec l’IA — dix questions, et rien d’inventé',
    metaDescription:
      'Une IA qui rédige votre CV sans inventer vos résultats. Répondez à une dizaine de questions : elle écrit l’accroche, les puces et les dates, puis retire tout chiffre que vous ne lui avez pas donné.',
    keywords: [
      'cv avec ia',
      'créer un cv avec l’ia',
      'générateur de cv ia',
      'rédiger un cv avec l’ia',
      'cv intelligence artificielle',
    ],
    heading: 'Un CV rédigé par l’IA, sans rien inventer',
    lede: 'Répondez à une dizaine de questions avec vos propres mots. L’IA rédige l’accroche, transforme ce que vous avez dit en puces de réalisations et déduit les dates — puis supprime tout chiffre que vous ne lui avez pas donné, et vous dit combien elle en a retiré.',
    badges: ['Une dizaine de questions', 'Aucun chiffre inventé', 'Tout reste modifiable'],
    steps: {
      title: 'De la page blanche au premier jet',
      items: [
        {
          title: 'Une dizaine de questions',
          body: 'Votre nom, le poste visé, puis un emploi à la fois : lequel, où, quand, et ce que vous y faisiez — dans les mots que vous emploieriez à l’oral. Chaque question donne un exemple de réponse en dessous.',
        },
        {
          title: 'Les chiffres que vous avez',
          body: 'Une question demande explicitement les chiffres : taille d’équipe, budget, nombre de sites, de clients. C’est le seul endroit d’où un chiffre peut venir. Laissez vide, et votre CV n’en contiendra aucun.',
        },
        {
          title: 'L’IA rédige le document',
          body: 'Elle écrit l’accroche de zéro, transforme chaque réponse en puces commençant par un verbe, déduit les dates de la façon dont vous les avez écrites, et range le tout par rubrique. Quelques secondes.',
        },
        {
          title: 'Vous lisez avant que ça existe',
          body: 'Rien n’est enregistré tant que vous n’avez pas vu le résultat. Vous gardez, ou vous revenez modifier vos réponses. Ensuite le CV s’ouvre dans l’éditeur comme n’importe quel autre.',
        },
      ],
    },
    howTo: true,
    features: {
      title: 'Ce que l’IA ne fera pas',
      description:
        'Tous les outils promettent la précision. Voici le mécanisme derrière la promesse, pour que vous puissiez le juger plutôt que le croire.',
      columns: 2,
      items: [
        {
          title: 'Elle ne peut pas utiliser un chiffre que vous n’avez pas donné',
          body: 'Après la rédaction, chaque puce est comparée à ce que vous avez saisi. Toute ligne portant un chiffre absent de vos réponses est supprimée, et on vous dit combien. Ce n’est pas une consigne polie dans une invite : c’est une vérification qui s’exécute après.',
        },
        {
          title: 'Elle reformule, elle n’enjolive pas',
          body: '« Je gérais l’équipe de maintenance et je faisais les rapports mensuels » devient deux puces nettes. Pas « Pilotage d’une équipe de 12 personnes, avec 30 % de délais en moins » — vous n’avez dit ni douze, ni trente pour cent.',
        },
        {
          title: 'Elle écrit dans votre langue',
          body: 'Vous répondez en français, votre CV est en français. Aucune étape de traduction ne transforme discrètement vos mots en ceux de quelqu’un d’autre.',
        },
        {
          title: 'Tout reste modifiable ensuite',
          body: 'Le résultat est un CV ordinaire dans l’éditeur ordinaire. Réécrivez une puce, supprimez un poste, changez de modèle : rien n’est verrouillé parce qu’une machine a produit le premier jet.',
        },
      ],
    },
    prose: [
      {
        heading: 'Le vrai problème d’une IA qui vous flatte',
        paragraphs: [
          'Un CV qui annonce « 30 % d’amélioration » appelle une question en entretien : comment l’avez-vous mesuré ? Un candidat incapable de répondre ne perd pas seulement un point — il rend suspect tout le reste de la page.',
          'Les chiffres sont précisément ce qui fait sonner un CV comme celui d’un profil senior, et c’est pour cela qu’un modèle de langage y court. Demandez à une IA généraliste d’écrire une puce de CV et comptez les pourcentages qui reviennent sans que vous les ayez jamais mentionnés.',
          'Le pire, c’est que vous ne le remarquerez pas. Personne ne relit une phrase qui le flatte : une réalisation inventée se lit comme un bon souvenir à moitié oublié. C’est pour cela que la vérification a lieu avant que vous voyiez le brouillon, et non après.',
        ],
      },
      {
        heading: 'Vous avez déjà un CV ?',
        paragraphs: [
          'Alors ne répondez pas à des questions : importez-le. L’import lit un PDF ou un fichier Word et remplit l’éditeur — postes, employeurs, dates, puces, formation, compétences et langues.',
          'Il travaille à partir de la mise en page plutôt que de l’ordre brut du texte, ce qui évite qu’un CV sur deux colonnes revienne mélangé. Et il vous montre ce qu’il a lu avant d’enregistrer quoi que ce soit.',
        ],
      },
    ],
    faq: [
      {
        question: 'L’IA rédige-t-elle vraiment, ou est-ce un simple formulaire ?',
        answer:
          'Elle rédige. L’accroche n’existe nulle part dans vos réponses : c’est l’IA qui la compose. Vos phrases simples deviennent des puces structurées, et « de janvier 2021 à aujourd’hui » devient une date de début avec le poste marqué comme en cours. Les questions existent parce qu’une IA ne peut pas écrire sur quelqu’un dont elle ne sait rien.',
      },
      {
        question: 'En quoi est-ce différent de demander à ChatGPT ?',
        answer:
          'Deux choses. Elle vous pose d’abord les bonnes questions, donc elle travaille sur de la matière réelle au lieu de deviner un CV générique pour votre intitulé de poste. Et elle ne conservera pas un chiffre que vous ne lui avez pas donné — un agent conversationnel généraliste vous rendra volontiers un pourcentage inventé, impossible à distinguer d’un vrai.',
      },
      {
        question: 'Et si je n’ai pas de chiffres impressionnants ?',
        answer:
          'Alors votre CV n’en aura pas, et c’est très bien. La plupart des gens n’ont pas de métrique propre pour l’essentiel de ce qu’ils ont fait. Une puce vraie et précise — « suivi du reporting mensuel pour quatre agences régionales » — vaut mieux qu’un pourcentage inventé, parce que vous pouvez en parler dix minutes sans broncher.',
      },
      {
        question: 'Combien de temps cela prend-il ?',
        answer:
          'Les questions prennent cinq à dix minutes si vous avez vos dates en tête. La rédaction prend quelques secondes. Le reste du temps se passe dans l’éditeur, à couper et affûter — et c’est la partie qui mérite du temps.',
      },
      {
        question: 'Est-ce gratuit ?',
        answer:
          'Répondre aux questions est gratuit, et les questions sont utiles en elles-mêmes : plusieurs personnes les parcourent puis rédigent leur CV elles-mêmes dans l’éditeur, ce qui ne coûte rien et ne coûtera jamais rien. L’étape de rédaction par l’IA fait partie de Pro et de l’accès à vie.',
      },
      {
        question: 'Dans quelles langues cela fonctionne-t-il ?',
        answer:
          'Français, anglais, allemand et néerlandais. Les questions et leurs exemples sont écrits dans chaque langue plutôt que traduits automatiquement, et le CV revient dans la langue de vos réponses.',
      },
    ],
    related: [
      {
        label: 'Créer un CV en ligne',
        href: '/fr/creer-un-cv',
        description: 'L’éditeur, écran par écran.',
      },
      {
        label: 'Faire un CV, étape par étape',
        href: '/fr/faire-un-cv',
        description: 'De la page blanche au document fini, dans l’ordre.',
      },
      ...CORE_LINKS,
    ],
  },
  'creer-un-cv': {
    path: '/fr/creer-un-cv',
    breadcrumb: 'Créer un CV',
    metaTitle: 'Créer un CV en ligne',
    metaDescription:
      'Créez votre CV en ligne dans un éditeur qui affiche la page réelle pendant que vous écrivez. Modèles gratuits, export PDF immédiat, sans logiciel à installer.',
    keywords: [
      'créer un cv',
      'créer un cv en ligne',
      'créateur de cv',
      'créer un cv gratuit',
      'logiciel cv en ligne',
    ],
    heading: 'Créer un CV en ligne',
    lede: 'Un éditeur qui montre la page telle qu’elle sortira. Vous remplissez des champs à gauche, la page A4 se compose à droite, et le PDF que vous téléchargez est exactement ce que vous voyez — pas une approximation qui déborde sur une deuxième page à l’impression.',
    badges: ['Sans installation', 'Aperçu en direct', 'PDF sélectionnable'],
    steps: {
      title: 'Ce que fait l’éditeur',
      items: [
        {
          title: 'Des champs, pas une page blanche',
          body: 'Chaque rubrique a ses champs : intitulé de poste, entreprise, dates, réalisations. Vous ne mettez pas en forme, vous saisissez — la mise en page est le travail du modèle.',
        },
        {
          title: 'L’aperçu est le document',
          body: 'La page de droite est rendue par le même code que votre PDF. Ce n’est pas une prévisualisation approximative : c’est le document, à l’échelle.',
        },
        {
          title: 'Réorganiser sans retaper',
          body: 'Les rubriques se déplacent, se renomment et se masquent. Mettre les compétences avant l’expérience prend trois secondes et ne touche à aucun texte.',
        },
        {
          title: 'Exporter en PDF',
          body: 'A4 ou US Letter, avec un texte réellement sélectionnable. Le fichier est produit côté serveur par le moteur qui rend l’aperçu, donc les deux ne peuvent pas diverger.',
        },
      ],
    },
    features: {
      title: 'Les réglages qui comptent',
      description:
        'Assez de contrôle pour que le document vous ressemble, pas assez pour que vous puissiez le casser.',
      items: [
        {
          title: 'Typographie',
          body: 'Quinze familles, choisies pour rester lisibles à 10 points sur une page imprimée. Chaque modèle arrive avec un couple titres/texte déjà cohérent.',
        },
        {
          title: 'Couleur d’accentuation',
          body: 'Une seule, appliquée aux titres de rubrique et aux filets. Un CV à quatre couleurs n’est pas plus expressif, il est plus difficile à lire.',
        },
        {
          title: 'Espacement et marges',
          body: 'Interligne, espace entre rubriques et marge de page se règlent séparément. C’est le levier à utiliser quand il vous manque trois lignes pour tenir sur une page.',
        },
        {
          title: 'Photo',
          body: 'Recadrée en carré et redimensionnée dans votre navigateur avant l’envoi, donc une photo de téléphone n’alourdit pas le PDF. Désactivable sur tous les modèles qui en prévoient une.',
        },
        {
          title: 'Rubriques sur mesure',
          body: 'Pour ce que les douze rubriques standard ne couvrent pas : brevets, mandats associatifs, interventions en conférence, service militaire.',
        },
        {
          title: 'Lettre de motivation',
          body: 'Elle reprend les polices, la couleur et les marges du CV, et s’exporte en première page du même PDF — les deux documents arrivent comme un ensemble.',
        },
      ],
    },
    prose: [
      {
        heading: 'Pourquoi un éditeur plutôt qu’un fichier Word',
        paragraphs: [
          'Un modèle Word est un document que vous devez réparer. Les tableaux invisibles qui le structurent se décalent dès que vous ajoutez une ligne, la police manque sur la machine d’en face, et le PDF exporté ne ressemble plus tout à fait à ce que vous aviez à l’écran. Le temps que vous croyiez gagner en partant d’un modèle tout fait, vous le passez à rattraper sa mise en page.',
          'Ici, la mise en page n’est pas modifiable par accident, parce qu’elle n’est pas dans votre document : elle est dans le modèle, et votre contenu est une donnée séparée. C’est ce qui permet de changer de modèle après avoir tout saisi sans rien reprendre, et c’est aussi ce qui garantit qu’un CV rempli en deux minutes est aussi bien composé qu’un CV rempli en deux heures.',
        ],
      },
      {
        heading: 'Ce que vous gardez',
        paragraphs: [
          'Votre CV vous appartient et reste exportable. Depuis les réglages, vous téléchargez l’intégralité de vos documents en JSON — coordonnées, rubriques, réglages de mise en forme — dans un fichier construit dans votre navigateur, à partir de votre propre compte. Rien n’est envoyé ailleurs pour cela.',
          'Les PDF n’expirent pas et ne portent pas de filigrane. L’offre gratuite ajoute une mention discrète en pied de page ; l’offre payante la retire. Il n’y a pas de version du document que vous ne pouvez pas emporter.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Faut-il installer quelque chose ?',
        answer:
          'Non. Tout se passe dans le navigateur, sur ordinateur comme sur téléphone. Le PDF est produit côté serveur et téléchargé comme n’importe quel fichier.',
      },
      {
        question: 'Mon travail est-il enregistré automatiquement ?',
        answer:
          'Oui, au fil de la saisie. Si un enregistrement échoue — connexion coupée, onglet fermé trop vite — une copie reste dans votre navigateur et vous est proposée à la réouverture, avec la date, pour que vous choisissiez laquelle garder.',
      },
      {
        question: 'Puis-je créer plusieurs versions de mon CV ?',
        answer:
          'Oui. Dupliquez un CV existant et adaptez-le à l’offre : c’est l’usage le plus efficace de l’outil, et c’est ce que l’offre Pro rend illimité. L’offre gratuite en conserve un.',
      },
      {
        question: 'L’éditeur fonctionne-t-il sur téléphone ?',
        answer:
          'Oui. L’aperçu passe sous le formulaire au lieu d’être à côté, et les rubriques se parcourent une par une. Rédiger un CV entier au pouce reste inconfortable — mais corriger une faute ou changer une date avant d’envoyer une candidature, non.',
      },
    ],
    related: [
      {
        label: 'Faire un CV, étape par étape',
        href: '/fr/faire-un-cv',
        description: 'De la page blanche au document fini, dans l’ordre.',
      },
      {
        label: 'CV compatible ATS',
        href: '/fr/cv-ats',
        description: 'Les mises en page que les logiciels de tri relisent sans erreur.',
      },
      ...CORE_LINKS,
    ],
  },

  'faire-un-cv': {
    path: '/fr/faire-un-cv',
    breadcrumb: 'Faire un CV',
    metaTitle: 'Faire un CV : la méthode complète',
    metaDescription:
      'Comment faire un CV, rubrique par rubrique : ce qu’on y met, ce qu’on en retire, et comment écrire une expérience pour qu’elle dise quelque chose. Avec un éditeur pour l’appliquer.',
    keywords: [
      'faire un cv',
      'comment faire un cv',
      'rédiger un cv',
      'faire un cv gratuit',
      'aide cv',
    ],
    heading: 'Faire un CV, de la page blanche au PDF',
    lede: 'La difficulté n’est presque jamais la mise en page — c’est de savoir quoi écrire dans « Expérience professionnelle » quand on regarde le champ vide. Cette page traite les deux : ce qui va dans chaque rubrique, et l’outil pour l’écrire.',
    badges: ['Rubrique par rubrique', 'Exemples concrets', 'Gratuit'],
    howTo: true,
    steps: {
      title: 'La méthode, dans l’ordre',
      items: [
        {
          title: 'Rassemblez avant de rédiger',
          body: 'Dates de début et de fin de chaque poste, intitulés exacts, diplômes et années. Chercher une date au milieu de la rédaction est ce qui fait abandonner un CV à moitié fait.',
        },
        {
          title: 'Écrivez l’expérience d’abord',
          body: 'C’est la rubrique la plus longue et la plus lue. Le reste se cale ensuite autour d’elle — y compris l’accroche, qui est plus facile à écrire quand le parcours est déjà posé.',
        },
        {
          title: 'Réduisez à une page',
          body: 'Coupez d’abord les postes de plus de dix ans, puis les tâches qui vont de soi dans votre métier. Ce qui reste doit être ce que vous voulez qu’on vous demande en entretien.',
        },
        {
          title: 'Relisez à voix haute, puis exportez',
          body: 'Les fautes qui survivent à trois relectures silencieuses ne survivent pas à une lecture à voix haute. Exportez ensuite le PDF et ouvrez-le : c’est le document que le recruteur verra.',
        },
      ],
    },
    features: {
      title: 'Ce que contient chaque rubrique',
      columns: 2,
      items: [
        {
          title: 'L’accroche',
          body: 'Trois ou quatre lignes : votre métier, votre nombre d’années d’expérience, et le résultat que vous voulez qu’on lise en premier. Pas « dynamique et motivé » — un recruteur n’a jamais retenu personne pour ça.',
        },
        {
          title: 'L’expérience',
          body: 'Une ligne de contexte par poste (périmètre, taille de l’équipe), puis des réalisations. « Responsable du budget » décrit une fiche de poste ; « budget de 400 k€ tenu à 3 % près sur deux exercices » décrit ce que vous avez fait.',
        },
        {
          title: 'La formation',
          body: 'Diplôme, établissement, année. En début de carrière, elle passe avant l’expérience et peut mentionner le sujet de mémoire ou les matières pertinentes. Dix ans plus tard, deux lignes suffisent.',
        },
        {
          title: 'Les compétences',
          body: 'Entre cinq et quinze, regroupées par famille. En dessous de cinq, la rubrique a l’air d’un oubli ; au-delà de quinze, elle n’est plus lue et dilue les compétences qui comptent.',
        },
        {
          title: 'Les langues',
          body: 'Avec un niveau CECRL — A1 à C2 — plutôt qu’une appréciation. « Bon niveau » ne veut rien dire de vérifiable ; B2 se situe immédiatement.',
        },
        {
          title: 'Ce qu’on ne met plus',
          body: 'La situation familiale, le nombre d’enfants, la mention « Curriculum Vitae » en titre et la phrase « références disponibles sur demande ». Aucun de ces éléments n’aide, et chacun prend la place d’une ligne qui aiderait.',
        },
      ],
    },
    prose: [
      {
        heading: 'Écrire une expérience qui dit quelque chose',
        paragraphs: [
          'Le réflexe est de décrire ce dont on était responsable. Le recruteur, lui, cherche ce que vous avez changé. La différence tient à une bascule simple : commencez la phrase par un verbe d’action, terminez-la par un chiffre ou un délai, et supprimez tout ce qui décrit le poste plutôt que votre passage dedans.',
          '« Refonte du parcours d’inscription, taux d’activation porté de 34 % à 58 % en deux trimestres » tient sur une ligne et contient une action, une mesure et une durée. On peut vous interroger dessus en entretien, ce qui est exactement le but d’une ligne de CV. Trois ou quatre lignes de cette qualité valent mieux que huit lignes de responsabilités.',
          'Si vous n’avez pas de chiffres — c’est fréquent, et ce n’est pas rédhibitoire — remplacez la mesure par une portée : le nombre de personnes concernées, la taille du périmètre, la durée du projet, ce qui existait avant et n’existait pas après.',
        ],
      },
      {
        heading: 'Une page ou deux ?',
        paragraphs: [
          'Une page en dessous de dix ans d’expérience, deux au-delà. La règle vaut moins pour elle-même que pour ce qu’elle impose : à une page, vous êtes obligé de choisir, et ce choix est déjà une information pour la personne qui lit.',
          'Au-delà de deux pages, vous n’écrivez plus un CV mais un dossier. C’est justifié dans la recherche, où la liste de publications est attendue, et dans certains concours de la fonction publique. Ailleurs, une troisième page est presque toujours le signe qu’aucun arbitrage n’a été fait.',
          'Si vous êtes à trois lignes près, ne réduisez pas la police en dessous de 10 points : c’est immédiatement visible et cela donne l’impression d’un document qui déborde. Réglez plutôt l’interligne et la marge de page, ou coupez un poste ancien.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Faut-il une lettre de motivation ?',
        answer:
          'En France, elle reste attendue dans une majorité de candidatures, sauf mention contraire dans l’annonce. L’éditeur en intègre une : elle reprend les polices, la couleur et les marges du CV et s’exporte en première page du même PDF.',
      },
      {
        question: 'Dans quel ordre présenter les expériences ?',
        answer:
          'Antichronologique : la plus récente en premier. C’est ce qu’un recruteur cherche et il ne devrait pas avoir à le déduire. La seule exception courante est le CV par compétences, où les réalisations sont regroupées par domaine et l’historique des postes tient en quelques lignes à la fin.',
      },
      {
        question: 'Comment traiter un trou dans le parcours ?',
        answer:
          'En le nommant brièvement plutôt qu’en le masquant : congé parental, formation, reconversion, soins à un proche. Un écart de six mois expliqué en trois mots ne pose de problème à personne ; le même écart laissé silencieux est ce qui déclenche la question en entretien.',
      },
      {
        question: 'Faut-il adapter son CV à chaque offre ?',
        answer:
          'Aux offres qui vous intéressent vraiment, oui — et l’adaptation utile est plus courte qu’on ne le croit : l’accroche, l’ordre des compétences, et les deux ou trois réalisations mises en avant. Dupliquer un CV existant prend une seconde et évite de repartir de zéro.',
      },
    ],
    related: [
      {
        label: 'Créer un CV en ligne',
        href: '/fr/creer-un-cv',
        description: 'L’éditeur, l’aperçu en direct et l’export PDF.',
      },
      {
        label: 'Exemples de CV',
        href: '/fr/exemples-de-cv',
        description: 'Des CV complets à reprendre rubrique par rubrique.',
      },
      ...CORE_LINKS,
    ],
  },

  'cv-en-ligne': {
    path: '/fr/cv-en-ligne',
    breadcrumb: 'CV en ligne',
    metaTitle: 'CV en ligne : rédiger, mettre en forme et télécharger',
    metaDescription:
      'Rédigez votre CV en ligne et téléchargez-le en PDF depuis votre navigateur. Rien à installer, votre document reste accessible et modifiable depuis n’importe quel appareil.',
    keywords: [
      'cv en ligne',
      'cv en ligne gratuit',
      'faire son cv en ligne',
      'cv à remplir en ligne',
      'cv pdf en ligne',
    ],
    heading: 'Votre CV en ligne',
    lede: 'Un CV en ligne n’est pas un CV publié sur le web — c’est un CV que vous n’avez pas à retrouver. Il vit dans votre compte, s’ouvre depuis n’importe quel appareil, et produit un PDF quand vous en avez besoin.',
    badges: ['Accessible partout', 'Rien à installer', 'Export PDF illimité en Pro'],
    steps: {
      title: 'Ce que « en ligne » change concrètement',
      items: [
        {
          title: 'Plus de fichier à retrouver',
          body: 'Fini le CV_final_v3_vraiment_final.docx. Il y a un document, à une adresse, et c’est toujours la dernière version.',
        },
        {
          title: 'Le même sur tous vos appareils',
          body: 'Commencé sur l’ordinateur du travail, corrigé dans le train sur le téléphone. Aucun transfert, aucune clé USB, aucune pièce jointe que vous vous envoyez à vous-même.',
        },
        {
          title: 'Une mise à jour, pas une reprise',
          body: 'Dans deux ans, vous ajoutez un poste et vous exportez. Vous ne rouvrez pas un fichier dont la mise en page a vieilli et dont la police manque.',
        },
        {
          title: 'Un lien à partager, si vous le voulez',
          body: 'L’offre Pro publie votre CV à une adresse impossible à deviner, que vous coupez d’un clic. Elle n’apparaît pas dans les moteurs de recherche.',
        },
      ],
    },
    prose: [
      {
        heading: 'En ligne, mais pas public',
        paragraphs: [
          'C’est la confusion la plus courante, et elle mérite une réponse nette : votre CV n’est visible par personne d’autre que vous tant que vous ne créez pas explicitement un lien de partage. Il n’est pas indexé, il n’est pas listé, il n’est proposé à aucun recruteur. Nous ne vendons pas de base de candidats et ce site n’est pas une plateforme de mise en relation.',
          'Le lien public, quand vous l’activez, pointe vers une page en lecture seule à une adresse aléatoire, non indexable par les moteurs. Vous le désactivez quand vous voulez, et l’ancienne adresse cesse alors de fonctionner immédiatement.',
        ],
      },
      {
        heading: 'Le PDF reste le document de référence',
        paragraphs: [
          'Quelle que soit la modernité de l’outil, ce qui arrive dans la boîte d’un recruteur ou dans un portail de candidature est un PDF. C’est pour cela que l’aperçu est composé à la taille réelle de la page et rendu par le même moteur que l’export : la fidélité entre les deux est la propriété la plus importante du produit, pas une commodité.',
          'Le texte du PDF est du vrai texte, toujours. On peut le sélectionner, le copier et l’extraire — ce que fait précisément un logiciel de suivi des candidatures avant qu’un humain n’ouvre le fichier. Un CV exporté en image passe pour vide aux yeux de ces logiciels, et c’est une façon silencieuse de disparaître d’un processus.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Mon CV est-il visible par des recruteurs ?',
        answer:
          'Non. Rien n’est partagé tant que vous n’activez pas vous-même un lien public, et ce site ne propose pas de CV à des recruteurs — il n’y a pas de base de candidats.',
      },
      {
        question: 'Que se passe-t-il si je supprime mon compte ?',
        answer:
          'Vos CV, votre historique de paiement et votre profil sont supprimés. Exportez d’abord vos documents en JSON depuis les réglages si vous voulez en garder une copie : la suppression n’est pas réversible.',
      },
      {
        question: 'Puis-je travailler hors connexion ?',
        answer:
          'Partiellement. L’éditeur garde une copie locale de votre travail dans le navigateur, ce qui protège une session interrompue par une connexion instable. Mais l’enregistrement définitif et l’export PDF demandent une connexion.',
      },
      {
        question: 'Combien de temps mon CV est-il conservé ?',
        answer:
          'Sans limite tant que le compte existe. Nous ne supprimons pas les documents d’un compte inactif sans prévenir, et un CV créé avec l’offre gratuite reste accessible même si un abonnement payant se termine.',
      },
    ],
    related: [
      {
        label: 'Créer un CV en ligne',
        href: '/fr/creer-un-cv',
        description: 'Le détail de l’éditeur et de l’export.',
      },
      {
        label: 'CV gratuit',
        href: '/fr/cv-gratuit',
        description: 'Ce que l’offre gratuite comprend exactement.',
      },
      ...CORE_LINKS,
    ],
  },

  'exemples-de-cv': {
    path: '/fr/exemples-de-cv',
    breadcrumb: 'Exemples de CV',
    metaTitle: 'Exemples de CV à reprendre',
    metaDescription:
      'Des exemples de CV complets pour voir la forme avant d’écrire : ce que contient chaque rubrique, dans quel ordre, et à quelle longueur. À reprendre directement dans l’éditeur.',
    keywords: [
      'exemple de cv',
      'exemples de cv',
      'modèle de cv rempli',
      'exemple cv gratuit',
      'cv exemple pdf',
    ],
    heading: 'Exemples de CV',
    lede: 'Un modèle vide ne dit pas quelle longueur doit faire une expérience, ni combien de compétences valent la peine d’être listées. Un CV rempli, si. Chaque modèle de la galerie s’affiche avec un exemple complet que vous pouvez reprendre et remplacer ligne par ligne.',
    badges: ['Exemples complets', 'À reprendre directement', 'Tous métiers'],
    features: {
      title: 'Ce qu’un exemple vous montre qu’un modèle vide ne montre pas',
      items: [
        {
          title: 'La bonne longueur',
          body: 'Trois lignes de réalisations par poste, pas huit. C’est visible d’un coup d’œil sur un exemple et invisible sur un gabarit vide.',
        },
        {
          title: 'Le niveau de détail',
          body: 'Ce qu’on écrit dans une ligne d’expérience et ce qu’on garde pour l’entretien. La frontière est plus facile à voir qu’à expliquer.',
        },
        {
          title: 'L’ordre des rubriques',
          body: 'Formation avant expérience en début de carrière, l’inverse ensuite. L’exemple montre l’arbitrage plutôt que d’en énoncer la règle.',
        },
        {
          title: 'Ce qui tient sur une page',
          body: 'Avec les vraies polices et les vraies marges. C’est le seul moyen honnête de savoir combien de postes entrent avant de déborder.',
        },
        {
          title: 'La densité acceptable',
          body: 'Un CV trop aéré paraît vide, un CV trop dense n’est pas lu. L’exemple est composé entre les deux, sur le modèle que vous regardez.',
        },
        {
          title: 'Le rendu réel du modèle',
          body: 'Une capture d’un modèle vide flatte toujours. Rempli, il montre ce que la mise en page fait quand un intitulé de poste est long.',
        },
      ],
    },
    prose: [
      {
        heading: 'Reprendre un exemple sans copier son contenu',
        paragraphs: [
          'Un exemple sert à voir la forme, pas à fournir les phrases. Reprenez la structure — le nombre de lignes, la façon dont une réalisation est tournée, l’ordre des rubriques — et remplacez intégralement le texte par le vôtre. Un recruteur reconnaît immédiatement une formule générique, et les formules génériques se retrouvent dans des centaines de CV.',
          'La bonne façon de s’en servir : ouvrez l’exemple, lisez une ligne d’expérience, demandez-vous ce que serait l’équivalent chez vous, écrivez-le, passez à la suivante. C’est plus lent que de copier et c’est le seul procédé qui produit un CV qui vous ressemble.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Les exemples sont-ils réutilisables tels quels ?',
        answer:
          'La mise en page, oui : c’est le modèle, et il est fait pour ça. Le texte, non — il est là pour montrer la forme. Un CV rempli avec les phrases de l’exemple se repère et dessert la candidature.',
      },
      {
        question: 'Y a-t-il des exemples par métier ?',
        answer:
          'Les modèles couvrent les grandes familles — informatique, finance, création, santé, enseignement, fonction publique — et chacun s’affiche avec un exemple cohérent avec son métier. Les guides détaillés par profession n’existent pour l’instant qu’en anglais.',
      },
      {
        question: 'Puis-je partir d’un exemple dans l’éditeur ?',
        answer:
          'Oui. Au moment de créer un CV, choisissez « Partir d’un exemple » : le document arrive rempli et vous remplacez les rubriques une par une. C’est souvent plus rapide que la page blanche.',
      },
    ],
    related: [
      {
        label: 'Faire un CV, étape par étape',
        href: '/fr/faire-un-cv',
        description: 'Ce qu’on met dans chaque rubrique, et comment l’écrire.',
      },
      {
        label: 'Modèles de CV modernes',
        href: '/fr/modeles-de-cv/moderne',
        description: 'Le point de départ le plus sûr.',
      },
      ...CORE_LINKS,
    ],
  },

  'cv-ats': {
    path: '/fr/cv-ats',
    breadcrumb: 'CV compatible ATS',
    metaTitle: 'CV compatible ATS',
    metaDescription:
      'Un CV que les logiciels de suivi des candidatures relisent sans erreur : une colonne, pas de graphique, des intitulés en toutes lettres. Modèles notés 5/5, gratuits.',
    keywords: [
      'cv ats',
      'cv compatible ats',
      'cv logiciel de recrutement',
      'cv scannable',
      'modèle cv ats',
    ],
    heading: 'CV compatible ATS',
    lede: 'Avant qu’un humain n’ouvre votre candidature, un logiciel en extrait le texte. S’il se trompe, vous êtes écarté sans que personne ne l’ait décidé. Ces modèles sont conçus pour que cette extraction se passe bien.',
    badges: ['Une colonne', 'Sans graphique', 'Texte extractible'],
    features: {
      title: 'Ce qui casse une extraction',
      description:
        'Les six causes qui reviennent, et ce que les modèles notés 5/5 font à la place.',
      items: [
        {
          title: 'Deux colonnes',
          body: 'Le logiciel lit de gauche à droite sur toute la largeur. Une bande latérale se retrouve entrelacée avec le corps du texte, et l’ordre des postes devient illisible.',
        },
        {
          title: 'Les icônes à la place des intitulés',
          body: 'Une enveloppe pour l’adresse e-mail, un téléphone pour le numéro. Une image ne porte aucun texte : l’information existe pour l’œil et pas pour l’extracteur.',
        },
        {
          title: 'Le texte dans une image',
          body: 'Un CV exporté en image ressort entièrement vide. C’est le seul défaut de cette liste qui fait échouer la candidature à 100 %.',
        },
        {
          title: 'Les en-têtes et pieds de page',
          body: 'Beaucoup d’extracteurs les ignorent. Un numéro de téléphone placé en pied de page peut ne jamais arriver de l’autre côté.',
        },
        {
          title: 'Les barres de niveau',
          body: 'Une barre remplie aux trois quarts ne se traduit par aucun texte. Elle occupe la place d’une information vérifiable et n’en apporte aucune.',
        },
        {
          title: 'Les titres de rubrique inventés',
          body: '« Mon parcours » plutôt que « Expérience professionnelle ». Les extracteurs cherchent les intitulés standard ; un titre original vous fait perdre la rubrique entière.',
        },
      ],
    },
    prose: [
      {
        heading: 'La note sur cinq, et ce qu’elle vaut',
        paragraphs: [
          'Chaque modèle porte une note de 1 à 5. Elle est calculée à partir des propriétés de mise en page listées ci-dessus — nombre de colonnes, présence de graphiques dans le flux du texte, usage d’icônes porteuses d’information, structure des titres — et non à partir d’un test réel contre un logiciel du marché.',
          'C’est une évaluation, pas une certification, et il faut le dire clairement : il existe des dizaines d’ATS, ils se comportent différemment, et aucun éditeur d’outil de CV ne peut prétendre les avoir tous testés. Ce que la note vous dit est fiable et limité : à quel point la mise en page présente les caractéristiques qui, quand elles posent problème, posent problème.',
          'La conséquence pratique est simple. Pour une candidature déposée sur un portail — grande entreprise, cabinet de recrutement, plateforme d’emploi — prenez un modèle noté 5. Pour une candidature envoyée directement à une personne, ou dans un métier où la présentation fait partie du dossier, la contrainte ne s’applique pas et un modèle plus graphique se défend.',
        ],
      },
      {
        heading: 'Les mots-clés, sans bourrage',
        paragraphs: [
          'Un ATS classe souvent les candidatures selon la présence de termes tirés de l’offre. La réponse raisonnable est d’employer les mots de l’annonce quand ils décrivent réellement ce que vous avez fait — si l’offre dit « gestion de projet » et que vous écrivez « pilotage de projet », rien ne vous empêche d’écrire les deux formulations une fois chacune.',
          'La réponse déraisonnable est la liste de mots-clés en bas de page, ou le texte blanc sur fond blanc. Le premier procédé est visible et fait mauvaise impression ; le second est détecté et fait écarter la candidature. Aucun des deux ne vaut le risque.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Un CV sur deux colonnes est-il éliminatoire ?',
        answer:
          'Non, mais c’est un risque inutile quand la candidature passe par un portail. Beaucoup d’extracteurs modernes s’en sortent ; ceux qui échouent le font silencieusement, et vous ne saurez jamais que c’est arrivé.',
      },
      {
        question: 'Faut-il enlever la photo pour un ATS ?',
        answer:
          'Le logiciel ignore simplement l’image, donc la photo ne casse rien. Elle occupe en revanche de la place, et certaines entreprises retirent les photos avant présélection pour limiter les biais. Sur une candidature via un portail, l’enlever ne coûte rien.',
      },
      {
        question: 'Quel format de fichier envoyer ?',
        answer:
          'Le PDF, sauf si l’annonce demande explicitement du Word. Le PDF exporté ici contient du vrai texte, donc il s’extrait aussi bien qu’un .docx tout en gardant sa mise en page — ce que le .docx ne garantit pas.',
      },
      {
        question: 'Les modèles ATS sont-ils gratuits ?',
        answer:
          'Tous les modèles notés 5 sur 5 font partie de l’offre gratuite. C’est délibéré : la compatibilité avec les logiciels de tri ne devrait pas être une option payante.',
      },
    ],
    related: [
      {
        label: 'Modèles compatibles ATS',
        href: '/fr/modeles-de-cv/ats',
        description: 'Les modèles notés 5/5, dans la galerie.',
      },
      {
        label: 'Créer un CV en ligne',
        href: '/fr/creer-un-cv',
        description: 'L’éditeur, l’aperçu en direct et l’export PDF.',
      },
      ...CORE_LINKS,
    ],
  },

  'cv-gratuit': {
    path: '/fr/cv-gratuit',
    breadcrumb: 'CV gratuit',
    metaTitle: 'CV gratuit : ce qui est vraiment inclus',
    metaDescription:
      'Créer un CV, le mettre en forme et télécharger le PDF sans payer et sans carte bancaire. Le détail exact de ce que comprend l’offre gratuite, et de ce qu’elle ne comprend pas.',
    keywords: [
      'cv gratuit',
      'créer un cv gratuit',
      'cv gratuit à télécharger',
      'modèle de cv gratuit',
      'faire un cv gratuitement',
    ],
    heading: 'CV gratuit, sans mauvaise surprise',
    lede: 'Beaucoup d’outils appellent « gratuit » le fait de composer un CV, puis demandent un paiement au moment du téléchargement. Ce n’est pas le cas ici, et cette page dit précisément où passe la limite.',
    badges: ['Sans carte bancaire', 'PDF téléchargeable', 'Sans période d’essai'],
    features: {
      title: 'Ce que l’offre gratuite comprend',
      columns: 2,
      items: [
        {
          title: 'Les modèles gratuits',
          body: 'Une part importante de la galerie, dont tous les modèles notés 5/5 pour les logiciels de tri. La compatibilité ATS n’est pas derrière le paywall.',
        },
        {
          title: 'L’éditeur complet',
          body: 'Toutes les rubriques, l’aperçu en direct, la réorganisation, la photo, la lettre de motivation. Aucune fonction d’écriture n’est bridée.',
        },
        {
          title: 'Le téléchargement du PDF',
          body: 'Un vrai PDF, avec du texte sélectionnable, sans filigrane en travers de la page. Une mention discrète figure en pied de page.',
        },
        {
          title: 'Un CV enregistré',
          body: 'Conservé dans votre compte, modifiable, exportable. Il ne disparaît pas au bout de trente jours.',
        },
      ],
    },
    prose: [
      {
        heading: 'Et ce qu’elle ne comprend pas',
        paragraphs: [
          'Les modèles marqués Pro, les CV multiples, les téléchargements illimités, la personnalisation avancée de la mise en forme, les rubriques sur mesure, le lien public partageable, et le PDF sans mention en pied de page. C’est la liste complète : il n’y a pas de limite cachée qui apparaît au moment où vous en avez besoin.',
          'La raison pour laquelle ces éléments-là sont payants et pas d’autres tient en une phrase : ils servent surtout à quelqu’un qui postule souvent. Une personne qui fait un CV pour une candidature n’en a pas l’usage, et lui faire payer le téléchargement d’un document qu’elle a écrit elle-même serait une mauvaise affaire pour tout le monde.',
        ],
      },
      {
        heading: 'Pourquoi un compte est nécessaire',
        paragraphs: [
          'Pour enregistrer votre CV et vous le rendre plus tard. Sans compte, il n’y a nulle part où le mettre : il vivrait dans l’onglet et disparaîtrait avec lui. La création du compte demande une adresse e-mail et un mot de passe, ou un compte Google — jamais de carte bancaire.',
          'L’adresse sert à trois choses : vous reconnecter, récupérer un mot de passe oublié, et vous envoyer un reçu si vous payez un jour. Les e-mails de produit sont facultatifs et se désactivent dans les réglages.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Faut-il une carte bancaire pour commencer ?',
        answer:
          'Non, à aucun moment. Il n’y a pas de période d’essai à annuler, donc rien à saisir tant que vous ne choisissez pas de passer à une offre payante.',
      },
      {
        question: 'Le PDF gratuit porte-t-il un filigrane ?',
        answer:
          'Pas de filigrane en travers de la page. Une mention discrète figure en pied de page, dans le même esprit que la ligne d’adresse d’un document imprimé. L’offre payante la retire.',
      },
      {
        question: 'Que se passe-t-il si j’arrête de payer ?',
        answer:
          'Vos CV restent accessibles et téléchargeables avec les modèles gratuits. Rien n’est supprimé et rien n’est verrouillé rétroactivement : un document composé avec un modèle Pro reste consultable, mais son export repasse sur un modèle gratuit.',
      },
      {
        question: 'Combien de CV puis-je enregistrer gratuitement ?',
        answer:
          'Un. Vous pouvez le modifier autant que vous voulez et le télécharger plusieurs fois par mois. Pour tenir plusieurs versions en parallèle — une par type de poste — il faut l’offre Pro.',
      },
    ],
    related: [
      {
        label: 'Tarifs',
        href: '/fr/tarifs',
        description: 'La comparaison complète des trois offres.',
      },
      {
        label: 'Modèles de CV gratuits',
        href: '/fr/modeles-de-cv',
        description: 'La galerie, avec le statut de chaque modèle.',
      },
      {
        label: 'Créer un CV en ligne',
        href: '/fr/creer-un-cv',
        description: 'L’éditeur, l’aperçu en direct et l’export PDF.',
      },
    ],
  },

  fonctionnalites: {
    path: '/fr/fonctionnalites',
    breadcrumb: 'Fonctionnalités',
    metaTitle: 'Fonctionnalités',
    metaDescription:
      'Tout ce que fait l’éditeur : aperçu à la taille réelle de la page, export PDF fidèle, personnalisation de la typographie, rubriques sur mesure, lettre de motivation assortie.',
    keywords: ['fonctionnalités cv', 'éditeur de cv', 'outil cv en ligne'],
    heading: 'Ce que fait l’outil',
    lede: 'Une liste honnête, y compris de ce qui n’est pas là. Un éditeur de CV se juge sur deux choses : la fidélité entre l’écran et le PDF, et le nombre de fois où il vous met en travers du chemin.',
    badges: ['Aperçu fidèle', 'Export PDF', 'Sauvegarde automatique'],
    features: {
      title: 'L’essentiel',
      items: [
        {
          title: 'Aperçu à la taille réelle',
          body: 'La page est composée en millimètres, pas en pixels approximatifs. Vous voyez la coupure de page à l’endroit exact où elle se produira.',
        },
        {
          title: 'Un seul moteur de rendu',
          body: 'L’aperçu, la page d’impression et le PDF sont produits par le même code. Ils ne peuvent pas diverger, parce qu’il n’y a rien à synchroniser.',
        },
        {
          title: 'Sauvegarde automatique',
          body: 'Au fil de la saisie, avec une copie locale de secours si l’enregistrement échoue — et une proposition de restauration à la réouverture.',
        },
        {
          title: 'Annuler et rétablir',
          body: 'Ctrl+Z sur toute la saisie, y compris la suppression d’une rubrique entière. Rien de ce que vous supprimez n’est perdu sans recours.',
        },
        {
          title: 'Rubriques mobiles',
          body: 'Glisser-déposer à la souris, flèches au clavier. Une rubrique se masque sans être supprimée, ce qui permet de tenir deux variantes dans un seul document.',
        },
        {
          title: 'Douze rubriques standard',
          body: 'Profil, compétences clés, expérience, formation, compétences, langues, projets, certifications, distinctions, bénévolat, publications, centres d’intérêt.',
        },
        {
          title: 'Rubriques sur mesure',
          body: 'Pour tout le reste. Titre, sous-titre, date et description : assez pour un brevet, un mandat, une intervention ou un service civique.',
        },
        {
          title: 'Lettre de motivation assortie',
          body: 'Elle hérite des polices, de la couleur, des marges et de la langue du CV, et sort en première page du même PDF.',
        },
        {
          title: 'Export des données',
          body: 'Tous vos CV en JSON, construit dans votre navigateur. Vous partez avec votre contenu quand vous voulez.',
        },
      ],
    },
    prose: [
      {
        heading: 'Ce qui n’est pas là',
        paragraphs: [
          'Pas de rédaction automatique par intelligence artificielle. Un texte généré se reconnaît, dit la même chose que celui du candidat précédent, et prive le CV de la seule chose qu’il apporte — ce que vous avez fait, dans vos mots.',
          'Pas de « score » de CV sur cent. Ce genre de note donne une impression de rigueur sans rien mesurer de ce qu’un recruteur regarde. Il y a en revanche un indicateur de complétude, qui vérifie une liste de choses concrètes : le nom, les coordonnées, l’accroche, au moins un poste avec des réalisations, cinq compétences.',
          'Pas de diffusion automatique de votre CV à des recruteurs, et pas de base de candidats. Ce site fabrique un document ; il ne fait pas d’intermédiation.',
        ],
      },
      {
        heading: 'Accessibilité et compatibilité',
        paragraphs: [
          'L’interface se parcourt entièrement au clavier, y compris la réorganisation des rubriques, et les contrôles portent des libellés lisibles par un lecteur d’écran. Les couleurs d’état ne sont jamais le seul porteur d’une information.',
          'L’éditeur fonctionne sur les versions récentes de Chrome, Firefox, Safari et Edge, sur ordinateur comme sur mobile. Sur téléphone, l’aperçu passe sous le formulaire plutôt qu’à côté.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Puis-je changer de modèle sans perdre mon contenu ?',
        answer:
          'Oui. Le contenu et vos réglages sont conservés ; seule la typographie du nouveau modèle s’applique, et uniquement si vous n’aviez pas choisi la vôtre.',
      },
      {
        question: 'Le PDF est-il identique à l’aperçu ?',
        answer:
          'Oui, parce que les deux sortent du même code de rendu. C’est la propriété que l’architecture du produit protège en priorité.',
      },
      {
        question: 'Y a-t-il une limite au nombre de rubriques ?',
        answer:
          'Chaque rubrique a un nombre maximal d’entrées, assez large pour tout usage réel et destiné à éviter les documents qui ne s’ouvrent plus. Les rubriques sur mesure sont réservées à l’offre Pro.',
      },
    ],
    related: [
      {
        label: 'Créer un CV en ligne',
        href: '/fr/creer-un-cv',
        description: 'L’éditeur en détail.',
      },
      {
        label: 'Questions fréquentes',
        href: '/fr/faq',
        description: 'Les réponses aux questions les plus posées.',
      },
      ...CORE_LINKS,
    ],
  },

  faq: {
    path: '/fr/faq',
    breadcrumb: 'Questions fréquentes',
    metaTitle: 'Questions fréquentes',
    metaDescription:
      'Les réponses aux questions les plus posées : ce qui est gratuit, la compatibilité ATS, la photo sur un CV français, la confidentialité, le paiement et le remboursement.',
    keywords: ['faq cv', 'aide cv en ligne', 'questions cv'],
    heading: 'Questions fréquentes',
    lede: 'Les questions qui reviennent, avec des réponses complètes plutôt que rassurantes. Si la vôtre n’y est pas, écrivez-nous : nous répondons sous deux jours ouvrés.',
    faqTitle: 'Le produit',
    faq: [
      {
        question: 'Le service est-il vraiment gratuit ?',
        answer:
          'Oui pour créer un CV, le mettre en forme et télécharger le PDF avec les modèles gratuits, sans carte bancaire et sans période d’essai. L’offre payante débloque les modèles Pro, les CV illimités, la personnalisation avancée et le PDF sans mention en pied de page.',
      },
      {
        question: 'Faut-il créer un compte ?',
        answer:
          'Pour enregistrer un CV, oui : sans compte, il n’y a nulle part où le conserver. Une adresse e-mail et un mot de passe suffisent, ou un compte Google. La carte bancaire n’est jamais demandée pour l’offre gratuite.',
      },
      {
        question: 'Mes CV sont-ils privés ?',
        answer:
          'Oui. Rien n’est visible par qui que ce soit tant que vous n’activez pas vous-même un lien de partage, et ce lien pointe vers une adresse aléatoire non indexable par les moteurs. Nous ne vendons pas de données et ne proposons pas de CV à des recruteurs.',
      },
      {
        question: 'Mon CV passera-t-il les logiciels de tri ?',
        answer:
          'Les modèles notés 5 sur 5 sont conçus pour cela : une seule colonne, aucun graphique dans le flux du texte, pas d’icône à la place d’un intitulé, un texte réellement extractible. Aucun éditeur ne peut garantir le comportement de tous les logiciels du marché, mais ce sont précisément ces propriétés qui posent problème quand elles posent problème.',
      },
      {
        question: 'Faut-il mettre une photo sur un CV français ?',
        answer:
          'C’est courant et accepté en France, sans être obligatoire. Certaines entreprises retirent volontairement la photo avant présélection pour limiter les biais. Si vous en mettez une : nette, cadrée sur le visage, fond neutre. Tous les modèles fonctionnent avec et sans.',
      },
      {
        question: 'Puis-je changer de modèle après avoir tout saisi ?',
        answer:
          'Oui, sans rien perdre. Le contenu et vos réglages sont conservés ; seule la typographie du nouveau modèle s’applique, et uniquement si vous n’aviez pas choisi la vôtre.',
      },
      {
        question: 'Puis-je récupérer mes données ?',
        answer:
          'À tout moment, depuis les réglages : un fichier JSON contenant tous vos CV en entier, construit dans votre navigateur à partir de votre compte. Rien n’est envoyé ailleurs pour produire ce fichier.',
      },
      {
        question: 'Comment se passe le paiement ?',
        answer:
          'Par Paddle, qui s’ouvre dans une fenêtre sur la page. Carte bancaire, PayPal, Apple Pay ou Google Pay. Paddle est le vendeur officiel et calcule la TVA applicable dans votre pays. Les montants sont facturés en dollars américains ; votre banque applique son taux de change.',
      },
      {
        question: 'Puis-je être remboursé ?',
        answer:
          'Oui, dans les quatorze jours suivant l’achat, conformément à notre politique de remboursement. Écrivez-nous avec le numéro de commande figurant sur le reçu envoyé par Paddle.',
      },
      {
        question: 'Comment supprimer mon compte ?',
        answer:
          'Depuis les réglages. La suppression retire votre profil, tous vos CV et votre historique de paiement, et n’est pas réversible — exportez vos documents d’abord. La demande est traitée à la main par notre équipe, qui vous confirme la suppression par e-mail.',
      },
    ],
    related: [
      {
        label: 'Tarifs',
        href: '/fr/tarifs',
        description: 'Le détail des trois offres.',
      },
      {
        label: 'Nous contacter',
        href: '/fr/contact',
        description: 'Pour tout ce qui n’est pas ci-dessus.',
      },
      {
        label: 'Politique de remboursement',
        href: '/fr/remboursement',
        description: 'Le texte complet, quatorze jours.',
      },
      {
        label: 'Confidentialité',
        href: '/fr/confidentialite',
        description: 'Ce que nous collectons, et ce que nous n’en faisons pas.',
      },
    ],
  },
};
