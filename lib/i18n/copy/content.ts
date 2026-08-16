import { TEMPLATE_CATEGORIES, TEMPLATE_COUNT } from '@/lib/cv/template-registry';
import type { Locale } from '../locales';
import type { Plan } from '@/lib/plans';
import type { TemplateCategory, TemplateDefinition } from '@/types/cv';
import type { PlanId } from '@/types/user';

/**
 * French and German for the content that lives in shared data modules.
 *
 * ## Why the English is not in here
 *
 * Template taglines, category blurbs and plan copy are written in `lib/cv/template-registry.ts`,
 * `lib/plans.ts` and the sixty-one template components, all of which the English-first
 * marketing site renders directly. Moving those strings into a locale table would mean the
 * marketing pages reading their own copy through a translation layer, and the SEO checker
 * comparing prose it no longer owns. So the registry keeps being the source of truth for
 * English and this file holds only the two languages it does not have.
 *
 * The consequence is the shape below: `Partial<Record<Locale, …>>` with no `en` key, and
 * resolvers that fall back to the original. A template added tomorrow with no entry here
 * renders its English tagline in a French dashboard — worse than a translation, far better
 * than a blank card, and it cannot break the English surfaces at all, because for `en`
 * every resolver returns the argument it was given.
 *
 * ## Why these are not literal translations
 *
 * A tagline describes a design in a clipped register — "a two-line name over a diagonal
 * accent wash". Rendered word by word that reads like a specification. They are written
 * instead the way a French or German designer would describe the same page, using the
 * vocabulary the marketing site already established in `app/fr/fr-template-copy.ts` and
 * `app/de/de-template-copy.ts` (`une colonne`, `bande latérale`, `einspaltig`,
 * `Seitenleiste`), so a visitor who reads both does not meet two names for one thing.
 * Length is held close to the English: these sit in a fixed-width card that wraps at two
 * lines, and a sentence half again as long silently becomes an ellipsis.
 */

/** The registry's own category record, so a field added there needs no change here. */
export type TemplateCategoryMeta = (typeof TEMPLATE_CATEGORIES)[number];

/*
 * French first, German typed from it.
 *
 * `Record<TranslatedSlug, string>` is what enforces the rule that neither language may run
 * ahead of the other: a slug translated into French and forgotten in German does not
 * compile, and neither does a German entry for a slug French has not reached. Keyed by
 * slug rather than id because the slug is the stable public name of a design — ids have
 * been renumbered before, slugs are in URLs and cannot be.
 */
