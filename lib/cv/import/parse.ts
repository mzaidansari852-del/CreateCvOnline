import { LOCALES, type Locale } from '@/lib/i18n/locales';
import { defaultSectionLabels } from '@/lib/i18n/cv-labels';
import {
  BUILT_IN_SECTION_IDS,
  type BuiltInSectionId,
  type CVData,
  type LanguageLevel,
} from '@/types/cv';

/**
 * Reading a CV that was written somewhere else.
 *
 * ## What this is honest about
 *
 * A PDF is positioned glyphs. "This line is a job title" is not information the file holds,
 * so every rule below is an inference, and inference on other people's documents is wrong a
 * useful fraction of the time. The design consequence runs through the whole feature: this
 * returns a *draft* and a report of what it did and did not find, and the caller is required
 * to show both to the user before anything is saved.
 *
 * That is not politeness. An importer that silently merges two jobs, or reads `2019–2021` as
 * a single year, produces a plausible CV with a false employment history in it — and the
 * person who notices is a recruiter, months later. Refusing to save without review is the
 * feature, not a limitation of it.
 *
 * ## Why the headings come from `cv-labels`
 *
 * The site already knows what "Work Experience" is called in four languages, because it
 * prints those headings on every CV it renders. Reusing that table means an imported French
 * CV finds `Expérience professionnelle` for free, and — more usefully — that adding a fifth
 * language teaches the importer that language at the same time it teaches the renderer.
 * The alternative was a second list of the same strings, which is the drift this codebase
 * has been bitten by before.
 */

export interface ParseReport {
  /** Section ids we populated with at least one item. */
  found: BuiltInSectionId[];
  /** Sections whose heading we saw but could not read anything useful out of. */
  partial: BuiltInSectionId[];
  /** Personal fields we filled. */
  contact: string[];
  /** True when the text order looked scrambled — see `extract.ts`. */
  likelyMultiColumn: boolean;
}

export interface ParsedCv {
  data: Partial<CVData>;
  report: ParseReport;
}

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]{2,}/;
// Deliberately loose. Phone formats vary more than any regex worth maintaining, and a
// false positive here is a field the user clears in the review screen — a false negative
// is a field they have to retype.
const PHONE = /(?:\+?\d[\d\s().-]{7,}\d)/;
const LINKEDIN = /(?:https?:\/\/)?(?:[\w-]+\.)?linkedin\.com\/[^\s,)]+/i;
const GITHUB = /(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s,)]+/i;
const URL = /(?:https?:\/\/)?(?:www\.)[^\s,)]+|https?:\/\/[^\s,)]+/i;

/**
 * Month names in the four languages, for date ranges written out in words.
 *
 * Lower-cased and stripped of accents on both sides of the comparison, so `Février`,
 * `fevrier` and `FÉVRIER` all match. Only the first three letters are compared, which is
 * what makes `Jan`/`Januar`/`januari`/`janvier` one entry instead of four.
 */
const MONTH_NAMES: string[][] = [
  ['jan', 'january', 'janvier', 'januar', 'januari'],
  ['feb', 'february', 'février', 'februar', 'februari'],
  ['mar', 'march', 'mars', 'märz', 'maart'],
  ['apr', 'april', 'avril'],
  ['may', 'mai', 'mei'],
  ['jun', 'june', 'juin', 'juni'],
  ['jul', 'july', 'juillet', 'juli'],
  ['aug', 'august', 'août', 'augustus'],
  ['sep', 'september', 'septembre'],
  ['oct', 'october', 'octobre', 'oktober'],
  ['nov', 'november', 'novembre'],
  ['dec', 'december', 'décembre', 'dezember'],
];

const MONTHS: Record<string, number> = {};
for (const [index, names] of MONTH_NAMES.entries()) {
  for (const name of names) MONTHS[fold(name).slice(0, 3)] = index + 1;
}

/**
 * The month names themselves, longest first, for the date patterns below.
 *
 * Longest first because alternation is ordered: with `jan` ahead of `january`, the pattern
 * matches three letters and leaves `uary` behind. Abbreviations are added alongside the full
 * names so `Sept 2019` and `septembre 2019` both work.
 */
const MONTH_ALT = Array.from(
  new Set(MONTH_NAMES.flat().flatMap((name) => [name, name.slice(0, 3), name.slice(0, 4)])),
)
  .sort((a, b) => b.length - a.length)
  .join('|');

