import type { Locale } from './locales';

/**
 * Making the gallery search work in French and German.
 *
 * ## The bug this fixes
 *
 * Each template card carries a search haystack in `data-search`, built on the server from
 * the template's name, tagline, category and keywords — all of which are written in
 * English, because they are the registry's own metadata and the registry has one language.
 * So the search box on `/fr/modeles-de-cv` matched English words only. Typing `banque`,
 * `étudiant` or `minimaliste` returned nothing — and those were the three examples the
 * French placeholder itself suggested. The German box was the same: `Studium`,
 * `minimalistisch` and `kreativ` all returned nothing.
 *
 * ## Why a query-side map rather than a translated haystack
 *
 * The alternative is translating sixty-one templates' keyword lists into both languages and
 * emitting a per-locale haystack. That is a much larger surface to write and keep true, it
 * grows the HTML of every card on every localised page, and most of those keywords are
 * words nobody searches for. Mapping at query time instead keeps the rendered page
 * identical, costs a few hundred bytes in the client bundle, and puts the whole translation
 * in one file where it can be read end to end.
 *
 * The vocabulary below is not invented: it is the actual token set the registry produces
 * (`name`, `tagline`, `category`, `keywords` across all templates), translated. A French
 * word that maps to a token no template carries would be dead weight, so there are none.
 *
 * ## Matching, and why phrases stay whole
 *
 * A query is split into words and every word is expanded to itself plus its translations; a
 * card matches when *each* word has at least one variant present in its haystack, so extra
 * words narrow the result rather than widening it.
 *
 * Multi-word terms are the exception, and they have to be, because splitting them is
 * actively wrong. `two column` split into `two` AND `column` matches *Modern Creative* — a
 * one-column template whose tagline reads "a two-line name over a diagonal accent wash" and
 * whose card says "one column". Measured against the registry: seventeen templates are
 * two-column, and the split query returned twenty. So a query the table recognises as a
 * phrase is looked up whole and matched as a contiguous substring, and any translation that
 * is itself a phrase is matched the same way.
 */

/**
 * French query word → the English tokens it should match.
 *
 * Accented and unaccented spellings are both listed as keys: people type `etudiant` as
 * often as `étudiant`, and a search box that punishes a missing accent is a broken one.
 * Plurals are listed where the singular is not a prefix of them.
 */
const FR_TERMS: Record<string, string[]> = {
  // Style and layout
  moderne: ['modern'],
  modernes: ['modern'],
  classique: ['classic', 'traditional'],
  classiques: ['classic', 'traditional'],
  créatif: ['creative'],
  creatif: ['creative'],
  créative: ['creative'],
  creative: ['creative'],
  créatifs: ['creative'],
  entreprise: ['corporate', 'business'],
  professionnel: ['professional'],
  professionnelle: ['professional'],
  simple: ['simple', 'plain'],
  sobre: ['plain', 'clean', 'minimal'],
  épuré: ['clean', 'minimal'],
  epure: ['clean', 'minimal'],
  minimaliste: ['minimalist', 'minimal'],
  élégant: ['elegant'],
  elegant: ['elegant'],
  élégante: ['elegant'],
  formel: ['formal'],
  formelle: ['formal'],
  traditionnel: ['traditional'],
  traditionnelle: ['traditional'],
  compact: ['compact'],
  compacte: ['compact'],
  colonne: ['column'],
  colonnes: ['column'],
  une: ['one'],
  deux: ['two'],
  page: ['page'],
  photo: ['photo'],
  latérale: ['sidebar'],
  laterale: ['sidebar'],
  bandeau: ['sidebar'],
  couleur: ['coloured'],
  coloré: ['coloured'],
  colore: ['coloured'],
  éditorial: ['editorial'],
  editorial: ['editorial'],
  magazine: ['magazine'],
  portfolio: ['portfolio'],
  visuel: ['visual'],
  visuelle: ['visual'],
  fonctionnel: ['functional'],
  fonctionnelle: ['functional'],
  europass: ['europass'],
  académique: ['academic'],
  academique: ['academic'],
  universitaire: ['academic'],

  // Roles and sectors
  banque: ['banking', 'finance'],
  bancaire: ['banking', 'finance'],
  finance: ['finance', 'banking'],
  comptable: ['accountant'],
  comptabilité: ['accountant'],
  comptabilite: ['accountant'],
  ingénieur: ['engineer'],
  ingenieur: ['engineer'],
  développeur: ['developer'],
  developpeur: ['developer'],
  programmeur: ['programmer', 'developer'],
  informatique: ['technology', 'software', 'tech'],
  logiciel: ['software'],
  technologie: ['technology'],
  technique: ['tech', 'technology'],
  données: ['data'],
  donnees: ['data'],
  analyste: ['analyst'],
  sécurité: ['security'],
  securite: ['security'],
  scientifique: ['scientist', 'research'],
  recherche: ['research'],
  administrateur: ['administrator'],
  designer: ['designer', 'design'],
  graphiste: ['graphic', 'designer'],
  graphique: ['graphic'],
  photographe: ['photographer'],
  artistique: ['art', 'creative'],
  contenu: ['content'],
  créateur: ['creator', 'content'],
  createur: ['creator', 'content'],
  rédacteur: ['content', 'editorial'],
  redacteur: ['content', 'editorial'],
  marketing: ['marketing'],
  commercial: ['sales'],
  commerciale: ['sales'],
  ventes: ['sales'],
  vente: ['sales'],
  conseil: ['consulting', 'consultant'],
  consultant: ['consultant', 'consulting'],
  gestion: ['management', 'manager'],
  responsable: ['manager', 'management'],
  directeur: ['director', 'executive'],
  direction: ['executive', 'director'],
  cadre: ['executive', 'senior'],
  dirigeant: ['executive'],
  opérations: ['operations'],
  operations: ['operations'],
  produit: ['product'],
  juridique: ['legal'],
  droit: ['legal'],
  avocat: ['legal'],
  public: ['government'],
  gouvernement: ['government'],
  administration: ['government', 'administrator'],
  étudiant: ['student', 'entry'],
  etudiant: ['student', 'entry'],
  étudiante: ['student', 'entry'],
  débutant: ['entry', 'student'],
  debutant: ['entry', 'student'],
  stage: ['entry', 'student'],
  senior: ['senior', 'executive'],
  compétences: ['skills'],
  competences: ['skills'],
  expérience: ['experience'],
  experience: ['experience'],
  ressources: ['human resources'],
  humaines: ['human resources'],
};