const FR_TEMPLATE_TAGLINE = {
  'accountant-cv':
    'Les dates alignées à droite dans leur propre colonne, les certifications mises en avant.',
  'ats-cv':
    'Une colonne, un filet, une seule encre — au plus près de ce qu’attend un logiciel de tri.',
  'entry-level-resume':
    'Un rythme compact sur une page, où projets et bénévolat comptent comme de vraies expériences.',
  'ats-resume':
    'En-tête centré, titres soulignés d’un filet, rythme serré : calibré pour tenir sur une page.',
  'ats-simple-cv':
    'Une colonne sans ornement, avec une seule touche de couleur : les titres de rubrique.',
  'student-cv':
    'La formation s’affiche en plus grand sur un panneau teinté, où que vous la placiez.',

  'academic-cv':
    'Rubriques numérotées et publications en retrait négatif, prévu pour aller jusqu’à quatre pages.',
  'classic-professional-cv':
    'Capitales centrées et titres soulignés — la forme de CV attendue depuis des décennies.',
  'elegant-serif-cv':
    'Un portrait dans un double filet, au-dessus de titres centrés en petites capitales.',
  'europass-cv':
    'La mise en page standard européenne, avec une vraie grille d’autoévaluation CECRL.',
  'executive-classic-cv':
    'Le nom en tête, l’intitulé de poste en vis-à-vis, au-dessus d’un résumé en retrait.',
  'formal-cv':
    'Deux colonnes séparées par un simple filet — pas d’aplat, pas de teinte, pas de bande latérale.',
  'functional-cv':
    'Un CV par compétences, qui commence par ce que vous savez faire, pas par les dates.',
  'government-cv':
    'Chaque rubrique dans son propre cadre, les coordonnées présentées en champs étiquetés.',
  'legal-cv':
    'Texte justifié sous des titres centrés et soulignés — un CV qui se lit comme un mémoire.',
  'simple-classic-cv':
    'Titres en gras, texte simple, rien d’autre — la réponse sûre en cas de doute.',
  'timeless-cv':
    'Le nom à gauche, les coordonnées à droite, et une colonne de dates sur toute la hauteur.',
  'traditional-cv':
    'Les titres passent dans la marge de gauche : tout le contenu partage un même bord net.',

  'banking-cv':
    'Un bandeau bleu marine sur une division 68/32 — diplômes à droite, opérations à gauche.',
  'business-professional-cv':
    'Un en-tête en deux blocs sur un filet plein à l’accent, puis une colonne de texte sobre.',
  'consultant-cv':
    'Les intitulés passent dans une marge séparée par un filet, la colonne de texte reste continue.',
  'executive-cv': 'Un en-tête à double filet, au-dessus d’une colonne unique et formelle.',
  'finance-cv':
    'Un alignement de comptable : colonne de dates fixe, bandeaux de titre teintés, aucun graphique.',
  'hr-cv': 'Chaque rubrique est une carte encadrée, coiffée de son propre bandeau teinté.',
  'hybrid-cv':
    'Les compétences annoncées d’abord, puis le parcours chronologique complet derrière.',
  'manager-cv':
    'Une bande teintée à droite porte vos outils ; la large colonne de gauche raconte le parcours.',
  'marketing-cv': 'Un en-tête bicolore : panneau du nom teinté, panneau photo à l’accent plein.',
  'operations-cv':
    'Des carrés numérotés à l’accent transforment le document en suite d’étapes ordonnées.',
  'sales-cv': 'Trois résultats phares dans un bandeau sous votre nom, avant le parcours.',

  'art-director-cv':
    'Une double page de magazine : manchette sombre, photo à fond perdu, titres en marge.',
  'content-creator-cv':
    'Un en-tête de profil social : bannière en dégradé, photo en débord, intitulé façon pseudo.',
  'creative-ats-cv':
    'Un CV créatif qu’un logiciel de tri lit comme du texte brut — sans colonnes ni graphiques.',
  'creative-designer-cv':
    'Une bande latérale à l’accent pâle porte les détails, le nom occupe la colonne principale.',
  'creative-professional-cv':
    'Portrait, nom et coordonnées sur une seule ligne d’en-tête, puis une colonne sobre et lisible.',
  'editorial-cv':
    'Le nom en manchette, un résumé en chapô et deux colonnes — un CV composé comme un article.',
  'graphic-designer-cv': 'Un en-tête d’affiche au-dessus d’une grille de blocs sur deux colonnes.',
  'photographer-cv':
    'Un cadre de galerie en filet fin autour d’un document centré aux lettres espacées.',
  'portfolio-cv':
    'Vos projets prennent le grand corps et une grille de cartes teintées, le reste tient serré.',
  'ui-ux-designer-cv':
    'Un air de design system : en-tête en carte de composant, intitulés en pastilles.',
  'visual-resume':
    'Des barres de niveau, une colonne photo et un rail en dégradé sur toute la hauteur des pages.',

  'coloured-sidebar-cv':
    'Une bande latérale pleine hauteur, saturée à votre accent, le texte en réserve dessus.',
  'modern-ats':
    'Le membre à toute épreuve de la famille Modern : une colonne, un filet, aucun graphique.',
  'modern-clean':
    'Un filet vertical à repères colorés enchaîne les rubriques en une lecture continue.',
  'modern-compact':
    'Deux colonnes utiles et des espacements resserrés pour tenir une longue carrière sur une page.',
  'modern-corporate':
    'Un bandeau sombre sur un corps divisé par un filet — de la structure sans bande colorée.',
  'modern-creative':
    'Un nom sur deux lignes au-dessus d’un aplat diagonal, puis des rubriques numérotées.',
  'modern-elegant':
    'Un en-tête centré entre deux filets, avec des titres de rubrique encadrés de filets.',
  'modern-executive':
    'Une bande latérale sombre pleine hauteur écarte les coordonnées du fil de votre parcours.',
  'modern-minimal': 'Ni filets, ni cadres, ni icônes — la hiérarchie tient entièrement à l’espace.',
  'modern-professional':
    'Un bandeau d’en-tête teinté sur une colonne unique et nette — le choix moderne le plus sûr.',
  // `key: value` is a code notation, so it keeps its English spacing rather than the
  // French space before a colon, which would read as prose and stop looking like code.
  'modern-tech':
    'Une carte d’en-tête encadrée, des coordonnées façon key: value et des rubriques en //.',

  'ai-engineer-cv':
    'Un rail en dégradé au bord de la page, recherche et réalisations traitées à égalité.',
  'cybersecurity-cv':
    'Bannière sombre et coordonnées à chasse fixe, au-dessus d’une bande latérale de certifications.',
  'data-scientist-cv':
    'Titres entre crochets, dates en gouttière et barres de niveau — un CV en forme de notebook.',
  'devops-cv':
    'Un rail façon pipeline sur toute la page, avec un nœud par étape de votre carrière.',
  'developer-cv':
    'Un encadré latéral teinté à côté de l’expérience — de la structure sans bande de couleur.',
  'full-stack-developer-cv':
    'Votre stack en bandeau haut, puis les postes à gauche et les projets à droite.',
  'it-professional-cv':
    'Mise en page d’entreprise classique, avec un bandeau de coordonnées pleine largeur.',
  'product-manager-cv':
    'Trois résultats phares dans une rangée encadrée, avant d’arriver au parcours.',
  'software-engineer-cv':
    'Une colonne, des titres soulignés et une stack rédigée en toutes lettres — faite pour être relue.',
  'tech-minimal-cv':
    'Rien que la typographie et l’espace — aligné à gauche, serré, impossible à mal relire.',
};