/** Lower-case and strip diacritics, so heading matching survives `Formation` vs `FORMATION`. */
function fold(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/**
 * Words that mean "still there", in the four languages.
 *
 * `Present`, `aujourd'hui`, `heute` and `heden` are what the renderer prints for an open
 * end date, so a CV exported from this site round-trips. The rest are what other tools write.
 */
const CURRENT_WORDS = [
  'present',
  'current',
  'now',
  'today',
  "aujourd'hui",
  'aujourdhui',
  'actuel',
  'en cours',
  'heute',
  'laufend',
  'aktuell',
  'heden',
  'nu',
];

/** `2019`, `06/2019`, `June 2019`, `2019-06` → `2019-06`. Year alone → `2019`. */
function normaliseDate(raw: string): string {
  const value = fold(raw);
  if (!value) return '';
  if (CURRENT_WORDS.some((word) => value.includes(word))) return '';

  const iso = value.match(/(\d{4})[-/](\d{1,2})/);
  if (iso) return `${iso[1]}-${String(Number(iso[2])).padStart(2, '0')}`;

  const slash = value.match(/(\d{1,2})[-/](\d{4})/);
  if (slash) return `${slash[2]}-${String(Number(slash[1])).padStart(2, '0')}`;

  const named = value.match(/(\p{L}{3,})\.?\s+(\d{4})/u);
  if (named) {
    const month = MONTHS[fold(named[1]!).slice(0, 3)];
    if (month) return `${named[2]}-${String(month).padStart(2, '0')}`;
  }

  const year = value.match(/\b(19|20)\d{2}\b/);
  return year ? year[0] : '';
}

/** The `2019 – 2021`, `Jan 2019 - Present` shapes, wherever they sit on the line. */
/*
 * `\w` is ASCII-only in JavaScript, so an earlier version of this pattern matched
 * `December 2019` and silently failed on `décembre 2019` — which meant French and German
 * CVs came out with one merged job instead of three. `\p{L}` with the `u` flag is the fix,
 * and it is the kind of bug that only a fixture in another language ever catches.
 */
/*
 * Only real month names, never "any word".
 *
 * This was `\p{L}{3,}`, which matched whatever word happened to precede a date — so
 * `Master …, Cigma 09/2023 - 07/2024` had `Cigma` swallowed as the month and the school
 * vanished from the qualification. Any CV that writes `Company Name 2019 - 2021` on one line
 * lost its employer the same way, silently, with the rest of the entry looking correct.
 */
const MONTH_WORD = String.raw`(?:(?:${MONTH_ALT})\.?\s+)?`;
const DATE = String.raw`(?:\d{1,2}[-/])?\d{4}`;
const CURRENT = String.raw`present|current|now|aujourd'?hui|heute|heden|actuel|aktuell|laufend`;
/*
 * Assembled with `String.raw` throughout, which is not fussiness.
 *
 * Written as a plain template literal, `\d` is not a recognised escape and JavaScript
 * silently drops the backslash — so the pattern compiled to one matching the *letter* `d`
 * and every date in every language stopped parsing. It failed quietly and produced a CV
 * with one merged job in it, which is precisely the failure mode this whole module is
 * built to avoid.
 */
const RANGE = new RegExp(
  String.raw`(${MONTH_WORD}${DATE})\s*(?:[-–—]|to|à|au|bis|tot|jusqu'?(?:au|à)|until)\s*(${MONTH_WORD}${DATE}|${CURRENT})`,
  'iu',
);

/**
 * An open-ended date with no separator: `Depuis mars 2021`, `Since 2019`, `Seit 2020`.
 *
 * These have no dash, so `RANGE` cannot see them — and a job the date scan cannot see is not
 * a missing date, it is a *missing job*: `splitEntries` anchors on dates, so an unanchored
 * current role gets absorbed into the entry above it. A French CV whose present job was
 * written `Depuis janvier 2021` came back with one merged entry covering everything.
 *
 * Anchored to the start of the line on purpose. Mid-sentence `since 2019` appears in
 * descriptions — "responsible for the programme since 2019" — and treating that as an entry
 * boundary would split a job in half at its own summary.
 */
const OPEN_RANGE = new RegExp(
  String.raw`^(?:depuis|since|seit|sinds|desde|van)\s+(${MONTH_WORD}${DATE})\b`,
  'iu',
);

function parseRange(line: string): { start: string; end: string; current: boolean } | null {
  const match = line.match(RANGE);
  if (match) {
    const endRaw = match[2] ?? '';
    const current = CURRENT_WORDS.some((word) => fold(endRaw).includes(word));
    return {
      start: normaliseDate(match[1] ?? ''),
      end: current ? '' : normaliseDate(endRaw),
      current,
    };
  }

  const open = line.match(OPEN_RANGE);
  if (open) return { start: normaliseDate(open[1] ?? ''), end: '', current: true };

  return null;
}

/**
 * Every heading that maps onto a built-in section, in every language, plus the ones people
 * actually write that no renderer produces.
 *
 * The extras matter more than they look. `defaultSectionLabels` gives the headings this site
 * prints; a CV built in Word says `Work History`, `Employment`, `Berufliche Laufbahn` or
 * `Technical Skills`, and a table containing only our own vocabulary would read our own
 * exports perfectly and other people's not at all — which is exactly backwards, since ours
 * arrive as JSON anyway.
 */
function buildHeadingIndex(): Map<string, BuiltInSectionId> {
  const index = new Map<string, BuiltInSectionId>();
  const add = (heading: string, id: BuiltInSectionId) => {
    const key = fold(heading);
    if (key) index.set(key, id);
  };

  for (const locale of LOCALES) {
    const labels = defaultSectionLabels(locale);
    for (const id of BUILT_IN_SECTION_IDS) add(labels[id], id);
  }

  const extras: [string, BuiltInSectionId][] = [
    ['work history', 'experience'],
    ['employment', 'experience'],
    ['employment history', 'experience'],
    ['professional experience', 'experience'],
    ['career history', 'experience'],
    ['expérience', 'experience'],
    ['expériences professionnelles', 'experience'],
    ['parcours professionnel', 'experience'],
    ['berufliche laufbahn', 'experience'],
    ['beruflicher werdegang', 'experience'],
    ['werkervaring', 'experience'],
    ['loopbaan', 'experience'],
    ['education and training', 'education'],
    ['academic background', 'education'],
    ['formation initiale', 'education'],
    ['études', 'education'],
    ['schulbildung', 'education'],
    ['studium', 'education'],
    ['opleidingen', 'education'],
    ['technical skills', 'skills'],
    ['core skills', 'skills'],
    ['key skills', 'skills'],
    ['competencies', 'skills'],
    ['compétences techniques', 'skills'],
    ['fähigkeiten', 'skills'],
    ['edv-kenntnisse', 'skills'],
    ['vaardigheden', 'skills'],
    ['profile', 'summary'],
    ['about me', 'summary'],
    ['personal statement', 'summary'],
    ['objective', 'summary'],
    ['à propos', 'summary'],
    ['profil professionnel', 'summary'],
    ['kurzprofil', 'summary'],
    ['über mich', 'summary'],
    ['over mij', 'summary'],
    ['persoonlijk profiel', 'summary'],
    ['langues', 'languages'],
    // A real CV said `COMPÉTENCES LINGUISTIQUES`, which matched no heading — so Arabic,
    // French and English were swept into the skills list as though they were software.
    ['compétences linguistiques', 'languages'],
    ['langues parlées', 'languages'],
    ['sprachkenntnisse', 'languages'],
    ['sprachen', 'languages'],
    ['talenkennis', 'languages'],
    ['talen', 'languages'],
    ['interests', 'interests'],
    ['hobbies', 'interests'],
    ["centre d'intérêt", 'interests'],
    ["centres d'intérêt", 'interests'],
    ['loisirs', 'interests'],
    ['interessen', 'interests'],
    ["hobby's", 'interests'],
    ['interesses', 'interests'],
  ];
  for (const [heading, id] of extras) add(heading, id);
  return index;
}

const HEADINGS = buildHeadingIndex();

/**
 * Is this line a section heading?
 *
 * Length is the first filter and does most of the work: a heading is a few words on its own
 * line, so anything past 40 characters is a sentence that happens to begin with the word
 * "Education". The trailing colon is stripped because `Skills:` and `Skills` are the same
 * heading, and a lone bullet glyph is stripped for the same reason.
 */
/**
 * The single words that identify a section even when they are qualified.
 *
 * Real CVs write `DELIVERY EXPERIENCE`, `PROFESSIONAL PROFILE`, `TECHNICAL SKILLS` and
 * `KEY ACHIEVEMENTS` — a known heading with an adjective bolted on. Exact matching found
 * none of them, which was invisible until a real PDF went through: the section simply did
 * not exist as far as the parser was concerned, and everything under it was silently
 * dropped into whatever block came before.
 *
 * Only checked on lines already established to be heading-shaped — short, standalone, not a
 * bullet — so `experience` inside a sentence cannot trigger it.
 */
const HEADING_WORDS: [string, BuiltInSectionId][] = [
  ['experience', 'experience'],
  ['employment', 'experience'],
  ['werdegang', 'experience'],
  ['laufbahn', 'experience'],
  ['werkervaring', 'experience'],
  ['education', 'education'],
  ['formation', 'education'],
  ['ausbildung', 'education'],
  ['opleiding', 'education'],
  ['skills', 'skills'],
  ['competences', 'skills'],
  ['kenntnisse', 'skills'],
  ['vaardigheden', 'skills'],
  ['languages', 'languages'],
  ['langues', 'languages'],
  ['sprachen', 'languages'],
  ['talen', 'languages'],
  ['profile', 'summary'],
  ['profil', 'summary'],
  ['profiel', 'summary'],
  ['summary', 'summary'],
];

function headingFor(line: string): BuiltInSectionId | null {
  const cleaned = line
    .replace(/^[•·▪◦\-–—*]\s*/, '')
    .replace(/[:：]\s*$/, '')
    .trim();
  if (!cleaned || cleaned.length > 40) return null;

  const folded = fold(cleaned);
  const exact = HEADINGS.get(folded);
  if (exact) return exact;

  // Qualified headings, but only when the line is genuinely a heading: at most four words,
  // and no sentence punctuation.
  const words = folded.split(/\s+/);
  if (words.length > 4 || /[.,;]/.test(folded)) return null;
  for (const [word, id] of HEADING_WORDS) {
    if (words.includes(word)) return id;
  }
  return null;
}

interface Block {
  /** `null` is a heading we recognise as one but do not model — its content is discarded. */
  id: BuiltInSectionId | 'header' | null;
  lines: string[];
}

/**
 * Is this an ALL-CAPS line, the way a CV section heading survives PDF extraction?
 *
 * Weight and size are lost when text is pulled out of a PDF, so they cannot identify a
 * heading. Capitalisation survives, and it is what most CVs use for section titles.
 *
 * Title Case is deliberately *not* accepted. `Senior Project Manager` and `Calder Industrial
 * Group` are title case too, and treating those as headings would cut every job in half. The
 * four-character floor and two-letter minimum stop an initialism like `PMI`, sitting in a
 * certifications list, from becoming a section boundary.
 */
function isAllCapsHeading(line: string, previous: string | undefined): boolean {
  if (line.length < 4 || line.length > 45) return false;
  if (/[a-z]/.test(line)) return false;
  if ((line.match(/\p{Lu}/gu) ?? []).length < 2) return false;

  /*
   * A location, not a heading.
   *
   * A CV that prints `11/2024 - present` and then `CASABLANCA` is giving the place, and
   * treating that as a section boundary discarded every job below it — four of five, on the
   * first real CV this met. Nothing about the line itself says otherwise; what says it is
   * the date directly above.
   */
  if (previous && parseRange(previous)) return false;

  /*
   * Two words minimum.
   *
   * Single-word all-caps lines are overwhelmingly places and employers — `CASABLANCA`,
   * `BTSCOM` — while the single-word headings that matter (`EDUCATION`, `FORMATION`,
   * `PROFILE`) are in the heading table already and never reach here. Missing an unknown
   * one-word heading costs a section absorbed into its neighbour, visible on the review
   * screen; guessing wrong costs the user their history, silently. The costs are not
   * symmetric, so neither is the rule.
   */
  return line.split(/\s+/).length >= 2;
}

/**
 * Is this line the tail of the bullet above it, broken by the column it was printed in?
 *
 * A narrow column wraps `• Coordination, Planification et Reporting de la / maintenance des
 * sites GSM.` across two lines, and a PDF records that break exactly like any other. Read
 * literally it becomes two skills, one of which is the fragment "Planification et Reporting
 * de la" — a real CV produced 34 skills that way, where it lists about fifteen.
 *
 * Two signals have to agree, because the cost of joining wrongly is a job title welded onto
 * the end of someone else's bullet point. The line above must be a bullet that did not
 * finish its sentence, *and* this line must either begin in lower case or continue a clause
 * the previous line left open with a comma. A new entry beginning `Coordinateur Du Projet…`
 * satisfies neither, so it stays where it is.
 */
function continuesPrevious(previous: string | undefined, line: string): boolean {
  if (!previous || !isBullet(previous) || isBullet(line)) return false;
  if (/[.!?]$/.test(previous)) return false;
  return /^\p{Ll}/u.test(line) || /,$/.test(previous);
}

/**
 * Splits the document into a header block and one block per heading.
 *
 * ## Why an unrecognised heading still breaks the block
 *
 * It did not, and the result was worse than losing a section. A CV ending
 * `… EDUCATION … SELECTED ACHIEVEMENTS …` has one heading this parser knows and one it does
 * not; appending the unknown section's lines to whatever block preceded them put a page of
 * achievement bullets inside `education`, which produced a qualification whose degree was
 * "Delivered a €2.4m ERP migration across four European sites". A user reviewing that sees
 * an importer inventing things, and stops trusting the parts that were right.
 *
 * Discarding is the honest outcome. The content belongs to a section this parser cannot
 * model, and it is better absent — where the review screen reports the section as unread —
 * than smuggled into a neighbour that then looks authoritative.
 */
function splitIntoBlocks(text: string): Block[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 0);

  const blocks: Block[] = [{ id: 'header', lines: [] }];
  for (const [index, line] of lines.entries()) {
    const heading = headingFor(line);
    if (heading) {
      blocks.push({ id: heading, lines: [] });
      continue;
    }
    if (isAllCapsHeading(line, lines[index - 1])) {
      blocks.push({ id: null, lines: [] });
      continue;
    }

    const current = blocks[blocks.length - 1]!.lines;
    if (continuesPrevious(current[current.length - 1], line)) {
      current[current.length - 1] = `${current[current.length - 1]} ${line}`;
      continue;
    }
    current.push(line);
  }
  return blocks;
}