/**
 * German query word → the English tokens it should match.
 *
 * German compounds are the reason this list is longer than it looks like it needs to be:
 * a user types `Personalwesen`, not `Personal Wesen`, so the compound has to be a key in
 * its own right. Matching is case-insensitive, so nouns are listed lower-cased.
 */
const DE_TERMS: Record<string, string[]> = {
  // Style and layout
  lebenslauf: ['cv', 'resume'],
  vorlage: ['template'],
  vorlagen: ['template'],
  modern: ['modern'],
  klassisch: ['classic', 'traditional'],
  klassische: ['classic', 'traditional'],
  kreativ: ['creative'],
  kreative: ['creative'],
  unternehmen: ['corporate', 'business'],
  professionell: ['professional'],
  professionelle: ['professional'],
  einfach: ['simple', 'plain'],
  schlicht: ['plain', 'simple'],
  schlichte: ['plain', 'simple'],
  sauber: ['clean'],
  minimalistisch: ['minimalist', 'minimal'],
  minimalistische: ['minimalist', 'minimal'],
  elegant: ['elegant'],
  elegante: ['elegant'],
  formell: ['formal'],
  formelle: ['formal'],
  traditionell: ['traditional'],
  traditionelle: ['traditional'],
  kompakt: ['compact'],
  kompakte: ['compact'],
  spalte: ['column'],
  spalten: ['column'],
  spaltig: ['column'],
  einspaltig: ['one column'],
  zweispaltig: ['two columns'],
  eine: ['one'],
  zwei: ['two'],
  seite: ['page'],
  foto: ['photo'],
  seitenleiste: ['sidebar'],
  farbig: ['coloured'],
  farbe: ['coloured'],
  redaktionell: ['editorial'],
  magazin: ['magazine'],
  portfolio: ['portfolio'],
  visuell: ['visual'],
  funktional: ['functional'],
  europass: ['europass'],
  akademisch: ['academic'],
  akademische: ['academic'],
  wissenschaftlich: ['academic', 'research'],

  // Roles and sectors
  bank: ['banking', 'finance'],
  banken: ['banking', 'finance'],
  finanzen: ['finance', 'banking'],
  buchhalter: ['accountant'],
  buchhaltung: ['accountant'],
  ingenieur: ['engineer'],
  entwickler: ['developer'],
  programmierer: ['programmer', 'developer'],
  informatik: ['technology', 'software', 'tech'],
  technik: ['tech', 'technology'],
  technologie: ['technology'],
  daten: ['data'],
  analyst: ['analyst'],
  sicherheit: ['security'],
  wissenschaftler: ['scientist', 'research'],
  forschung: ['research'],
  administrator: ['administrator'],
  designer: ['designer', 'design'],
  grafik: ['graphic'],
  grafiker: ['graphic', 'designer'],
  fotograf: ['photographer'],
  kunst: ['art', 'creative'],
  inhalt: ['content'],
  inhalte: ['content'],
  redakteur: ['content', 'editorial'],
  vertrieb: ['sales'],
  verkauf: ['sales'],
  beratung: ['consulting', 'consultant'],
  berater: ['consultant', 'consulting'],
  leitung: ['management', 'manager'],
  verwaltung: ['management', 'administrator'],
  führungskraft: ['executive', 'manager'],
  fuehrungskraft: ['executive', 'manager'],
  geschäftsführer: ['executive', 'director'],
  geschaeftsfuehrer: ['executive', 'director'],
  betrieb: ['operations'],
  produkt: ['product'],
  recht: ['legal'],
  jurist: ['legal'],
  anwalt: ['legal'],
  behörde: ['government'],
  behoerde: ['government'],
  öffentlich: ['government'],
  oeffentlich: ['government'],
  student: ['student', 'entry'],
  studium: ['student', 'entry'],
  studentin: ['student', 'entry'],
  berufseinsteiger: ['entry', 'student'],
  einsteiger: ['entry', 'student'],
  praktikum: ['entry', 'student'],
  kenntnisse: ['skills'],
  fähigkeiten: ['skills'],
  faehigkeiten: ['skills'],
  erfahrung: ['experience'],
  personal: ['human resources'],
  personalwesen: ['human resources'],
};