type TranslatedSlug = keyof typeof FR_TEMPLATE_TAGLINE;

const DE_TEMPLATE_TAGLINE: Record<TranslatedSlug, string> = {
  'accountant-cv':
    'Daten rechtsbündig in einer eigenen Spalte, Zertifikate mit sichtbarem Gewicht.',
  'ats-cv': 'Eine Spalte, eine Linie, eine Farbe — so wörtlich, wie eine Bewerbersoftware es will.',
  'entry-level-resume':
    'Kompakter Einseiter, der Projekte und Ehrenamt als echte Erfahrung behandelt.',
  'ats-resume':
    'Zentrierter Kopf, unterstrichene Überschriften, enger Satz — gebaut für eine Seite.',
  'ats-simple-cv':
    'Schmucklos einspaltig, mit genau einer farbigen Stelle: den Abschnittsüberschriften.',
  'student-cv':
    'Die Ausbildung steht größer auf einem zart getönten Feld, wo immer Sie sie platzieren.',

  'academic-cv':
    'Nummerierte Abschnitte, Publikationen im hängenden Einzug — ausgelegt auf vier Seiten.',
  'classic-professional-cv':
    'Zentrierte Versalien, unterstrichene Überschriften — die seit Jahrzehnten erwartete Form.',
  'elegant-serif-cv':
    'Ein Porträt in doppelter Haarlinie, darunter zentrierte Überschriften in Kapitälchen.',
  'europass-cv': 'Das europäische Standardlayout, mit einer echten GER-Selbsteinschätzungstabelle.',
  'executive-classic-cv':
    'Der Name im Kopf, die Berufsbezeichnung gegenüber, darunter ein eingerücktes Profil.',
  'formal-cv':
    'Zwei Spalten, getrennt von einer einzigen Linie — ohne Flächen, Töne oder Seitenleiste.',
  'functional-cv':
    'Ein kompetenzorientierter Lebenslauf: zuerst, was Sie können, dann erst die Daten.',
  'government-cv':
    'Jeder Abschnitt in einem eigenen Rahmen, die Kontaktdaten als beschriftete Felder.',
  'legal-cv':
    'Blocksatz unter zentrierten, unterstrichenen Überschriften — liest sich wie ein Schriftsatz.',
  'simple-classic-cv':
    'Fette Überschriften, schlichter Text, sonst nichts — die sichere Antwort im Zweifel.',
  'timeless-cv': 'Name links, Kontakt rechts, und eine Datumsspalte über die ganze Seitenhöhe.',
  'traditional-cv':
    'Die Überschriften stehen im linken Rand, der Inhalt bekommt eine einzige saubere Kante.',

  'banking-cv':
    'Ein marineblauer Kopf über einer 68/32-Teilung — Qualifikationen rechts, Transaktionen links.',
  'business-professional-cv':
    'Ein geteilter Kopf über einer kräftigen Akzentlinie, darunter schlichter einspaltiger Text.',
  'consultant-cv':
    'Die Abschnittstitel stehen in einem abgesetzten linken Rand, die Textspalte läuft durch.',
  'executive-cv': 'Ein Briefkopf mit doppelter Linie über einer förmlichen einzelnen Spalte.',
  'finance-cv':
    'Ausrichtung wie im Kontobuch: feste Datumsspalte, getönte Titelbänder, keine Grafik.',
  'hr-cv': 'Jeder Abschnitt ist eine umrandete Karte mit eigenem getöntem Titelstreifen.',
  'hybrid-cv': 'Zuerst die Kompetenzen, dahinter der vollständige chronologische Werdegang.',
  'manager-cv':
    'Ein getöntes Band rechts trägt Ihr Werkzeug, die breite Spalte links den Werdegang.',
  'marketing-cv':
    'Ein zweifarbiger Kopf: getöntes Namensfeld neben einem Fotofeld in voller Akzentfarbe.',
  'operations-cv':
    'Nummerierte Akzentquadrate machen das Dokument zu einer geordneten Folge von Schritten.',
  'sales-cv': 'Drei Spitzenergebnisse in einem Streifen unter dem Namen, noch vor dem Werdegang.',

  'art-director-cv': 'Ein Magazinlayout: dunkler Titelkopf, randabfallendes Foto, Titel im Rand.',
  'content-creator-cv':
    'Ein Social-Media-Kopf: Verlaufsbanner, überlappendes Profilbild, Titel wie ein Handle.',
  'creative-ats-cv':
    'Ein kreativer Lebenslauf, den die Software als reinen Text liest — keine Spalten, keine Grafik.',
  'creative-designer-cv':
    'Eine blasse Seitenleiste in Akzentfarbe trägt die Details, der Name die Hauptspalte.',
  'creative-professional-cv':
    'Porträt, Name und Kontakt in einer Kopfzeile, darunter eine schlichte, lesbare Spalte.',
  'editorial-cv':
    'Name als Zeitungskopf, Profil als Vorspann, zwei Textspalten — gesetzt wie eine Reportage.',
  'graphic-designer-cv': 'Ein Plakatkopf über einem zweispaltigen Raster aus Abschnittsblöcken.',
  'photographer-cv':
    'Ein Haarlinienrahmen wie im Ausstellungsraum um ein zentriertes, gesperrtes Dokument.',
  'portfolio-cv':
    'Projekte groß gesetzt in einem getönten Kartenraster, alles andere bleibt kompakt.',
  'ui-ux-designer-cv':
    'Der Look eines Designsystems: Kopf als Komponentenkarte, Abschnittstitel als Chips.',
  'visual-resume':
    'Niveaubalken, eine Fotospalte und eine Verlaufsschiene über die volle Höhe jeder Seite.',

  'coloured-sidebar-cv':
    'Eine durchgehende Seitenleiste in kräftiger Akzentfarbe, die Schrift negativ darauf.',
  'modern-ats': 'Das ATS-feste Mitglied der Modern-Familie: eine Spalte, eine Linie, keine Grafik.',
  'modern-clean':
    'Eine Haarlinie mit Akzentmarken reiht alle Abschnitte zu einem durchgehenden Lesefluss.',
  'modern-compact':
    'Zwei Arbeitsspalten und engere Abstände, damit ein langer Werdegang auf eine Seite passt.',
  'modern-corporate':
    'Ein dunkler Kopf über einem von einer Haarlinie geteilten Satz — Struktur ohne Farbleiste.',
  'modern-creative':
    'Ein zweizeiliger Name über einer diagonalen Akzentfläche, darunter nummerierte Abschnitte.',
  'modern-elegant':
    'Ein zentrierter Kopf zwischen Doppellinien, die Abschnittstitel von Linien flankiert.',
  'modern-executive':
    'Eine durchgehende dunkle Seitenleiste hält die Kontaktdaten aus dem Werdegang heraus.',
  'modern-minimal':
    'Keine Linien, keine Kästen, keine Icons — die Hierarchie trägt allein der Weißraum.',
  'modern-professional':
    'Ein getöntes Kopfband über einer klaren einzelnen Spalte — die sicherste moderne Wahl.',
  'modern-tech':
    'Eine umrandete Kopfkarte mit Kontaktzeilen als key: value und // vor Abschnitten.',

  'ai-engineer-cv':
    'Eine Verlaufsschiene am Seitenrand, Forschung und ausgelieferte Arbeit gleichrangig.',
  'cybersecurity-cv':
    'Dunkles Banner und Kontaktblock in Monospace über einer Seitenleiste voller Zertifikate.',
  'data-scientist-cv':
    'Überschriften in Klammern, Daten am Rand, Skill-Balken — ein Lebenslauf wie ein Notebook.',
  'devops-cv':
    'Eine Pipeline-Schiene über die Seite, mit einem Knoten für jede Station Ihres Wegs.',
  'developer-cv':
    'Ein getönter, umrandeter Seitenkasten neben dem Werdegang — Struktur ohne Farbband.',
  'full-stack-developer-cv':
    'Ihr Stack quer oben, darunter die Stationen links und die Projekte rechts.',
  'it-professional-cv':
    'Ein konventionelles Business-Layout mit einem randlosen Kontaktstreifen unter dem Kopf.',
  'product-manager-cv':
    'Drei Kernergebnisse in einer umrandeten Reihe, bevor der Werdegang beginnt.',
  'software-engineer-cv':
    'Eine Spalte, unterstrichene Überschriften, der Stack als Fließtext — zum Auslesen gebaut.',
  'tech-minimal-cv':
    'Nur Schrift und Weißraum — linksbündig, eng gesetzt, für die Software nicht misszuverstehen.',
};