const uid = () => Math.random().toString(36).slice(2, 10);

/** Contact details, which are the most reliable thing in any CV because they are patterns. */
function parseHeader(lines: string[]): { personal: CVData['personal']; filled: string[] } {
  const joined = lines.join('\n');
  const filled: string[] = [];

  const email = joined.match(EMAIL)?.[0] ?? '';
  const linkedin = joined.match(LINKEDIN)?.[0] ?? '';
  const github = joined.match(GITHUB)?.[0] ?? '';
  /*
   * Strip the e-mail and any URL out of the line before looking for a phone number, rather
   * than skipping lines that contain one.
   *
   * The header of a real CV is usually a single line — `nadia@example.com | +44 20 7946 0524
   * | London` — so skipping any line with an e-mail on it threw away the phone number on
   * most documents. Date ranges are still excluded, because `2019 - 2021` is nine digits and
   * separators, which is exactly what a phone number looks like to a regex.
   */
  const phoneLine = lines
    .map((line) => line.replace(EMAIL, ' ').replace(URL, ' '))
    .find((line) => !parseRange(line) && PHONE.test(line));
  const phone = phoneLine?.match(PHONE)?.[0]?.trim() ?? '';

  let website = '';
  const site = joined.match(URL)?.[0] ?? '';
  if (site && !LINKEDIN.test(site) && !GITHUB.test(site) && !site.includes('@')) website = site;

  /*
   * The name is the weakest inference here and is treated as such.
   *
   * It is the first line that is not a heading, not contact details and not a date — which
   * is right on the overwhelming majority of CVs, because that is where people put their
   * name, and wrong on the ones that open with "Curriculum Vitae". Two to four words, no
   * digits, under 50 characters. The review screen shows it as an editable field like any
   * other, so being wrong costs a correction rather than a bad document.
   */
  let firstName = '';
  let lastName = '';
  let title = '';
  for (const line of lines.slice(0, 6)) {
    if (EMAIL.test(line) || PHONE.test(line) || URL.test(line)) continue;
    if (/curriculum vitae|résumé|resume|lebenslauf/i.test(line)) continue;
    const words = line.split(' ').filter(Boolean);
    if (
      !firstName &&
      words.length >= 2 &&
      words.length <= 4 &&
      !/\d/.test(line) &&
      line.length < 50
    ) {
      firstName = words[0]!;
      lastName = words.slice(1).join(' ');
      continue;
    }
    // The line after the name is conventionally the professional title.
    if (firstName && !title && line.length < 90 && !/\d{4}/.test(line)) {
      title = line;
      break;
    }
  }

  for (const [key, value] of [
    ['name', firstName],
    ['title', title],
    ['email', email],
    ['phone', phone],
    ['linkedin', linkedin],
    ['github', github],
    ['website', website],
  ] as const) {
    if (value) filled.push(key);
  }

  return {
    personal: {
      firstName,
      lastName,
      title,
      email,
      phone,
      location: '',
      website,
      linkedin,
      github,
      photoUrl: '',
      links: [],
    },
    filled,
  };
}