const TERMS: Partial<Record<Locale, Record<string, string[]>>> = {
  fr: FR_TERMS,
  de: DE_TERMS,
};

/**
 * Whole queries that must not be split into words.
 *
 * These are the ones where the individual words appear all over the corpus but the phrase
 * means something specific. `two column` is the case that forced this: `two` occurs in
 * taglines like "a two-line name" and "a two-tone split header", and `column` is on every
 * card because the card itself says "one column" or "two columns" — so the split query
 * matched three one-column templates. Looked up whole and matched as a contiguous string,
 * it returns exactly the seventeen two-column templates the registry actually has.
 *
 * English is in the table too, for the same reason: this is about how the corpus reads, not
 * about translation.
 */
const PHRASES: Partial<Record<Locale, Record<string, string[]>>> = {
  en: {
    'one column': ['one column'],
    'single column': ['one column'],
    'two column': ['two columns'],
    'two columns': ['two columns'],
    'human resources': ['human resources'],
  },
  fr: {
    'une colonne': ['one column'],
    'deux colonnes': ['two columns'],
    'sur une colonne': ['one column'],
    'sur deux colonnes': ['two columns'],
    'ressources humaines': ['human resources'],
    'une seule colonne': ['one column'],
  },
  de: {
    /*
     * Both the compound and the English phrase, because the German card says
     * "Zweispaltig" as one word while the registry keywords say "two column". Listing only
     * the English form found a single template — the one whose keywords happen to spell it
     * out — rather than all seventeen.
     */
    'eine spalte': ['one column', 'einspaltig'],
    'einer spalte': ['one column', 'einspaltig'],
    'zwei spalten': ['two columns', 'zweispaltig'],
    'zwei spaltig': ['two columns', 'zweispaltig'],
  },
};

/**
 * The query, expanded into the groups of haystack strings that can satisfy it.
 *
 * Returns one group per unit of the query — normally per typed word, but a recognised
 * phrase is a single unit. A card matches when every group has at least one member present
 * in its haystack, so extra words narrow the result set, as a user expects.
 */
export function expandQuery(query: string, locale: Locale): string[][] {
  const normalised = query.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalised) return [];

  // A phrase is one unit. Checked against this locale and against English, because a
  // French visitor may well type an English phrase they saw in a job ad.
  const phrase = PHRASES[locale]?.[normalised] ?? PHRASES.en?.[normalised];
  if (phrase) return [[normalised, ...phrase]];

  const table = TERMS[locale];
  return normalised.split(' ').map((word) => {
    const synonyms = table?.[word];
    return synonyms ? [word, ...synonyms] : [word];
  });
}