export const TEMPLATE_TAGLINE: Partial<Record<Locale, Record<string, string>>> = {
  fr: FR_TEMPLATE_TAGLINE,
  de: DE_TEMPLATE_TAGLINE,
};

/*
 * The category blurbs say the same thing as the ledes on `/fr/modeles-de-cv/…` and
 * `/de/lebenslauf-vorlagen/…`, in the same words. That is deliberate rather than copied by
 * accident: the gallery in the app and the category page on the site describe one set of
 * designs, and a visitor who reads both should not have to work out whether two different
 * sentences mean two different things.
 */
export const CATEGORY_BLURB: Partial<Record<Locale, Record<TemplateCategory, string>>> = {
  fr: {
    modern:
      'Des mises en page contemporaines, beaucoup d’espace et une seule couleur d’accentuation. Le point de départ le plus sûr quand vous ne savez pas exactement ce que votre secteur attend.',
    corporate:
      'Structurés et sobres, pour la finance, le conseil, le management et tous les environnements où un CV est jugé sur sa rigueur avant sa personnalité.',
    creative:
      'Des mises en page expressives pour le design, la direction artistique, la photographie et les métiers du contenu — là où le document est lui-même un échantillon de votre travail.',
    technology:
      'Des modèles pensés pour les métiers techniques : de la place pour votre stack, vos projets et vos contributions open source, sans transformer le CV en liste de mots-clés.',
    classic:
      'Des formats traditionnels, souvent en typographie à empattements, pour la recherche, le droit, la fonction publique et tout employeur qui attend encore un document conventionnel.',
    ats: 'Des mises en page épurées sur une seule colonne, conçues pour être relues correctement par les logiciels de suivi des candidatures : aucune colonne parasite, aucun graphique, aucune surprise.',
  },
  de: {
    modern:
      'Zeitgemäße Layouts mit viel Weißraum und einer einzigen Akzentfarbe. Der sicherste Ausgangspunkt, wenn Sie nicht genau wissen, was Ihre Branche erwartet.',
    corporate:
      'Strukturiert und zurückhaltend, für Finanzwesen, Beratung, Management und alle Bereiche, in denen ein Lebenslauf zuerst an seiner Sorgfalt gemessen wird.',
    creative:
      'Ausdrucksstarke Layouts für Design, Art Direction, Fotografie und Content — dort, wo das Dokument selbst eine Arbeitsprobe ist.',
    technology:
      'Für technische Berufe gebaute Vorlagen: Platz für Ihren Stack, Ihre Projekte und Open-Source-Beiträge, ohne dass der Lebenslauf zur Stichwortliste wird.',
    classic:
      'Traditionelle Formate, meist mit Serifenschrift, für Wissenschaft, Recht, den öffentlichen Dienst und jeden Arbeitgeber, der noch ein konventionelles Dokument erwartet.',
    ats: 'Reduzierte, einspaltige Layouts, gebaut dafür, von Bewerbermanagement-Systemen korrekt gelesen zu werden: keine zweite Spalte, keine Grafiken, keine Überraschungen.',
  },
};