/**
 * A bullet, in any of the glyphs word processors emit — with or without a space after it.
 *
 * The space used to be required, and a real CV written `•Assurer la maintenance…` did not
 * have one. Nothing in that section was recognised as a bullet, so the description lines
 * above each date were read as job titles and four of five roles came back either empty or
 * named after their own first bullet point.
 *
 * A true bullet glyph needs no space, since it appears nowhere else. `-` and `*` still do:
 * without it they would match `-2020` in a date and `*` in `C*`, and turning a date into a
 * bullet is how entries stop being found at all.
 */
function isBullet(line: string): boolean {
  return /^[•·▪◦‣⁃]\s*\S/.test(line) || /^[-–—*]\s/.test(line);
}

/**
 * Could this line be the top line of an entry — a job title, an employer, a degree?
 *
 * Those are labels: short, and not sentences. Descriptions are the opposite, and the
 * distinction matters because the two sit next to each other in every CV, so a rule that
 * cannot tell them apart will read a sentence as a job title. It happened: a CV whose
 * education section held no dates and no qualifications produced a degree called "Delivered
 * a €2.4m ERP migration across four European sites", because the first two lines under the
 * heading were taken on position alone.
 *
 * Terminal punctuation is the strongest signal — no one writes "BSc Civil Engineering." —
 * and length is the backstop for prose that runs on without a full stop.
 */
function isEntryHeadingLine(line: string): boolean {
  if (isBullet(line) || line.length > 90) return false;
  return line.split(/\s+/).length <= 9;
}

function stripBullet(line: string): string {
  return line
    .replace(/^[•·▪◦‣⁃]\s*/, '')
    .replace(/^[-–—*]\s+/, '')
    .trim();
}

/**
 * Splits a section's lines into one group per entry.
 *
 * ## Why this is a two-pass scan and not a loop with a state machine
 *
 * The first version walked the lines forward and started a new entry whenever it met a date
 * range. That works for one of the two layouts CVs actually use:
 *
 *     Senior Project Manager — Calder Industrial   Mar 2021 – Present     ← dates on the title
 *
 *     Senior Project Manager                                              ← dates on their own
 *     Calder Industrial Group                                                line, which is
 *     Mar 2021 – Present                                                     what most real
 *     Bristol, UK                                                            CVs look like
 *
 * On the second, the forward scan put the role and employer in one entry, then opened a new
 * one at the date line with an empty title, and attached the location and description to
 * that. Every job came out split in half. It survived the hand-written fixtures and was
 * found only by running a real PDF through it.
 *
 * So the dates are located first, and each entry is assembled *around* its date line: the
 * heading lines immediately above it, and the prose below it up to the next entry's heading.
 * Both layouts collapse to the same shape, because in both the date is the anchor.
 */