export const PLAN_TAGLINE: Partial<Record<Locale, Record<PlanId, string>>> = {
  fr: {
    free: 'Tout ce qu’il faut pour écrire un bon CV.',
    pro: 'Pour une recherche active.',
    lifetime: 'Un paiement, et c’est à vous pour toutes vos candidatures.',
  },
  de: {
    free: 'Alles, was Sie für einen guten Lebenslauf brauchen.',
    pro: 'Für eine laufende Bewerbungsphase.',
    lifetime: 'Einmal zahlen — und für jede künftige Bewerbung behalten.',
  },
};

/*
 * Every number here says what the English says, by the same means the English says it.
 *
 * `PLANS.pro` interpolates `TEMPLATE_COUNT`, so these do too — a French list reading "les
 * 61 modèles" as a literal would be wrong the day the sixty-second template lands, and
 * nothing would catch it, because it is prose. `PLANS.free` types its counts in by hand,
 * and these mirror that literal rather than correcting it: the free-plan figures are one
 * claim the product makes, and it must not be 16 in English and 20 in French.
 */
export const PLAN_HIGHLIGHTS: Partial<Record<Locale, Record<PlanId, string[]>>> = {
  fr: {
    free: [
      '16 modèles gratuits, dont cinq conçus pour les logiciels de suivi des candidatures',
      'Jusqu’à 2 CV enregistrés',
      '5 téléchargements PDF par mois',
      'Aperçu en direct et enregistrement automatique',
      'Couleur d’accentuation et format de page',
    ],
    pro: [
      `Les ${TEMPLATE_COUNT} modèles du catalogue`,
      'CV et téléchargements PDF illimités',
      'Personnalisation complète : polices, couleurs, espacements, rubriques',
      'Rubriques sur mesure et réorganisation',
      'Lien public partageable',
      'PDF sans mention CreateCVOnline',
    ],
    lifetime: [
      'Tout ce que contient Pro, définitivement',
      'Paiement unique, sans renouvellement',
      'Tous les modèles à venir inclus',
      'Assistance par e-mail prioritaire',
    ],
  },
  de: {
    free: [
      '16 kostenlose Vorlagen, davon fünf für Bewerbermanagement-Systeme gebaut',
      'Bis zu 2 gespeicherte Lebensläufe',
      '5 PDF-Downloads pro Monat',
      'Live-Vorschau und automatisches Speichern',
      'Akzentfarbe und Papierformat',
    ],
    pro: [
      `Alle ${TEMPLATE_COUNT} Vorlagen`,
      'Unbegrenzt Lebensläufe und PDF-Downloads',
      'Volle Gestaltung: Schriften, Farben, Abstände, Abschnitte',
      'Eigene Abschnitte und freie Reihenfolge',
      'Teilbarer öffentlicher Link',
      'PDF ohne CreateCVOnline-Hinweis',
    ],
    lifetime: [
      'Alles aus Pro, dauerhaft',
      'Einmalzahlung, keine Verlängerung',
      'Alle künftigen Vorlagen enthalten',
      'Bevorzugter E-Mail-Support',
    ],
  },
};