function splitEntries(
  lines: string[],
): { head: string[]; body: string[]; range: ReturnType<typeof parseRange> }[] {
  const anchors: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (parseRange(lines[i]!)) anchors.push(i);
  }

  /*
   * No dates anywhere.
   *
   * Undated entries are real — plenty of people list a degree without a year — so this still
   * produces one entry rather than discarding the text. What it will not do is *invent* the
   * label: only leading lines that look like labels become the head, and if there are none,
   * the block yields nothing and the section is reported as partial. An empty education
   * section a user can fill in beats a confident wrong one they have to notice first.
   */
  if (anchors.length === 0) {
    if (lines.length === 0) return [];
    const head: string[] = [];
    while (head.length < 2 && isEntryHeadingLine(lines[head.length]!))
      head.push(lines[head.length]!);
    return head.length ? [{ head, body: lines.slice(head.length), range: null }] : [];
  }

  /*
   * Pass one: where does each entry's heading begin?
   *
   * Resolved for every anchor before any body is cut, because a body ends exactly where the
   * next entry's heading starts. Computing the two independently — as this did — let a body
   * run into the job below it, so the first entry's description contained the second
   * entry's title.
   */
  const heads: { at: number; lines: string[]; from: number }[] = [];
  for (let a = 0; a < anchors.length; a++) {
    const at = anchors[a]!;
    const previousAnchor = a === 0 ? -1 : anchors[a - 1]!;

    /*
     * The date line may carry the heading itself: `Baccalauréat …, Lycée … 2012 – 2013`.
     *
     * When it does, that is the whole heading and nothing above it is looked at. Scanning up
     * as well appended the line above — which is the *previous* entry's location — and since
     * it was unshifted first, it became the degree: one qualification from Oued Zem awarded
     * by "Baccalauréat Sciences Physiques". The two layouts are mutually exclusive, so
     * treating them as such removes the failure rather than ordering around it.
     */
    const onAnchor = lines[at]!.replace(RANGE, '')
      .replace(/[|,•·]\s*$/, '')
      .trim();
    if (onAnchor) {
      heads.push({ at, lines: [onAnchor], from: at });
      continue;
    }

    /*
     * Otherwise the heading is above the date — but not always *directly* above it.
     *
     * Plenty of CVs run `Job title / • bullet / • bullet / 11/2024 – present / City`, with
     * the description split around the date by whatever the PDF's column order was. Stopping
     * at the first bullet, as this did, left the head empty and produced entries with no
     * role and no employer at all. So bullets above are stepped over while the head is still
     * empty; once a heading line has been found, a bullet means the entry above has begun
     * and the scan stops.
     */
    const head: string[] = [];
    let from = at;
    for (let i = at - 1; i > previousAnchor && head.length < 2; i--) {
      const line = lines[i]!;
      if (isBullet(line)) {
        if (head.length > 0) break;
        continue;
      }
      if (!isEntryHeadingLine(line)) break;
      head.unshift(line);
      from = i;
    }
    heads.push({ at, lines: head, from });
  }

  // Pass two: bodies, each ending where the next entry's heading begins.
  const entries: { head: string[]; body: string[]; range: ReturnType<typeof parseRange> }[] = [];
  for (let a = 0; a < heads.length; a++) {
    const { at, lines: head } = heads[a]!;
    const bodyEnd = heads[a + 1]?.from ?? lines.length;
    entries.push({
      head,
      body: lines.slice(at + 1, Math.max(at + 1, bodyEnd)),
      range: parseRange(lines[at]!),
    });
  }

  /*
   * Anything above the first heading — a section intro, or an entry with no dates at all.
   * Bounded by that heading's own start rather than by its length, which was wrong whenever
   * the heading did not sit directly on the line above the date.
   */
  const preamble = lines.slice(0, Math.max(0, heads[0]?.from ?? 0));
  if (preamble.length > 0 && entries[0]) entries[0].body.unshift(...preamble);

  return entries;
}