export function templateTagline(template: TemplateDefinition, locale: Locale): string {
  return TEMPLATE_TAGLINE[locale]?.[template.slug] ?? template.tagline;
}

export function categoryBlurb(category: TemplateCategoryMeta, locale: Locale): string {
  return CATEGORY_BLURB[locale]?.[category.id] ?? category.blurb;
}

/**
 * The paragraph under each plan's heading.
 *
 * Added after a screenshot showed the checkout card with a German heading, a German feature
 * list and this sentence in English between them — the tagline and the highlights had been
 * translated and the description had not, which reads worse than leaving the whole card in
 * one language would have.
 */
export const PLAN_DESCRIPTION: Partial<Record<Locale, Record<PlanId, string>>> = {
  fr: {
    free: 'Rédigez un CV complet dans l’éditeur, conservez-le dans votre compte et téléchargez-le en PDF. Sans période d’essai limitée et sans carte bancaire.',
    pro: 'Les 61 modèles, un nombre illimité de CV et de téléchargements : adaptez votre CV à chaque candidature au lieu d’envoyer partout le même document.',
    lifetime:
      'Tout Pro, en un seul paiement. Un CV ne s’écrit pas une fois pour toutes — on y revient tous les deux ou trois ans — et cela revient à moins de huit mois d’abonnement Pro.',
  },
  de: {
    free: 'Erstellen Sie im Editor einen vollständigen Lebenslauf, behalten Sie ihn in Ihrem Konto und laden Sie ihn als PDF herunter. Ohne Testfrist und ohne Kreditkarte.',
    pro: 'Alle 61 Vorlagen, unbegrenzt viele Lebensläufe und Downloads — so passen Sie Ihren Lebenslauf jeder Bewerbung an, statt überall dasselbe Dokument zu verschicken.',
    lifetime:
      'Alles aus Pro, einmalig bezahlt. Ein Lebenslauf ist keine einmalige Anschaffung — die meisten kommen alle zwei bis drei Jahre zurück — und das kostet weniger als acht Monate Pro.',
  },
};

/** The plan's description in `locale`, falling back to the English in `lib/plans.ts`. */
export function planDescription(plan: Plan, locale: Locale): string {
  return PLAN_DESCRIPTION[locale]?.[plan.id] ?? plan.description;
}

export function planTagline(plan: Plan, locale: Locale): string {
  return PLAN_TAGLINE[locale]?.[plan.id] ?? plan.tagline;
}

export function planHighlights(plan: Plan, locale: Locale): string[] {
  return PLAN_HIGHLIGHTS[locale]?.[plan.id] ?? plan.highlights;
}