/** `Senior Designer — Atlas Cloud` / `Atlas Cloud, London` → role and company, best effort. */
function splitRoleAndCompany(head: string[]): { role: string; company: string; location: string } {
  // Trailing commas and full stops survive PDF extraction and are not part of a name.
  const tidy = (value: string) => value.replace(/[,;]+$/, '').trim();
  const first = tidy(head[0] ?? '');
  const second = tidy(head[1] ?? '');

  /*
   * `Chef de projet transverse (CIRCET MOROCCO)` — the employer in brackets.
   *
   * Checked before the separators below because the brackets are unambiguous: nothing else
   * puts a parenthesised phrase at the end of a title line. Without this the whole string
   * became the role and the company came back empty.
   */
  const bracketed = first.match(/^(.+?)\s*\(([^()]{2,60})\)$/);
  if (bracketed && !second) {
    return { role: bracketed[1]!.trim(), company: bracketed[2]!.trim(), location: '' };
  }
  /*
   * Strong separators first, comma only as a fallback.
   *
   * `Marketing Manager, Demand Generation — Fieldwire Systems` has both, and splitting on
   * whichever appears first put "Demand Generation" in the company field. A dash, a pipe or
   * " at " separates the role from the employer; a comma much more often sits *inside* the
   * role. So the comma is only consulted when no stronger separator exists on the line.
   */
  const STRONG = /\s+[|–—]\s+|\s+-\s+|\s+at\s+|\s+chez\s+|\s+bei\s+|\s+bij\s+/i;
  if (STRONG.test(first)) {
    const parts = first.split(STRONG);
    return {
      role: parts[0]!.trim(),
      company: parts[1]?.trim() ?? '',
      location: parts[2]?.trim() ?? '',
    };
  }
  const commas = first.split(/,\s+/);
  if (commas.length >= 2 && !second) {
    return {
      role: commas[0]!.trim(),
      company: commas[1]!.trim(),
      location: commas[2]?.trim() ?? '',
    };
  }
  return { role: first.trim(), company: second.trim(), location: '' };
}

function parseExperience(lines: string[]): CVData['experience'] {
  return splitEntries(lines).map((entry) => {
    const { role, company, location } = splitRoleAndCompany(entry.head);
    const achievements = entry.body.filter(isBullet).map(stripBullet).filter(Boolean).slice(0, 20);
    const description = entry.body
      .filter((line) => !isBullet(line))
      .join(' ')
      .trim();
    return {
      id: uid(),
      role,
      company,
      location,
      startDate: entry.range?.start ?? '',
      endDate: entry.range?.end ?? '',
      current: entry.range?.current ?? false,
      description: description.slice(0, 3000),
      achievements,
      tags: [],
    };
  });
}

function parseEducation(lines: string[]): CVData['education'] {
  return splitEntries(lines).map((entry) => {
    const { role, company, location } = splitRoleAndCompany(entry.head);
    return {
      id: uid(),
      degree: role,
      field: '',
      institution: company,
      location,
      startDate: entry.range?.start ?? '',
      endDate: entry.range?.end ?? '',
      current: entry.range?.current ?? false,
      grade: '',
      description: entry.body.map(stripBullet).join(' ').trim().slice(0, 2000),
    };
  });
}

/** Skills arrive as bullets, or as one comma- or pipe-separated line. Both are common. */
function parseSkills(lines: string[]): CVData['skills'] {
  const names = new Set<string>();
  for (const line of lines) {
    const cleaned = stripBullet(line);
    const parts = isBullet(line) && !/[,|•·]/.test(cleaned) ? [cleaned] : cleaned.split(/[,|•·;]/);
    for (const part of parts) {
      const name = part.trim().replace(/\s*\(.*\)$/, '');
      // A "skill" longer than this is a sentence that landed in the skills block.
      if (name && name.length <= 60 && !/\d{4}/.test(name)) names.add(name);
    }
  }
  return [...names]
    .slice(0, 80)
    .map((name) => ({ id: uid(), name, level: 'advanced' as const, category: '' }));
}

/**
 * How well someone speaks a language, from however they chose to write it down.
 *
 * Ordered most-specific first: `langue maternelle` has to be tested before `professionnel`,
 * or "Langue Professionnel" and "Langue Maternelle" would both land on the same level.
 * Returns null when the phrase says nothing about proficiency, which is how a *name* is told
 * apart from a *level* below.
 */
function levelFor(text: string): LanguageLevel | null {
  const value = fold(text);
  if (
    /maternelle|native|mothertongue|mother tongue|muttersprache|moedertaal|bilingue|bilingual/.test(
      value,
    )
  )
    return 'native';
  if (/courant|fluent|full professional|verhandlungssicher|vloeiend|c[12]/.test(value))
    return 'full-professional';
  if (/professionnel|professional|beruflich|zakelijk|b[12]/.test(value))
    return 'professional-working';
  if (/intermediaire|intermediate|limited|mittelstufe|redelijk/.test(value))
    return 'limited-working';
  if (/notions|elementary|basic|debutant|grundkenntnisse|basis|a[12]/.test(value))
    return 'elementary';
  return null;
}

/**
 * Reads a languages section.
 *
 * ## Why the level can be on its own line
 *
 * A two-column languages block extracts as `Arabe / Langue Maternelle. / Français / Langue
 * Professionnel`, and reading each line as a language produced six entries for three
 * languages, half of them called "Langue Professionnel". So a line that says only how well
 * someone speaks is attached to the language above it rather than becoming one.
 */
function parseLanguages(lines: string[]): CVData['languages'] {
  const out: CVData['languages'] = [];
  for (const line of lines) {
    for (const part of stripBullet(line).split(/[,;|]/)) {
      const text = part.trim();
      if (!text) continue;

      const name = text.split(/[-–—:(]/)[0]?.trim() ?? '';
      const level = levelFor(text);

      // Nothing but a proficiency: it belongs to the language on the line before.
      if (level && out.length > 0 && isLevelOnly(text)) {
        out[out.length - 1]!.level = level;
        continue;
      }
      if (name && name.length <= 40 && !/\d/.test(name)) {
        out.push({ id: uid(), name, level: level ?? 'professional-working' });
      }
    }
  }
  return out.slice(0, 20);
}

/**
 * True when the line is a proficiency and nothing else.
 *
 * `Langue Maternelle.` is a level; `Français` is a name; `Anglais - courant` is both, and
 * must stay a name so the language is not lost. The test is whether removing the proficiency
 * vocabulary leaves anything that could be a language.
 */
function isLevelOnly(text: string): boolean {
  const remainder = fold(text)
    .replace(
      /maternelle|native|mother ?tongue|muttersprache|moedertaal|bilingue|bilingual|courant|fluent|full|professionnel|professional|working|beruflich|zakelijk|vloeiend|verhandlungssicher|intermediaire|intermediate|limited|mittelstufe|redelijk|notions|elementary|basic|debutant|grundkenntnisse|basis|langue|language|sprache|taal|niveau|level|[abc][12]/g,
      '',
    )
    .replace(/[^\p{L}]/gu, '')
    .trim();
  return remainder.length === 0;
}

/**
 * Reads a CV out of plain text.
 *
 * Returns what it managed and a report of what it did not. The caller must show both — see
 * the note at the top of this file for why that is a requirement rather than a suggestion.
 */
export function parseCvText(
  text: string,
  options: { likelyMultiColumn?: boolean; locale?: Locale } = {},
): ParsedCv {
  const blocks = splitIntoBlocks(text);
  const header = blocks.find((block) => block.id === 'header')?.lines ?? [];
  const { personal, filled } = parseHeader(header);

  const data: Partial<CVData> = { personal };
  const found: BuiltInSectionId[] = [];
  const partial: BuiltInSectionId[] = [];

  const linesFor = (id: BuiltInSectionId) =>
    blocks.filter((block) => block.id === id).flatMap((block) => block.lines);
  /*
   * Whether the heading appeared at all, which is not the same as whether it had content.
   *
   * A CV whose "Work Experience" heading is followed by nothing we could read must report
   * that section as `partial` — the review screen then says "we saw this section and got
   * nothing out of it", which is actionable. Keying off line count alone made that case
   * indistinguishable from a CV with no such section, and the user was told nothing.
   */
  const sawHeading = (id: BuiltInSectionId) => blocks.some((block) => block.id === id);

  const summaryLines = linesFor('summary');
  if (summaryLines.length) {
    data.summary = summaryLines.join(' ').trim().slice(0, 3000);
    (data.summary ? found : partial).push('summary');
  }

  const experience = parseExperience(linesFor('experience'));
  if (sawHeading('experience')) {
    data.experience = experience;
    (experience.length ? found : partial).push('experience');
  }

  const education = parseEducation(linesFor('education'));
  if (sawHeading('education')) {
    data.education = education;
    (education.length ? found : partial).push('education');
  }

  const skills = parseSkills(linesFor('skills'));
  if (sawHeading('skills')) {
    data.skills = skills;
    (skills.length ? found : partial).push('skills');
  }

  const languages = parseLanguages(linesFor('languages'));
  if (sawHeading('languages')) {
    data.languages = languages;
    (languages.length ? found : partial).push('languages');
  }

  if (options.locale) data.language = options.locale;

  return {
    data,
    report: {
      found,
      partial,
      contact: filled,
      likelyMultiColumn: options.likelyMultiColumn ?? false,
    },
  };
}
